#!/usr/bin/env bash

# LLM-as-judge grader for commit message quality
# Uses rubric scoring across multiple dimensions

set -e -o pipefail

green='\033[0;32m'
red='\033[0;31m'
nc='\033[0m'

original_diff="$1"
output_message="$2"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rubric="$script_dir/rubric.md"
scores_file=$(mktemp)
trap "rm -f $scores_file" EXIT

message=$(cat "$output_message")

# Use AI to grade the commit message (uses GRADER_* env vars if set)
rubric_content=$(cat "$rubric")
grades=$(AI_API_KEY="${GRADER_API_KEY:-$AI_API_KEY}" \
         AI_BASE_URL="${GRADER_BASE_URL:-$AI_BASE_URL}" \
         AI_MODEL="${GRADER_MODEL:-$AI_MODEL}" \
         ai --raw "
$rubric_content

Grade this commit message against the rubric.

DIFF:
$(cat "$original_diff")

COMMIT MESSAGE:
$message

Return ONLY valid JSON with format, conciseness, and accuracy scores. No other text.")

echo "$grades" > "$scores_file"

# Parse scores
format=$(echo "$grades" | jq -r '.format // 0')
conciseness=$(echo "$grades" | jq -r '.conciseness // 0')
accuracy=$(echo "$grades" | jq -r '.accuracy // 0')

# Calculate weighted score (format: 0.3, conciseness: 0.3, accuracy: 0.4)
weighted=$(echo "scale=2; ($format * 0.3) + ($conciseness * 0.3) + ($accuracy * 0.4)" | bc)

# Report dimensions
echo "  format: $format"
echo "  conciseness: $conciseness"
echo "  accuracy: $accuracy"
echo "  weighted: $weighted"

# Check threshold (0.7)
pass=$(echo "$weighted >= 0.7" | bc)
if [ "$pass" -eq 1 ]; then
    echo -e "${green}✔${nc} score: $weighted >= 0.7"
    exit 0
else
    echo -e "${red}✗${nc} score: $weighted < 0.7"
    exit 1
fi
