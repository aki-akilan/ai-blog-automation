# Skill: Debugging

## When to Use
- GitHub Actions run failed
- Post didn't publish to one or both platforms
- Email not received
- Slack notification missing
- Same post published repeatedly
- Analytics not updating

---

## Diagnostic Flowchart

```
Automation failed?
       │
       ├── Check GitHub Actions log
       │         │
       │    Which step failed?
       │         │
       ├── fetch-news → [RSS Issue]
       ├── generate-post → [Ollama Issue]
       ├── optimize-post → [File Issue]
       ├── post-to-platforms → [API Issue]
       ├── send-email → [SMTP Issue]
       └── notify-slack → [Webhook Issue] (non-fatal)
```

**First check:** `https://github.com/Aki-Akilan/ai-blog-automation/actions`

---

## Issue Catalog

### 🔴 Email Not Sending

**Symptoms:** Step 5 fails, no email received, error contains "Invalid login"  
**Cause:** Gmail App Password expired or wrong  
**Fix:**
1. Go to `myaccount.google.com/apppasswords`
2. Revoke old password, generate new one
3. Update `.env`: `EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx`
4. Update GitHub Secret: `EMAIL_APP_PASSWORD`
5. Test: `node scripts/send-email.js`

**Note:** Regular Gmail password will ALWAYS fail. Must be App Password (16 chars).

---

### 🔴 Dev.to API Authentication Failed

**Symptoms:** HTTP 401, "Invalid API key"  
**Cause:** API key expired or wrong  
**Fix:**
1. Go to `dev.to/settings/account` → API Keys section
2. Generate new key → copy it
3. Update `.env`: `DEVTO_API_KEY=new_key_here`
4. Update GitHub Secret: `DEVTO_API_KEY`
5. Test: `node scripts/test-apis.js`

---

### 🔴 Hashnode "No publication found"

**Symptoms:** `Error: No Hashnode publication found for this token`  
**Cause A:** Blog not created on Hashnode  
**Fix A:** Go to hashnode.com → click avatar → Create Blog  
**Cause B:** Token belongs to different account  
**Fix B:** Regenerate token: hashnode.com → Settings → Developer  

---

### 🔴 Ollama Timeout

**Symptoms:** `timeout of 480000ms exceeded` after 8 minutes  
**Cause:** Mistral 7B generation too slow on GitHub Actions free runner  
**Fix options (in order of preference):**

Option 1 — Reduce output tokens:
```javascript
// scripts/generate-post.js
num_predict: 1000  // was 1500
```

Option 2 — Use smaller model (faster):
```yaml
# .github/workflows/daily-post.yml
ollama pull phi3:mini   # 3.8B params, much faster
```
Update `generate-post.js` model: `model: 'phi3:mini'`

Option 3 — Increase timeout (last resort):
```javascript
// scripts/generate-post.js
}, { timeout: 600000 });  // 10 minutes
```
Also update `timeout-minutes: 35` in workflow.

---

### 🔴 GitHub Actions Workflow Not Triggering

**Symptoms:** Cron doesn't fire at 12 PM IST, manual dispatch fails  
**Cause A:** Workflow YAML syntax error  
**Check:** GitHub → repo → Actions → click workflow → look for red ×  
**Fix A:** Check `.github/workflows/daily-post.yml` for YAML errors  
**Common YAML error:** Curly braces `{` in inline `run:` value — use `run: |` block scalar

**Cause B:** `workflow_dispatch` not recognized immediately  
**Fix B:** Wait 2-3 minutes after push, then trigger from Actions UI

**Cause C:** GitHub Actions disabled for repo  
**Fix C:** GitHub → repo → Settings → Actions → Allow all actions

---

### 🟡 RSS Feed Errors (Partial)

**Symptoms:** `⚠ [Feed Name]: Failed (502) — skipping`  
**Cause:** RSS feed temporarily down  
**Impact:** Low — other feeds continue, still get 10-14 articles  
**Fix:** No action needed, feeds self-recover. If persistent > 3 days:
```json
// config/feeds.json — replace broken feed URL
{ "name": "New Feed", "url": "https://new-rss-url/feed" }
```

---

### 🟡 Ollama Not Ready When Script Runs

**Symptoms:** `Error: connect ECONNREFUSED 127.0.0.1:11434` in generate-post  
**Cause:** Ollama started but not ready before health check loop finished  
**Fix:** Increase max wait in workflow health check:
```yaml
for i in $(seq 1 60);  # was 30 — doubles wait time to 3 min
```

---

### 🟡 Same Post Published Every Run

**Symptoms:** Title and content identical across multiple runs  
**Cause:** Date/angle injection not working OR `today-post.md` cached  
**Fix A:** Verify `generate-post.js` has `uniquenessHeader` injected into prompt  
**Fix B:** Check `data/today-post.md` is in `.gitignore` (not committed to repo)  
```bash
git check-ignore -v data/today-post.md  # should output: .gitignore:N:... data/...
```

---

### 🟡 Hashnode Post Missing Tags

**Symptoms:** Post published but with no tags  
**Cause:** Tags passed as strings instead of `{ slug, name }` objects  
**Fix:** Verify `post-to-hashnode.js` tags format:
```javascript
tags: meta.tags.slice(0, 5).map(t => ({ slug: t, name: t }))
```

---

### 🟢 Slack Notification Not Appearing

**Symptoms:** No message in `#aiinsightsdaily`  
**Cause A:** Webhook URL changed or revoked  
**Fix:** Regenerate at api.slack.com/apps → your app → Incoming Webhooks  
Update `.env` and GitHub Secret: `SLACK_WEBHOOK_URL`

**Cause B:** Slack app removed from channel  
**Fix:** In Slack → `#aiinsightsdaily` → Integrations → Add app

**Note:** Slack failures are **non-fatal** — pipeline continues regardless.

---

### 🟢 Analytics Not Updating

**Symptoms:** `data/analytics.json` not committed, dashboard not updated  
**Cause:** Git push step failing in workflow  
**Check:** Workflow "Commit data files" step logs  
**Common cause:** No changes to commit (first run after fresh clone)  
**Fix:** This is normal on first run — the `|| true` handles empty commits.

---

## Log Analysis Tips

**In GitHub Actions logs, look for:**
```
✅ → step succeeded
❌ → step failed (check line above for error)
⚠  → warning, non-fatal
HTTP 4xx → authentication or validation issue
HTTP 5xx → platform API issue, retry later
timeout  → increase timeout or use smaller model
ECONNREFUSED → service not started (Ollama)
```

**Key log lines to check:**
```
"✅ Done! 15 AI news items saved"     ← fetch-news OK
"Ollama is ready (attempt X)"          ← Ollama health check passed
"✓ Generated in Xs"                   ← generation completed
"✅ Dev.to post published!"            ← Dev.to OK
"✅ Hashnode post published!"          ← Hashnode OK
"✅ Email sent successfully!"          ← email OK
```

---

## When to Manually Post

If automation fails and you need to publish today:
1. Check `data/optimized-post.md` exists (may be in last push)
2. Copy content → paste to Dev.to manually
3. Use `medium.com/p/import` with Dev.to URL for Medium
4. Go to `aiinsightsdaily.hashnode.dev/new` → paste content

---

## Related Skills
- [Deployment](../deployment/SKILL.md) — secrets + workflow issues
- [Testing](../testing/SKILL.md) — verify fix works before next run
