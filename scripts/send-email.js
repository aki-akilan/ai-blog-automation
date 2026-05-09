require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { notifyEmailSent } = require('./notify-slack');

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

function loadData() {
  const postPath = path.join(__dirname, '../data/optimized-post.md');
  const metaPath = path.join(__dirname, '../data/post-meta.json');
  const resultsPath = path.join(__dirname, '../data/publish-results.json');
  const analyticsPath = path.join(__dirname, '../data/analytics.json');

  if (!fs.existsSync(postPath)) throw new Error('optimized-post.md not found.');
  if (!fs.existsSync(metaPath)) throw new Error('post-meta.json not found.');

  const rawPost = fs.readFileSync(postPath, 'utf8');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const postContent = stripFrontmatter(rawPost);

  let publishResults = null;
  if (fs.existsSync(resultsPath)) {
    publishResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  }

  let analytics = { entries: [] };
  if (fs.existsSync(analyticsPath)) {
    analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
  }

  return { meta, postContent, publishResults, analytics };
}

function buildHtml(meta, postContent, publishResults, analytics) {
  const templatePath = path.join(__dirname, '../templates/email-template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  const wordCount = postContent.split(/\s+/).length;
  const tagList = meta.tags.slice(0, 4).join(', ');
  const totalPosts = analytics.entries.length + 1;

  // Platform status
  const devtoOk = publishResults?.devto?.success;
  const hashnodeOk = publishResults?.hashnode?.success;
  const platformsOk = [devtoOk, hashnodeOk].filter(Boolean).length;

  const devtoStatusClass = devtoOk ? 'success' : (publishResults ? 'error' : 'warning');
  const devtoStatusText = devtoOk
    ? `✓ Published`
    : (publishResults ? '✗ Failed' : '⏳ Not run yet');

  const hashnodeStatusClass = hashnodeOk ? 'success' : (publishResults ? 'error' : 'warning');
  const hashnodeStatusText = hashnodeOk
    ? `✓ Published`
    : (publishResults ? '✗ Failed' : '⏳ Not run yet');

  // Link buttons
  const devtoBtn = devtoOk
    ? `<a href="${publishResults.devto.url}" class="link-btn devto">📄 View on Dev.to →</a>`
    : `<span class="link-btn disabled">Dev.to — not published</span>`;

  const hashnodeBtn = hashnodeOk
    ? `<a href="${publishResults.hashnode.url}" class="link-btn hashnode">📄 View on Hashnode →</a>`
    : `<span class="link-btn disabled">Hashnode — not published</span>`;

  // Estimated earnings (rough: $0.10-0.30 per 1000 views, assume 100-500 views/post)
  const estEarnings = (totalPosts * 0.05).toFixed(2);

  // Escape HTML for display
  const displayContent = postContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/{{POST_TITLE}}/g, meta.title)
    .replace(/{{DATE}}/g, date)
    .replace(/{{WORD_COUNT}}/g, wordCount)
    .replace(/{{TAG_LIST}}/g, tagList)
    .replace(/{{DEVTO_STATUS_CLASS}}/g, devtoStatusClass)
    .replace(/{{DEVTO_STATUS_TEXT}}/g, devtoStatusText)
    .replace(/{{HASHNODE_STATUS_CLASS}}/g, hashnodeStatusClass)
    .replace(/{{HASHNODE_STATUS_TEXT}}/g, hashnodeStatusText)
    .replace(/{{DEVTO_LINK_BTN}}/g, devtoBtn)
    .replace(/{{HASHNODE_LINK_BTN}}/g, hashnodeBtn)
    .replace(/{{TOTAL_POSTS}}/g, totalPosts)
    .replace(/{{PLATFORMS_OK}}/g, platformsOk)
    .replace(/{{ESTIMATED_EARNINGS}}/g, estEarnings)
    .replace(/{{POST_CONTENT_RAW}}/g, postContent)
    .replace(/{{POST_CONTENT_DISPLAY}}/g, displayContent);

  return html;
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
}

async function sendEmail(retryCount = 0) {
  const { meta, postContent, publishResults, analytics } = loadData();
  const html = buildHtml(meta, postContent, publishResults, analytics);

  const isTestMode = process.env.TEST_MODE === 'true';
  const subject = isTestMode
    ? `[TEST] AI Blog Post: ${meta.title}`
    : `AI Blog Posted: ${meta.title}`;

  const transporter = createTransporter();

  try {
    console.log(chalk.blue(`  Sending email (attempt ${retryCount + 1}/${MAX_RETRIES})...`));

    const info = await transporter.sendMail({
      from: `"AI Insights Daily" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject,
      html,
      text: `New post: ${meta.title}\n\n${postContent.slice(0, 500)}...`
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const isAuthError = err.message.includes('Invalid login') ||
      err.message.includes('Username and Password') ||
      err.message.includes('Application-specific password');

    if (isAuthError) {
      throw new Error(
        `Gmail auth failed. Your EMAIL_APP_PASSWORD appears to be a regular Gmail password.\n` +
        `  Fix: Go to myaccount.google.com/apppasswords → generate a 16-char App Password.\n` +
        `  Original error: ${err.message}`
      );
    }

    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ Email error: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return sendEmail(retryCount + 1);
    }

    throw new Error(`Email failed after ${MAX_RETRIES} attempts: ${err.message}`);
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n📧 Sending Email Notification...\n'));

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error(chalk.red('❌ EMAIL_USER or EMAIL_APP_PASSWORD not set in .env'));
    process.exit(1);
  }

  console.log(chalk.gray(`  From/To: ${process.env.EMAIL_USER}`));

  const { meta } = loadData();
  const result = await sendEmail();

  console.log(chalk.bold.green(`\n✅ Email sent successfully!`));
  console.log(chalk.gray(`   Message ID: ${result.messageId}\n`));

  await notifyEmailSent({ to: process.env.EMAIL_USER, title: meta.title });

  return result;
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Email error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
