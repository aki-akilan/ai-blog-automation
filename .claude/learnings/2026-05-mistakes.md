# Mistakes & Lessons — May 2026 (Build Phase)

> These are real mistakes made during the initial build (Phases 1-6).
> Documenting them prevents repeating them in future features.

---

## Mistake 1: EMAIL_APP_PASSWORD was regular Gmail password

**What happened:** Set `EMAIL_APP_PASSWORD` to the regular Gmail login password.  
**Result:** Every email send failed with `535 5.7.8 Username and Password not accepted`.  
**Fix:** Generated a proper 16-char Gmail App Password at myaccount.google.com/apppasswords.  
**Lesson:** Gmail SMTP ALWAYS requires an App Password when 2FA is on. Regular password never works. Document this clearly upfront.  
**Prevention:** `send-email.js` now detects this error and shows an explicit fix message instead of retrying 3 times.

---

## Mistake 2: Hashnode had no blog/publication created

**What happened:** Had a Hashnode account but had never created the blog on it.  
**Result:** `post-to-hashnode.js` threw "No Hashnode publication found" on first live test.  
**Fix:** Went to hashnode.com → clicked avatar → Create Blog → set up AIInsightsDaily.  
**Lesson:** API auth (token valid) ≠ platform fully set up (blog exists). Test both separately.  
**Prevention:** `test-apis.js` now shows `publication: "none"` warning if blog isn't created yet.

---

## Mistake 3: Same post published on every run

**What happened:** Ollama received the same prompt every day (no date, no angle variation).  
**Result:** Nearly identical posts across multiple runs — same structure, similar title, same flow.  
**Fix:** Added date injection + 7 daily rotating angles + date-seeded article shuffle.  
**Lesson:** LLMs need explicit uniqueness signals. Without a date and angle, they default to the same "safe" structure every time.  
**Prevention:** `generate-post.js` now injects `Today's date + angle + IMPORTANT: fresh post` into every prompt.

---

## Mistake 4: Ollama timeout on GitHub Actions

**What happened:** Set axios timeout to 120 seconds (2 min). Mistral 7B on GitHub Actions 2-core CPU takes 3-5 minutes.  
**Result:** Generate step timed out and retried, eventually failing.  
**Fix:** Raised timeout to 480 seconds (8 min), reduced `num_predict` from 2000 to 1500 for faster generation.  
**Lesson:** Always account for CI runner speed being much slower than local dev machine. What takes 30 sec locally can take 5 min on CI.  
**Prevention:** Documented in `skills/debugging/SKILL.md` and `context/TECH_STACK.md`.

---

## Mistake 5: sleep 10 was unreliable for Ollama startup

**What happened:** Used `sleep 10` in workflow to wait for Ollama before running scripts.  
**Result:** On slower GitHub Actions runners, Ollama wasn't ready in 10 seconds → `ECONNREFUSED` on first generate attempt.  
**Fix:** Replaced with a health-check loop that polls `/api/tags` every 3 seconds, up to 90 seconds.  
**Lesson:** Never use fixed sleeps for service readiness. Always poll a health endpoint.  
**Prevention:** Health-check loop now in workflow. Pattern documented in `templates/error-handler.js` → `withTimeout`.

---

## Mistake 6: `postContent` scope bug in send-email.js

**What happened:** When adding Slack article notification, imported `postContent` in one place but used it in another scope.  
**Result:** `ReferenceError: postContent is not defined` during integration test.  
**Fix:** Changed `const { meta } = loadData()` to `const { meta, postContent } = loadData()`.  
**Lesson:** When adding to existing `main()` functions, trace all variable declarations. Partial destructuring is easy to miss.  
**Prevention:** Caught in Phase 6 integration test — validates the value of running `TEST_MODE=true` before going live.

---

## Mistake 7: Slack webhook URL flagged by GitHub push protection

**What happened:** `.env.example` contained a URL matching the `hooks.slack.com/services/` pattern — even with `XXXXXXXXX` placeholders.  
**Result:** GitHub's secret scanner blocked the push saying "Slack Incoming Webhook URL detected".  
**Fix:** Changed placeholder to `your-slack-incoming-webhook-url` (no domain pattern).  
**Fix 2:** Used `git filter-branch` to rewrite history and remove the pattern from old commits.  
**Lesson:** GitHub's scanner matches URL patterns, not just actual secrets. Avoid `hooks.slack.com/` in any committed file — even as a placeholder.  
**Prevention:** `.env.example` now uses plain text descriptions for all webhook URLs.

---

## Mistake 8: Inline `run:` with `{` caused YAML syntax error

**What happened:** GitHub Actions YAML had `run: node -e "fn({ key: value })"` — inline value with curly braces.  
**Result:** `Invalid workflow file — YAML syntax error on line 64`.  
**Fix:** Changed to `run: |` block scalar format.  
**Lesson:** In GitHub Actions YAML, any `run:` value containing `{` on a single inline line can confuse the parser. Always use block scalar (`run: |`) for shell commands that contain JavaScript objects.  
**Prevention:** Documented in `skills/debugging/SKILL.md` → YAML Fix section.
