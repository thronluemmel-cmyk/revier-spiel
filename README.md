# REVIER – Deine Wildnis · Waldklang 0.9

## Neu in 0.9

Eigene ruhige Musik im klassischen Stil und synthetische Waldgeräusche. Beide Spuren sind standardmäßig eingeschaltet und einzeln abschaltbar. Musik-, Wald- und Gesamtlautstärke können getrennt eingestellt werden. Der Ton startet nach der ersten Bedienung oder über **Ton starten**; Einstellungen bleiben auf dem Gerät gespeichert. Details: [docs/WALDKLANG.md](docs/WALDKLANG.md).

## Neu in 0.8

136 ausgearbeitete Artenkarten mit Suche und sieben Kategorien. Unter **Spielmodus → Lernkarten-Einstellungen** lassen sich Karten einzeln oder zusammen aktivieren/deaktivieren sowie Namen, Lerntexte und Quellen bearbeiten. Eigene Texte bleiben nach dem Neuladen erhalten. Export/Import sichert die Lernkarteneinstellungen separat vom Landschaftsspielstand.

Die genaue Bedienung und der Umfang stehen in [docs/LERNKARTEN.md](docs/LERNKARTEN.md). Alle Dateien des Ordners gemeinsam verwenden; die Bilder aus 0.7 sind enthalten.

Statisches 2D-Browserspiel für GitHub Pages. Kein Backend, keine Installation von Node oder PHP nötig.

## Online stellen mit GitHub Pages

1. Kostenlos bei https://github.com anmelden.
2. Rechts oben **+ → New repository** wählen, Namen `revier-spiel` vergeben, **Public** auswählen und **Create repository** klicken.
3. Auf der Repository-Seite **Add file → Upload files** klicken.
4. **Den INHALT dieses entpackten Ordners** hochladen: `index.html`, `assets/` und optional `README.md`. Wichtig: `index.html` muss im Stammverzeichnis des Repositorys liegen, nicht in einem Unterordner.
5. Mit **Commit changes** bestätigen.
6. **Settings → Pages → Build and deployment → Source: Deploy from a branch** einstellen, **Branch: main**, Ordner **/(root)** wählen und **Save** klicken.
7. Nach der Bereitstellung wird die Spieladresse unter **Settings → Pages** angezeigt, normalerweise `https://BENUTZERNAME.github.io/revier-spiel/`.
8. Diese URL in Shopify als externen Menülink hinterlegen (je nach Shopify-Oberfläche unter **Inhalt → Menüs** oder **Onlineshop → Navigation**).

## Lokal testen

`index.html` im Browser öffnen. Falls der Browser lokale Dateien einschränkt, in diesem Ordner `python3 -m http.server 8000` ausführen und `http://localhost:8000` öffnen.

## Spielen

- 300 × 300 Felder, Zoom und Verschieben.
- Landschaft malen, Monate/Jahre fortschalten, Tiere beobachten.
- Jagdschein-Lernmodus abschaltbar (Kindermodus).
- Spielstände werden im Browser gespeichert; Export/Import als JSON möglich.

## Hinweise

- Spielstände sind pro Browser und Domain gespeichert. Ein Umzug von WordPress zu GitHub Pages übernimmt sie nicht automatisch: auf der alten Seite exportieren und auf der neuen importieren.
- Das Wildtiermodell und die Lerninhalte sind ein Prototyp und ersetzen keine offiziellen Jagdschein-Lernunterlagen.
- GitHub Pages ist für öffentlich erreichbare statische Dateien; keine Geheimnisse oder Zugangsdaten hochladen.


## Grafik-Update 0.6
Die Karte verwendet nun zusätzliche deterministische 2D-Naturdetails (Gras, Blüten, Bodenstrukturen, Wasserreflexe, Wege, Schneeakzente). Keine externen Bilddateien erforderlich. Die 300×300-Welt bleibt bearbeitbar und auf GitHub Pages hostbar. Die Grafik ist stilisiert und kein fotorealistisches 3D-Spiel.


## Grafikedition 0.7
- 16 KI-erzeugte Bildmotive in zwei transparenten Grafikdateien: 12 Naturmotive und 4 Wildtiere.
- Eiche, Birke, Fichte, Herbstlaub und Winterbäume; Hecken, Totholz mit Pilzen, Blumen, Schilf, Felsen und Getreide.
- Rehbock, Feldhase, Rotfuchs und Wildschwein als bewegte Bildfiguren (noch keine einzelnen Laufphasen).
- Tiefensortierung der Objekte, zwischengespeicherter Boden, neue Werkzeugbilder und mobile Kartenansicht vor den Werkzeugen.
- Vorhandenes Speicherformat und 300×300-Welt bleiben erhalten. Die Grafikdateien müssen im Ordner assets/art mit hochgeladen werden.
- Fuchs und Wildschwein dienen wie zuvor als illustrative Beobachtungen; eigene Populationsmodelle gibt es weiterhin nur für Reh und Hase.
- Technische Prüfung: JavaScript-Syntax, Canvas-Rendering mit geladenen Bildern, Monatswechsel, Zoom, Malen, Speichern/Laden, Kindermodus. Kein vollständiger Browser-/iPhone-Test in dieser Umgebung möglich.

## Bildherstellung
Erstellt mit der integrierten Bildgenerierung. Dateien: assets/art/woodland.png und assets/art/wildlife.png.
Prompt Natur: Transparentes 4×3-Spriteatlas, naturalistisch handgemalte 2D-Spielgrafik in leicht erhöhter Dreiviertelansicht; grüne Eiche, Fichte, Herbsteiche, Wintereiche, Hecke, moosiger Baumstamm mit Pilzen, Wiesenblumen, Schilf, Felsen, Birke, Schneefichte, Getreide; isolierte vollständige Motive ohne Text.
Prompt Wildtiere: Transparentes 2×2-Spriteatlas; Rehbock mit kurzem Gehörn, Feldhase, Rotfuchs und Wildschwein; vollständige Körper, Blick nach rechts, leicht erhöhte Dreiviertelansicht, naturalistische Fellzeichnung, gleiche Beleuchtung, ohne Text und Landschaft.
