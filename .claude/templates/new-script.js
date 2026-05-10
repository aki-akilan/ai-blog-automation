/**
 * TEMPLATE: New Script
 * Copy this file to scripts/[name].js and fill in the TODOs.
 * Remove all template comments before committing.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// TODO: Add other imports (axios, etc.)

// TODO: Update constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO: Add helper functions here

async function main() {
  console.log(chalk.bold.cyan('\n🔧 [Script Name]...\n'));

  // TODO: Check required env vars
  if (!process.env.REQUIRED_VAR) {
    console.error(chalk.red('❌ REQUIRED_VAR not set in .env'));
    process.exit(1);
  }

  // TODO: Load input files if needed
  const inputPath = path.join(__dirname, '../data/input-file.json');
  if (!fs.existsSync(inputPath)) {
    console.error(chalk.red('❌ input-file.json not found. Run previous-script.js first.'));
    process.exit(1);
  }
  const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  console.log(chalk.gray(`  Processing: ${inputData.items?.length || 0} items`));

  // TODO: Main logic here
  let result;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(chalk.blue(`  Attempt ${attempt}/${MAX_RETRIES}...`));

      // TODO: Do the actual work
      result = { success: true, data: 'output' };

      console.log(chalk.green(`  ✓ Success`));
      break;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.log(chalk.yellow(`  ⚠ Error: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`));
        await sleep(RETRY_DELAY_MS);
      } else {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${err.message}`);
      }
    }
  }

  // TODO: Save output
  const outPath = path.join(__dirname, '../data/output-file.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ ...result, completedAt: new Date().toISOString() }, null, 2));

  console.log(chalk.bold.green('\n✅ [Script Name] complete. Output: data/output-file.json\n'));
  return result;
}

// Allow both direct run and import
if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
