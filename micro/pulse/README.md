# Pulse

## What It Is

Pulse is a static web application built as a standalone frontend.

## Features

- Client-side interactive interface.
- Static asset delivery through an Nginx production image.
- Docker-based local serving.

## Usage

```bash
docker compose up --build
```

Open `http://localhost:8080`. Stop the local container with:

```bash
docker compose down
```

## Technology

HTML, CSS, vanilla JavaScript, Docker, and Nginx. The project has no documented backend service.

## Privacy and Safety

The frontend is static and does not require a project backend. Review any external resources referenced by the frontend before deployment and do not assume that static hosting removes third-party network requests.

## Deployment

This Macro app is not currently deployed as part of the public GitHub Pages Macro set. Use the Docker setup for local hosting or configure a separate deployment target.

## License

No license is currently specified for this project. Obtain permission before redistributing or commercially reusing it.

## Status

Static frontend with Docker/Nginx support.