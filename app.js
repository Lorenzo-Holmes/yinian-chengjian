/*
 * 一念成笺 · 国风诗签
 * 纯前端、零依赖、离线可用：确定性诗签引擎 + 本地 Canvas 导出。
 */
(function () {
  'use strict';

  const CIPAI_5 = { id: '5', name: '五言诗签', subtitle: '五言诗签 · 四句凝练', lineLen: 5 };
  const CIPAI_7 = { id: '7', name: '七言诗签', subtitle: '七言诗签 · 四句舒展', lineLen: 7 };
  const DEFAULT_AUTHOR = '无名客';
  const HISTORY_KEY = 'yinian-chengjian-history-v1';
  const HISTORY_LIMIT = 12;
  const MOODS = ['清欢', '思念', '孤勇', '松弛', '期许', '释然', '怦然', '归心', '远行'];

  const MOOD_DATA = {
    清欢: { tone: '清简', hint: '在寻常日子里留一盏淡茶' },
    思念: { tone: '含蓄', hint: '把未寄出的心意放进晚风' },
    孤勇: { tone: '坚定', hint: '一个人也把脚下的路走稳' },
    松弛: { tone: '闲适', hint: '让时间在一寸留白里慢下来' },
    期许: { tone: '明亮', hint: '向未至之处递出一枝春' },
    释然: { tone: '通透', hint: '把旧事轻轻放回流水' },
    怦然: { tone: '灵动', hint: '让心事在一瞬间亮起来' },
    归心: { tone: '温柔', hint: '循着灯火回到熟悉之处' },
    远行: { tone: '旷达', hint: '带着风与行囊去看远方' }
  };

  const PALETTES = {
    cinnabar: {
      name: '宣纸朱砂',
      paperA: '#fbf7ee', paperB: '#ead9b8', ink: '#1a140e', muted: '#735d3e',
      accent: '#a6341b', gold: '#9e7532', line: 'rgba(87, 57, 25, .44)', seal: '#a6341b'
    },
    indigo: {
      name: '黛青月白',
      paperA: '#f4f1e8', paperB: '#c9d1c8', ink: '#18242a', muted: '#42565b',
      accent: '#26384a', gold: '#8a7140', line: 'rgba(38, 56, 74, .4)', seal: '#526b53'
    },
    bamboo: {
      name: '竹青松烟',
      paperA: '#f2f1e5', paperB: '#cfd8c5', ink: '#182019', muted: '#4d6650',
      accent: '#526b53', gold: '#907542', line: 'rgba(53, 77, 55, .42)', seal: '#526b53'
    }
  };

  function makeTheme(data) {
    return Object.assign({
      sourceTitle: '',
      sourceUrl: '',
      sourceNote: '本次为艺术化创作，仅作创作灵感，未引用历史事实。'
    }, data);
  }

  // 每个主题都保留：题目、场景、动作、情绪、转意、收束、韵组和来源元数据。
  const THEMES = [
    makeTheme({
      id: 'songfeng', category: '山水', name: '松风', displayName: '山水 · 松风', defaultPalette: 'cinnabar',
      titlePool: ['松风入砚', '远岫有信', '山窗小记', '一笺清响', '向山而居'],
      scenes: { 5: ['松风', '寒江', '远岫', '竹雨'], 7: ['松风入砚', '寒江照影', '远岫开晴', '竹雨沾衣'] },
      motions: { 5: ['轻舟', '归鸟', '云起', '潮生'], 7: ['轻舟穿雾', '归鸟衔烟', '云起千峰', '潮生远浦'] },
      feelings: { 5: ['心静', '意闲', '客梦', '乡思'], 7: ['心静如水', '意闲忘机', '客梦微醒', '乡思入怀'] },
      turns: { 5: ['回首', '且把', '忽觉', '更向'], 7: ['回首灯火', '且把流年', '忽觉星河', '更向青山'] },
      endings: {
        5: ['入梦来', '满空山', '照影寒', '度云端', '起微澜', '在人间', '泛归舟', '伴客愁'],
        7: ['入梦来', '满空山', '照影寒', '度云端', '起微澜', '在人间', '泛归舟', '伴客愁']
      },
      rhymeGroups: {
        an: ['落云间', '照远山', '入青岚', '系归帆', '到江南', '起微澜'],
        ou: ['入孤舟', '对西楼', '伴清秋', '惹客愁', '泊汀洲', '近渡头'],
        ing: ['见疏星', '动秋声', '照空庭', '入长亭', '听泉清', '待潮生']
      },
      interpretationTemplates: [
        '这张诗签借松风与远岫写下{mood}：先把{keyword}安放在山色里，再让心绪沿着一缕清响慢慢展开。{hint}。本次为艺术化联想。',
        '以松风为景、以{mood}为心，{keyword}像一枚小小的印记落在纸上；起景、承情、转意、合境，留一寸给自己。{hint}。本次为艺术化联想。'
      ]
    }),
    makeTheme({
      id: 'guyu', category: '节气', name: '谷雨', displayName: '节气 · 谷雨', defaultPalette: 'bamboo',
      titlePool: ['谷雨新晴', '春深有约', '一笺微雨', '花信未迟', '向春借光'],
      scenes: { 5: ['春分', '谷雨', '白露', '霜降'], 7: ['春分初度', '谷雨新晴', '白露凝光', '霜降入林'] },
      motions: { 5: ['柳动', '雨歇', '露凝', '雁归'], 7: ['柳动一城', '雨歇花醒', '露凝荷影', '雁归天远'] },
      feelings: { 5: ['春心', '新愿', '惜时', '念远'], 7: ['春心初醒', '新愿如芽', '惜时惜花', '念远成歌'] },
      turns: { 5: ['借问', '莫负', '且看', '应知'], 7: ['借问东风', '莫负花期', '且看新绿', '应知春深'] },
      endings: {
        5: ['入春来', '照楼台', '染青苔', '向花开', '落窗纱', '到人家', '过溪桥', '入梦遥'],
        7: ['入春来', '照楼台', '染青苔', '向花开', '落窗纱', '到人家', '过溪桥', '入梦遥']
      },
      rhymeGroups: {
        an: ['落花间', '入春山', '过溪湾', '照人闲', '到江南', '起微澜'],
        ou: ['入小楼', '伴清秋', '倚栏头', '到渡头', '泊兰舟', '向西楼'],
        ing: ['见新晴', '听雨声', '照花亭', '入画屏', '动芳心', '待燕鸣']
      },
      interpretationTemplates: [
        '节气只是意象的底色：谷雨的微雨托住{mood}，也让{keyword}有了向内生长的时间。{hint}。本次为艺术化联想。',
        '这一笺把{keyword}放进一场谷雨新晴，借花信、柳影和{mood}写一份轻盈的期盼。{hint}。本次为艺术化联想。'
      ]
    }),
    makeTheme({
      id: 'yadan', category: '雅器', name: '团扇', displayName: '雅器 · 团扇', defaultPalette: 'indigo',
      titlePool: ['团扇题字', '一室清音', '案头有风', '墨色闲章', '小器藏心'],
      scenes: { 5: ['古琴', '团扇', '香篆', '砚墨'], 7: ['古琴横膝', '团扇轻摇', '香篆入帘', '砚墨生云'] },
      motions: { 5: ['拂弦', '摇扇', '引香', '磨砚'], 7: ['拂弦写月', '摇扇生风', '引香入静', '磨砚成诗'] },
      feelings: { 5: ['清音', '闲情', '心静', '墨痕'], 7: ['清音入梦', '闲情半卷', '心静如初', '墨痕未干'] },
      turns: { 5: ['收弦', '合扇', '掩卷', '停笔'], 7: ['收弦看月', '合扇听雨', '掩卷微笑', '停笔留白'] },
      endings: {
        5: ['入清秋', '对西楼', '伴茶瓯', '照心头', '绕书帱', '在闲愁', '寄兰舟', '度更筹'],
        7: ['入清秋', '对西楼', '伴茶瓯', '照心头', '绕书帱', '在闲愁', '寄兰舟', '度更筹']
      },
      rhymeGroups: {
        an: ['落砚间', '照书山', '入墨澜', '寄云笺', '到灯阑', '起微澜'],
        ou: ['入清秋', '对西楼', '伴茶瓯', '照心头', '寄兰舟', '度更筹'],
        ing: ['听琴声', '照砚屏', '入空庭', '动墨灵', '待茶清', '落花铃']
      },
      interpretationTemplates: [
        '雅器不作考据，只作一方安静的舞台：团扇、香篆与{mood}相遇，把{keyword}收成案头的一点清光。{hint}。本次为艺术化联想。',
        '借一件小器写大心事，{keyword}落在团扇的留白处，随着{mood}轻轻展开。{hint}。本次为艺术化联想。'
      ]
    }),
    makeTheme({
      id: 'qingniao', category: '志怪', name: '青鸟', displayName: '志怪 · 青鸟', defaultPalette: 'indigo',
      titlePool: ['青鸟寄笺', '梦渡星河', '夜有来信', '云外一声', '奇境拾光'],
      scenes: { 5: ['青鸟', '烛龙', '九尾', '鲲鹏'], 7: ['青鸟衔书', '烛龙照海', '九尾入梦', '鲲鹏扶摇'] },
      motions: { 5: ['衔月', '照海', '回眸', '扶摇'], 7: ['衔月过云', '照海生潮', '回眸见梦', '扶摇万里'] },
      feelings: { 5: ['梦远', '心惊', '神游', '意奇'], 7: ['梦远星稀', '心惊月白', '神游万象', '意奇天开'] },
      turns: { 5: ['忽闻', '欲问', '且向', '回看'], 7: ['忽闻天外', '欲问灵踪', '且向云端', '回看人间'] },
      endings: {
        5: ['入玄门', '度星津', '见灵根', '待佳音', '照夜深', '寄遥心', '过昆仑', '到梦痕'],
        7: ['入玄门', '度星津', '见灵根', '待佳音', '照夜深', '寄遥心', '过昆仑', '到梦痕']
      },
      rhymeGroups: {
        an: ['落云端', '渡重山', '照心关', '寄灵丹', '到人间', '起微澜'],
        ou: ['入星舟', '向天游', '伴清秋', '问神州', '到西楼', '泊灵洲'],
        ing: ['见长生', '听风铃', '照空冥', '入幻境', '待潮声', '动心旌']
      },
      interpretationTemplates: [
        '志怪只是想象的入口：青鸟把{keyword}带入一处奇境，{mood}在星河与人间之间找到回声。{hint}。本次为艺术化联想。',
        '以青鸟作信使，以{mood}作灯火，{keyword}从现实的缝隙里长出一点奇异而柔软的光。{hint}。本次为艺术化联想。'
      ]
    })
  ];

  function $(selector) { return document.querySelector(selector); }

  const els = {
    input: $('#mood'), chips: $('#moodChips'), category: $('#themeCategory'), theme: $('#theme'),
    cipai: $('#cipai'), palette: $('#palette'), author: $('#author'), go: $('#go'), reroll: $('#reroll'),
    download: $('#download'), copy: $('#copyNote'), invite: $('#invite'), poemBox: $('#poem'), poemTitle: $('#poemTitle'),
    poemTitleBadge: $('#poemTitleBadge'), interpretation: $('#interpretation'), source: $('#source'), noteBox: $('#note'),
    canvas: $('#seal'), preview: $('.preview'), historyPanel: $('#historyPanel'), historyList: $('#historyList'),
    clearHistory: $('#clearHistory'), challengeHint: $('#challengeHint'), toast: $('#toast'), a11y: $('#a11yStatus')
  };

  function hashSeed(value) {
    let hash = 2166136261;
    const text = String(value == null ? '' : value);
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function makeSeed(keyword, mood, themeId, form, rerollIndex) {
    return hashSeed([keyword || '此刻', mood, themeId, form, rerollIndex].join('|')).toString(16).padStart(8, '0');
  }

  function makeRng(seed) {
    let state = (typeof seed === 'number' ? seed : hashSeed(seed)) >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function choose(list, rng, used) {
    if (!list || !list.length) return '';
    const start = Math.floor(rng() * list.length);
    for (let offset = 0; offset < list.length; offset += 1) {
      const index = (start + offset) % list.length;
      const value = list[index];
      if (!used || !used.has(value)) {
        if (used) used.add(value);
        return value;
      }
    }
    return list[start];
  }

  function chineseChars(value) {
    return Array.from(String(value == null ? '' : value)).filter(function (char) {
      return /[\u3400-\u9fff]/.test(char);
    });
  }

  function sanitizeChinese(value, limit) {
    return chineseChars(value).slice(0, limit).join('');
  }

  function countChinese(value) { return chineseChars(value).length; }

  function normalizeAuthor(value) { return sanitizeChinese(value, 6) || DEFAULT_AUTHOR; }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function getTheme(themeId) {
    return THEMES.find(function (theme) { return theme.id === themeId; }) || THEMES[0];
  }

  function getForm(value) { return Number(value) === 5 ? CIPAI_5 : CIPAI_7; }

  function resolveMood(value, explicitMood) {
    if (MOODS.indexOf(explicitMood) >= 0) return explicitMood;
    const clean = sanitizeChinese(value, 12);
    if (MOODS.indexOf(clean) >= 0) return clean;
    for (let i = 0; i < MOODS.length; i += 1) {
      if (clean.indexOf(MOODS[i]) >= 0) return MOODS[i];
    }
    return MOODS[hashSeed(clean || '清欢') % MOODS.length];
  }

  function getRhymeGroup(theme, line) {
    const groups = Object.keys(theme.rhymeGroups);
    for (let i = 0; i < groups.length; i += 1) {
      const group = groups[i];
      if (theme.rhymeGroups[group].some(function (ending) { return line.slice(-ending.length) === ending; })) return group;
    }
    return '';
  }

  function validCharCount(line, expected) {
    return chineseChars(String(line).replace(/[\s，。！？、；：,.!?;:]/g, '')).length === expected;
  }

  function hasRepeatedPhrase(lines) {
    const seen = new Set();
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (seen.has(line)) return true;
      seen.add(line);
      const firstThree = line.slice(0, 3);
      if (firstThree && seen.has(firstThree)) return true;
      if (firstThree) seen.add(firstThree);
    }
    return false;
  }

  function validatePoem(poem) {
    if (!poem || !Array.isArray(poem.lines) || poem.lines.length !== 4) return false;
    const expected = Number(poem.form || poem.lineLen || 0);
    if (expected !== 5 && expected !== 7) return false;
    if (!poem.lines.every(function (line) { return validCharCount(line, expected); })) return false;
    if (new Set(poem.lines).size !== poem.lines.length || hasRepeatedPhrase(poem.lines)) return false;
    const theme = getTheme(poem.themeId);
    const secondRhyme = getRhymeGroup(theme, poem.lines[1]);
    const fourthRhyme = getRhymeGroup(theme, poem.lines[3]);
    if (!secondRhyme || secondRhyme !== fourthRhyme) return false;
    if (poem.keyword && String(poem.title || '').indexOf(poem.keyword) < 0 && String(poem.lines[0]).indexOf(poem.keyword) < 0) return false;
    return true;
  }

  function buildInterpretation(theme, mood, keyword, line, rng) {
    const moodData = MOOD_DATA[mood] || MOOD_DATA.清欢;
    const templates = theme.interpretationTemplates || [];
    const template = choose(templates, rng) || '把{keyword}写进{themeName}，让{mood}在四句之间慢慢展开。{hint}。本次为艺术化联想。';
    return template.replace(/\{keyword\}/g, keyword || '此刻')
      .replace(/\{themeName\}/g, theme.displayName)
      .replace(/\{mood\}/g, mood)
      .replace(/\{hint\}/g, moodData.hint)
      .replace(/\{line\}/g, line || '');
  }

  // 生成接口：keyword + 五/七言配置 + 选项，所有选择由 seed 决定。
  function buildPoem(keyword, cipai, options) {
    let formConfig = cipai;
    let opts = options || {};
    if (!formConfig || typeof formConfig !== 'object') formConfig = getForm(formConfig);
    if (!formConfig.lineLen && formConfig.form) {
      opts = formConfig;
      formConfig = getForm(formConfig.form);
    }
    const form = getForm(formConfig.lineLen || formConfig.form || 7);
    const cleanKeyword = sanitizeChinese(keyword, 4);
    const mood = resolveMood(cleanKeyword, opts.mood);
    const theme = getTheme(opts.themeId);
    const rerollIndex = Math.max(0, Number(opts.rerollIndex) || 0);
    const seed = makeSeed(cleanKeyword, mood, theme.id, form.lineLen, rerollIndex);
    const roleKeys = ['scenes', 'motions', 'feelings', 'turns'];
    let best = null;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const rng = makeRng(hashSeed(seed + '|' + attempt));
      const rhymeKeys = Object.keys(theme.rhymeGroups);
      const rhymeGroup = rhymeKeys[Math.floor(rng() * rhymeKeys.length)];
      const lines = [];
      const usedLines = new Set();
      const usedPrefixes = [new Set(), new Set(), new Set(), new Set()];
      const usedEndings = new Set();
      for (let role = 0; role < roleKeys.length; role += 1) {
        const prefixPool = theme[roleKeys[role]][form.lineLen];
        const prefix = choose(prefixPool, rng, usedPrefixes[role]);
        const endingPool = role === 1 || role === 3 ? theme.rhymeGroups[rhymeGroup] : theme.endings[form.lineLen];
        const ending = choose(endingPool, rng, usedEndings);
        let line = prefix + ending;
        if (usedLines.has(line)) {
          const backup = theme.endings[form.lineLen].find(function (item) { return !usedEndings.has(item); });
          line = prefix + (backup || ending);
        }
        usedEndings.add(ending);
        usedLines.add(line);
        lines.push(line);
      }
      const titleBase = choose(theme.titlePool, rng) || theme.name;
      const title = cleanKeyword ? cleanKeyword + ' · ' + titleBase : titleBase;
      const poem = {
        id: 'poem-' + seed,
        seed: seed,
        mood: mood,
        keyword: cleanKeyword,
        themeId: theme.id,
        themeName: theme.displayName,
        form: String(form.lineLen),
        cipaiName: form.name,
        title: title,
        lines: lines,
        interpretation: buildInterpretation(theme, mood, cleanKeyword, lines[0], rng),
        author: normalizeAuthor(opts.author),
        sourceTitle: theme.sourceTitle,
        sourceUrl: theme.sourceUrl,
        sourceNote: theme.sourceNote,
        createdAt: opts.createdAt || new Date().toISOString(),
        rerollIndex: rerollIndex,
        rhymeGroup: rhymeGroup,
        paletteId: opts.paletteId || theme.defaultPalette
      };
      best = poem;
      if (validatePoem(poem)) return poem;
    }

    // 词库始终可回退到确定性结果；它仍保留四句、字数和同韵约束。
    if (best) {
      best.lines = best.lines.map(function (line, index) {
        return line || (index % 2 === 0 ? '清风入梦来' : '一笺照远山');
      });
      return best;
    }
    return {
      id: 'poem-' + seed, seed: seed, mood: mood, keyword: cleanKeyword, themeId: theme.id,
      themeName: theme.displayName, form: String(form.lineLen), cipaiName: form.name,
      title: cleanKeyword ? cleanKeyword + ' · ' + theme.name : theme.name,
      lines: form.lineLen === 7 ? ['清风入砚照远山', '云起千峰入长亭', '心静如水伴清秋', '更向青山见疏星'] : ['松风入梦来', '云起照远山', '心静伴清秋', '回首见疏星'],
      interpretation: '把此刻写进一处想象的风景，留一寸给自己。本次为艺术化联想。', author: normalizeAuthor(opts.author),
      sourceTitle: '', sourceUrl: '', sourceNote: theme.sourceNote, createdAt: opts.createdAt || new Date().toISOString(),
      rerollIndex: rerollIndex, rhymeGroup: 'ing', paletteId: opts.paletteId || theme.defaultPalette
    };
  }

  function formatDate(date) {
    const d = date || new Date();
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function buildNote(poem, opts) {
    const options = opts || {};
    const keyword = poem.keyword || '此刻';
    const author = poem.author || options.author || options.studioName || DEFAULT_AUTHOR;
    const tags = '#国风vibecoding #小红书vibecoding大赛 #vibeart\n#vibecoding #小红书小工具 #国风诗签';
    return [
      '🍂 一念成笺｜我的今日国风诗签',
      '',
      '我把「' + keyword + '」写进了「' + poem.themeName + '」的意象里：',
      '',
      poem.lines[0] + '。',
      poem.lines[1] + '。',
      poem.lines[2] + '。',
      poem.lines[3] + '。',
      '',
      '签语：' + poem.interpretation,
      '落款：' + author,
      '',
      '也来输入你的心情，看看会得到哪一张诗签。',
      '',
      '@科技薯',
      tags
    ].join('\n');
  }

  function renderPoem(poem) {
    if (!els.poemBox) return;
    const children = poem.lines.map(function (line) {
      const element = document.createElement('div');
      element.className = 'line';
      element.textContent = line + '。';
      return element;
    });
    if (typeof els.poemBox.replaceChildren === 'function') els.poemBox.replaceChildren.apply(els.poemBox, children);
    else {
      els.poemBox.textContent = children.map(function (child) { return child.textContent; }).join('\n');
    }
  }

  function renderSource(poem) {
    if (!els.source) return;
    if (poem.sourceTitle && poem.sourceUrl) {
      const link = document.createElement('a');
      link.href = poem.sourceUrl;
      link.textContent = '意象来源：' + poem.sourceTitle;
      link.target = '_blank';
      link.rel = 'noreferrer';
      if (typeof els.source.replaceChildren === 'function') els.source.replaceChildren(link);
      else els.source.textContent = link.textContent;
    } else {
      els.source.textContent = poem.sourceNote || '本次为艺术化创作，仅作创作灵感。';
    }
  }

  function getStorage() {
    try { return window.localStorage || null; } catch (error) { return null; }
  }

  function readHistory() {
    const storage = getStorage();
    if (!storage) return [];
    try {
      const parsed = JSON.parse(storage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
    } catch (error) { return []; }
  }

  function writeHistory(records) {
    const storage = getStorage();
    if (!storage) return;
    try { storage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, HISTORY_LIMIT))); } catch (error) { /* 本地存储被禁用时继续可用 */ }
  }

  function historyRecord(poem) {
    return {
      seed: poem.seed,
      text: poem.keyword,
      mood: poem.mood,
      themeId: poem.themeId,
      form: poem.form,
      rerollIndex: poem.rerollIndex
    };
  }

  function saveHistory(poem) {
    const item = historyRecord(poem);
    const records = readHistory().filter(function (record) { return record.seed !== item.seed; });
    records.unshift(item);
    writeHistory(records.slice(0, HISTORY_LIMIT));
    renderHistory();
  }

  function renderHistory() {
    if (!els.historyList || !els.historyPanel) return;
    const records = readHistory();
    if (typeof els.historyList.replaceChildren === 'function') els.historyList.replaceChildren();
    else els.historyList.textContent = '';
    if (!records.length) {
      els.historyPanel.classList.add('hidden');
      return;
    }
    els.historyPanel.classList.remove('hidden');
    records.forEach(function (record) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'history-item';
      const label = document.createElement('strong');
      label.textContent = record.text || record.mood || '此刻';
      const detail = document.createElement('span');
      detail.textContent = getTheme(record.themeId).name + ' · ' + (record.form === '5' ? '五言' : '七言');
      button.appendChild(label);
      button.appendChild(detail);
      button.addEventListener('click', function () { restoreHistory(record); });
      els.historyList.appendChild(button);
    });
  }

  function clearHistory() {
    const storage = getStorage();
    if (storage) {
      try { storage.removeItem(HISTORY_KEY); } catch (error) { /* 继续清空当前视图 */ }
    }
    renderHistory();
    showToast('最近诗签已清空');
  }

  function updateMoodState(value) {
    if (!els.chips) return;
    const current = sanitizeChinese(value, 4);
    Array.from(els.chips.querySelectorAll('.chip')).forEach(function (chip) {
      const selected = chip.getAttribute('data-mood') === current;
      chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function populateThemes(category, preferredId) {
    if (!els.theme) return;
    const filtered = THEMES.filter(function (theme) { return theme.category === category; });
    const selected = filtered.some(function (theme) { return theme.id === preferredId; }) ? preferredId : filtered[0].id;
    const options = filtered.map(function (theme) {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      return option;
    });
    if (typeof els.theme.replaceChildren === 'function') els.theme.replaceChildren.apply(els.theme, options);
    else els.theme.textContent = filtered.map(function (theme) { return theme.name; }).join('、');
    els.theme.value = selected;
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.remove('hidden');
    clearTimeout(els.toast._timer);
    els.toast._timer = setTimeout(function () { els.toast.classList.add('hidden'); }, 2200);
  }

  function announce(message) { if (els.a11y) els.a11y.textContent = message; }

  function renderSeal(canvas, poem, opts) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const options = opts || {};
    const W = 600;
    const H = 800;
    const dpr = 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (typeof ctx.setTransform === 'function') ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const palette = PALETTES[options.paletteId || poem.paletteId] || PALETTES.cinnabar;
    const rng = makeRng(poem.seed + '|texture');
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, palette.paperA);
    gradient.addColorStop(.52, palette.paperB);
    gradient.addColorStop(1, palette.paperA);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 150; i += 1) {
      ctx.fillStyle = palette.gold.replace(')', ', .08)').replace('rgb', 'rgba');
      const x = rng() * W;
      const y = rng() * H;
      const radius = .45 + rng() * 1.7;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 2.8;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.lineWidth = .8;
    ctx.strokeStyle = palette.gold;
    ctx.strokeRect(33, 33, W - 66, H - 66);

    ctx.fillStyle = palette.accent;
    ctx.font = '700 13px "STKaiti", "KaiTi", "楷体", serif';
    ctx.textAlign = 'center';
    ctx.fillText('一念', W - 59, 58);
    ctx.fillText('成笺', W - 59, 75);

    ctx.fillStyle = palette.muted;
    ctx.font = '17px "STKaiti", "KaiTi", "楷体", serif';
    ctx.fillText(poem.title, W / 2, 78);
    ctx.font = '12px "STKaiti", "KaiTi", "楷体", serif';
    ctx.fillText(poem.themeName + ' · ' + (poem.form === '5' ? '五言诗签' : '七言诗签'), W / 2, 103);

    ctx.fillStyle = palette.ink;
    ctx.font = (poem.form === '5' ? '34px' : '31px') + ' "STKaiti", "KaiTi", "楷体", "Songti SC", serif';
    ctx.textAlign = 'center';
    const lineXs = [W - 112, W - 198, W - 284, W - 370];
    const charGap = poem.form === '5' ? 68 : 54;
    const startY = poem.form === '5' ? 184 : 154;
    poem.lines.forEach(function (line, lineIndex) {
      const cleanLine = String(line).replace(/[\s，。！？、；：,.!?;:]/g, '');
      Array.from(cleanLine).forEach(function (char, charIndex) {
        ctx.fillText(char, lineXs[lineIndex], startY + charIndex * charGap);
      });
    });

    const author = normalizeAuthor(options.author || poem.author);
    const date = options.date || formatDate();
    ctx.textAlign = 'left';
    ctx.fillStyle = palette.muted;
    ctx.font = '15px "STKaiti", "KaiTi", "楷体", serif';
    ctx.fillText('落款 · ' + author, 50, H - 99);
    ctx.font = '12px "STKaiti", "KaiTi", "楷体", serif';
    ctx.fillText(date, 50, H - 78);

    ctx.fillStyle = palette.seal;
    ctx.fillRect(50, H - 67, 38, 38);
    ctx.fillStyle = palette.paperA;
    ctx.textAlign = 'center';
    ctx.font = '700 12px "STKaiti", "KaiTi", "楷体", serif';
    ctx.fillText('成', 60, H - 48);
    ctx.fillText('笺', 78, H - 48);
    ctx.fillText('一', 60, H - 34);
    ctx.fillText('念', 78, H - 34);
    canvas.__lastRenderMeta = { width: W, height: H, dpr: dpr, lineXs: lineXs.slice(), paletteId: options.paletteId || poem.paletteId };
  }

  function renderCurrent(poem) {
    if (!poem) return;
    if (els.poemTitle) els.poemTitle.textContent = poem.title;
    if (els.poemTitleBadge) els.poemTitleBadge.textContent = poem.form === '5' ? '五言诗签' : '七言诗签';
    renderPoem(poem);
    if (els.interpretation) els.interpretation.textContent = '签语：' + poem.interpretation;
    renderSource(poem);
    const date = formatDate();
    if (els.noteBox) els.noteBox.value = buildNote(poem, { date: date, author: poem.author });
    renderSeal(els.canvas, poem, { author: poem.author, date: date, paletteId: els.palette ? els.palette.value : poem.paletteId });
  }

  function currentConfig() {
    const form = getForm(els.cipai ? els.cipai.value : 7);
    return {
      form: form,
      themeId: els.theme ? els.theme.value : THEMES[0].id,
      paletteId: els.palette ? els.palette.value : 'cinnabar'
    };
  }

  let currentPoem = null;

  function run(rerollIndex, settings) {
    const options = settings || {};
    const rawKeyword = els.input ? els.input.value : '';
    const keywordCount = countChinese(rawKeyword);
    const keyword = sanitizeChinese(rawKeyword, 4);
    if (els.input && els.input.value !== keyword) els.input.value = keyword;
    if (keywordCount > 4 && !options.silent) showToast('关键词最多4个汉字，已取前4字');
    if (!keyword && rawKeyword && !options.silent) showToast('请输入1—4个汉字');
    updateMoodState(keyword);
    const config = currentConfig();
    const mood = resolveMood(keyword, MOODS.indexOf(keyword) >= 0 ? keyword : '');
    const author = normalizeAuthor(els.author ? els.author.value : DEFAULT_AUTHOR);
    currentPoem = buildPoem(keyword, config.form, {
      mood: mood, themeId: config.themeId, paletteId: config.paletteId,
      author: author, rerollIndex: Math.max(0, Number(rerollIndex) || 0)
    });
    renderCurrent(currentPoem);
    if (options.challenge) {
      if (els.challengeHint) {
        els.challengeHint.textContent = '同题邀请已载入：请用自己的落款，再生成一张不同的诗签。';
        els.challengeHint.classList.remove('hidden');
      }
    }
    if (options.save !== false) saveHistory(currentPoem);
    announce('已生成' + currentPoem.cipaiName + '，主题为' + currentPoem.themeName + '，第一句为：' + currentPoem.lines[0]);
    if (options.scroll && window.innerWidth && window.innerWidth < 880 && els.preview && typeof els.preview.scrollIntoView === 'function') {
      setTimeout(function () { els.preview.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
    }
    return currentPoem;
  }

  function restoreHistory(record) {
    if (!record) return;
    if (els.input) els.input.value = sanitizeChinese(record.text || record.mood, 4);
    const theme = getTheme(record.themeId);
    if (els.category) els.category.value = theme.category;
    populateThemes(theme.category, theme.id);
    if (els.cipai) els.cipai.value = record.form === '5' ? '5' : '7';
    run(Number(record.rerollIndex) || 0, { save: false, scroll: true });
    showToast('已恢复这张诗签');
  }

  function encodeChallenge(poem) {
    return '#challenge=' + encodeURIComponent([poem.mood, poem.keyword, poem.themeId, poem.form].join('|'));
  }

  function parseChallengeHash(hash) {
    const value = String(hash || '').replace(/^#challenge=/, '');
    if (!hash || String(hash).indexOf('#challenge=') !== 0) return null;
    let decoded = '';
    try { decoded = decodeURIComponent(value); } catch (error) { return null; }
    const parts = decoded.split('|');
    if (parts.length !== 4) return null;
    const theme = THEMES.find(function (item) { return item.id === parts[2]; });
    if (!theme || (parts[3] !== '5' && parts[3] !== '7')) return null;
    return { mood: resolveMood(parts[0], parts[0]), keyword: sanitizeChinese(parts[1], 4), themeId: theme.id, form: parts[3] };
  }

  function shareUrl(poem) {
    if (typeof window === 'undefined' || !window.location) return encodeChallenge(poem);
    return String(window.location.href).split('#')[0] + encodeChallenge(poem);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
      if (els.noteBox) {
        els.noteBox.focus();
        els.noteBox.select();
        return document.execCommand ? document.execCommand('copy') : false;
      }
    } catch (error) {
      try { return document.execCommand ? document.execCommand('copy') : false; } catch (ignored) { return false; }
    }
    return false;
  }

  function downloadCurrent() {
    if (!currentPoem || !els.canvas) return;
    try {
      const link = document.createElement('a');
      link.href = els.canvas.toDataURL('image/png');
      const keyword = currentPoem.keyword || '此刻';
      link.download = '一念成笺-' + keyword + '-' + Date.now() + '.png';
      link.click();
      showToast('诗签已保存为高清 PNG');
    } catch (error) { showToast('请长按或右键图片保存'); }
  }

  async function copyNote() {
    if (!currentPoem) return;
    const ok = await copyText(els.noteBox ? els.noteBox.value : buildNote(currentPoem));
    showToast(ok ? '分享文案已复制' : '请手动选择文案复制');
  }

  async function inviteChallenge() {
    if (!currentPoem) return;
    const url = shareUrl(currentPoem);
    const text = buildNote(currentPoem) + '\n\n打开链接，和我同题生成：' + url;
    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({ title: '一念成笺 · 同题邀请', text: text, url: url });
        showToast('同题邀请已发出');
        return;
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return;
    }
    const ok = await copyText(text);
    showToast(ok ? '同题邀请链接已复制' : '请复制地址参与同题');
  }

  function bindEvents() {
    if (els.chips) {
      els.chips.addEventListener('click', function (event) {
        const button = event.target.closest ? event.target.closest('.chip') : null;
        if (!button) return;
        const value = button.getAttribute('data-mood') || '';
        if (els.input) els.input.value = value;
        updateMoodState(value);
        showToast('已选择「' + value + '」，点击生成诗签');
      });
    }
    if (els.go) els.go.addEventListener('click', function () { run(0, { save: true, scroll: true }); showToast('诗签已生成'); });
    if (els.reroll) els.reroll.addEventListener('click', function () {
      run((currentPoem ? currentPoem.rerollIndex : 0) + 1, { save: true, scroll: true });
      showToast('已换一签');
    });
    if (els.download) els.download.addEventListener('click', downloadCurrent);
    if (els.copy) els.copy.addEventListener('click', copyNote);
    if (els.invite) els.invite.addEventListener('click', inviteChallenge);
    if (els.clearHistory) els.clearHistory.addEventListener('click', clearHistory);
    if (els.input) {
      els.input.addEventListener('input', function () { updateMoodState(els.input.value); });
      els.input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { run(0, { save: true, scroll: true }); showToast('诗签已生成'); }
      });
    }
    if (els.category) els.category.addEventListener('change', function () {
      populateThemes(els.category.value);
      run(0, { save: true, scroll: true });
    });
    if (els.theme) els.theme.addEventListener('change', function () { run(0, { save: true, scroll: true }); });
    if (els.cipai) els.cipai.addEventListener('change', function () { run(0, { save: true, scroll: true }); });
    if (els.palette) els.palette.addEventListener('change', function () { if (currentPoem) renderCurrent(currentPoem); });
    if (els.author) els.author.addEventListener('input', function () {
      const clean = sanitizeChinese(els.author.value, 6);
      if (els.author.value !== clean) els.author.value = clean;
      if (currentPoem) { currentPoem.author = normalizeAuthor(clean); renderCurrent(currentPoem); }
    });
  }

  function init() {
    const challenge = parseChallengeHash(window.location ? window.location.hash : '');
    populateThemes(els.category ? els.category.value : '山水', challenge ? challenge.themeId : 'songfeng');
    if (challenge) {
      if (els.input) els.input.value = challenge.keyword || challenge.mood;
      if (els.category) els.category.value = getTheme(challenge.themeId).category;
      populateThemes(getTheme(challenge.themeId).category, challenge.themeId);
      if (els.cipai) els.cipai.value = challenge.form;
    }
    updateMoodState(els.input ? els.input.value : '');
    bindEvents();
    run(challenge ? 1 : 0, { save: false, challenge: Boolean(challenge), silent: true });
    renderHistory();
  }

  init();

  // selfcheck.js 只在隔离 VM 中注入出口，生产页面不会暴露内部函数。
})();
