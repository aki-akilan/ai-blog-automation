require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const prompts = require('../config/prompts.json');

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const PROMPT_STYLE = process.env.PROMPT_STYLE || 'default';

function formatNewsItems(items) {
  return items.map((item, i) =>
    `${i + 1}. **${item.title}** (${item.source})\n   ${item.summary}\n   Link: ${item.link}`
  ).join('\n\n');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callOllama(prompt, retryCount = 0) {
  try {
    console.log(chalk.blue(`  Calling Ollama (attempt ${retryCount + 1}/${MAX_RETRIES})...`));

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'mistral',
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 2000
      }
    }, { timeout: 120000 });

    return response.data.response;
  } catch (err) {
    if (retryCount < MAX_RETRIES - 1) {
      console.log(chalk.yellow(`  ⚠ Ollama error: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`));
      await sleep(RETRY_DELAY_MS);
      return callOllama(prompt, retryCount + 1);
    }
    throw new Error(`Ollama unreachable after ${MAX_RETRIES} attempts: ${err.message}`);
  }
}

async function checkOllamaHealth() {
  try {
    await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n✍️  Generating Blog Post...\n'));

  const newsPath = path.join(__dirname, '../data/today-news.json');
  if (!fs.existsSync(newsPath)) {
    console.error(chalk.red('❌ today-news.json not found. Run fetch-news.js first.'));
    process.exit(1);
  }

  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  if (!newsData.items || newsData.items.length === 0) {
    console.error(chalk.red('❌ No news items found in today-news.json.'));
    process.exit(1);
  }

  console.log(chalk.gray(`  Using prompt style: ${PROMPT_STYLE}`));
  console.log(chalk.gray(`  News items: ${newsData.items.length}`));
  console.log(chalk.gray(`  Ollama URL: ${OLLAMA_URL}\n`));

  const ollamaOnline = await checkOllamaHealth();
  if (!ollamaOnline) {
    console.log(chalk.yellow('⚠️  Ollama is not running locally.'));
    console.log(chalk.yellow('   This is expected if running locally without Ollama installed.'));
    console.log(chalk.yellow('   The script will work on GitHub Actions where Ollama is auto-installed.\n'));
    console.log(chalk.gray('   To test locally: brew install ollama && ollama serve && ollama pull mistral'));
    process.exit(0);
  }

  const promptConfig = prompts[PROMPT_STYLE] || prompts['default'];
  const newsText = formatNewsItems(newsData.items);
  const fullPrompt = `${promptConfig.systemPrompt}\n\n${promptConfig.userPrompt.replace('{{NEWS_ITEMS}}', newsText)}`;

  console.log(chalk.blue('  Generating post with mistral model (this takes ~60-90 seconds)...'));
  const startTime = Date.now();

  const generatedPost = await callOllama(fullPrompt);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(chalk.green(`  ✓ Generated in ${elapsed}s`));

  const wordCount = generatedPost.trim().split(/\s+/).length;
  console.log(chalk.gray(`  Word count: ~${wordCount} words`));

  if (wordCount < 300) {
    console.log(chalk.yellow('  ⚠ Post seems short. Consider re-running or checking Ollama model.'));
  }

  const outPath = path.join(__dirname, '../data/today-post.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, generatedPost.trim());

  console.log(chalk.bold.green(`\n✅ Blog post saved to data/today-post.md (~${wordCount} words)\n`));
}

main().catch(err => {
  console.error(chalk.red(`\n❌ Fatal error: ${err.message}`));
  process.exit(1);
});
