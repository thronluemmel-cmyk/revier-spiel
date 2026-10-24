# GitHub-Upload in Schritten mit höchstens 80 Dateien

ZIP entpacken. Im Repository liegt **index.html direkt im Stammverzeichnis**. Die Ordnerstruktur muss erhalten bleiben. Den äußeren Ordner `revier` nicht zusätzlich hochladen, wenn die Spieladresse direkt auf das Repository zeigen soll.

| Ziel im Repository | Inhalt | Dateien pro Upload |
|---|---|---:|
| Stammverzeichnis | index.html, README.md, UPLOAD.md | 3 |
| assets | JavaScript- und CSS-Dateien, ohne Unterordner | 12 |
| assets/art | Spielgrafiken und Werbebanner | 7 |
| assets/learning-1 | erster Teil der Lernbilder | 80 |
| assets/learning-2 | zweiter Teil der Lernbilder | 80 |
| assets/learning-3 | letzter Teil der Lernbilder | 30 |
| docs | Anleitungen, Quellen und Nachweise | höchstens 80 |

In GitHub jeweils den passenden Zielordner öffnen, **Add file → Upload files** wählen, nur die Dateien dieses einen Ordners auswählen und mit **Commit changes** übernehmen. Alternativ den jeweiligen kleinen Unterordner vom passenden Elternordner aus hochladen. Nicht den gesamten assets-Ordner auf einmal auswählen: Seine Unterordner zusammen enthalten mehr als 80 Dateien.

Alle Schritte abschließen, bevor du die neue Version öffnest. Dateinamen und Ordnernamen nicht ändern. Die Bildpfade sind bereits auf learning-1, learning-2 und learning-3 angepasst. Alte Dateien im früheren Ordner assets/learning werden nicht mehr benötigt; sie werden von der neuen Version nicht geladen.

Für GitHub Pages die Dateien wie bisher auf dem veröffentlichten Branch bereitstellen. Dieses Paket ist vollständig statisch und benötigt keinen Serverdienst.
