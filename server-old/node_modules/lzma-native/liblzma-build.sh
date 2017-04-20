#!/bin/sh
set -e

cd "$1/liblzma"
make
make install
