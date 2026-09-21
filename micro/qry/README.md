# QRY

## What It Is

QRY is an in-browser QR code generator for text, URLs, Wi-Fi credentials, and passwords.

## Features

- Text/URL, Wi-Fi, and password generation modes.
- Wi-Fi QR codes with WPA, WEP, open-network, and hidden-network options.
- Adjustable output size from 128 to 1024 pixels.
- Selectable error correction levels L, M, Q, and H.
- Download generated codes as PNG files.
- Work entirely in the browser after the QR library has loaded.

## Usage

Open `index.html`, select a mode, enter the data, choose size and error correction, and generate the code. Wi-Fi QR codes can be scanned by most modern phones.

## Technology

HTML5, CSS3, vanilla JavaScript, and `qrcode.js` loaded from jsDelivr CDN.

## Privacy and Safety

QR data is passed to the browser-side generator and is not sent to an application server. Because the library is loaded from a CDN, the browser makes an external request for the script. Treat downloaded QR images as sensitive when they contain credentials.

## Deployment

Live on GitHub Pages: https://okara-dev.github.io/web/micro/qry/

## License

MIT License.

## Status

Static client-side web app. Avoid sharing QR images that contain passwords or private network access.