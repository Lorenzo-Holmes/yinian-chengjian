# Gemini MCP · 一念成笺前端终审

- MCP server: `D:\AI\CodexWorkspaces\2026-08-09\q\mcp-servers\gemini-cli-bridge\server.py`
- Protocol: `2025-06-18`
- Tools: `ask_gemini`

作为资深国风数字艺术设计师与前端 UI 审查专家，针对「一念成笺 · 国风诗签」在比赛展示场景下的视觉质感、文人笺纸审美意境、移动端触控人机工效与无障碍规范进行了全面审查。

---

## 1. 高价值问题

1. **首屏品牌意象与文人书签辨识度较弱**：
   - 现有的 `.hero-mark` 仅为普通圆角矩形竖排色块，缺少传统印章/题签（如朱文双线开光、阴阳文凹凸质感与泥金边饰）的文人法度；三步指引采粗糙的虚线框，视觉偏向现代电商优惠券，缺少「选念、落墨、凝笺、传阅」的流转仪式感。
2. **触控尺寸未达无障碍黄金标准（WCAG 2.5.5 / 2.5.8 规范）**：
   - 移动端心境胶囊 `.chip` 高度仅为 38px，桌面端 `.result-actions button` 仅设内边距无 `min-height` 兜底（实际高度仅约 34px），在 320px–390px 触摸屏上存在误触与点击困难；此外 `--gold` 与 `--ink-500` 在浅纸背景上的对比度需微调至 4.5:1 以上以满足 WCAG AA 级要求。
3. **四级操作按钮视觉动线与权重失衡**：
   - 底部操作栏（保存诗签图、换一签、复制文案、邀请同题）在桌面端生硬挤在四等分栅格中，各按钮字数长短不一（5字/3字/4字/4字），导致主次不清。应确立「朱砂主行动点（保存）+ 素木副行动点（换签）+ 黛墨/竹青传播点（复制/邀请）」的清晰视觉层次。
4. **诗文预览区（笺心）缺少传统纸本装裱感**：
   - `.poem-preview-box` 仅为扁平浅灰线框，未能传达宋元信笺、乌丝栏/朱丝栏的纸张肌理与格律留白；四句诗文（`.line`）与下方的解读（`.interpretation`）、出处（`.source-note`）之间呼吸感略显局促。
5. **Canvas 预览画布的展陈仪式感不足**：
   - 1200×1600 高清画布容器 `.canvas-wrap` 缺乏传统立轴托裱或册页镶边（外宣内绢、微凹景深）的层次，无法烘托「一张可传世收藏的数字诗笺」的沉浸质感。
6. **三种视觉底色（宣纸朱砂、黛青月白、竹青松烟）在界面的色彩呼应偏弱**：
   - 界面主色彩过于集中在朱红，未将黛青（`--indigo`）与竹青（`--bamboo`）精巧融入次级徽标、链接与社交同题组件中，削弱了三色文化意象的丰富度。
7. **心境标签激活态与表单交互反馈生硬**：
   - `.chip[aria-pressed="true"]` 采用纯红单色平涂，缺乏温润沉着的中式印泥质感；输入框获取焦点时的外发光略显现代 SaaS 化，需重塑为典雅的宣纸墨线与朱砂微晕。
8. **极窄屏（320px/360px）及折叠文案区的留白精细度**：
   - 320px 宽度下标题与表单项略显逼仄；分享文案抽屉 `.note-details` 的折叠标记与文本排版缺乏古籍抄本般的克制与对齐。

---

## 2. 保留项

1. **纯净零依赖与离线运行架构**：严格保留 `file://` 协议即开即用、零外部字体/图片/CDN 请求的极简自闭环结构。
2. **DOM ID 与交互契约 100% 保持**：`moodChips`, `mood`, `themeCategory`, `theme`, `cipai`, `palette`, `author`, `go`, `seal`, `download`, `reroll`, `copyNote`, `invite`, `historyPanel` 等全部 DOM 节点、属性与状态绑定理逻辑分毫不动。
3. **Canvas 1200×1600 渲染与算法隔离**：不改动 `app.js`，完全继承并通过现有的 259 项自动化自检。
4. **系统级古风字体安全降级栈**：保留基于楷体/宋体（`STKaiti`, `KaiTi`, `Songti SC`, `SimSun`, serif）的本地安全字体回退，保证在各平台均能呈现古朴字形。
5. **轻量纯 CSS 宣纸纤维肌理**：保留无图片的径向渐变算法模拟古法纸张纤维，兼顾极速性能与温润质感。

