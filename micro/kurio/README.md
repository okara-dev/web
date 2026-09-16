# Kurio

Live-Währungskurse, Umrechner und Kursverlauf – schlicht, schnell, ohne Schnickschnack.

## Features

- Über 50 Währungen aus vielen Ländern (mit Flaggen-Emoji)
- Umrechner – Betrag, Von, Nach, Tauschen-Button
- Live-Diagramm mit 7 / 30 / 90 Tage-Auswahl (Chart.js)
- Beliebte Paare zum Schnellklick
- Speichert gewählte Währungen in localStorage
- Auto-Refresh alle 5 Minuten
- Deutsche UI

## Nutzung

1. index.html über einen lokalen Server oder HTTPS öffnen (Internet nötig für Live-Kurse).
2. Oben siehst du das aktuelle Kurs-Paar.
3. Betrag eingeben – sofortige Umrechnung.
4. Zeitraum im Diagramm wählen (7 / 30 / 90 Tage).
5. Auf ein "Beliebtes Paar" klicken zum Schnellwechseln.

### Wichtig zum Öffnen

Die Seite muss über einen Server oder HTTPS aufgerufen werden. Bei direktem Öffnen per Doppelklick (file://) blockiert der Browser die API-Anfragen aus Sicherheitsgründen (CORS).

Optionen:

- Lokaler Server: python -m http.server 8000 oder VS Code Live Server
- GitHub Pages / Vercel / Netlify (kostenloses Hosting)

## APIs

- Primär: Frankfurter (api.frankfurter.dev) – EZB-Daten, kostenlos, kein Key
- Fallback: open.er-api.com – über 160 Währungen, kein Key

## Tech

- HTML5
- CSS3 (Custom Properties, Grid, Animationen)
- Vanilla JavaScript (ES6+, fetch, async/await)
- Chart.js via CDN

## Datenschutz

Alles läuft im Browser. Keine Server, keine Tracker. Es werden nur Live-Kurse von den öffentlichen APIs abgerufen.

## Lizenz

MIT