# Web Projects

This folder contains a collection of personal web applications, frontend experiments, small browser prototypes, and larger projects with a backend, database, or Docker setup. The goal is to keep a central place for different ideas around web development, user interfaces, and digital products.

## Overview

This directory brings together three main types of projects:

- Small, focused web ideas and experiments
- Larger applications with a server, API, and their own data handling
- Presentation and product pages such as portfolios or shops

## Structure

### `macro/`
Larger applications with their own logic, often split into separate frontend and backend folders. Typical for projects with:

- Node.js or Express backend
- dedicated frontend
- database integration
- Docker or Compose configuration

Most projects in this area follow a structure like:

```text
project/
  backend/
  frontend/
  Dockerfile
  docker-compose.yml
  README.md
```

### `micro/`
Smaller projects and compact web ideas. These are usually easier to understand and focus on a single feature, game, tool, or small app.

### `portfolio/`
This section is for personal portfolio websites or similar presentation pages. It focuses on content, project showcases, and public frontend pages.

### `ics-shop/`
Project area for shop or product ideas with a focus on sales and product functionality.

## Typical Technology Stack

- HTML, CSS, and JavaScript / React-like frontends
- Node.js and Express for APIs and servers
- PostgreSQL or other databases depending on the project
- Docker and Docker Compose for reproducible startup setups
- external services or APIs when a project integrates data from another system

## How I work with a project

Each individual project can have its own requirements, ports, and environment variables. In general:

1. Read the README in the relevant subfolder
2. Install the dependencies
3. Use the project-specific start commands
4. Check the Compose configuration for Docker setups

### Typical commands

For Node.js projects:

```bash
npm install
npm start
```

Or with Docker:

```bash
docker compose up --build
```

## Notes

- Local configuration such as API keys or credentials belongs in `.env` files and not in the repository.
- Ports, databases, and environment variables may differ from project to project.
- If a project has more specific dependencies or services, its own project README is the source of truth.

This directory acts as a collection point for web ideas: flexible, experimental, and easy to expand.
