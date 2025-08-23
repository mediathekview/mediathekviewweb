#!/bin/bash
set -euxo pipefail

rm -rf dist
node_modules/.bin/tsc
cp -r static dist/
cp *.html dist/

cp index.css dist/static/index.css
npx @tailwindcss/cli -i index.css -o dist/static/index.css --minify
cp node_modules/js-cookie/dist/js.cookie.min.js dist/static/js.cookie.min.js
cp node_modules/video.js/dist/video.min.js dist/static/video.min.js
cp node_modules/video.js/dist/video-js.min.css dist/static/video-js.min.css
cp node_modules/videojs-hotkeys/videojs.hotkeys.min.js dist/static/videojs.hotkeys.min.js
cp node_modules/socket.io-client/dist/socket.io.min.js dist/static/socket.io.min.js
