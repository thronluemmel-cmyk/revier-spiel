# Waldklang 0.9

Unter **Musik & Waldklang** stehen zwei getrennte Tonspuren zur Verfügung:

- **Klassische Musik:** eine eigene ruhige instrumentale Miniatur im klassischen Stil mit klavierartigen Tönen und weicher Begleitung.
- **Waldgeräusche:** leises Rauschen, drei unterschiedliche Vogelrufmotive sowie seltene Fuchs-, Reh- und Wildschweinlaut-Nachbildungen.

Alle Klänge sind synthetisch erzeugt. Es sind keine Original-Tieraufnahmen und keine verlässlichen Beispiele zum Lernen von Tierstimmen. Die Vogelmotive orientieren sich klanglich an flötenden Amselphrasen, bewegten Rotkehlchenrufen und gepaarten Meisenrufen. Das Spiel benötigt dafür keine Audio-Downloads und keine Internetverbindung.

## Schalter und Lautstärke

Beim ersten Start sind beide Spuren eingeschaltet. Die Standardwerte sind 65 % Gesamtlautstärke, 45 % Musiklautstärke und 55 % Waldlautstärke. Jede Spur besitzt einen eigenen Schalter und Lautstärkeregler. Der Gesamtregler verändert beide Spuren; 0 % bedeutet stumm.

Änderungen werden im lokalen Browser gespeichert und beim nächsten Besuch wiederhergestellt. Der Ton bleibt unabhängig vom Jagdschein-Lernmodus. Audio-Einstellungen sind nicht Teil der Landschafts- oder Lernkarten-Exportdateien.

## Start und Unterbrechung

Browser können Ton ohne vorherige Bedienung blockieren. Daher beginnt die Wiedergabe nach dem ersten Antippen einer Spielfunktion oder über **Ton starten**. Das ist insbesondere für Safari auf dem iPhone relevant. Auch das Aktivieren einer Tonspur kann die Wiedergabe starten. Wenn beide Spuren ausgeschaltet sind, bleibt das Spiel still.

Beim Wechsel in den Hintergrund wird die Wiedergabe pausiert. Bei der Rückkehr setzt sie fort, soweit der Browser das erlaubt. Nach einer Betriebssystemunterbrechung gegebenenfalls **Ton starten** antippen. Die Gerätelautstärke wird nicht verändert.

Vogelphrasen erklingen ungefähr alle 7–15 Sekunden, größere Tierlaute nach dem ersten Auftreten ungefähr alle 40–70 Sekunden. Unterschiedliche Tonhöhen, Lautstärken und leichte Stereopositionen lockern die Wiederholungen auf.

## Umsetzung und Prüfung

Die komplette Komposition und Klangsynthese befinden sich in `assets/audio.js`. Es werden keine fremden Musikaufnahmen oder Tier-Samples mitgeliefert. Die 24-taktige Melodie läuft mit kleinen Variationen weiter. Lautstärkeänderungen werden weich überblendet; ein Dynamikkompressor begrenzt Spitzen.

In Chromium geprüft: Start erst nach Bedienung, beide Standard-Schalter, getrenntes Ausschalten, Wiedereinschalten, Regler, dauerhafte Einstellungen, Gesamt-Stummschaltung und Hintergrundpause. Alle Musikabschnitte und sechs Tier-/Vogelmotive wurden offline gerendert und auf ungültige Samples und Übersteuerung geprüft; ausgeschaltete Spuren erzeugen keinen Ausgangston. Die 390-Pixel-Ansicht wurde visuell geprüft. Kein Test auf einem physischen iPhone/Safari.

Technische Referenz: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
