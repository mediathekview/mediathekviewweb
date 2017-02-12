#!/bin/sh

# This code is based on
# https://github.com/ether/etherpad-lite/blob/develop/bin/installDeps.sh

# Move to the folder where MediathekViewWeb is installed
cd `dirname $0`

# Was this script started in the bin folder? if yes move out
if [ -d "../bin" ]; then
  cd "../"
fi

# Is node installed?
# not checking io.js, default installation creates a symbolic link to node
hash node > /dev/null 2>&1 || {
  echo "Please install node.js ( http://nodejs.org )" >&2
  exit 1
}

# Is npm installed?
hash npm > /dev/null 2>&1 || {
  echo "Please install npm ( http://npmjs.org )" >&2
  exit 1
}

npm install
npm run build

exit 0
