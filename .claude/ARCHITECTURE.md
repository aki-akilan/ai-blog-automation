# System Architecture

## Daily Automation Flow

```
12:00 PM IST (06:30 UTC)
         │
         ▼
┌─────────────────────┐
│  GitHub Actions     │  ubuntu-latest runner
│  daily-post.yml     │  timeout: 30 min
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: SETUP                                             │
│  • checkout repo (fresh, no data/ files)                    │
│  • npm ci (install dependencies)                            │
│  • Slack: "🚀 Automation Started"                           │
│  • Install Ollama + pull mistral (health-check loop)        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: CONTENT GENERATION                                │
│                                                             │
│  fetch-news.js                                              │
│  ├── reads config/feeds.json (5 RSS sources)                │
│  ├── filters by AI keywords (29 terms)                      │
│  ├── Promise.race timeout (10s per feed)                    │
│  └── → data/today-news.json (15 items max)                  │
│                                                             │
│  generate-post.js                                           │
│  ├── picks 6 articles (date-seeded shuffle)                 │
│  ├── injects: date + daily rotating angle (7 angles)        │
│  ├── calls Ollama localhost:11434 (timeout: 8 min)          │
│  └── → data/today-post.md (~800 words)                      │
│                                                             │
│  optimize-post.js                                           │
│  ├── ensures H1, H2 structure                               │
│  ├── generates meta description (155 chars)                 │
│  ├── selects 5-7 tags                                       │
│  ├── adds CTA section                                       │
│  ├── → data/optimized-post.md (with frontmatter)            │
│  └── → data/post-meta.json (title, tags, description)       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: PUBLISHING (parallel)                             │
│                                                             │
│  post-to-platforms.js                                       │
│  ├── Promise.all([postToDevTo(), postToHashnode()])          │
│  │                                                          │
│  ├── post-to-devto.js                                       │
│  │   ├── POST https://dev.to/api/articles                   │
│  │   ├── auth: api-key header                               │
│  │   ├── retry: 3 attempts                                  │
│  │   └── → data/devto-result.json                           │
│  │                                                          │
│  ├── post-to-hashnode.js                                    │
│  │   ├── POST https://gql.hashnode.com/ (GraphQL)           │
│  │   ├── query: me.publications → get publication ID        │
│  │   ├── mutation: publishPost                              │
│  │   ├── retry: 3 attempts                                  │
│  │   └── → data/hashnode-result.json                        │
│  │                                                          │
│  ├── Slack: "✅ Post Published" + Medium import steps        │
│  └── → data/publish-results.json                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: NOTIFICATIONS                                     │
│                                                             │
│  send-email.js                                              │
│  ├── loads: post, meta, publish-results, analytics          │
│  ├── builds HTML from templates/email-template.html         │
│  ├── Gmail SMTP (nodemailer, App Password auth)             │
│  ├── Slack: "📧 Email Sent"                                 │
│  └── Slack: "📄 Full Article" (chunked, mrkdwn formatted)   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: ANALYTICS                                         │
│                                                             │
│  log-analytics.js                                           │
│  ├── appends entry to data/analytics.json                   │
│  └── updates running totals (posts, successes, earnings)    │
│                                                             │
│  dashboard.js                                               │
│  └── generates data/dashboard.html (static, no server)     │
│                                                             │
│  git commit analytics.json + dashboard.html [skip ci]       │
│  git push → repo updated                                    │
└─────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  on: success           on: failure
  Slack: completed      Slack: "❌ Error Alert"
```

---

## External APIs

| API | Type | Auth | Rate Limit | Endpoint |
|-----|------|------|-----------|----------|
| Dev.to | REST | `api-key` header | 1000/day | api.dev.to/api/articles |
| Hashnode | GraphQL | `Authorization` header | generous | gql.hashnode.com |
| Gmail SMTP | SMTP | App Password | 500/day | smtp.gmail.com:587 |
| Slack Webhook | HTTP POST | URL-based | generous | hooks.slack.com/services/... |
| Ollama | REST | none (local) | none | localhost:11434/api/generate |
| RSS Feeds | HTTP GET | none | per-site | various |

---

## Data Flow (files)

```
today-news.json → today-post.md → optimized-post.md
                                        │
                              post-meta.json (title, tags, desc)
                                        │
                    ┌───────────────────┤
                    ▼                   ▼
            devto-result.json   hashnode-result.json
                    └───────────────────┘
                                │
                        publish-results.json
                                │
                        analytics.json (cumulative)
                        dashboard.html (generated)
```

---

## Performance Targets

| Step | Target | Actual |
|------|--------|--------|
| fetch-news | < 30s | ~20s (5 feeds parallel) |
| generate-post | < 8 min | 3-5 min (GitHub Actions) |
| optimize-post | < 1s | ~64ms |
| publish (both) | < 15s | ~8s (parallel) |
| send-email | < 10s | ~3s |
| analytics + dashboard | < 1s | ~120ms |
| **Total** | **< 15 min** | **~10-12 min** |

---

## Error Handling Strategy

| Failure | Behaviour |
|---------|-----------|
| Single RSS feed fails | Skip, continue with others |
| Ollama timeout | Retry 3x with 5s delay |
| Dev.to API error | Retry 3x, log error |
| Hashnode API error | Retry 3x, log error |
| Both platforms fail | Exit 1, Slack error alert |
| One platform fails | Continue (partial success) |
| Email fails (auth) | Immediate clear error, no retry |
| Slack webhook fails | **Non-fatal warning only** — never crashes pipeline |
