# XI

Positions-spezifische Performance-Bewertung für Fußballspieler. Basierend auf bis zu 60 Statistiken pro Position, mit Kategorien-Gewichtung und 80/20-Logik pro Stat.

## Features

- 9 Positionen: Flügelspieler, Mittelstürmer, Offensiver Mittelfeld, Box-to-Box, Defensiver Mittelfeld, Außenverteidiger, Innenverteidiger, Torwart, Falsche 9
- Positions-spezifische Kategorien mit individueller Gewichtung (z.B. Offensive, Spielgestaltung, Defensive)
- 80/20-Gewichtung pro Stat innerhalb einer Kategorie
- Spieldauer und eigene Spielzeit eingeben (Effizienz-Faktor)
- Scorer-Bonus für Tore und Assists
- Notenberechnung von 2.0 bis 10.0
- Detaillierte Ergebnis-Übersicht mit Top-5-Stats und allen Einzelwerten
- Deutsche UI

## Nutzung

1. index.html im Browser öffnen
2. Spieldauer und eigene Spielzeit eintragen
3. Position wählen
4. Stats ausfüllen (alle Werte die zutreffen)
5. Auf "Performance bewerten" klicken
6. Ergebnis-Overlay zeigt Note, Kategorien-Übersicht und Detail-Stats

### Bewertungslogik

- Basis-Note ist 6.0
- Jede Stat wird über einen Referenzwert (positionsspezifisch) normalisiert
- 80er-Stats zählen 4x stärker als 20er-Stats innerhalb einer Kategorie
- Kategorien werden mit positionsabhängigen Prozentwerten gewichtet
- Scorer-Bonus bis +4.5 für Tore und Assists
- Zeit-Faktor: Wer in weniger Minuten ähnliche Werte erzielt, wird höher bewertet

## Tech

- HTML5
- CSS3 (Custom Properties, Grid, Animationen)
- Vanilla JavaScript (ES6+)

## Datenschutz

Alles läuft lokal. Keine Server, keine Tracker, keine Daten verlassen deinen Browser.

## Lizenz

MIT