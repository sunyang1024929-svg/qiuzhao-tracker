import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const publicUserDataPath = path.join(root, 'user-data.json');

function ensurePublicUserDataIsEmpty() {
  const raw = fs.readFileSync(publicUserDataPath, 'utf8');
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('user-data.json must contain valid JSON.');
  }

  if (data === null || Array.isArray(data) || typeof data !== 'object' || Object.keys(data).length !== 0) {
    throw new Error('Refusing to run: user-data.json must be {} so personal application data cannot be committed.');
  }
}

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

const GLOBAL_OFFICIAL_WATCHLIST = [
  { name: 'Amazon', aliases: ['亚马逊'], website: 'https://www.amazon.jobs/content/zh/career-programs/university', industry: '互联网/AI' },
  { name: 'Google', aliases: ['谷歌'], website: 'https://www.google.com/about/careers/applications/students/', industry: '互联网/AI' },
  { name: 'Microsoft', aliases: ['微软'], website: 'https://careers.microsoft.com/students/us/en', industry: '互联网/AI' },
  { name: 'Apple', aliases: ['苹果'], website: 'https://jobs.apple.com/en-us/students', industry: '互联网/AI' },
  { name: 'Meta', aliases: ['Facebook'], website: 'https://www.metacareers.com/careerprograms/students', industry: '互联网/AI' },
  { name: 'NVIDIA', aliases: ['英伟达'], website: 'https://www.nvidia.com/en-us/about-nvidia/careers/university-recruiting/', industry: '互联网/AI' },
  { name: 'Intel', aliases: ['英特尔'], website: 'https://www.intel.com/content/www/us/en/jobs/students.html', industry: '互联网/AI' },
  { name: 'Qualcomm', aliases: ['高通'], website: 'https://careers.qualcomm.com/students', industry: '互联网/AI' },
  { name: 'Oracle', aliases: ['甲骨文'], website: 'https://www.oracle.com/careers/students-grads/', industry: '互联网/AI' },
  { name: 'SAP', aliases: ['思爱普'], website: 'https://jobs.sap.com/content/students/', industry: '互联网/AI' },
  { name: 'Salesforce', aliases: ['赛富时'], website: 'https://careers.salesforce.com/en/university-recruiting/', industry: '互联网/AI' },
  { name: 'Adobe', aliases: ['奥多比'], website: 'https://careers.adobe.com/us/en/university', industry: '互联网/AI' },
  { name: 'Cisco', aliases: ['思科'], website: 'https://jobs.cisco.com/jobs/SearchJobs/students-and-new-graduate', industry: '互联网/AI' },
  { name: 'IBM', aliases: ['IBM Consulting'], website: 'https://www.ibm.com/careers/cn-zh/entry-level', industry: '咨询' },
  { name: 'Dell Technologies', aliases: ['戴尔科技'], website: 'https://jobs.dell.com/students', industry: '互联网/AI' },
  { name: 'HP', aliases: ['惠普'], website: 'https://jobs.hp.com/students-and-graduates', industry: '互联网/AI' },
  { name: 'Tesla', aliases: ['特斯拉'], website: 'https://www.tesla.com/careers/search/?type=3', industry: '汽车/制造' },
  { name: 'BMW', aliases: ['宝马'], website: 'https://www.bmwgroup.jobs/cn/zh/students.html', industry: '汽车/制造' },
  { name: 'Mercedes-Benz', aliases: ['奔驰', '梅赛德斯-奔驰'], website: 'https://group.mercedes-benz.com/careers/students/', industry: '汽车/制造' },
  { name: 'Volkswagen', aliases: ['大众汽车'], website: 'https://www.volkswagen-group.com/en/careers-15746', industry: '汽车/制造' },
  { name: 'Toyota', aliases: ['丰田'], website: 'https://www.toyota.com.cn/career/', industry: '汽车/制造' },
  { name: 'Ford', aliases: ['福特'], website: 'https://corporate.ford.com/careers/students-and-recent-graduates.html', industry: '汽车/制造' },
  { name: 'General Motors', aliases: ['通用汽车'], website: 'https://search-careers.gm.com/en/university-recruiting', industry: '汽车/制造' },
  { name: 'Bosch', aliases: ['博世'], website: 'https://www.bosch.com.cn/careers/students-and-graduates/', industry: '汽车/制造' },
  { name: 'Siemens', aliases: ['西门子'], website: 'https://jobs.siemens.com/careers', industry: '汽车/制造' },
  { name: 'GE Vernova', aliases: ['通用电气'], website: 'https://jobs.gecareers.com/vernova/global/en/students', industry: '汽车/制造' },
  { name: 'Honeywell', aliases: ['霍尼韦尔'], website: 'https://careers.honeywell.com/us/en/students-and-graduates', industry: '汽车/制造' },
  { name: 'Schneider Electric', aliases: ['施耐德电气'], website: 'https://www.se.com/cn/zh/about-us/careers/students-young-professionals/', industry: '汽车/制造' },
  { name: 'ABB', aliases: ['ABB中国'], website: 'https://careers.abb/global/en/students-graduates', industry: '汽车/制造' },
  { name: '3M', aliases: ['明尼苏达矿业制造'], website: 'https://www.3m.com/3M/en_US/careers-us/students/', industry: '快消/零售' },
  { name: 'Dow', aliases: ['陶氏'], website: 'https://corporate.dow.com/en-us/careers/students.html', industry: '汽车/制造' },
  { name: 'BASF', aliases: ['巴斯夫'], website: 'https://basf.jobs/global/en/students', industry: '汽车/制造' },
  { name: 'Procter & Gamble', aliases: ['宝洁', 'P&G'], website: 'https://www.pgcareers.com/cn/zh/campus', industry: '快消/零售' },
  { name: 'Unilever', aliases: ['联合利华'], website: 'https://careers.unilever.com/china-students', industry: '快消/零售' },
  { name: 'LVMH', aliases: ['路威酩轩'], website: 'https://www.lvmh.cn/join-us/students-young-graduates/', industry: '快消/零售' },
  { name: 'L’Oréal', aliases: ['欧莱雅'], website: 'https://careers.loreal.com/zh_CN/china/content/Students', industry: '快消/零售' },
  { name: 'Nestlé', aliases: ['雀巢'], website: 'https://www.nestle.com.cn/jobs/students-graduates', industry: '快消/零售' },
  { name: 'Coca-Cola', aliases: ['可口可乐'], website: 'https://careers.coca-colacompany.com/early-career', industry: '快消/零售' },
  { name: 'PepsiCo', aliases: ['百事'], website: 'https://www.pepsicojobs.com/main/students-and-graduates', industry: '快消/零售' },
  { name: 'Mars', aliases: ['玛氏'], website: 'https://careers.mars.com/cn/zh/students-graduates', industry: '快消/零售' },
  { name: 'Mondelez', aliases: ['亿滋'], website: 'https://www.mondelezinternational.com/careers/students-graduates/', industry: '快消/零售' },
  { name: 'Nike', aliases: ['耐克'], website: 'https://jobs.nike.com/internships', industry: '快消/零售' },
  { name: 'Adidas', aliases: ['阿迪达斯'], website: 'https://careers.adidas-group.com/teams/students-and-graduates', industry: '快消/零售' },
  { name: 'Johnson & Johnson', aliases: ['强生'], website: 'https://www.careers.jnj.com/en/students', industry: '快消/零售' },
  { name: 'Pfizer', aliases: ['辉瑞'], website: 'https://www.pfizer.com/about/careers/early-careers', industry: '快消/零售' },
  { name: 'Novartis', aliases: ['诺华'], website: 'https://www.novartis.com/careers/career-programs/students', industry: '快消/零售' },
  { name: 'Roche', aliases: ['罗氏'], website: 'https://careers.roche.com/global/en/students-graduates', industry: '快消/零售' },
  { name: 'Sanofi', aliases: ['赛诺菲'], website: 'https://www.sanofi.com/en/careers/students-graduates', industry: '快消/零售' },
  { name: 'AstraZeneca', aliases: ['阿斯利康'], website: 'https://careers.astrazeneca.com/students', industry: '快消/零售' },
  { name: 'Bayer', aliases: ['拜耳'], website: 'https://www.bayer.com/en/career/students', industry: '快消/零售' },
  { name: 'JPMorgan Chase', aliases: ['摩根大通'], website: 'https://careers.jpmorgan.com/global/en/students', industry: '金融' },
  { name: 'Morgan Stanley', aliases: ['摩根士丹利'], website: 'https://www.morganstanley.com/careers/career-opportunities-search/students-graduates', industry: '金融' },
  { name: 'Goldman Sachs', aliases: ['高盛'], website: 'https://www.goldmansachs.com/careers/students', industry: '金融' },
  { name: 'Citi', aliases: ['花旗'], website: 'https://jobs.citi.com/students-and-graduates', industry: '金融' },
  { name: 'HSBC', aliases: ['汇丰'], website: 'https://www.hsbc.com/careers/students-and-graduates', industry: '金融' },
  { name: 'UBS', aliases: ['瑞银'], website: 'https://www.ubs.com/global/en/careers/students.html', industry: '金融' },
  { name: 'Deutsche Bank', aliases: ['德意志银行'], website: 'https://careers.db.com/students-graduates', industry: '金融' },
  { name: 'BlackRock', aliases: ['贝莱德'], website: 'https://careers.blackrock.com/students-and-graduates', industry: '金融' },
  { name: 'PwC', aliases: ['普华永道'], website: 'https://www.pwccn.com/en/careers/students.html', industry: '咨询' },
  { name: 'Deloitte', aliases: ['德勤'], website: 'https://www2.deloitte.com/cn/en/careers/students.html', industry: '咨询' },
  { name: 'EY', aliases: ['安永'], website: 'https://www.ey.com/zh_cn/careers/students', industry: '咨询' },
  { name: 'KPMG', aliases: ['毕马威'], website: 'https://kpmg.com/cn/en/home/careers/graduates.html', industry: '咨询' },
  { name: 'Accenture', aliases: ['埃森哲'], website: 'https://www.accenture.com/cn-zh/careers/local/students', industry: '咨询' },
  { name: 'McKinsey', aliases: ['麦肯锡'], website: 'https://www.mckinsey.com/careers/students', industry: '咨询' },
  { name: 'BCG', aliases: ['波士顿咨询'], website: 'https://careers.bcg.com/students', industry: '咨询' },
  { name: 'Bain', aliases: ['贝恩'], website: 'https://www.bain.com/careers/work-with-us/internships-programs/', industry: '咨询' },
  { name: 'SpaceX', aliases: ['太空探索技术'], website: 'https://www.spacex.com/careers/', industry: '互联网/AI' },
  { name: 'OpenAI', aliases: [], website: 'https://openai.com/careers/search/', industry: '互联网/AI' },
  { name: 'Stripe', aliases: [], website: 'https://stripe.com/jobs/university', industry: '互联网/AI' },
  { name: 'Canva', aliases: [], website: 'https://www.canva.com/careers/early-careers/', industry: '互联网/AI' },
  { name: 'Databricks', aliases: [], website: 'https://www.databricks.com/company/careers/university-recruiting', industry: '互联网/AI' },
  { name: 'Scale AI', aliases: [], website: 'https://www.scale.com/careers', industry: '互联网/AI' },
  { name: 'Anthropic', aliases: [], website: 'https://www.anthropic.com/careers', industry: '互联网/AI' },
  { name: 'Shein', aliases: ['希音'], website: 'https://careers.sheingroup.com/campus', industry: '快消/零售' },
  { name: 'DJI', aliases: ['大疆'], website: 'https://we.dji.com/zh-CN/campus', industry: '互联网/AI' },
  { name: 'DeepSeek', aliases: ['深度求索'], website: 'https://www.deepseek.com/careers', industry: '互联网/AI' },
  { name: 'MiniMax', aliases: ['稀宇科技'], website: 'https://www.minimaxi.com/careers', industry: '互联网/AI' },
  { name: '智谱AI', aliases: ['Zhipu AI'], website: 'https://www.zhipuai.cn/careers', industry: '互联网/AI' },
  { name: '月之暗面', aliases: ['Moonshot AI'], website: 'https://www.moonshot.cn/careers', industry: '互联网/AI' },
  { name: '阶跃星辰', aliases: ['StepFun'], website: 'https://www.stepfun.com/careers', industry: '互联网/AI' },
  { name: '百川智能', aliases: ['Baichuan AI'], website: 'https://www.baichuan-ai.com/home#jobs', industry: '互联网/AI' },
];

