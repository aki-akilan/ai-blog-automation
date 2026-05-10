# Experiments

> Hypotheses to test. Each experiment has a clear metric and timeline.
> Run experiments for at least 2 weeks before drawing conclusions.

---

## Active Experiments

*(None running yet — start here)*

---

## Planned Experiments

### EXP-001: phi3:mini vs mistral quality comparison
**Hypothesis:** phi3:mini produces acceptable quality posts 80%+ of the time, with 2-3x faster generation.  
**Method:**
1. Run 1 week with mistral, 1 week with phi3:mini
2. Compare: word count, structure quality, tag relevance, Dev.to engagement
**Success metric:** phi3:mini posts get ≥ 80% of mistral's engagement with ≤ 60% generation time  
**How to run:** Change `model: 'phi3:mini'` in generate-post.js + `ollama pull phi3:mini` in workflow  
**Revert:** Change back to `model: 'mistral'`

---

### EXP-002: Best time to post for Dev.to engagement
**Hypothesis:** Posts published at 12 PM IST get less engagement than posts published at 9 AM IST (before the US work day starts).  
**Method:**
1. Month 1: Keep 12 PM IST schedule
2. Month 2: Switch to 6 AM IST (12:30 AM UTC)
3. Compare: Dev.to reactions, comments, views per post
**Success metric:** > 20% improvement in average reactions per post  
**How to run:** Change cron in daily-post.yml  
**Revert:** Change cron back

---

### EXP-003: Tutorial vs Default style engagement
**Hypothesis:** Tutorial-style posts ("How to...") get significantly more saves and comments than general news posts.  
**Method:**
1. Alternate: Mon/Wed/Fri = tutorial, Tue/Thu/Sat/Sun = default
2. Track Dev.to reactions + comments per style for 30 days
**Success metric:** Tutorial posts get 30%+ more engagement  
**How to run:** Add day-of-week logic to PROMPT_STYLE selection in generate-post.js  

---

### EXP-004: With vs without featured image
**Hypothesis:** Posts with AI-generated featured images get 50%+ more clicks on Dev.to.  
**Method:**
1. Implement IDEA-005 (Featured Image)
2. Post 2 weeks without images (baseline), 2 weeks with images
3. Compare click-through from Dev.to feed
**Success metric:** 50%+ improvement in Dev.to views  
**Dependency:** Requires IDEA-005 to be implemented first

---

### EXP-005: SEO prompt style on high-search-volume days
**Hypothesis:** Using `seoOptimized` prompt on days with high-search-volume AI topics (major product launches, viral news) drives more organic traffic.  
**Method:**
1. Monitor AI news topics for high-volume days (new ChatGPT feature, major model release)
2. Manually trigger with `prompt_style: seoOptimized` on those days
3. Track Dev.to views vs baseline
**Success metric:** SEO posts get 2x views within 7 days  
**How to run:** Manual workflow dispatch with `prompt_style: seoOptimized`

---

## Completed Experiments

### EXP-000: Do date + angle improve post uniqueness?
**Status:** ✅ Confirmed — resolved in Phase 6  
**Result:** Without date/angle: same post structure every run. With date/angle: meaningfully different content each day.  
**Decision:** Permanent feature in generate-post.js

---

## Experiment Log Template

```
### EXP-XXX: [Name]
**Hypothesis:** [What you think will happen]
**Method:** [Exactly how to test it]
**Start date:** YYYY-MM-DD
**End date:** YYYY-MM-DD
**Success metric:** [Clear, measurable threshold]
**Results:** [Fill in after experiment]
**Decision:** [Keep / Revert / Iterate]
```
