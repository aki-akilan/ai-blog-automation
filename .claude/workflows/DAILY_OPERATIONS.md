# Daily Operations

## What Happens at 12:00 PM IST (Automated)

GitHub Actions runner wakes up and runs these 7 steps automatically:

```
12:00 PM  → Slack: "🚀 Automation Started"
12:00 PM  → npm ci (30s)
12:01 PM  → Ollama installs + mistral pulls (~3 min)
12:04 PM  → fetch-news.js → 15 AI articles fetched
12:05 PM  → generate-post.js → Ollama generates post (~4 min)
12:09 PM  → optimize-post.js → SEO pass (<1s)
12:09 PM  → post-to-platforms.js → Dev.to + Hashnode published (~8s)
12:09 PM  → Slack: "✅ Post Published" + Medium import steps
12:09 PM  → send-email.js → email + Slack article (~3s)
12:10 PM  → log-analytics.js + dashboard.js
12:10 PM  → analytics.json committed to repo
12:10 PM  → Slack: "📊 Run Completed"
```

---

## Akilan's Daily Task (30 seconds)

When you see "✅ Post Published" in `#aiinsightsdaily`:

1. **Check Slack** — see the Dev.to URL in the notification
2. **Click** "Open medium.com/p/import →"
3. **Paste** the Dev.to URL → click Import
4. **Review** the imported post (title, content, tags)
5. **Click Publish** on Medium

That's it. Done for the day.

---

## Monitoring the Run

**Slack channel:** `#aiinsightsdaily`  
Expected messages (in order):
- 🚀 Automation Started
- ✅ Post Published (+ links)
- 📧 Email Sent
- 📄 Full Article (chunked)
- 📊 Completed

**GitHub Actions log:**  
`github.com/Aki-Akilan/ai-blog-automation/actions`  
Click the latest run to see step-by-step progress.

**Email:**  
Check `aiinsightsdaily0406@gmail.com` — arrives ~12:10 PM IST

---

## If Nothing Arrives by 12:30 PM

1. Check Actions log for red ×
2. See `.claude/skills/debugging/SKILL.md` for diagnosis
3. If all else fails → `.claude/workflows/EMERGENCY_RECOVERY.md`

---

## Weekly Tasks (Every Sunday)

- [ ] Review `data/analytics.json` — check total posts + platform success rate
- [ ] Open `data/dashboard.html` in browser — visual overview
- [ ] Check Dev.to notifications — respond to comments
- [ ] Check Hashnode dashboard — engagement metrics
- [ ] Scan Medium for import — post any missed days manually
- [ ] Review Slack `#aiinsightsdaily` — any error alerts this week?

---

## Monthly Tasks (Last Sunday)

- [ ] **Rotate credentials** (see `context/CREDENTIALS_GUIDE.md`)
- [ ] Review `future/ROADMAP.md` — any features to implement?
- [ ] Check RSS feeds — any broken? Replace with better sources
- [ ] Review analytics trend — earnings estimate growing?
- [ ] Update `config/prompts.json` if post quality has drifted
- [ ] Clean up Dev.to drafts from TEST_MODE runs
- [ ] Run `node scripts/test-apis.js` to verify all APIs still working

---

## Changing the Schedule

Current: `30 6 * * *` = 12:00 PM IST

To change in `.github/workflows/daily-post.yml`:
```yaml
- cron: '30 1 * * *'   # 7:00 AM IST
- cron: '30 3 * * *'   # 9:00 AM IST
- cron: '30 9 * * *'   # 3:00 PM IST
- cron: '30 12 * * *'  # 6:00 PM IST
```

Push → takes effect on next scheduled time.
