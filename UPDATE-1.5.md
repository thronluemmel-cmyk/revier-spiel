# Bestehende Web-App auf 1.5 aktualisieren

Ab sofort sind Fangmeldungen mit Foto auch in der laufenden Saison 2026 freigeschaltet. Die bisherigen vier Angler und die im Blatt Turnier vorhandenen Fanglängen bleiben Teil der Wertung. Neue App-Fänge werden damit zusammengeführt, ohne zweite Ranglistenplätze für dieselbe Person. Die bisherigen Höchstzahlen pro Fischart gelten weiterhin für die gemeinsame Wertung. Fotos gibt es bei den bisherigen Tabellenfängen nur dann, wenn sie bereits separat vorliegen; dieses Update erfindet oder ergänzt keine alten Fotos.

## Diese drei Dateien bei Google ersetzen

1. ZIP entpacken und im Projektordner `src` öffnen.
2. In Google Apps Script den vollständigen Inhalt von `Code.gs` durch `src/Code.js` ersetzen.
3. Den vollständigen Inhalt von `Model.gs` durch `src/Model.js` ersetzen.
4. Den vollständigen Inhalt von `Index.html` durch `src/Index.html` ersetzen.
5. Speichern. Die Skripteigenschaften und `appsscript.json` bleiben wie eingerichtet. `setup_` muss NICHT erneut ausgeführt werden. Einen früheren Hilfsaufruf `EinrichtungStarten` nicht wieder anhängen.
6. Bereitstellen → Bereitstellungen verwalten → vorhandene Web-App auswählen → Stift/Bearbeiten → Version: Neue Version → Bereitstellen.
7. Den bestehenden `/exec`-Link neu laden. Es muss nun „＋ Fang melden“ erscheinen. Die URL bleibt bei Aktualisierung derselben Bereitstellung erhalten.

Auch die drei entsprechenden Dateien im privaten GitHub-Repository aktualisieren, damit dort derselbe Code liegt. Eigene Änderungen in ANGLER.txt und eine eventuell bereits konfigurierte pwa-public/config.js behalten. Die Handy-Dateien müssen für dieses Update nicht ersetzt werden: sie öffnen dieselbe Google-Bereitstellung.

## Daten und Prüfung

- Alte Fänge bleiben im Blatt `Turnier` und werden weiterhin gelesen. Dieses Blatt und seine bisherige Struktur behalten. Für 2026 stammen die Wertungsregeln weiterhin aus diesem Blatt.
- Neue Fänge stehen in `App_Faenge`, die Fotos in Drive und im persönlichen Angler-Reiter. Persönliche Reiter zeigen die neuen App-Meldungen.
- Das gemeinsame Tabellen-Liveboard heißt `App_Liveboard_2026` und wird beim ersten neuen App-Fang erstellt. Das alte `Live-Ranking` erhält keine neuen App-Fänge; verwendet künftig die Web-App oder `App_Liveboard_2026` für die Gesamtwertung.
- Neue App-Fänge NICHT zusätzlich in `Turnier` eintragen, sonst zählen sie zweimal. Bestehende Fänge nicht erneut melden, nur um ein Foto nachzutragen.
- Nach dem Update zuerst den bisherigen Punktestand prüfen, dann einen echten neuen Fang mit Foto melden. Die Erfolgsbestätigung abwarten und Rangliste sowie App_Faenge kontrollieren.
- Ein versehentlicher Testfang lässt sich in `App_Faenge` durch Status `inaktiv` aus der Wertung nehmen. Nach manuellen Änderungen die App aktualisieren; die persönliche Fotoansicht lässt sich über die bestehende Reparaturfunktion syncPhotos_ synchronisieren.
- In 2027 beginnt die Wertung weiter ohne Vorjahresfänge. Zugänge bleiben bestehen, Teilnehmer erscheinen mit ihrem ersten Fang der neuen Saison.

30 lokale Tests bestanden, darunter kombinierte 2026-Wertung, Fotoabruf, doppelte Anfrage, Top-3-Auswahl und Jahreswechsel. Google-Dienste sind in den Tests simuliert; den echten Upload in deinem Konto nach der Aktualisierung prüfen.
