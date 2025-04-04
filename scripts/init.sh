#!/usr/bin/env bash

set -e -o pipefail

# Validates we have everything we need setup for local development and
# production deployment. Quiet when things are good and noisy / helpful when
# things are bad.

if ! command -v jq &> /dev/null; then
  echo 'error: jq is not installed'
  echo 'try:'
  echo '  brew install jq'
  exit 1
else
  echo 'verified: jq installed'
fi
