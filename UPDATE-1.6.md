# Version 1.6 – Angemeldet bleiben

Beim Anmelden gibt es die neue Option „Auf diesem Gerät angemeldet bleiben (30 Tage)“. Mit Häkchen wird ein Anmeldeschlüssel dauerhaft auf diesem Gerät gespeichert. Ohne Häkchen bleibt es bei der Browsersitzung (serverseitig maximal sieben Tage). Das Passwort wird nicht gespeichert. Nach spätestens 30 Tagen erneut anmelden. Abmelden entfernt die gespeicherte Anmeldung. Änderungen an Passwort/Zugang werden weiterhin bei geschützten Serverzugriffen geprüft.

## 1. Google-Web-App aktualisieren

1. ZIP entpacken und den Ordner `src` öffnen.
2. In Google Apps Script `Code.gs` vollständig durch den Inhalt von `src/Code.js` ersetzen.
3. Dort `Index.html` vollständig durch den Inhalt von `src/Index.html` ersetzen.
4. Speichern. `Model.gs`, appsscript.json, Skripteigenschaften und Tabellen bleiben unverändert. Kein erneuter setup_-Aufruf.
5. Bereitstellen → Bereitstellungen verwalten → bestehende Bereitstellung bearbeiten → Neue Version → Bereitstellen. Dieselbe Bereitstellung verwenden, damit der /exec-Link gleich bleibt.
6. Die zwei entsprechenden Dateien auch im Ordner src deines privaten GitHub-Repositorys aktualisieren. Eigene ANGLER.txt beibehalten.

## 2. Installierte Handy-Version aktualisieren

Im ÖFFENTLICHEN Repository `fishay-app` genau diese vier Dateien aus `pwa-public` hochladen und mit Commit changes speichern:

- `index.html` ersetzen
- `app.js` ersetzen
- `sw.js` ersetzen
- `auth-host.js` neu hinzufügen

`config.js` mit deinem bereits eingetragenen Google-Link unbedingt behalten. Auch die vorhandenen Icons und das Manifest bleiben gleich. Keine ANGLER.txt oder sonstige private Projektdateien öffentlich hochladen.

Die Handy-Seite speichert den Schlüssel zusätzlich in ihrem eigenen Speicher, damit die Anmeldung nicht vom Speicher des eingebetteten Google-Fensters abhängt. Nachrichten werden auf den freigegebenen Ursprung und eine zufällige Kennung pro App-Start geprüft. Tokens erscheinen nicht in URLs, GitHub-Dateien oder Protokollen.

## 3. Anwenden und testen

1. Warten, bis GitHub Pages die Änderungen veröffentlicht hat.
2. Die App einmal öffnen und aktualisieren, danach vollständig schließen (auch noch offene Tabs derselben Installationsseite), damit der neue Service Worker aktiv werden kann. App wieder öffnen.
3. Falls schon angemeldet: einmal abmelden.
4. Name und Passwort eingeben und „Angemeldet bleiben“ ankreuzen.
5. Anmelden, App schließen und über das FISHAY-Symbol wieder öffnen. Nach der Serverprüfung sollte der Name wieder erscheinen.
6. Dies auf PC und Handy jeweils einmal durchführen. Die Geräte behalten eigene Anmeldungen, verwenden aber dieselben Fangdaten.

Privatmodus, gelöschte Browserdaten oder gesperrter Gerätespeicher können eine erneute Anmeldung notwendig machen. Bei vorübergehenden Verbindungsfehlern wird ein gespeicherter Schlüssel nicht vorschnell gelöscht. Zum Wiederholen der Prüfung den Aktualisieren-Knopf in der Cup-Oberfläche verwenden.

Bei einem neuen Google-/exec-Link muss config.js angepasst werden; die Handy-Speicherung ist an die jeweilige Google-Bereitstellung gebunden. Dann einmal neu anmelden.

35 lokale Tests bestanden, darunter Wiederöffnung mit leerem Sitzungsspeicher, Abmelden, Ablauf, blockierter Speicher, 30-Tage-Gültigkeit und Herkunftsprüfung der Handy-Speichernachrichten. Google-Dienste/Browser werden in den Tests simuliert. Ein echter Test auf deinem iPhone/Android-Gerät steht nach der Veröffentlichung noch aus.
