# Workflow: Add New Platform

## When to Add a Platform

Add a platform when:
- It has a free, documented API for creating posts
- It has a meaningful developer/tech audience
- The integration effort is < 1 day

Current candidates: Twitter/X, LinkedIn, Reddit, Substack, Ghost

---

## Decision Criteria

Before adding, answer:
1. Does it have a free API for publishing? (Medium does NOT)
2. Does the audience match AI/tech content?
3. Is there a working Node.js client or simple REST/GraphQL API?
4. Will it add meaningful reach or income?

---

## Step-by-Step Implementation

### Step 1 — Get API credentials
- Create account on the platform
- Generate API token / OAuth credentials
- Test auth manually with `curl` or Postman
- Note: endpoint, auth method, payload format

### Step 2 — Create the script
```bash
cp .claude/templates/new-platform.js scripts/post-to-[platform].js
```

Fill in:
- `PLATFORM_API_URL`
- Auth header format
- Payload structure (title, body, tags)
- Result format `{ success, url, id }`

### Step 3 — Add credentials to .env
```bash
# .env
PLATFORM_TOKEN=your-token-here
```

### Step 4 — Add to post-to-platforms.js
```javascript
const { main: postToNewPlatform } = require('./post-to-newplatform');

const [devtoResult, hashnodeResult, newPlatformResult] = await Promise.allSettled([
  postToDevTo(),
  postToHashnode(),
  postToNewPlatform()
]);
```

Handle the result:
```javascript
if (newPlatformResult.status === 'fulfilled') {
  results.newplatform = newPlatformResult.value;
  console.log(chalk.green(`  ✓ NewPlatform: ${newPlatformResult.value.url}`));
} else {
  results.errors.push({ platform: 'newplatform', error: newPlatformResult.reason?.message });
}
```

### Step 5 — Add to test-apis.js
```javascript
async function testNewPlatform() {
  try {
    const response = await axios.get('https://platform.com/api/me', {
      headers: { 'Authorization': `Bearer ${process.env.PLATFORM_TOKEN}` },
      timeout: 10000
    });
    return { ok: true, status: 200, message: `Auth OK — user: ${response.data.username}` };
  } catch (err) {
    return { ok: false, status: err.response?.status, message: err.message };
  }
}
```

### Step 6 — Add GitHub Secret
```
Name: PLATFORM_TOKEN
Value: your-token-here
```
At: `github.com/Aki-Akilan/ai-blog-automation/settings/secrets/actions`

Update `docs/github-secrets-guide.md` with the new secret.

### Step 7 — Add to workflow env
```yaml
# .github/workflows/daily-post.yml
env:
  PLATFORM_TOKEN: ${{ secrets.PLATFORM_TOKEN }}
```

### Step 8 — Update notify-slack.js
Add the new platform URL to `notifyPublished()`:
```javascript
{ type: 'mrkdwn', text: `*🆕 NewPlatform:*\n${newPlatformUrl ? `<${newPlatformUrl}|View>` : '_Not published_'}` }
```

### Step 9 — Update email template
Add a status badge and link button for the new platform in `templates/email-template.html`.

### Step 10 — Test and document
```bash
node scripts/test-apis.js          # verify auth
TEST_MODE=true node scripts/post-to-platforms.js  # test post
```

Create ADR in `DECISIONS.md` (next number from `.claude-config.json`).
Update `.claude-config.json` features array.

---

## Going Live Checklist

```
☐ Script created and tested
☐ Credentials in .env and GitHub Secrets
☐ post-to-platforms.js updated
☐ test-apis.js updated
☐ notify-slack.js updated
☐ email-template.html updated
☐ docs/github-secrets-guide.md updated
☐ ADR created in DECISIONS.md
☐ .claude-config.json features updated
☐ SKILL.md created in .claude/skills/platform-posting/
☐ TEST_MODE=true run verified
☐ Live run verified
```

---

## Related
- [Platform Posting Skill](../skills/platform-posting/SKILL.md)
- [DECISIONS.md](../DECISIONS.md)
- [templates/new-platform.js](../templates/new-platform.js)
