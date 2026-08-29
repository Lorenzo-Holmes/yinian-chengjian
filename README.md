# 国风诗签 · Vibecoding Studio

> 输入心情 → 自动成诗、出图、生成小红书笔记文案。
> 一次参赛，两大赛事同时打：**#vibecoding 里的国风世界** + **#小红书 vibecoding 大赛**。

## 它是什么
一个**纯前端 / 零后端 / 零依赖**的网页小工具：
1. 内置词牌（五言仄起 / 七言平起）与意象库 → 离线生成"伪七绝/五绝"。
2. 用 `<canvas>` 直接渲染一张可下载的国风诗签（宣纸底、洒金、双线边框、竖排、朱印、落款）。
3. 自动生成可一键复制的小红书笔记文案，附上两个赛事的话题标签。

## 为什么"vibecoding"
"vibe coding" = 用自然语言描述意图，由 AI 生成代码；这个项目本身就是它的产物：
- 我用一段 prompt 描述"国风诗签生成器"，让模型一次性输出整份可运行的代码。
- 运行后，用户再"用 vibe 写诗，用 code 出图"——两件事合在一起，就是参赛主题"vibecoding 里的国风世界"。

## 目录结构
```
guofeng-vibecoding-studio/
├─ index.html      # 页面骨架
├─ styles.css      # 国风样式（宣纸 / 米色 / 朱砂）
├─ app.js          # 词牌 + 诗生成 + Canvas 出图 + 笔记生成
├─ assets/         # （预留）题图 / 截图
├─ docs/
│  ├─ NOTE.md      # 小红书发布笔记模板
│  └─ SUBMIT.md    # 参赛提交说明
├─ README.md
└─ .gitignore
```

## 本地运行
任意静态服务器即可，例如：
```bash
# 方式一：Python
python -m http.server 5173

# 方式二：Node
npx serve .
```
然后浏览器打开 `http://localhost:5173/`。

> 也可以直接双击 `index.html`（`file://` 协议）—— 全程无网络请求。

## 部署（Vercel / Netlify / Pages）
直接把整个目录拖上去就行。无构建步骤。

## 提交到两个赛事
1. 把生成的诗签图保存 → 作为小红书笔记的配图。
2. 复制 `docs/NOTE.md` 文案 → 作为笔记正文。
3. 发布时打标签：`#vibecoding #vibecoding大赛 #国风 #小红书国风季 #AI写诗 #诗签`

## 路线图（可选）
- 接入 LLM API 真正生成"对仗工整"的七律
- 支持自定义字号、印章、字体（WebFont）
- 一键长图（适配小红书 3:4 / 1:1）

## ✨ Gemini 优化前端（已内置）
页面右下角"✨ Gemini 优化前端"按钮会打开一个面板：
1. 填入你的 **Gemini API Key**（仅存 `localStorage`，不外发）。
2. 选模型（默认 `gemini-2.5-flash`），可写附加要求。
3. 点 **🚀 开始优化** → 把当前三份文件打包发给 Gemini，返回 JSON 三件套。
4. 点 **✅ 应用到当前页面** → 就地替换 DOM / 样式 / 脚本（不会写回磁盘）。
5. 点 **📋 复制结果** → 拿到三份完整源码，可粘贴回工程目录。

## 🚀 一键调 Gemini 重写 v2（可选）
不想手动填 API Key？用 CLI 脚本：

```powershell
$env:GEMINI_API_KEY="AIza..."                  # 必填
$env:GEMINI_MODEL="gemini-2.5-flash"           # 可选
$env:GEMINI_TEMP="0.4"                          # 可选
$env:GEMINI_EXTRA="按钮加水墨涟漪；卡片加宣纸纹理" # 可选
node scripts/gemini_rewrite.js
```

完成后 `index.html / styles.css / app.js` 会被覆写为 Gemini 优化版，旧版自动备份成 `*.bak`。
不满意：`git checkout -- index.html styles.css app.js` 还原。


## 🚀 部署（Vercel / Netlify）
参见 [DEPLOY.md](./DEPLOY.md)。最简：拖目录到 https://vercel.com/new → 30 秒拿到 *.vercel.app 链接 → 贴回小红书。

