require('dotenv').config();
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const feedsConfig = require('../config/feeds.json');
const parser = new Parser({ timeout: feedsConfig.timeoutMs });

function isAIRelated(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return feedsConfig.aiKeywords.some(kw => lower.includes(kw.toLowerCase()));
}

function cleanSummary(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

async function fetchFeed(feed) {
  try {
    console.log(chalk.blue(`  Fetching: ${feed.name}...`));
    const result = await parser.parseURL(feed.url);
    const items = result.items
      .filter(item => isAIRelated(item.title) || isAIRelated(item.contentSnippet) || isAIRelated(item.content))
      .slice(0, feedsConfig.maxItemsPerFeed)
      .map(item => ({
        title: item.title || 'Untitled',
        link: item.link || '',
        summary: cleanSummary(item.contentSnippet || item.content || item.summary || ''),
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.name,
        category: feed.category
      }));

    console.log(chalk.green(`  ✓ ${feed.name}: ${items.length} AI articles found`));
    return items;
  } catch (err) {
    console.log(chalk.yellow(`  ⚠ ${feed.name}: Failed (${err.message}) — skipping`));
    return [];
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n📰 Fetching AI News...\n'));

  const results = await Promise.allSettled(
    feedsConfig.feeds.map(feed => fetchFeed(feed))
  );

  const allItems = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);

  // Deduplicate by title similarity
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date, newest first, cap at maxTotalItems
  const sorted = unique
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, feedsConfig.maxTotalItems);

  if (sorted.length === 0) {
    console.log(chalk.red('\n❌ No AI news fetched. Check feed URLs and network connection.'));
    process.exit(1);
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    totalItems: sorted.length,
    items: sorted
  };

  const outPath = path.join(__dirname, '../data/today-news.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(chalk.bold.green(`\n✅ Done! ${sorted.length} AI news items saved to data/today-news.json`));
  console.log(chalk.gray(`   Sources: ${[...new Set(sorted.map(i => i.source))].join(', ')}\n`));
}

main().catch(err => {
  console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
  process.exit(1);
});
