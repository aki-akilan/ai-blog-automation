require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const ANALYTICS_PATH = path.join(__dirname, '../data/analytics.json');
const DASHBOARD_PATH = path.join(__dirname, '../data/dashboard.html');

function loadAnalytics() {
  if (!fs.existsSync(ANALYTICS_PATH)) return { entries: [], totals: { posts: 0 } };
  return JSON.parse(fs.readFileSync(ANALYTICS_PATH, 'utf8'));
}

function statusBadge(ok) {
  return ok
    ? '<span style="color:#2e7d32;font-weight:600">✓ OK</span>'
    : '<span style="color:#c62828;font-weight:600">✗ Failed</span>';
}

function buildDashboard(analytics) {
  const { entries, totals } = analytics;
  const lastUpdated = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const recentRows = [...entries].reverse().slice(0, 20).map(e => {
    const d = new Date(e.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const devtoLink = e.platforms.devto.url
      ? `<a href="${e.platforms.devto.url}" target="_blank">${statusBadge(true)}</a>`
      : statusBadge(false);
    const hashnodeLink = e.platforms.hashnode.url
      ? `<a href="${e.platforms.hashnode.url}" target="_blank">${statusBadge(true)}</a>`
      : statusBadge(false);
    const statusColor = e.status === 'success' ? '#e8f5e9' : e.status === 'partial' ? '#fff8e1' : '#ffebee';

    return `
      <tr style="background:${statusColor}">
        <td style="padding:10px 14px;font-size:13px;color:#555">${d}</td>
        <td style="padding:10px 14px;font-size:14px;font-weight:500;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.title}</td>
        <td style="padding:10px 14px;text-align:center">${devtoLink}</td>
        <td style="padding:10px 14px;text-align:center">${hashnodeLink}</td>
        <td style="padding:10px 14px;text-align:center;font-size:13px">${e.wordCount || '—'}</td>
      </tr>`;
  }).join('');

  // Sparkline-style bar chart (last 14 days)
  const last14 = [...entries].reverse().slice(0, 14).reverse();
  const bars = last14.map(e => {
    const color = e.status === 'success' ? '#4caf50' : e.status === 'partial' ? '#ffc107' : '#ef5350';
    const label = new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return `<div title="${label}: ${e.title}" style="flex:1;background:${color};border-radius:3px 3px 0 0;min-height:8px"></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Blog Dashboard</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f4f6f9; color:#1a1a2e; }
    .header { background:linear-gradient(135deg,#667eea,#764ba2); padding:32px 40px; color:white; }
    .header h1 { font-size:24px; font-weight:700; }
    .header p { opacity:0.75; font-size:14px; margin-top:6px; }
    .container { max-width:960px; margin:0 auto; padding:32px 16px; }
    .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:32px; }
    .stat { background:white; border-radius:10px; padding:20px 24px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
    .stat .num { font-size:32px; font-weight:700; color:#667eea; }
    .stat .lbl { font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-top:4px; }
    .card { background:white; border-radius:10px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06); margin-bottom:24px; }
    .card h2 { font-size:16px; font-weight:600; color:#333; margin-bottom:16px; }
    .chart { display:flex; gap:4px; align-items:flex-end; height:60px; }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    th { text-align:left; padding:10px 14px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#888; border-bottom:2px solid #f0f0f0; }
    td { border-bottom:1px solid #f5f5f5; }
    a { color:#667eea; text-decoration:none; }
    .legend { display:flex; gap:16px; font-size:12px; color:#888; margin-top:10px; }
    .legend span { display:inline-flex; align-items:center; gap:6px; }
    .dot { width:10px; height:10px; border-radius:2px; }
    .footer { text-align:center; font-size:12px; color:#aaa; padding:24px; }
    @media(max-width:600px) { .stats { grid-template-columns:repeat(2,1fr); } }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI Insights Daily — Dashboard</h1>
    <p>Last updated: ${lastUpdated} IST</p>
  </div>

  <div class="container">
    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <div class="num">${totals.posts || 0}</div>
        <div class="lbl">Total Posts</div>
      </div>
      <div class="stat">
        <div class="num">${totals.devtoSuccesses || 0}</div>
        <div class="lbl">Dev.to Published</div>
      </div>
      <div class="stat">
        <div class="num">${totals.hashnodeSuccesses || 0}</div>
        <div class="lbl">Hashnode Published</div>
      </div>
      <div class="stat">
        <div class="num">$${totals.estimatedEarningsUSD || '0.00'}</div>
        <div class="lbl">Est. Earnings</div>
      </div>
    </div>

    <!-- Chart -->
    ${last14.length > 0 ? `
    <div class="card">
      <h2>Post Activity (last ${last14.length} days)</h2>
      <div class="chart">${bars}</div>
      <div class="legend">
        <span><span class="dot" style="background:#4caf50"></span>Success</span>
        <span><span class="dot" style="background:#ffc107"></span>Partial</span>
        <span><span class="dot" style="background:#ef5350"></span>Failed</span>
      </div>
    </div>` : ''}

    <!-- Table -->
    <div class="card">
      <h2>Recent Posts</h2>
      ${entries.length === 0 ? '<p style="color:#aaa;font-size:14px">No posts yet. Run the automation to see data here.</p>' : `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th style="text-align:center">Dev.to</th>
            <th style="text-align:center">Hashnode</th>
            <th style="text-align:center">Words</th>
          </tr>
        </thead>
        <tbody>${recentRows}</tbody>
      </table>`}
    </div>
  </div>

  <div class="footer">AI Insights Daily · Automation Dashboard · Open data/analytics.json for raw data</div>
</body>
</html>`;
}

async function main() {
  console.log(chalk.bold.cyan('\n📊 Generating Dashboard...\n'));

  const analytics = loadAnalytics();
  const html = buildDashboard(analytics);

  fs.mkdirSync(path.dirname(DASHBOARD_PATH), { recursive: true });
  fs.writeFileSync(DASHBOARD_PATH, html);

  console.log(chalk.bold.green(`✅ Dashboard saved to data/dashboard.html`));
  console.log(chalk.gray(`   Posts tracked: ${analytics.totals.posts || 0}`));
  console.log(chalk.gray(`   Open in browser to view\n`));
}

if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red(`\n❌ Dashboard error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { main };
