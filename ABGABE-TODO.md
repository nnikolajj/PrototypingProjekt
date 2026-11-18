# Bragirium – Was noch fehlt bis zur Abgabe

Grundlage: *PT Projekt – Anforderungen und Bewertung* (ZHAW). Fristen und Abgabeweg stehen verbindlich auf **Moodle**.
Abhaken mit `[x]`.

> ⚠️ **Mindestanforderungen** – fehlt eine davon, kann das Projekt ungenügend sein, egal wie viele Punkte:
> Mindestumfang gemäss Übungen erfüllt & dokumentiert · App online erreichbar · GitHub-Repo mit Code + Doku für Dozierende zugänglich · Evaluation durchgeführt & ausgewertet · Urheberrecht eingehalten · KI-Einsatz transparent dokumentiert

---

## 1. Login fertigstellen (Issue #1, Branch `issue1-createLogin`)

- [x] Supabase-Datenbank: Tabelle `profiles`, Trigger, Bucket `avatars`, Zugriffsregeln
- [x] `.env`: Supabase-URL, Publishable Key, Turnstile Site Key
- [x] Supabase: „Confirm email“ aus, Turnstile-Secret unter Attack Protection
- [ ] **Selbst testen** auf `http://localhost:5173/login`:
  - [ ] Registrieren (mit Profilbild) → landet auf `/profil`
  - [ ] Abmelden → Anmelden mit Username + Passwort
  - [ ] Falsches Passwort → Fehlermeldung
  - [ ] Profil bearbeiten (Name ändern, neues Bild)
  - [ ] Film → „Anschauen“ ohne Login → Login → zurück zum Player
- [ ] Commit(s) mit sprechender Nachricht, z.B. `feat(auth): Login und Registrierung mit Supabase und Turnstile (#1)`
- [ ] Pull Request `issue1-createLogin` → `master`, Issue #1 damit schliessen (`Closes #1` in der PR-Beschreibung)

## 2. Mindestumfang gemäss Übungen (ab Semesterwoche 8)

- [ ] Übungen ab SW 8 auf Moodle durchgehen: Ist jede geforderte Kernfunktion / jedes Artefakt vorhanden?
- [ ] **„Daten können erfasst und bearbeitet werden“** – aktuell: Profil (Name, Bild). Prüfen, ob das reicht, sonst z.B. Filmbewertungen / Watchlist als eigenes Issue
- [ ] Altlasten aufräumen: `src/routes/movies/*` und `src/lib/db.js` (alte Scraping-Seite, hat einen Typfehler und ist urheberrechtlich heikel) → löschen
- [ ] `README.md` ist noch die SvelteKit-Vorlage → kurz beschreiben (Was ist Bragirium, Setup mit `.env`, Link zur Online-Version)

## 3. Deployment (Pflicht: online erreichbar)

- [ ] Plattform gemäss Übungen wählen (z.B. Vercel / Netlify)
- [ ] Umgebungsvariablen dort eintragen: `TMDB_API_KEY`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`
- [ ] Online-Domain im **Cloudflare-Turnstile-Widget** als erlaubte Domain eintragen
- [ ] Online-Domain in **Supabase → Authentication → URL Configuration** (Site URL) eintragen
- [ ] Online alles einmal durchklicken (Login, Film, Anschauen, Profil)

## 4. Methodik & Artefakte (Vorgehen, 15 P.)

- [ ] **Understand/Define:** Zielgruppe, Bedürfnisse, Ausgangslage, Ziele
- [ ] **Sketch:** mehrere Lösungsvarianten skizziert + Unterschiede beschrieben (deine Handskizze ist eine davon)
- [ ] **Decide:** gewählte Variante + Auswahlkriterien, Workflows, **Referenz-Mockup** (z.B. Figma)
- [ ] **Prototype:** umgesetzt (siehe 1–3)
- [ ] **Validate:** siehe 5.

## 5. Evaluation (Pflicht, 10 P.)

- [ ] Testplan gemäss Übungen (Aufgaben, Testpersonen, Kennzahlen wie Erfolgsquote / Zeit / Fehler)
- [ ] Tests mit Nutzenden durchführen, Beobachtungen festhalten (Notizen, Screenshots)
- [ ] Auswertung + abgeleitete Verbesserungen (idealerweise einige umsetzen → zeigt Iteration)

## 6. Rechtliches (Pflicht)

- [x] TMDB-Hinweis im Footer
- [x] Kein illegales Streaming – nur Trailer (YouTube-nocookie) und legale Anbieter (JustWatch-Daten via TMDB)
- [ ] In der Doku kurz begründen, welche fremden Inhalte genutzt werden (TMDB-Bilder/Daten, YouTube-Trailer) und warum das erlaubt ist

## 7. Projektdokumentation (.md, Moodle-Vorlage verwenden!)

- [ ] Vorlage von Moodle holen und ins Repo legen
- [ ] Alle Phasen (Kapitel gemäss Vorlage) mit Artefakten
- [ ] **Screenshots der fertigen App mit Beschreibungen**
- [ ] **KI-Einsatz vollständig dokumentieren:** welche Tools (Claude Code, Supabase-/Browser-MCP …), wofür, was übernommen / geändert / selbst geprüft
- [ ] **Kapitel 4 – Erweiterungen**, jede exakt nach vorgegebenem Schema (Feldbezeichnungen + Reihenfolge!), mit erläutertem Screenshot und Codestellen. Kandidaten:
  - [ ] Login/Registrierung mit Supabase + Bot-Schutz (Cloudflare Turnstile)
  - [ ] Profilbilder-Upload (Supabase Storage)
  - [ ] Interaktive Film-Map (eigene Force-Layout-Visualisierung)
  - [ ] Legale Streaming-Anbieter + Trailer-Player
  - [ ] KI-Agenten-Workflow in VS Code (MCP-Anbindung Supabase, Browser-Tests)
  - [ ] Issue-Management + Branch pro Issue + sprechende Commits

## 8. Projektorganisation (5 P.)

- [ ] Für jedes weitere Feature: Issue → Branch → Commits → PR
- [ ] Sprechende Commit-Nachrichten (keine „changes“-Commits mehr)
- [ ] Artefakte sauber ablegen, z.B. Ordner `docs/` (Skizzen, Mockups, Evaluation)

## 9. Video (Datei)

- [ ] Ca. 5 Min. (max. 10), **selbst gesprochen** (keine KI-Stimme), Hochdeutsch / Schweizerdeutsch / Englisch
- [ ] Zeigt **alle Workflows** (Startseite, Suche, Genres, Top 100, Neuste, Film-Infos, Map, Registrieren/Login, Anschauen, Profil bearbeiten, Abmelden)
- [ ] Nur Funktionalität – **kein** Code, **kein** Vorgehen

## 10. Abgabe (auf Moodle)

- [ ] Alles auf `master` gemergt und gepusht
- [ ] Repo öffentlich **oder** privat mit Zugang für **alle** Dozierenden
- [ ] Prüfen, dass keine Geheimnisse im Repo sind (`.env` wird ignoriert ✔)
- [ ] GitHub-**URL** + **Zip** des Repos hochladen
- [ ] Video hochladen
