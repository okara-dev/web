# Blumentagebuch

## What It Is

Blumentagebuch is a searchable flower encyclopedia with a flower-of-the-day view and detailed plant information. The backend fetches data from the Trefle API and caches responses for 24 hours.

## Features

- Search and browse flowers.
- Display cards and detail modals.
- Show scientific name, family, genus, descriptions, and properties such as edible or medicinal indicators.
- Provide a flower of the day.
- Display cache status and allow a manual cache refresh.

## Usage

Docker:

```bash
docker compose up --build
```

The frontend is available at `http://localhost` and the backend at `http://localhost:3000`. Stop the stack with `docker compose down`.

For local backend development:

```bash
cd backend
npm install
npm start
npm run dev
```

## Technology

- Node.js and Express backend
- Axios, CORS, and dotenv
- Vanilla HTML, CSS, and JavaScript frontend
- Nginx frontend delivery
- Trefle API
- Docker Compose

## Privacy and Safety

Searches and plant data are sent through the backend to Trefle. Review the external API's privacy policy before using personal or identifying search terms. The current implementation stores the Trefle key directly in `backend/server.js`; move it to an environment variable before production deployment.

## Deployment

This is the only deployed Macro web app:

https://okara-dev.github.io/web/macro/blumentagebuch/

## License

No license is currently specified for this project. Obtain permission before redistributing or commercially reusing it.

## Status

Macro application with frontend, backend, caching, and Docker support.