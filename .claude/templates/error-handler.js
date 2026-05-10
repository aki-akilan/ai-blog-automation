/**
 * TEMPLATE: Error Handling Patterns
 * Reference these patterns when writing or fixing scripts.
 * Not meant to be imported — copy the patterns you need.
 */

const chalk = require('chalk');
const { notifyError } = require('../scripts/notify-slack');

// ── Pattern 1: Retry with exponential backoff ────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, label, retryCount = 0) {
  try {
    return await fn();
  } catch (err) {
    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ ${label} error: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return withRetry(fn, label, retryCount + 1);
    }
    throw new Error(`${label} failed after ${MAX_RETRIES} attempts: ${err.message}`);
  }
}

// Usage:
// const result = await withRetry(() => axios.post(url, data), 'Dev.to API');

// ── Pattern 2: Non-fatal Slack error (never crash pipeline) ─────────────────

async function safeNotifySlack(type, payload) {
  try {
    if (type === 'error') await notifyError(payload);
    // add other types as needed
  } catch {
    // Slack failures are ALWAYS non-fatal — log warning only
    console.log(chalk.gray('  [Slack] Notification failed — continuing'));
  }
}

// Usage:
// await safeNotifySlack('error', { step: 'post-to-devto', error: err.message });

// ── Pattern 3: Auth error detection ─────────────────────────────────────────

function isAuthError(err) {
  return err.response?.status === 401 ||
    err.message.includes('Invalid login') ||
    err.message.includes('Username and Password') ||
    err.message.includes('Application-specific password') ||
    err.message.includes('Unauthorized');
}

function handleAuthError(platform, err) {
  const fixes = {
    'devto': 'Regenerate API key at dev.to → Settings → API Keys',
    'hashnode': 'Regenerate token at hashnode.com → Settings → Developer',
    'gmail': 'Generate Gmail App Password at myaccount.google.com/apppasswords',
    'slack': 'Regenerate webhook URL at api.slack.com/apps'
  };
  const fix = fixes[platform] || 'Check credentials in .env and GitHub Secrets';
  throw new Error(`${platform} auth failed (${err.response?.status}): ${fix}`);
}

// Usage:
// } catch (err) {
//   if (isAuthError(err)) handleAuthError('devto', err);
//   throw err;
// }

// ── Pattern 4: Missing file guard ───────────────────────────────────────────

function requireFile(filePath, scriptThatCreatesIt) {
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    const filename = require('path').basename(filePath);
    console.error(chalk.red(`❌ ${filename} not found. Run ${scriptThatCreatesIt} first.`));
    process.exit(1);
  }
}

// Usage:
// requireFile(path.join(__dirname, '../data/optimized-post.md'), 'optimize-post.js');

// ── Pattern 5: Missing env var guard ────────────────────────────────────────

function requireEnvVars(...keys) {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error(chalk.red(`❌ Missing env vars: ${missing.join(', ')}`));
    console.error(chalk.gray('   Add them to .env and GitHub Secrets'));
    process.exit(1);
  }
}

// Usage:
// requireEnvVars('DEVTO_API_KEY', 'HASHNODE_TOKEN');

// ── Pattern 6: Promise.race timeout (for slow external calls) ───────────────

function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Usage:
// const result = await withTimeout(parser.parseURL(url), 10000, feed.name);

// ── Pattern 7: Graceful partial failure (don't fail all for one) ─────────────

async function runParallel(tasks) {
  const results = await Promise.allSettled(tasks.map(t => t.fn()));
  return results.map((result, i) => ({
    name: tasks[i].name,
    success: result.status === 'fulfilled',
    value: result.value,
    error: result.reason?.message
  }));
}

// Usage:
// const results = await runParallel([
//   { name: 'Dev.to', fn: () => postToDevTo() },
//   { name: 'Hashnode', fn: () => postToHashnode() }
// ]);
// results.forEach(r => console.log(r.success ? `✅ ${r.name}` : `❌ ${r.name}: ${r.error}`));

// ── Pattern 8: Main function with unified error exit ─────────────────────────

async function main() {
  // ... your logic ...
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
    // Optionally notify Slack on fatal failures
    // safeNotifySlack('error', { step: 'script-name', error: err.message }).finally(() => process.exit(1));
    process.exit(1);
  });
}

module.exports = {
  withRetry,
  safeNotifySlack,
  isAuthError,
  handleAuthError,
  requireFile,
  requireEnvVars,
  withTimeout,
  runParallel
};
