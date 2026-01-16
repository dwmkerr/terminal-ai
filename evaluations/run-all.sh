#!/usr/bin/env bash

# Run all evaluations and generate results.yaml
# Based on Anthropic's "Demystifying evals for AI agents" patterns

set -e -o pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source .evaluations.env from project root if present
if [[ -f "$project_root/.evaluations.env" ]]; then
    set -a  # auto-export all variables
    # shellcheck source=/dev/null
    source "$project_root/.evaluations.env"
    set +a
fi

green='\033[0;32m'
red='\033[0;31m'
nc='\033[0m'

output_dir="$script_dir/output"

rm -rf "$output_dir"
mkdir -p "$output_dir"

results_json="[]"

for eval_dir in "$script_dir"/*/; do
    [[ "$(basename "$eval_dir")" == "output" ]] && continue
    [[ ! -f "$eval_dir/run.sh" ]] && continue

    eval_name=$(basename "$eval_dir")
    eval_output_dir="$output_dir/$eval_name"
    mkdir -p "$eval_output_dir"

    # Extract grader type from eval.yaml if present
    grader_type="code"
    if [[ -f "$eval_dir/eval.yaml" ]]; then
        grader_type=$(grep -E "^\s*type:" "$eval_dir/eval.yaml" | head -1 | sed 's/.*type:\s*//' | tr -d ' ' || echo "code")
    fi

    echo "running $eval_name ($grader_type)"

    if "$eval_dir/run.sh" > "$eval_output_dir/output.txt" 2>&1; then
        echo -e "${green}✔${nc} $eval_name"
        status="passed"
    else
        echo -e "${red}✗${nc} $eval_name"
        cat "$eval_output_dir/output.txt"
        status="failed"
    fi

    results_json=$(echo "$results_json" | jq \
        --arg name "$eval_name" \
        --arg status "$status" \
        --arg grader "$grader_type" \
        '. += [{"name": $name, "status": $status, "grader": $grader}]')
done

# Write results
echo "$results_json" | jq '.' > "$output_dir/results.json"
echo "$results_json" | yq -P '.' > "$output_dir/results.yaml"

echo "results: $output_dir/results.yaml"

# Check for failures
failed_count=$(echo "$results_json" | jq '[.[] | select(.status == "failed")] | length')
if [ "$failed_count" -gt 0 ]; then
    exit 1
fi

echo -e "${green}✔${nc} all evaluations passed"