---

## 3. 建议应用的 unified diff

```diff
--- a/index.html
+++ b/index.html
@@ -16,7 +16,7 @@
     <p class="hero-kicker">国风诗签 · 今日落墨</p>
     <h1>一念成笺</h1>
     <p class="sub">把此刻心情，化成一张可收藏、可分享、可同题挑战的国风诗签。</p>
-    <div class="steps-guide" aria-label="创作流程">
+    <div class="steps-guide" role="navigation" aria-label="创作流程">
       <span class="step-item"><b>01</b> 选心境</span>
       <span class="step-arrow" aria-hidden="true">—</span>
       <span class="step-item"><b>02</b> 成诗签</span>
@@ -107,7 +107,7 @@
         <button id="download" class="primary" type="button">保存诗签图</button>
         <button id="reroll" type="button">换一签</button>
         <button id="copyNote" type="button">复制文案</button>
-        <button id="invite" class="ghost" type="button">邀请同题</button>
+        <button id="invite" type="button">邀请同题</button>
       </div>
 
       <section id="historyPanel" class="history-panel hidden" aria-labelledby="historyTitle">
--- a/styles.css
+++ b/styles.css
@@ -1,30 +1,38 @@
 /* 一念成笺 · 国风诗签：本地、零依赖、无外部资源 */
 
 :root {
-  --ink-900: #1a140e;
-  --ink-700: #2c2218;
-  --ink-500: #655642;
-  --paper-100: #fbf7ee;
-  --paper-200: #f3e9d2;
-  --paper-300: #e5d3ac;
-  --cinnabar: #a6341b;
-  --cinnabar-dark: #872712;
-  --gold: #9e7532;
-  --bamboo: #526b53;
-  --indigo: #26384a;
-  --line: rgba(72, 49, 25, 0.18);
-  --line-strong: rgba(72, 49, 25, 0.38);
-  --shadow-soft: 0 8px 24px rgba(57, 37, 15, 0.08);
-  --shadow-card: 0 16px 42px rgba(57, 37, 15, 0.12);
-  --radius-sm: 9px;
-  --radius-md: 18px;
+  --ink-900: #19120c;
+  --ink-700: #2d2116;
+  --ink-500: #584835;
+  --paper-100: #fcf9f2;
+  --paper-200: #f4ecdc;
+  --paper-300: #e7d8bd;
+  --paper-card: rgba(254, 251, 245, 0.94);
+  --paper-card-inner: rgba(255, 254, 250, 0.9);
+  --cinnabar: #9e2a14;
+  --cinnabar-dark: #7f1e0d;
+  --cinnabar-light: rgba(158, 42, 20, 0.08);
+  --gold: #855d20;
+  --gold-light: rgba(133, 93, 32, 0.1);
+  --bamboo: #3f5a41;
+  --bamboo-light: rgba(63, 90, 65, 0.1);
+  --indigo: #1e3347;
+  --indigo-light: rgba(30, 51, 71, 0.08);
+  --line: rgba(72, 49, 25, 0.15);
+  --line-strong: rgba(72, 49, 25, 0.32);
+  --line-gold: rgba(133, 93, 32, 0.25);
+  --shadow-soft: 0 6px 20px rgba(57, 37, 15, 0.06);
+  --shadow-card: 0 14px 38px rgba(45, 33, 22, 0.08), 0 2px 6px rgba(45, 33, 22, 0.03);
+  --shadow-mount: 0 18px 44px rgba(45, 33, 22, 0.14), 0 0 0 1px rgba(72, 49, 25, 0.12);
+  --radius-sm: 8px;
+  --radius-md: 16px;
   --safe-bottom: env(safe-area-inset-bottom, 0px);
 }
 
 * { box-sizing: border-box; }
 html { min-width: 320px; scroll-behavior: smooth; }
 body {
   margin: 0;
   min-width: 320px;
   min-height: 100vh;
   overflow-x: hidden;
   color: var(--ink-900);
   background:
-    radial-gradient(700px 360px at 8% 0%, rgba(232, 198, 126, 0.32), transparent 72%),
-    radial-gradient(680px 360px at 94% 8%, rgba(191, 161, 99, 0.2), transparent 68%),
-    linear-gradient(180deg, var(--paper-100) 0%, #efe1c1 100%);
+    radial-gradient(760px 420px at 6% 0%, rgba(226, 191, 117, 0.28), transparent 72%),
+    radial-gradient(720px 380px at 94% 6%, rgba(188, 156, 92, 0.18), transparent 68%),
+    radial-gradient(600px 500px at 50% 100%, rgba(214, 187, 137, 0.15), transparent 75%),
+    linear-gradient(180deg, var(--paper-100) 0%, #eee3c8 100%);
   font-family: "STKaiti", "KaiTi", "楷体", "Songti SC", "SimSun", serif;
-  line-height: 1.6;
+  line-height: 1.65;
   -webkit-font-smoothing: antialiased;
 }
 
 button, input, select, textarea { font: inherit; }
 button { touch-action: manipulation; }
 .sr-only {
   position: absolute;
   width: 1px;
   height: 1px;
   padding: 0;
   margin: -1px;
   overflow: hidden;
   clip: rect(0, 0, 0, 0);
   white-space: nowrap;
   border: 0;
 }
 .hidden { display: none !important; }
 
 /* Hero */
 .hero {
   width: min(880px, calc(100% - 32px));
   margin: 0 auto;
-  padding: 34px 0 18px;
+  padding: 38px 0 20px;
   text-align: center;
 }
 .hero-mark {
   display: inline-flex;
   align-items: center;
   justify-content: center;
-  width: 54px;
-  height: 72px;
-  margin-bottom: 10px;
-  color: var(--paper-100);
+  width: 48px;
+  height: 68px;
+  margin-bottom: 12px;
+  color: #fff9f0;
   background: var(--cinnabar);
-  border-radius: 5px 5px 22px 22px;
-  box-shadow: 0 8px 18px rgba(134, 39, 18, 0.18);
+  border: 2px solid rgba(255, 246, 230, 0.7);
+  border-radius: 4px 4px 18px 18px;
+  box-shadow: 0 6px 18px rgba(158, 42, 20, 0.24), inset 0 0 0 1px var(--cinnabar-dark);
   font-size: 13px;
-  letter-spacing: 2px;
+  font-weight: 700;
+  letter-spacing: 3px;
   writing-mode: vertical-rl;
+  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
 }
 .hero-kicker,
 .section-eyebrow {
   margin: 0;
   color: var(--gold);
   font-size: 12px;
   font-weight: 700;
-  letter-spacing: 2px;
+  letter-spacing: 2.5px;
 }
 .hero h1 {
-  margin: 2px 0 7px;
+  margin: 4px 0 8px;
   color: var(--ink-900);
-  font-size: clamp(32px, 5vw, 46px);
+  font-size: clamp(32px, 5vw, 48px);
   font-weight: 700;
   letter-spacing: 8px;
   line-height: 1.15;
 }
 .sub {
   max-width: 620px;
-  margin: 0 auto 14px;
+  margin: 0 auto 16px;
   color: var(--ink-500);
   font-size: 15px;
-  letter-spacing: 1px;
+  letter-spacing: 1.2px;
 }
 .steps-guide {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 12px;
   max-width: 100%;
-  padding: 6px 15px;
-  border: 1px dashed var(--line-strong);
+  padding: 6px 18px;
+  border: 1px solid var(--line-gold);
   border-radius: 999px;
-  background: rgba(255, 253, 247, 0.52);
+  background: rgba(255, 253, 248, 0.76);
+  box-shadow: 0 2px 8px rgba(72, 49, 25, 0.04);
   color: var(--ink-500);
   font-size: 12px;
 }
-.step-item b { color: var(--cinnabar); font-size: 11px; letter-spacing: 1px; }
+.step-item b { color: var(--cinnabar); font-size: 11px; letter-spacing: 1.5px; margin-right: 2px; }
 .step-arrow { color: var(--gold); }
 
 /* Main layout */
 .grid {
   display: grid;
   grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
-  gap: 22px;
+  gap: 24px;
   width: min(1100px, calc(100% - 32px));
-  margin: 0 auto 36px;
+  margin: 0 auto 40px;
 }
 .card {
   position: relative;
   min-width: 0;
-  padding: 23px;
+  padding: 26px;
   overflow: hidden;
   border: 1px solid var(--line);
   border-radius: var(--radius-md);
-  background: rgba(253, 249, 240, 0.9);
+  background: var(--paper-card);
   box-shadow: var(--shadow-card);
 }
 .card::before {
   position: absolute;
   inset: 0;
   z-index: 0;
   pointer-events: none;
   content: "";
-  opacity: 0.72;
+  opacity: 0.65;
   background-image:
-    radial-gradient(circle at 12% 17%, rgba(158, 117, 50, 0.09) 0 1px, transparent 1.8px),
-    radial-gradient(circle at 82% 71%, rgba(158, 117, 50, 0.07) 0 1px, transparent 1.8px),
-    radial-gradient(circle at 42% 94%, rgba(158, 117, 50, 0.06) 0 1px, transparent 1.8px);
-  background-size: 72px 72px, 116px 116px, 154px 154px;
+    radial-gradient(circle at 12% 17%, rgba(133, 93, 32, 0.08) 0 1px, transparent 1.8px),
+    radial-gradient(circle at 82% 71%, rgba(133, 93, 32, 0.06) 0 1px, transparent 1.8px),
+    radial-gradient(circle at 42% 94%, rgba(133, 93, 32, 0.05) 0 1px, transparent 1.8px);
+  background-size: 68px 68px, 112px 112px, 148px 148px;
 }
 .card > * { position: relative; z-index: 1; }
 .card-title {
-  margin: 2px 0 15px;
+  margin: 3px 0 16px;
   color: var(--ink-700);
   font-size: 21px;
   letter-spacing: 2px;
   line-height: 1.25;
 }
-.ctrl > .card-title { margin-bottom: 21px; }
+.ctrl > .card-title { margin-bottom: 20px; }
 
 /* Form */
-.field-block { margin-bottom: 15px; }
+.field-block { margin-bottom: 16px; }
 .field-heading {
   display: flex;
   align-items: baseline;
   justify-content: space-between;
   gap: 10px;
   margin-bottom: 9px;
 }
 .field-label { color: var(--ink-700); font-size: 14px; font-weight: 700; }
 .field-hint { color: var(--ink-500); font-size: 12px; }
-.mood-chips { display: flex; flex-wrap: wrap; gap: 7px; }
+.mood-chips { display: flex; flex-wrap: wrap; gap: 8px; }
 .chip,
 button {
   min-height: 44px;
-  padding: 8px 13px;
+  padding: 9px 14px;
   border: 1px solid var(--line);
   border-radius: var(--radius-sm);
-  background: rgba(255, 252, 244, 0.9);
+  background: rgba(255, 252, 244, 0.92);
   color: var(--ink-900);
   cursor: pointer;
-  transition: background-color .18s ease, border-color .18s ease, color .18s ease, transform .18s ease, box-shadow .18s ease;
-}
-.chip { min-height: 38px; padding: 5px 12px; color: var(--ink-700); font-size: 13px; }
+  transition: background-color .16s ease, border-color .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease;
+}
+.chip {
+  min-height: 44px;
+  padding: 8px 14px;
+  color: var(--ink-700);
+  font-size: 13px;
+  letter-spacing: 1px;
+}
 .chip:hover,
 .chip[aria-pressed="true"] {
   border-color: var(--cinnabar);
   background: var(--cinnabar);
   color: #fffaf2;
-  box-shadow: 0 4px 12px rgba(166, 52, 27, 0.16);
-}
-.chip:active, button:active:not(:disabled) { transform: translateY(1px); }
-.text-input-wrap { display: block; margin-top: 9px; }
+  box-shadow: 0 4px 12px rgba(158, 42, 20, 0.2);
+}
+.chip:active, button:active:not(:disabled) { transform: translateY(1px) scale(0.99); }
+.text-input-wrap { display: block; margin-top: 10px; }
 input, select, textarea {
   width: 100%;
   min-width: 0;
   border: 1px solid var(--line);
   border-radius: var(--radius-sm);
   outline: none;
-  background: rgba(255, 253, 248, 0.96);
+  background: var(--paper-card-inner);
   color: var(--ink-900);
 }
-input, select { min-height: 44px; padding: 8px 12px; }
-textarea { padding: 10px 12px; resize: vertical; line-height: 1.65; }
-input::placeholder, textarea::placeholder { color: #9b8b73; }
+input, select { min-height: 44px; padding: 9px 12px; font-size: 14px; }
+textarea { padding: 11px 13px; resize: vertical; line-height: 1.65; }
+input::placeholder, textarea::placeholder { color: #998870; }
 input:focus, select:focus, textarea:focus {
   border-color: var(--cinnabar);
-  box-shadow: 0 0 0 3px rgba(166, 52, 27, 0.14);
-}
-.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 13px; }
-.row { display: flex; align-items: center; gap: 10px; min-width: 0; margin: 9px 0; }
-.row > span { flex: 0 0 64px; color: var(--ink-700); font-size: 13px; font-weight: 700; }
-.author-row { margin-top: 4px; }
-.generate-btn { width: 100%; margin-top: 10px; font-weight: 700; letter-spacing: 2px; }
+  box-shadow: 0 0 0 3px rgba(158, 42, 20, 0.14);
+}
+.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
+.row { display: flex; align-items: center; gap: 10px; min-width: 0; margin: 10px 0; }
+.row > span { flex: 0 0 66px; color: var(--ink-700); font-size: 13px; font-weight: 700; }
+.author-row { margin-top: 6px; }
+.generate-btn {
+  width: 100%;
+  min-height: 48px;
+  margin-top: 12px;
+  font-size: 15px;
+  font-weight: 700;
+  letter-spacing: 2.5px;
+}
 button.primary {
   border-color: var(--cinnabar);
   background: var(--cinnabar);
   color: #fffaf2;
-  box-shadow: 0 6px 16px rgba(166, 52, 27, 0.2);
+  box-shadow: 0 6px 18px rgba(158, 42, 20, 0.22);
 }
 button.primary:hover:not(:disabled) { border-color: var(--cinnabar-dark); background: var(--cinnabar-dark); }
-button.ghost { border-color: var(--cinnabar); color: var(--cinnabar); background: transparent; }
-button.ghost:hover:not(:disabled) { background: rgba(166, 52, 27, 0.08); }
-button:hover:not(:disabled) { border-color: var(--line-strong); background: #f7ecd4; box-shadow: var(--shadow-soft); }
+button:hover:not(:disabled) { border-color: var(--line-strong); background: #f7eed8; box-shadow: var(--shadow-soft); }
 button:disabled { cursor: not-allowed; opacity: .55; }
 button:focus-visible, summary:focus-visible, a:focus-visible {
   outline: 2px solid var(--cinnabar);
   outline-offset: 3px;
 }
-.microcopy { margin: 9px 0 0; color: var(--ink-500); font-size: 12px; text-align: center; }
+.microcopy { margin: 10px 0 0; color: var(--ink-500); font-size: 12px; text-align: center; }
 
 /* Result copy */
 .result-divider {
   display: flex;
   align-items: center;
   gap: 12px;
-  margin: 20px 0 15px;
+  margin: 22px 0 16px;
   color: var(--gold);
   font-size: 15px;
 }
 .result-divider::before, .result-divider::after { flex: 1; height: 1px; background: var(--line); content: ""; }
 .result-divider span { line-height: 1; }
 .result-heading { display: flex; align-items: end; justify-content: space-between; gap: 14px; }
 .result-heading .card-title { margin-bottom: 0; }
 .paper-title {
   display: inline-block;
-  padding: 4px 9px;
+  padding: 3px 10px;
+  border: 1px solid var(--line-gold);
   border-radius: 999px;
-  background: rgba(158, 117, 50, 0.11);
+  background: var(--gold-light);
   color: var(--gold);
   font-size: 12px;
-  letter-spacing: 1px;
+  letter-spacing: 1.5px;
   white-space: nowrap;
 }
 .poem-preview-box {
-  margin-top: 12px;
-  padding: 17px 16px 14px;
-  border: 1px solid var(--line);
-  border-radius: var(--radius-sm);
-  background: rgba(255, 253, 247, 0.84);
-  box-shadow: inset 0 2px 8px rgba(0, 0, 0, .025);
-}
-.poem-title { margin: 0 0 11px; color: var(--cinnabar); font-size: 17px; letter-spacing: 2px; text-align: center; }
-.poem { display: flex; flex-direction: column; align-items: center; gap: 5px; min-height: 120px; }
+  position: relative;
+  margin-top: 14px;
+  padding: 20px 18px 16px;
+  border: 1px solid var(--line-gold);
+  border-radius: var(--radius-sm);
+  background: var(--paper-card-inner);
+  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6), 0 3px 10px rgba(72, 49, 25, 0.03);
+}
+.poem-title { margin: 0 0 13px; color: var(--cinnabar); font-size: 18px; letter-spacing: 3px; text-align: center; }
+.poem { display: flex; flex-direction: column; align-items: center; gap: 6px; min-height: 120px; }
 .poem .line {
   color: var(--ink-900);
-  font-size: 19px;
-  letter-spacing: 4px;
-  line-height: 1.45;
+  font-size: 20px;
+  letter-spacing: 4.5px;
+  line-height: 1.5;
   animation: lineIn .36s ease both;
 }
 .poem .line:nth-child(2) { animation-delay: .04s; }
 .poem .line:nth-child(3) { animation-delay: .08s; }
 .poem .line:nth-child(4) { animation-delay: .12s; }
 @keyframes lineIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
-.interpretation { margin: 14px 0 5px; color: var(--ink-700); font-size: 13px; }
-.source-note { margin: 0; color: var(--ink-500); font-size: 11px; }
-.source-note a { color: var(--bamboo); }
-.note-details { margin-top: 15px; padding: 9px 12px 12px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: rgba(253, 250, 242, .78); }
+.interpretation { margin: 16px 0 6px; color: var(--ink-700); font-size: 13.5px; line-height: 1.6; }
+.source-note { margin: 0; color: var(--ink-500); font-size: 11.5px; }
+.source-note a { color: var(--bamboo); text-decoration: none; border-bottom: 1px dotted var(--bamboo); }
+.source-note a:hover { color: var(--cinnabar); border-bottom-color: var(--cinnabar); }
+.note-details { margin-top: 16px; padding: 10px 14px 14px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: rgba(253, 250, 242, .85); }
 .note-details summary { color: var(--ink-700); cursor: pointer; font-size: 13px; font-weight: 700; }
-.note-details textarea { display: block; min-height: 205px; margin-top: 9px; font-size: 12px; }
+.note-details textarea { display: block; min-height: 205px; margin-top: 10px; font-size: 12.5px; }
 
 /* Canvas and result actions */
 .preview { align-self: start; }
 .preview-header { display: flex; align-items: end; justify-content: space-between; gap: 12px; width: 100%; }
 .preview-header .card-title { margin-bottom: 0; }
-.preview-tag { color: var(--gold); font-size: 12px; white-space: nowrap; }
-.challenge-hint { width: 100%; margin: 11px 0 0; padding: 8px 10px; border-left: 3px solid var(--cinnabar); background: rgba(166, 52, 27, .07); color: var(--ink-700); font-size: 12px; text-align: left; }
-.canvas-wrap { width: 100%; max-width: 500px; margin: 16px auto 0; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: var(--paper-200); box-shadow: 0 16px 38px rgba(57, 37, 15, .18); }
-canvas { display: block; width: 100%; height: auto; aspect-ratio: 3 / 4; }
-.hint { max-width: 500px; margin: 10px auto 0; color: var(--ink-500); font-size: 12px; text-align: center; }
-.result-actions { display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr; gap: 7px; width: 100%; max-width: 500px; margin: 13px auto 0; }
-.result-actions button { min-width: 0; padding: 8px 7px; font-size: 12px; }
+.preview-tag { color: var(--gold); font-size: 12px; letter-spacing: 1px; white-space: nowrap; }
+.challenge-hint {
+  width: 100%;
+  margin: 12px 0 0;
+  padding: 8px 12px;
+  border-left: 3px solid var(--cinnabar);
+  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
+  background: var(--cinnabar-light);
+  color: var(--ink-700);
+  font-size: 12px;
+  text-align: left;
+}
+.canvas-wrap {
+  width: 100%;
+  max-width: 500px;
+  margin: 18px auto 0;
+  padding: 6px;
+  overflow: hidden;
+  border: 1px solid var(--line-strong);
+  border-radius: 14px;
+  background: #ede3cc;
+  box-shadow: var(--shadow-mount);
+}
+canvas { display: block; width: 100%; height: auto; aspect-ratio: 3 / 4; border-radius: 8px; }
+.hint { max-width: 500px; margin: 12px auto 0; color: var(--ink-500); font-size: 12px; text-align: center; }
+
+/* Action button hierarchy */
+.result-actions {
+  display: grid;
+  grid-template-columns: 1.15fr 1fr 1fr 1fr;
+  gap: 8px;
+  width: 100%;
+  max-width: 500px;
+  margin: 14px auto 0;
+}
+.result-actions button {
+  min-width: 0;
+  min-height: 44px;
+  padding: 8px 6px;
+  font-size: 12.5px;
+  letter-spacing: 0.5px;
+}
+#download {
+  border-color: var(--cinnabar);
+  background: var(--cinnabar);
+  color: #fffaf2;
+  font-weight: 700;
+  box-shadow: 0 4px 14px rgba(158, 42, 20, 0.2);
+}
+#download:hover:not(:disabled) {
+  border-color: var(--cinnabar-dark);
+  background: var(--cinnabar-dark);
+}
+#reroll {
+  border-color: var(--line-gold);
+  background: rgba(255, 252, 244, 0.95);
+  color: var(--ink-900);
+}
+#reroll:hover:not(:disabled) {
+  border-color: var(--gold);
+  background: #f7eed8;
+}
+#copyNote {
+  border-color: var(--line);
+  background: rgba(255, 252, 244, 0.95);
+  color: var(--ink-700);
+}
+#copyNote:hover:not(:disabled) {
+  border-color: var(--indigo);
+  color: var(--indigo);
+  background: #f0f4f7;
+}
+#invite {
+  border-color: rgba(63, 90, 65, 0.35);
+  background: rgba(255, 252, 244, 0.95);
+  color: var(--bamboo);
+}
+#invite:hover:not(:disabled) {
+  border-color: var(--bamboo);
+  background: var(--bamboo-light);
+}
 
 /* History */
-.history-panel { width: 100%; max-width: 500px; margin: 22px auto 0; padding-top: 15px; border-top: 1px dashed var(--line-strong); }
+.history-panel { width: 100%; max-width: 500px; margin: 22px auto 0; padding-top: 16px; border-top: 1px dashed var(--line-strong); }
 .history-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
-.history-header h3 { margin: 0; color: var(--ink-700); font-size: 15px; letter-spacing: 1px; }
-.text-button { min-height: 34px; padding: 4px 8px; border: 0; background: transparent; color: var(--cinnabar); font-size: 12px; }
-.text-button:hover:not(:disabled) { background: rgba(166, 52, 27, .08); box-shadow: none; }
-.history-list { display: grid; gap: 6px; margin-top: 9px; }
-.history-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; min-height: 44px; padding: 7px 9px; border: 1px solid var(--line); border-radius: 7px; background: rgba(255, 253, 247, .62); text-align: left; }
+.history-header h3 { margin: 0; color: var(--ink-700); font-size: 15px; letter-spacing: 1.5px; }
+.text-button { min-height: 44px; padding: 4px 10px; border: 0; background: transparent; color: var(--cinnabar); font-size: 12px; }
+.text-button:hover:not(:disabled) { background: var(--cinnabar-light); box-shadow: none; }
+.history-list { display: grid; gap: 7px; margin-top: 10px; }
+.history-item {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 10px;
+  width: 100%;
+  min-height: 44px;
+  padding: 8px 12px;
+  border: 1px solid var(--line);
+  border-radius: 7px;
+  background: rgba(255, 253, 248, 0.75);
+  text-align: left;
+}
 .history-item:hover { border-color: var(--gold); }
-.history-item strong { overflow: hidden; color: var(--ink-700); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
-.history-item span { flex: 0 0 auto; color: var(--ink-500); font-size: 11px; }
-
-footer { padding: 4px 16px calc(25px + var(--safe-bottom)); color: var(--ink-500); font-size: 12px; text-align: center; }
+.history-item strong { overflow: hidden; color: var(--ink-700); font-size: 13px; letter-spacing: 0.5px; text-overflow: ellipsis; white-space: nowrap; }
+.history-item span { flex: 0 0 auto; color: var(--ink-500); font-size: 11.5px; }
+
+footer { padding: 6px 16px calc(26px + var(--safe-bottom)); color: var(--ink-500); font-size: 12px; letter-spacing: 1px; text-align: center; }
 footer p { margin: 0; }
 
 @media (max-width: 880px) {
   .grid { grid-template-columns: 1fr; max-width: 680px; }
   .preview { order: 2; }
 }
 
 @media (max-width: 560px) {
-  .hero { width: min(100% - 24px, 520px); padding-top: 20px; }
+  .hero { width: min(100% - 24px, 520px); padding-top: 22px; }
   .hero-mark { width: 46px; height: 60px; margin-bottom: 7px; font-size: 12px; }
   .hero h1 { font-size: 32px; letter-spacing: 6px; }
-  .sub { font-size: 13px; line-height: 1.55; }
+  .sub { font-size: 13.5px; line-height: 1.55; }
   .steps-guide { gap: 7px; padding: 5px 9px; font-size: 11px; }
   .grid { width: calc(100% - 24px); gap: 14px; margin-bottom: 23px; }
   .card { padding: 17px 14px; border-radius: 14px; }
   .form-grid { display: block; }
   .row { gap: 8px; }
   .row > span { flex-basis: 59px; font-size: 12px; }
-  .result-actions { grid-template-columns: 1fr 1fr; }
+  .result-actions { grid-template-columns: 1fr 1fr; gap: 8px; }
   .result-actions button { min-height: 46px; font-size: 13px; }
   .canvas-wrap { margin-top: 13px; }
-  .poem .line { font-size: 17px; letter-spacing: 3px; }
+  .poem .line { font-size: 18px; letter-spacing: 3.5px; }
 }
 
 @media (max-width: 360px) {
   .hero { width: calc(100% - 18px); }
-  .hero h1 { font-size: 29px; letter-spacing: 4px; }
+  .hero h1 { font-size: 28px; letter-spacing: 4px; }
   .steps-guide { gap: 4px; padding-inline: 6px; }
   .step-arrow { display: none; }
   .grid { width: calc(100% - 16px); }
   .card { padding-inline: 11px; }
-  .chip { padding-inline: 9px; }
+  .chip { padding-inline: 10px; font-size: 12.5px; }
   .preview-tag { font-size: 10px; }
 }
 
 @media (prefers-reduced-motion: reduce) {
   html { scroll-behavior: auto; }
   *, *::before, *::after {
     animation-duration: .01ms !important;
     animation-iteration-count: 1 !important;
     transition-duration: .01ms !important;
   }
 }
```

