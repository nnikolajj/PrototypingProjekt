
# Arbeitsregeln für Agents

## Allgemeine Grundlagen
- Lies vor Änderungen die betroffenen Dateien und orientiere dich an vorhandenen Mustern und der bestehenden Projektstruktur.
- Halte Änderungen auf die Aufgabe beschränkt. Ändere keine sachfremden Dateien oder bereits vorhandene Änderungen anderer Personen.
- Bewahre bestehendes Verhalten, außer die Aufgabe verlangt ausdrücklich eine Änderung.
- Ergänze oder aktualisiere direkt betroffene Dokumentation.
- Führe passende Prüfungen aus und behebe durch deine Änderungen verursachte Fehler. Für dieses Projekt sind `npm run check` und `npm run build` verfügbar.
- Erfinde keine Anforderungen oder Issue-Nummern. Melde Einschränkungen und fehlgeschlagene Prüfungen klar.
- Lege keine Zugangsdaten, Tokens oder sonstige Geheimnisse in Dateien, Commits oder Logs ab.


## Branch, Commit und Push
- Prüfe vor dem Commit den aktuellen Branch und den Arbeitsbaum. Nimm nur die Änderungen dieser Aufgabe in den Commit auf; committe keine fremden oder nicht zugehörigen Änderungen.
- Wenn du auf `master` oder `main` startest, arbeite nicht direkt dort: Suche zuerst nach einem offenen GitHub-Issue, das die Aufgabe tatsächlich beschreibt, und erstelle einen eigenen Branch, bevor du Änderungen vornimmst.
- Wenn ein passendes Issue existiert, verwende den Branch-Namen `claude_<issue-nummer>_<kurze-beschreibung>` (zum Beispiel `claude_42_login-fehler`). Andernfalls verwende `claude_<kurze-beschreibung>` (zum Beispiel `claude_login-fehler`). Halte die Beschreibung kurz und verwende Kleinbuchstaben sowie Bindestriche.
- Bist du bereits auf einem anderen Branch, bleibe auf diesem Branch und überschreibe ihn nicht.
- Wenn die Änderungen fertig und geprüft sind, erstelle selbst einen aussagekräftigen Commit und pushe den Aufgaben-Branch zum Remote. Pushe niemals direkt `master` oder `main`, verwende kein Force-Push und committe nicht, wenn dadurch fremde Änderungen eingeschlossen würden.
- Falls Issue-Suche, Commit oder Push nicht möglich ist, fahre nicht mit einer erfundenen Lösung fort: Berichte den konkreten Grund und den verbleibenden Zustand.

## Abschluss
- Fasse kurz zusammen, was geändert wurde, welche Prüfungen erfolgreich waren und auf welchem Branch der Commit liegt.
- Nenne Commit- und Push-Ergebnis ausdrücklich; behaupte keinen erfolgreichen Push, wenn er nicht bestätigt wurde.
