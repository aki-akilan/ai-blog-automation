require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const AI_TAGS = [
  'ai', 'machinelearning', 'artificialintelligence', 'deeplearning',
  'llm', 'generativeai', 'technology', 'programming', 'datascience',
  'automation', 'tutorial', 'webdev', 'productivity'
];

function extractTitle(content) {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  const firstLine = content.split('\n').find(l => l.trim().length > 0);
  return firstLine ? firstLine.replace(/^#+\s*/, '').trim() : 'AI Insights Daily';
}

function generateMetaDescription(content) {
  const cleaned = content
    .replace(/^#+.*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  let desc = '';
  for (const sentence of sentences) {
    if ((desc + sentence).length <= 155) {
      desc += sentence;
    } else break;
  }
  return desc.trim() || cleaned.slice(0, 155);
}

function selectTags(content) {
  const lower = content.toLowerCase();
  const tagMap = {
    'machine learning': 'machinelearning',
    'deep learning': 'deeplearning',
    'large language model': 'llm',
    'llm': 'llm',
    'generative ai': 'generativeai',
    'gpt': 'llm',
    'chatgpt': 'llm',
    'claude': 'ai',
    'automation': 'automation',
    'tutorial': 'tutorial',
    'data science': 'datascience',
    'programming': 'programming',
    'productivity': 'productivity',
    'web': 'webdev'
  };

  const matched = new Set(['ai', 'artificialintelligence']);
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) matched.add(tag);
    if (matched.size >= 7) break;
  }

  while (matched.size < 5) {
    const fallback = AI_TAGS.find(t => !matched.has(t));
    if (fallback) matched.add(fallback);
    else break;
  }

  return [...matched].slice(0, 7);
}

function ensureH1(content) {
  if (/^#\s+/m.test(content)) return content;
  const firstLine = content.split('\n')[0];
  return `# ${firstLine}\n\n${content}`;
}

function ensureH2Sections(content) {
  const hasH2 = /^##\s+/m.test(content);
  if (hasH2) return content;
  const lines = content.split('\n');
  const result = [];
  let paraCount = 0;
  for (const line of lines) {
    if (line.trim() === '' && paraCount > 0 && paraCount % 3 === 0 && result.length > 2) {
      result.push('');
      result.push('## Key Insights');
    }
    result.push(line);
    if (line.trim().length > 0) paraCount++;
  }
  return result.join('\n');
}

function addCTA(content) {
  const ctaSection = `
---

## Stay Updated with AI Insights

Found this useful? Here's how to stay in the loop:

- **Follow** this blog for daily AI news and analysis
- **Share** this post with your team or network
- **Comment** below — what's your take on today's AI developments?
- **Subscribe** to get the next post delivered to your inbox

*Published daily by [AI Insights Daily](https://dev.to/AIInsightsDaily) — your source for the latest in artificial intelligence.*
`;
  if (content.includes('Stay Updated') || content.includes('Subscribe')) return content;
  return content.trimEnd() + '\n' + ctaSection;
}

async function main() {
  console.log(chalk.bold.cyan('\n🔍 Optimizing Blog Post for SEO...\n'));

  const inPath = path.join(__dirname, '../data/today-post.md');
  if (!fs.existsSync(inPath)) {
    console.error(chalk.red('❌ today-post.md not found. Run generate-post.js first.'));
    process.exit(1);
  }

  let content = fs.readFileSync(inPath, 'utf8');
  console.log(chalk.gray(`  Input: ${content.split(/\s+/).length} words`));

  // Apply optimizations
  content = ensureH1(content);
  content = ensureH2Sections(content);
  content = addCTA(content);

  const title = extractTitle(content);
  const metaDescription = generateMetaDescription(content);
  const tags = selectTags(content);

  console.log(chalk.green(`  ✓ Title: ${title}`));
  console.log(chalk.green(`  ✓ Meta description: ${metaDescription.length} chars`));
  console.log(chalk.green(`  ✓ Tags: ${tags.join(', ')}`));

  // Prepend frontmatter for reference (stripped before publishing)
  const frontmatter = `---
title: "${title.replace(/"/g, "'")}"
description: "${metaDescription.replace(/"/g, "'")}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
date: "${new Date().toISOString().split('T')[0]}"
author: "${process.env.AUTHOR_NAME || 'Akilan'}"
---

`;

  const optimized = frontmatter + content;
  const outPath = path.join(__dirname, '../data/optimized-post.md');
  fs.writeFileSync(outPath, optimized);

  // Save metadata separately for publishing scripts to use
  const meta = { title, metaDescription, tags, date: new Date().toISOString() };
  fs.writeFileSync(
    path.join(__dirname, '../data/post-meta.json'),
    JSON.stringify(meta, null, 2)
  );

  const wordCount = content.split(/\s+/).length;
  console.log(chalk.bold.green(`\n✅ Optimized post saved to data/optimized-post.md (~${wordCount} words)`));
  console.log(chalk.bold.green(`✅ Metadata saved to data/post-meta.json\n`));
}

main().catch(err => {
  console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
  process.exit(1);
});
