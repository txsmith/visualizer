#!/bin/bash

# Test the /api/me endpoint with your OAuth access token
# Usage: ./test_api_me.sh YOUR_ACCESS_TOKEN

if [ -z "$1" ]; then
  echo "Usage: ./test_api_me.sh YOUR_ACCESS_TOKEN"
  echo ""
  echo "Example:"
  echo "  ./test_api_me.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  exit 1
fi

ACCESS_TOKEN="$1"

echo "Testing /api/me endpoint..."
echo "======================================"

curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Accept: application/json" \
  -v

echo "======================================"
