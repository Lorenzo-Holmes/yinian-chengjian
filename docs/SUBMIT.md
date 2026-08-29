# 参赛提交清单（两个赛事通用）

## 作品名
国风诗签 · Vibecoding Studio

## 一句话介绍
一个 vibe 出来的"国风诗签生成器"：输入心情 → 自动成诗 + 出图 + 生成小红书笔记文案。

## 同时覆盖
- 赛事 A：vibecoding 里的国风世界（小红书国风季）
- 赛事 B：薯和大…小红书 vibecoding 大赛

## 提交物
1. **可运行 Demo**
   - 本地：`python -m http.server 5173` → 打开 `http://localhost:5173/`
   - 或部署到 Vercel / Netlify（无构建步骤，直接拖目录）
2. **作品截图**：`docs/screenshot.png`（发布前手动截 1 张）
3. **小红书笔记正文**：`docs/NOTE.md`
4. **标签**：`#vibecoding #vibecoding大赛 #国风 #小红书国风季 #AI写诗 #诗签`

## 关键体验点
- 0 启动成本：双击 `index.html` 即可
- 基础功能全程本地：关键词不外发；Gemini 面板仅在用户主动调用时发送源码
- 0 学习成本：所见即所得，一键下载 PNG
- 4 句绝句：五言 / 七言切换后仍保持 4 句与对应字数
- 高分屏适配：Canvas 按 2x 高清绘制，移动端单列布局
