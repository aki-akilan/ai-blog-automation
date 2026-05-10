# Credentials Guide

## All Credentials Summary

| Credential | Stored In | Where to Get | Rotation |
|-----------|-----------|-------------|---------|
| `GITHUB_TOKEN` | `.env` only | github.com/settings/tokens | Every 3 months |
| `DEVTO_API_KEY` | `.env` + GitHub Secret | dev.to → Settings → API Keys | Monthly |
| `HASHNODE_TOKEN` | `.env` + GitHub Secret | hashnode.com → Settings → Developer | Monthly |
| `EMAIL_USER` | `.env` + GitHub Secret | Your Gmail address (static) | Never |
| `EMAIL_APP_PASSWORD` | `.env` + GitHub Secret | myaccount.google.com/apppasswords | Monthly |
| `SLACK_WEBHOOK_URL` | `.env` + GitHub Secret | api.slack.com/apps | Every 3 months |
| `GOOGLE_SHEETS_ID` | `.env` + GitHub Secret | Google Sheets URL | Never |

---

## How to Get Each Credential

### GITHUB_TOKEN (Fine-grained PAT)
1. Go to `github.com/settings/tokens?type=beta`
2. Click **Generate new token (beta)**
3. Name: "AI Blog Automation"
4. Repository access: Only select `ai-blog-automation`
5. Permissions: `Contents: Read and Write`, `Actions: Read and Write`
6. Generate → copy token (starts with `github_pat_`)

### DEVTO_API_KEY
1. Log in to `dev.to`
2. Settings → Account → scroll to **DEV API Keys**
3. Enter description "AI Blog Automation" → **Generate API Key**
4. Copy key immediately (shown once)

### HASHNODE_TOKEN
1. Log in to `hashnode.com`
2. Click avatar → **Account Settings**
3. Go to **Developer** tab
4. **Generate New Token** → name "AI Blog"
5. Copy UUID format token

### EMAIL_APP_PASSWORD
1. Ensure 2-Step Verification is ON at `myaccount.google.com/security`
2. Go to `myaccount.google.com/apppasswords`
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: "AI Blog Automation"
6. Click **Generate**
7. Copy the 16-character code (format: `xxxx xxxx xxxx xxxx`)

**WARNING:** Regular Gmail password will NOT work. You'll get `535 5.7.8` error.

### SLACK_WEBHOOK_URL
1. Go to `api.slack.com/apps`
2. Click your app (or Create New App → From scratch)
3. Go to **Incoming Webhooks** → toggle ON
4. Click **Add New Webhook to Workspace**
5. Select channel: `#aiinsightsdaily`
6. Click **Allow**
7. Copy the webhook URL

### GOOGLE_SHEETS_ID
1. Open your Google Sheet
2. URL format: `docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. Copy the `[SHEET_ID]` part
4. Current ID: `1mNCwK827o5Tzv-GzAF-ZcVc27VbgHDbz36UNeCnq1lI`

---

## Storage Best Practices

**Local `.env` file:**
- Always gitignored (verified by `git check-ignore -v .env`)
- Keep a backup in a password manager (1Password, Bitwarden, etc.)
- Never share via email, Slack DM, or paste anywhere

**GitHub Secrets:**
- Encrypted at rest by GitHub
- Only accessible to Actions runs, not visible in logs
- Add at: `github.com/Aki-Akilan/ai-blog-automation/settings/secrets/actions`

**Do NOT:**
- Paste credentials in commit messages
- Add to `.env.example` (use placeholders only)
- Share in Slack or email
- Print/log the values in scripts

---

## Monthly Rotation Schedule

Run this on the **last Sunday of each month**:

```bash
# 1. Rotate Dev.to key
# 2. Rotate Hashnode token
# 3. Rotate Gmail App Password
# 4. Update .env with new values
# 5. Update GitHub Secrets

# 6. Verify everything works
node scripts/test-apis.js
node scripts/send-email.js

# 7. Commit .env.example if any format changed (not values)
```

---

## Security Checklist

```
☐ .env is gitignored: git check-ignore -v .env
☐ No credentials in any committed file: git log -p | grep -i "token\|key\|password" | grep "^+" | grep -v "process.env\|example\|placeholder"
☐ GitHub Secrets are set (not empty)
☐ Slack webhook URL not in code
☐ Gmail App Password is 16 chars (not regular password)
```

---

## If a Credential is Compromised

**Immediately:**
1. Revoke the credential on the platform
2. Generate a new one
3. Update `.env` locally
4. Update GitHub Secret
5. Run `node scripts/test-apis.js`

**If GitHub token was exposed:**
- Also check: `github.com/settings/security-log` for any unauthorized access
- Review: what permissions the token had

**If Gmail App Password was exposed:**
- Check: `myaccount.google.com/device-activity` for suspicious logins
- The App Password only allows sending email, not reading your inbox

---

## Related
- [Emergency Recovery](../workflows/EMERGENCY_RECOVERY.md) — full compromise scenario
- [Deployment Skill](../skills/deployment/SKILL.md) — adding secrets to GitHub
