# Fishay Predator Cup 1.6.1 – deine Zugangsliste

NEU: Die installierbare Handy-Version ist enthalten. Nach der Google-Einrichtung mit **APP-INSTALLIEREN.md** weitermachen. Das gesamte Paket bleibt privat; ausschließlich der Inhalt von `pwa-public` darf in das separate öffentliche Pages-Repository.

Die Selbstregistrierung und der E-Mail-Versand sind entfernt. Du verwaltest alle Zugänge selbst in der Datei **ANGLER.txt** im privaten GitHub-Repository **fishy-predator-cup**.

## Namen und Passwörter pflegen

In `ANGLER.txt` sind bereits diese Zeilen vorbereitet:

```text
Chris | DEIN_AKTUELLES_PASSWORT
Daniel | 63924
Hendrik | 81536
Roman | 29748
```

Hinter das `|` kommt jeweils das Passwort, das du dem Angler gibst. Chris’ aktuelles Passwort steht in ANGLER.txt; die anderen Zahlen sind Beispielpasswörter zum Ausprobieren. Vor echtem Betrieb längere eigene Passwörter vergeben. Ein leeres Passwort deaktiviert den Zugang. Erlaubt sind 5–128 Zeichen, kein `|`, keine Leerzeichen am Anfang oder Ende. Jeder Name darf nur einmal vorkommen; Groß-/Kleinschreibung ist beim Namen egal, beim Passwort wichtig.

- **Neuer Angler:** eine neue Zeile `Name | Passwort` hinzufügen und auf GitHub speichern („Commit changes“).
- **Zugang entfernen:** die Zeile löschen oder das Passwort leeren.
- **Passwort ändern:** den Text hinter `|` ersetzen.
- **Nächstes Jahr:** Namen dürfen stehen bleiben. Ein weiter vorhandener Zugang funktioniert auch im neuen Jahr, aber die Saisonwertung bleibt bis zum ersten Fang leer.
- Bestehende Namen nicht umbenennen: Sie dienen der dauerhaften Zuordnung. Ein anderer Name gilt als neuer Zugang.
- Das Entfernen eines Zugangs löscht keine historischen Fangdaten oder Ranglisten.

Die App liest die Datei bei jeder Anmeldung und jedem geschützten Zugriff direkt aus GitHub. Du musst nach einer Listenänderung keine neue App-Version bereitstellen. Ist GitHub nicht erreichbar, werden Anmeldung und Upload vorübergehend gesperrt, statt veraltete Berechtigungen zu verwenden.

**Das Repository muss privat sein.** Jeder mit Leserechten am Repository kann die Passwörter und deren Git-Verlauf sehen. Nur du bzw. vertrauenswürdige Verwalter erhalten Repositoryzugriff. Die App gibt Passwörter nie an den Browser oder die Turniertabelle weiter.

## Verhalten der Saisons

**2026:** Die bestehenden vier Angler werden weiterhin aus dem Blatt `Turnier` übernommen. Neue Fänge mit Foto sind jetzt auch 2026 über die App möglich. Sie werden in `App_Faenge` gespeichert und mit den bisherigen Tabellenfängen zusammen gewertet. Neue App-Fänge nicht zusätzlich in `Turnier` eintragen. Die vier historischen Teilnehmer bleiben sichtbar, unabhängig von der aktuellen Zugangsliste.

**Ab 2027:** Die Saison beginnt ohne Teilnehmer und ohne Fänge. Die bloße Anmeldung legt niemanden in der Turnierliste an. Erst beim ersten gültigen Fang mit Foto wird der Angler für dieses Jahr in `App_Teilnehmer`, in seinem persönlichen Tabellenreiter und in der Rangliste ergänzt. Auch fünf, sechs oder mehr Angler sind möglich. Weitere Fänge werden demselben Angler zugeordnet.

## GitHub vorbereiten

1. Privates Repository `fishy-predator-cup` unter deinem Konto `thronluemmel-cmyk` erstellen.
2. Den Inhalt dieses Projektordners hochladen, sodass `ANGLER.txt`, `README.md` und `src` direkt im Repository liegen.
3. Die vorbereiteten Beispielpasswörter zum Testen nutzen und vor echtem Betrieb in `ANGLER.txt` ersetzen.
4. Für die Serveranbindung einen **fine-grained Personal Access Token** erstellen: nur dieses Repository auswählen, Repositoryberechtigung **Contents: Read-only**. Metadata-Lesezugriff kommt bei GitHub hinzu. Token nicht ins Repository schreiben und nicht an Angler weitergeben.

## Google Apps Script einrichten

