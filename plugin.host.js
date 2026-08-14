// ============================================================================
// 会话产物侧栏插件 — Host 半部（artf-2 / pkg-23）
// 用途：作为 cordis_define 的 code.host 函数体。
// 安装方法见同目录 安装说明.md
// ============================================================================
return {
  apply(ctx) {
    const wss = ctx.get('workspaceRegistry')
    const sq = ctx.get('sessionQuery')
    const fsService = ctx.get('fs')
    const sub = ctx.get('subprocess')
    if (wss === undefined || sq === undefined || fsService === undefined) return

    const MAX_FILES = 50
    const MAX_PREVIEW = 256 * 1024
    const NOISE = new Set(['.git', '.dsh', 'node_modules'])
    const CACHE_TTL = 8000
    const cache = new Map()

    const statInfo = async (path) => {
      try {
        const info = await fsService.stat(await fsService.resolve(path))
        if (!info) return null
        let mtime = 0
        if (typeof info.mtime === 'number') mtime = info.mtime
        else if (info.mtime instanceof Date) mtime = info.mtime.getTime()
        else if (typeof info.mtimeMs === 'number') mtime = info.mtimeMs
        return {
          size: typeof info.size === 'number' ? info.size : 0,
          mtime,
          dir: info.type === 'dir' || info.isDirectory === true,
        }
      } catch (e) {
        return null
      }
    }

    const parseArgs = (raw) => {
      try {
        const v = JSON.parse(raw)
        return v && typeof v === 'object' ? v : null
      } catch (e) {
        return null
      }
    }

    const extractPath = (args) => {
      if (!args || typeof args !== 'object') return ''
      if (typeof args.file_path === 'string' && args.file_path) return args.file_path
      if (typeof args.path === 'string' && args.path) return args.path
      if (typeof args.file === 'string' && args.file) return args.file
      return ''
    }

    const resolveAbs = (base, p) => {
      const norm = p.replace(/\\/g, '/')
      if (/^[A-Za-z]:\//.test(norm) || norm.startsWith('/')) return p
      return base.replace(/[\\/]+$/, '') + '/' + norm
    }

    const normalizeAbs = (p) => (/^[A-Za-z]:/.test(p) ? p.replace(/\//g, '\\') : p)

    const sessionFiles = async (base, events) => {
      const out = []
      const seen = new Set()
      let sessionStart = 0
      const pending = []
      for (const ev of events || []) {
        if (!ev || typeof ev !== 'object') continue
        if (!sessionStart && typeof ev.time === 'number') sessionStart = ev.time
        if (ev.type !== 'tool/call' || !ev.data) continue
        const name = String(ev.data.name || '')
        if (name !== 'write' && name !== 'edit') continue
        const raw = extractPath(parseArgs(ev.data.arguments))
        if (!raw) continue
        const abs = resolveAbs(base, raw)
        const norm = normalizeAbs(abs)
        if (seen.has(norm)) continue
        seen.add(norm)
        pending.push({ abs, norm })
        if (pending.length >= MAX_FILES) break
      }
      const stats = await Promise.all(pending.map(async (p) => {
        const info = await statInfo(p.abs)
        return info ? { p, info } : null
      }))
      for (const hit of stats) {
        if (!hit) continue
        const { p, info } = hit
        const rel = p.abs.substring(base.length).replace(/^[\\/]+/, '') || (p.abs.split(/[\\/]/).pop() || p.abs)
        out.push({
          name: p.abs.split(/[\\/]/).pop() || p.abs,
          rel,
          size: info.size,
          mtime: info.mtime,
          dir: info.dir,
          abs: p.norm,
        })
      }
      out.sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
      if (out.length === 0 && base && sessionStart) {
        const scanned = []
        await scanDirByMtime(base, base, 0, sessionStart, scanned)
        for (const f of scanned) {
          if (!seen.has(f.abs)) {
            seen.add(f.abs)
            out.push(f)
          }
        }
        out.sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
      }
      return out.slice(0, MAX_FILES)
    }

    const scanDirByMtime = async (base, dirPath, depth, since, out) => {
      if (out.length >= MAX_FILES) return
      let entries = []
      try {
        entries = await fsService.listDir(await fsService.resolve(dirPath))
      } catch (e) {
        return
      }
      for (const entry of entries) {
        if (out.length >= MAX_FILES) break
        const name = typeof entry === 'string' ? entry : (entry && entry.name) || ''
        if (!name || name.startsWith('.') || NOISE.has(name)) continue
        const full = dirPath.replace(/[\\/]+$/, '') + '/' + name
        const info = await statInfo(full)
        if (!info) continue
        if (info.dir) {
          if (depth < 2) await scanDirByMtime(base, full, depth + 1, since, out)
          continue
        }
        if (info.mtime >= since) {
          const rel = full.substring(base.length).replace(/^[\\/]+/, '') || name
          out.push({ name, rel, size: info.size, mtime: info.mtime, dir: false, abs: normalizeAbs(full) })
        }
      }
    }

    ctx.effect(() => harness.handle('artifacts/current', async (args) => {
      const sid = args && typeof args.sessionId === 'string' ? args.sessionId : ''
      const refresh = !!(args && args.refresh)
      if (!sid) return { title: '', path: '', files: [] }
      if (!refresh) {
        const hit = cache.get(sid)
        if (hit && Date.now() - hit.time < CACHE_TTL) return hit.result
      }
      let title = ''
      let path = ''
      let events = []
      try {
        const snap = await sq.readSession(sid)
        if (snap) {
          events = snap.events || []
          const h = snap.session || {}
          if (typeof h.title === 'string' && h.title) title = h.title
          if (typeof h.cwd === 'string' && h.cwd) path = h.cwd
        }
      } catch (e) { /* fall through */ }
      if (!title) {
        try {
          const t = await sq.readTitle(sid)
          if (t) title = typeof t === 'string' ? t : (t.title ? String(t.title) : '')
        } catch (e) { /* ignore */ }
      }
      if (!title) title = sid
      if (!path) {
        for (const ws of wss.list()) {
          if ((ws.sessionIds || []).some((x) => String(x) === sid)) {
            path = String(ws.path ?? ws.cwd ?? ws.root ?? ws.dir ?? '')
            break
          }
        }
        if (!path) {
          try {
            const records = await sq.listSessions()
            for (const r of records || []) {
              if (String(r.id ?? r.sessionId ?? '') === sid) {
                path = String(r.cwd ?? r.path ?? '')
                break
              }
            }
          } catch (e) { /* ignore */ }
        }
      }
      const files = await sessionFiles(path, events)
      const result = { title, path, files }
      cache.set(sid, { time: Date.now(), result })
      return result
    }))

    ctx.effect(() => harness.handle('artifacts/read', async (args) => {
      const p = args && typeof args.path === 'string' ? args.path : ''
      if (!p) return { ok: false, error: 'missing path' }
      try {
        const target = await fsService.resolve(p)
        const bytes = await fsService.readBytes(target, undefined, MAX_PREVIEW)
        let binary = false
        for (let i = 0; i < bytes.length; i++) {
          if (bytes[i] === 0) { binary = true; break }
        }
        if (binary) return { ok: false, error: '二进制文件暂不支持预览' }
        const content = new TextDecoder('utf-8').decode(bytes)
        let truncated = false
        try {
          const info = await fsService.stat(target)
          if (info && typeof info.size === 'number' && info.size > MAX_PREVIEW) truncated = true
        } catch (e) { /* ignore */ }
        return { ok: true, content, truncated }
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) }
      }
    }))

    ctx.effect(() => harness.handle('artifacts/reveal', async (args) => {
      const p = args && typeof args.path === 'string' ? args.path : ''
      if (!p) return { ok: false, error: 'missing path' }
      if (sub === undefined) return { ok: false, error: 'subprocess unavailable' }
      try {
        sub.spawn({
          argv: ['C:\\Windows\\explorer.exe', '/select,' + p],
          cwd: 'C:\\',
          stdio: { stdin: 'ignore', stdout: 'inherit', stderr: 'inherit' },
          graceMs: 5000,
        })
        return { ok: true }
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) }
      }
    }))
  },
}
