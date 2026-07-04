#!/usr/bin/env bash
set -euo pipefail

SOURCE_ZIP="${1:-data/seed/qbank-v2026.05.zip}"
TARGET_ZIP="${2:-entry/src/main/resources/rawfile/qbank-v2026.05.zip}"

if [[ ! -f "${SOURCE_ZIP}" ]]; then
  echo "seed package not found: ${SOURCE_ZIP}" >&2
  echo "generate it with tools/qbank_parser.py before integrating the app package" >&2
  exit 1
fi

mkdir -p "$(dirname "${TARGET_ZIP}")"
cp "${SOURCE_ZIP}" "${TARGET_ZIP}"
echo "integrated seed package: ${TARGET_ZIP}"
