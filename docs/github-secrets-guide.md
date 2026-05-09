# GitHub Secrets Setup Guide

Add these secrets to your GitHub repository before the first run.

## Where to add them

1. Go to your repo on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each one below

---

## Required Secrets

| Secret Name | Value | Where to get it |
|-------------|-------|----------------|
| `DEVTO_API_KEY` | Your Dev.to API key | dev.to → Settings → Account → API Keys |
| `HASHNODE_TOKEN` | Your Hashnode PAT | hashnode.com → Account Settings → Developer |
| `EMAIL_USER` | `aiinsightsdaily0406@gmail.com` | Your Gmail address |
| `EMAIL_APP_PASSWORD` | 16-char Gmail App Password | myaccount.google.com/apppasswords |

## Optional Secrets

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `GOOGLE_SHEETS_ID` | Sheet ID from URL | Analytics backup to Google Sheets |

> Note: `GITHUB_TOKEN` is auto-provided by GitHub Actions — do NOT add it manually.

---

## Step-by-Step

### DEVTO_API_KEY
1. Log in to [dev.to](https://dev.to)
2. Go to **Settings** → **Account** → scroll to **DEV API Keys**
3. Enter a description (e.g. "AI Blog Automation") → **Generate API Key**
4. Copy the key → paste as `DEVTO_API_KEY`

### HASHNODE_TOKEN
1. Log in to [hashnode.com](https://hashnode.com)
2. Click your avatar → **Account Settings**
3. Go to **Developer** tab
4. Click **Generate New Token** → name it "AI Blog"
5. Copy the token → paste as `HASHNODE_TOKEN`

### EMAIL_APP_PASSWORD
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select app: **Mail** → device: **Other** → name: "AI Blog"
5. Copy the 16-character code → paste as `EMAIL_APP_PASSWORD`

---

## Verify secrets are set

After adding all secrets, your Secrets page should show:

```
✓ DEVTO_API_KEY
✓ HASHNODE_TOKEN
✓ EMAIL_USER
✓ EMAIL_APP_PASSWORD
✓ GOOGLE_SHEETS_ID  (optional)
```

---

## Test with a manual run

1. Go to **Actions** tab in your repo
2. Click **Daily Blog Post** workflow
3. Click **Run workflow** → set **test_mode** to `true` → **Run workflow**
4. Watch the logs — each step should show ✅
5. Check your email for the notification

Once the manual test passes, the workflow runs automatically at **6:00 AM IST** every day.
