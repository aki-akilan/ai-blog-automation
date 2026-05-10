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

// Rotates daily so each day gets a different focus angle
const DAILY_ANGLES = [
  'Focus on practical implications for developers and engineers.',
  'Focus on business impact and how companies are adopting this.',
  'Focus on what this means for everyday users and society.',
  'Focus on the technical breakthroughs and how they were achieved.',
  'Focus on future predictions and where this is heading in the next 12 months.',
  'Focus on controversies, risks, and what critics are saying.',
  'Focus on startups and new players disrupting the space.',
];

function getDailyAngle() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_ANGLES[dayOfYear % DAILY_ANGLES.length];
}

function shuffleAndPick(items, count) {
  // Seed shuffle with today's date so it's consistent within a day but different each day
  const seed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function formatNewsItems(items) {
  return items.map((item, i) =>
    `${i + 1}. **${item.title}** (${item.source})\n   ${item.summary}\n   Link: ${item.link}`
  ).join('\n\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callOllama(prompt, retryCount = 0) {
  try {
    console.log(chalk.blue(`  Calling Ollama (attempt ${retryCount + 1}/${MAX_RETRIES})...`));
    console.log(chalk.gray(`  Timeout: 8 minutes (GitHub Actions CPU is slow for LLM inference)`));

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'mistral',
      prompt,
      stream: false,
      options: {
        temperature: 0.75,
        top_p: 0.9,
        top_k: 40,
        num_predict: 1500,  // slightly fewer tokens = faster generation
        seed: parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
      }
    }, { timeout: 480000 }); // 8 minutes — mistral on 2-core CI takes 3-5 min

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

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const dailyAngle = getDailyAngle();

  // Pick 6 items (shuffled by date seed) so each run focuses on a different subset
  const selectedItems = shuffleAndPick(newsData.items, Math.min(6, newsData.items.length));

  console.log(chalk.gray(`  Date: ${today}`));
  console.log(chalk.gray(`  Prompt style: ${PROMPT_STYLE}`));
  console.log(chalk.gray(`  Selected articles: ${selectedItems.length} of ${newsData.items.length}`));
  console.log(chalk.gray(`  Angle: ${dailyAngle}`));
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
  const newsText = formatNewsItems(selectedItems);

  // Inject date + unique angle into the prompt for freshness
  const uniquenessHeader = `Today's date: ${today}\nToday's writing angle: ${dailyAngle}\nIMPORTANT: Write a completely fresh, original post. Do not repeat titles or topics from previous posts.\n\n`;
  const fullPrompt = `${promptConfig.systemPrompt}\n\n${uniquenessHeader}${promptConfig.userPrompt.replace('{{NEWS_ITEMS}}', newsText)}`;

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
