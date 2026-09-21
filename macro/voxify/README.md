# Voxify

## What It Is

Voxify converts text or uploaded `.txt` and `.md` scripts into podcast-style audio files that can be played and downloaded.

## Features

- Enter text directly or load a text/Markdown file.
- Select German, English, or French speech output.
- Control speaking speed and pauses.
- Generate, play, and download MP3 audio.
- Show the source transcript.
- Split long text into server-side processing sections.
- Combine temporary audio segments with FFmpeg.

## Usage

Requirements: Node.js, FFmpeg available as `ffmpeg` in `PATH`, and internet access for text-to-speech requests.

```bash
npm install
npm start
```

Open `http://localhost:3000`. Docker support is available through `docker compose up --build`; stop it with `docker compose down`.

## Technology

- Node.js and Express
- `google-tts-api` for speech synthesis
- `node-fetch` for HTTP requests
- FFmpeg for joining audio segments
- HTML, CSS, and vanilla JavaScript frontend
- Temporary MP3 files in `temp/`

## Privacy and Safety

Text submitted for synthesis is sent to the configured external TTS service. Do not submit confidential content without checking the provider's terms. Temporary audio files should be cleaned and protected. The current implementation has a known runtime issue involving references to `dialogs.length` even though `dialogs` is undefined; production use requires fixing that issue first.

## Deployment

This Macro app is not currently deployed as part of the public GitHub Pages Macro set. Use the local Node.js or Docker setup for development.

## License

No license is currently specified for this project. Obtain permission before redistributing or commercially reusing it.

## Status

Full-stack text-to-audio prototype. FFmpeg and external TTS access are required.