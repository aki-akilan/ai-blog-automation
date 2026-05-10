# Skill: Platform Posting

## When to Use
- Adding a new publishing platform
- Debugging why a post didn't publish
- Understanding API authentication patterns
- Changing post format or tags for a platform
- Testing without publishing (dry run)

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| `data/optimized-post.md` exists | Run optimize-post.js first |
| `data/post-meta.json` exists | Run optimize-post.js first |
| API credentials in `.env` | `node scripts/test-apis.js` |
| Hashnode blog created | hashnode.com → Create Blog |

---

## Universal Platform Pattern

Every platform script follows this structure:

```javascript
// 1. Load post data
function loadPostData() { /* reads optimized-post.md + post-meta.json */ }

// 2. Strip frontmatter (--- ... ---)
function stripFrontmatter(content) { /* removes YAML header */ }

// 3. API call with retry
async function postToPlatform(content, meta, retryCount = 0) {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: { auth },
      timeout: 30000
    });
    return { success: true, url: response.data.url };
  } catch (err) {
    if (retryCount < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAY_MS);
      return postToPlatform(content, meta, retryCount + 1);
    }
    throw new Error(`Failed after ${MAX_RETRIES} attempts`);
  }
}

// 4. Save result
fs.writeFileSync('data/platform-result.json', JSON.stringify(result));

// 5. Export main for use by post-to-platforms.js
module.exports = { main };
```

---

## Dev.to Implementation

**API:** `POST https://dev.to/api/articles`  
**Auth:** `api-key` header  
**Docs:** developers.forem.com/api

```javascript
// Key payload fields
{
  article: {
    title: meta.title,
    body_markdown: bodyMarkdown,    // stripped of frontmatter
    published: !isTestMode,         // false = draft in TEST_MODE
    description: meta.metaDescription,
    tags: meta.tags.slice(0, 4),   // Dev.to max 4 tags
    canonical_url: null
  }
}
```

**TEST_MODE behaviour:** saves as draft (not published), adds `[TEST]` prefix to title  
**Result file:** `data/devto-result.json` → `{ success, id, url, published }`

**Common errors:**
| HTTP | Meaning | Fix |
|------|---------|-----|
| 401 | Invalid API key | Regenerate at dev.to → Settings → API Keys |
| 422 | Duplicate title | Change title or delete old draft |
| 429 | Rate limited | Wait 1 hour |

---

## Hashnode Implementation

**API:** `POST https://gql.hashnode.com/` (GraphQL)  
**Auth:** `Authorization` header (Bearer token)  
**Docs:** apidocs.hashnode.com

**Two-step process:**
1. Query publication ID: `me { publications(first: 1) { edges { node { id } } } }`
2. Publish: `mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id url } } }`

```javascript
// Key input fields
{
  title: meta.title,
  contentMarkdown: bodyMarkdown,
  publicationId: "69ffbfa5e3eebc2e20068ab3",  // fetched dynamically
  tags: meta.tags.slice(0, 5).map(t => ({ slug: t, name: t }))
}
```

**Result file:** `data/hashnode-result.json` → `{ success, id, url, publishedAt }`

**Common errors:**
| Error | Meaning | Fix |
|-------|---------|-----|
| `No publication found` | Blog not created | Go to hashnode.com → Create Blog |
| `Unauthorized` | Invalid token | Regenerate at hashnode.com → Settings → Developer |
| GraphQL errors array | Validation failed | Check `tags` format — must be `{ slug, name }` |

---

## Master Script (post-to-platforms.js)

Runs both platforms in parallel:
```javascript
const [devtoResult, hashnodeResult] = await Promise.allSettled([
  postToDevTo(),
  postToHashnode()
]);
```

`Promise.allSettled` (not `Promise.all`) means one failure doesn't stop the other.  
Result: `data/publish-results.json` → `{ devto, hashnode, errors[], publishedAt }`

---

## How to Add a New Platform

1. **Copy the template:**
```bash
cp .claude/templates/new-platform.js scripts/post-to-[platform].js
```

2. **Implement the 5-step pattern** above

3. **Add to post-to-platforms.js:**
```javascript
const { main: postToNewPlatform } = require('./post-to-newplatform');

const [devtoResult, hashnodeResult, newResult] = await Promise.allSettled([
  postToDevTo(),
  postToHashnode(),
  postToNewPlatform()
]);
```

4. **Add credential to `.env` and GitHub Secrets**

5. **Add to `docs/github-secrets-guide.md`**

6. **Test:** `node scripts/test-apis.js` (add the new platform's auth check)

7. **Create ADR** in `DECISIONS.md` (next: ADR-009)

---

## Dry Run Testing

```bash
# Test auth only (no posting)
node scripts/test-apis.js

# Test with draft (TEST_MODE)
TEST_MODE=true node scripts/post-to-platforms.js

# Test individual platform
TEST_MODE=true node scripts/post-to-devto.js
TEST_MODE=true node scripts/post-to-hashnode.js
```

---

## Files Involved

| File | Role |
|------|------|
| `scripts/post-to-devto.js` | Dev.to REST publisher |
| `scripts/post-to-hashnode.js` | Hashnode GraphQL publisher |
| `scripts/post-to-platforms.js` | Parallel master script |
| `scripts/test-apis.js` | Dry-run auth checker |
| `data/optimized-post.md` | Input: post content |
| `data/post-meta.json` | Input: title, tags, description |
| `data/devto-result.json` | Output: Dev.to result |
| `data/hashnode-result.json` | Output: Hashnode result |
| `data/publish-results.json` | Output: combined results |

---

## Related Skills
- [Content Generation](../content-generation/SKILL.md) — produces the input
- [Debugging](../debugging/SKILL.md) — fix publish failures
- [Deployment](../deployment/SKILL.md) — secrets + workflow config
