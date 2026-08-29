// 离线烟雾测试：模拟 gemini.js 的关键纯函数
const fs = require('fs');
const path = require('path');

function buildPrompt(files, userExtra) {
  const head = '你是资深前端工程师 + 国风视觉设计师。请基于以下三份文件，做"仅 UI / 动效 / 可读性 / 排版"的优化，**绝对不要修改以下行为契约**：\n' +
    '1) DOM 元素 id 必须保留：mood / cipai / go / download / copyNote / note / studioName / poem / seal / openGemini / gmKey / gmModel / gmTemp / gmExtra / gmRun / gmApply / gmCopy / gmOut / closeGemini / geminiModal\n' +
    '2) JS 暴露的全局行为函数（renderSeal / buildPoem / buildNote / makeStudioName）调用方式不变\n' +
    '3) Canvas 绘制诗签的整体尺寸/排版方向（竖排、词牌名位置、落款位置、朱印位置）保持，仅允许微调\n' +
    '4) 不引入网络资源（CDN / Google Font / 图片外链），离线可用\n' +
    '5) 不引入 npm 依赖\n\n' +
    '允许的改动：\n' +
    '- 配色 / 字体 / 圆角 / 阴影 / 间距 / 排版层级\n' +
    '- hover / focus / 出现动画（建议用 @keyframes，少用 JS）\n' +
    '- 移动端断点（< 880px）排版更紧凑\n' +
    '- 给关键按钮加上水墨 / 笔触 / 涟漪等"国风"动效\n' +
    '- 给诗签预览 canvas 加柔和的入场动画\n\n' +
    '输出要求：**只返回 JSON**，严格符合下面 schema，不要任何解释 / Markdown 代码块：\n' +
    '{"index.html": "<完整 html 字符串>", "styles.css": "<完整 css 字符串>", "app.js": "<完整 js 字符串>"}\n\n' +
    '（占位说明：用户附加要求为 ' + (userExtra || '无') + '）\n\n' +
    '--- index.html ---\n' + files['index.html'] + '\n\n' +
    '--- styles.css ---\n' + files['styles.css'] + '\n\n' +
    '--- app.js ---\n' + files['app.js'] + '\n';
  return head;
}

function parseJsonLoose(s) {
  let t = s.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(t);
}

const files = {
  'index.html': fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'),
  'styles.css': fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8'),
  'app.js': fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8')
};

const prompt = buildPrompt(files, '水墨涟漪按钮');
console.log('PROMPT chars:', prompt.length);
console.log('Has 全部 id 提示:', /openGemini[\s\S]*gmOut/.test(prompt));

// 模拟 Gemini 围栏返回
const fake = '```json\n{"index.html":"<!doctype html><html></html>","styles.css":"/* x */","app.js":"// y"}\n```';
const obj = parseJsonLoose(fake);
console.log('parsed keys:', Object.keys(obj).join(','));
console.log('index.html startsWith doctype:', obj['index.html'].startsWith('<!doctype'));
