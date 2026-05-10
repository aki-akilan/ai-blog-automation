# Skill: Deployment

## When to Use
- First-time setup on a new machine
- Adding a new GitHub Secret
- Updating the workflow schedule or steps
- Pushing a new feature to production
- Checking why Actions isn't triggering

---

## GitHub Actions Setup

### Required Secrets
Go to: `github.com/Aki-Akilan/ai-blog-automation/settings/secrets/actions`

| Secret | Value Source | Required |
|--------|-------------|----------|
| `DEVTO_API_KEY` | dev.to → Settings → API Keys | ✅ |
| `HASHNODE_TOKEN` | hashnode.com → Settings → Developer | ✅ |
| `EMAIL_USER` | your Gmail address | ✅ |
| `EMAIL_APP_PASSWORD` | myaccount.google.com/apppasswords | ✅ |
| `SLACK_WEBHOOK_URL` | api.slack.com/apps → Incoming Webhooks | ✅ |
| `GOOGLE_SHEETS_ID` | Google Sheets URL → extract ID | Optional |

### Push Secrets Programmatically
```bash
# Requires tweetsodium installed
node -e "/* secrets push script */"

# Or use helper script (requires gh CLI)
bash scripts/setup-github-secrets.sh
```

---

## First-Time Deployment Checklist

```
☐ 1. GitHub repo created (github.com/Aki-Akilan/ai-blog-automation)
☐ 2. All commits pushed: git push -u origin main
☐ 3. All 5 secrets added to GitHub (verify at settings/secrets/actions)
☐ 4. Hashnode blog created (hashnode.com → Create Blog)
☐ 5. Gmail App Password generated (not regular password)
☐ 6. Slack app created + webhook URL set for #aiinsightsdaily
☐ 7. Test run triggered: Actions → Daily Blog Post → Run workflow → test_mode: true
☐ 8. Verified: Slack notification received
☐ 9. Verified: Email received
☐ 10. Verified: Dev.to draft saved, Hashnode post created
```

---

## Workflow Schedule

**Current:** `30 6 * * *` = **12:00 PM IST** (06:30 UTC)

To change schedule:
```yaml
# .github/workflows/daily-post.yml
- cron: '30 6 * * *'   # 12 PM IST
- cron: '30 1 * * *'   # 7 AM IST
- cron: '30 3 * * *'   # 9 AM IST
```

IST to UTC conversion: subtract 5 hours 30 minutes.
`HH:MM IST` → `HH-5:MM-30 UTC` (adjust for midnight overflow)

---

## Manual Trigger

Via GitHub UI:
1. `github.com/Aki-Akilan/ai-blog-automation/actions`
2. Click **Daily Blog Post**
3. Click **Run workflow**
4. Set inputs:
   - `test_mode`: `true` (draft) or `false` (live)
   - `prompt_style`: `default` / `tutorial` / `newsSummary` / `seoOptimized`

Via API (after workflow is recognized):
```bash
GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' .env | cut -d'=' -f2)
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/Aki-Akilan/ai-blog-automation/actions/workflows/daily-post.yml/dispatches" \
  -d '{"ref":"main","inputs":{"test_mode":"false","prompt_style":"default"}}'
```

**Note:** API dispatch only works ~2-3 minutes after a fresh push to a new repo.

---

## Pushing Code Changes

```bash
# Always verify .env is ignored before pushing
git check-ignore -v .env   # must show: .gitignore:2:.env

# Stage only specific files (never use git add .)
git add scripts/new-feature.js config/feeds.json

# Commit with clear message
git commit -m "feat: describe what changed and why"

# Push
GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' .env | cut -d'=' -f2)
git push https://${GITHUB_TOKEN}@github.com/Aki-Akilan/ai-blog-automation.git main
```

**Push blocked by GitHub secret scanner?**
- Remove the secret from the file
- Or use the bypass URL GitHub provides
- Or rewrite history: `git filter-branch --tree-filter '...' HEAD`

---

## Monitoring a Deployment

1. Go to Actions tab: `github.com/Aki-Akilan/ai-blog-automation/actions`
2. Click the running workflow
3. Watch step-by-step progress
4. Check Slack `#aiinsightsdaily` for:
   - "🚀 Automation Started" → workflow began
   - "✅ Post Published" → platform posting done
   - "📧 Email Sent" → email delivered
   - "📄 Full Article" → article posted to Slack
5. Check email for notification

**Normal run timeline:**
```
0:00  → npm ci, Slack started
0:30  → Ollama installing
3:00  → mistral model pulled, generation starts
7:00  → post generated, optimize + publish (fast)
8:00  → email + Slack notifications
8:30  → analytics committed, run complete
```

---

## Rollback Procedures

**If a bad version was deployed:**
```bash
# Find last good commit
git log --oneline

# Revert to previous commit
git revert HEAD
git push https://${GITHUB_TOKEN}@github.com/Aki-Akilan/ai-blog-automation.git main
```

**If secrets were exposed:**
1. Immediately revoke on the platform (Dev.to, Hashnode, Google, Slack)
2. Generate new credentials
3. Update `.env` locally
4. Update all GitHub Secrets
5. Run `node scripts/test-apis.js` to confirm

**If workflow YAML is broken:**
1. Check Actions tab for the error (shows exact line number)
2. Common fix: `run: |` block scalar for commands with `{}`
3. Push fixed YAML, workflow auto-reloads

---

## Common Deployment Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Push rejected (secret scanner) | Credential pattern in committed file | Fix file, new commit, push again |
| Workflow not recognized | Delay after first push | Wait 2-3 min, trigger from UI |
| YAML syntax error line X | `{` in inline `run:` | Use `run: \|` block scalar |
| Secrets not found in Actions | Wrong secret name (case sensitive) | Check exact names match workflow env |
| `npm ci` fails | package-lock.json missing | Run `npm install` locally first, commit lock file |

---

## Related Skills
- [Debugging](../debugging/SKILL.md) — fix failing deployments
- [Testing](../testing/SKILL.md) — verify before going live
