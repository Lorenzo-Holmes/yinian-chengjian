# 一念成笺 · 国风诗签

> 把此刻心情，化成一张可收藏、可分享、可同题挑战的国风诗签。

## 项目定位

「一念成笺」是一个面向小红书 Vibecoding 主题的静态网页小工具。用户选择心境、文化意象与五/七言诗签，输入落款后即可得到：

- 起景、承情、转意、合境四句结构化诗签；
- 3:4 国风 Canvas 卡片（物理尺寸 1200×1600）；
- 签语解读、落款与日期；
- 可保存图片、复制分享文案、邀请朋友同题生成；
- 最近 12 张诗签的本地恢复记录。

四类意象包含「山水｜节气｜雅器｜志怪」，每类提供松风、谷雨、团扇、青鸟等本地词库。诗签由关键词、心境、主题、字数和换签次数生成确定性 seed；相同参数可复现，换签才会改变结果。

## 技术约束

- 纯 HTML / CSS / JavaScript，零 npm、零框架、零后端；
- 无外部字体、图片、CDN、API、账号与数据上传；
- `file://` 双击可使用，静态服务器与小红书 WebView 可打开；
- 用户输入只保留汉字并通过 `textContent` 渲染；
- Canvas 使用本地视觉纹理，不依赖网络素材；
- `localStorage` 仅保存最近诗签的必要文本与 seed 信息。

## 本地运行

直接双击 `index.html`，或在项目目录启动任意静态服务器：

```powershell
python -m http.server 5173
```

然后打开 `http://127.0.0.1:5173/`。

## 自检、生产打包

项目不需要依赖安装。运行自检：

```powershell
node .\scripts\selfcheck.js
```

生成生产包（脚本会先运行自检；自检失败则停止）：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-xhs.ps1
```

生产包位于 `release/yinian-chengjian-xhs.zip`，根目录只包含：

```text
index.html
styles.css
app.js
assets/favicon.svg
```

仓库中的文档、测试脚本和开发辅助文件不进入生产压缩包。

## 小红书参赛发布

1. 打开工具，选择一个心境与文化意象，输入落款并生成诗签。
2. 点击「保存诗签图」，把 PNG 作为笔记配图。
3. 点击「复制文案」，把生成内容粘贴到笔记正文。
4. 在笔记中保留以下统一话题与账号：

```text
@科技薯
#国风vibecoding #小红书vibecoding大赛 #vibeart
#vibecoding #小红书小工具 #国风诗签
```

## 目录

```text
guofeng-vibecoding-studio/
├─ index.html
├─ styles.css
├─ app.js
├─ assets/favicon.svg
├─ scripts/selfcheck.js
├─ scripts/package-xhs.ps1
├─ docs/NOTE.md
├─ docs/SUBMIT.md
└─ release/yinian-chengjian-xhs.zip
```
