#!/bin/bash
# Usage: ./convert-schema.sh input.json output.yaml

if [ $# -ne 2 ]; then
  echo "Usage: $0 input.json output.yaml"
  exit 1
fi

json2yaml < "$1" > "$2"
echo "Converted $1 to $2"
