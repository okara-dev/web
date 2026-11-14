# Diary

A digital journal that stores entries for years. Save a photo of the day, write down your thoughts, and rate your mood from 1 to 10. Everything is stored locally in your browser.

## Features

- Monthly calendar view
- Add a photo of the day (compressed automatically to save space)
- Write a journal entry for each day
- Rate your mood from 1 to 10 (with emoji feedback)
- Visual mood indicator in the calendar (color-coded dots)
- View past entries (read-only mode)
- Edit or delete entries
- Photos appear as backgrounds in the calendar for added emotional value
- Responsive and warm, analog design
- German UI

## Usage

1. Open `index.html` in a browser.
2. Click on any day in the calendar.
3. Upload a photo, write your entry, and rate your mood.
4. Click "Speichern" to save.
5. Days with entries show a photo background and a colored mood dot.
6. Click on a past entry to read it. You can edit or delete it from there.

### Storage Note

All data is stored locally in your browser using `localStorage`. Photos are automatically compressed to a maximum width of 800px at 70% JPEG quality. This allows hundreds of photos to be saved without exceeding the 5MB limit.

## Tech

- HTML5
- CSS3 (custom properties, animations, glassmorphism)
- Vanilla JavaScript (ES6+)
- Image compression via Canvas API
- localStorage for persistence

## Privacy

All data stays in your browser. No servers, no tracking, no uploads. Clearing browser data will delete all entries.

## License

MIT