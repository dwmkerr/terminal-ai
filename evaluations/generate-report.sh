#!/usr/bin/env bash

# Generate HTML report from results.json

set -e -o pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
output_dir="$script_dir/output"
results_file="$output_dir/results.json"

if [[ ! -f "$results_file" ]]; then
    echo "error: $results_file not found. Run ./run-all.sh first." >&2
    exit 1
fi

cat > "$output_dir/index.html" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal AI Evaluations</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; padding: 2rem; }
        h1 { color: #58a6ff; margin-bottom: 0.5rem; }
        .subtitle { color: #8b949e; font-size: 0.875rem; margin-bottom: 1.5rem; }
        .subtitle a { color: #58a6ff; }
        .summary { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; margin-bottom: 2rem; }
        .summary-stats { display: flex; gap: 2rem; margin-top: 0.5rem; }
        .stat { font-size: 1.5rem; font-weight: bold; }
        .stat.passed { color: #3fb950; }
        .stat.failed { color: #f85149; }
        .eval-list { list-style: none; }
        .eval-item { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .eval-item.passed { border-left: 4px solid #3fb950; }
        .eval-item.failed { border-left: 4px solid #f85149; }
        .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
        .badge.passed { background: #238636; color: #fff; }
        .badge.failed { background: #da3633; color: #fff; }
        .grader { background: #21262d; color: #8b949e; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
        .grader.code { color: #7ee787; }
        .grader.llm_rubric { color: #d2a8ff; }
        .grader.llm_assertions { color: #a5d6ff; }
        .eval-name { flex: 1; }
        pre { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; overflow-x: auto; font-size: 0.875rem; margin-top: 0.5rem; display: none; width: 100%; white-space: pre-wrap; }
        .eval-item.expanded pre { display: block; }
        .toggle { cursor: pointer; color: #58a6ff; font-size: 0.875rem; }
    </style>
</head>
<body>
    <h1>Terminal AI Evaluations</h1>
    <p class="subtitle">Based on <a href="https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents">Demystifying evals for AI agents</a> (Anthropic)</p>
    <div class="summary">
        <div class="summary-stats">
            <div><span class="stat passed" id="passed">0</span> passed</div>
            <div><span class="stat failed" id="failed">0</span> failed</div>
        </div>
    </div>
    <ul class="eval-list" id="results"></ul>
    <script>
        fetch('results.json')
            .then(r => r.json())
            .then(results => {
                document.getElementById('passed').textContent = results.filter(r => r.status === 'passed').length;
                document.getElementById('failed').textContent = results.filter(r => r.status === 'failed').length;
                const list = document.getElementById('results');
                results.forEach(r => {
                    const li = document.createElement('li');
                    li.className = `eval-item ${r.status}`;
                    li.innerHTML = `
                        <span class="badge ${r.status}">${r.status}</span>
                        <span class="grader ${(r.grader || 'code').replace(/-/g, '_')}">${r.grader || 'code'}</span>
                        <span class="eval-name">${r.name}</span>
                        <span class="toggle">details</span>
                        <pre></pre>
                    `;
                    li.querySelector('.toggle').addEventListener('click', function() {
                        li.classList.toggle('expanded');
                        const pre = li.querySelector('pre');
                        if (!pre.textContent) {
                            fetch(`${r.name}/output.txt`)
                                .then(resp => resp.text())
                                .then(text => pre.textContent = text)
                                .catch(() => pre.textContent = 'Could not load output');
                        }
                    });
                    list.appendChild(li);
                });
            });
    </script>
</body>
</html>
HTMLEOF

echo "report: $output_dir/index.html"
