# 让 Antigravity CLI 通过本机代理完成 Google OAuth 登录。
# 运行：powershell -ExecutionPolicy Bypass -File .\scripts\login-gemini.ps1
$ErrorActionPreference = 'Stop'
$env:HTTP_PROXY = if ($env:HTTP_PROXY) { $env:HTTP_PROXY } else { 'http://127.0.0.1:10808' }
$env:HTTPS_PROXY = if ($env:HTTPS_PROXY) { $env:HTTPS_PROXY } else { 'http://127.0.0.1:10808' }
$env:NO_PROXY = if ($env:NO_PROXY) { $env:NO_PROXY } else { 'localhost,127.0.0.1' }
$agy = 'C:\Users\skr\AppData\Local\agy\bin\agy.exe'
if (-not (Test-Path -LiteralPath $agy)) { throw "Antigravity CLI not found: $agy" }
Write-Host "HTTP_PROXY=$env:HTTP_PROXY"
Write-Host "HTTPS_PROXY=$env:HTTPS_PROXY"
Write-Host '启动 Google OAuth；浏览器完成登录后退出 CLI。'
& $agy --mode plan --prompt-interactive='请先完成 Google 登录；登录成功后回复“已登录”。'
exit $LASTEXITCODE
