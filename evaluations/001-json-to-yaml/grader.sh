#!/usr/bin/env bash

# Grader for JSON-to-YAML conversion evaluation
# Usage: ./grader.sh <original.json> <output.yaml>
# Requires: yq, jq

set -e -o pipefail

green='\033[0;32m'
red='\033[0;31m'
nc='\033[0m'

original_json="$1"
output_yaml="$2"

converted_json=$(mktemp)
trap "rm -f $converted_json" EXIT

# Check 1: No preamble - output should be raw YAML, not explanation
first_line=$(head -n1 "$output_yaml")
if [[ "$first_line" =~ ^(Here|The|This|Sure|I\'ll|Below|Certainly|\`) ]]; then
    echo -e "${red}✗${nc} no-preamble: output starts with: $first_line"
    exit 1
fi
echo -e "${green}✔${nc} no-preamble"

# Check 2: Valid YAML syntax
if ! yq eval '.' "$output_yaml" > /dev/null 2>&1; then
    echo -e "${red}✗${nc} valid-yaml: output is not valid YAML syntax"
    yq eval '.' "$output_yaml" 2>&1 | head -5
    exit 1
fi
echo -e "${green}✔${nc} valid-yaml"

# Check 3: Structural equivalence - YAML converts back to same JSON
yq eval -o=json '.' "$output_yaml" > "$converted_json"

original_normalized=$(jq -S '.' "$original_json")
converted_normalized=$(jq -S '.' "$converted_json")

if [ "$original_normalized" != "$converted_normalized" ]; then
    echo -e "${red}✗${nc} structural-equivalence: YAML does not match original JSON"
    exit 1
fi
echo -e "${green}✔${nc} structural-equivalence"
