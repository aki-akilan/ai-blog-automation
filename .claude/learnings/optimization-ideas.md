# Optimization Ideas

> Performance improvements, code enhancements, and process optimizations to consider.
> Sorted by effort vs impact. Implement when the time is right.

---

## 🔴 High Impact, Low Effort

### OPT-001: Switch to phi3:mini for faster generation
**Problem:** Mistral 7B takes 3-5 min on GitHub Actions. Risk of timeout.  
**Solution:** Switch to `phi3:mini` (3.8B params) — 2-3x faster, slightly lower quality.  
**Effort:** 30 minutes (change model name in generate-post.js + workflow)  
**Impact:** Cuts generation from 4 min to ~1.5 min. Much safer timeout headroom.  
**Trade-off:** Slightly less nuanced writing. Test quality first.

### OPT-002: Cache Ollama model between runs
**Problem:** Every GitHub Actions run downloads mistral (~4GB). Takes 3 min.  
**Solution:** Use GitHub Actions cache for the Ollama models directory.  
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.ollama/models
    key: ollama-mistral-${{ hashFiles('.ollama-version') }}
```
**Effort:** 1 hour  
**Impact:** Saves 3 min per run. First run still slow, subsequent runs much faster.

### OPT-003: Pre-filter RSS items by recency
**Problem:** Old articles (> 24 hours) sometimes appear in feeds.  
**Solution:** Filter news items older than 24 hours in `fetch-news.js`.  
```javascript
.filter(item => {
  const age = Date.now() - new Date(item.pubDate).getTime();
  return age < 86400000; // 24 hours
})
```
**Effort:** 15 minutes  
**Impact:** Posts are always about genuinely current news.

---

## 🟡 High Impact, Medium Effort

### OPT-004: Add post deduplication check
**Problem:** If two runs happen on the same day (manual + scheduled), the same article might get published twice.  
**Solution:** Before publishing, check `analytics.json` for today's date. Skip if already published.  
```javascript
const today = new Date().toISOString().slice(0, 10);
const alreadyPublished = analytics.entries.some(e => e.date.startsWith(today));
if (alreadyPublished) { console.log('Already published today — skipping'); process.exit(0); }
```
**Effort:** 2 hours  
**Impact:** Prevents duplicate posts, important when testing manually.

### OPT-005: Add more RSS feeds for diversity
**Problem:** Current 5 feeds can have overlapping stories (especially TechCrunch + The Verge).  
**Solution:** Add 3-4 more diverse feeds:
- `https://www.wired.com/feed/tag/artificial-intelligence/rss`
- `https://arstechnica.com/gadgets/feed/`
- `https://www.infoq.com/ai-ml-data-eng/rss/`  
**Effort:** 30 minutes  
**Impact:** More diverse angles, less repeated content across platforms.

### OPT-006: Quality score for generated post
**Problem:** No way to know if today's post is good before publishing.  
**Solution:** After generation, score the post on: word count, H2 count, keyword density, uniqueness vs yesterday's post. Log score in analytics.  
**Effort:** 3 hours  
**Impact:** Can alert on low-quality days, flag for manual review.

### OPT-007: Retry with different angle on poor generation
**Problem:** Sometimes Ollama generates a thin post (< 500 words).  
**Solution:** If word count < 500, automatically retry with the `seoOptimized` prompt style.  
```javascript
if (wordCount < 500) {
  console.log('⚠ Short post detected, retrying with SEO style...');
  return generateWithStyle('seoOptimized');
}
```
**Effort:** 2 hours  
**Impact:** Automatic quality recovery without manual intervention.

---

## 🟢 Medium Impact, Medium Effort

### OPT-008: Add canonical URL to Dev.to posts
**Problem:** Dev.to posts don't have a canonical URL pointing to themselves.  
**Solution:** After publishing, update the Dev.to article with its own URL as canonical.  
**Impact:** Minor SEO improvement. Prevents duplicate content issues.

### OPT-009: Compress and optimize notification messages
**Problem:** Slack article notification sends multiple messages for long posts.  
**Solution:** Truncate article to first 3 sections + CTA in Slack. Link to full post URL.  
**Impact:** Cleaner Slack channel, fewer messages.

### OPT-010: Add post tags based on news source categories
**Problem:** Tags are generated from content keywords only.  
**Solution:** If all selected articles are from `category: research`, add `research` tag. Use `config/feeds.json` category.  
**Impact:** Better tag diversity, more accurate categorization.

---

## 🔵 Low Impact, Low Effort (Quick Wins)

### OPT-011: Log generation time per run
**What:** Add `generationTimeMs` to analytics entry.  
**Why:** Track if generation is getting slower over time (model drift, runner degradation).

### OPT-012: Add post URL to analytics
**What:** Already done for Dev.to + Hashnode. Add Medium URL when manually imported.  
**Why:** Complete record of all published URLs per day.

### OPT-013: Better Slack message on partial failure
**What:** If 1/2 platforms fails, Slack currently just shows the successful one.  
**Solution:** Add a warning badge for the failed platform with the error reason.

### OPT-014: Validate frontmatter before publishing
**What:** Quick check that `post-meta.json` has non-empty title, tags array, description.  
**Why:** Catch optimize-post.js failures before they cause bad API calls.
