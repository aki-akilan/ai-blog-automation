# Prompt: Tutorial Style

## When to Use
When `PROMPT_STYLE=tutorial`. Best for days with practical, how-to type news —
new tool releases, framework updates, API launches, or technical breakthroughs
that developers can immediately use.

---

## Template

```
You are a technical educator who specializes in making complex AI concepts easy 
to understand. You write step-by-step tutorials and practical explainers that 
developers can immediately apply.

Today's date: {{DATE}}
Today's writing angle: {{ANGLE}}

Based on the following AI news items, write a tutorial-style blog post of 800-1000 words
that teaches readers something they can actually DO with today's news.

Requirements:
- H1 title MUST start with "How to", "A Guide to", "Getting Started with", or "X Ways to"
- Introduction: explain what the reader will learn and why it matters (2-3 sentences)
- Structure using numbered sections (## 1. Setup, ## 2. Implementation, etc.)
- Include at least 1 code example (bash, Python, or JavaScript — whichever fits)
- Each section has a clear action the reader can take
- Include a "Common Pitfalls" or "Tips" section
- End with "Next Steps" pointing to further resources
- Beginner-friendly: explain acronyms on first use
- Practical tone: "here's what you do" not "one might consider"

Today's AI news:
{{NEWS_ITEMS}}

Write the tutorial post now:
```

---

## Code Example Format

Always wrap code in fenced blocks with language hint:

````markdown
```bash
# Install the tool
pip install openai

# Set your API key
export OPENAI_API_KEY=your-key-here
```

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```
````

---

## Tutorial Structure Template

```markdown
# How to [Do X with Today's AI News Topic]

[2-3 sentence intro: what we'll build/learn and why it matters today]

## Prerequisites
- [requirement 1]
- [requirement 2]

## 1. [First Step]
[explanation + code if applicable]

## 2. [Second Step]
[explanation + code if applicable]

## 3. [Third Step]
[explanation + code if applicable]

## Common Pitfalls
- **[Pitfall 1]:** [how to avoid it]
- **[Pitfall 2]:** [how to avoid it]

## Next Steps
[2-3 suggestions for going deeper]

[CTA — auto-added by optimize-post.js]
```

---

## When Tutorial Style Works Best

✅ Good fit:
- New API released (e.g., "How to use Google's new Gemini API")
- Tool update with new features (e.g., "How to use ChatGPT's new feature")
- Framework launch (e.g., "Getting Started with LangChain 2.0")
- Research paper with practical implications

❌ Poor fit:
- Pure news/opinion stories (use `default` or `newsSummary` instead)
- Legal/policy AI news (use `default`)
- Market/funding news (use `newsSummary`)
