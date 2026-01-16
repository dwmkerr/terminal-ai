#!/usr/bin/env bash

# Run code explanation evaluation

set -e -o pipefail

green='\033[0;32m'
nc='\033[0m'

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fixtures_dir="$script_dir/fixtures"
output_dir="$script_dir/output"
grader="$script_dir/grader.sh"

rm -rf "$output_dir"
mkdir -p "$output_dir"

for fixture in "$fixtures_dir"/*; do
    name=$(basename "$fixture" | sed 's/\.[^.]*$//')
    output_file="$output_dir/${name}.txt"

    echo "running $name"
    cat "$fixture" | ai --raw "explain what this code does" > "$output_file"
    "$grader" "$fixture" "$output_file"
done

echo -e "${green}✔${nc} all fixtures passed"
