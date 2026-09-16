# ToDo

Eine minimalistische, kreative ToDo-Liste mit Hauptfokus-Feature. Markiere ein ToDo mit einem Stern und es erscheint groß oben – damit du genau weißt, was jetzt dran ist.

## Features

- ToDos hinzufügen, abhaken, löschen
- Einen ToDo als Hauptfokus markieren – erscheint oben mit Glow
- Automatische Speicherung in localStorage
- "Erledigte löschen"-Button
- Neon/Glassmorphism-Style mit animierten Hintergrund-Orbs
- Responsive
- Deutsche UI
- Kein Framework, kein Build-Tool

## Nutzung

1. index.html im Browser öffnen.
2. ToDo eintippen und Enter oder Plus drücken.
3. Auf den Stern klicken, um ein ToDo zum Hauptfokus zu machen.
4. Auf die Checkbox oder den Text klicken zum Abhaken.

### Fokus-Logik

- Nur ein ToDo kann gleichzeitig Fokus sein.
- Wird der Fokus-ToDo erledigt oder gelöscht, verschwindet der Fokus automatisch.
- Klick auf den Stern bei aktivem Fokus entfernt den Fokus wieder.

## Tech

- HTML5
- CSS3 (Custom Properties, Animationen, Glassmorphism)
- Vanilla JavaScript (ES6+)
- crypto.randomUUID() für eindeutige IDs

## Datenschutz

Alles läuft lokal. Keine Server, keine Tracker, keine Daten verlassen deinen Browser.

## Lizenz

MIT