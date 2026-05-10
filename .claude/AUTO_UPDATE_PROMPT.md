# Auto-Update System — ADD_FEATURE Command

## How to Add a New Feature

When you want to add a feature, tell Claude Code:

```
🚀 ADD_FEATURE: [feature name]
Brief description of what you want.
```

Claude will automatically:
1. Create `.claude/skills/[feature]/SKILL.md`
2. Create `scripts/[feature-script].js`
3. Add ADR to `DECISIONS.md` (next number from `.claude-config.json`)
4. Update `ARCHITECTURE.md` data flow
5. Update `.github/workflows/daily-post.yml` if workflow step needed
6. Update `.claude-config.json` timestamps + features list
7. Update `CLAUDE_PROGRESS.md`

---

## Examples

### Example 1: Twitter/X Auto-Post
```
🚀 ADD_FEATURE: Twitter Auto-Post
After publishing to Dev.to and Hashnode, automatically post a 
thread to Twitter/X with the article summary and link.
```

Claude will create:
- `scripts/post-to-twitter.js` (Twitter API v2 + OAuth2)
- `.claude/skills/platform-posting/twitter-SKILL.md`
- ADR-009: Add Twitter as publishing platform
- Update `post-to-platforms.js` to include Twitter
- Add `TWITTER_BEARER_TOKEN` to secrets guide

---

### Example 2: AI-Generated Featured Image
```
🚀 ADD_FEATURE: Featured Image Generation
Generate a featured image for each post using Stable Diffusion
or DALL-E and upload it to Dev.to and Hashnode.
```

Claude will create:
- `scripts/generate-image.js`
- `.claude/skills/content-generation/image-SKILL.md`
- ADR-009: Add AI image generation
- Update workflow to add image step before publishing

---

### Example 3: Google Sheets Analytics
```
🚀 ADD_FEATURE: Google Sheets Analytics Sync
After each post, append a row to the Google Sheets spreadsheet
with post title, URLs, date, word count, and estimated earnings.
```

Claude will create:
- `scripts/sync-to-sheets.js` (Google Sheets API v4)
- ADR-009: Add Google Sheets sync
- Update workflow to add sync step

---

### Example 4: Multi-language Posts
```
🚀 ADD_FEATURE: Multi-language Support
After generating the English post, also generate a Tamil version
and publish it to a separate Hashnode blog.
```

Claude will create:
- `scripts/translate-post.js` (Ollama translation prompt)
- `config/languages.json`
- ADR-009: Add multi-language support
- Update workflow with translation step

---

## When NOT to Use ADD_FEATURE

Don't use it for:
- Bug fixes → just describe the bug
- Config changes (feeds, prompts) → edit the JSON files directly
- Credential updates → update `.env` and GitHub Secrets
- One-off scripts → create manually without the full KB update

---

## Feature Status Tracking

After adding a feature, it appears in `.claude-config.json`:

```json
{
  "features": [
    {
      "name": "Twitter Auto-Post",
      "status": "active",
      "addedDate": "2026-06-01",
      "script": "scripts/post-to-twitter.js",
      "adr": "ADR-009"
    }
  ]
}
```

---

## Manual Feature Addition Checklist

If adding a feature without the command:

```
☐ Script created in scripts/
☐ Script exports { main } for module use
☐ Script uses process.env (not hardcoded values)
☐ Error handling with retry (3 attempts)
☐ Slack notification for failure (non-fatal)
☐ Added to daily-post.yml workflow
☐ Credentials added to .env + GitHub Secrets
☐ docs/github-secrets-guide.md updated
☐ ADR added to DECISIONS.md
☐ ARCHITECTURE.md data flow updated
☐ SKILL.md created in .claude/skills/
☐ .claude-config.json updated
```
