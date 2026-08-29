#!/usr/bin/env node
/* scripts/gemini_rewrite.js
 *
 * 一键调 Gemini，把 index.html / styles.css / app.js 重写为 v2（仅 UI/动效/可读性优化）。
 * 用法：
 *   1) 设置环境变量  GEMINI_API_KEY=AIza...
 *      （可选） GEMINI_MODEL=gemini-2.5-flash     默认 gemini-2.5-flash
 *      （可选） GEMINI_TEMP=0.4                    默认 0.4
 *      （可选） GEMINI_EXTRA="按钮加水墨涟漪"       额外要求
 *   2) node scripts/gemini_rewrite.js
 *   3) 完成后：浏览器刷新 index.html 即可看到 v2；不满意可 git checkout 还原。
 *
 * 不依赖任何 npm 包（用 Node 18+ 自带 fetch）。
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const TEMP = parseFloat(process.env.GEMINI_TEMP || '0.4');
const EXTRA = process.env.GEMINI_EXTRA || '无';

if (!API_KEY) {
  console.error('❌ 缺少 GEMINI_API_KEY。\n示例（PowerShell）： $env:GEMINI_API_KEY="AIza..." ; node scripts/gemini_rewrite.js');
  process.exit(1);
}

function buildPrompt(files) {
  return [
    '你是资深前端工程师 + 国风视觉设计师。请基于以下三份文件，做"仅 UI / 动效 / 可读性 / 排版"的优化，**绝对不要修改以下行为契约**：',
    '1) DOM 元素 id 必须保留：mood / cipai / go / download / copyNote / note / studioName / poem / seal / openGemini / gmKey / gmModel / gmTemp / gmExtra / gmRun / gmApply / gmCopy / gmOut / closeGemini / geminiModal',
    '2) JS 暴露的全局行为函数（renderSeal / buildPoem / buildNote / makeStudioName）调用方式不变',
    '3) Canvas 绘制诗签的整体尺寸/排版方向（竖排、词牌名位置、落款位置、朱印位置）保持，仅允许微调',
    '4) 不引入网络资源（CDN / Google Font / 图片外链），离线可用',
    '5) 不引入 npm 依赖；gemini.js 仍需保留以支持浏览器内再次优化',
    '',
    '允许的改动：',
    '- 配色 / 字体 / 圆角 / 阴影 / 间距 / 排版层级',
    '- hover / focus / 出现动画（建议用 @keyframes，少用 JS）',
    '- 移动端断点（< 880px）排版更紧凑',
    '- 给关键按钮加上水墨 / 笔触 / 涟漪等"国风"动效',
    '- 给诗签预览 canvas 加柔和的入场动画',
    '',
    '输出要求：**只返回 JSON**，严格符合下面 schema，不要任何解释 / Markdown 代码块：',
    '{"index.html": "<完整 html 字符串>", "styles.css": "<完整 css 字符串>", "app.js": "<完整 js 字符串>"}',
    '',
    '（用户附加要求：' + EXTRA + '）',
    '',
    '--- index.html ---',
    files['index.html'],
    '',
    '--- styles.css ---',
    files['styles.css'],
    '',
    '--- app.js ---',
    files['app.js']
  ].join('\n');
}

async function callGemini(prompt) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(MODEL) + ':generateContent?key=' + encodeURIComponent(API_KEY);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: TEMP, responseMimeType: 'application/json' }
    })
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('Gemini HTTP ' + r.status + ': ' + t.slice(0, 400));
  }
  const data = await r.json();
  const text = data && data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('Gemini 返回为空');
  return text;
}

function parseJsonLoose(s) {
  let t = s.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(t);
}

function backup(file) {
  const bak = file + '.bak';
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function main() {
  const files = {
    'index.html': fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
    'styles.css': fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8'),
    'app.js':     fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')
  };

  // 体积保护：每个文件超过 ~28KB 截断
  Object.keys(files).forEach(k => {
    if (files[k].length > 28000) {
      console.warn('⚠️ ' + k + ' 较长 (' + files[k].length + ' chars)，已截断到 28KB');
      files[k] = files[k].slice(0, 28000) + '\n/* … truncated for prompt */';
    }
  });

  const prompt = buildPrompt(files);
  console.log('▶ 调用 Gemini 模型:', MODEL, '温度:', TEMP, '附加:', EXTRA);
  console.log('  prompt 长度:', prompt.length, 'chars');

  return callGemini(prompt)
    .then(text => {
      const obj = parseJsonLoose(text);
      ['index.html', 'styles.css', 'app.js'].forEach(k => {
        if (typeof obj[k] !== 'string') {
          throw new Error('返回 JSON 缺少字段 ' + k);
        }
        const p = path.join(ROOT, k);
        backup(p);
        fs.writeFileSync(p, obj[k], 'utf8');
        console.log('✅ 已写入', k, '(' + obj[k].length + ' chars)');
      });
      console.log('\n🎉 全部完成。刷新 index.html 即可看到 v2。');
      console.log('   不满意？已自动备份为 *.bak，git checkout 即可还原。');
    });
}

main().catch(e => { console.error('❌', e.message); process.exit(2); });
