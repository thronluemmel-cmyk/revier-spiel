# Lernkartenedition 0.8 – Bedienung

## Umfang

Alle 136 Einträge aus der gemeinsam festgelegten Artenliste sind enthalten:

| Bereich | Karten |
|---|---:|
| Bäume | 23 |
| Sträucher und Pflanzen | 14 |
| Schalenwild | 8 |
| Weitere Säugetiere | 23 |
| Hühnervögel, Tauben und Schnepfen | 13 |
| Wasser- und Feuchtgebietsvögel | 31 |
| Greifvögel, Eulen und Rabenvögel | 24 |

Jede Karte enthält Namen, wissenschaftliche Bezeichnung, Erkennungsmerkmale, Lebensraum, Nahrung bzw. ökologische Bedeutung und Merkmale zum Einprägen/Unterscheiden. Dies sind kompakte Artenkarten für die Jagdscheinvorbereitung, kein vollständiger Prüfungslehrgang. Unterarten, Artengruppen und unterschiedliche wissenschaftliche Benennungen werden bei den betreffenden Karten erläutert. Jagdzeiten und Abschussentscheidungen sind nicht Bestandteil dieser Karten.

## Einstellungen öffnen

Unter „Spielmodus“ auf **Lernkarten-Einstellungen** klicken. Dieser Bereich ist auch bei ausgeschaltetem Haupt-Lernmodus erreichbar.

- **Lernkarten anzeigen:** schaltet die Lernbibliothek ein oder aus.
- **Quizfragen anzeigen:** steuert die vorhandenen freiwilligen Quizfragen unabhängig von den Karten.
- **Jagdschein-Lernmodus** auf der Hauptseite: schaltet Karten und Quiz gemeinsam aus, ohne Texte oder Einzeleinstellungen zu löschen.
- **Diese Karte aktivieren:** gilt für die ausgewählte Karte; anschließend **Änderungen speichern** drücken.
- **Alle aktivieren/deaktivieren:** betrifft alle 136 Karten; eigene Texte bleiben erhalten.

## Einen Text korrigieren

1. Im Einstellungsfenster nach dem Namen suchen oder eine Kategorie auswählen.
2. Auf die gewünschte Karte klicken. Der aktuell gespeicherte Text steht vollständig im Editor.
3. Name, wissenschaftlichen Namen, Lerntext oder Quellenadresse bearbeiten.
4. **Änderungen speichern** drücken. Eigene Fassungen sind in der Lernbibliothek markiert.
5. Bei Bedarf **Original wiederherstellen** wählen. Dies stellt die mitgelieferte Karte wieder her und aktiviert sie.

Text wird als reiner Text angezeigt. Zeilenumbrüche bleiben erhalten; HTML wird nicht ausgeführt. Beim Verlassen einer ungespeicherten Bearbeitung erscheint eine Rückfrage. Nach Änderung einer Karte werden die zugehörigen bisherigen Quizfragen nicht mehr angeboten, damit deren feste Antworten einer Korrektur nicht widersprechen. Quizfragen selbst sind in dieser Version nicht editierbar; es bleiben die 11 bisherigen Fragen, keine 136 neu erzeugten Quizfragen.

## Sicherung und Gerätewechsel

Eigene Texte und Lernkarteneinstellungen werden im Browser auf diesem Gerät gespeichert. **Sicherung exportieren** lädt eine JSON-Datei herunter. Auf einem anderen Gerät **Sicherung importieren** verwenden. Der Import ersetzt die vorhandenen Lernkarteneinstellungen nach Rückfrage; ungültige Dateien werden abgewiesen.

Lernkartensicherungen sind separat von den bisherigen Landschafts-Spielständen. Die Landschaftsbuttons „Speichern“ und „Spielstand exportieren“ sichern weiterhin die Landschaft. Der Haupt-Lernmodusschalter wird ebenfalls separat auf dem Gerät gespeichert; die Lernkartensicherung enthält die beiden Bibliotheksschalter, individuellen Aktivierungen und eigenen Texte.

Ein Löschen der Browserdaten kann lokale Änderungen entfernen. Vorher die Lernkartensicherung herunterladen. Verschiedene Browser und unterschiedliche Hosting-Adressen haben jeweils eigene lokale Einstellungen. Andere Besucher einer hochgeladenen Spielversion sehen ihre eigenen lokalen Einstellungen, nicht automatisch die Änderungen auf deinem Gerät.

## Dateien

- `assets/cards-data.js`: mitgelieferte 136 Standardkarten.
- `assets/learning.js`: Suche, Anzeige, Einstellungen, Editor und Sicherung.
- `docs/cards-source.tsv`: lesbare Redaktionsfassung der Standardtexte; das Spiel lädt `cards-data.js`.
- `docs/QUELLEN.md`: Fachportale und ergänzende überprüfte Referenzen.

Bestehende Landschaftsspielstände bleiben mit dem bisherigen Format kompatibel. Die Grafikdateien aus 0.7 bleiben enthalten.

## Prüfung dieser Version

Im Chromium-Browser geprüft: Laden aller 136 Karten, Suche und Kategorien, Textkorrektur mit Neuladen, Einzel- und Gesamtschalter, Originalwiederherstellung, Export/Import, Ablehnung ungültiger Importdateien, Schutz ungespeicherter Änderungen, leere Kartenliste, Quizfilterung und bestehende Landschaftsspeicherung. Desktopansicht und 390 Pixel breite Ansicht visuell geprüft. Kein Test auf einem physischen iPhone/Safari.
