/**
 * TEMPLATE: New Platform Integration
 * Copy to scripts/post-to-[platform].js and fill in the TODOs.
 * Follows the universal platform posting pattern.
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// TODO: Update these
const PLATFORM_NAME = 'Platform';
const PLATFORM_API_URL = 'https://api.platform.com/v1/posts';
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

async function postToPlatform(bodyMarkdown, meta, retryCount = 0) {
  const isTestMode = process.env.TEST_MODE === 'true';
  const title = isTestMode ? `[TEST] ${meta.title}` : meta.title;

  // TODO: Build the request payload for this platform
  const payload = {
    title,
    content: bodyMarkdown,
    // TODO: Add platform-specific fields
  };

  // TODO: Set the correct auth header
  const headers = {
    'Authorization': `Bearer ${process.env.PLATFORM_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log(chalk.blue(`  Posting to ${PLATFORM_NAME} (attempt ${retryCount + 1}/${MAX_RETRIES})...`));
    if (isTestMode) console.log(chalk.yellow(`  [TEST MODE]`));

    const response = await axios.post(PLATFORM_API_URL, payload, {
      headers,
      timeout: 30000
    });

    // TODO: Extract the right fields from the response
    return {
      success: true,
      id: response.data.id,
      url: response.data.url,
      title: response.data.title
    };
  } catch (err) {
    // Handle known error codes
    if (err.response?.status === 401) {
      throw new Error(`${PLATFORM_NAME} auth failed (401): Invalid PLATFORM_TOKEN.`);
    }

    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ ${PLATFORM_NAME} error (${err.response?.status || err.message}). Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return postToPlatform(bodyMarkdown, meta, retryCount + 1);
    }

    throw new Error(`${PLATFORM_NAME} post failed after ${MAX_RETRIES} attempts: ${err.response?.data?.message || err.message}`);
  }
}

async function main() {
  console.log(chalk.bold.cyan(`\n📝 Publishing to ${PLATFORM_NAME}...\n`));

  // TODO: Update env var name
  if (!process.env.PLATFORM_TOKEN) {
    console.error(chalk.red(`❌ PLATFORM_TOKEN not set in .env`));
    process.exit(1);
  }

  const { bodyMarkdown, meta } = loadPostData();
  console.log(chalk.gray(`  Title: ${meta.title}`));
  console.log(chalk.gray(`  Tags: ${meta.tags.join(', ')}\n`));

  const result = await postToPlatform(bodyMarkdown, meta);

  // TODO: Update output filename
  const outPath = path.join(__dirname, `../data/platform-result.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ...result, postedAt: new Date().toISOString() }, null, 2));

  console.log(chalk.bold.green(`\n✅ ${PLATFORM_NAME} post published!`));
  console.log(chalk.green(`   URL: ${result.url}`));
  console.log(chalk.gray(`   ID: ${result.id}\n`));

  return result;
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ ${PLATFORM_NAME} error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
