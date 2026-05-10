require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function send(payload) {
  if (!WEBHOOK_URL) {
    console.log(chalk.gray('  [Slack] SLACK_WEBHOOK_URL not set — skipping'));
    return;
  }
  try {
    await axios.post(WEBHOOK_URL, payload, { timeout: 10000 });
  } catch (err) {
    // Slack failures are non-fatal — log and continue
    console.log(chalk.yellow(`  [Slack] Warning: ${err.message}`));
  }
}

// ── Notification types ────────────────────────────────────────────────────────

async function notifyStarted({ style = 'default' } = {}) {
  await send({
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🚀 AI Blog Automation Started', emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Status:*\nRunning` },
          { type: 'mrkdwn', text: `*Style:*\n${style}` },
          { type: 'mrkdwn', text: `*Time:*\n${getISTTime()}` },
          { type: 'mrkdwn', text: `*Mode:*\n${process.env.TEST_MODE === 'true' ? 'Test (draft)' : 'Live'}` }
        ]
      },
      { type: 'divider' }
    ]
  });
}

async function notifyPublished({ title, devtoUrl, hashnodeUrl, wordCount, tags }) {
  const devtoField = devtoUrl
    ? `<${devtoUrl}|View on Dev.to>`
    : '_Not published_';
  const hashnodeField = hashnodeUrl
    ? `<${hashnodeUrl}|View on Hashnode>`
    : '_Not published_';

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '✅ Post Published!', emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${title}*` }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*📄 Dev.to:*\n${devtoField}` },
        { type: 'mrkdwn', text: `*🔗 Hashnode:*\n${hashnodeField}` },
        { type: 'mrkdwn', text: `*📝 Words:*\n~${wordCount || '?'}` },
        { type: 'mrkdwn', text: `*🏷️ Tags:*\n${(tags || []).slice(0, 3).join(', ')}` }
      ]
    },
    { type: 'divider' }
  ];

  // Medium import block — only show if Dev.to published (need URL to import from)
  if (devtoUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*⚡ Post to Medium (30 sec)*\n1. Copy URL: \`${devtoUrl}\`\n2. Open <https://medium.com/p/import|medium.com/p/import>\n3. Paste URL → Import → Publish`
      }
    });
    blocks.push({ type: 'divider' });
  }

  await send({ blocks });
}

async function notifyEmailSent({ to, title }) {
  await send({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📧 *Email sent* to \`${to}\`\n_Full post + Medium copy button delivered_`
        }
      }
    ]
  });
}

async function notifyCompleted({ totalPosts, estimatedEarnings, successCount }) {
  await send({
    blocks: [
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*📊 Total Posts:*\n${totalPosts}` },
          { type: 'mrkdwn', text: `*💰 Est. Earnings:*\n$${estimatedEarnings}` },
          { type: 'mrkdwn', text: `*✅ Platforms:*\n${successCount}/2` },
          { type: 'mrkdwn', text: `*⏰ Completed:*\n${getISTTime()}` }
        ]
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: 'Next run: tomorrow at 12:00 PM IST • _AI Insights Daily_' }
        ]
      }
    ]
  });
}

async function notifyError({ step, error }) {
  await send({
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '❌ Automation Error', emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Step:*\n${step}` },
          { type: 'mrkdwn', text: `*Time:*\n${getISTTime()}` }
        ]
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Error:*\n\`\`\`${String(error).slice(0, 300)}\`\`\`` }
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Check GitHub Actions logs for full details' }]
      }
    ]
  });
}

async function notifyArticleContent(content, meta) {
  if (!content) return;

  // Convert markdown to Slack mrkdwn
  const slackText = content
    .replace(/^---[\s\S]*?---\n/, '')          // strip frontmatter
    .replace(/^# (.+)$/gm, '*$1*')             // H1 → bold
    .replace(/^## (.+)$/gm, '\n*$1*')          // H2 → bold with spacing
    .replace(/^### (.+)$/gm, '_$1_')           // H3 → italic
    .replace(/\*\*(.+?)\*\*/g, '*$1*')         // **bold** → *bold*
    .replace(/\[(.+?)\]\((.+?)\)/g, '<$2|$1>') // [text](url) → Slack link
    .replace(/`(.+?)`/g, '`$1`')               // keep inline code
    .trim();

  // Slack section blocks max 3000 chars — split by paragraph into chunks
  const CHUNK_SIZE = 2800;
  const paragraphs = slackText.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // First message: header + first chunk
  const firstBlocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '📄 Today\'s Full Article', emoji: true }
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `*${meta?.title || 'AI Insights Daily'}* · ${meta?.tags?.slice(0,3).join(', ') || ''}` }]
    },
    { type: 'divider' },
    { type: 'section', text: { type: 'mrkdwn', text: chunks[0] || '_No content_' } }
  ];
  await send({ blocks: firstBlocks });

  // Remaining chunks as follow-up messages
  for (let i = 1; i < chunks.length; i++) {
    await send({
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: chunks[i] } }
      ]
    });
  }
}

function getISTTime() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ── CLI standalone test ───────────────────────────────────────────────────────
async function runTest() {
  console.log(chalk.bold.cyan('\n🔔 Sending test Slack notifications...\n'));

  await notifyStarted({ style: 'default' });
  console.log(chalk.green('  ✓ Started notification sent'));

  await notifyPublished({
    title: '[TEST] The AI Revolution: Key Developments Today',
    devtoUrl: 'https://dev.to/aiinsightsdaily',
    hashnodeUrl: null,
    wordCount: 842,
    tags: ['ai', 'machinelearning', 'automation']
  });
  console.log(chalk.green('  ✓ Published notification sent'));

  await notifyEmailSent({ to: 'aiinsightsdaily0406@gmail.com', title: 'Test Post' });
  console.log(chalk.green('  ✓ Email notification sent'));

  await notifyCompleted({ totalPosts: 1, estimatedEarnings: '0.05', successCount: 1 });
  console.log(chalk.green('  ✓ Completed notification sent'));

  // Test article content notification with sample post
  const fs = require('fs');
  const path = require('path');
  const postPath = path.join(__dirname, '../data/optimized-post.md');
  const meta = { title: '[TEST] The AI Revolution: Key Developments Today', tags: ['ai', 'machinelearning'] };
  if (fs.existsSync(postPath)) {
    const content = fs.readFileSync(postPath, 'utf8');
    await notifyArticleContent(content, meta);
    console.log(chalk.green('  ✓ Full article notification sent'));
  }

  console.log(chalk.bold.green('\n✅ Check #aiinsightsdaily in Slack!\n'));
}

if (require.main === module) {
  runTest().catch(err => {
    console.error(chalk.red(`\n❌ Slack test error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { notifyStarted, notifyPublished, notifyEmailSent, notifyCompleted, notifyError, notifyArticleContent };
