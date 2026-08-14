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

## License

Not specified (copyright reserved by default).
