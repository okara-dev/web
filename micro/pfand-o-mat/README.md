# Pfand-O-Mat

Ein einfacher Pfandzähler mit Sparziel-Funktion. Zähle deine Flaschen und sieh, wie viel Pfand du bereits gesammelt hast.

## Features

- Flaschen-Zähler mit Plus/Minus-Button
- Automatische Berechnung des Pfandwerts (0,25 Euro pro Flasche)
- Sparziel in Flaschen festlegen
- Fortschrittsbalken in Prozent
- Automatisches Speichern in localStorage
- Zähler zurücksetzen (mit Bestätigung)
- Alle Daten löschen (Hard Reset)
- Deutsche UI

## Nutzung

1. index.html im Browser öffnen
2. Flaschen über "+1" und "-1" zählen
3. Sparziel eingeben und auf "Ziel setzen" klicken
4. Fortschritt wird automatisch im Balken angezeigt
5. Bei Bedarf Zähler oder Ziel zurücksetzen

### Speicherung

Alle Daten werden automatisch im localStorage gespeichert. Beim erneuten Öffnen ist alles noch da.

## Tech

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- localStorage für Persistenz

## Datenschutz

Alles läuft lokal. Keine Server, keine Tracker, keine Daten verlassen deinen Browser.

## Lizenz

MIT