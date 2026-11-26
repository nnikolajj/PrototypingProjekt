-- Bragirium – Datenbankschema für Supabase
-- Einmal im Supabase-Dashboard unter "SQL Editor" ausführen.

-- ─────────────────────────────────────────────────────────────
-- Profile: ein Eintrag pro registriertem User (auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
	name text not null check (char_length(name) between 1 and 60),
	avatar_url text,
	created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profile sind öffentlich lesbar"
	on public.profiles for select
	using (true);

create policy "User bearbeiten nur ihr eigenes Profil"
	on public.profiles for update
	to authenticated
	using ((select auth.uid()) = id)
	with check ((select auth.uid()) = id);

-- Beim Registrieren automatisch ein Profil anlegen (Daten aus signUp-Metadaten)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.profiles (id, username, name)
	values (
		new.id,
		lower(new.raw_user_meta_data ->> 'username'),
		coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'username')
	);
	return new;
end;
$$;

-- Nur der Trigger darf die Funktion ausführen, nicht die API (RPC).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Profilbilder: öffentlicher Storage-Bucket, jeder User nur in seinem Ordner
-- Pfad: avatars/<user-id>/<datei>
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Lesen ist über die öffentliche URL immer möglich; diese Policy braucht die Storage-API
-- zusätzlich zum Ersetzen/Löschen eigener Dateien.
create policy "User sehen eigene Profilbilder"
	on storage.objects for select
	to authenticated
	using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "User laden eigenes Profilbild hoch"
	on storage.objects for insert
	to authenticated
	with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "User ersetzen eigenes Profilbild"
	on storage.objects for update
	to authenticated
	using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "User löschen eigenes Profilbild"
	on storage.objects for delete
	to authenticated
	using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ─────────────────────────────────────────────────────────────
-- Rollen: user (Standard), friend (darf Filme schauen), admin (vergibt Rollen)
-- ─────────────────────────────────────────────────────────────
alter table public.profiles
	add column if not exists role text not null default 'user'
	check (role in ('user', 'friend', 'admin'));

-- User dürfen nur Name und Profilbild selbst ändern, nie ihre Rolle.
revoke update on public.profiles from anon, authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;

-- Ist der eingeloggte User Admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select exists (
		select 1 from public.profiles
		where id = (select auth.uid()) and role = 'admin'
	);
$$;

-- Nur intern (in set_user_role) verwendet, nicht über die API aufrufbar.
revoke execute on function public.is_admin() from public, anon, authenticated;

-- Admin setzt die Rolle eines Users über dessen Username.
create or replace function public.set_user_role(target_username text, new_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
	target_id uuid;
begin
	if not public.is_admin() then
		raise exception 'Nur Admins dürfen Rollen ändern' using errcode = '42501';
	end if;
	if new_role not in ('user', 'friend', 'admin') then
		raise exception 'Unbekannte Rolle: %', new_role using errcode = '22023';
	end if;

	select id into target_id from public.profiles where username = lower(trim(target_username));
	if target_id is null then
		raise exception 'Username "%" gibt es nicht', target_username using errcode = 'P0002';
	end if;
	if target_id = (select auth.uid()) then
		raise exception 'Die eigene Rolle kann man nicht ändern' using errcode = '42501';
	end if;

	update public.profiles set role = new_role where id = target_id;
	return new_role;
end;
$$;

revoke execute on function public.set_user_role(text, text) from public, anon;
grant execute on function public.set_user_role(text, text) to authenticated;

-- Den ersten Admin einmalig von Hand setzen (danach geht alles über /admin):
-- update public.profiles set role = 'admin' where username = '<dein-username>';
