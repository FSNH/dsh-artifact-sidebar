# DSH Artifact Sidebar Plugin

A UI plugin for the **DeepSeek Harness (DSH)** Web GUI: an expandable/collapsible **artifact sidebar** on the right side of the page that lists the files **the current session actually produced** during the conversation — with preview, copy-path, open-in-folder, and fullscreen support.

- Type: dynamic Cordis plugin (Host + Client halves)
- Version: `pkg-24` (final)
- Compatibility: DSH Web GUI (full support on Windows; "Open in folder" relies on `explorer.exe`)

**中文版**: [README.md](README.md) · **English**: this file

## Features

| Capability | Description |
| --- | --- |
| 📌 Right embedded sidebar | Opens embedded in the page layout (conversation area narrows by 360px); collapses back to full width |
| 📂 Current-session artifacts | Parses `write`/`edit` tool calls from the session log, grouped per session; auto-follows when switching sessions |
| 📖 Fullscreen content preview | Shows only the preview content (first 256KB of text, binary auto-detected); ✕ returns to the list |
| ⧉ Copy path | Copies the file's full absolute path to the clipboard |
| ↗ Open in folder | Locates the file in File Explorer via `explorer.exe /select` |
| ⤢ Fullscreen / ⟳ Refresh / ◧ Collapse | Panel header actions |
| 🎨 Theme-aware | All styles use theme tokens; adapts to light/dark/custom themes |
| ⚡ Performance | Parallel metadata checks + 8s result cache (instant reopen) |

## Repository Layout

```
├── plugin.host.js                 # Host half: data RPCs (session artifacts / file read / open folder)
├── plugin.client.js               # Client half: UI (toggle, sidebar, preview, fullscreen, etc.)
├── 安装说明.md                     # Install guide (Chinese)
└── 会话产物侧栏-用户使用指南.md      # User guide (Chinese)
```

## Installation (in a DSH session)

1. Open a DSH Web GUI session (prefer a preset with the Cordis toolset, e.g. `cordis`);
2. Have the agent read `plugin.host.js` and `plugin.client.js`;
3. Call `cordis_define`:
   - `plugin.idPrefix`: `artf`
   - `name`: `会话产物侧栏`
   - `code.host` = contents of `plugin.host.js`; `code.client` = contents of `plugin.client.js`
4. Call `cordis_run` to activate, then approve in the UI.

> Dynamic plugins are session-scoped and process-local; they must be redefined after a restart. See `安装说明.md` for details.

## Data Source

Artifacts are extracted from **the current session's log** `write`/`edit` tool calls (`sessionQuery.readSession`), with a fallback scan of workspace files modified after the session started. Files created purely via `bash` (never written through the `write` tool) are not recorded.

## Web Preview
<img width="1920" height="1017" alt="侧栏预览功能介绍" src="https://github.com/user-attachments/assets/68c0dce7-1a91-49ad-98d2-9c18cf8bb070" />
<img width="1920" height="1017" alt="全屏预览产物" src="https://github.com/user-attachments/assets/4e4f23f2-7222-44df-ba00-973820874306" />
<img width="1920" height="1017" alt="产物文件行操作" src="https://github.com/user-attachments/assets/301a2596-14fa-4c09-ba5f-d6a0a3a4ce71" />
<img width="1920" height="1017" alt="产物侧栏" src="https://github.com/user-attachments/assets/90bd5f50-4d81-4cc3-880a-e5929ad73b8b" />


## License

Not specified (copyright reserved by default).
