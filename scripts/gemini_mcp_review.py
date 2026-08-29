#!/usr/bin/env python3
"""Send the current production frontend to the local Gemini MCP bridge.

The bridge is text-only, so Gemini returns an audit and unified diff. Codex
reviews that diff before applying it to the working branch.
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
SERVER = next((Path(path) for path in SERVER_CANDIDATES if Path(path).is_file()), None)
PYTHON = Path(os.environ.get("GEMINI_MCP_PYTHON", r"C:\Users\skr\anaconda3\python.exe"))
AGY = Path(os.environ.get("AGY_PATH", r"C:\Users\skr\AppData\Local\agy\bin\agy.exe"))
OUTPUT = ROOT / "GEMINI_UI_POLISH_REVIEW.md"


def prompt_for() -> str:
    instructions = r"""请作为资深国风数字艺术设计师和前端 UI 审查专家，优化以下本地项目：

项目目录：
D:\xhs\guofeng-vibecoding-studio

必须先阅读 BUILD_SPEC_GPT56_LUNA_MAX.md。

目标：
在不改变现有功能、生成算法和 DOM 交互契约的前提下，提升「一念成笺 · 国风诗签」的比赛展示质感，使页面更像具有收藏感的国风数字艺术作品，而不是普通 SaaS 表单。

重点优化：
1. 首屏品牌辨识度、标题层级和三步创作流程。
2. 表单分组、留白、心境按钮选中状态及移动端操作效率。
3. 诗文、签语和 Canvas 预览之间的视觉层级。
4. 宣纸朱砂、黛青月白、竹青松烟三种主题的综合色彩表现。
5. 320、375、390、430px 移动端布局与触控体验。
6. 焦点状态、对比度、44px 触控尺寸和 reduced-motion。
7. 保存图片、换一签、复制文案、邀请同题四个操作的优先级。
8. 减少装饰噪声，保留克制、雅致、有留白的中式审美。

强制约束：
- 不引入 npm、框架、CDN、在线字体、网络图片或远程脚本。
- 不新增 Gemini 面板、API Key、模型选择或任何网络请求。
- 不使用 fetch、XMLHttpRequest、eval 或 Math.random。
- 不修改诗签生成、seed、韵组、历史记录、挑战链接及 Canvas 1200×1600 逻辑。
- 不删除或重命名现有 DOM ID。
- 不改变比赛标签和 @科技薯。
- 不使用大面积渐变、玻璃拟态、霓虹光效或 SaaS 风格组件。
- 优先只修改 index.html 和 styles.css；app.js 仅在发现明确 UI 缺陷时做最小修改。
- 所有路径保持相对路径，file:// 直接打开仍可运行。

执行方式：
1. 先审查当前页面并列出最多 8 个高价值问题。
2. 如现有设计已经优于拟议修改，则保留原实现，不为了制造差异而改动。
3. 当前 MCP 是只读文本桥接，请在审查后输出可直接应用的 unified diff；不要省略上下文，不要输出伪代码。
4. 修改建议必须能通过 node scripts/selfcheck.js。
5. 最后给出桌面端和 320/375/390/430px 的验收重点。

请按以下格式返回：
## 1. 高价值问题
## 2. 保留项
## 3. 建议应用的 unified diff
## 4. 验收清单

当前为 headless MCP 文本评审。不要调用 read_file 或其他工具；index.html 与 styles.css 已完整附在提示词末尾。app.js 已通过 259 项自检，本轮不修改。
"""
    index_source = (ROOT / "index.html").read_text(encoding="utf-8")
    style_source = (ROOT / "styles.css").read_text(encoding="utf-8")
    return (
        instructions
        + "\n\n===== index.html =====\n"
        + index_source
        + "\n\n===== styles.css =====\n"
        + style_source
    )


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
                "clientInfo": {"name": "yinian-chengjian-ui-polish", "version": "2.0.0"},
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
            "params": {"name": "ask_gemini", "arguments": {"prompt": prompt_for(), "effort": "high"}},
        })
        response = read_message(proc)
        content = response.get("result", {}).get("content", [])
        text = "\n".join(item.get("text", "") for item in content if isinstance(item, dict)).strip()
        tool_names = [item.get("name", "") for item in tools.get("result", {}).get("tools", [])]
        report = (
            "# Gemini MCP · 一念成笺前端终审\n\n"
            f"- MCP server: `{SERVER}`\n"
            f"- Protocol: `{initialize.get('result', {}).get('protocolVersion', '')}`\n"
            f"- Tools: `{', '.join(tool_names)}`\n\n"
            + text
            + "\n"
        )
        OUTPUT.write_text(report, encoding="utf-8")
        print(f"Gemini MCP response written to {OUTPUT}")
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
