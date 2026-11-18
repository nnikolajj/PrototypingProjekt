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
