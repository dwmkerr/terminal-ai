#!/usr/bin/env bash

# Run commit message generation evaluation

set -e -o pipefail

green='\033[0;32m'
nc='\033[0m'

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fixtures_dir="$script_dir/fixtures"
output_dir="$script_dir/output"
grader="$script_dir/grader.sh"

rm -rf "$output_dir"
mkdir -p "$output_dir"

for fixture in "$fixtures_dir"/*.diff; do
    name=$(basename "$fixture" .diff)
    output_file="$output_dir/${name}.txt"

    echo "running $name"
    cat "$fixture" | ai --raw "write a conventional commit message for this diff" > "$output_file"
    echo "  message: $(cat "$output_file")"
    "$grader" "$fixture" "$output_file"
done

echo -e "${green}✔${nc} all fixtures passed"
