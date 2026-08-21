# dsh-plugin-artifact-sidebar

Artifact sidebar for the **DeepSeek Harness (DSH) Web GUI**: an expandable/collapsible right sidebar that lists the files **the current session actually produced** during the conversation — with preview, copy-path, and open-in-folder.

- Deployment-level DSH plugin (Host + Client halves)
- Requires DSH Web GUI (Windows / macOS / Linux)

## Features

- 📌 Right embedded sidebar (conversation narrows by 360px when open)
- 📂 Current-session artifacts (from `write`/`edit` log entries), auto-follows session switches
- 📖 Fullscreen content preview (first 256KB, binary auto-detected), ✕ returns to the list
- ⧉ Copy path / ↗ Open in folder (`explorer.exe` · `open -R` · `xdg-open`)
- ⤢ Fullscreen / ⟳ Refresh / ◧ Collapse
- 🎨 Theme-token aware · ⚡ Parallel stat + 8s cache

## Installation (DSH deployment owner)

### ✨ One-command install (recommended)

```bash
npx dsh-plugin-artifact-sidebar@latest install
```

Auto-detects `~/.dsh/profiles/*`, writes the dependency and the `cordis.patch.yml` insert row, then runs `npm install`. Idempotent. Uninstall: `npx dsh-plugin-artifact-sidebar@latest uninstall`. Then hard-refresh the page (or restart the service).

### Manual

1. Add the dependency in your DSH profile (`~/.dsh/profiles/<profile>/package.json`):

   ```json
   "dependencies": {
     "dsh-plugin-artifact-sidebar": "^1.0.0"
   }
   ```

   then install: `npm install` (or your profile's package manager).

2. Register the plugin in your profile's `cordis.patch.yml`:

   ```yaml
   - insert:
       - id: artifact-sidebar
         name: dsh-plugin-artifact-sidebar
   ```

3. Restart (or hot-reload) the deployment, then **hard-refresh** the Web GUI page.

The sidebar toggle appears in the conversation header (top-right); the plugin also shows up under **Settings → Plugins**.

## Usage

1. Open any session → click the round panel icon (▣) at the top right.
2. The sidebar opens (conversation narrows) and lists the current session's files.
3. Hover a file → 📖 preview / ↗ open folder / ⧉ copy path.
4. Click 📖 for a fullscreen content preview; ✕ returns to the list.
5. Click ▣ to collapse the sidebar.

## How it works

- Host half registers three JSON routes on the Web server (`/api/artifact-sidebar/{current,read,reveal}`).
- Client half is a `dsh.client` web plugin registering the sidebar UI into the `shell.overlay` and `conversation.session.header.utilities` slots.

## License

MIT