---

## 4. 验收清单

### A. 桌面端 (1100px+) 验收重点
1. **视觉流转与画框装裱**：
   - Hero 区域印章（`hero-mark`）呈现微凹朱砂金边质感，三步指引（`steps-guide`）呈雅致金线环绕。
   - 右侧 Canvas 预览容器呈现「外宣内绢」装裱微阴影（`--shadow-mount`），与左侧「今日落墨」表单与笺心形成虚实相生的艺术平衡。
2. **操作层级权重**：
   - `保存诗签图` 独占主视觉朱砂色；`换一签` 为素宣金框；`复制文案` 呈黛墨色调；`邀请同题` 呈幽竹青绿描边，四键操作意图层次分明且全部满足 44px+ 最小高度。
3. **笺心排版美感**：
   - 诗文四句呈现 20px 楷体大字，4.5px 疏朗字距与淡雅乌丝栏边线；出处链接与解读对比度充足（> 4.5:1）。

### B. 430px / 390px (主流大屏手机，如 iPhone 14/15/16 Pro Max)
1. **双栏自适应下折**：页面自动转为单列，左侧表单与笺心在上，右侧画幅在下（`order: 2`）。
2. **底部操作 2×2 栅格矩阵**：按钮高度自动提升至 46px，手指单手大拇指区域点按轻松、无误触。
3. **心境标签排布**：9 个心境胶囊整齐流动排列，选中态（`aria-pressed="true"`）呈现朱砂印泥饱和度并伴随微光晕。

