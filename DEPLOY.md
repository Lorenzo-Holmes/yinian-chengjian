# 部署一念成笺

这是一个静态网页，无构建命令、无环境变量、无后端服务。

## 本地预览

```powershell
python -m http.server 5173
```

打开 `http://127.0.0.1:5173/`，或直接双击 `index.html` 使用离线基础功能。

## 上传生产包

先执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-xhs.ps1
```

上传 `release/yinian-chengjian-xhs.zip`，解压后把根目录内容作为静态站点发布。压缩包只包含页面、样式、生成引擎和本地 favicon。

## Vercel / Netlify / Pages

选择静态站点或 Other，不填写构建命令和输出目录；将生产包解压目录作为站点根目录即可。

## 发布前检查

- 页面可在桌面端、320px 移动宽度和 `file://` 下打开；
- 生成、换签、保存图片、复制文案和同题邀请均可操作；
- 话题与账号使用 `docs/NOTE.md` 中的统一版本；
- 不在站点目录放入 API Key、日志、Git 目录或开发备份。