const BROAD_SEARCH_QUERIES = [
  '2027校园招聘',
  '2027 校园招聘',
  '2027届秋招',
  '2027届 秋招',
  '秋招 2027届 校园招聘',
  '2027届 秋招 校园招聘 正式启动 网申',
  '2027届 校园招聘 正式启动 官网',
  '2027届 校园招聘 官网 秋招 截止',
  '2027届 校招 官网 正式启动',
  '2026年 秋招提前批 2027届 校园招聘',
  '世界500强 2027届 校园招聘 官网',
  '世界五百强 2027届 秋招 官网',
  '独角兽 2027届 校园招聘 官网',
  '知名外企 2027届 校园招聘 官网',
  '外企 2027届 管培生 校园招聘 官网',
];

const SEARCH_QUERIES = BROAD_SEARCH_QUERIES;
const GENERIC_TITLE_BLACKLIST = [
  '校园',
  '校招',
  '秋招',
  '外企',
  '岗位汇总',
  '岗位',
  '招聘',
  '2027',
  '2027届',
  '2026届',
  '27届',
  '国企央企',
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

function normalizeCompanyName(name) {
  return name
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/集团|股份|有限|公司|中国|科技|汽车|technologies|technology|inc|corp|corporation|group|china/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '');
}

function companyKeys(company) {
  return [company.name, ...(company.aliases || [])].map(normalizeCompanyName).filter(Boolean);
}

