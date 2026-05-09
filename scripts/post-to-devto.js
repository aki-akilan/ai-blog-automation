require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const DEVTO_API_URL = 'https://dev.to/api/articles';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stripFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) return content.slice(end + 3).trim();
  }
  return content;
}

function loadPostData() {
  const postPath = path.join(__dirname, '../data/optimized-post.md');
  const metaPath = path.join(__dirname, '../data/post-meta.json');

  if (!fs.existsSync(postPath)) throw new Error('optimized-post.md not found. Run optimize-post.js first.');
  if (!fs.existsSync(metaPath)) throw new Error('post-meta.json not found. Run optimize-post.js first.');

  const rawContent = fs.readFileSync(postPath, 'utf8');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const bodyMarkdown = stripFrontmatter(rawContent);

  return { bodyMarkdown, meta };
}

async function postToDevTo(bodyMarkdown, meta, retryCount = 0) {
  const isTestMode = process.env.TEST_MODE === 'true';

  const payload = {
    article: {
      title: isTestMode ? `[TEST] ${meta.title}` : meta.title,
      body_markdown: bodyMarkdown,
      published: !isTestMode,
      description: meta.metaDescription,
      tags: meta.tags.slice(0, 4),
      canonical_url: null
    }
  };

  try {
    console.log(chalk.blue(`  Posting to Dev.to (attempt ${retryCount + 1}/${MAX_RETRIES})...`));
    if (isTestMode) console.log(chalk.yellow('  [TEST MODE] Post will be saved as draft'));

    const response = await axios.post(DEVTO_API_URL, payload, {
      headers: {
        'api-key': process.env.DEVTO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      success: true,
      id: response.data.id,
      url: response.data.url,
      title: response.data.title,
      published: response.data.published
    };
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error || err.message;

    if (status === 422) {
      throw new Error(`Dev.to rejected post (422): ${message}. Check title uniqueness or content.`);
    }
    if (status === 401) {
      throw new Error(`Dev.to auth failed (401): Invalid DEVTO_API_KEY.`);
    }

    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ Dev.to error (${status || err.message}). Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return postToDevTo(bodyMarkdown, meta, retryCount + 1);
    }

    throw new Error(`Dev.to post failed after ${MAX_RETRIES} attempts: ${message}`);
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n📝 Publishing to Dev.to...\n'));

  if (!process.env.DEVTO_API_KEY) {
    console.error(chalk.red('❌ DEVTO_API_KEY not set in .env'));
    process.exit(1);
  }

  const { bodyMarkdown, meta } = loadPostData();
  console.log(chalk.gray(`  Title: ${meta.title}`));
  console.log(chalk.gray(`  Tags: ${meta.tags.join(', ')}\n`));

  const result = await postToDevTo(bodyMarkdown, meta);

  const outPath = path.join(__dirname, '../data/devto-result.json');
  fs.writeFileSync(outPath, JSON.stringify({ ...result, postedAt: new Date().toISOString() }, null, 2));

  console.log(chalk.bold.green(`\n✅ Dev.to post ${result.published ? 'published' : 'saved as draft'}!`));
  console.log(chalk.green(`   URL: ${result.url}`));
  console.log(chalk.gray(`   ID: ${result.id}\n`));

  return result;
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Dev.to error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
