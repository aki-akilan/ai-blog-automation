# Skill: Content Generation

## When to Use
- Debugging why posts are repetitive or low quality
- Changing the AI model or prompt style
- Adding new prompt templates
- Tuning Ollama parameters
- Understanding why generate-post.js skips locally

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| `data/today-news.json` exists | Run `fetch-news.js` first |
| `config/prompts.json` valid JSON | `node -e "require('./config/prompts.json')"` |
| Ollama running (GitHub Actions only) | `curl localhost:11434/api/tags` |
| `.env` has `OLLAMA_API_URL` | defaults to `http://localhost:11434` |

---

## Process

```
fetch-news.js → today-news.json
                      │
              pick 6 items (date-seeded shuffle)
              inject: today's date + daily angle
                      │
              generate-post.js (Ollama/mistral)
                      │
                today-post.md
                      │
              optimize-post.js (SEO pass)
                      │
        optimized-post.md + post-meta.json
```

---

## Prompt Styles (config/prompts.json)

| Style | Best For | Title Pattern |
|-------|----------|---------------|
| `default` | General daily post | Topic-driven title |
| `tutorial` | How-to articles | "How to..." or "A Guide to..." |
| `newsSummary` | Roundup posts | "This Week in AI: [Theme]" |
| `seoOptimized` | SEO-focused days | Keyword-rich title |

Switch style: set `PROMPT_STYLE=tutorial` in env or GitHub Actions input.

---

## Daily Uniqueness System

Three mechanisms ensure each post is different:

1. **Date injection** — today's date is prepended to every prompt
2. **Rotating angle** — 7 angles cycle by day-of-year:
   - Day 0: Developer/engineer implications
   - Day 1: Business impact + company adoption
   - Day 2: Everyday users + society
   - Day 3: Technical breakthroughs
   - Day 4: Future predictions (12 months)
   - Day 5: Controversies + risks
   - Day 6: Startups + disruptors
3. **Date-seeded shuffle** — picks 6 of 15 articles, different subset each day

---

## Quality Checklist

After generation, verify `data/today-post.md`:
```
☐ Word count ≥ 600  (node -e "console.log(require('fs').readFileSync('data/today-post.md','utf8').split(/\s+/).length)")
☐ Has H1 title      (grep "^# " data/today-post.md)
☐ Has H2 sections   (grep "^## " data/today-post.md)
☐ Not generic title (title should reference today's specific news)
☐ Has CTA at end    (grep "Stay Updated" data/today-post.md)
```

---

## Common Issues & Fixes

### Issue 1: Posts look the same every day
**Symptom:** Title and structure nearly identical across runs  
**Cause:** Prompt lacked date/uniqueness signal  
**Fix:** Already fixed — date + angle injected, shuffle picks different items  
**Files:** `scripts/generate-post.js` lines 18-35

### Issue 2: Ollama timeout on GitHub Actions
**Symptom:** `timeout of 480000ms exceeded`  
**Cause:** Mistral 7B on 2-core CPU takes > 8 min  
**Fix:** Reduce `num_predict` further (1000) or switch to smaller model  
```javascript
// In generate-post.js options:
num_predict: 1000  // shorter but faster
```
Or switch model in workflow:
```yaml
ollama pull phi3:mini  # faster, smaller
```

### Issue 3: generate-post.js exits with 0 locally
**Symptom:** `⚠️ Ollama is not running locally` then exit  
**Cause:** Expected — Ollama not installed on Mac  
**Fix:** Not a bug. Install Ollama locally only if you want to test generation:
```bash
brew install ollama && ollama serve & && ollama pull mistral
```

### Issue 4: Post is too short (< 400 words)
**Symptom:** Word count warning in logs  
**Cause:** Ollama hit token limit early or model gave brief answer  
**Fix:** Increase `num_predict` or re-run. Check prompt isn't too constrained.

### Issue 5: Post has no H2 sections
**Symptom:** `optimize-post.js` adds generic "Key Insights" heading  
**Cause:** Mistral didn't follow markdown structure instruction  
**Fix:** Add stronger instruction to prompt:
```
"You MUST use ## H2 headings to separate each major section. Minimum 3 H2 sections."
```

### Issue 6: Tags are too generic (always just "ai", "machinelearning")
**Symptom:** Every post gets same 5 tags  
**Cause:** Content doesn't contain specific keywords from tagMap  
**Fix:** Add more keywords to `tagMap` in `scripts/optimize-post.js`

---

## Prompt Engineering Tips

1. **Be specific about structure** — Mistral follows explicit formatting instructions well
2. **Include word count range** — "800-1000 words" keeps output consistent
3. **Name the H1 requirement** — without it, Mistral sometimes skips the title
4. **The angle matters** — "Focus on developers" produces very different content than "Focus on society"
5. **Date anchors the post** — without it, Ollama may write timeless generic content

---

## Files Involved

| File | Role |
|------|------|
| `scripts/fetch-news.js` | RSS fetcher → news input |
| `scripts/generate-post.js` | Ollama caller + uniqueness logic |
| `scripts/optimize-post.js` | SEO structure + tags + CTA |
| `config/feeds.json` | RSS sources + AI keywords |
| `config/prompts.json` | 4 prompt style templates |
| `data/today-news.json` | Intermediate: fetched news |
| `data/today-post.md` | Intermediate: raw generated post |
| `data/optimized-post.md` | Output: final post with frontmatter |
| `data/post-meta.json` | Output: title, tags, description |

---

## Related Skills
- [Platform Posting](../platform-posting/SKILL.md) — uses output of this skill
- [Debugging](../debugging/SKILL.md) — troubleshoot generation failures
- [Testing](../testing/SKILL.md) — how to test generation pipeline
