/* =========================================================
 *  Gemini 优化前端（gemini.js）
 *  直连 Google Generative Language API（REST），无需后端
  *  - API Key 仅存 localStorage，并直接发送至用户选择的 Gemini API 端点
 *  - 支持本地 file:// 协议降级提取当前页面样式
 *  - 完善全键盘无障碍（Focus Trap / ESC 关闭）
 * ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'gfv_gemini_key';

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

  let lastFocusedElement = null;

  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 2200);
  }

  // 打开弹层 + 焦点捕获
  function open() {
    lastFocusedElement = document.activeElement;
    gm.key.value = localStorage.getItem(STORAGE_KEY) || '';
    gm.modal.classList.remove('hidden');
    setTimeout(() => gm.key.focus(), 60);
  }

  function close() {
    gm.modal.classList.add('hidden');
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  gm.openBtn && gm.openBtn.addEventListener('click', open);
  gm.closeBtn && gm.closeBtn.addEventListener('click', close);
  gm.modal && gm.modal.addEventListener('click', (e) => {
    if (e.target === gm.modal) close();
  });

  // ESC 键关闭 + Modal Focus Trap
  document.addEventListener('keydown', (e) => {
    if (gm.modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = gm.modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  // 抓取当前页面源码。file:// 下浏览器通常只允许读取已加载的 CSS，
  // 因此 CSS 有规则表兜底，JS 则给出明确提示，避免把 CSS 当成 JS 发给模型。
  async function fetchText(url, kind) {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error('status ' + r.status);
      return await r.text();
    } catch (e) {
      if (kind === 'css') {
        // 离线/file 协议降级：从已加载的样式表提取 CSS 规则。
        let cssRulesText = '';
        try {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                cssRulesText += rule.cssText + '\n';
              }
            } catch (ruleErr) {}
          }
        } catch (sheetErr) {}
        if (cssRulesText) return cssRulesText;
      }
      throw new Error(
        '读取 ' + url + ' 失败。请通过本地静态服务器打开页面后重试（例如 http://localhost:5173）。'
      );
    }
  }

  async function gather() {
    const [css, js] = await Promise.all([
      fetchText('./styles.css', 'css'),
      fetchText('./app.js', 'js')
    ]);
    const html = '<!doctype html>\n' + document.documentElement.outerHTML;
    return { 'index.html': html, 'styles.css': css, 'app.js': js };
  }

  function buildPrompt(files, userExtra) {
    return '你是资深前端工程师与国风视觉设计师。请基于以下三份文件，进行"仅 UI / 动效 / 可读性 / 国风排版"的高阶优化。\n' +
      '【绝对必须保留的契约】\n' +
      '1. 必须保留所有 DOM ID：mood, cipai, go, download, copyNote, note, studioName, poem, seal, openGemini, gmKey, gmModel, gmTemp, gmExtra, gmRun, gmApply, gmCopy, gmOut, closeGemini, geminiModal\n' +
      '2. 绝句逻辑必须严格保持 4 句（起承转合），五言20字，七言28字；竖排诗签自右向左；Canvas 2x 高清\n' +
      '3. 零外部 npm 依赖，零外部网络字体/图片，完全纯前端离线可用\n\n' +
      '【用户额外诉求】\n' + (userExtra || '无') + '\n\n' +
      '请仅返回严格 JSON，格式为 {"index.html":"...","styles.css":"...","app.js":"..."}，不要输出任何 Markdown 围栏或额外文字：\n\n' +
      '--- index.html ---\n' + files['index.html'] + '\n\n' +
      '--- styles.css ---\n' + files['styles.css'] + '\n\n' +
      '--- app.js ---\n' + files['app.js'];
  }

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
      throw new Error('Gemini HTTP ' + r.status + ': ' + t.slice(0, 300));
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
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

  function applyToPage(files) {
    let injected = document.getElementById('__gfv_injected');
    if (!injected) {
      injected = document.createElement('style');
      injected.id = '__gfv_injected';
      document.head.appendChild(injected);
    }
    injected.textContent = files['styles.css'];

    const parser = new DOMParser();
    const doc = parser.parseFromString(files['index.html'], 'text/html');
    const newBody = doc.body;
    if (!newBody) throw new Error('新 HTML 缺少 <body>');

    const scripts = Array.from(newBody.querySelectorAll('script'));
    scripts.forEach(s => s.remove());

    document.body.innerHTML = newBody.innerHTML;

    const s1 = document.createElement('script');
    s1.textContent = files['app.js'];
    document.body.appendChild(s1);

    // body 替换会移除旧的 Gemini 事件监听；重新加载控制器，让新 DOM
    // 继续支持打开弹层、再次优化和键盘无障碍操作。
    const s2 = document.createElement('script');
    s2.src = './gemini.js?gfv_reload=' + Date.now();
    document.body.appendChild(s2);

    showToast('✅ 已就地应用新版国风 UI');
  }

  async function copyResult(files) {
    const text = '/* index.html */\n' + files['index.html'] +
      '\n\n/* styles.css */\n' + files['styles.css'] +
      '\n\n/* app.js */\n' + files['app.js'] + '\n';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('clipboard unavailable');
      }
      showToast('📋 完整代码已复制到剪贴板');
      gm.copy.textContent = '✅ 已复制';
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        if (!document.execCommand('copy')) throw e;
        showToast('📋 完整代码已复制到剪贴板');
        gm.copy.textContent = '✅ 已复制';
      } finally {
        ta.remove();
      }
    }
    setTimeout(() => (gm.copy.textContent = '📋 复制结果代码'), 1500);
  }

  gm.run && gm.run.addEventListener('click', async () => {
    const apiKey = (gm.key.value || '').trim();
    if (!apiKey) {
      showToast('⚠️ 请先填入 Gemini API Key');
      gm.key.focus();
      return;
    }
    localStorage.setItem(STORAGE_KEY, apiKey);

    const model = gm.model.value;
    const temperature = parseFloat(gm.temp.value || '0.4');
    const userExtra = (gm.extra.value || '').trim();

    gm.run.disabled = true;
    gm.run.textContent = '🌀 正在挥毫调优…';
    gm.out.value = '';
    gm.apply.disabled = true;
    gm.copy.disabled = true;

    try {
      const files = await gather();
      const prompt = buildPrompt(files, userExtra);
      const text = await callGemini(apiKey, model, temperature, prompt);
      const obj = parseJsonLoose(text);
      localStorage.setItem('gfv_last_gemini', JSON.stringify(obj));
      gm.out.value = JSON.stringify(obj, null, 2);
      gm.apply.disabled = false;
      gm.copy.disabled = false;
      showToast('✨ Gemini 优化完毕！可点击应用或复制');
    } catch (e) {
      gm.out.value = '❌ 优化失败：' + e.message;
      showToast('❌ 请求出错：' + e.message);
    } finally {
      gm.run.disabled = false;
      gm.run.textContent = '🚀 开始优化';
    }
  });

  gm.apply && gm.apply.addEventListener('click', () => {
    const raw = localStorage.getItem('gfv_last_gemini');
    if (!raw) return;
    try {
      applyToPage(JSON.parse(raw));
    } catch (e) {
      showToast('解析失败：' + e.message);
    }
  });

  gm.copy && gm.copy.addEventListener('click', () => {
    const raw = localStorage.getItem('gfv_last_gemini');
    if (!raw) return;
    try {
      copyResult(JSON.parse(raw));
    } catch (e) {
      showToast('复制出错：' + e.message);
    }
  });
})();
