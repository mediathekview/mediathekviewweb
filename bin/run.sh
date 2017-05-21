#!/bin/sh

# This code is based on
# https://github.com/ether/etherpad-lite/blob/develop/bin/run.sh

# Move to the folder where MediathekViewWeb is installed
cd `dirname $0`

# Was this script started in the bin folder? if yes move out
if [ -d "../bin" ]; then
  cd "../"
fi

ignoreRoot=0
for ARG in $*
do
  if [ "$ARG" = "--root" ]; then
    ignoreRoot=1
  fi
done

#Stop the script if its started as root
if [ "$(id -u)" -eq 0 ] && [ $ignoreRoot -eq 0 ]; then
   echo "You shouldn't start MediathekViewWeb as root!"
   echo "Please type 'MediathekViewWeb rocks my socks' or supply the '--root' argument if you still want to start it as root"
   read rocks
   if [ ! "$rocks" == "MediathekViewWeb rocks my socks" ]
   then
     echo "Your input was incorrect"
     exit 1
   fi
fi

# prepare the enviroment
bin/installDeps.sh $* || exit 1

# Move to the node folder and start
echo "Started MediathekViewWeb..."

SCRIPTPATH=`pwd -P`
exec node "$SCRIPTPATH/app.js" $*
