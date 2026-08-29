// 一念成笺：运行真实 app.js 的离线契约自检，不引入浏览器或第三方依赖。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'app.js');
const appSource = fs.readFileSync(appPath, 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

let passed = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  passed += 1;
}

const requiredIds = [
  'a11yStatus', 'toast', 'moodChips', 'mood', 'themeCategory', 'theme', 'cipai', 'palette', 'author',
  'go', 'poemTitleBadge', 'poemTitle', 'poem', 'interpretation', 'source', 'note', 'seal',
  'download', 'reroll', 'copyNote', 'invite', 'challengeHint', 'historyPanel', 'historyList', 'clearHistory'
];

const elements = new Map();
function makeElement(id, tag = 'div') {
  const element = {
    id,
    tagName: tag.toUpperCase(),
    type: tag === 'button' ? 'button' : '',
    value: id === 'cipai' ? '7' : id === 'themeCategory' ? '山水' : id === 'palette' ? 'cinnabar' : '',
    textContent: '',
    innerHTML: '',
    className: '',
    children: [],
    style: {},
    classList: {
      add: (...names) => { names.forEach(name => { element._classes = element._classes || new Set(); element._classes.add(name); }); },
      remove: (...names) => { names.forEach(name => { if (element._classes) element._classes.delete(name); }); },
      contains: name => Boolean(element._classes && element._classes.has(name))
    },
    _attrs: {},
    _listeners: {},
    addEventListener(name, handler) { this._listeners[name] = handler; },
    setAttribute(name, value) { this._attrs[name] = String(value); },
    getAttribute(name) { return this._attrs[name] == null ? null : this._attrs[name]; },
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) { this.children = children; },
    querySelectorAll(selector) {
      if (selector === '.chip') return this.children.filter(child => child.className === 'chip');
      return [];
    },
    querySelector() { return null; },
    select() {},
    focus() {},
    scrollIntoView() {},
    click() {},
    remove() {}
  };
  return element;
}

for (const id of requiredIds) elements.set(id, makeElement(id));
const chipValues = ['清欢', '思念', '孤勇', '松弛', '期许', '释然', '怦然', '归心', '远行'];
elements.get('moodChips').children = chipValues.map(value => {
  const chip = makeElement('', 'button');
  chip.className = 'chip';
  chip.setAttribute('data-mood', value);
  chip.setAttribute('aria-pressed', 'false');
  return chip;
});
const preview = makeElement('', 'section');
preview.className = 'preview';

const canvasCalls = [];
const canvasContext = {
  scale(...args) { canvasCalls.push({ name: 'scale', args }); },
  setTransform(...args) { canvasCalls.push({ name: 'setTransform', args }); },
  createLinearGradient() { return { addColorStop() {} }; },
  fillRect(...args) { canvasCalls.push({ name: 'fillRect', args }); },
  strokeRect(...args) { canvasCalls.push({ name: 'strokeRect', args }); },
  beginPath() {},
  arc() {},
  ellipse() {},
  fill() {},
  fillText(...args) { canvasCalls.push({ name: 'fillText', args }); }
};
const canvas = elements.get('seal');
canvas.width = 1200;
canvas.height = 1600;
canvas.getContext = () => canvasContext;
canvas.toDataURL = () => 'data:image/png;base64,fixture';

const storageMap = new Map();
const storage = {
  getItem(key) { return storageMap.has(key) ? storageMap.get(key) : null; },
  setItem(key, value) { storageMap.set(key, String(value)); },
  removeItem(key) { storageMap.delete(key); }
};

const document = {
  querySelector(selector) {
    if (selector.startsWith('#')) return elements.get(selector.slice(1)) || null;
    if (selector === '.preview') return preview;
    return null;
  },
  createElement(tag) { return makeElement('', tag); },
  addEventListener() {},
  execCommand() { return true; },
  styleSheets: {}
};
const window = {
  innerWidth: 1200,
  location: { hash: '', href: 'file:///D:/xhs/guofeng-vibecoding-studio/index.html' },
  localStorage: storage,
  addEventListener() {}
};
const context = {
  console,
  document,
  navigator: {},
  window,
  setTimeout,
  clearTimeout,
  Math,
  Date,
  String,
  Array,
  Object,
  RegExp,
  Set,
  JSON,
  encodeURIComponent,
  decodeURIComponent,
  globalThis: null
};
context.globalThis = context;

