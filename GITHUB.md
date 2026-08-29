# 推到 GitHub（拿到仓库链接 = 第二份参赛凭证）

## 1. 在 GitHub 新建空仓
打开 https://github.com/new ，名字例如 `guofeng-vibecoding-studio`，**不要勾** Add README / .gitignore / license（本地已有）。

## 2. 推送
```powershell
cd D:\xhs\guofeng-vibecoding-studio
git remote add origin https://github.com/<你的用户名>/guofeng-vibecoding-studio.git
git push -u origin main
```

## 3. 仓库链接
成功后你能拿到：
- **仓库地址**：`https://github.com/<你>/guofeng-vibecoding-studio`
- **在线 Demo**：再丢到 Vercel（见 DEPLOY.md），拿到 `https://xxx.vercel.app`

## 4. 小红书笔记里两份都贴
```
🔗 在线试玩：https://xxx.vercel.app
📦 源码仓库：https://github.com/<你>/guofeng-vibecoding-studio
#vibecoding #vibecoding大赛 #国风 #小红书国风季 #AI写诗
```

## 5. （可选）用 gh CLI 一把梭
```powershell
gh repo create guofeng-vibecoding-studio --public --source=. --remote=origin --push
```
