# .claude/ Knowledge Base — Quick Start

This folder is the complete knowledge base for the AI Blog Automation project.
Start here when opening this project in a new Claude Code conversation.

---

## First Thing to Read

**→ [CLAUDE.md](./CLAUDE.md)** — Master context. Project overview, tech stack, critical rules, quick commands, file map.

---

## File Index

### Core Files
| File | Purpose |
|------|---------|
| [CLAUDE.md](./CLAUDE.md) | Master context — READ FIRST |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full system design + ASCII data flow |
| [DECISIONS.md](./DECISIONS.md) | 8 ADRs — why things are built the way they are |
| [AUTO_UPDATE_PROMPT.md](./AUTO_UPDATE_PROMPT.md) | How to use `🚀 ADD_FEATURE:` command |
| [.claude-config.json](./.claude-config.json) | KB metadata, next ADR number, feature list |
| [CLAUDE_PROGRESS.md](./CLAUDE_PROGRESS.md) | KB build status tracker |

### Skills (How to do things)
| File | Use When |
|------|---------|
| [skills/content-generation/SKILL.md](./skills/content-generation/SKILL.md) | Posts are repetitive, generation fails, tuning prompts |
| [skills/platform-posting/SKILL.md](./skills/platform-posting/SKILL.md) | Adding a platform, API auth issues, publishing errors |
| [skills/debugging/SKILL.md](./skills/debugging/SKILL.md) | Automation failed, something didn't work |
| [skills/deployment/SKILL.md](./skills/deployment/SKILL.md) | First setup, adding secrets, pushing changes |
| [skills/testing/SKILL.md](./skills/testing/SKILL.md) | Before deploying, verifying a fix, smoke testing |

### Workflows (Step-by-step guides)
| File | Use When |
|------|---------|
| [workflows/DAILY_OPERATIONS.md](./workflows/DAILY_OPERATIONS.md) | Understanding what runs daily, Akilan's 30-sec task |
| [workflows/ADD_NEW_PLATFORM.md](./workflows/ADD_NEW_PLATFORM.md) | Adding Twitter, LinkedIn, Reddit, etc. |
| [workflows/DEBUG_FAILED_POST.md](./workflows/DEBUG_FAILED_POST.md) | Quick failure diagnosis + fix table |
| [workflows/ADD_NEW_FEATURE.md](./workflows/ADD_NEW_FEATURE.md) | Planning and implementing a new feature |
| [workflows/EMERGENCY_RECOVERY.md](./workflows/EMERGENCY_RECOVERY.md) | Credentials compromised, repo broken, manual post needed |

### Context (Background knowledge)
| File | Use When |
|------|---------|
| [context/PROJECT_OVERVIEW.md](./context/PROJECT_OVERVIEW.md) | Understanding goals, revenue model, milestones |
| [context/TECH_STACK.md](./context/TECH_STACK.md) | Why a technology was chosen, what's NOT used |
| [context/API_DOCS.md](./context/API_DOCS.md) | API request/response formats, error codes |
| [context/CREDENTIALS_GUIDE.md](./context/CREDENTIALS_GUIDE.md) | Where to get each credential, rotation schedule |
| [context/GLOSSARY.md](./context/GLOSSARY.md) | Project terms, acronyms, API terminology |

### Prompts (Reusable AI prompt templates)
| File | Use When |
|------|---------|
| [prompts/blog-post.md](./prompts/blog-post.md) | Default daily post template |
| [prompts/seo-optimization.md](./prompts/seo-optimization.md) | SEO-focused post days |
| [prompts/tutorial-style.md](./prompts/tutorial-style.md) | How-to posts |
| [prompts/social-post.md](./prompts/social-post.md) | Twitter/LinkedIn/Reddit posts |
| [prompts/image-generation.md](./prompts/image-generation.md) | Featured image generation |

### Templates (Reusable code)
| File | Use When |
|------|---------|
| [templates/new-script.js](./templates/new-script.js) | Creating any new automation script |
| [templates/new-platform.js](./templates/new-platform.js) | Adding a new publishing platform |
| [templates/api-test.js](./templates/api-test.js) | Adding a new platform's auth test |
| [templates/error-handler.js](./templates/error-handler.js) | Copy-paste error handling patterns |

### Learnings
| File | Contents |
|------|---------|
| [learnings/2026-05-mistakes.md](./learnings/2026-05-mistakes.md) | 8 real mistakes made during build + fixes |
| [learnings/what-worked.md](./learnings/what-worked.md) | 11 successful patterns to repeat |
| [learnings/optimization-ideas.md](./learnings/optimization-ideas.md) | 14 performance + quality improvements |

### Future
| File | Contents |
|------|---------|
| [future/ROADMAP.md](./future/ROADMAP.md) | Q2-Q4 2026 + 2027 vision |
| [future/IDEAS_BACKLOG.md](./future/IDEAS_BACKLOG.md) | 15 feature ideas with effort/impact ratings |
| [future/EXPERIMENTS.md](./future/EXPERIMENTS.md) | A/B test ideas with hypotheses and methods |

---

## Common Operations

### "Something broke"
1. Check [workflows/DEBUG_FAILED_POST.md](./workflows/DEBUG_FAILED_POST.md) — failure → fix table
2. Deeper: [skills/debugging/SKILL.md](./skills/debugging/SKILL.md) — full issue catalog

### "I want to add a feature"
```
🚀 ADD_FEATURE: [feature name]
[description]
```
See [AUTO_UPDATE_PROMPT.md](./AUTO_UPDATE_PROMPT.md) for examples. Check [future/IDEAS_BACKLOG.md](./future/IDEAS_BACKLOG.md) for ready-made ADD_FEATURE prompts.

### "I need to add a new platform"
Follow [workflows/ADD_NEW_PLATFORM.md](./workflows/ADD_NEW_PLATFORM.md) step by step.
Use [templates/new-platform.js](./templates/new-platform.js) as the starting point.

### "Credentials need rotating"
See [context/CREDENTIALS_GUIDE.md](./context/CREDENTIALS_GUIDE.md) → Monthly Rotation Schedule.

### "I want to understand the system"
Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the full data flow diagram.

---

## Stats

| Metric | Value |
|--------|-------|
| Total files in .claude/ | 26 files |
| Phases completed | 5/5 |
| Skills documented | 5 |
| Workflow guides | 5 |
| Context documents | 5 |
| Prompt templates | 5 |
| Code templates | 4 |
| Learning files | 3 |
| Future planning files | 3 |
| ADRs | 8 (next: ADR-009) |
| Ideas in backlog | 15 |
| Experiments planned | 5 |
