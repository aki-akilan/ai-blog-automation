# Workflow: Debug a Failed Post

## Step 1 — Identify What Failed

Go to: `github.com/Aki-Akilan/ai-blog-automation/actions`

Click the failed run. Find the step with a red ×.

```
✅ Checkout
✅ Setup Node.js
✅ Install dependencies
✅ Notify Slack — started
✅ Install Ollama
✅ Start Ollama and pull mistral
✅ Step 1 — Fetch AI news
❌ Step 2 — Generate blog post   ← failed here
```

---

## Step 2 — Read the Error

Expand the failed step. Look for:

| Error Pattern | Go To |
|---------------|-------|
| `timeout of 480000ms` | [Ollama Timeout Fix](#ollama-timeout) |
| `ECONNREFUSED 127.0.0.1:11434` | [Ollama Not Ready Fix](#ollama-not-ready) |
| `Invalid login` / `535` | [Email Auth Fix](#email-auth) |
| `401` + `api-key` | [Dev.to Auth Fix](#devto-auth) |
| `Unauthorized` + Hashnode | [Hashnode Auth Fix](#hashnode-auth) |
| `No publication found` | [Hashnode Blog Fix](#hashnode-blog) |
| `YAML syntax error` | [Workflow YAML Fix](#yaml-fix) |
| `Cannot find module` | [Missing Dependency Fix](#missing-dep) |

---

## Fixes

### <a name="ollama-timeout"></a>Ollama Timeout
```javascript
// scripts/generate-post.js — reduce tokens
num_predict: 1000  // was 1500
```
Or switch to faster model in workflow:
```yaml
ollama pull phi3:mini
```
Update `generate-post.js`: `model: 'phi3:mini'`

---

### <a name="ollama-not-ready"></a>Ollama Not Ready
```yaml
# .github/workflows/daily-post.yml — increase wait iterations
for i in $(seq 1 60);  # was 30
```

---

### <a name="email-auth"></a>Email Auth Failed
1. Go to `myaccount.google.com/apppasswords`
2. Revoke old → generate new App Password
3. Update GitHub Secret: `EMAIL_APP_PASSWORD`
4. Test: `node scripts/send-email.js`

---

### <a name="devto-auth"></a>Dev.to 401
1. Go to `dev.to/settings/account` → API Keys → Generate new
2. Update GitHub Secret: `DEVTO_API_KEY`
3. Test: `node scripts/test-apis.js`

---

### <a name="hashnode-auth"></a>Hashnode Unauthorized
1. Go to `hashnode.com` → Settings → Developer → Generate new token
2. Update GitHub Secret: `HASHNODE_TOKEN`
3. Test: `node scripts/test-apis.js`

---

### <a name="hashnode-blog"></a>Hashnode No Publication
Go to `hashnode.com` → click avatar → Create Blog → complete setup.

---

### <a name="yaml-fix"></a>YAML Syntax Error
GitHub shows the line number. Common cause: `{` in inline `run:` value.
```yaml
# Wrong:
run: node -e "fn({ key: value })"

# Correct:
run: |
  node -e "fn({ key: value })"
```

---

### <a name="missing-dep"></a>Cannot Find Module
```bash
# Check if package is in package.json
cat package.json | grep "module-name"

# If missing, add it:
npm install module-name
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push
```

---

## Step 3 — Apply Fix and Re-Run

After fixing:
1. Push the fix to GitHub
2. Go to Actions → failed run → click **Re-run failed jobs**
3. Or trigger fresh run: Actions → Daily Blog Post → Run workflow

---

## Step 4 — Verify Recovery

Check `#aiinsightsdaily` for:
- ✅ Post Published notification
- 📧 Email received

If still failing after 2 attempts → manual post fallback below.

---

## Manual Post Fallback

When automation can't recover today:

**Dev.to (2 min):**
1. Go to `dev.to/new`
2. Copy content from `data/optimized-post.md` (strip frontmatter)
3. Set title, tags from `data/post-meta.json`
4. Publish

**Hashnode (2 min):**
1. Go to `aiinsightsdaily.hashnode.dev/new`
2. Paste same content
3. Add tags
4. Publish

**Medium (30 sec):**
1. Go to `medium.com/p/import`
2. Paste Dev.to URL → Import → Publish

---

## Related
- [Debugging Skill](../skills/debugging/SKILL.md) — detailed issue catalog
- [Emergency Recovery](./EMERGENCY_RECOVERY.md) — complete failure
