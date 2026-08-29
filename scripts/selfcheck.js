// 前端自检：在轻量 DOM/Canvas 桩中运行 app.js 的真实生成逻辑。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'app.js');
const appSource = fs.readFileSync(appPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const ids = [
  'mood', 'cipai', 'go', 'download', 'copyNote', 'note', 'studioName',
  'poem', 'seal', 'openGemini', 'gmKey', 'gmModel', 'gmTemp', 'gmExtra',
  'gmRun', 'gmApply', 'gmCopy', 'gmOut', 'closeGemini', 'geminiModal'
];

const elements = new Map();
function makeElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    value: id === 'cipai' ? '7' : '',
    textContent: '',
    innerHTML: '',
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
    },
    addEventListener() {},
    setAttribute() {},
    getAttribute() { return null; },
    select() {},
    focus() {},
    click() {},
    remove() {}
  };
}

for (const id of ids) elements.set(id, makeElement(id));

const canvasCalls = [];
const canvasContext = {
  scale(...args) { canvasCalls.push({ name: 'scale', args }); },
  createLinearGradient() { return { addColorStop() {} }; },
  fillRect() {},
  strokeRect() {},
  beginPath() {},
  arc() {},
  ellipse() {},
  fill() {},
  fillText() {}
};
const canvas = elements.get('seal');
canvas.width = 520;
canvas.height = 720;
canvas.getContext = () => canvasContext;
canvas.toDataURL = () => 'data:image/png;base64,fixture';

const document = {
  querySelector(selector) {
    return selector.startsWith('#') ? elements.get(selector.slice(1)) || null : null;
  },
  createElement(tag) {
    const el = makeElement('', tag);
    if (tag === 'a') el.click = () => {};
    return el;
  },
  addEventListener() {},
  execCommand() { return true; },
  styleSheets: []
};

const context = {
  console,
  document,
  navigator: {},
  setTimeout,
  clearTimeout,
  Math,
  Date,
  String,
  Array,
  Object,
  RegExp,
  globalThis: null
};
context.globalThis = context;
context.window = context;

// 只在自检副本中注入测试出口，生产页面不会暴露内部函数。
const instrumented = appSource.replace(
  /\n\}\)\(\);\s*$/,
  '\n  globalThis.__GFV_TEST_API__ = { buildPoem, buildNote, renderSeal, escapeHtml, CIPAI_5, CIPAI_7 };\n})();\n'
);
assert(instrumented !== appSource, '未找到 app.js 测试注入点');
vm.runInNewContext(instrumented, context, { filename: appPath });

const api = context.__GFV_TEST_API__;
assert(api, 'app.js 测试出口未建立');

const poem5 = api.buildPoem('月', api.CIPAI_5);
const poem7 = api.buildPoem('花', api.CIPAI_7);
assert(poem5.lines.length === 4, '五言绝句必须为四句');
assert(poem7.lines.length === 4, '七言绝句必须为四句');
assert(poem5.lines.every(line => Array.from(line).length === 5), '五言诗句字数不为五');
assert(poem7.lines.every(line => Array.from(line).length === 7), '七言诗句字数不为七');

for (const mood of ['月', '风', '雪', '酒', '花', '山', '夜', '春', '琴']) {
  const p = api.buildPoem(mood, api.CIPAI_7);
  assert(p.lines.length === 4 && p.lines.every(line => Array.from(line).length === 7), '意象「' + mood + '」生成结果异常');
}

assert(api.escapeHtml('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;', 'HTML 转义保护失效');
const note = api.buildNote(poem7, { studioName: '墨溪山人', date: '甲辰年' });
assert(note.includes('#vibecoding') && note.includes(poem7.lines[0]), '小红书文案契约失效');

api.renderSeal(canvas, poem7, { studioName: '墨溪山人', date: '甲辰年' });
assert(canvas.width === 1040 && canvas.height === 1440, 'Canvas 未按 2x 高清绘制');
assert(canvasCalls.some(call => call.name === 'scale' && call.args[0] === 2 && call.args[1] === 2), 'Canvas DPR 缩放缺失');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const gemini = fs.readFileSync(path.join(root, 'gemini.js'), 'utf8');
for (const id of ids) assert(html.includes('id="' + id + '"'), 'HTML 缺少 ID：' + id);
assert(css.includes('@media (prefers-reduced-motion: reduce)'), '缺少减弱动效适配');
assert(gemini.includes("fetchText('./app.js', 'js')"), 'Gemini 源码读取保护缺失');
assert(gemini.includes("s2.src = './gemini.js?gfv_reload='"), '就地应用后 Gemini 控制器未重载');

console.log('SELF_CHECK_OK: 4句绝句、5/7字数、XSS转义、2x Canvas、DOM契约与Gemini重载均通过');
