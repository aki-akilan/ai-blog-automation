require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const HASHNODE_API_URL = 'https://gql.hashnode.com/';
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

async function getPublicationId(retryCount = 0) {
  const query = `
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
  `;

  try {
    const response = await axios.post(HASHNODE_API_URL, { query }, {
      headers: {
        'Authorization': process.env.HASHNODE_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const edges = response.data?.data?.me?.publications?.edges;
    if (!edges || edges.length === 0) throw new Error('No Hashnode publication found for this token.');

    return edges[0].node.id;
  } catch (err) {
    if (retryCount < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAY_MS);
      return getPublicationId(retryCount + 1);
    }
    throw new Error(`Failed to get Hashnode publication ID: ${err.message}`);
  }
}

async function postToHashnode(bodyMarkdown, meta, publicationId, retryCount = 0) {
  const isTestMode = process.env.TEST_MODE === 'true';
  const title = isTestMode ? `[TEST] ${meta.title}` : meta.title;

  const mutation = `
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
  `;

  const variables = {
    input: {
      title,
      contentMarkdown: bodyMarkdown,
      publicationId,
      tags: meta.tags.slice(0, 5).map(t => ({ slug: t, name: t })),
      metaTags: {
        description: meta.metaDescription
      },
      // In test mode, publish as draft
      ...(isTestMode ? {} : {})
    }
  };

  try {
    console.log(chalk.blue(`  Posting to Hashnode (attempt ${retryCount + 1}/${MAX_RETRIES})...`));
    if (isTestMode) console.log(chalk.yellow('  [TEST MODE] Publishing as draft'));

    const response = await axios.post(HASHNODE_API_URL,
      { query: mutation, variables },
      {
        headers: {
          'Authorization': process.env.HASHNODE_TOKEN,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const errors = response.data?.errors;
    if (errors && errors.length > 0) {
      const msg = errors.map(e => e.message).join('; ');
      throw new Error(`Hashnode GraphQL error: ${msg}`);
    }

    const post = response.data?.data?.publishPost?.post;
    if (!post) throw new Error('Hashnode returned no post data.');

    return {
      success: true,
      id: post.id,
      url: post.url,
      title: post.title,
      publishedAt: post.publishedAt
    };
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error('Hashnode auth failed (401): Invalid HASHNODE_TOKEN.');
    }

    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ Hashnode error: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return postToHashnode(bodyMarkdown, meta, publicationId, retryCount + 1);
    }

    throw new Error(`Hashnode post failed after ${MAX_RETRIES} attempts: ${err.message}`);
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🔗 Publishing to Hashnode...\n'));

  if (!process.env.HASHNODE_TOKEN) {
    console.error(chalk.red('❌ HASHNODE_TOKEN not set in .env'));
    process.exit(1);
  }

  const { bodyMarkdown, meta } = loadPostData();
  console.log(chalk.gray(`  Title: ${meta.title}`));
  console.log(chalk.gray(`  Tags: ${meta.tags.join(', ')}\n`));

  console.log(chalk.blue('  Fetching Hashnode publication ID...'));
  const publicationId = await getPublicationId();
  console.log(chalk.gray(`  Publication ID: ${publicationId}`));

  const result = await postToHashnode(bodyMarkdown, meta, publicationId);

  const outPath = path.join(__dirname, '../data/hashnode-result.json');
  fs.writeFileSync(outPath, JSON.stringify({ ...result, postedAt: new Date().toISOString() }, null, 2));

  console.log(chalk.bold.green(`\n✅ Hashnode post published!`));
  console.log(chalk.green(`   URL: ${result.url}`));
  console.log(chalk.gray(`   ID: ${result.id}\n`));

  return result;
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Hashnode error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
