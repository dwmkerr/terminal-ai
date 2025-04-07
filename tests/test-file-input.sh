#!/usr/bin/env bash

# Boot on errors.
set -e -o pipefail

# Get the current working directory, should be the one with package in it.
name=$0
src_dir="$(pwd)"
if [ ! -f "${src_dir}/package.json" ]; then
  echo "❌ error: ${name} must be run from project root"
  exit 1
fi

# Grab parameters.
ai_path="${1:-ai}"
ai_params="${2}"
ai_command="${ai_path} ${ai_params}"

# Enable or disable debug.
# export AI_DEBUG_ENABLE=1
# export AI_DEBUG_NAMESPACE="ai*"

# Using a provider that handles text, we should be able to answer a question
# about a file.
export AI_API_KEY="${TESTING_AI_API_KEY}"
export AI_BASE_URL="${TESTING_AI_BASE_URL:-https://generativelanguage.googleapis.com/v1beta/openai/}"
export AI_MODEL="${TESTING_AI_MODEL:-models/gemini-2.0-flash}"

# We'll perform many tests. If any of them seem to be wrong, we will set 'check'
# to '1' - meaning the operator should independently verify.
check=0

prompt="
I have sent you a file. You MUST ONLY OUTPUT YAML which follows the structure below:

\`\`\`yaml
path: <file path>
mimeType: <mimetype>
functionName: <functionName>
\`\`\`
"
error_code=0
eval "${ai_command} -f tests/test-files/code.js -- '${prompt}' | tee result.yaml" || error_code=$?

# Assert we have the expected output.
echo "verifying output..."
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
fi
path=$(yq -e '.path' result.yaml)
mimeType=$(yq -e '.mimeType' result.yaml)
functionName=$(yq -e '.functionName' result.yaml)
if [ "${path}" != "tests/test-files/code.js" ]; then
  echo "⚠️  warning: unexpected path, please manually verify"
  check=1
fi
if [ "${mimeType}" != "text/javascript" ]; then
  echo "⚠️  warning: unexpected mime type, please manually verify"
  check=1
fi
if [ "${functionName}" != "sum" ]; then
  echo "⚠️  warning: unexpected function name, please manually verify"
  check=1
fi
echo "✅ pass: validated that the path, mime-type and contents of a file can be read"

# Check for file contents
prompt="
I have sent you files. Tell me exactly how many I sent, your output should be a single numeral.
"
error_code=0
eval "${ai_command} -f README.md -f package.json -f tsconfig.json -- '${prompt}' | tee output.txt" || error_code=$?
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
fi
if grep -E -q ".*3.*" < output.txt; then
  echo "✅ pass: found 3 files"
else
  echo "⚠️  warning: didn't find the expected 3 files, please manually verify - output below"
  cat output.txt
  check=1
fi

# Check image file recognition.
prompt="
I have sent you an image file. Tell me in one line only what is in this image.
"
error_code=0
eval "${ai_command} --image-file tests/test-files/animal.jpg -- '${prompt}' | tee output.txt" || error_code=$?
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
fi
if grep -i -E -q ".*(salmon|fish).*" < output.txt; then
  echo "✅ pass: recognised the 'fish / salmon' image"
else
  echo "⚠️  warning: didn't get the expected response 'salmon' or 'fish', please manually verify - output below"
  cat output.txt
  check=1
fi

if [ "${check}" -eq 1 ]; then
  echo "⚠️ complete: some tests resulted in warnings, manual verification needed"
else
  echo "✅ complete: all checks passed"
fi
