# Update 0.14 – Population, Spaziergänger und Jagdzeiten

REVIER – Update 0.14: Population, Spaziergänger & Jagdzeiten

Dieses kleine Paket aktualisiert die vollständige Version 0.13.
ZIP zuerst entpacken. NICHT die ZIP-Datei selbst auf GitHub hochladen.
Vorhandene Spielgrafiken, Lernbilder, Lernkarten und Musik bleiben erhalten.

1. Im GitHub-Repository thronluemmel-cmyk/revier-spiel den Ordner assets öffnen.
   Add file > Upload files: diese fünf Dateien gemeinsam hochladen:
   - ecology.js: vorhandene Datei ersetzen
   - game.js: vorhandene Datei ersetzen
   - style.css: vorhandene Datei ersetzen
   - visitors.js: neue Datei hinzufügen
   - hunting.js: neue Datei hinzufügen
   Commit changes anklicken.

2. In das Hauptverzeichnis des Repositorys zurückgehen.
   index.html ersetzen und Commit changes anklicken.
   index.html liegt direkt neben dem Ordner assets, NICHT darin.
   Diese Datei bitte zuletzt hochladen, damit die neuen Skripte bereits da sind.

3. Nach abgeschlossenem GitHub-Pages-Deployment die Spielseite neu laden:
   https://thronluemmel-cmyk.github.io/revier-spiel/
   Oben steht jetzt: Population & Jagdzeiten · 0.14.
   Falls noch 0.13 angezeigt wird: warten und neu laden, am Computer ggf. Strg+F5.
   Keine Browserdaten löschen: Dort liegen deine lokalen Spielstände und Kartenänderungen.

BITTE-LESEN.txt ist nur diese Anleitung und muss nicht hochgeladen werden.
Keine alten Assets löschen. Es werden keine Lernbilder neu hochgeladen.
Pro Upload sind maximal fünf Dateien nötig; jeder Paketordner bleibt unter 80 Dateien.

NEU
- Links: Tierpopulation in Zehnerschritten von 10 bis 100 Prozent.
  10 Prozent ist das bisherige Lebensraumniveau. 100 Prozent erhöht die Ziele
  bis auf das Zehnfache. Zuwanderung und Nachwuchs bleiben schrittweise.
  Die Einstellung wird im lokalen Spielstand und im JSON-Export gespeichert.
- Spaziergänger ab zwei verbundenen Wegfeldern; bis zu zwölf Besucher je Revier.
  Besucher laufen nur entlang direkt benachbarter Waldwegfelder.
  Entfernte Wege werden sofort berücksichtigt. Ohne Wege keine Besucher.
- Das Gewehr lässt sich jederzeit wählen. Mit gewähltem Gewehr werden Schutzkreise sichtbar.
  Menschen bis einschließlich 10 Felder Entfernung zum Tier sperren den Schuss.
  Es erscheint ein Alarm. Das Tier bleibt stehen und wird NICHT gezählt.
- Außerhalb der Jagdzeit erscheint ein Hinweis mit der passenden Lernkarte.
  Das geschossene Tier verschwindet und erscheint in der Abschussliste.
  Deaktivierte Lernkarten bleiben deaktiviert; der Jagdzeit-Hinweis erscheint trotzdem.
- Alters-/Geschlechtsklasse werden im Hinweis genannt. Die vorhandenen Tierbilder
  zeigen weiterhin die Art und sind keine Darstellung jeder Alters-/Geschlechtsklasse.

JAGDZEITEN IM SPIEL
Schleswig-Holstein, Quellen geprüft am 16.10.2026. Das Spiel prüft jeweils den
1. Tag des angezeigten Monats. Endet eine Jagdzeit am 15., bleibt dieser Monat
im Monatsmodell offen; das genaue Datum steht im Hinweis. Kein Tageskalender.
Altersklassen beim Schalenwild wechseln vereinfacht im April.
Notwendige Elterntiere sind auch bei offenen Jagdzeiten geschützt. Elternbindung,
örtliche Ausnahmen und Einzelgenehmigungen werden nicht simuliert.
Graureiher: Die Ausnahme für bestimmte Teichwirtschaften ist im Hinweis erklärt,
aber im normalen Spielrevier nicht freigeschaltet. Geschützte Arten bzw.
ganzjährig geschonte Tiere lösen ganzjährig einen entsprechenden Lernhinweis aus.
Die 10-Felder-Regel ist eine Spielregel, kein realer Sicherheitsabstand.

Speicherung weiterhin lokal im Browser; kein Serverspeicher und kein Zahlencode.
Die bestehende Speicherkennung bleibt gleich. Alte Spielstände werden beim Laden
übernommen. Die Aktualisierung benötigt keine neue Landschaft.

Quellen für Jagdzeiten und Einschränkungen:
- Landesverordnung Schleswig-Holstein, § 2:
  https://www.gesetze-rechtsprechung.sh.juris.de/bssh/document/jlr-NNLSH00002D41NN00000000006
- LJV Schleswig-Holstein, Jagd- und Schonzeiten, Faltblatt Januar 2025:
  https://ljv-sh.de/wp-content/uploads/2025/02/LJV_Infoblatt-145x102_Jagd_u_Schonzeiten-Jan_2025_Ansicht.pdf
- Bundesjagdgesetz § 22, insbesondere Elterntierschutz:
  https://www.gesetze-im-internet.de/bjagdg/__22.html
- Sonderregelung für Graureiher, § 1:
  https://www.gesetze-rechtsprechung.sh.juris.de/jportal/perma?j=GraureiherJagdZV_SH_%21_1&portal=bssh

Validierung:
- 120 simulierte Monate bei 10 und 100 Prozent, leeres Revier, Habitatziele,
  monatliche Zuwanderungsgrenzen, gültige Populations- und Akkumulatorwerte.
- 10.000 Bewegungsschritte der Besucher, Wegenden, entfernte Wege und
  inklusive/exklusive Grenze des 10-Felder-Schutzkreises.
- Jagdzeitfälle: Jahreswechsel, Geschlecht, Altersklassen, Monatsmitten-Enddaten,
  ganzjährig geschonte/geschützte Arten und ganzjährig offene Kalenderzeiten.
- Chromium: Migration von 0.13, Schuss mit/ohne Bestandsmeldung,
  Saisonhinweis/Lernkarte, exakt entferntes Tier, persistierte Abschussliste,
  Sicherheitsblockade ohne Entnahme, bewegte Besucher auf Wegen.
- Populationsregler speichern/laden/importieren, Maus klicken/halten/ziehen,
  iPhone-Viewport und native Touch-Eingaben (Tippen/Wischen).
- Kein Test auf einem physischen iPhone/Safari. Desktop- und Mobiltests nutzen Chromium.

Technik: Neues Speicherformat 5, unveränderter lokaler Speicherschlüssel.
Neue Module assets/visitors.js und assets/hunting.js. Keine externen Laufzeitdienste.
Spaziergänger werden mit Canvas gezeichnet; es werden keine Bilddateien nachgeladen.
