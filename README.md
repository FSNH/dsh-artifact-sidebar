# DSH 会话产物侧栏插件 (Artifact Sidebar)

**中文版**（本页） · **English**: [README.en.md](README.en.md)

一个用于 **DeepSeek Harness (DSH)** Web GUI 的界面插件：在页面右侧提供可展开/收起的**产物侧栏**，展示**当前会话**在对话过程中实际产生（写入）的文件，支持预览、复制路径、在文件夹中打开、全屏等操作。

- 插件类型：动态 Cordis 插件（Host + Client 双半部）
- 最终版本：`pkg-24`（已定型）
- 兼容：DSH Web GUI（Windows 平台完整支持；"在文件夹中打开"依赖 `explorer.exe`）

## 功能特性

| 能力 | 说明 |
| --- | --- |
| 📌 右侧嵌入式侧栏 | 展开时嵌入页面布局（会话区自动收窄 360px），收起时恢复原宽 |
| 📂 当前会话产物 | 从会话日志解析 `write`/`edit` 调用，按会话归属展示；切换会话自动跟随 |
| 📖 全屏内容预览 | 只显示预览内容（文本前 256KB，二进制自动提示），✕ 返回列表 |
| ⧉ 复制路径 | 一键复制文件完整绝对路径到剪贴板 |
| ↗ 在文件夹中打开 | 调用 `explorer.exe /select` 在资源管理器中定位文件 |
| ⤢ 全屏 / ⟳ 刷新 / ◧ 收起 | 面板头部操作 |
| 🎨 主题跟随 | 样式全部使用主题令牌，自动适配浅色/深色/自定义配色 |
| ⚡ 性能优化 | 文件元数据并行检查 + 8 秒结果缓存（展开秒开） |

## 目录结构

```
├── plugin.host.js                 # Host 半部：数据收集 RPC（会话产物/文件读取/打开文件夹）
├── plugin.client.js               # Client 半部：UI（开关、侧栏、预览、全屏等）
├── 安装说明.md                     # 安装步骤与注意事项
└── 会话产物侧栏-用户使用指南.md      # 功能使用说明
```

## 安装（在 DSH 会话中）

1. 打开 DSH Web GUI 会话（建议使用带 Cordis 工具集的预设，如 `cordis`）；
2. 让 Agent 读取 `plugin.host.js` 与 `plugin.client.js`；
3. 调用 `cordis_define`：
   - `plugin.idPrefix`: `artf`
   - `name`: `会话产物侧栏`
   - `code.host` = `plugin.host.js` 内容；`code.client` = `plugin.client.js` 内容
4. 调用 `cordis_run` 激活，界面批准后生效。

> 动态插件为会话级、进程内，重启后需重新定义；详细说明见 `安装说明.md`。

## 安装（部署级，推荐给部署管理员）

已发布为 npm 包 **`dsh-plugin-artifact-sidebar`**（源码见 `deployment-package/`），任何 DSH 部署均可安装，**重启不丢、设置→插件可见、全局生效**：

1. 在 DSH profile 的 `package.json` 添加依赖并安装：

   ```json
   "dependencies": { "dsh-plugin-artifact-sidebar": "^1.0.0" }
   ```

   ```bash
   npm install
   ```

2. 在 profile 的 `cordis.patch.yml` 追加：

   ```yaml
   - insert:
       - id: artifact-sidebar
         name: dsh-plugin-artifact-sidebar
   ```

3. 硬刷新页面（开发模式热加载）或重启服务。

> 完整分发说明见仓库 `分发说明.md` 或 npm 包页面。

## 数据来源

产物文件来自**当前会话日志**中的 `write`/`edit` 工具调用（`sessionQuery.readSession`），兜底扫描会话开始后修改过的工作目录文件。仅通过 bash 直接创建、从未经 write 工具写入的文件不会被记录。

## 侧栏预览
<img width="1920" height="1017" alt="侧栏预览功能介绍" src="https://github.com/user-attachments/assets/68c0dce7-1a91-49ad-98d2-9c18cf8bb070" />
<img width="1920" height="1017" alt="全屏预览产物" src="https://github.com/user-attachments/assets/4e4f23f2-7222-44df-ba00-973820874306" />
<img width="1920" height="1017" alt="产物文件行操作" src="https://github.com/user-attachments/assets/301a2596-14fa-4c09-ba5f-d6a0a3a4ce71" />
<img width="1920" height="1017" alt="产物侧栏" src="https://github.com/user-attachments/assets/90bd5f50-4d81-4cc3-880a-e5929ad73b8b" />

## License

未指定（默认保留版权）。
