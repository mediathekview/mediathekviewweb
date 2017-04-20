#!/bin/sh

WANT_FLAGS="-std=c++11"

if [ x"$CXX" = x"" ]; then CXX=c++; fi

touch testsupp.c

for f in $WANT_FLAGS; do 
	if $CXX -c -o testsupp.o "$f" testsupp.c 2>&- >&- ; then
		CFLAGS="$CFLAGS $f"
	fi
done

rm -f testsupp.c testsupp.o
echo "$CFLAGS"
