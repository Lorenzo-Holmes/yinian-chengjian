# 一键部署到 Vercel

## 方式 A：网页拖拽（最简单）
1. 打开 https://vercel.com/new
2. 把 `guofeng-vibecoding-studio/` **整个目录**拖进上传区
3. 框架选 `Other`，无构建命令
4. 点 Deploy，30 秒后给你一个 `https://guofeng-vibecoding-studio-xxx.vercel.app`
5. 把链接贴到小红书笔记 = 完成"提交作品"

## 方式 B：CLI
```powershell
npm i -g vercel
cd D:\xhs\guofeng-vibecoding-studio
vercel        # 首次会要登录；按提示选 scope
vercel --prod # 部署到生产
```

## 方式 C：Netlify Drop
打开 https://app.netlify.com/drop → 拖目录 → 立即拿到 `https://xxx.netlify.app`

---

## 关于 Gemini API Key 的部署提示
- 默认情况下部署是公开的。**不要**把 Key 写进仓库或 `vercel.json`。
- 浏览器内"✨ Gemini 优化前端"面板会把 Key 存到 `localStorage`（仅当前浏览器）。
- 想要"后端代理"保护 Key，建议加一个 Vercel Serverless Function（env 存 GEMINI_API_KEY），但本项目刻意保持零后端参赛用。
