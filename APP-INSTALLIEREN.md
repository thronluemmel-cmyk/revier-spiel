# FISHAY 1.6.1 – Installation auf iPhone und Android

Dieses vollständige Paket ersetzt Version 1.3. Die PWA ist eine installierbare Hülle um dieselbe Google-Web-App. Es gibt keinen zweiten Datenbestand: Fänge gehen direkt an Google Apps Script und Google Sheets, Fotos an Google Drive. GitHub stellt die Hülle bereit und liefert dem Google-Server die private Zugangsliste. Passwörter oder Fotos werden nicht in das öffentliche Repository geschrieben.

## 1. Privates Projekt und Google einrichten

Den ganzen Projektinhalt wie bisher in dein PRIVATES Repository `fishy-predator-cup` hochladen. `START-HIER.md` für Google vollständig abarbeiten. Die aktualisierte `src/Code.js` verwenden, nicht die alte Version 1.3. Google als Web-App bereitstellen: Ausführen als „Ich“, Zugriff „Jeder“, damit die Einbettung keine zusätzliche Google-Anmeldung verlangt. Den öffentlichen Link mit `/exec` am Ende kopieren. Noch keine PWA installieren.

## 2. Öffentliche Installationsseite vorbereiten

Auf GitHub ein ZWEITES Repository namens `fishay-app` anlegen und als Public einstellen. Das bisherige Repository muss privat bleiben.

Nur den INHALT des Ordners `pwa-public` in das neue Repository hochladen: `index.html`, `app.js`, `config.js`, `style.css`, `manifest.webmanifest`, `sw.js`, `.nojekyll` und den Ordner `icons`. Weder `ANGLER.txt` noch die übrigen Projektdateien oder die ZIP hochladen.

In `config.js` den kopierten Google-Link einsetzen:

```js
window.FISHAY_CONFIG = { webAppUrl: "https://script.google.com/macros/s/DEINE-BEREITSTELLUNGS-ID/exec" };
```

Keinen GitHub-Token und kein Passwort hier eintragen. Änderungen mit Commit changes speichern.

## 3. GitHub Pages einschalten

Im öffentlichen Repository: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Ordner: /(root) → Save. Warten, bis GitHub die fertige HTTPS-Seitenadresse anzeigt. Der von GitHub angezeigte Link ist maßgeblich. Bei den bisherigen Namen wäre es `https://thronluemmel-cmyk.github.io/fishay-app/`.

## 4. Google erlaubt deine Installationsseite

In Google Apps Script → Projekteinstellungen → Skripteigenschaften eine weitere Eigenschaft ergänzen:

| Name | Wert bei deinem bisherigen GitHub-Konto |
| --- | --- |
| PWA_ORIGIN | https://thronluemmel-cmyk.github.io |

Nur den Ursprung eintragen, OHNE `/fishay-app/` und OHNE abschließenden Schrägstrich. Bei anderem Kontonamen den tatsächlichen Ursprung der Pages-Adresse verwenden. Diese Version unterstützt github.io-Adressen, keine eigene Domain.

Speichern. Wenn Code bereits früher bereitgestellt war: Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Neue Version → Bereitstellen. Möglichst bestehende Bereitstellung aktualisieren, damit der Link gleich bleibt. Die Standard-Web-App bleibt auch direkt nutzbar; nur die eingebettete Variante prüft den freigegebenen Pages-Ursprung.

## 5. Installieren und teilen

Den Pages-Link öffnen. „Cup öffnen“ lädt die echte Web-App. „Installationslink teilen“ teilt dieselbe Adresse mit deinen Anglern.

- iPhone: Link in Safari öffnen → Teilen → Zum Home-Bildschirm → gegebenenfalls „Als Web-App öffnen“ aktivieren → Hinzufügen. Der Installationsknopf erklärt diese Schritte; iOS erlaubt hier keinen erzwungenen Download-Dialog.
- Android: Link in Chrome öffnen → App installieren. Falls der Browser noch keinen Dialog anbietet, sein Menü verwenden. Der Button zeigt sonst die Anleitung.

Das FISHAY-Symbol startet die App im eigenständigen Fenster. Die Installation ist kein App-Store- oder Play-Store-Paket. Eine Internetverbindung ist für Google, Anmeldung, Fänge und Fotos nötig. Die Offline-Seite speichert keine Fangmeldungen zwischen. Erst die Erfolgsbestätigung der Google-Web-App bedeutet, dass ein Fang gespeichert wurde.

## 6. Funktion prüfen

1. Pages-Link öffnen, Cup laden, mit Chris und Beispielpasswort anmelden.
2. Dieselbe Rangliste mit dem direkten Google-Link vergleichen.
3. Auf iPhone und Android installieren, schließen und über das Symbol erneut öffnen. Anmeldung, Menütaste und Rückkehr zum Cup prüfen.
4. Fotoauswahl und Upload für die aktuelle Saison 2026 prüfen. Neue Fänge werden mit den bestehenden Tabellenfängen zusammen gewertet. Einen reinen Testfang anschließend in App_Faenge auf Status inaktiv setzen.
5. Internet trennen: Der Offline-Hinweis muss erscheinen; keine Speicherung ohne Bestätigung erwarten.

Bleibt die Anzeige leer: Menü → Google-Web-App direkt öffnen. Google-Bereitstellung, PWA_ORIGIN und config.js überprüfen. Browser-/Cookie-Einschränkungen können die eingebettete Google-Seite behindern; der direkte Link ist dann der Ausweichweg. Nach Aktualisierungen die App vollständig schließen und wieder öffnen.

## Prüfstand dieser Lieferung

Lokale Tests prüfen den bisherigen Server, die Einbettungsfreigabe, Manifest/Icons und den Installationscode. Die echte Google-Bereitstellung sowie Installation, Sitzungserhalt und Foto-Uploads auf physischen iPhone-/Android-Geräten sind noch nicht getestet, weil die Google-Einrichtung aussteht. Der vollständige Live-Test ist erst danach möglich.

Technische Grundlagen: https://developers.google.com/apps-script/reference/html/x-frame-options-mode und https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
