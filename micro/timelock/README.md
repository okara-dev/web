# TimeLock

A digital time capsule for micro. Write a letter to your future self, seal it, and it will only become readable after 3 months, 6 months, or 1 year.

## Features

- Write a letter with a title and a message
- Choose when the letter should be unsealed (3 months, 6 months, 1 year)
- Letters are securely stored in localStorage
- Countdown shows exactly how long until a letter can be opened
- Locked letters cannot be opened or read
- Beautiful, warm analog design with paper texture and stars
- Responsive and German UI

## Usage

1. Open `index.html`.
2. Click "Neuen Brief schreiben".
3. Write your message.
4. Choose the unlock date (3 months, 6 months, or 1 year).
5. Click "Versiegeln".
6. View your locked letters under "Meine Briefe ansehen".
7. Once the time has passed, click on the letter to read it.

## Tech

- HTML5
- CSS3 (animations, custom properties, textures)
- Vanilla JavaScript (ES6+)
- localStorage for persistence

## Privacy

All letters stay in your browser. No servers, no tracking. If you clear your browser data, the letters will be lost.

## License

MIT