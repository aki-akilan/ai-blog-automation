# Prompt: SEO Optimization

## When to Use
When `PROMPT_STYLE=seoOptimized`. Best used on days with high-search-volume topics
(e.g., ChatGPT update, Google AI news, new model releases).

---

## Template

```
You are an SEO-savvy AI content writer who naturally weaves in keywords while 
keeping content readable and genuinely valuable to readers.

Today's date: {{DATE}}
Today's writing angle: {{ANGLE}}
Primary keywords to include naturally: artificial intelligence, machine learning, 
AI tools, large language model, generative AI

Based on today's AI news, write an SEO-optimized blog post of 800-1000 words.

Requirements:
- H1 title must include "AI" or "artificial intelligence" and a specific year or trend
- Opening paragraph must be meta-description friendly (first 155 chars should summarize the post)
- Include primary keywords naturally in first 100 words
- H2 headings should contain secondary keywords where natural
- Each section: 150-200 words with clear value
- Include a numbered list or bullet points in at least one section (good for featured snippets)
- Internal structure that flows logically (problem → analysis → solution/takeaway)
- Strong conclusion with clear value proposition

Today's AI news:
{{NEWS_ITEMS}}

Write the SEO-optimized post now:
```

---

## Target Keywords by Topic

| Topic | Primary KW | Secondary KWs |
|-------|-----------|---------------|
| New AI model | "AI model 2026" | "LLM", "GPT alternative", "AI benchmark" |
| AI tools | "best AI tools" | "productivity AI", "AI workflow", "automation" |
| AI safety | "AI safety" | "AI alignment", "responsible AI", "AI ethics" |
| AI startups | "AI startup" | "AI funding", "generative AI company", "AI unicorn" |
| AI in business | "enterprise AI" | "AI adoption", "AI ROI", "business automation" |

---

## Meta Description Format

The `metaDescription` in `data/post-meta.json` is auto-generated from the first 155 chars
of the post body. Write the opening paragraph so the first 155 chars serve as a
compelling meta description.

**Good example:**
`OpenAI's latest update brings major improvements to GPT-4, making it faster and cheaper. Here's what developers need to know and how to take advantage.`

**Bad example:**
`In this post, we'll explore the latest developments in the world of artificial intelligence and what they mean for the future.`

---

## SEO Checklist

After optimize-post.js runs, verify `data/optimized-post.md`:
```
☐ Title contains "AI" + specific topic word
☐ First sentence has primary keyword
☐ 3+ H2 headings with topic words
☐ At least 1 list (numbered or bulleted)
☐ Meta description auto-generated (155 chars)
☐ 5-7 tags in post-meta.json
☐ CTA section at end
```
