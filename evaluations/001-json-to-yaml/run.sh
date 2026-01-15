#!/usr/bin/env bash

# Run JSON-to-YAML conversion evaluation

# Bail noisily on errors.
set -e -o pipefail

# Quick helpers for colour in output.
green='\033[0;32m'
nc='\033[0m'

# Directories / paths we use.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fixtures_dir="$script_dir/fixtures"
output_dir="$script_dir/output"
grader="$script_dir/grader.sh"

# Cleanup any old output.
rm -rf "$output_dir"
mkdir -p "$output_dir"

# Go through each fixture, convert it, fail noisily if it doesn't match.
for fixture in "$fixtures_dir"/*.json; do
    name=$(basename "$fixture" .json)
    output_file="$output_dir/${name}.yaml"

    echo "running $name"
    cat "$fixture" | ai --raw "convert to yaml" > "$output_file"
    "$grader" "$fixture" "$output_file"
done

echo -e "${green}✔${nc} all fixtures passed"
