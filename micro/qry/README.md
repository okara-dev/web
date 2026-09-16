# QRY

QR-Code-Generator für Text, WLAN-Zugangsdaten und Passwörter. Alles läuft direkt im Browser, ohne Server.

## Features

- Drei Modi: Text/URL, WLAN, Passwort
- WLAN-QR-Codes mit SSID, Passwort, Verschlüsselung (WPA/WEP/kein Passwort) und verstecktem Netzwerk
- Größe einstellbar (128 bis 1024 px)
- Fehlerkorrektur-Level wählbar (L, M, Q, H)
- Download als PNG
- Läuft komplett offline im Browser

## Nutzung

1. index.html im Browser öffnen
2. Tab wählen: Text, WLAN oder Passwort
3. Daten eingeben
4. Größe und Fehlerkorrektur einstellen
5. Auf "QR-Code erzeugen" klicken
6. Optional als PNG herunterladen

### WLAN-QR-Codes

Das Format ist standardisiert und wird von den meisten Smartphones (iOS, Android) direkt erkannt. Beim Scannen verbindet sich das Gerät automatisch mit dem Netzwerk.

## Tech

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- qrcode.js via CDN

## Datenschutz

Alles läuft lokal. Es werden keine Daten an Server gesendet. Die QR-Codes werden direkt im Browser generiert.

## Lizenz

MIT