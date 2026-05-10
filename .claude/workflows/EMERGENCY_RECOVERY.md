# Workflow: Emergency Recovery

## When to Use This

Use this workflow when:
- Automation has been failing for 2+ days
- GitHub Actions is completely broken
- Credentials were compromised
- Repo was accidentally deleted or corrupted
- You need to post manually urgently

---

## Level 1 — Quick Manual Post (5 minutes)

When you just need to publish today's post NOW:

### Get content
```bash
# Check if optimized post exists locally
cat data/optimized-post.md

# If not, run locally:
node scripts/fetch-news.js
# (create or paste a post manually if no Ollama)
node scripts/optimize-post.js
```

### Post manually
**Dev.to:**
1. Go to `dev.to/new`
2. Paste content (strip the `---` frontmatter block at top)
3. Set title from `data/post-meta.json`
4. Add tags: `ai, artificialintelligence, machinelearning`
5. Publish → copy URL

**Hashnode:**
1. Go to `aiinsightsdaily.hashnode.dev/new`
2. Paste same content
3. Tags + publish

**Medium:**
1. `medium.com/p/import` → paste Dev.to URL → Import → Publish

**Email yourself:**
```bash
node scripts/send-email.js  # if .env credentials still valid
```

---

## Level 2 — Rebuild GitHub Actions (30 minutes)

When the workflow is broken and needs fixing:

### Check and fix workflow
```bash
# Find the error
# github.com/Aki-Akilan/ai-blog-automation/actions → failed run → expand step

# Fix common issues:
# 1. YAML syntax: use 'run: |' for commands with curly braces
# 2. Missing secret: check settings/secrets/actions
# 3. Timeout: increase num_predict or switch to phi3:mini

# Push fix
git add .github/workflows/daily-post.yml
git commit -m "fix: repair workflow"
GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' .env | cut -d'=' -f2)
git push https://${GITHUB_TOKEN}@github.com/Aki-Akilan/ai-blog-automation.git main
```

### Re-run
Actions → Daily Blog Post → Run workflow → test_mode: false

---

## Level 3 — Credential Revocation (if compromised)

If you suspect any credential was exposed:

**Immediate actions (in order):**

1. **Dev.to API Key**
   - dev.to/settings/account → API Keys → Delete all → Generate new
   - Update `.env` and GitHub Secret `DEVTO_API_KEY`

2. **Hashnode Token**
   - hashnode.com → Settings → Developer → Revoke all → Generate new
   - Update `.env` and GitHub Secret `HASHNODE_TOKEN`

3. **Gmail App Password**
   - myaccount.google.com/apppasswords → Revoke "AI Blog"
   - Generate new App Password
   - Update `.env` and GitHub Secret `EMAIL_APP_PASSWORD`

4. **Slack Webhook**
   - api.slack.com/apps → your app → Incoming Webhooks → Revoke
   - Generate new webhook URL
   - Update `.env` and GitHub Secret `SLACK_WEBHOOK_URL`

5. **GitHub PAT**
   - github.com/settings/tokens → Revoke old token
   - Generate new fine-grained token with `contents: write`, `actions: write`
   - Update `.env` `GITHUB_TOKEN`
   - Update remote URL: `git remote set-url origin https://NEW_TOKEN@github.com/...`

**After rotating all credentials:**
```bash
node scripts/test-apis.js  # verify all APIs working
```

---

## Level 4 — Repo Rebuild (worst case)

If repo is gone or completely corrupted:

### Recreate repo
```bash
# 1. Create new repo
GITHUB_TOKEN=your_token
curl -X POST -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user/repos \
  -d '{"name":"ai-blog-automation","private":false}'

# 2. Reset remote and push
git remote set-url origin https://${GITHUB_TOKEN}@github.com/Aki-Akilan/ai-blog-automation.git
git push -u origin main

# 3. Re-add all secrets (see docs/github-secrets-guide.md)
```

### If local repo also lost
The project was built from scratch in phases. Rebuild using the original setup prompt (`claude-execution-ref-prompt.md` in parent directory).

Key things to recreate first:
1. `.env` with all credentials
2. `package.json` + `npm install`
3. All scripts in `scripts/`
4. `.github/workflows/daily-post.yml`

---

## Backup Strategy

**What is backed up automatically:**
- All code → GitHub repo (committed)
- Analytics data → GitHub repo (committed after each run)
- Dashboard HTML → GitHub repo

**What is NOT backed up:**
- `.env` file (local only, intentionally)
- `data/today-post.md` (runtime, regenerated each run)
- `node_modules/` (recreated by `npm ci`)

**Recommendation:** Keep a local encrypted backup of `.env` in a password manager or secure notes app. It contains all credentials needed to restore the system.

---

## Related
- [Debug Failed Post](./DEBUG_FAILED_POST.md) — for single run failures
- [Deployment Skill](../skills/deployment/SKILL.md) — re-deployment steps
- [Credentials Guide](../context/CREDENTIALS_GUIDE.md) — all credential details
