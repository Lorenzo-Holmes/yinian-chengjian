#!/usr/bin/env python3
"""Call the local Gemini MCP bridge with the current frontend sources.

This client is intentionally dependency-free. It sends a read-only review
request through the installed gemini-cli-bridge and writes the response to
GEMINI_MCP_REVIEW.md for the next implementation step.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
SERVER_CANDIDATES = [
    candidate
    for candidate in (
        os.environ.get("GEMINI_MCP_SERVER", ""),
        r"D:\AI\CodexWorkspaces\2026-08-09\q\mcp-servers\gemini-cli-bridge\server.py",
        r"C:\Users\skr\Documents\Codex\2026-08-09\q\mcp-servers\gemini-cli-bridge\server.py",
    )
    if candidate
]
SERVER = next((Path(p) for p in SERVER_CANDIDATES if Path(p).is_file()), None)
PYTHON = Path(os.environ.get("GEMINI_MCP_PYTHON", r"C:\Users\skr\anaconda3\python.exe"))
AGY = Path(os.environ.get("AGY_PATH", r"C:\Users\skr\AppData\Local\agy\bin\agy.exe"))
# Keep the generated report at project root: some managed runners allow
# edits to existing docs files but deny creating new files in subdirectories.
OUTPUT = ROOT / "GEMINI_MCP_REVIEW.md"


def read_sources() -> dict[str, str]:
    return {
        name: (ROOT / name).read_text(encoding="utf-8")
        for name in ("index.html", "styles.css", "app.js", "gemini.js")
    }


def prompt_for(sources: dict[str, str]) -> str:
    return """你是资深前端工程师、中文国风视觉设计师和可访问性专家。

请审查并优化本地项目「国风诗签 · Vibecoding Studio」，目标是让它更适合小红书 vibecoding 国风赛事：首屏更有记忆点、移动端更顺手、生成反馈更清晰、国风视觉更统一，同时不破坏已有功能。

已有功能必须全部保留：
1. 输入 mood、选择 cipai、点击/回车生成诗；
2. poem 区域展示诗句；Canvas seal 绘制竖排诗签；download 下载 PNG；
3. copyNote 复制小红书笔记；
4. openGemini 打开 Gemini 面板，gmRun 调用 Gemini，gmApply 应用临时结果，gmCopy 复制结果；
5. 纯前端、零 npm 依赖、无外部图片/字体/CDN，离线打开也能使用基础功能。

请重点审查并给出可直接落地的修改：
- 视觉层级：国风宣纸/水墨/朱砂/留白，避免普通模板感；
- 首屏转化：用户 3 秒内理解“输入心情→生成诗签→下载/分享”；
- 五言/七言的内容与布局是否稳定；
- 诗句展示和 Canvas 在小屏上的溢出；
- 按钮 loading、成功/失败 toast、键盘焦点、Escape 关闭、prefers-reduced-motion；
- DOM 注入/XSS 风险（不要把用户输入直接作为 HTML）；
- Gemini API Key 只存浏览器本地，不写入文件或日志；
- CSS 复杂度、颜色对比度、可维护性。

输出必须包含以下 5 个部分，控制在 12000 字以内：
## 1. P0/P1 问题清单（按优先级）
## 2. 设计方向（颜色、排版、动效、信息架构）
## 3. 精确改动（按 index.html / styles.css / app.js / gemini.js 分组；给出可复制的代码片段或 unified diff）
## 4. 验收清单（桌面、移动、键盘、无障碍、离线）
## 5. 推荐的最终页面文案

不要假设可以安装依赖，不要建议使用外部资源。以下是当前源码：

=== index.html ===
""" + sources["index.html"] + "\n\n=== styles.css ===\n" + sources["styles.css"] + "\n\n=== app.js ===\n" + sources["app.js"] + "\n\n=== gemini.js ===\n" + sources["gemini.js"]


def write_message(proc: subprocess.Popen[str], message: dict[str, object]) -> None:
    if proc.stdin is None:
        raise RuntimeError("MCP stdin unavailable")
    proc.stdin.write(json.dumps(message, ensure_ascii=False, separators=(",", ":")) + "\n")
    proc.stdin.flush()


def read_message(proc: subprocess.Popen[str]) -> dict[str, object]:
    if proc.stdout is None:
        raise RuntimeError("MCP stdout unavailable")
    line = proc.stdout.readline()
    if not line:
        details = proc.stderr.read() if proc.stderr else ""
        raise RuntimeError("MCP transport closed: " + details[-4000:])
    return json.loads(line)


def main() -> int:
    if SERVER is None:
        print("Gemini MCP server not found", file=sys.stderr)
        return 2
    if not PYTHON.exists():
        print(f"Python not found: {PYTHON}", file=sys.stderr)
        return 2
    if not AGY.exists():
        print(f"Antigravity CLI not found: {AGY}", file=sys.stderr)
        return 2

    env = os.environ.copy()
    env.update({
        "AGY_PATH": str(AGY),
        "HTTP_PROXY": env.get("HTTP_PROXY", "http://127.0.0.1:10808"),
        "HTTPS_PROXY": env.get("HTTPS_PROXY", "http://127.0.0.1:10808"),
        "NO_PROXY": env.get("NO_PROXY", "localhost,127.0.0.1"),
        "PYTHONUTF8": "1",
    })
    prompt = prompt_for(read_sources())
    proc = subprocess.Popen(
        [str(PYTHON), str(SERVER)],
        cwd=str(ROOT),
        env=env,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    try:
        write_message(proc, {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2025-06-18",
                "capabilities": {},
                "clientInfo": {"name": "guofeng-vibecoding-studio", "version": "1.0.0"},
            },
        })
        initialize = read_message(proc)
        write_message(proc, {"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})
        write_message(proc, {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
        tools = read_message(proc)
        write_message(proc, {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {"name": "ask_gemini", "arguments": {"prompt": prompt, "effort": "high"}},
        })
        response = read_message(proc)
        payload = {"initialize": initialize, "tools": tools, "response": response}
        content = response.get("result", {}).get("content", [])
        text = "\n".join(item.get("text", "") for item in content if isinstance(item, dict))
        report = (
            "# Gemini MCP 前端优化评审\n\n" + text + "\n\n---\n\n"
            "```json\n" + json.dumps(payload, ensure_ascii=False, indent=2) + "\n```\n"
        )
        try:
            OUTPUT.write_text(report, encoding="utf-8")
            print(f"Gemini MCP response written to {OUTPUT}")
        except PermissionError:
            # Managed local runners may deny Python file writes while allowing
            # the parent shell to redirect stdout into the workspace.
            print(report)
            print(f"Gemini MCP response ready; redirect stdout to {OUTPUT}", file=sys.stderr)
        if response.get("result", {}).get("isError"):
            return 3
        return 0
    finally:
        if proc.stdin:
            proc.stdin.close()
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    raise SystemExit(main())
