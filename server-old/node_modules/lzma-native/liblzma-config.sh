#!/bin/sh
set -e

SRC_TARBALL="$2"
TARGET_DIR="$1/liblzma"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

tar xvjf "$SRC_TARBALL" >node_liblzma_config.log 2>&1 

export CFLAGS="-fPIC $CFLAGS"
sh xz-*/configure --enable-static --disable-shared --disable-scripts --disable-lzmainfo \
	--disable-lzma-links --disable-lzmadec --disable-xzdec --disable-xz --disable-rpath \
	--prefix="$TARGET_DIR/build" CFLAGS="$CFLAGS" >>node_liblzma_config.log 2>&1 
