# Days

Days is a lightweight, German-language calendar for keeping track of appointments and tasks. It runs in the browser and stores entries locally, without an account or a backend.

## Features

- View a monthly calendar and move between months.
- Select a day to see its entries.
- Add entries with a title, date, optional time and note, category, and priority.
- Delete individual entries or remove all past entries after confirmation.
- See category markers on calendar days with entries.
- Save entries in browser `localStorage`.

## Run locally

No build step, package manager, or server is required. Open `index.html` in a modern browser, or serve this directory with any static web server.

For example, if Python is installed:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> and use the calendar. To stop the server, press `Ctrl+C` in the terminal.

## Data and privacy

Calendar entries are stored in the browser's `localStorage` under the key `days_events`. They are specific to the browser and site origin; clearing browser site data removes them. The application has no server-side storage or synchronization. The page loads its Inter and JetBrains Mono fonts from Google Fonts, which requires an internet connection and makes requests to Google's font service.

## Project files

- `index.html` — application markup and entry form
- `src/main.js` — calendar behavior and local storage
- `src/style.css` — layout, colors, and responsive styling
- `src/assets/favicon.svg` — browser icon
