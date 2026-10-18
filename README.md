# Fishay Predator Cup 1.6.1

Update einer bestehenden Installation: **UPDATE-1.6.1.md** lesen. Neu: optionale Anmeldung für 30 Tage auf diesem Gerät, einschließlich Speicherung in der Handy-Hülle.

Mobile Angelcup-App mit Google Sheets, Drive-Fotos und einer vom Veranstalter gepflegten Zugangsliste.

**Start: [START-HIER.md](START-HIER.md)**

Neu: installierbare Handy-Hülle mit FISHAY-Symbol, Installationsanleitung für iPhone/Android und teilbarem Installationslink. Anschließend **[APP-INSTALLIEREN.md](APP-INSTALLIEREN.md)** befolgen. Nur `pwa-public` wird in ein separates öffentliches Pages-Repository kopiert; dieses vollständige Projekt bleibt privat. Live-Installation und Google-Foto-Upload sind bis zur Einrichtung noch nicht verifiziert.

## Zugang

`ANGLER.txt` enthält pro Zeile `Name | Passwort`. Vier Namen mit fünfstelligen Beispielpasswörtern sind vorbereitet; vor echtem Betrieb längere eigene Passwörter einsetzen. Die Datei muss in einem privaten GitHub-Repository liegen. Der Apps-Script-Server liest sie über einen nur lesenden, separat gespeicherten GitHub-Token. Keine Selbstregistrierung, keine E-Mail-Adresse, kein Mailversand.

Ab 2027 wird ein Saisonteilnehmer erst beim ersten gespeicherten Fang mit Foto angelegt. Zugänge bleiben saisonübergreifend gültig, solange der Veranstalter sie nicht entfernt. 2026 bleiben die vier Angler und bisherigen Tabellenfänge erhalten; neue Fänge samt Foto können sofort über die App hinzukommen.

## Dateien

- `ANGLER.txt`: Zugangsliste. Nicht öffentlich machen.
- `src/Code.js`: Backend, GitHub-Lesen, Login, Sessions, Tabellen- und Fotozugriffe.
- `src/Model.js`: Punkte, Bestandsadapter, Eingabeprüfung und Zugangsliste-Parser.
- `src/Index.html`: Oberfläche mit Name/Passwort-Anmeldung.
- `tests/`: Tests ohne externe Zugriffe oder Paketinstallation.
- `Vorschau.html`: lokale, eingefrorene Vorschau, mit klar markiertem Demo-Login und ausschließlich den Beispielpasswörtern.

```sh
npm run check
npm test
```

## Grenzen und Sicherheit

Name und Passwort bleiben im privaten Repository sichtbar, einschließlich Git-Verlauf. Nur der Veranstalter und vertrauenswürdige Verwalter dürfen es lesen. Script-Editoren sind Administratoren; das Projekt deshalb eigenständig und privat betreiben. Die privaten Skripteigenschaften enthalten den GitHub-Token, nicht der Quellcode. Die App lehnt öffentliche Repositories ab und folgt beim authentifizierten GitHub-Abruf keinen Weiterleitungen.

Passwortprüfung und Zugriffskontrolle erfolgen serverseitig. Sitzungen laufen nach sieben Tagen ab. Der Server prüft bei jedem geschützten Aufruf die aktuelle Liste und die Passwortversion; entfernte oder geänderte Zugänge können vorhandene Sitzungen nicht weiterverwenden. Bis zu zehn Fehlversuche je bekanntem Namen/Stunde, maximal 200 Anmeldeversuche insgesamt/Stunde. Es gibt keine Passwort-Rücksetzung per E-Mail; der Veranstalter ersetzt das Passwort in der Datei. Der Browser speichert nur den Sitzungstoken pro Tab.

GitHub-Ausfälle oder abgelaufene Tokens sperren Schreibzugriffe; das Liveboard bleibt unabhängig lesbar. Teilnehmernamen sind dauerhafte Schlüssel (ohne Unterscheidung der Groß-/Kleinschreibung). Umbenennungen müssen separat migriert werden. Archivdaten werden durch die Zugangsliste nicht gelöscht.

Ein Script-Lock serialisiert Mutationen, Anfrage-IDs machen Fangmeldungen wiederholbar. Eine persistierte Fangzeile ist der Commit-Punkt. Erst danach entstehen Teilnehmer und persönliche Ansicht. Scheitert dieser Folgeschritt, kann dieselbe Anfrage die Zuordnung nachholen, ohne ein weiteres Foto anzulegen. Drive und Sheets bieten keine gemeinsame Transaktion; ein Fehler vor der Fangzeile kann eine unreferenzierte Bilddatei hinterlassen. Diese nicht automatisch löschen, wenn der Schreibstatus unklar ist. Abgeleitete Ansichten können nachsynchronisiert werden.

Die 2026-Daten werden live aus `Turnier!A1:H42` gelesen; Namen/Fischarten und Positionen werden geprüft. Die vorhandene Tabelle enthält nur aktuelle Fangplätze, keine vollständige historische Meldeliste oder Fotos.

## Technische Dokumentation

- [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [HTML-Service und Serverfunktionen](https://developers.google.com/apps-script/guides/html/communication)
- [GitHub Repository Contents API](https://docs.github.com/en/rest/repos/contents)

GitHub speichert den Code; Apps Script führt diese App aus. GitHub Pages allein führt dieses Backend nicht aus. Für clasp kann lokal eine ignorierte `.clasp.json` mit dem eigenen `scriptId` und `rootDir: "src"` eingerichtet werden.
