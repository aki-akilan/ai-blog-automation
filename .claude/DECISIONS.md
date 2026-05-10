# Architecture Decision Records

> Each ADR documents a key technical or product decision made during this project.

---

## ADR-001: Use GitHub Actions instead of n8n or local cron

**Date:** 2026-05-09 | **Status:** ✅ Accepted | **Impact:** High

**Context:** Needed a reliable scheduler to run the automation daily without Akilan's machine being on.

**Decision:** GitHub Actions with cron schedule `30 6 * * *` (12 PM IST).

**Rationale:**
- Zero infrastructure cost on free tier
- No server to maintain
- Built-in secret management
- Full logs and run history
- Manual trigger via `workflow_dispatch`

**Consequences:** Tied to GitHub; Ollama must be installed fresh each run (~3 min overhead).

**Related:** `.github/workflows/daily-post.yml`

---

## ADR-002: Use Ollama (Mistral 7B) for content generation

**Date:** 2026-05-09 | **Status:** ✅ Accepted | **Impact:** High

**Context:** Need AI to generate 800-1000 word blog posts daily from news headlines.

**Decision:** Ollama with `mistral:latest` (7B Q4 GGUF, ~4GB).

**Rationale:**
- Completely free (no API cost per post)
- Runs on GitHub Actions free tier (2-core CPU)
- Good enough quality for daily blog posts
- No rate limits

**Consequences:**
- Generation takes 3-5 min on 2-core CI
- Timeout must be 8 min (480s), not default 2 min
- Each GitHub Actions run installs Ollama + pulls model (~3 min)

**Related:** `scripts/generate-post.js`, `.github/workflows/daily-post.yml`

---

## ADR-003: Skip Medium API — use Import URL instead

**Date:** 2026-05-10 | **Status:** ✅ Accepted | **Impact:** Medium

**Context:** Medium has no free public API for new users. Needed a way to post to Medium.

**Decision:** Use Medium's import tool at `medium.com/p/import` with the Dev.to post URL.

**Rationale:**
- Medium auto-imports full article from URL (title, content, formatting)
- Takes ~30 seconds manually
- No API token needed
- Dev.to URL included in daily email and Slack notification

**Consequences:** Medium posting is semi-manual. Acceptable for current scale.

**Related:** `templates/email-template.html`, `scripts/notify-slack.js`

---

## ADR-004: Publish to Dev.to and Hashnode (not Medium directly)

**Date:** 2026-05-09 | **Status:** ✅ Accepted | **Impact:** High

**Context:** Needed platforms with free, accessible APIs for automated publishing.

**Decision:** Dev.to (REST API) + Hashnode (GraphQL API) as primary auto-publish targets.

**Rationale:**
- Both have free, well-documented APIs
- Strong developer communities
- Good SEO indexing
- Dev.to has `api-key` header auth (simple)
- Hashnode has GraphQL with publication ID pattern

**Consequences:** Medium is manual import. Could add Twitter/LinkedIn in future.

**Related:** `scripts/post-to-devto.js`, `scripts/post-to-hashnode.js`

---

## ADR-005: Use GitHub repo for analytics/dashboard storage

**Date:** 2026-05-09 | **Status:** ✅ Accepted | **Impact:** Low

**Context:** Need to persist analytics across runs without external database.

**Decision:** Commit `data/analytics.json` and `data/dashboard.html` back to repo after each run.

**Rationale:**
- No external DB needed
- Version history of analytics built-in
- Dashboard viewable by cloning repo
- `[skip ci]` prevents workflow loops

**Consequences:** Git history grows slightly with each daily commit. Acceptable.

**Related:** `scripts/log-analytics.js`, `scripts/dashboard.js`

---

## ADR-006: Store credentials in .env locally + GitHub Secrets in CI

**Date:** 2026-05-09 | **Status:** ✅ Accepted | **Impact:** High

**Context:** Scripts need API keys, tokens, passwords to function.

**Decision:** `.env` file locally (gitignored), GitHub Secrets for CI.

**Rationale:**
- `.env` never leaves local machine
- GitHub Secrets encrypted at rest
- Same `process.env` access pattern for both
- `.env.example` committed as template

**Consequences:** Must manually add secrets to GitHub repo. See `docs/github-secrets-guide.md`.

**Security note:** Rotate credentials if repo is ever made public or token is exposed.

**Related:** `.env.example`, `docs/github-secrets-guide.md`, `scripts/setup-github-secrets.sh`

---

## ADR-007: Monthly credential rotation (planned)

**Date:** 2026-05-09 | **Status:** 🔜 Planned | **Impact:** Medium

**Context:** API tokens and passwords should be rotated periodically for security.

**Decision:** Rotate all credentials monthly (last Sunday of each month).

**Rotation checklist:**
1. Dev.to: regenerate API key at dev.to → Settings → API Keys
2. Hashnode: regenerate token at hashnode.com → Account Settings → Developer
3. Gmail App Password: revoke + regenerate at myaccount.google.com/apppasswords
4. Update `.env` locally
5. Update all GitHub Secrets
6. Run `node scripts/test-apis.js` to confirm

**Related:** `docs/github-secrets-guide.md`, `.env`

---

## ADR-008: Use phased implementation (Phases 1-6)

**Date:** 2026-05-09 | **Status:** ✅ Accepted | **Impact:** Medium

**Context:** Complex project with many moving parts. Risk of building something that doesn't work end-to-end.

**Decision:** Implement in 6 phases with approval gates and full testing in Phase 6.

**Phases:**
1. Project Foundation
2. Content Generation Scripts
3. Publishing Scripts
4. Email & Analytics
5. GitHub Actions Deployment
6. Full Automation Testing (final gate)

**Rationale:**
- Each phase independently testable
- Can pause/resume between phases
- Phase 6 validates entire pipeline before going live
- Bugs caught early (e.g. scope bug, RSS timeout, Ollama timeout)

**Consequences:** Slightly slower to build but much more reliable result.

**Related:** `PROGRESS.md`, `tests/test-report.md`

---

## Adding New ADRs

When making a significant decision:

```
## ADR-00X: [Short title]

**Date:** YYYY-MM-DD | **Status:** ✅/🔜/❌ | **Impact:** High/Medium/Low

**Context:** Why did this decision need to be made?
**Decision:** What was decided?
**Rationale:** Why this option over alternatives?
**Consequences:** What are the trade-offs?
**Related:** Which files are affected?
```

Next ADR number: **009** (update `.claude-config.json` → `decisions.nextADR`)
