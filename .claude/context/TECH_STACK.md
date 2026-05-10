# Tech Stack

## Runtime

| Technology | Version | Why Chosen |
|-----------|---------|------------|
| Node.js | 20 (LTS) | JavaScript everywhere, huge npm ecosystem |
| npm | 10+ | Package management, `npm ci` for reproducible installs |
| CommonJS (require) | — | chalk v4 requires CJS; consistency across all scripts |

---

## AI / Content Generation

| Technology | Version | Why Chosen |
|-----------|---------|------------|
| Ollama | latest | Free, runs locally/on CI, no API cost per generation |
| Mistral 7B | latest (Q4 GGUF) | Good quality, ~4GB, runs on 2-core CI CPU |

**Alternatives considered:**
- OpenAI GPT-4: $0.03/post, adds cost at scale → rejected
- Llama 3: Good quality but larger (8B default) → possible future switch
- phi3:mini: Faster (3.8B), lower quality → fallback if timeout issues persist

---

## Publishing APIs

| Platform | API Type | Auth | SDK |
|----------|---------|------|-----|
| Dev.to | REST | `api-key` header | None (plain axios) |
| Hashnode | GraphQL | `Authorization` Bearer | None (plain axios) |

---

## Infrastructure

| Technology | Why |
|-----------|-----|
| GitHub Actions | Free CI/CD, built-in secrets, cron scheduling, 2000 min/month free |
| GitHub repo | Code + analytics storage, no external DB needed |
| ubuntu-latest runner | Standard, has curl/bash, Ollama installs cleanly |

---

## Notifications

| Technology | Why |
|-----------|-----|
| Gmail SMTP (nodemailer) | Free, reliable, Akilan already has Gmail |
| Slack Incoming Webhook | Free, instant, #aiinsightsdaily channel |

---

## Key npm Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | ^1.7.2 | HTTP requests (Ollama, Dev.to, Hashnode, Slack) |
| `rss-parser` | ^3.13.0 | Parse RSS/Atom feeds from news sources |
| `nodemailer` | ^6.9.14 | Gmail SMTP email sending |
| `dotenv` | ^16.4.5 | Load `.env` file into `process.env` |
| `chalk` | ^4.1.2 | Colored terminal output (CJS version) |
| `cheerio` | ^1.0.0-rc.12 | HTML parsing (available, not heavily used) |
| `jest` | ^29.7.0 | Test framework (available for future use) |

**Important:** chalk v4 is CommonJS. Do NOT upgrade to chalk v5 (ES module only — breaks `require()`).

---

## Version Requirements

```json
"engines": { "node": ">=18.0.0" }
```

Node 18+ required for:
- `fetch` API (not used, but available)
- Modern `fs/promises` patterns
- GitHub Actions `setup-node@v4` compatibility

---

## What's NOT Used (and Why)

| Technology | Why Not Used |
|-----------|-------------|
| TypeScript | Adds complexity, not needed for scripts this size |
| Express/server | No server needed — everything is scripts |
| Database (Postgres, MongoDB) | analytics.json committed to repo is sufficient |
| Docker | GitHub Actions runner handles environment |
| Webpack/bundler | CommonJS scripts run directly with node |
| ESLint/Prettier | Not configured — acceptable for automation scripts |

---

## Future Tech Considerations

| Technology | For What |
|-----------|---------|
| `twitter-api-v2` | Twitter/X auto-post feature |
| `googleapis` | Google Sheets sync feature |
| `@tensorflow/tfjs` | Future: on-device performance analytics |
| `sharp` | Image optimization if adding featured images |
| Llama 3 8B | Replace Mistral if quality needs improvement |
