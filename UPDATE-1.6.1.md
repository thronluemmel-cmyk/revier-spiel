# Update von deiner installierten Version 1.5 auf 1.6.1

Dies ist das neu zusammengestellte 1.6-Update mit „Angemeldet bleiben“ (30 Tage), dem kompakten Angelmotiv und Chris' aktualisiertem Passwort in der privaten ANGLER.txt. Version 1.6 muss nicht vorher installiert werden.

## A. Google-Web-App

1. ZIP entpacken, Projektordner und darin `src` öffnen.
2. In Google Apps Script den Inhalt von `Code.gs` vollständig durch den Inhalt von `src/Code.js` ersetzen.
3. Dort den Inhalt von `Index.html` vollständig durch den Inhalt von `src/Index.html` ersetzen.
4. Speichern. `Model.gs`, `appsscript.json` und alle Skripteigenschaften bleiben wie in deiner laufenden Version 1.5. Kein setup_-Aufruf nötig.
5. Bereitstellen → Bereitstellungen verwalten → Stift bei deiner vorhandenen Web-App → Neue Version → Bereitstellen. Die bisherige Bereitstellung aktualisieren, damit der Link gleich bleibt.

Das neue Motiv steckt bereits in Index.html. Es braucht keine zusätzliche Bilddatei bei Google. Es ist auf dem Handy 190 px, auf dem Desktop 212 px hoch; Kennzahlen und Rangliste folgen direkt darunter.

## B. Privates GitHub-Repository Fishay-predator-cup

- `src/Code.js` und `src/Index.html` durch die neuen Dateien ersetzen.
- Chris' Passwort ist im beiliegenden ANGLER.txt bereits auf den von dir genannten Wert geändert. Wenn es auf GitHub bereits richtig steht, musst du ANGLER.txt dort NICHT ersetzen. Weitere inzwischen hinzugefügte Angler oder geänderte Passwörter in der GitHub-Datei unbedingt behalten.
- Zugangsdaten gehören ausschließlich in das private Repository. Sie sind nicht im neuen Motiv oder den öffentlichen Handy-Dateien eingebaut.

## C. Öffentliches GitHub-Repository fishay-app

Aus dem Ordner `pwa-public` genau diese Dateien auf die Hauptseite des öffentlichen Repositorys hochladen:

| Datei | Aktion |
| --- | --- |
| index.html | Ersetzen |
| app.js | Ersetzen |
| sw.js | Ersetzen |
| style.css | Ersetzen |
| auth-host.js | Neu hinzufügen |
| fishay-hero.jpg | Neu hinzufügen |

`config.js` mit deinem eingetragenen /exec-Link behalten. Icons und Manifest bleiben ebenfalls bestehen. Das gesamte Paket einschließlich ANGLER.txt niemals öffentlich hochladen. Danach Commit changes und die Veröffentlichung durch GitHub Pages abwarten.

## D. Auf dem Handy anwenden

1. App öffnen und aktualisieren, dann vollständig schließen; auch offene Tabs der Installationsseite schließen.
2. App über das FISHAY-Symbol neu öffnen.
3. Einmal abmelden, falls bereits angemeldet.
4. Mit dem aktuellen Passwort anmelden und „Auf diesem Gerät angemeldet bleiben (30 Tage)“ anhaken.
5. App schließen und erneut öffnen. Nach der Prüfung beim Server sollte der Name wieder erscheinen.

Ein Anmeldeschlüssel wird gespeichert, nicht das Passwort. Abmelden entfernt ihn. Nach spätestens 30 Tagen, bei gelöschten Browserdaten oder einer Passwortänderung ist eine erneute Anmeldung nötig. PC und Handy behalten eigene Anmeldungen, verwenden aber dieselben Fänge, Fotos und Wertungen.

Die lokale Vorschau nutzt ausdrücklich separate Demo-Zugänge (Chris / 48271), keine echte Anmeldung. Dein aktuelles Passwort steht nur in ANGLER.txt und wird von der bereitgestellten Google-Web-App geprüft.

## Prüfstand

Die Anmeldung, Speicherung, Abmeldung, 2026-Wertung und Herkunftsprüfung der Handy-Speichernachrichten sind lokal automatisiert geprüft. Google und Browserfunktionen sind dabei simuliert. Das erneute Öffnen auf deinem echten iPhone/Android-Gerät muss nach der Veröffentlichung geprüft werden. Ein Browser-Layouttest war in dieser Arbeitsumgebung nicht verfügbar.

Das neue Bild ist mit dem integrierten Bildgenerator erstellt und für die App als kompaktes JPEG eingebunden. Es ist ein illustratives Werbemotiv, kein tatsächliches Fangfoto. Original-Prompt und Assetpfad stehen in DESIGN-NOTIZ.md.
