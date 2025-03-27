#!/usr/bin/env bash

# Boot on errors.
set -e

# Get the current working directory, should be the one with package in it.
name=$0
src_dir="$(pwd)"
if [ ! -f "${src_dir}/package.json" ]; then
  echo "❌ error: ${name} must be run from project root"
  exit 1
fi

# Make a temp dir, works on Darwin/Linux.
tmp_dir=$(mktemp -d 2>/dev/null || mktemp -d -t 'ai-temp')
if [ ! -d "${tmp_dir}" ]; then
  echo "❌ error: can't create temp dir ${tmp_dir}"
  exit 1
fi
cd "${tmp_dir}"
echo "moved to new temp dir: ${tmp_dir}"

# Install terminal ai. Get its path.
echo "installing ai from: ${src_dir}..."
npm install "${src_dir}"
ai_path="${tmp_dir}/node_modules/.bin/ai"
if [ ! -x "${ai_path}" ]; then
  echo "❌ error: expected ai at ${ai_path} doesn't exist or isn't executable"
  exit 1
fi
echo "...done"

# Before we do a first run, check if we have a prompts folder.
prompts_dir="$HOME/.ai/prompts"
if [ -d  "${prompts_dir}" ]; then
  echo "⚠️ warning: prompts dir ${prompts_dir} already exists, cannot verify fresh prompt installation..."
fi

# Get the first number, first and easiest check.
echo "verifying can check version..."
eval "${ai_path} --version"
echo "✅ done..."

#  We should be able to output config.
echo "verifying can output config..."
eval "${ai_path} -- config"
echo "✅ done..."

# The prompts folder in the config folder should have been created.
echo "verifying prompts folder has been hydrated..."
if [ ! -d  "${prompts_dir}" ]; then
  echo "❌ error: prompts dir ${prompts_dir} not created..."
fi
echo "✅ done..."

# Trying to chat without having run 'init' first should fail immediately when
# non-interactive.
echo "verifying ai errors as expected for non-interactive run before 'ai init'..."
eval "${ai_path} chat -- 'what is the time' > output.md" || error_code=$?
if [ "${error_code}" -ne 12 ]; then
  echo "❌ error: expected error code 12 (invalid configuration)..."
fi
echo "✅ done..."

# Set API key / base url / model with env vars and verify we can chat.
export AI_API_KEY="${TESTING_AI_API_KEY}"
export AI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
export AI_MODEL="models/gemini-2.0-flash"
echo "verifying ai chat..."
eval "${ai_path} chat -- 'what is the time'" || error_code=$?
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
fi
echo "✅ done..."

# Verify that we can pipe data in.
echo "verifying ai chat..."
eval "echo 'what is the time' | ${ai_path}" || error_code=$?
if [ "${error_code}" -ne 0 ]; then
  echo "❌ error: expected success on chat, got error code ${error_code}..."
fi
echo "✅ done..."

# Cleanup.
rm -rf "${tmp_dir}"
