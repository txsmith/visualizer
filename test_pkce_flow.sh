#!/bin/bash

# PKCE Test Flow for Visualizer OAuth
# Generated values for this test session

CLIENT_ID="ABVUnBFihpP26W_05JYAr_GCmjjL85Xc9BaR6ccxzEU"
CODE_VERIFIER="Owqa3NnXln6qqWt59yKIOPX1H_QbHRJepx8AzYJdy6I"
CODE_CHALLENGE="FbiDVKWkD8HrumHH6z8e-H0VFJq-FZmcMi5Eih5TR44"
STATE="random_state_$(openssl rand -hex 16)"
REDIRECT_URI="http://localhost/callback"
SCOPE="read+upload"

echo "==============================================="
echo "PKCE OAuth Flow Test"
echo "==============================================="
echo ""
echo "Step 1: Authorization Request"
echo "----------------------------------------------"
echo "State parameter (verify this is returned): ${STATE}"
echo ""
echo "Visit this URL in your browser:"
echo ""
echo "http://localhost:3000/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256&scope=${SCOPE}&state=${STATE}"
echo ""
echo "After authorizing, you'll be redirected to:"
echo "  http://localhost/callback?code=AUTH_CODE&state=STATE_VALUE"
echo ""
echo "IMPORTANT: Verify the 'state' parameter matches the one above!"
echo "Then copy the 'code' parameter and run:"
echo ""
echo "  ./test_pkce_flow.sh exchange YOUR_AUTH_CODE"
echo ""
echo "==============================================="

# Step 2: Exchange authorization code for access token
if [ "$1" == "exchange" ]; then
  if [ -z "$2" ]; then
    echo "Error: Please provide the authorization code"
    echo "Usage: ./test_pkce_flow.sh exchange YOUR_AUTH_CODE"
    exit 1
  fi

  AUTH_CODE="$2"

  echo ""
  echo "Step 2: Token Exchange"
  echo "----------------------------------------------"
  echo "Exchanging authorization code for access token..."
  echo ""

  curl -X POST http://localhost:3000/oauth/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=authorization_code" \
    -d "client_id=${CLIENT_ID}" \
    -d "code=${AUTH_CODE}" \
    -d "redirect_uri=${REDIRECT_URI}" \
    -d "code_verifier=${CODE_VERIFIER}" \
    -v

  echo ""
  echo ""
  echo "If successful, you should see an access_token in the response."
fi

# Test without PKCE (should fail)
if [ "$1" == "test-fail" ]; then
  if [ -z "$2" ]; then
    echo "Error: Please provide the authorization code"
    echo "Usage: ./test_pkce_flow.sh test-fail YOUR_AUTH_CODE"
    exit 1
  fi

  AUTH_CODE="$2"

  echo ""
  echo "Step 2: Token Exchange WITHOUT PKCE (should fail)"
  echo "----------------------------------------------"
  echo "Attempting to exchange without code_verifier..."
  echo ""

  curl -X POST http://localhost:3000/oauth/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=authorization_code" \
    -d "client_id=${CLIENT_ID}" \
    -d "code=${AUTH_CODE}" \
    -d "redirect_uri=${REDIRECT_URI}" \
    -v

  echo ""
  echo ""
  echo "This should fail with an error about missing PKCE."
fi
