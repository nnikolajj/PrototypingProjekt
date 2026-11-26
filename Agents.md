
# Arbeitsregeln für Agents

## Allgemeine Grundlagen
- Lies vor Änderungen die betroffenen Dateien und orientiere dich an vorhandenen Mustern und der bestehenden Projektstruktur.
- Halte Änderungen auf die Aufgabe beschränkt. Ändere keine sachfremden Dateien oder bereits vorhandene Änderungen anderer Personen.
- Bewahre bestehendes Verhalten, außer die Aufgabe verlangt ausdrücklich eine Änderung.
- Ergänze oder aktualisiere direkt betroffene Dokumentation.
- Führe passende Prüfungen aus und behebe durch deine Änderungen verursachte Fehler. Für dieses Projekt sind `npm run check` und `npm run build` verfügbar.
- Erfinde keine Anforderungen oder Issue-Nummern. Melde Einschränkungen und fehlgeschlagene Prüfungen klar.
- Lege keine Zugangsdaten, Tokens oder sonstige Geheimnisse in Dateien, Commits oder Logs ab.

## Planung vor der Umsetzung
- Erstelle vor jeder Änderung an Dateien, an der Datenbank oder an Einstellungen zuerst einen Plan und warte auf die ausdrückliche Zustimmung. Ohne Zustimmung wird nichts umgesetzt.
- Der Plan nennt kurz: Ziel und zugehöriges Issue, betroffene Dateien bzw. Tabellen, das Vorgehen in Schritten, offene Entscheidungen mit einer Empfehlung sowie wie das Ergebnis geprüft wird.
- Lesen, Suchen und Recherchieren sind vor der Zustimmung erlaubt, um einen fundierten Plan zu machen.
- Wird der Plan abgelehnt oder geändert, passe ihn an und lege ihn erneut vor. Zeigt sich während der Umsetzung, dass deutlich vom Plan abgewichen werden muss, halte an und hole erneut Zustimmung ein.
- Kleine, ausdrücklich so beauftragte Änderungen (z.B. „ändere diesen Text“) brauchen keinen eigenen Plan.

## Branch, Commit, Push und Pull Request
Ablauf: Issue → Branch → Plan → Umsetzung → Commit & Push → Pull Request → Review und Merge durch den Projektinhaber.

- Jede Aufgabe gehört zu einem GitHub-Issue. Prüfe vor Änderungen mit `git fetch` und `git branch -a`, ob es zum Issue schon einen Branch gibt, und arbeite dort. Bist du bereits auf dem passenden Branch, bleibe dort.
- Gibt es noch keinen Branch, erstelle ihn erst nach Zustimmung zum Plan, im Schema `<issue-nummer>-<kurze-beschreibung>` (zum Beispiel `15-agentsmd-anpassen`), so wie GitHub Branches aus Issues benennt. Kleinbuchstaben und Bindestriche. Ohne passendes Issue: nachfragen statt eine Nummer zu erfinden.
- Arbeite nie direkt auf `master` oder `main`.
- Prüfe vor dem Commit den aktuellen Branch und den Arbeitsbaum. Nimm nur die Änderungen dieser Aufgabe in den Commit auf; committe keine fremden oder nicht zugehörigen Änderungen (z.B. Dateien, die der Projektinhaber gerade selbst bearbeitet).
- Commit-Nachrichten im Stil `typ(bereich): kurze Beschreibung (#issue-nummer)`, zum Beispiel `feat(auth): Rollen für User, Friend und Admin (#6)`. Typen: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`.
- Wenn die Änderungen fertig und geprüft sind (`npm run check`, `npm run build`), committe selbst und pushe den Aufgaben-Branch. Pushe niemals `master` oder `main`, verwende kein Force-Push.
- Öffne danach einen Pull Request gegen `master` (mit `gh pr create`, falls die GitHub-CLI installiert und angemeldet ist; sonst den Link zum Erstellen des PRs nennen). Die PR-Beschreibung enthält: Zusammenfassung, wichtigste Änderungen, wie getestet wurde, `Closes #<issue-nummer>` und einen Hinweis, dass der Code mit KI-Unterstützung entstanden ist.
- **Mergen macht nur der Projektinhaber** nach seinem Review. Merge niemals selbst und aktiviere kein Auto-Merge.
- Falls Issue-Suche, Commit, Push oder PR nicht möglich ist, fahre nicht mit einer erfundenen Lösung fort: Berichte den konkreten Grund und den verbleibenden Zustand.

## Abschluss
- Fasse kurz zusammen, was geändert wurde, welche Prüfungen erfolgreich waren und auf welchem Branch der Commit liegt.
- Nenne Commit-, Push- und PR-Ergebnis ausdrücklich (mit Link zum PR); behaupte keinen erfolgreichen Push, wenn er nicht bestätigt wurde.
