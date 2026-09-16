# Vault

Ein lokaler, passwortgeschützter Tresor für API Keys. Alles läuft komplett im Browser – kein Server, kein Netzwerk, kein Tracking.

## Features

- Master-Passwort-Schutz (lokal gespeichert)
- API Keys hinzufügen, anzeigen/verbergen, kopieren, löschen
- Ein-Klick-Kopieren
- Speicherung in localStorage (Base64-verschleiert)
- Moderner Developer-Dark-Mode mit Terminal-Flair
- Kein Framework, kein Build-Tool – reines HTML/CSS/JS

## Nutzung

1. index.html im Browser öffnen (Doppelklick reicht).
2. Beim ersten Start Master-Passwort festlegen.
3. Keys hinzufügen – fertig.

### Passwort

Das Passwort kann nicht geändert werden. Wer sein Passwort ändern will, muss "Account neu erstellen" nutzen – dabei werden alle Keys gelöscht.

## Tech

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Web Clipboard API

## Datenschutz

Alles läuft lokal. Keine Server, keine Tracker, keine Daten verlassen deinen Browser.

Wichtige Hinweise:

- Kein echter Schutz: Das Passwort und die Keys liegen im localStorage und sind mit Browser-DevTools auslesbar. Base64 ist keine Verschlüsselung, nur Verschleierung.
- Nur lokal: Bei gelöschtem Browser-Speicher sind die Keys weg. Nutze für kritische Keys ein echtes Passwort-Management.

## Lizenz

MIT