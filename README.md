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
                          log-analytics.js
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Aki-Akilan/ai-blog-automation.git
cd ai-blog-automation
npm install
```

### 2. Configure secrets

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required values:
| Secret | Where to get it |
|--------|----------------|
| `GITHUB_TOKEN` | GitHub → Settings → Developer Settings → PAT |
| `DEVTO_API_KEY` | dev.to → Settings → Account → API Keys |
| `HASHNODE_TOKEN` | hashnode.com → Account Settings → Developer |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_APP_PASSWORD` | Google Account → Security → App Passwords |

### 3. Add GitHub Secrets (for Actions)

Go to your repo → Settings → Secrets and variables → Actions → New secret:

- `DEVTO_API_KEY`
- `HASHNODE_TOKEN`
- `EMAIL_USER`
- `EMAIL_APP_PASSWORD`

### 4. Enable GitHub Actions

The workflow runs automatically at 6 AM IST (00:30 UTC) every day.

To trigger manually: Actions tab → Daily Blog Post → Run workflow

## Local Testing

```bash
# Test individual scripts
npm run fetch-news       # Fetch AI news
npm run generate-post    # Generate blog post (requires local Ollama)
npm run optimize-post    # SEO optimize
npm run test-apis        # Verify API connections (no posting)
npm run run-all          # Full pipeline

# Run tests
npm test
```

## Monitoring

- **Logs**: Check GitHub Actions run logs
- **Analytics**: `data/analytics.json`
- **Dashboard**: Open `data/dashboard.html` in browser

## Medium (manual)

Medium doesn't have a free API. The daily email contains:
- Full formatted post content
- One-click copy button
- Step-by-step Medium posting guide

## Phase Progress

See [PROGRESS.md](PROGRESS.md) for implementation status.

## Author

Akilan — [Dev.to](https://dev.to/AIInsightsDaily) · [Hashnode](https://hashnode.com/@AIInsightsDaily) · [Medium](https://medium.com/@aiinsightsdaily0406)
