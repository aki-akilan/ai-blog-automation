# Glossary

## Project-Specific Terms

**AI Insights Daily**
The blog brand. Content published under this name on Dev.to, Hashnode, and Medium.

**Daily Angle**
One of 7 rotating writing perspectives injected into the Ollama prompt daily. Ensures each post has a unique focus even when covering similar news topics.

**Date-Seeded Shuffle**
Algorithm in `generate-post.js` that selects 6 of 15 news articles using today's date as a random seed. Same date = same selection. Different date = different articles.

**Optimized Post**
The final version of a blog post after the SEO pass (`optimize-post.js`). Includes frontmatter, H1/H2 structure, meta description, tags, and CTA. Stored as `data/optimized-post.md`.

**Frontmatter**
YAML block at the top of a markdown file between `---` delimiters. Contains title, description, tags, date. Stripped before publishing to platforms.

**TEST_MODE**
Environment variable (`TEST_MODE=true`) that makes publish scripts save as drafts and add `[TEST]` prefix to titles. Safe for testing without polluting live profiles.

**Phase 1-6**
The implementation phases of this project:
1. Foundation, 2. Content Scripts, 3. Publishing, 4. Email/Analytics, 5. GitHub Actions, 6. Full Testing

**ADD_FEATURE command**
The `🚀 ADD_FEATURE: ...` prompt format for asking Claude Code to add a new feature with full KB documentation. See `AUTO_UPDATE_PROMPT.md`.

---

## Technical Acronyms

**ADR** — Architecture Decision Record. A document capturing an important design decision, its context, and rationale. Stored in `DECISIONS.md`.

**CTA** — Call to Action. The "Stay Updated" section at the end of every blog post that encourages readers to follow, share, and comment.

**GGUF** — GPT-Generated Unified Format. The quantized model format used by Ollama. Q4 = 4-bit quantization (smaller, faster, slight quality tradeoff).

**GraphQL** — Query language for APIs. Used by Hashnode. Allows precise data fetching via queries and mutations in a single endpoint.

**IST** — Indian Standard Time. UTC+5:30. Akilan's timezone. All schedule times refer to IST.

**LLM** — Large Language Model. The AI model category that includes Mistral, GPT-4, Claude, etc.

**GGUF Q4** — 4-bit quantized model. Mistral 7B in this format = ~4GB. Runs on CPU in 3-5 min on GitHub Actions.

**PAT** — Personal Access Token. GitHub authentication token used instead of passwords. This project uses fine-grained PATs.

**RSS** — Really Simple Syndication. XML feed format used by news sites. Read by `rss-parser` in `fetch-news.js`.

**SMTP** — Simple Mail Transfer Protocol. Email sending protocol. Gmail uses port 587 (STARTTLS).

**YAML** — Yet Another Markup Language. Format used for GitHub Actions workflow files (`.yml`).

---

## API Terminology

**Incoming Webhook (Slack)**
A unique URL that accepts POST requests and posts messages to a Slack channel. No OAuth needed. Treat like a password.

**App Password (Gmail)**
A 16-character code that allows third-party apps to authenticate with Gmail SMTP. Separate from your regular password. Required when 2FA is enabled.

**Publication ID (Hashnode)**
The unique identifier for a Hashnode blog. For AIInsightsDaily: `69ffbfa5e3eebc2e20068ab3`. Retrieved via GraphQL `me.publications` query.

**Canonical URL**
The "original source" URL for a piece of content. Setting this on Medium (pointing to Dev.to) tells search engines which version is the original, preventing SEO penalties for duplicate content.

**mrkdwn**
Slack's variant of Markdown for Block Kit messages. Similar to standard Markdown but uses `<url|text>` for links and `*text*` for bold.

---

## Process Names

**Content Pipeline**
The 3-step sequence: `fetch-news` → `generate-post` → `optimize-post`

**Publish Pipeline**
The parallel dual-platform post: `post-to-devto` + `post-to-hashnode` via `post-to-platforms`

**Notification Layer**
Email + Slack notifications sent after publishing: `send-email` + `notify-slack`

**Analytics Layer**
Post-run logging: `log-analytics` + `dashboard`

**Health Check Loop**
The `for i in $(seq 1 30)` loop in the workflow that polls `localhost:11434/api/tags` every 3 seconds to confirm Ollama is ready before running scripts.

**Promise.race Timeout**
The RSS fetching pattern in `fetch-news.js` that races each feed parse against a 10-second timeout, ensuring slow/hung feeds don't block the entire pipeline.

**Graceful Skip**
When `generate-post.js` detects Ollama isn't available locally, it exits with code 0 instead of failing. Allows all other scripts to be tested without Ollama installed.
