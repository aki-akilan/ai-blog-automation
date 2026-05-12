require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const ANALYTICS_PATH = path.join(__dirname, '../data/analytics.json');

function loadFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function loadAnalytics() {
  if (!fs.existsSync(ANALYTICS_PATH)) {
    return { entries: [], totals: { posts: 0, devtoSuccesses: 0, hashnodeSuccesses: 0 } };
  }
  return JSON.parse(fs.readFileSync(ANALYTICS_PATH, 'utf8'));
}

function estimateEarnings(totalPosts) {
  // Rough estimate: $0.05/post average across platforms (varies wildly)
  return (totalPosts * 0.05).toFixed(2);
}

async function main() {
  console.log(chalk.bold.cyan('\n📊 Logging Analytics...\n'));

  const meta = loadFile(path.join(__dirname, '../data/post-meta.json'));
  const publishResults = loadFile(path.join(__dirname, '../data/publish-results.json'));
  const devtoResult = loadFile(path.join(__dirname, '../data/devto-result.json'));
  const hashnodeResult = loadFile(path.join(__dirname, '../data/hashnode-result.json'));

  if (!meta) {
    console.error(chalk.red('❌ post-meta.json not found. Run optimize-post.js first.'));
    process.exit(1);
  }

  const analytics = loadAnalytics();

  const devtoOk = devtoResult?.success === true;
  const hashnodeOk = hashnodeResult?.success === true;
  const successCount = [devtoOk, hashnodeOk].filter(Boolean).length;

  const entry = {
    date: new Date().toISOString(),
    slot: process.env.POST_SLOT || 'morning',
    title: meta.title,
    tags: meta.tags,
    wordCount: null,
    platforms: {
      devto: {
        success: devtoOk,
        url: devtoResult?.url || null,
        id: devtoResult?.id || null
      },
      hashnode: {
        success: hashnodeOk,
        url: hashnodeResult?.url || null,
        id: hashnodeResult?.id || null
      }
    },
    status: successCount === 2 ? 'success' : successCount === 1 ? 'partial' : 'failed',
    generationTimeMs: null
  };

  // Try to get word count from optimized post
  const postPath = path.join(__dirname, '../data/optimized-post.md');
  if (fs.existsSync(postPath)) {
    const content = fs.readFileSync(postPath, 'utf8');
    entry.wordCount = content.split(/\s+/).length;
  }

  analytics.entries.push(entry);
  analytics.totals = {
    posts: analytics.entries.length,
    devtoSuccesses: analytics.entries.filter(e => e.platforms.devto.success).length,
    hashnodeSuccesses: analytics.entries.filter(e => e.platforms.hashnode.success).length,
    estimatedEarningsUSD: estimateEarnings(analytics.entries.length)
  };

  fs.mkdirSync(path.dirname(ANALYTICS_PATH), { recursive: true });
  fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(analytics, null, 2));

  console.log(chalk.green(`  ✓ Entry logged: "${meta.title}"`));
  console.log(chalk.gray(`  Slot: ${entry.slot} | Status: ${entry.status} (${successCount}/2 platforms)`));
  console.log(chalk.gray(`  Total posts so far: ${analytics.totals.posts}`));
  console.log(chalk.gray(`  Est. total earnings: $${analytics.totals.estimatedEarningsUSD}`));
  console.log(chalk.bold.green(`\n✅ Analytics saved to data/analytics.json\n`));

  return analytics;
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Analytics error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
