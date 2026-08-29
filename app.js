/* =========================================================
   国风诗签 · Vibecoding Studio
   纯前端、零依赖（用系统字体 + Canvas 出图）
   同时打两个小红书赛事：
   1) vibecoding 里的国风世界
   2) 薯和大... (vibecoding 大赛)
   ========================================================= */

(function () {
  'use strict';

  // -------------------- 词牌（格律 + 意象库） --------------------
  const CIPAI_5 = {
    name: '五言绝句·仄起',
    moods: {
      '月': '揽月', '风': '听风', '花': '拾花', '雪': '踏雪', '酒': '醉酒',
      '山': '入山', '水': '临水', '云': '卧云', '梦': '寻梦', '古': '访古',
      '夜': '夜游', '春': '迎春', '秋': '寻秋', '江': '渡江', '星': '摘星'
    }
  };
  const CIPAI_7 = { name: '七言绝句·平起', moods: CIPAI_5.moods };

  // 模板（按"首字意象"分组）
  const TEMPLATES = {
    '月': ['举头', '对酌', '独坐', '推窗', '倚楼', '霜满', '灯残', '风定'],
    '风': ['一夜', '半山', '隔岸', '满袖', '入帘', '倚杖', '听松', '沾衣'],
    '花': ['一树', '半窗', '满径', '隔墙', '折枝', '沾袖', '倚栏', '照水'],
    '雪': ['一夜', '满山', '孤灯', '寒江', '空庭', '隔窗', '压枝', '落瓦'],
    '酒': ['一壶', '半盏', '三杯', '残灯', '对月', '临风', '听雨', '入喉'],
    '山': ['万重', '半壁', '落日', '归云', '横空', '入梦', '隔水', '千峰'],
    '水': ['一湾', '半江', '落花', '东流', '西风', '渔火', '白蘋', '苍烟'],
    '云': ['出岫', '归山', '半岭', '卷舒', '无心', '出涧', '停舟', '入怀'],
    '梦': ['一枕', '半生', '故园', '前尘', '远山', '旧游', '残灯', '落花'],
    '古': ['千年', '一片', '半壁', '残碑', '斜阳', '空山', '旧巷', '寒烟'],
    '夜': ['一窗', '半庭', '孤灯', '寒更', '落月', '残星', '短梦', '远钟'],
    '春': ['一帘', '半城', '满园', '隔墙', '归燕', '细雨', '轻寒', '花信'],
    '秋': ['一庭', '半窗', '满阶', '西风', '落木', '寒蝉', '凉月', '孤灯'],
    '江': ['万里', '半帆', '落日', '渔歌', '远天', '暮云', '斜月', '秋声'],
    '星': ['一川', '满天', '半枕', '垂钓', '入怀', '隔水', '远山', '孤灯']
  };

  const ENDINGS = [
    '入梦来', '落花中', '满空山', '照影寒', '送远天', '入云端', '起微澜', '入幽怀',
    '映残霞', '过前川', '入松风', '满人间', '下寒塘', '在渔樵', '对斜阳', '倚危栏',
    '一灯青', '半窗明', '两无声', '三更生'
  ];

  // -------------------- 工具 --------------------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function detectMood(text) {
    for (const k of Object.keys(CIPAI_7.moods)) {
      if (text && text.indexOf(k) >= 0) return k;
    }
    return pick(Object.keys(CIPAI_7.moods));
  }
  function buildLine(mood) {
    const head = pick(TEMPLATES[mood] || TEMPLATES['月']);
    const tail = pick(ENDINGS);
    return head + ' ' + tail;
  }
  function buildPoem(text, cipai) {
    const mood = detectMood(text);
    const lines = [];
    const n = cipai === CIPAI_7 ? 7 : 5;
    for (let i = 0; i < n; i++) lines.push(buildLine(mood));
    if (text && text.trim()) {
      const t = text.trim().slice(0, 2);
      lines[0] = t + lines[0].slice(Math.min(2, lines[0].length));
    }
    return { mood, lines, cipaiName: cipai.name };
  }
  function makeStudioName() {
    const s = pick(['云', '墨', '砚', '青', '素', '半', '清', '南', '微', '听', '拾', '入', '栖', '枕', '观']);
    const g = pick(['溪', '山人', '生', '庐', '野', '客', '斋', '堂', '主人', '翁', '散人', '山房']);
    return s + g;
  }

  // -------------------- 诗签图（Canvas） --------------------
  function renderSeal(canvas, poem, opts) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    // 宣纸底
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, '#f6ecd9');
    grd.addColorStop(1, '#e8d8b8');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    // 洒金
    ctx.fillStyle = 'rgba(170, 130, 60, 0.18)';
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 1.6;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // 双线边框
    ctx.strokeStyle = 'rgba(60, 40, 20, 0.55)';
    ctx.lineWidth = 4; ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.lineWidth = 1; ctx.strokeRect(28, 28, W - 56, H - 56);
    // 词牌
    ctx.fillStyle = '#3a2a18';
    ctx.font = '20px "STKaiti","KaiTi","楷体",serif';
    ctx.textAlign = 'center';
    ctx.fillText(poem.cipaiName, W / 2, 60);
    // 正文（竖排，每句 2 字 / 列）
    ctx.font = '32px "STKaiti","KaiTi","楷体",serif';
    const cellW = 42, startY = 110, gap = 14;
    poem.lines.forEach((line, li) => {
      const x = W / 2 - 90 + li * (cellW + gap);
      const chars = line.replace(/\s+/g, '').split('');
      chars.forEach((c, ci) => ctx.fillText(c, x, startY + ci * 40));
    });
    // 落款
    ctx.font = '16px "STKaiti","KaiTi","楷体",serif';
    ctx.textAlign = 'right';
    ctx.fillText(opts.studioName, W - 56, H - 80);
    ctx.font = '12px "STKaiti","KaiTi","楷体",serif';
    ctx.fillText(opts.date, W - 56, H - 60);
    // 朱印
    ctx.fillStyle = 'rgba(180, 30, 30, 0.9)';
    ctx.fillRect(W - 90, H - 56, 50, 36);
    ctx.strokeStyle = 'rgba(180, 30, 30, 0.9)';
    ctx.lineWidth = 2; ctx.strokeRect(W - 90, H - 56, 50, 36);
    ctx.fillStyle = '#fff5e6';
    ctx.font = 'bold 16px "STKaiti","KaiTi","楷体",serif';
    ctx.textAlign = 'center';
    ctx.fillText('诗', W - 65, H - 34);
    ctx.fillText('印', W - 65, H - 18);
  }

  // -------------------- 笔记文案 --------------------
  function buildNote(poem, opts) {
    const tags = [
      '#vibecoding', '#vibecoding大赛', '#国风', '#诗签', '#小红书国风季',
      '#中式美学', '#AI写诗', '#国风创作', '#文房四宝'
    ].join(' ');
    const lines = poem.lines.map(l => l.replace(/\s+/g, '')).join('，');
    return [
      '【' + poem.cipaiName + ' · ' + opts.studioName + '】',
      lines + '。',
      '',
      '用 vibe 写诗，用 code 出图。',
      '这个夏天，把心情交给国风，交给一张可下载的诗签。',
      '',
      '👇 输入你的心情，一键出签',
      tags
    ].join('\n');
  }

  // -------------------- DOM 绑定 --------------------
  const $ = (s) => document.querySelector(s);
  const els = {
    input: $('#mood'),
    cipai: $('#cipai'),
    go: $('#go'),
    poemBox: $('#poem'),
    noteBox: $('#note'),
    canvas: $('#seal'),
    dl: $('#download'),
    copy: $('#copyNote'),
    studioName: $('#studioName')
  };

  function todayCN() {
    const d = new Date();
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function run() {
    const cipai = els.cipai.value === '7' ? CIPAI_7 : CIPAI_5;
    const text = els.input.value || '';
    const poem = buildPoem(text, cipai);
    const studioName = makeStudioName();
    els.studioName.textContent = '落款：' + studioName;

    els.poemBox.innerHTML = poem.lines
      .map(l => '<div class="line">' + l.replace(/\s+/g, '') + '</div>').join('');

    const note = buildNote(poem, { studioName, date: todayCN() });
    els.noteBox.value = note;

    renderSeal(els.canvas, poem, { studioName, date: todayCN() });

    els.dl.onclick = () => {
      const a = document.createElement('a');
      a.href = els.canvas.toDataURL('image/png');
      a.download = '诗签-' + poem.mood + '-' + Date.now() + '.png';
      a.click();
    };
  }

  els.go.addEventListener('click', run);
  els.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  els.copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(els.noteBox.value);
      els.copy.textContent = '✅ 已复制';
    } catch (e) {
      els.noteBox.select();
      document.execCommand('copy');
      els.copy.textContent = '✅ 已复制';
    }
    setTimeout(() => (els.copy.textContent = '📋 复制笔记文案'), 1500);
  });

  // 首次进入自动出一次
  run();
})();
// --- Gemini 优化模块（追加在 app.js 末尾） ---
/* placeholder, real content added next step */
