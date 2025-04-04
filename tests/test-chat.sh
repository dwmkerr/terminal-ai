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

# Set API key / base url / model with env vars and verify we can chat.
export AI_API_KEY="${TESTING_AI_API_KEY}"
export AI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
export AI_MODEL="models/gemini-2.0-flash"
echo "verifying ai chat..."
error_code=0
# we must pipe in dev/null so that we're non interative
eval "${ai_path} chat 'what is the time' </dev/null" || error_code=$?
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
  exit 1
fi
echo "✅ done..."

# Verify that we can pipe data in.
echo "verifying ai chat piping to stdin..."
eval "echo 'hello ai' | ${ai_path} 'what message did i send you?'" || error_code=$?
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
  exit 1
fi
echo "✅ done..."
