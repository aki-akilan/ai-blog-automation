# API Reference

## Dev.to API

**Base URL:** `https://dev.to/api`  
**Auth:** `api-key` request header  
**Docs:** developers.forem.com/api

### Create Article
```
POST /articles
Header: api-key: YOUR_KEY
```

**Request body:**
```json
{
  "article": {
    "title": "Post title",
    "body_markdown": "# Post content in markdown",
    "published": true,
    "description": "SEO meta description (max 155 chars)",
    "tags": ["ai", "machinelearning"],
    "canonical_url": null
  }
}
```

**Response (201):**
```json
{
  "id": 3642480,
  "title": "Post title",
  "url": "https://dev.to/username/post-slug-xxxx",
  "published": true
}
```

**Error codes:**
- `401` Invalid API key
- `422` Duplicate title or validation error
- `429` Rate limited (1000 requests/day)

**Notes:**
- `published: false` saves as draft
- Tags max: 4
- Body must be valid markdown

---

## Hashnode GraphQL API

**Endpoint:** `https://gql.hashnode.com/`  
**Auth:** `Authorization: TOKEN` header (no "Bearer" prefix needed)  
**Docs:** apidocs.hashnode.com

### Get Publication ID
```graphql
query {
  me {
    publications(first: 1) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "me": {
      "publications": {
        "edges": [{
          "node": {
            "id": "69ffbfa5e3eebc2e20068ab3",
            "title": "AIInsightsDaily"
          }
        }]
      }
    }
  }
}
```

### Publish Post
```graphql
mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) {
    post {
      id
      title
      url
      publishedAt
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "title": "Post title",
    "contentMarkdown": "# Post content",
    "publicationId": "69ffbfa5e3eebc2e20068ab3",
    "tags": [
      { "slug": "ai", "name": "ai" },
      { "slug": "machinelearning", "name": "machinelearning" }
    ],
    "metaTags": {
      "description": "SEO description"
    }
  }
}
```

**Error format:**
```json
{
  "errors": [{ "message": "Error description" }]
}
```

**Notes:**
- Publication ID: `69ffbfa5e3eebc2e20068ab3` (AIInsightsDaily)
- Tags must be objects: `{ slug, name }` — NOT plain strings
- No "Bearer" prefix on Authorization header

---

## Gmail SMTP

**Host:** `smtp.gmail.com`  
**Port:** 587 (STARTTLS) or 465 (SSL)  
**Auth:** Gmail address + App Password (NOT regular password)

**nodemailer config:**
```javascript
nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aiinsightsdaily0406@gmail.com',
    pass: 'xxxx xxxx xxxx xxxx'  // 16-char App Password
  }
})
```

**Limits:**
- 500 emails/day (free Gmail)
- 1 email/day in this automation = well within limits

**Requirements:**
- 2-Step Verification must be enabled
- App Password must be generated (not regular password)
- "Less Secure Apps" is deprecated — App Password is the only way

---

## Ollama API

**Base URL:** `http://localhost:11434` (on GitHub Actions runner)  
**Auth:** None  
**Docs:** ollama.com/library

### Health Check
```
GET /api/tags
```
Returns list of installed models. Used to verify Ollama is ready.

### Generate Text
```
POST /api/generate
```

**Request:**
```json
{
  "model": "mistral",
  "prompt": "Your full prompt here",
  "stream": false,
  "options": {
    "temperature": 0.75,
    "top_p": 0.9,
    "top_k": 40,
    "num_predict": 1500,
    "seed": 20260510
  }
}
```

**Response:**
```json
{
  "response": "Generated text content...",
  "done": true,
  "total_duration": 180000000000
}
```

**Notes:**
- `stream: false` waits for full response (simpler)
- `num_predict` controls max output tokens (1500 ≈ 800 words)
- `seed` makes output reproducible for same date
- Timeout must be 480000ms (8 min) on GitHub Actions 2-core CPU

---

## Slack Incoming Webhook

**URL:** stored in `SLACK_WEBHOOK_URL` env var  
**Auth:** URL-based (keep it secret)  
**Docs:** api.slack.com/messaging/webhooks

### Send Message
```
POST {SLACK_WEBHOOK_URL}
Content-Type: application/json
```

**Simple text:**
```json
{ "text": "Hello from AI Blog!" }
```

**Block Kit (rich formatting):**
```json
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "Title", "emoji": true }
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": "*Bold* and _italic_ and `code`" }
    }
  ]
}
```

**Limits:**
- 3000 chars per text block
- 50 blocks per message
- Rate limit: ~1 message/second

**mrkdwn formatting:**
- `*bold*` → **bold**
- `_italic_` → *italic*
- `<url|link text>` → clickable link
- `` `code` `` → inline code
