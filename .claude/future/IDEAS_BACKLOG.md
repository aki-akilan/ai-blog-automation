# Ideas Backlog

> All feature ideas captured here. Prioritized by effort × impact.
> Use `🚀 ADD_FEATURE:` command to implement any of these.

---

## 🔴 Priority 1 — High Value, Low Effort

### IDEA-001: Twitter/X Auto-Post Thread
**What:** After publishing, generate a 5-tweet thread using Ollama + post via Twitter API v2.  
**Effort:** Medium (2-3 days)  
**Impact:** High — Twitter has massive AI audience, drives traffic back to blog  
**Credentials needed:** `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `TWITTER_ACCESS_TOKEN`  
**Package:** `twitter-api-v2`  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Twitter Auto-Post Thread — after publishing to Dev.to and Hashnode, generate a 5-tweet thread using the social-post.md prompt template and post to @AIInsightsDaily`

### IDEA-002: Google Sheets Analytics Sync
**What:** After each run, append a row to the Google Sheets spreadsheet with post data.  
**Effort:** Low (1 day)  
**Impact:** Medium — easier analytics, shareable with stakeholders  
**Credentials needed:** Google service account JSON  
**Sheet ID:** `1mNCwK827o5Tzv-GzAF-ZcVc27VbgHDbz36UNeCnq1lI`  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Google Sheets Sync — after each post, append title, Dev.to URL, Hashnode URL, word count, date to Google Sheets ID 1mNCwK827o5Tzv-GzAF-ZcVc27VbgHDbz36UNeCnq1lI`

### IDEA-003: Ollama Model Cache in GitHub Actions
**What:** Cache the `~/.ollama/models` directory in GitHub Actions using `actions/cache@v4`.  
**Effort:** Very Low (2 hours)  
**Impact:** High — saves 3 min per run, reduces timeout risk significantly  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Cache Ollama Models — add GitHub Actions cache for ~/.ollama/models to avoid re-downloading mistral on every run`

---

## 🟡 Priority 2 — High Value, Medium Effort

### IDEA-004: LinkedIn Auto-Post
**What:** After publishing, post a LinkedIn article using the social-post.md LinkedIn prompt.  
**Effort:** Medium (2-3 days, OAuth is complex)  
**Impact:** High — LinkedIn has strong professional AI audience  
**Credentials needed:** `LINKEDIN_ACCESS_TOKEN` (OAuth 2.0)  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: LinkedIn Auto-Post — generate a LinkedIn post using the social-post.md LinkedIn template and post using LinkedIn v2 UGC Posts API`

### IDEA-005: Featured Image Generation
**What:** Generate a featured image per post using Stable Diffusion (Replicate API) and upload to Dev.to/Hashnode.  
**Effort:** Medium (2-3 days)  
**Impact:** High — images dramatically improve click-through rates  
**Credentials needed:** `REPLICATE_API_TOKEN`  
**Cost:** ~$0.002 per image (~$0.06/month)  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Featured Image — generate a featured image using Replicate API (sdxl model) based on the post title, upload URL to Dev.to main_image and Hashnode coverImageOptions`

### IDEA-006: Post Quality Gate
**What:** Score each generated post (word count, structure, uniqueness) and retry if below threshold.  
**Effort:** Medium (1-2 days)  
**Impact:** High — prevents low-quality posts from going live  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Quality Gate — after generate-post.js, score the post on word count (min 600), H2 count (min 3), and uniqueness vs yesterday. Retry with seoOptimized style if score is below 70%`

### IDEA-007: Duplicate Post Prevention
**What:** Check analytics.json before publishing — skip if already published today.  
**Effort:** Low (2 hours)  
**Impact:** High — prevents double-posting when workflow is triggered manually + scheduled  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Deduplication — before post-to-platforms.js, check data/analytics.json for a post published today. If found, skip publishing and send Slack warning instead`

---

## 🟢 Priority 3 — Medium Value, Medium Effort

### IDEA-008: Multi-Language Support (Tamil)
**What:** After generating the English post, use Ollama to translate to Tamil and publish to a separate Hashnode blog.  
**Effort:** Medium (2-3 days)  
**Impact:** Medium — niche but differentiated, Tamil tech audience is underserved  
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: Tamil Translation — after optimize-post.js, use Ollama to translate the post to Tamil and publish to a second Hashnode publication`

### IDEA-009: Reddit Auto-Post
**What:** Submit the post to relevant subreddits (r/MachineLearning, r/artificial).  
**Effort:** Medium (2 days)  
**Impact:** Medium — Reddit traffic can be huge but unpredictable  
**Credentials needed:** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_REFRESH_TOKEN`  
**Package:** `snoowrap`

### IDEA-010: Weekly Digest Email
**What:** Every Sunday, send a "week in review" email with all 7 posts, stats, and earnings.  
**Effort:** Medium (1-2 days)  
**Impact:** Medium — good for audience retention  
**Trigger:** Add separate GitHub Actions workflow: `0 8 * * 0` (Sunday 8 AM IST)

### IDEA-011: Substack Newsletter
**What:** Auto-publish each post to a Substack newsletter for email subscribers.  
**Effort:** High (Substack has no official API)  
**Impact:** High — builds owned email list  
**Alternative:** Ghost CMS (has API) or ConvertKit

---

## 🔵 Priority 4 — Lower Value or High Effort

### IDEA-012: YouTube Shorts Auto-Generate
**What:** Convert each blog post into a 60-second script and use TTS + slides to create a YouTube Short.  
**Effort:** Very High (1-2 weeks)  
**Impact:** High long-term, complex to implement

### IDEA-013: A/B Test Post Styles
**What:** Alternate between prompt styles (default, tutorial, news) on different days and track which drives more engagement.  
**Effort:** Medium (2 days)  
**Impact:** Low short-term (need months of data), high long-term

### IDEA-014: Sponsored Post System
**What:** Template for sponsored posts with CTA injection, pricing calculator, outreach email template.  
**Effort:** Medium (2 days)  
**Impact:** High when audience is large enough (6+ months away)

### IDEA-015: Dev.to Series / Hashnode Series
**What:** Group related posts into a "series" on Dev.to and Hashnode for better discoverability.  
**Effort:** Low (1 day)  
**Impact:** Medium — improves SEO and user experience

---

## Completed Ideas

*(Move here when implemented)*

---

## How to Add a New Idea

```
### IDEA-XXX: [Name]
**What:** [One line description]
**Effort:** Very Low / Low / Medium / High / Very High
**Impact:** Low / Medium / High
**Credentials needed:** [if any]
**ADD_FEATURE prompt:** `🚀 ADD_FEATURE: ...`
```
