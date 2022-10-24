#!/bin/bash
set -euxo pipefail

rm -rf dist
node_modules/.bin/tsc
cp -r static dist/
cp *.html dist/

cp index.css dist/static/index.css
mkdir dist/static/bootstrap
cp node_modules/bootstrap/dist/css/bootstrap.min.css dist/static/bootstrap.min.css
cp node_modules/bootstrap/dist/js/bootstrap.min.js dist/static/bootstrap.min.js
cp node_modules/datatables.net/js/jquery.dataTables.min.js dist/static/jquery.dataTables.min.js
cp node_modules/jquery/dist/jquery.min.js dist/static/jquery.min.js
cp node_modules/js-cookie/dist/js.cookie.min.js dist/static/js.cookie.min.js
cp node_modules/lodash/lodash.min.js dist/static/lodash.min.js
cp node_modules/video.js/dist/video.min.js dist/static/video.min.js
cp node_modules/video.js/dist/video-js.min.css dist/static/video-js.min.css
cp node_modules/socket.io-client/dist/socket.io.min.js dist/static/socket.io.min.js
sed '1s/.*/\/*!/' node_modules/bootswatch/lumen/bootstrap.min.css >dist/static/bootstrap-lumen.min.css
sed '1s/.*/\/*!/' node_modules/bootswatch/darkly/bootstrap.min.css >dist/static/bootstrap-darkly.min.css
