# XI

## What It Is

XI is a position-specific football performance calculator. It combines match time, player minutes, position weights, and up to dozens of statistics into a single rating.

## Features

- Support nine positions, including winger, striker, midfield, defenders, goalkeeper, and false nine.
- Use position-specific categories and weights.
- Apply an 80/20 weighting model within each category.
- Normalize statistics against position-specific reference values.
- Include playing-time efficiency and a scorer bonus for goals and assists.
- Produce ratings from 2.0 to 10.0 with category and top-stat details.

## Usage

Open `index.html`, enter match duration and player minutes, select a position, fill in applicable statistics, and choose **Evaluate Performance**. Review the result overlay and reset the form for another player.

## Technology

HTML5, CSS3, and vanilla JavaScript. No backend, external API, or build tool is required.

## Privacy and Safety

All entered match data is processed locally in the browser. No server or tracker is used. The score is an opinionated calculation model and should not be treated as an official scouting, contract, medical, or selection decision.

## Deployment

Live on GitHub Pages: https://okara-dev.github.io/web/micro/XI/

## License

MIT License.

## Status

Static client-side calculator. The interface is currently German-language.