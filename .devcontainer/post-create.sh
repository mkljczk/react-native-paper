#!/usr/bin/env bash
set -euo pipefail

corepack enable

yarn

sudo apt-get update && sudo apt-get install -y libglib2.0-0 libnspr4