// 仅在隔离 VM 中注入测试出口，生产页面不暴露这些内部函数。
const instrumented = appSource.replace(
  /\n\}\)\(\);\s*$/,
  '\n  globalThis.__GFV_TEST_API__ = { buildPoem, buildNote, renderSeal, renderPoem, escapeHtml, validatePoem, makeSeed, encodeChallenge, parseChallengeHash, saveHistory, readHistory, THEMES, MOODS, PALETTES, CIPAI_5, CIPAI_7, HISTORY_LIMIT };\n})();\n'
);
assert(instrumented !== appSource, '未找到 app.js 测试注入点');
vm.runInNewContext(instrumented, context, { filename: appPath });
const api = context.__GFV_TEST_API__;
assert(api, 'app.js 测试出口未建立');

// 1—4：基本契约与实际生成结果。
const poem5 = api.buildPoem('清欢', api.CIPAI_5, { themeId: 'songfeng', mood: '清欢', rerollIndex: 0, author: '无名客', createdAt: 'fixture' });
const poem7 = api.buildPoem('远行', api.CIPAI_7, { themeId: 'guyu', mood: '远行', rerollIndex: 0, author: '无名客', createdAt: 'fixture' });
assert(poem5.lines.length === 4 && poem7.lines.length === 4, '诗签必须始终为四句');
assert(poem5.lines.every(line => Array.from(line).length === 5), '五言诗签存在非五字诗句');
assert(poem7.lines.every(line => Array.from(line).length === 7), '七言诗签存在非七字诗句');
assert(api.validatePoem(poem5) && api.validatePoem(poem7), '生成结果未通过严格校验');

// 5—8：同韵、去重、确定性与换签。
assert(poem7.rhymeGroup && poem7.rhymeGroup === api.buildPoem('远行', api.CIPAI_7, { themeId: 'guyu', mood: '远行', rerollIndex: 0, createdAt: 'fixture' }).rhymeGroup, '第二句与第四句韵组不稳定');
assert(new Set(poem7.lines).size === 4, '单首诗签出现重复完整诗句');
const sameA = api.buildPoem('暮雪', api.CIPAI_7, { themeId: 'qingniao', mood: '思念', rerollIndex: 4, createdAt: 'fixture' });
const sameB = api.buildPoem('暮雪', api.CIPAI_7, { themeId: 'qingniao', mood: '思念', rerollIndex: 4, createdAt: 'fixture' });
assert(sameA.seed === sameB.seed && sameA.title === sameB.title && sameA.lines.join('|') === sameB.lines.join('|'), '相同参数没有得到相同 seed 结果');
const rerolled = api.buildPoem('暮雪', api.CIPAI_7, { themeId: 'qingniao', mood: '思念', rerollIndex: 5, createdAt: 'fixture' });
assert(rerolled.seed !== sameA.seed && rerolled.lines.join('|') !== sameA.lines.join('|'), '换签没有改变确定性 seed 或诗句');

// 9：连续 100 次换签，完整诗句不得重复。
const poemKeys = new Set();
for (let i = 0; i < 100; i += 1) {
  const poem = api.buildPoem('清欢', api.CIPAI_7, { themeId: 'songfeng', mood: '清欢', rerollIndex: i, createdAt: 'fixture' });
  const key = poem.lines.join('|');
  assert(api.validatePoem(poem), '第 ' + (i + 1) + ' 首诗签未通过校验');
  assert(!poemKeys.has(key), '连续 100 首诗签出现重复完整诗句');
  poemKeys.add(key);
}

