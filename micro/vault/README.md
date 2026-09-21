# Vault

## What It Is

Vault is a local browser utility for storing API keys behind a master-password screen. It is a convenience tool for local development secrets, not a hardened password manager.

## Features

- Create a local master password.
- Add, show, hide, copy, and delete API keys.
- Lock the vault and recreate the local account.
- Store entries in browser `localStorage`.
- Developer-focused dark interface with clipboard support.
- No framework, build tool, backend, or database.

## Usage

Open `index.html`, create a master password, unlock the vault, and add key names and values. Use the lock action to hide the entries. Recreating the account permanently deletes stored keys.

## Technology

HTML5, CSS3, vanilla JavaScript, `localStorage`, and the Web Clipboard API.

## Privacy and Safety

Everything runs locally and there is no server or tracker. However, the current implementation stores the password and keys in `localStorage` with Base64 obfuscation, not encryption. Browser developer tools can reveal the data, and clearing browser storage loses the vault. Do not use this tool for production credentials or critical secrets.

## Deployment

Live on GitHub Pages: https://okara-dev.github.io/web/micro/vault/

## License

MIT License.

## Status

Static client-side utility. Use a dedicated password manager for real secret protection.