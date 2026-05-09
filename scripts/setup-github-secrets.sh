#!/bin/bash
# Sets GitHub repo secrets from your local .env file using the gh CLI.
# Run once during initial setup: bash scripts/setup-github-secrets.sh

set -e

REPO="Aki-Akilan/ai-blog-automation"

echo ""
echo "🔐 Setting GitHub Secrets for $REPO"
echo ""

# Check gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ gh CLI not found. Install it: https://cli.github.com"
  exit 1
fi

# Check authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ Not logged in to gh. Run: gh auth login"
  exit 1
fi

# Load .env
ENV_FILE="$(dirname "$0")/../.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env not found at $ENV_FILE"
  exit 1
fi

set_secret() {
  local name=$1
  local value=$2
  if [ -z "$value" ]; then
    echo "  ⚠ Skipping $name (empty value)"
    return
  fi
  echo "$value" | gh secret set "$name" --repo "$REPO"
  echo "  ✅ $name set"
}

# Read values from .env
source "$ENV_FILE" 2>/dev/null || true

set_secret "DEVTO_API_KEY"       "$DEVTO_API_KEY"
set_secret "HASHNODE_TOKEN"       "$HASHNODE_TOKEN"
set_secret "EMAIL_USER"           "$EMAIL_USER"
set_secret "EMAIL_APP_PASSWORD"   "$EMAIL_APP_PASSWORD"
set_secret "GOOGLE_SHEETS_ID"     "$GOOGLE_SHEETS_ID"

echo ""
echo "✅ All secrets pushed to $REPO"
echo "   Verify at: https://github.com/$REPO/settings/secrets/actions"
echo ""
