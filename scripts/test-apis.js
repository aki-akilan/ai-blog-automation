require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

const DEVTO_API_URL = 'https://dev.to/api';
const HASHNODE_API_URL = 'https://gql.hashnode.com/';

async function testDevTo() {
  try {
    // GET /articles/me — lists current user's articles, confirms auth
    const response = await axios.get(`${DEVTO_API_URL}/articles/me`, {
      headers: { 'api-key': process.env.DEVTO_API_KEY },
      timeout: 10000
    });

    const username = response.data[0]?.user?.username || 'unknown';
    return {
      ok: true,
      status: response.status,
      message: `Auth OK — user: ${username}, article count: ${response.data.length}`
    };
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) return { ok: false, status, message: 'Auth failed — invalid DEVTO_API_KEY' };
    if (status === 404) {
      // No articles yet — API still authenticated
      return { ok: true, status: 200, message: 'Auth OK (no articles yet on this account)' };
    }
    return { ok: false, status: status || 0, message: err.message };
  }
}

async function testHashnode() {
  const query = `
    query {
      me {
        id
        username
        name
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
      timeout: 10000
    });

    const errors = response.data?.errors;
    if (errors && errors.length > 0) {
      return { ok: false, status: 200, message: `GraphQL error: ${errors[0].message}` };
    }

    const me = response.data?.data?.me;
    if (!me) return { ok: false, status: 200, message: 'No user data returned — check token' };

    const pubTitle = me.publications?.edges?.[0]?.node?.title || 'none';
    return {
      ok: true,
      status: 200,
      message: `Auth OK — user: ${me.username}, publication: "${pubTitle}"`
    };
  } catch (err) {
    return { ok: false, status: err.response?.status || 0, message: err.message };
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🔌 Testing API Connections (dry run — no posting)\n'));

  const checks = [
    { name: 'DEVTO_API_KEY', value: process.env.DEVTO_API_KEY },
    { name: 'HASHNODE_TOKEN', value: process.env.HASHNODE_TOKEN }
  ];

  let credsMissing = false;
  for (const check of checks) {
    if (!check.value) {
      console.log(chalk.red(`  ✗ ${check.name} not set in .env`));
      credsMissing = true;
    } else {
      console.log(chalk.gray(`  ✓ ${check.name} present (${check.value.length} chars)`));
    }
  }

  if (credsMissing) {
    console.log(chalk.red('\n❌ Missing credentials. Add them to .env and retry.\n'));
    process.exit(1);
  }

  console.log('');

  // Run both tests in parallel
  const [devtoResult, hashnodeResult] = await Promise.all([
    testDevTo(),
    testHashnode()
  ]);

  const icon = r => r.ok ? chalk.green('✅') : chalk.red('❌');

  console.log(`${icon(devtoResult)} Dev.to     [HTTP ${devtoResult.status}]: ${devtoResult.message}`);
  console.log(`${icon(hashnodeResult)} Hashnode   [HTTP ${hashnodeResult.status}]: ${hashnodeResult.message}`);

  const allOk = devtoResult.ok && hashnodeResult.ok;

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
