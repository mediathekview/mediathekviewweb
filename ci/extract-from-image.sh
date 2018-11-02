#!/bin/bash

IMAGE=$1
SOURCE=$2
DEST=$3
CONTAINER_NAME=$CI_JOB_ID

CONTAINER_ID=$(docker create $IMAGE)
docker cp $CONTAINER_ID:$SOURCE $DEST
docker rm $CONTAINER_ID