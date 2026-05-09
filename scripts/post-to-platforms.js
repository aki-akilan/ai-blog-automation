require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const { main: postToDevTo } = require('./post-to-devto');
const { main: postToHashnode } = require('./post-to-hashnode');

async function main() {
  console.log(chalk.bold.magenta('\n🚀 Publishing to All Platforms...\n'));
  console.log(chalk.gray(`  Mode: ${process.env.TEST_MODE === 'true' ? 'TEST (draft)' : 'LIVE (published)'}`));
  console.log(chalk.gray(`  Time: ${new Date().toISOString()}\n`));

  const results = {
    devto: null,
    hashnode: null,
    publishedAt: new Date().toISOString(),
    errors: []
  };

  // Run both in parallel
  const [devtoResult, hashnodeResult] = await Promise.allSettled([
    postToDevTo(),
    postToHashnode()
  ]);

  if (devtoResult.status === 'fulfilled') {
    results.devto = devtoResult.value;
    console.log(chalk.green(`  ✓ Dev.to: ${devtoResult.value.url}`));
  } else {
    results.errors.push({ platform: 'devto', error: devtoResult.reason?.message });
    console.log(chalk.red(`  ✗ Dev.to: ${devtoResult.reason?.message}`));
  }

  if (hashnodeResult.status === 'fulfilled') {
    results.hashnode = hashnodeResult.value;
    console.log(chalk.green(`  ✓ Hashnode: ${hashnodeResult.value.url}`));
  } else {
    results.errors.push({ platform: 'hashnode', error: hashnodeResult.reason?.message });
    console.log(chalk.red(`  ✗ Hashnode: ${hashnodeResult.reason?.message}`));
  }

  const outPath = path.join(__dirname, '../data/publish-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  const successCount = [devtoResult, hashnodeResult].filter(r => r.status === 'fulfilled').length;
  const total = 2;

  console.log(chalk.bold(`\n  Result: ${successCount}/${total} platforms succeeded`));

  if (successCount === 0) {
    console.log(chalk.red('\n❌ All platforms failed. Check credentials and network.'));
    process.exit(1);
  } else if (successCount < total) {
    console.log(chalk.yellow(`\n⚠️  Partial success (${successCount}/${total}). Check publish-results.json for details.`));
  } else {
    console.log(chalk.bold.green('\n✅ Published to all platforms successfully!\n'));
  }

  return results;
}

main().catch(err => {
  console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
  process.exit(1);
});
