# 参赛提交清单

## 作品名

一念成笺 · 国风诗签

## 一句话介绍

把此刻心情与文化意象写入确定性诗签引擎，一键生成四句国风诗、3:4 视觉卡片和可分享文案。

## 参赛对应

- 以小红书 Vibecoding 主题为发布场景，作品可作为小工具上传并挂载到笔记。
- 国风方向：使用 `#国风vibecoding`，并在笔记中 `@科技薯`。
- 数字艺术方向：使用 `#小红书vibecoding大赛` 与 `#vibeart`，展示可交互的诗签生成与 Canvas 出图。

## 提交物

1. 生产包：`release/yinian-chengjian-xhs.zip`
2. 在线 Demo：部署 `release` 解压后的四个文件即可
3. 作品截图：发布前从桌面端与移动端各截一张
4. 笔记正文：`docs/NOTE.md`
5. 源码与说明：本仓库及 `README.md`

## 发布步骤

1. 运行 `node .\scripts\selfcheck.js`，确认自检通过。
2. 运行 `powershell -ExecutionPolicy Bypass -File .\scripts\package-xhs.ps1`。
3. 上传 `release/yinian-chengjian-xhs.zip`，或将其中四个文件部署为静态网页。
4. 在小红书笔记中挂载工具链接和作品图。
5. 复制 `docs/NOTE.md`，保留以下账号与话题：

```text
@科技薯
#国风vibecoding #小红书vibecoding大赛 #vibeart
#vibecoding #小红书小工具 #国风诗签
```

## 验收要点

- 生成结果始终为四句，支持五言与七言；第二句和第四句来自同一韵组。
- 同样的关键词、心境、意象、字数和换签次数可复现；点击「换一签」才改变 seed。
- Canvas 物理输出为 1200×1600，竖排首句在最右侧，移动端 320px 宽度不横向溢出。
- 无账号、无定位、无 API Key、无网络请求；输入仅在本地生成和保存。
- 生产包不包含 Git、文档、测试截图、Gemini 辅助文件、备份与日志。
