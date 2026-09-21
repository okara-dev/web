# Todo

## What It Is

Todo is a minimal browser task list centered around one highlighted main focus.

## Features

- Add, complete, and delete tasks.
- Mark one task as the main focus and display it prominently.
- Remove completed tasks in one action.
- Persist tasks and focus state in local storage.
- Responsive interface with animated visual styling.
- Generate unique task IDs with `crypto.randomUUID()`.

## Usage

Open `index.html`, enter a task and press Enter or the add button, then use the star to set the main focus. Click the checkbox or task text to complete it.

Only one task can be the focus at a time. Completing or deleting the focused task clears the focus.

## Technology

HTML5, CSS3, vanilla JavaScript, `localStorage`, and the browser Crypto API. No framework or build tool is required.

## Privacy and Safety

Tasks are stored locally in the browser. No server or tracker is used. Clearing browser storage removes the task list.

## Deployment

Live on GitHub Pages: https://okara-dev.github.io/web/micro/todo/

## License

MIT License.

## Status

Static client-side web app. The interface is currently German-language.