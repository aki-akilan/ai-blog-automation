require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const HASHNODE_API_URL = 'https://gql.hashnode.com/';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// Hashnode requires properly hyphenated tag slugs — map from optimize-post.js format
const TAG_MAP = {
  'ai':                   { slug: 'ai',                    name: 'AI' },
  'artificialintelligence':{ slug: 'artificial-intelligence', name: 'Artificial Intelligence' },
  'machinelearning':      { slug: 'machine-learning',      name: 'Machine Learning' },
  'deeplearning':         { slug: 'deep-learning',         name: 'Deep Learning' },
  'llm':                  { slug: 'llm',                   name: 'LLM' },
  'generativeai':         { slug: 'generative-ai',         name: 'Generative AI' },
  'technology':           { slug: 'technology',            name: 'Technology' },
  'programming':          { slug: 'programming',           name: 'Programming' },
  'datascience':          { slug: 'data-science',          name: 'Data Science' },
  'automation':           { slug: 'automation',            name: 'Automation' },
  'tutorial':             { slug: 'tutorial',              name: 'Tutorial' },
  'webdev':               { slug: 'webdev',                name: 'Web Development' },
  'productivity':         { slug: 'productivity',          name: 'Productivity' }
};

function mapTags(tags) {
  return tags.slice(0, 5).map(t => TAG_MAP[t] || { slug: t, name: t });
}

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

async function gql(query, variables, retryCount = 0) {
  try {
    const response = await axios.post(HASHNODE_API_URL, { query, variables }, {
      headers: {
        'Authorization': process.env.HASHNODE_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const errors = response.data?.errors;
    if (errors && errors.length > 0) {
      throw new Error(`GraphQL: ${errors.map(e => e.message).join('; ')}`);
    }

    return response.data?.data;
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error('Hashnode auth failed (401) — HASHNODE_TOKEN is invalid or expired. Regenerate at hashnode.com → Settings → Developer.');
    }
    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ Hashnode error: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return gql(query, variables, retryCount + 1);
    }
    throw err;
  }
}

async function getPublicationId() {
  const data = await gql(`
    query {
      me {
        publications(first: 1) {
          edges {
            node { id title }
          }
        }
      }
    }
  `, {});

  const edges = data?.me?.publications?.edges;
  if (!edges || edges.length === 0) throw new Error('No Hashnode publication found for this token.');
  return edges[0].node.id;
}

async function createDraft(title, contentMarkdown, publicationId, tags, metaDescription) {
  const data = await gql(`
    mutation CreateDraft($input: CreateDraftInput!) {
      createDraft(input: $input) {
        draft {
          id
          title
        }
      }
    }
  `, {
    input: {
      title,
      contentMarkdown,
      publicationId,
      tags,
      metaTags: { description: metaDescription }
    }
  });

  const draft = data?.createDraft?.draft;
  if (!draft) throw new Error('createDraft returned no draft — check token permissions.');
  return draft;
}

async function publishDraft(draftId) {
  const data = await gql(`
    mutation PublishDraft($input: PublishDraftInput!) {
      publishDraft(input: $input) {
        post {
          id
          title
          url
          publishedAt
        }
      }
    }
  `, { input: { draftId } });

  const post = data?.publishDraft?.post;
  if (!post) throw new Error('publishDraft returned no post — draft may have already been published or deleted.');
  return post;
}

async function main() {
  console.log(chalk.bold.cyan('\n🔗 Publishing to Hashnode...\n'));

  if (!process.env.HASHNODE_TOKEN) {
    console.error(chalk.red('❌ HASHNODE_TOKEN not set in .env'));
    process.exit(1);
  }

  const isTestMode = process.env.TEST_MODE === 'true';
  const { bodyMarkdown, meta } = loadPostData();
  const title = isTestMode ? `[TEST] ${meta.title}` : meta.title;
  const tags = mapTags(meta.tags);

  console.log(chalk.gray(`  Title: ${title}`));
  console.log(chalk.gray(`  Tags: ${tags.map(t => t.slug).join(', ')}\n`));
  if (isTestMode) console.log(chalk.yellow('  [TEST MODE] Will create draft only — not published publicly\n'));

  console.log(chalk.blue('  Fetching Hashnode publication ID...'));
  const publicationId = await getPublicationId();
  console.log(chalk.gray(`  Publication ID: ${publicationId}`));

  console.log(chalk.blue('  Step 1/2: Creating draft...'));
  const draft = await createDraft(title, bodyMarkdown, publicationId, tags, meta.metaDescription);
  console.log(chalk.gray(`  Draft ID: ${draft.id}`));

  if (isTestMode) {
    console.log(chalk.yellow('\n⚠️  [TEST MODE] Draft created on Hashnode — skipping publish step'));
    const result = { success: true, id: draft.id, url: null, title: draft.title, publishedAt: null, isDraft: true };
    fs.writeFileSync(
      path.join(__dirname, '../data/hashnode-result.json'),
      JSON.stringify({ ...result, postedAt: new Date().toISOString() }, null, 2)
    );
    return result;
  }

  console.log(chalk.blue('  Step 2/2: Publishing draft...'));
  const post = await publishDraft(draft.id);

  const result = {
    success: true,
    id: post.id,
    url: post.url,
    title: post.title,
    publishedAt: post.publishedAt
  };

  fs.writeFileSync(
    path.join(__dirname, '../data/hashnode-result.json'),
    JSON.stringify({ ...result, postedAt: new Date().toISOString() }, null, 2)
  );

  console.log(chalk.bold.green('\n✅ Hashnode post published!'));
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
