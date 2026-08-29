/* =========================================================
 *  Gemini 优化前端（gemini.js）
 *  直连 Google Generative Language API（REST），无需后端
 *  - API Key 只存 localStorage，不外发
 *  - 输入：当前 index.html / styles.css / app.js 文本 + 用户附加要求
 *  - 输出：JSON { "index.html": "...", "styles.css": "...", "app.js": "..." }
 *  - 一键"应用到当前页面"：把 <head>/<body>、<style>、gemini 重写后的脚本就地替换
 * ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'gfv_gemini_key';

  // ---- DOM ----
  const $ = (s) => document.querySelector(s);
  const gm = {
    openBtn: $('#openGemini'),
    closeBtn: $('#closeGemini'),
    modal: $('#geminiModal'),
    key: $('#gmKey'),
    model: $('#gmModel'),
    temp: $('#gmTemp'),
    extra: $('#gmExtra'),
    run: $('#gmRun'),
    apply: $('#gmApply'),
    copy: $('#gmCopy'),
    out: $('#gmOut')
  };

  // ---- 打开 / 关闭 ----
  function open() {
    gm.key.value = localStorage.getItem(STORAGE_KEY) || '';
    gm.modal.classList.remove('hidden');
    setTimeout(() => gm.key.focus(), 50);
  }
  function close() { gm.modal.classList.add('hidden'); }

  gm.openBtn && gm.openBtn.addEventListener('click', open);
  gm.closeBtn && gm.closeBtn.addEventListener('click', close);
  gm.modal && gm.modal.addEventListener('click', (e) => {
    if (e.target === gm.modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !gm.modal.classList.contains('hidden')) close();
  });

  // ---- 取当前三份文件文本 ----
  // HTML 取当前 DOM（保留 <head> 内已加载的 css/js 引用）
  // CSS / JS 直接 fetch（同源静态资源）
  async function fetchText(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error('fetch ' + url + ' -> ' + r.status);
    return await r.text();
  }
  async function gather() {
    const [css, js] = await Promise.all([
      fetchText('./styles.css'),
      fetchText('./app.js')
    ]);
    const html = '<!doctype html>\n' + document.documentElement.outerHTML;
    return { 'index.html': html, 'styles.css': css, 'app.js': js };
  }

  // ---- 构造 prompt ----
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
      '{"index.html": "<完整 html 字符串>", "styles.css": "<完整 css 字符串>", "app.js": "<完整 js 字符串>}\n\n' +
      '（占位说明：用户附加要求为 ' + (userExtra || '无') + '）\n\n' +
      '--- index.html ---\n' + files['index.html'] + '\n\n' +
      '--- styles.css ---\n' + files['styles.css'] + '\n\n' +
      '--- app.js ---\n' + files['app.js'] + '\n';
    return head;
  }

  // ---- 调 Gemini ----
  async function callGemini(apiKey, model, temperature, prompt) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(apiKey);
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: temperature, responseMimeType: 'application/json' }
    };
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error('Gemini HTTP ' + r.status + ': ' + t.slice(0, 400));
    }
    const data = await r.json();
    const text = data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!text) throw new Error('Gemini 返回为空：' + JSON.stringify(data).slice(0, 300));
    return text;
  }

  // ---- 解析 JSON（容忍 ```json 围栏） ----
  function parseJsonLoose(s) {
    let t = s.trim();
    if (t.startsWith('```')) {
      t = t.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '');
    }
    return JSON.parse(t);
  }

  // ---- "应用到当前页面" ----
  // 由于浏览器无法写回磁盘，只把内容"就地替换"到 <head>/<body>。
  function applyToPage(files) {
    // 1) 替换/新建 <style id="__gfv_injected">
    let injected = document.getElementById('__gfv_injected');
    if (!injected) {
      injected = document.createElement('style');
      injected.id = '__gfv_injected';
      document.head.appendChild(injected);
    }
    injected.textContent = files['styles.css'];

    // 2) 替换页面 body 内的"用户可见部分"（保留 <script>）
    //    解析新的 index.html，提取 <body> 子树；保留现有 <script src="app.js">。
    const parser = new DOMParser();
    const doc = parser.parseFromString(files['index.html'], 'text/html');
    const newBody = doc.body;
    if (!newBody) throw new Error('新 HTML 缺少 <body>');

    // 抽离 inline <script>，统一加到 body 末尾
    const scripts = Array.from(newBody.querySelectorAll('script'));
    scripts.forEach(s => s.remove());

    // 替换 body 内容
    document.body.innerHTML = newBody.innerHTML;

    // 注入新脚本
    const s1 = document.createElement('script');
    s1.textContent = files['app.js'];
    document.body.appendChild(s1);

    // 提示用户：页面已替换。如要落盘，去 docs/NEW_* 复制。
    console.log('[Gemini] 已就地应用。CSS 在 <style#__gfv_injected>，app.js 通过 inline 注入。');
  }

  // ---- 复制结果 ----
  async function copyResult(files) {
    const text = '/* index.html */\n' + files['index.html'] +
      '\n\n/* styles.css */\n' + files['styles.css'] +
      '\n\n/* app.js */\n' + files['app.js'] + '\n';
    try {
      await navigator.clipboard.writeText(text);
      gm.copy.textContent = '✅ 已复制';
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      gm.copy.textContent = '✅ 已复制';
    }
    setTimeout(() => (gm.copy.textContent = '📋 复制结果'), 1500);
  }

  // ---- 启动 ----
  gm.run && gm.run.addEventListener('click', async () => {
    const apiKey = (gm.key.value || '').trim();
    if (!apiKey) { alert('请先填入 Gemini API Key'); gm.key.focus(); return; }
    localStorage.setItem(STORAGE_KEY, apiKey);

    const model = gm.model.value;
    const temperature = parseFloat(gm.temp.value || '0.4');
    const userExtra = (gm.extra.value || '').trim();

    gm.run.disabled = true;
    gm.run.textContent = '🌀 调用中…';
    gm.out.value = '';
    gm.apply.disabled = true;
    gm.copy.disabled = true;

    try {
      const files = await gather();
      const prompt = buildPrompt(files, userExtra);
      const text = await callGemini(apiKey, model, temperature, prompt);
      const obj = parseJsonLoose(text);
      // 落盘到 localStorage 供"应用"使用
      localStorage.setItem('gfv_last_gemini', JSON.stringify(obj));
      gm.out.value = JSON.stringify(obj, null, 2).slice(0, 8000) +
        (JSON.stringify(obj).length > 8000 ? '\n…(已截断显示，完整版已存入 localStorage.gfv_last_gemini)' : '');
      gm.apply.disabled = false;
      gm.copy.disabled = false;
      gm.run.textContent = '✅ 完成';
      setTimeout(() => (gm.run.textContent = '🚀 开始优化'), 1500);
    } catch (e) {
      gm.out.value = '❌ ' + e.message;
      gm.run.textContent = '🚀 开始优化';
    } finally {
      gm.run.disabled = false;
    }
  });

  gm.apply && gm.apply.addEventListener('click', () => {
    const raw = localStorage.getItem('gfv_last_gemini');
    if (!raw) { alert('还没有 Gemini 结果'); return; }
    try {
      const obj = JSON.parse(raw);
      if (!confirm('将用 Gemini 的版本替换当前页面（仅 DOM/样式/脚本，不写回磁盘）。继续？')) return;
      applyToPage(obj);
    } catch (e) {
      alert('解析失败：' + e.message);
    }
  });

  gm.copy && gm.copy.addEventListener('click', () => {
    const raw = localStorage.getItem('gfv_last_gemini');
    if (!raw) { alert('还没有 Gemini 结果'); return; }
    try { copyResult(JSON.parse(raw)); } catch (e) { alert('解析失败：' + e.message); }
  });
})();
