# What Worked Well

> Successful patterns and decisions that should be kept and repeated in future features.

---

## ✅ Phased implementation with approval gates

**What:** Breaking the build into 6 phases with a stop-and-confirm between each.  
**Why it worked:** Bugs were caught early (Hashnode no blog, Gmail password, scope errors) before they became production problems. Each phase was independently testable.  
**Repeat when:** Building any new multi-step feature. Use the same phase approach: foundation → logic → integration → test.

---

## ✅ Promise.allSettled for parallel platform posting

**What:** Running Dev.to and Hashnode posts in parallel using `Promise.allSettled` (not `Promise.all`).  
**Why it worked:** One platform failing doesn't block the other. Partial success (1/2 platforms) is better than total failure.  
**Repeat when:** Any time you're posting to multiple independent platforms. Never use `Promise.all` for publishing — one failure would kill everything.

---

## ✅ Non-fatal Slack notifications

**What:** Slack webhook failures are caught and logged as warnings, never thrown as errors.  
**Why it worked:** Slack is a notification layer — it should never crash the core pipeline. This design meant a revoked webhook doesn't break the whole automation.  
**Repeat when:** Any "nice to have" notification or logging step. Core publishing steps should throw; observability steps should warn.

---

## ✅ TEST_MODE flag for safe testing

**What:** `TEST_MODE=true` makes Dev.to save as draft and adds `[TEST]` prefix to all titles.  
**Why it worked:** Allowed full pipeline testing without polluting live profiles. Could run 10 test iterations safely.  
**Repeat when:** Every new publishing script. Always implement TEST_MODE from the start, not as an afterthought.

---

## ✅ Date-seeded shuffle for post uniqueness

**What:** Using today's date as a deterministic shuffle seed to pick 6 of 15 articles.  
**Why it worked:** Same-day runs are consistent (debugging friendly) but different-day runs pick different articles. No random() that would make debugging impossible.  
**Repeat when:** Any selection/rotation that needs to be "different each day but reproducible within a day".

---

## ✅ Health-check loop for Ollama

**What:** Polling `/api/tags` every 3 seconds (up to 30 attempts) instead of fixed `sleep`.  
**Why it worked:** Guarantees Ollama is actually listening before any script touches it. Works regardless of runner speed.  
**Repeat when:** Any workflow that starts a background service before running scripts. Always poll the health endpoint.

---

## ✅ Promise.race timeout for RSS feeds

**What:** Wrapping `parser.parseURL()` in `Promise.race([parse, timeout])` with a 10-second hard cutoff.  
**Why it worked:** Prevents one slow/hung feed from blocking the entire news fetch step. Discovered this was critical after a 340-second RSS fetch in Phase 6.  
**Repeat when:** Any HTTP call to an external service that might hang (not just RSS). External APIs can hang indefinitely without a hard timeout.

---

## ✅ Slack Block Kit for rich notifications

**What:** Using Slack's Block Kit (structured blocks with fields, headers, dividers) instead of plain text.  
**Why it worked:** Notifications are scannable at a glance — platform status, URLs, and Medium import steps all visible without reading prose.  
**Repeat when:** Any Slack notification with more than 1 piece of information. Block Kit is always worth the extra lines.

---

## ✅ Medium import URL approach

**What:** Instead of a complex Medium API workaround, use `medium.com/p/import` with the Dev.to URL.  
**Why it worked:** Medium auto-imports title, content, and formatting from any public URL. 30 seconds vs 5 minutes of markdown copy-paste.  
**Repeat when:** Any platform that blocks API access but has an import feature. Check for import/migration tools before building API workarounds.

---

## ✅ Committing analytics back to repo

**What:** After each run, `analytics.json` and `dashboard.html` are committed back to the repo.  
**Why it worked:** Free persistent storage across runs. Git history = full analytics history. No external DB needed.  
**Repeat when:** Any small data file that needs persistence across GitHub Actions runs. Use `[skip ci]` on the commit to prevent workflow loops.

---

## ✅ The .claude/ knowledge base itself

**What:** This entire `.claude/` folder with CLAUDE.md, skills, workflows, context, templates.  
**Why it worked:** Future conversations with Claude Code start with full project context instead of re-explaining everything. The ADD_FEATURE command pattern enables self-documenting growth.  
**Repeat when:** Every project of significant complexity. Build the KB alongside the code, not after.
