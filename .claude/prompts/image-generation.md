# Prompt: Image Generation

## When to Use
When adding a featured image generation feature to the pipeline.
Not yet implemented — use this when building `scripts/generate-image.js`.

---

## DALL-E 3 Prompt Template

```
A professional, modern tech blog featured image for an article titled "{{POST_TITLE}}".

Style: Clean, minimalist, tech-focused
Color palette: Deep blue (#1a1a2e) and purple (#667eea) with white accents
Elements to include: Abstract AI visualization, neural network nodes, or circuit patterns
Text: Do NOT include any text in the image
Aspect ratio: 16:9 (1200x630px for social sharing)
Mood: Professional, forward-looking, optimistic about technology
```

---

## Stable Diffusion Prompt Template

```
positive: tech blog cover image, AI theme, neural network visualization, 
deep blue purple gradient background, minimalist design, professional, 
clean lines, glowing nodes, abstract technology, 16:9 aspect ratio, 
high quality, digital art

negative: text, words, letters, watermark, logo, person, face, 
cartoon, anime, low quality, blurry
```

---

## Style Guidelines

**Brand colors:**
- Primary: `#667eea` (purple)
- Secondary: `#764ba2` (dark purple)  
- Background: `#1a1a2e` (deep navy)
- Accent: white / light gray

**Visual themes by topic:**
| Topic | Visual |
|-------|--------|
| New AI model | Brain + circuit nodes |
| AI tools | Gear + lightning bolt |
| AI safety | Shield + AI icon |
| AI business | Bar chart + robot |
| AI future | Rocket + stars |

---

## Implementation Notes (Future)

When implementing `scripts/generate-image.js`:

1. **Free option:** Stable Diffusion via `replicate.com` API
   - Cost: ~$0.0023/image
   - Model: `stability-ai/sdxl`

2. **Paid option:** DALL-E 3 via OpenAI API
   - Cost: $0.04/image (1024x1024)
   - Better quality, follows prompts more accurately

3. **Upload to:**
   - Dev.to: `POST /articles` with `main_image` URL field
   - Hashnode: `coverImageOptions` in PublishPost mutation

4. **GitHub storage:** commit generated images to `data/images/` with date prefix
   - `data/images/2026-05-11-featured.png`

---

## Prompt Customization by Post Type

```javascript
// In generate-image.js
function buildImagePrompt(title, tags) {
  const theme = tags.includes('tutorial') ? 'step-by-step guide' :
                tags.includes('llm') ? 'language model visualization' :
                'AI technology abstract';
  return DALL_E_TEMPLATE
    .replace('{{POST_TITLE}}', title)
    .replace('{{THEME}}', theme);
}
```
