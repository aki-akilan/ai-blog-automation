/**
 * TEMPLATE: API Test
 * Add a new platform's auth test to scripts/test-apis.js using this pattern.
 * Each test function returns { ok, status, message } — never throws.
 */

require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

// ── Test function pattern ─────────────────────────────────────────────────────
// Copy this for each new platform. Returns { ok, status, message }.

async function testPlatform() {
  try {
    // TODO: Use a GET endpoint that verifies auth without side effects
    // Good: GET /me, GET /user, GET /account, GET /profile
    // Bad: POST (creates things), DELETE (destroys things)

    const response = await axios.get('https://api.platform.com/v1/me', {
      headers: {
        // TODO: Set the correct auth header
        'Authorization': `Bearer ${process.env.PLATFORM_TOKEN}`,
        // OR: 'api-key': process.env.PLATFORM_TOKEN,
        // OR: 'X-Api-Key': process.env.PLATFORM_TOKEN,
      },
      timeout: 10000
    });

    // TODO: Extract meaningful info from response
    const username = response.data.username || response.data.name || 'unknown';
    return {
      ok: true,
      status: response.status,
      message: `Auth OK — user: ${username}`
    };
  } catch (err) {
    // Handle 401 specifically (auth failed vs network error)
    if (err.response?.status === 401) {
      return { ok: false, status: 401, message: 'Auth failed — invalid token' };
    }
    // Handle "no content yet" (e.g., new account with 0 posts returns 404 sometimes)
    if (err.response?.status === 404) {
      return { ok: true, status: 200, message: 'Auth OK (new account, no content yet)' };
    }
    return { ok: false, status: err.response?.status || 0, message: err.message };
  }
}

// ── Credentials check pattern ─────────────────────────────────────────────────
// Run this before any API calls.

function checkCredentials(requiredKeys) {
  const checks = requiredKeys.map(key => ({
    name: key,
    present: !!process.env[key],
    length: process.env[key]?.length || 0
  }));

  let allPresent = true;
  checks.forEach(check => {
    if (check.present) {
      console.log(chalk.gray(`  ✓ ${check.name} present (${check.length} chars)`));
    } else {
      console.log(chalk.red(`  ✗ ${check.name} not set in .env`));
      allPresent = false;
    }
  });

  return allPresent;
}

// ── Main test runner ──────────────────────────────────────────────────────────

async function main() {
  console.log(chalk.bold.cyan('\n🔌 Testing API Connections (dry run — no posting)\n'));

  // TODO: Update with your platform's credential keys
  const credsMissing = !checkCredentials([
    'DEVTO_API_KEY',
    'HASHNODE_TOKEN',
    'PLATFORM_TOKEN'  // TODO: add/remove as needed
  ]);

  if (credsMissing) {
    console.log(chalk.red('\n❌ Missing credentials. Add them to .env and retry.\n'));
    process.exit(1);
  }

  console.log('');

  // TODO: Add your platform's test function to this array
  const tests = [
    { name: 'Dev.to', fn: testDevTo },
    { name: 'Hashnode', fn: testHashnode },
    { name: 'Platform', fn: testPlatform }  // TODO: replace with real function
  ];

  const results = await Promise.all(tests.map(t => t.fn()));
  const icon = r => r.ok ? chalk.green('✅') : chalk.red('❌');

  tests.forEach((t, i) => {
    const r = results[i];
    console.log(`${icon(r)} ${t.name.padEnd(12)} [HTTP ${r.status}]: ${r.message}`);
  });

  const allOk = results.every(r => r.ok);
  if (allOk) {
    console.log(chalk.bold.green('\n✅ All APIs connected and authenticated. Ready to publish!\n'));
  } else {
    console.log(chalk.bold.yellow('\n⚠️  Some APIs failed. Fix credentials before running publish scripts.\n'));
    process.exit(1);
  }
}

main().catch(err => {
  console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
  process.exit(1);
});

// ── Mock test functions (replace with real ones from test-apis.js) ────────────

async function testDevTo() {
  try {
    const response = await axios.get('https://dev.to/api/articles/me', {
      headers: { 'api-key': process.env.DEVTO_API_KEY },
      timeout: 10000
    });
    return { ok: true, status: 200, message: `Auth OK — ${response.data.length} articles` };
  } catch (err) {
    if (err.response?.status === 401) return { ok: false, status: 401, message: 'Auth failed — invalid DEVTO_API_KEY' };
    return { ok: false, status: err.response?.status || 0, message: err.message };
  }
}

async function testHashnode() {
  const query = `query { me { username publications(first:1){ edges { node { title } } } } }`;
  try {
    const response = await axios.post('https://gql.hashnode.com/', { query }, {
      headers: { 'Authorization': process.env.HASHNODE_TOKEN, 'Content-Type': 'application/json' },
      timeout: 10000
    });
    const errors = response.data?.errors;
    if (errors?.length) return { ok: false, status: 200, message: errors[0].message };
    const me = response.data?.data?.me;
    const pub = me?.publications?.edges?.[0]?.node?.title || 'none';
    return { ok: true, status: 200, message: `Auth OK — user: ${me?.username}, publication: "${pub}"` };
  } catch (err) {
    return { ok: false, status: err.response?.status || 0, message: err.message };
  }
}
