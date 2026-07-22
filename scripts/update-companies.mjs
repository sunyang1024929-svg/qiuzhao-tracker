import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');

const CATEGORY_MAP = [
  { cat: 'internet', tag: '互联网/AI', tagClass: 'tag-internet', words: ['科技', '互联网', 'AI', '人工智能', '云', '软件', '芯片', '半导体', '电子'] },
  { cat: 'finance', tag: '金融', tagClass: 'tag-finance', words: ['银行', '证券', '基金', '保险', '金融', '信托', '投行'] },
  { cat: 'consult', tag: '咨询', tagClass: 'tag-consult', words: ['咨询', 'Consulting'] },
  { cat: 'fmcg', tag: '快消/零售', tagClass: 'tag-fmcg', words: ['消费', '零售', '食品', '饮料', '美妆', '服饰', '家居'] },
  { cat: 'state', tag: '央国企', tagClass: 'tag-state', words: ['集团', '国企', '央企', '电网', '能源', '石油', '移动', '联通', '电信'] },
  { cat: 'auto', tag: '汽车/制造', tagClass: 'tag-auto', words: ['汽车', '制造', '新能源', '电池', '车'] },
];

const WATCHLIST = [
  { name: '小米', website: 'https://hr.xiaomi.com/campus', industry: '互联网/AI' },
  { name: '美团', website: 'https://campus.meituan.com/', industry: '互联网/AI' },
  { name: '京东', website: 'https://campus.jd.com/', industry: '互联网/AI' },
  { name: '携程', website: 'https://campus.ctrip.com/', industry: '互联网/AI' },
  { name: '快手', website: 'https://campus.kuaishou.cn/', industry: '互联网/AI' },
  { name: '小红书', website: 'https://job.xiaohongshu.com/campus', industry: '互联网/AI' },
  { name: '蔚来', website: 'https://nio.jobs.feishu.cn/campus', industry: '汽车/制造' },
  { name: '理想汽车', website: 'https://www.lixiang.com/employment/campus', industry: '汽车/制造' },
  { name: '小鹏汽车', website: 'https://hr.xiaopeng.com/campus', industry: '汽车/制造' },
  { name: '宁德时代', website: 'https://catl.zhiye.com/campus', industry: '汽车/制造' },
  { name: '招商银行', website: 'https://career.cmbchina.com/', industry: '金融' },
  { name: '中信证券', website: 'https://job.citics.com/', industry: '金融' },
  { name: '华泰证券', website: 'https://job.htsc.com.cn/', industry: '金融' },
  { name: '平安集团', website: 'https://talent.pingan.com/', industry: '金融' },
  { name: '玛氏', website: 'https://careers.mars.com/cn/zh/students-graduates', industry: '快消/零售' },
  { name: '宝洁', website: 'https://www.pgcareers.com/cn/zh/campus', industry: '快消/零售' },
  { name: '联合利华', website: 'https://careers.unilever.com/china-students', industry: '快消/零售' },
  { name: '欧莱雅', website: 'https://careers.loreal.com/zh_CN/china/content/Students', industry: '快消/零售' },
  { name: '国家电网', website: 'https://zhaopin.sgcc.com.cn/', industry: '央国企' },
  { name: '中国移动', website: 'https://job.10086.cn/', industry: '央国企' },
  { name: '中国联通', website: 'https://zglt2026.zhaopin.com/', industry: '央国企' },
  { name: '中国电信', website: 'https://campus.51job.com/chinatelecom2026/', industry: '央国企' },
  { name: '埃森哲', website: 'https://www.accenture.com/cn-zh/careers/local/students', industry: '咨询' },
  { name: 'IBM Consulting', website: 'https://www.ibm.com/careers/cn-zh/entry-level', industry: '咨询' },
];

const SEARCH_QUERIES = [
  '2027届 秋招 校园招聘 正式启动 网申',
  '2027届 校园招聘 官网 秋招 截止',
  '2026年 秋招提前批 2027届 校园招聘',
];

function slugify(name) {
  const pinyinish = name
    .replace(/集团|股份|有限|公司|中国|科技|汽车/g, '')
    .trim()
    .toLowerCase();
  const ascii = pinyinish.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  if (ascii) return ascii;
  return `company-${Buffer.from(name).toString('hex').slice(0, 12)}`;
}

function inferCategory(company) {
  const haystack = `${company.name} ${company.industry || ''} ${company.website || ''}`;
  return CATEGORY_MAP.find(c => c.words.some(w => haystack.includes(w))) || CATEGORY_MAP[0];
}

