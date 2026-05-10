# Prompt: Social Media Posts

## When to Use
When adding social media auto-posting features (Twitter/X, LinkedIn, Reddit).
Use these prompts with Ollama to generate platform-specific content from the blog post.

---

## Twitter/X Thread Prompt

```
You are a tech Twitter/X creator. Based on the following blog post, write an 
engaging Twitter thread of 5-7 tweets.

Requirements:
- Tweet 1: Hook (max 280 chars) — a surprising stat, bold claim, or question
- Tweets 2-5: One key insight per tweet (max 280 chars each)
- Tweet 6: Practical takeaway (max 280 chars)
- Tweet 7: CTA — link to full post: {{DEVTO_URL}}
- Use line breaks for readability
- Include 2-3 relevant hashtags in the last tweet only: #AI #MachineLearning #Tech
- No emojis unless they add value
- Conversational tone, not corporate

Blog post title: {{POST_TITLE}}
Blog post content:
{{POST_CONTENT_SUMMARY}}

Write the thread now (number each tweet):
```

---

## LinkedIn Post Prompt

```
You are a professional tech content creator on LinkedIn. Based on this blog post, 
write a LinkedIn article post (not a share — a full post).

Requirements:
- Opening line: bold statement or insight (no "I'm excited to share...")
- 3-4 short paragraphs with key insights from the post
- Use line breaks liberally (LinkedIn rewards them)
- Include 1 numbered list or 3 bullet points
- End with a genuine question to drive comments
- Include 3-5 hashtags at the bottom
- Length: 150-300 words
- Tone: professional but human, not corporate

Blog post title: {{POST_TITLE}}
Key insights: {{POST_CONTENT_SUMMARY}}

Write the LinkedIn post now:
```

---

## Reddit Submission Prompt

```
Based on this AI blog post, write a Reddit submission for r/MachineLearning or r/artificial.

Requirements:
- Title: informative and specific (no clickbait, Reddit hates it)
- Body: 2-3 paragraphs summarizing the key points
- Add value beyond just "here's my blog post"
- Include genuine analysis or opinion
- End with an open question to spark discussion
- Length: 100-200 words
- Do NOT include the blog URL in the body (add it as a comment)

Blog post title: {{POST_TITLE}}
Post content:
{{POST_CONTENT_SUMMARY}}

Write the Reddit post now:
```

---

## Variables

| Variable | Source |
|----------|--------|
| `{{POST_TITLE}}` | `data/post-meta.json` → title |
| `{{DEVTO_URL}}` | `data/devto-result.json` → url |
| `{{POST_CONTENT_SUMMARY}}` | First 500 words of `data/optimized-post.md` |

---

## Implementation Notes (Future)

**Twitter/X API v2:**
- Cost: Free tier (1,500 tweets/month write access)
- Package: `twitter-api-v2`
- Auth: OAuth 2.0 with PKCE
- Credential: `TWITTER_BEARER_TOKEN` + `TWITTER_CLIENT_ID` + `TWITTER_CLIENT_SECRET`

**LinkedIn API:**
- Requires approved Developer App
- Uses OAuth 2.0
- Endpoint: `POST /v2/ugcPosts`

**Reddit API:**
- OAuth required
- `snoowrap` npm package
- Needs `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_REFRESH_TOKEN`