1. [Google Apps Script](https://script.google.com/home) öffnen und ein **eigenständiges neues Projekt** anlegen. Nicht an die geteilte Tabelle binden, damit Tabellenmitbearbeiter nicht automatisch Script-Editoren werden.
2. `src/Code.js` in `Code.gs`, `src/Model.js` in eine Skriptdatei `Model.gs` kopieren.
3. Eine HTML-Datei `Index` anlegen und `src/Index.html` hineinkopieren.
4. In den Projekteinstellungen die Manifestdatei einblenden und `src/appsscript.json` übernehmen.
5. Unter **Projekteinstellungen → Skripteigenschaften** setzen:

| Eigenschaft | Wert |
| --- | --- |
| `GITHUB_REPOSITORY` | `thronluemmel-cmyk/fishy-predator-cup` |
| `GITHUB_BRANCH` | `main` (ggf. tatsächlichen Standardbranch verwenden) |
| `GITHUB_TOKEN` | Dein nur lesender GitHub-Token |

6. Die Funktion `setup_` einmal im Editor ausführen und Googles Berechtigungen bestätigen. Es wird keine E-Mail-Berechtigung mehr benötigt.
7. **Bereitstellen → Neue Bereitstellung → Web-App**, ausführen als **Ich**. Zugriff passend zum Teilnehmerkreis wählen. Bei „Jeder“ sind Liveboard und angezeigte Fotos für jeden mit dem Link sichtbar; für Fangmeldungen gilt immer Name/Passwort.
8. Den zurückgegebenen `/exec`-Link öffnen und später an eure Angler geben. Bei Codeänderungen die Bereitstellung auf eine neue Version aktualisieren.

Die bekannte Tabelle ist bereits im Code eingetragen:
[Fishay Predator Cup KI unterstützt](https://docs.google.com/spreadsheets/d/193S7gwLq-GnZFmR0VhwowAwRdjP0v05bZ8vFz-AcTjc/edit)

Bei einem abgelaufenen GitHub-Token nur `GITHUB_TOKEN` erneuern. Teilnehmerpasswörter bleiben unverändert.

## Was beim Einrichten angelegt wird

- `App_Teilnehmer`: Saison, Teilnehmer-ID, Name, Zugangsname, Zeitpunkt des ersten Fangs, persönlicher Reiter. Keine E-Mails und keine Passwörter.
- `App_Faenge`: Fangmeldungen mit Bildlink und Status.
- `App_Regeln`: Regeln pro Saison; zunächst die bestehenden Regeln für 2027.
- Separater privater Sitzungsspeicher und privater Drive-Fotoordner. Den Sitzungsspeicher und das Script-Projekt nicht mit Anglern teilen.
- Aktualisierungstrigger für neue Saison-Liveboards.

`setup_` verändert die alten Blätter `Turnier` und `Live-Ranking` nicht. Es kann erneut ausgeführt werden. Diese Version setzt voraus, dass v1.0 noch nicht produktiv eingerichtet wurde; bei vorhandenen v1.0-App-Tabellen muss vor einem Wechsel deren Teilnehmerstruktur migriert werden.

## Tabellenpflege

`App_Faenge` ist ab sofort die Liste für neue Fangmeldungen, auch 2026. Korrigiere Länge, Art oder Datum dort. Ein Status ungleich `aktiv` entfernt den Fang aus der App-Wertung. IDs und Zuordnungen nicht ändern. Die neuen `App_Liveboard_JAHR`-Reiter werden automatisch berechnet.

Persönliche Tabellenreiter sind Ansichten mit eingebetteten Fotos. Nach manuellen Korrekturen oder einem Bildfehler `syncPhotos_` im Script-Editor ausführen. `refreshBoards_` baut Saison-Liveboards neu auf. Neue Saisons übernehmen die letzten vorhandenen Regeln; abweichende Regeln vorher mit der passenden Jahreszahl in `App_Regeln` anlegen.

Bei einer Löschung die Fangzeile deaktivieren, persönliche Ansicht synchronisieren und die zugehörige Bilddatei in Drive löschen. Entfernen aus `ANGLER.txt` sperrt nur den Zugang und bewahrt die Historie.

## Vorschau und Prüfung

`Vorschau.html` zeigt ausschließlich den gespeicherten Stand vom 17.10.2026; sie ist keine Live-Verbindung. Dort funktioniert ein ausdrücklich markierter Demo-Login mit den vier Beispielpasswörtern. Er schreibt nichts nach Google Sheets und verwendet keine echte Serveranmeldung.

35 automatisierte Tests prüfen Wertung, Rekorde, Zugangsliste, Passwortänderung/Löschung, sechs Angler, Jahreswechsel, erster Fang, Dubletten und Fehlerbehandlung. Google-Dienste werden dabei simuliert. Die reale Verbindung zu deinem zukünftigen privaten GitHub-Repository und der produktive Foto-Upload können erst nach der Einrichtung getestet werden.

Uploads für die aktuelle Saison 2026 können direkt getestet werden. Ein Testfang zählt sofort: nach dem Test die entsprechende Zeile in App_Faenge auf Status inaktiv setzen und gegebenenfalls die Fotodatei löschen.

## Logo und Schreibweise

Die sichtbare Marke heißt **FISHAY**, wie auf dem bereitgestellten Logo. Der technische Repositoryname `fishy-predator-cup` bleibt unverändert. Das Logo ist in Kopfbereich und Anmeldedialog bereits eingebunden; die Oberfläche zeigt den quadratischen Logo-Ausschnitt des gelieferten Screenshots. Keine separate Bildfreigabe in Google erforderlich.