function decodeEntities(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(text) {
  return decodeEntities(text.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 qiuzhao-tracker-updater',
        'accept': 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function extractExistingCompanies(html) {
  const ids = new Set([...html.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map(m => m[1]));
  const names = new Set([...html.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]));
  return { ids, names };
}

function extractDeadline(text) {
  const patterns = [
    /(截止(?:时间)?[:：]?\s*[^。；;\n]{0,28})/,
    /((?:\d{1,2}月\d{1,2}日|\d{4}[.-]\d{1,2}[.-]\d{1,2})[^。；;\n]{0,18}截止)/,
    /(网申[^。；;\n]{0,26}(?:截止|开放|启动))/, 
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].replace(/\s+/g, ' ').trim();
  }
  return '以招聘官网最新公告为准';
}

function extractPositions(text) {
  const common = ['产品经理', '产品运营', '市场营销', '商业分析', '销售管培生', '品牌营销', '人力资源', '财务管理', '战略运营'];
  const found = common.filter(p => text.includes(p));
  return found.length ? found.slice(0, 6) : ['管培生', '市场营销', '产品运营', '商业分析'];
}

function extractCompanyFromTitle(title) {
  const clean = stripHtml(title).replace(/[|｜_-].*$/, '').trim();
  const m = clean.match(/([\u4e00-\u9fa5A-Za-z0-9&. ]{2,24}?)(?:2027届|2026届|校园招聘|秋招|招聘|校招)/);
  return m ? m[1].replace(/官方|官网|正式启动|启动|开放/g, '').trim() : '';
}

async function discoverFromSearch() {
  const candidates = [];
  for (const query of SEARCH_QUERIES) {
    const rss = await fetchText(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`);
    for (const item of rss.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const block = item[1];
      const title = decodeEntities((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
      const link = decodeEntities((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
      const desc = stripHtml((block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '');
      const name = extractCompanyFromTitle(title);
      if (!name || !link) continue;
      if (!/(2027届|2026届|秋招|校园招聘|校招|网申)/.test(`${title} ${desc}`)) continue;
      candidates.push({ name, website: link, industry: '', sourceText: `${title} ${desc}` });
    }
  }
  return candidates;
}

async function buildCandidate(company) {
  const page = await fetchText(company.website);
  const text = stripHtml(page).slice(0, 16000);
  const sourceText = `${company.sourceText || ''} ${text}`;
  if (!/(2027届|2026届|秋招|校园招聘|校招|应届生|毕业生)/.test(sourceText)) return null;

  const category = inferCategory(company);
  const recPositions = extractPositions(sourceText);
  const deadline = extractDeadline(sourceText);
  const id = slugify(company.name);
  let hostname = '';
  try { hostname = new URL(company.website).hostname.replace(/^www\./, ''); } catch {}
  return {
    id,
    name: company.name,
    cat: category.cat,
    tag: category.tag,
    tagClass: category.tagClass,
    allPositions: recPositions,
    recPositions,
    recNote: `自动发现：${deadline} | 请以官网公告为准`,
    deadline,
    deadlineType: /截止|\d{1,2}月/.test(deadline) ? 'normal' : 'open',
    website: company.website,
    websiteText: hostname || company.website,
    process: '网申 → 简历筛选 → 测评/笔试 → 面试 → OFFER | 以招聘官网公告为准',
    location: '以招聘官网岗位页面为准',
  };
}

function toCompanyLiteral(c) {
  const q = JSON.stringify;
  return `  { id:${q(c.id)}, name:${q(c.name)}, cat:${q(c.cat)}, tag:${q(c.tag)}, tagClass:${q(c.tagClass)},
    allPositions:${q(c.allPositions)},
    recPositions:${q(c.recPositions)},
    recNote:${q(c.recNote)},
    deadline:${q(c.deadline)}, deadlineType:${q(c.deadlineType)},
    website:${q(c.website)}, websiteText:${q(c.websiteText)},
    process:${q(c.process)},
    location:${q(c.location)}
  }`;
}

async function main() {
  const html = fs.readFileSync(indexPath, 'utf8');
  const existing = extractExistingCompanies(html);
  const discovered = [...WATCHLIST, ...(await discoverFromSearch())];
  const seen = new Set();
  const additions = [];

  for (const item of discovered) {
    const baseId = slugify(item.name);
    const key = item.name.toLowerCase();
    if (seen.has(key) || existing.names.has(item.name) || existing.ids.has(baseId)) continue;
    seen.add(key);
    const candidate = await buildCandidate(item);
    if (!candidate) continue;
    let id = candidate.id;
    let n = 2;
    while (existing.ids.has(id) || additions.some(c => c.id === id)) id = `${candidate.id}-${n++}`;
    candidate.id = id;
    additions.push(candidate);
    if (additions.length >= 12) break;
  }

  if (!additions.length) {
    console.log('No new companies found.');
    return;
  }

  const marker = /\n\];\n+\/\/ ={2,} Progress Steps/;
  if (!marker.test(html)) throw new Error('Cannot find COMPANIES array ending marker.');
  const insertion = ',\n' + additions.map(toCompanyLiteral).join(',\n');
  const next = html.replace(marker, (m) => `${insertion}${m}`);
  fs.writeFileSync(indexPath, next);
  console.log(`Added ${additions.length} companies:`);
  for (const c of additions) console.log(`- ${c.name} ${c.website}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
