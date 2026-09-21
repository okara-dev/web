# Kurio

## What It Is

Kurio is a browser-based currency converter with live exchange rates and historical charts.

## Features

- Support for more than 50 currencies.
- Instant amount conversion with currency swapping.
- Seven-, 30-, and 90-day exchange-rate charts.
- Quick selection of popular currency pairs.
- Persist selected currencies locally.
- Refresh rates automatically every five minutes.

## Usage

Open the deployed app or serve the project over HTTP/HTTPS. Select the source and target currencies, enter an amount, and choose a chart range. A direct `file://` launch may block API requests because of browser CORS rules.

## Technology

HTML5, CSS3, vanilla JavaScript with `fetch` and async/await, Chart.js via CDN, and `localStorage`.

## APIs and Privacy

Rates are requested from the public Frankfurter API with `open.er-api.com` as fallback. The app has no own backend or tracker, but external API providers receive requests and may process request metadata. Exchange rates are informational and may be delayed.

## Deployment

Live on GitHub Pages: https://okara-dev.github.io/web/micro/kurio/

## License

MIT License.

## Status

Static client-side web app. Internet access is required for current rates and charts.