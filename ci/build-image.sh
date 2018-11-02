#!/bin/bash

dockerfile=Dockerfile

while getopts "c:n:f:a:" opt; do
    case $opt in
        c) caches+=("$OPTARG");;
        n) names+=("$OPTARG");;
        a) args+=("$OPTARG");;
        f) dockerfile=("$OPTARG")
        #...
    esac
done

shift $((OPTIND -1))
workdir=$1
build_arguments="--pull -f $dockerfile"

if [ ${#args[@]} -ne 0 ]; then
  build_arguments+="$( printf " --build-arg %s" "${args[@]}" )"
fi

if [ ${#caches[@]} -ne 0 ]; then
  build_arguments+="$( printf " --cache-from %s" "${caches[@]}" )"
fi

if [ ${#names[@]} -ne 0 ]; then
  build_arguments+="$( printf " --tag %s" "${names[@]}" )"
fi

build_arguments+=" $workdir"

for image in "${caches[@]}"; do
  docker pull $image || true
done

docker build $build_arguments && \

for image in "${names[@]}"; do
  docker push $image || true
done
