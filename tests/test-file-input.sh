#!/usr/bin/env bash

# Boot on errors.
set -e -o pipefail

# Grab parameters.
ai_path="${0:-ai}"

# Get the current working directory, should be the one with package in it.
name=$0
src_dir="$(pwd)"
if [ ! -f "${src_dir}/package.json" ]; then
  echo "❌ error: ${name} must be run from project root"
  exit 1
fi

# Using a provider that handles text, we should be able to answer a question
# about a file.
export AI_API_KEY="${TESTING_AI_API_KEY}"
export AI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
export AI_MODEL="models/gemini-2.0-flash"
prompt="
I have sent you a file.
Tell me what its path is, the mime-type of the file, and the name of the javascript function it exports.
You MUST output ONLY the answers in the YAML format below:
path='file path'
mimeType='mimetype'
functionName='functionName'
"
eval "ai chat -f test-files/code.js -- '${prompt}' | tee result.yaml" || error_code=$?

# Assert we have the expected output.
echo "verifying output..."
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
fi
name=$(yq -e '.path' result.yaml)
mimeType=$(yq -e '.mimeType' result.yaml)
functionName=$(yq -e '.functioName' result.yaml)
echo "name: ${name}"
echo "mimeType: ${mimeType}"
echo "functionName: ${functioName}"
echo "✅ done..."
