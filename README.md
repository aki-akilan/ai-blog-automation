# AI Blog Automation

Fully automated AI blog posting system that runs on GitHub Actions.

## What it does

- **Daily at 6 AM IST**: Fetches latest AI news from multiple RSS feeds
- **Generates** a 800-1000 word blog post using Ollama (mistral model)
- **Publishes** automatically to Dev.to and Hashnode
- **Sends email** with full post content for easy Medium copy-paste
- **Logs analytics** with earnings estimates
- **Zero local dependencies** — everything runs on GitHub Actions

## Flow

```
RSS Feeds → fetch-news.js → today-news.json
                                  ↓
                          generate-post.js (Ollama/mistral)
                                  ↓
                          optimize-post.js (SEO + tags)
                                  ↓
              ┌───────────────────┼───────────────────┐
              ↓                                       ↓
      post-to-devto.js                    post-to-hashnode.js
              ↓                                       ↓
              └───────────────────┬───────────────────┘
                                  ↓
                          send-email.js (Gmail → you)
                                  ↓
                    log-analytics.js + dashboard.js
```

---

## Deployment (First-Time Setup)

### Step 1 — Create GitHub repository

```bash
# On GitHub: create a new repo named "ai-blog-automation" (public or private)
# Then push this code:
git remote add origin https://github.com/Aki-Akilan/ai-blog-automation.git
git branch -M main
git push -u origin main
```

### Step 2 — Add GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value |
|-------------|-------|
| `DEVTO_API_KEY` | Your Dev.to API key |
| `HASHNODE_TOKEN` | Your Hashnode personal access token |
| `EMAIL_USER` | `aiinsightsdaily0406@gmail.com` |
| `EMAIL_APP_PASSWORD` | 16-char Gmail App Password |
| `GOOGLE_SHEETS_ID` | (optional) Google Sheets ID for analytics |

> Full instructions: [docs/github-secrets-guide.md](docs/github-secrets-guide.md)

**Or use the helper script (requires `gh` CLI):**
```bash
bash scripts/setup-github-secrets.sh
```

### Step 3 — Create Hashnode blog

Before the first live run, your Hashnode account needs a blog:
1. Go to [hashnode.com](https://hashnode.com)
2. Click your avatar → **Create Blog**
3. Choose a subdomain (e.g. `aiinsightsdaily.hashnode.dev`)

### Step 4 — Trigger first manual run

1. Go to your repo → **Actions** tab
2. Click **Daily Blog Post**
3. Click **Run workflow** → set `test_mode` to `true` for a dry run
4. Watch the logs — each of 7 steps should pass
5. Check email for notification

### Step 5 — Enable daily automation

Once the manual test passes, the workflow runs automatically at **6:00 AM IST** (00:30 UTC) every day via cron. No further action needed.

---

## Local Testing

```bash
# Install dependencies
npm install

# Test individual scripts
npm run fetch-news       # Fetch AI news → data/today-news.json
npm run generate-post    # Generate post (requires local Ollama)
npm run optimize-post    # SEO optimize → data/optimized-post.md
npm run test-apis        # Verify API connections (no posting)
npm run run-all          # Full pipeline end-to-end

# Run tests
npm test
```

**Local Ollama (optional):**
```bash
brew install ollama
ollama serve &
ollama pull mistral
npm run generate-post
```

---

## Monitoring

- **GitHub Actions logs**: Repo → Actions → latest run
- **Run summary**: Each run generates a summary in the Actions tab
- **Analytics file**: `data/analytics.json` (committed after each run)
- **Dashboard**: Open `data/dashboard.html` in browser

---

## Workflow Options (manual trigger)

| Input | Options | Default |
|-------|---------|---------|
| `test_mode` | `true` / `false` | `false` |
| `prompt_style` | `default` / `tutorial` / `newsSummary` / `seoOptimized` | `default` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Ollama step times out | Increase `timeout-minutes` in workflow YAML |
| Dev.to 401 error | Regenerate API key at dev.to → Settings |
| Hashnode "no publication" | Create blog at hashnode.com first |
| Email auth error | Generate Gmail App Password at myaccount.google.com/apppasswords |
| No news fetched | RSS feeds may be temporarily down — retry next day |

---

## Medium (manual)

Medium doesn't have a free API. The daily email contains:
- Full formatted post content
- One-click **Copy to Clipboard** button
- Step-by-step Medium posting guide (2 minutes)

---

## File Structure

```
ai-blog-automation/
├── .github/workflows/
│   └── daily-post.yml          # GitHub Actions schedule
├── scripts/
│   ├── fetch-news.js           # RSS → today-news.json
│   ├── generate-post.js        # Ollama → today-post.md
│   ├── optimize-post.js        # SEO → optimized-post.md + post-meta.json
│   ├── post-to-devto.js        # Dev.to REST API
│   ├── post-to-hashnode.js     # Hashnode GraphQL API
│   ├── post-to-platforms.js    # Master publisher (parallel)
│   ├── send-email.js           # Gmail notification
│   ├── log-analytics.js        # analytics.json logger
│   ├── dashboard.js            # dashboard.html generator
│   ├── test-apis.js            # dry-run API checker
│   └── setup-github-secrets.sh # one-time secrets push
├── config/
│   ├── feeds.json              # RSS feed sources
│   └── prompts.json            # AI prompt templates
├── templates/
│   └── email-template.html     # Email HTML template
├── data/                       # Runtime output (gitignored except analytics)
├── docs/
│   └── github-secrets-guide.md # Detailed secrets setup
├── tests/                      # Test files (Phase 6)
├── .env.example                # Credential template
└── PROGRESS.md                 # Implementation tracker
```

---

## Author

Akilan — [Dev.to](https://dev.to/AIInsightsDaily) · [Hashnode](https://hashnode.com/@AIInsightsDaily) · [Medium](https://medium.com/@aiinsightsdaily0406)
