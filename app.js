/* =========================================================
   国风诗签 · Vibecoding Studio
   纯前端、零依赖（高分屏 Canvas + 正统 4 句绝句引擎）
   ========================================================= */

(function () {
  'use strict';

  // -------------------- 1. 正统绝句意象与格律库 (必为 4 句) --------------------
  const CIPAI_5 = {
    name: '五言绝句',
    subtitle: '五言绝句·四句凝练',
    lineLen: 5
  };

  const CIPAI_7 = {
    name: '七言绝句',
    subtitle: '七言绝句·起承转合',
    lineLen: 7
  };

  // 意象词库映射
  const MOOD_DICT = {
    '月': { theme: '揽月', heads5: ['举头', '霜华', '独酌', '倚楼', '推窗', '清辉'], mids: ['万里明', '千峰照', '孤光远', '寒波静'] },
    '风': { theme: '听风', heads5: ['竹影', '万籁', '江上', '入户', '拂袖', '归客'], mids: ['过短亭', '起微澜', '动客心', '度远山'] },
    '雪': { theme: '踏雪', heads5: ['一夜', '千山', '古道', '独立', '寒江', '踏遍'], mids: ['落万家', '覆苍苔', '入柴扉', '满庭幽'] },
    '酒': { theme: '煮酒', heads5: ['一盏', '对坐', '微醺', '浅酌', '把盏', '醉后'], mids: ['话前尘', '任平生', '入诗肠', '对斜阳'] },
    '花': { theme: '拾花', heads5: ['一树', '春深', '残红', '阶前', '香动', '倚栏'], mids: ['落旧溪', '满径幽', '点素衣', '伴晚烟'] },
    '山': { theme: '见山', heads5: ['千重', '行尽', '青峰', '卧石', '远岫', '宿鸟'], mids: ['隐翠微', '断紫烟', '度白云', '立苍茫'] },
    '夜': { theme: '听夜', heads5: ['一枕', '更深', '孤灯', '钟磬', '寒雨', '空庭'], mids: ['透碧纱', '客梦长', '滴漏迟', '掩松扉'] },
    '春': { theme: '逢春', heads5: ['柳绿', '东风', '归燕', '细雨', '芳草', '满城'], mids: ['绿江南', '入小池', '染画屏', '上柳梢'] },
    '琴': { theme: '抚琴', heads5: ['七弦', '素手', '幽怀', '曲罢', '松下', '高山'], mids: ['动商音', '寄流水', '引松风', '绝知音'] },
    '客': { theme: '寻客', heads5: ['扁舟', '天涯', '故里', '相逢', '长亭', '去路'], mids: ['万里遥', '一叶轻', '待月还', '系晚晴'] }
  };

  // 五言三字收束词库
  const TAILS_3 = [
    '入梦来', '满空山', '照影寒', '度云端', '起微澜', '在人间',
    '泛归舟', '伴客愁', '入画楼', '上翠微', '照素衣', '听暮钟'
  ];

  // 七言四字前缀（2+2）
  const HEADS_4 = [
    '平生诗思', '半枕松风', '万里江天', '千峰落日', '一蓑烟雨', '小窗幽梦',
    '竹坞清幽', '苍山隐隐', '寒更欲断', '古木清阴', '孤舟野渡', '一帘残月'
  ];

  // -------------------- 2. 工具与引擎 --------------------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function detectMood(text) {
    if (text) {
      for (const k of Object.keys(MOOD_DICT)) {
        if (text.indexOf(k) >= 0) return k;
      }
    }
    return pick(Object.keys(MOOD_DICT));
  }

  // 严格生成四句绝句（起、承、转、合）
  function buildPoem(text, cipai) {
    const moodKey = detectMood(text);
    const moodData = MOOD_DICT[moodKey] || MOOD_DICT['月'];
    const lines = [];
    const is7 = (cipai.lineLen === 7);

    for (let i = 0; i < 4; i++) {
      if (is7) {
        // 七言：4字前缀 + 3字尾句 = 7字
        const h4 = pick(HEADS_4);
        const t3 = pick(TAILS_3);
        lines.push(h4 + t3);
      } else {
        // 五言：2字前缀 + 3字尾句 = 5字
        const h2 = pick(moodData.heads5);
        const t3 = pick(TAILS_3);
        lines.push(h2 + t3);
      }
    }

    // 若用户输入了关键词，巧妙嵌入首句
    if (text && text.trim()) {
      const clean = text.trim().replace(/[^\u4e00-\u9fa5]/g, '').slice(0, is7 ? 4 : 2);
      if (clean.length > 0) {
        lines[0] = clean + lines[0].slice(clean.length);
      }
    }

    return { mood: moodKey, lines, cipaiName: cipai.name, subtitle: cipai.subtitle };
  }

  function makeStudioName() {
    const s = pick(['云', '墨', '砚', '青', '素', '半', '清', '南', '微', '听', '拾', '入', '栖', '枕', '观', '松']);
    const g = pick(['溪山人', '庐散客', '斋主人', '山房翁', '池逸士', '居漫士', '阁隐人', '泉隐翁']);
    return s + g;
  }

  function todayCN() {
    const d = new Date();
    const stems = '甲乙丙丁戊己庚辛壬癸';
    const branches = '子丑寅卯辰巳午未申酉戌亥';
    const year = d.getFullYear();
    const ganzhiYear = stems[(year - 4) % 10] + branches[(year - 4) % 12] + '年';
    return ganzhiYear + ' · ' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  // -------------------- 3. 高清 Canvas 竖排诗签绘制 (自右向左 RTL) --------------------
  function renderSeal(canvas, poem, opts) {
    const dpr = 2; // 固定 2x 高清绘制
    const W = 520, H = 720;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // 1. 宣纸底色与微粒
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, '#fbf6eb');
    grd.addColorStop(0.5, '#f4e9d0');
    grd.addColorStop(1, '#ebdcb8');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // 洒金笺质感金屑
    for (let i = 0; i < 110; i++) {
      ctx.fillStyle = 'rgba(165, 120, 45, ' + (0.05 + Math.random() * 0.15) + ')';
      const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 2.2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    // 2. 仿宋双线外框与回纹内框
    ctx.strokeStyle = 'rgba(65, 45, 25, 0.75)';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(160, 115, 45, 0.45)';
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // 3. 右上角「引首章」（椭圆朱印）
    const sealTopX = W - 56, sealTopY = 48;
    ctx.fillStyle = 'rgba(166, 52, 27, 0.88)';
    ctx.beginPath();
    ctx.ellipse(sealTopX, sealTopY, 11, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff7e8';
    ctx.font = 'bold 12px "STKaiti","KaiTi","楷体",serif';
    ctx.textAlign = 'center';
    ctx.fillText('清', sealTopX, sealTopY - 5);
    ctx.fillText('赏', sealTopX, sealTopY + 11);

    // 4. 词牌与题目（右侧偏上）
    ctx.fillStyle = '#6a4a25';
    ctx.font = '16px "STKaiti","KaiTi","楷体",serif';
    ctx.textAlign = 'center';
    ctx.fillText('【' + poem.cipaiName + '】', W / 2, 70);

    // 5. 核心诗文（正统中式竖排：从右往左排列 4 句）
    ctx.fillStyle = '#1c140d';
    ctx.font = '28px "STKaiti","KaiTi","楷体","Songti SC",serif';
    ctx.textAlign = 'center';

    const lineCount = 4;
    const colSpacing = poem.lines[0].length === 7 ? 46 : 52;
    const startY = poem.lines[0].length === 7 ? 120 : 155;
    const charGap = poem.lines[0].length === 7 ? 48 : 58;
    // 居中计算：自右向左
    const rightColX = (W / 2) + ((lineCount - 1) * colSpacing) / 2;

    poem.lines.forEach((line, li) => {
      const colX = rightColX - li * colSpacing; // li=0在最右，li=3在最左
      const chars = line.replace(/\s+/g, '').split('');
      chars.forEach((c, ci) => {
        ctx.fillText(c, colX, startY + ci * charGap);
      });
    });

    // 6. 左侧题跋落款与日期
    ctx.font = '15px "STKaiti","KaiTi","楷体",serif';
    ctx.fillStyle = '#4a341e';
    ctx.textAlign = 'left';

    // 左下方款识
    const signX = 46;
    ctx.fillText(opts.studioName + ' 题', signX, H - 90);
    ctx.font = '12px "STKaiti","KaiTi","楷体",serif';
    ctx.fillStyle = '#7a5a35';
    ctx.fillText(opts.date, signX, H - 70);

    // 7. 左下角「名号压角章」（方形阴阳印）
    const sealX = signX, sealY = H - 56;
    ctx.fillStyle = 'rgba(166, 52, 27, 0.92)';
    ctx.fillRect(sealX, sealY, 36, 36);
    ctx.strokeStyle = 'rgba(120, 20, 10, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sealX, sealY, 36, 36);

    ctx.fillStyle = '#fff8eb';
    ctx.font = 'bold 13px "STKaiti","KaiTi","楷体",serif';
    ctx.textAlign = 'center';
    ctx.fillText('墨', sealX + 11, sealY + 16);
    ctx.fillText('缘', sealX + 25, sealY + 16);
    ctx.fillText('诗', sealX + 11, sealY + 30);
    ctx.fillText('印', sealX + 25, sealY + 30);
  }

  // -------------------- 4. 小红书爆款文案生成 --------------------
  function buildNote(poem, opts) {
    const tags = [
      '#vibecoding', '#vibecoding大赛', '#vibecoding里的国风世界',
      '#中式美学', '#国风诗签', '#AI写诗', '#前端开发', '#国风壁纸'
    ].join(' ');

    const poemStr = poem.lines.join('。\n') + '。';

    return [
      '🏮「' + poem.cipaiName + ' · ' + opts.studioName + '」',
      '────────────',
      poemStr,
      '────────────',
      '✨ 用 Vibe 捕捉心绪，用 Code 挥毫入墨。',
      '纯前端零依赖，让代码渲染中式古典的浪漫。',
      '',
      '💬 评论区留下你的心情意象，为你定制专属诗签！',
      '',
      tags
    ].join('\n');
  }

  // -------------------- 5. DOM 绑定与交互 --------------------
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
    studioName: $('#studioName'),
    chips: $('#moodChips'),
    toast: $('#toast'),
    a11y: $('#a11yStatus'),
    poemTitleBadge: $('#poemTitleBadge')
  };

  function showToast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.remove('hidden');
    clearTimeout(els.toast._timer);
    els.toast._timer = setTimeout(() => {
      els.toast.classList.add('hidden');
    }, 2000);
  }

  function run() {
    const is7 = els.cipai.value === '7';
    const cipai = is7 ? CIPAI_7 : CIPAI_5;
    const text = els.input.value || '';
    const poem = buildPoem(text, cipai);
    const studioName = makeStudioName();
    const dateStr = todayCN();

    els.studioName.textContent = '落款：' + studioName;
    if (els.poemTitleBadge) {
      els.poemTitleBadge.textContent = poem.subtitle;
    }

    // 安全渲染诗句到 DOM（避免 XSS）
    els.poemBox.innerHTML = poem.lines
      .map(l => '<div class="line">' + escapeHtml(l.replace(/\s+/g, '')) + '</div>')
      .join('');

    const note = buildNote(poem, { studioName, date: dateStr });
    els.noteBox.value = note;

    renderSeal(els.canvas, poem, { studioName, date: dateStr });

    if (els.a11y) {
      els.a11y.textContent = '已生成' + poem.cipaiName + '，第一句为：' + poem.lines[0];
    }

    els.dl.onclick = () => {
      try {
        const a = document.createElement('a');
        a.href = els.canvas.toDataURL('image/png');
        a.download = '国风诗签-' + poem.mood + '-' + Date.now() + '.png';
        a.click();
        showToast('🖼️ 诗签已高清导出');
      } catch (err) {
        showToast('❌ 导出失败，请长按图片另存为');
      }
    };
  }

  // 灵感意象快捷点选
  if (els.chips) {
    els.chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (btn) {
        const val = btn.getAttribute('data-val');
        els.input.value = val;
        run();
        showToast('✨ 已选意象「' + val + '」并挥毫');
      }
    });
  }

  els.go.addEventListener('click', () => {
    run();
    showToast('🪶 挥毫成签完毕');
  });

  els.cipai.addEventListener('change', run);
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      run();
      showToast('🪶 挥毫成签完毕');
    }
  });

  els.copy.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(els.noteBox.value);
      } else {
        els.noteBox.select();
        document.execCommand('copy');
      }
      showToast('📋 小红书笔记已复制到剪贴板');
      els.copy.textContent = '✅ 已复制';
    } catch (e) {
      els.noteBox.select();
      document.execCommand('copy');
      showToast('📋 小红书笔记已复制');
      els.copy.textContent = '✅ 已复制';
    }
    setTimeout(() => (els.copy.textContent = '📋 复制笔记文案'), 1800);
  });

  // 初始化首屏渲染
  run();
})();