### C. 375px (经典移动端宽度，如 iPhone SE 2/3 / iPhone 12 mini)
1. **行内表单对齐**：意象类别、文化意象、诗签字数、视觉底色 4 项表单标题（59px 固定宽度）与下拉框水平对齐紧凑，无截断或折行。
2. **笺心诗句自适应**：七言诗句自动以 18px 呈现，保证单行完整排开不换行，字距保持雅致中式韵律。

### D. 320px (超窄屏极限测试，如 iPhone SE 1st gen)
1. **零横向滚动条**：`body` 与 `html` 严格无溢出（`overflow-x: hidden`，容器外边距自动收紧至 8px）。
2. **步骤指引与标题精简**：`.steps-guide` 自动隐藏分隔箭头 `—`，大标题平滑缩放至 28px（字距 4px），心境按钮与操作按钮依然保持 ≥ 44px 舒适可点击面积。

### E. 无障碍与自检合规
1. **自动化自检测试**：所有 DOM ID、标签属性、表单 option 选项与 Canvas 规格完全保持，可通过 `node scripts/selfcheck.js` 259 项检验。
2. **减弱动态（prefers-reduced-motion）**：开启减弱动画时，诗句淡入（`animation`）与按钮平移（`transition`）瞬间就位，杜绝眩晕感。
