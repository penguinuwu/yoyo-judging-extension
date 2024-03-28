# Yo-Yo Judging Helper Browser Extension

## How to setup

1. Install `pnpm`
   - Refer to [documentation](https://pnpm.io/installation)
2. Install packages

   ```bash
   pnpm clean-install --ignore-scripts=false
   # note: the package `sharp` will fail if `--ignore-scripts=true`
   ```

## How to run with live reloading

1. Run the development server
   - Chrome: `pnpm server-c`
   - Firefox: `pnpm server-f`
2. Open a second terminal and run the temporary browser
   - Chrome: `pnpm browser-c`
   - Firefox: `pnpm browser-f`

## How to run the production build

1. Build the production extension
   - Chrome: `pnpm build-c`
   - Firefox: `pnpm build-f`
2. Install the extension
   - Chrome: [reference](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
   - Firefox: [reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)

---

This is a [Plasmo extension](https://docs.plasmo.com/) project 🩷