// 10—11：输入净化与 DOM textContent 路径。
const malicious = api.buildPoem('<img src=x onerror=alert(1)>清欢', api.CIPAI_7, { themeId: 'songfeng', mood: '清欢', createdAt: 'fixture' });
assert(!malicious.title.includes('<') && !malicious.title.includes('>') && !malicious.keyword.includes('<'), '恶意输入未被净化');
api.renderPoem({ lines: ['<script>', '清风入梦来', '松影伴清秋', '照远山入星'] });
assert(elements.get('poem').innerHTML === '' && elements.get('poem').children[0].textContent.includes('<script>'), '诗句渲染未使用安全 textContent');
assert(api.escapeHtml('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;', 'HTML 转义函数契约失效');

// 12—13：高清 Canvas 尺寸与竖排方向。
canvasCalls.length = 0;
api.renderSeal(canvas, poem7, { author: '无名客', date: '2026年8月29日', paletteId: 'indigo' });
assert(canvas.width === 1200 && canvas.height === 1600, 'Canvas 必须输出 1200×1600');
assert(canvas.__lastRenderMeta && canvas.__lastRenderMeta.lineXs[0] > canvas.__lastRenderMeta.lineXs[3], '第一句未位于最右列');
assert(canvasCalls.some(call => call.name === 'scale' && call.args[0] === 2 && call.args[1] === 2), 'Canvas DPR2 缩放缺失');

// 14—17：分享文案、主题数据、历史上限与邀请 hash。
const note = api.buildNote(poem7, { author: '无名客' });
for (const tag of ['#国风vibecoding', '#小红书vibecoding大赛', '#vibeart', '#vibecoding', '#小红书小工具', '#国风诗签', '@科技薯']) {
  assert(note.includes(tag), '分享文案缺少 ' + tag);
}
assert(!note.includes('#AI写诗') && !note.includes('#vibecoding里的国风世界') && !note.includes('#vibecoding大赛'), '分享文案仍含旧标签');
assert(api.THEMES.length === 4 && api.THEMES.every(theme => theme.scenes && theme.motions && theme.feelings && theme.turns && theme.endings && theme.rhymeGroups && 'sourceTitle' in theme && 'sourceUrl' in theme), '四类文化意象数据结构不完整');
for (let i = 0; i < 15; i += 1) api.saveHistory(api.buildPoem('第' + i, api.CIPAI_5, { themeId: 'yadan', rerollIndex: i, createdAt: 'fixture' }));
assert(api.readHistory().length === 12 && api.HISTORY_LIMIT === 12, '最近历史没有限制为 12 条');
const challenge = api.encodeChallenge(Object.assign({}, poem7, { author: '张三' }));
const restored = api.parseChallengeHash(challenge);
assert(!challenge.includes('张三') && restored && !Object.prototype.hasOwnProperty.call(restored, 'author'), '挑战链接泄露落款或无法恢复');

// 18—24：生产清理、资源约束、视觉与脚本契约。
for (const id of requiredIds) assert(html.includes('id="' + id + '"'), 'HTML 缺少 ID：' + id);
assert(!/gemini/i.test(html) && !/<script[^>]+gemini\.js/i.test(html), '生产 HTML 仍包含 Gemini 面板或脚本');
assert(!/https?:\/\//i.test(html + css + appSource) && !/@import\b/i.test(css), '生产前端包含外部资源');
assert(!/\b(fetch|XMLHttpRequest)\s*\(/.test(appSource) && !/Math\.random\s*\(/.test(appSource), '生产 app.js 存在网络调用或非确定性随机');
assert(css.includes('--ink-900: #1a140e') && css.includes('--paper-100: #fbf7ee') && css.includes('--cinnabar: #a6341b') && css.includes('--gold: #9e7532') && css.includes('--bamboo: #526b53') && css.includes('--indigo: #26384a'), '视觉 token 不完整');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), '缺少 reduced-motion 适配');
assert(html.includes('width="1200" height="1600"') && css.includes('aspect-ratio: 3 / 4'), '3:4 画布契约不完整');
assert(fs.existsSync(path.join(root, 'scripts', 'package-xhs.ps1')), '缺少生产打包脚本');

console.log('SELF_CHECK_OK: ' + passed + ' 项检查通过（诗句、韵组、seed、去重、安全渲染、Canvas、分享、历史、挑战链接、生产清理）');
