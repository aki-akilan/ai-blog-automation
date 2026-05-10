# AI Blog Automation — Claude Knowledge Base

> **READ THIS FIRST.** This is the master context file for Claude Code working on this project.

---

## Project at a Glance

| Field | Value |
|-------|-------|
| **Project** | AI Blog Automation |
| **Owner** | Akilan (Chennai, India) |
| **Goal** | Auto-publish daily AI blog posts to Dev.to + Hashnode at 12 PM IST |
| **Status** | ✅ Production — all 6 phases complete |
| **Repo** | github.com/Aki-Akilan/ai-blog-automation |
| **Runtime** | GitHub Actions (ubuntu-latest, cron `30 6 * * *`) |

---

## What This System Does (30-second summary)

Every day at **12:00 PM IST**:
1. Fetches AI news from 5 RSS feeds
2. Generates 800-1000 word blog post using **Ollama + Mistral 7B**
3. Publishes to **Dev.to** and **Hashnode** automatically
4. Sends **email** to Akilan with Medium import link
5. Posts **Slack notifications** to `#aiinsightsdaily` (started → published → full article)
6. Logs analytics, generates dashboard

Akilan's only manual task: open the Slack notification → click Medium import link → paste Dev.to URL → publish (~30 sec).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (CommonJS) |
| AI Generation | Ollama (Mistral 7B, GGUF Q4) |
| CI/CD | GitHub Actions |
| Publishing | Dev.to REST API, Hashnode GraphQL API |
| Email | Gmail SMTP via nodemailer |
| Notifications | Slack Incoming Webhook |
| Analytics | Local JSON + HTML dashboard |
| Key packages | axios, rss-parser, nodemailer, chalk, dotenv |

---

## Critical Rules (Always Follow)

1. **NEVER commit `.env`** — it is gitignored, contains real credentials
2. **NEVER hardcode credentials** in any script — always use `process.env`
3. **Slack errors are non-fatal** — webhook failures must never crash the pipeline
4. **All scripts use `require('dotenv').config()`** at the top
5. **chalk v4 is CommonJS** — use `require('chalk')` not ES import
6. **TEST_MODE=true** → Dev.to saves as draft, posts get `[TEST]` prefix
7. **`[skip ci]`** in analytics commit message to prevent workflow loops
8. **Promise.race timeout** wraps all RSS feed fetches (10s hard cutoff)

---

## File Locations Map

```
ai-blog-automation/
├── scripts/
│   ├── fetch-news.js          RSS → data/today-news.json
│   ├── generate-post.js       Ollama → data/today-post.md
│   ├── optimize-post.js       SEO → data/optimized-post.md + post-meta.json
│   ├── post-to-devto.js       Dev.to REST API publisher
│   ├── post-to-hashnode.js    Hashnode GraphQL publisher
│   ├── post-to-platforms.js   Master parallel publisher
│   ├── send-email.js          Gmail SMTP + Slack article notification
│   ├── notify-slack.js        All Slack notification types
│   ├── log-analytics.js       data/analytics.json logger
│   ├── dashboard.js           data/dashboard.html generator
│   └── test-apis.js           Dry-run API connectivity checker
├── config/
│   ├── feeds.json             5 RSS sources + AI keyword filter
│   └── prompts.json           4 Ollama prompt styles
├── templates/
│   └── email-template.html    HTML email with Medium import section
├── .github/workflows/
│   └── daily-post.yml         Cron + manual dispatch workflow
├── data/                      Runtime output (gitignored except analytics)
├── tests/
│   └── test-report.md         Phase 6 full test results
└── .claude/                   This knowledge base
    ├── CLAUDE.md              ← YOU ARE HERE
    ├── ARCHITECTURE.md        System design + data flow
    ├── DECISIONS.md           8 Architecture Decision Records
    ├── AUTO_UPDATE_PROMPT.md  How to use ADD_FEATURE command
    ├── .claude-config.json    KB configuration
    ├── skills/                Skill guides per domain
    ├── workflows/             Step-by-step operation guides
    ├── context/               Deep-dive context docs
    ├── prompts/               Reusable AI prompt templates
    ├── templates/             Reusable code templates
    ├── learnings/             Lessons learned + optimizations
    └── future/                Roadmap + ideas backlog
```

---

## Quick Commands

```bash
# Test everything locally (no Ollama needed)
node scripts/fetch-news.js        # fetch live AI news
node scripts/test-apis.js         # verify Dev.to + Hashnode auth
node scripts/send-email.js        # send test email
node scripts/notify-slack.js      # send test Slack notifications

# Full dry run (TEST_MODE skips live publishing)
TEST_MODE=true node scripts/post-to-platforms.js

# Push secrets to GitHub (requires gh CLI)
bash scripts/setup-github-secrets.sh

# Run full pipeline locally (requires Ollama)
npm run run-all
```

---

## Quick FAQ

**Q: Why does generate-post.js exit with 0 locally?**
Ollama is not installed locally. It runs only on GitHub Actions. This is expected.

**Q: Why is the same post published twice?**
Fixed in Phase 6 — date-seeded shuffle + daily angle now ensures unique posts.

**Q: Why does Ollama timeout on GitHub Actions?**
Fixed — timeout raised to 8 min (480s). 2-core CI takes 3-5 min for Mistral 7B.

**Q: How do I add a new platform?**
See `.claude/workflows/ADD_NEW_PLATFORM.md` and `.claude/skills/platform-posting/SKILL.md`

**Q: How do I add a new feature?**
Use the `🚀 ADD_FEATURE:` command — see `.claude/AUTO_UPDATE_PROMPT.md`

**Q: Where are the GitHub Secrets?**
`github.com/Aki-Akilan/ai-blog-automation/settings/secrets/actions`
Required: `DEVTO_API_KEY`, `HASHNODE_TOKEN`, `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `SLACK_WEBHOOK_URL`

---

## Platforms & Accounts

| Platform | Username | URL |
|----------|----------|-----|
| Dev.to | AIInsightsDaily | dev.to/AIInsightsDaily |
| Hashnode | AIInsightsDaily | aiinsightsdaily.hashnode.dev |
| Medium | Aiinsightsdaily | medium.com/@aiinsightsdaily0406 |
| Slack | — | #aiinsightsdaily channel |
| GitHub | Aki-Akilan | github.com/Aki-Akilan |
| Gmail | — | aiinsightsdaily0406@gmail.com |

---

## Related Files
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Decisions: [DECISIONS.md](./DECISIONS.md)
- Add features: [AUTO_UPDATE_PROMPT.md](./AUTO_UPDATE_PROMPT.md)
- Progress: [CLAUDE_PROGRESS.md](./CLAUDE_PROGRESS.md)
