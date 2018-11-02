#!/bin/bash

dockerfile=Dockerfile

while getopts "c:n:f:" opt; do
    case $opt in
        c) caches+=("$OPTARG");;
        n) names+=("$OPTARG");;
        f) dockerfile=("$OPTARG")
        #...
    esac
done

shift $((OPTIND -1))
workdir=$1
build_arguments="-f $dockerfile $( printf " --cache-from %s" "${caches[@]}" )$( printf " --tag %s" "${names[@]}" ) $workdir"

echo $build_arguments

for image in "${caches[@]}"; do
  docker pull $image || true
done

docker build $build_arguments && \

for image in "${names[@]}"; do
  docker push $image || true
done