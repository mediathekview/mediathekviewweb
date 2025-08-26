#!/bin/bash
set -euxo pipefail

rm -rf dist
node_modules/.bin/tsc
cp -r static dist/
cp *.html dist/

cp index.css dist/static/index.css
npx tailwindcss -i index.css -o dist/static/index.css --minify
cp node_modules/video.js/dist/video.min.js dist/static/video.min.js
cp node_modules/video.js/dist/video-js.min.css dist/static/video-js.min.css