function buildExistingCompanyKeySet(html) {
  return new Set([...html.matchAll(/name:\s*"([^"]+)"/g)].flatMap(m => {
    const name = m[1];
    return [name, name.replace(/[A-Za-z&. -]+/g, ''), name.replace(/[\u4e00-\u9fa5]+/g, '')]
      .map(normalizeCompanyName)
      .filter(Boolean);
  }));
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

function hasRecruitmentSignal(text) {
  return /(2027届|2027\s*(?:campus|graduate|internship|program|programme)|校园招聘|校招|秋招|应届|毕业生|graduates?|students?|university recruiting|early careers|campus recruitment)/i.test(text);
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

const COMPANIES_END_MARKER = /\n\s*\];\n+(?:\/\/ ={2,} Progress Steps|function normalizeCompanyName)/;

function hasCompaniesEndMarker(html) {
  return COMPANIES_END_MARKER.test(html);
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

function extractLaunchInfo(text) {
  const patterns = [
    /(?:提前批|秋招|校园招聘|网申)[^。；;\n]{0,24}?(?:于)?\s*(\d{1,2})月(\d{1,2})日[^。；;\n]{0,12}(?:启动|开放|开始)/,
    /(\d{1,2})月(\d{1,2})日[^。；;\n]{0,12}(?:启动|开放|开始)/,
    /(?:启动|开放|开始)[^。；;\n]{0,16}(\d{1,2})月(\d{1,2})日/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    return {
      launchStatus: 'open',
      launchDate: `${new Date().getFullYear()}-${String(match[1]).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`,
    };
  }
  const explicitOpen = /(正式启动|招聘[^。；;\n]{0,20}启动|网申[^。；;\n]{0,20}开放|投递[^。；;\n]{0,20}开放|申请[^。；;\n]{0,20}开放|报名[^。；;\n]{0,20}开始|now open|applications?\s+are\s+open|apply now|accepting applications|open for applications|recruiting now)/i;
  if (hasRecruitmentSignal(text) && explicitOpen.test(text)) {
    return { launchStatus: 'open', launchDate: '' };
  }
  return { launchStatus: 'not_open', launchDate: '' };
}

function extractPositions(text) {
  const common = ['产品经理', '产品运营', '市场营销', '商业分析', '销售管培生', '品牌营销', '人力资源', '财务管理', '战略运营'];
  const found = common.filter(p => text.includes(p));
  return found.length ? found.slice(0, 6) : ['管培生', '市场营销', '产品运营', '商业分析'];
}

function extractCompanyFromTitle(title) {
  const clean = stripHtml(title).replace(/[|｜_-].*$/, '').trim();
  const m = clean.match(/([\u4e00-\u9fa5A-Za-z0-9&. ]{2,24}?)(?:2027届|2026届|校园招聘|秋招|招聘|校招)/);
  const name = m ? m[1].replace(/官方|官网|正式启动|启动|开放/g, '').trim() : '';
  if (!name) return '';
  const normalized = normalizeCompanyName(name);
  if (!normalized) return '';
  if (/^\d{2,4}(?:届)?$/.test(normalized)) return '';
  if (GENERIC_TITLE_BLACKLIST.some(term => normalized === term || normalized.includes(term))) return '';
  return name;
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
  if (!hasRecruitmentSignal(sourceText)) return null;

  const category = inferCategory(company);
  const recPositions = extractPositions(sourceText);
  const deadline = extractDeadline(sourceText);
  const launch = extractLaunchInfo(sourceText);
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
    launchStatus: launch.launchStatus,
    launchDate: launch.launchDate,
    launchEvidence: launch.launchStatus === 'open' ? 'official_auto' : 'unverified',
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
    launchStatus:${q(c.launchStatus)}, launchDate:${q(c.launchDate)}, launchEvidence:${q(c.launchEvidence)},
    website:${q(c.website)}, websiteText:${q(c.websiteText)},
    process:${q(c.process)},
    location:${q(c.location)}
  }`;
}

async function main() {
  ensurePublicUserDataIsEmpty();
  const html = fs.readFileSync(indexPath, 'utf8');
  const existing = extractExistingCompanies(html);
  const existingCompanyKeys = buildExistingCompanyKeySet(html);
  const discovered = [...WATCHLIST, ...GLOBAL_OFFICIAL_WATCHLIST, ...(await discoverFromSearch())];
  const seen = new Set();
  const additions = [];

  for (let i = 0; i < discovered.length && additions.length < 12; i += 8) {
    const batch = discovered.slice(i, i + 8);
    const filtered = batch.filter(item => {
      const baseId = slugify(item.name);
      const keys = companyKeys(item);
      if (
        keys.some(key => seen.has(key) || existingCompanyKeys.has(key)) ||
        existing.names.has(item.name) ||
        existing.ids.has(baseId)
      ) return false;
      for (const key of keys) seen.add(key);
      return true;
    });
    const built = await Promise.all(filtered.map(item => buildCandidate(item)));
    for (const candidate of built) {
      if (!candidate) continue;
      let id = candidate.id;
      let n = 2;
      while (existing.ids.has(id) || additions.some(c => c.id === id)) id = `${candidate.id}-${n++}`;
      candidate.id = id;
      additions.push(candidate);
      if (additions.length >= 12) break;
    }
  }

  if (!additions.length) {
    console.log('No new companies found.');
    return;
  }

  if (!hasCompaniesEndMarker(html)) throw new Error('Cannot find COMPANIES array ending marker.');
  const insertion = ',\n' + additions.map(toCompanyLiteral).join(',\n');
  const next = html.replace(COMPANIES_END_MARKER, (m) => `${insertion}${m}`);
  fs.writeFileSync(indexPath, next);
  console.log(`Added ${additions.length} companies:`);
  for (const c of additions) console.log(`- ${c.name} ${c.website}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { extractCompanyFromTitle, hasCompaniesEndMarker };
