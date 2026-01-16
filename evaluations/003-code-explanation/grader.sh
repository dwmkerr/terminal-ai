#!/usr/bin/env bash

# LLM-as-judge grader using natural language assertions
# Each assertion must pass for the eval to succeed

set -e -o pipefail

green='\033[0;32m'
red='\033[0;31m'
nc='\033[0m'

original_code="$1"
output_explanation="$2"

code=$(cat "$original_code")
explanation=$(cat "$output_explanation")

# Define assertions
assertions=(
    "Explanation correctly identifies the main purpose of the code"
    "Explanation mentions key functions or methods by name"
    "Explanation does not contain factual errors about what the code does"
    "Explanation is written for a developer audience"
)

all_passed=true

for assertion in "${assertions[@]}"; do
    # Use AI to check if the assertion holds (uses GRADER_* env vars if set)
    result=$(AI_API_KEY="${GRADER_API_KEY:-$AI_API_KEY}" \
             AI_BASE_URL="${GRADER_BASE_URL:-$AI_BASE_URL}" \
             AI_MODEL="${GRADER_MODEL:-$AI_MODEL}" \
             ai --raw "
You are evaluating a code explanation. Answer only YES or NO.

CODE:
$code

EXPLANATION:
$explanation

ASSERTION: $assertion

Does the explanation satisfy this assertion? Answer YES or NO only.")

    result_clean=$(echo "$result" | tr '[:lower:]' '[:upper:]' | tr -d '[:space:]')

    if [[ "$result_clean" == "YES" ]]; then
        echo -e "${green}✔${nc} $assertion"
    else
        echo -e "${red}✗${nc} $assertion"
        all_passed=false
    fi
done

if [ "$all_passed" = true ]; then
    exit 0
else
    exit 1
fi
