# Workflow: Add New Feature

## Quickest Way — Use the Command

Tell Claude Code:
```
🚀 ADD_FEATURE: [feature name]
[brief description of what you want]
```

See `.claude/AUTO_UPDATE_PROMPT.md` for examples and what Claude will auto-create.

---

## When NOT to Add a Feature

Skip adding a feature if:
- It would require a paid API (add cost to your model)
- The benefit doesn't justify the complexity
- It would add > 5 minutes to the daily workflow run (GitHub Actions free tier has limits)
- It only works locally (must work headlessly on GitHub Actions)

---

## Planning Template

Before implementing, answer:

```
Feature name: _______________
What problem does it solve? _______________
Input: what does it need? _______________
Output: what does it produce? _______________
New credentials needed? _______________
New workflow steps needed? _______________
Estimated run time impact: +___ seconds
Test approach: _______________
```

---

## Manual Implementation Steps

If not using the ADD_FEATURE command:

### 1. Create the script
```bash
cp .claude/templates/new-script.js scripts/[feature-name].js
```

Required structure:
- `require('dotenv').config()` at top
- All credentials from `process.env`
- Error handling with retry (3 attempts)
- `module.exports = { main }` at bottom
- Chalk logging: blue for progress, green for success, yellow for warnings, red for errors

### 2. Add to workflow (if needed)
```yaml
# .github/workflows/daily-post.yml
- name: Step N — [Feature name]
  run: node scripts/[feature-name].js
```

Position matters — add after the step whose output you need.

### 3. Add credentials
```bash
# .env
NEW_API_KEY=value

# GitHub Secrets (required for Actions)
# Add at: github.com/Aki-Akilan/ai-blog-automation/settings/secrets/actions
```

### 4. Document
- Create `SKILL.md` in relevant `.claude/skills/` folder
- Add ADR to `DECISIONS.md`
- Update `ARCHITECTURE.md` data flow
- Update `.claude-config.json` features + nextADR

### 5. Test
```bash
# Dry run first
node scripts/[feature-name].js

# Integration test
TEST_MODE=true npm run run-all
```

---

## Feature Implementation Checklist

```
☐ Script created (follows standard pattern)
☐ Uses process.env (no hardcoded values)
☐ Has retry logic (3 attempts)
☐ Slack failures are non-fatal
☐ Added to workflow YAML (if needed)
☐ Credentials in .env + GitHub Secrets
☐ docs/github-secrets-guide.md updated
☐ Unit tested locally
☐ TEST_MODE=true integration tested
☐ SKILL.md created
☐ ADR added to DECISIONS.md
☐ ARCHITECTURE.md updated
☐ .claude-config.json updated
☐ Pushed to GitHub + Actions run verified
```

---

## Feature Ideas to Draw From

See `.claude/future/IDEAS_BACKLOG.md` for prioritized list.

Top candidates:
1. Twitter/X thread auto-post
2. LinkedIn article post
3. Google Sheets analytics sync
4. Featured image generation (DALL-E or Stable Diffusion)
5. Multi-language post (Tamil version)

---

## Related
- [AUTO_UPDATE_PROMPT.md](../AUTO_UPDATE_PROMPT.md) — ADD_FEATURE command
- [templates/new-script.js](../templates/new-script.js) — script template
- [DECISIONS.md](../DECISIONS.md) — ADR format
- [future/IDEAS_BACKLOG.md](../future/IDEAS_BACKLOG.md) — feature ideas
