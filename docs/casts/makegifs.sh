#!/usr/bin/env bash

for file in *.cast; do
  if [[ -f "$file" ]]; then
    name="${file%.cast}"
    gif="${name}.gif"
    agg --theme solarized-dark "${file}" "${gif}"
  fi
done
