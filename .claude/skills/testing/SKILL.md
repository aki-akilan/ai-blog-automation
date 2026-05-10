# Skill: Testing

## When to Use
- Before pushing any new script or change
- After fixing a bug (verify fix works)
- Before first live deployment
- Adding a new platform or feature
- Monthly smoke test to ensure everything still works

---

## Testing Pyramid

```
        ┌──────────────┐
        │   E2E Test   │  → Full pipeline (Phase 6 style)
        ├──────────────┤
        │ Integration  │  → Test_mode=true, real APIs
        ├──────────────┤
        │  Unit / Dry  │  → Individual scripts, no side effects
        └──────────────┘
```

---

## Level 1: Dry-Run Tests (no side effects)

Run these anytime — they make no changes to any platform:

```bash
# 1. Verify all credentials are present
node -e "
require('dotenv').config();
['DEVTO_API_KEY','HASHNODE_TOKEN','EMAIL_USER','EMAIL_APP_PASSWORD','SLACK_WEBHOOK_URL']
.forEach(k => console.log((process.env[k]?'✅':'❌') + ' ' + k));
"

# 2. Fetch live news
node scripts/fetch-news.js
# Expected: "✅ Done! 15 AI news items saved"

# 3. Test API auth (no posting)
node scripts/test-apis.js
# Expected: both platforms ✅ HTTP 200

# 4. Optimize existing post (uses sample data)
node scripts/optimize-post.js
# Expected: "✅ Optimized post saved"

# 5. Test Slack notifications
node scripts/notify-slack.js
# Expected: 5 notifications in #aiinsightsdaily
```

---

## Level 2: Integration Tests (real APIs, safe)

These use real credentials but either send to yourself or save as drafts:

```bash
# Send test email (real email, goes to aiinsightsdaily0406@gmail.com)
TEST_MODE=true node scripts/send-email.js

# Post as draft to Dev.to (not published, [TEST] prefix)
TEST_MODE=true node scripts/post-to-devto.js

# Publish test post to Hashnode ([TEST] prefix)
TEST_MODE=true node scripts/post-to-hashnode.js

# Run full publish pipeline in test mode
TEST_MODE=true node scripts/post-to-platforms.js
```

**After TEST_MODE runs:** Delete the test posts from Dev.to dashboard and Hashnode.

---

## Level 3: Full End-to-End (live run)

Only run when you're confident everything works:

```bash
# Full pipeline (POSTS REAL CONTENT LIVE)
npm run run-all

# Or step by step:
node scripts/fetch-news.js
# (skip generate-post.js locally — needs Ollama)
node scripts/optimize-post.js
node scripts/post-to-platforms.js   # LIVE post
node scripts/send-email.js
node scripts/log-analytics.js
node scripts/dashboard.js
```

---

## Pre-Deployment Checklist

Before pushing to GitHub and enabling automation:

```
☐ node scripts/test-apis.js          → both ✅
☐ node scripts/fetch-news.js         → ≥ 5 articles
☐ TEST_MODE=true node scripts/post-to-platforms.js  → 2/2 platforms
☐ node scripts/send-email.js         → email received
☐ node scripts/notify-slack.js       → Slack messages appear
☐ .env is gitignored: git check-ignore -v .env
☐ No hardcoded credentials in any file
☐ package-lock.json committed
☐ .github/workflows/daily-post.yml has no YAML syntax errors
```

---

## Testing Individual Components

### Test RSS Feeds Only
```bash
node -e "
const Parser = require('rss-parser');
const feeds = require('./config/feeds.json');
const parser = new Parser({ timeout: 10000 });
feeds.feeds.forEach(f => {
  parser.parseURL(f.url)
    .then(r => console.log('✅', f.name, r.items.length, 'items'))
    .catch(e => console.log('❌', f.name, e.message));
});
"
```

### Test Ollama Connection (if installed locally)
```bash
curl -s http://localhost:11434/api/tags | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('Models:', d.models?.map(m=>m.name).join(', ') || 'none');
"
```

### Test Email Template Rendering
```bash
node -e "
require('dotenv').config();
const { buildHtml } = require('./scripts/send-email'); // if exported
// Verify template renders without errors
"
```

### Validate Config Files
```bash
node -e "
['config/feeds.json','config/prompts.json'].forEach(f => {
  try { JSON.parse(require('fs').readFileSync(f)); console.log('✅', f); }
  catch(e) { console.log('❌', f, e.message); }
});
"
```

---

## Test Data Patterns

When testing without real news data, use the sample post:
```bash
# The sample post created during Phase 2 still works for testing
ls data/today-post.md      # should exist
ls data/optimized-post.md  # should exist
ls data/post-meta.json     # should exist
```

If they don't exist:
```bash
# Fetch fresh news first
node scripts/fetch-news.js
# Then use existing today-post.md or manually create one
```

---

## Continuous Testing (After Each Change)

When modifying a script, always run:
1. The script itself: `node scripts/changed-file.js`
2. Any script that depends on its output
3. `node scripts/test-apis.js` if touching auth

**Minimal test after ANY change:**
```bash
node scripts/test-apis.js && echo "✅ APIs still working"
```

---

## Test Report Location

Full Phase 6 test results: `tests/test-report.md`

To run a fresh Phase 6 style test:
```bash
echo "Pre-flight:" && node scripts/test-apis.js
echo "Fetch:" && node scripts/fetch-news.js
echo "Optimize:" && node scripts/optimize-post.js
echo "Publish (TEST):" && TEST_MODE=true node scripts/post-to-platforms.js
echo "Email:" && node scripts/send-email.js
echo "Analytics:" && node scripts/log-analytics.js
echo "Dashboard:" && node scripts/dashboard.js
echo "✅ All steps completed"
```

---

## Related Skills
- [Debugging](../debugging/SKILL.md) — when tests fail
- [Deployment](../deployment/SKILL.md) — deploying after tests pass
- [Platform Posting](../platform-posting/SKILL.md) — platform-specific test patterns
