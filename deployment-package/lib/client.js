// dsh-plugin-artifact-sidebar — Client half (deployment-level, pkg-24 UI)
// Format: window.__ModuleLoader__.load({ id, factory }) with require('react').
window.__ModuleLoader__.load({
	id: "dsh-plugin-artifact-sidebar",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let React = require("react");

		const PLUGIN_CSS_ID = "dsh-plugin-artifact-sidebar";
		const CSS = `
.dsh-art-toggle {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0; cursor: pointer; flex: none;
  transition: background .15s ease, color .15s ease;
}
.dsh-art-toggle:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.dsh-art-toggle--on { color: var(--dsw-alias-brand-primary); }
.dsh-art-panel {
  position: fixed; right: 0; bottom: 0;
  width: 360px; max-width: 92vw;
  background: var(--dsw-alias-bg-layer-1);
  border-left: 1px solid var(--dsw-alias-border-l1);
  box-shadow: -10px 0 30px rgba(0,0,0,.18);
  z-index: 2147483001; pointer-events: auto;
  display: flex; flex-direction: column;
  font-size: 13px; color: var(--dsw-alias-label-primary);
}
.dsh-art-panel--fs { width: 100vw !important; max-width: none !important; }
.dsh-art-head {
  box-sizing: border-box;
  display: flex; align-items: center; gap: 6px;
  padding: 0 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  flex-shrink: 0; overflow: hidden;
}
.dsh-art-title { font-weight: 600; flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-art-pvname { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 1px; }
.dsh-art-pvtitle { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-art-pvpath { font-size: 11px; color: var(--dsw-alias-label-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-art-btn {
  border: 1px solid var(--dsw-alias-border-l1); background: transparent;
  color: var(--dsw-alias-label-secondary); border-radius: 6px;
  width: 26px; height: 26px; cursor: pointer; font-size: 13px; line-height: 1;
  display: inline-flex; align-items: center; justify-content: center; flex: none;
}
.dsh-art-btn:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.dsh-art-btn--on { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.dsh-art-body { flex: 1; overflow-y: auto; padding: 10px; }
.dsh-art-filewrap { border-radius: 6px; }
.dsh-art-filewrap--pv { background: var(--dsw-alias-bg-layer-2); }
.dsh-art-file { display: flex; align-items: center; gap: 6px; padding: 4px 6px; font-size: 12px; border-radius: 6px; }
.dsh-art-file:hover { background: var(--dsw-alias-bg-layer-2); }
.dsh-art-file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-art-file-meta { color: var(--dsw-alias-label-secondary); font-size: 11px; flex-shrink: 0; }
.dsh-art-ftype { flex-shrink: 0; }
.dsh-art-actions { display: inline-flex; gap: 2px; flex-shrink: 0; opacity: 0; transition: opacity .12s ease; }
.dsh-art-file:hover .dsh-art-actions { opacity: 1; }
.dsh-art-mini { border: none; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 12px; padding: 0 3px; line-height: 1; border-radius: 4px; }
.dsh-art-mini:hover { color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); }
.dsh-art-mini--on { color: var(--dsw-alias-brand-primary); }
.dsh-art-fb { color: var(--dsw-alias-state-success-primary); font-size: 11px; flex-shrink: 0; }
.dsh-art-preview {
  margin: 0;
  white-space: pre-wrap; word-break: break-word;
  font-size: 12px; line-height: 1.55;
  color: var(--dsw-alias-label-primary);
}
.dsh-art-hint { padding: 14px; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-art-error { color: var(--dsw-alias-state-error-primary); }
`;
		if (typeof document !== "undefined" && !document.querySelector("style[data-plugin-css=\"" + PLUGIN_CSS_ID + "\"]")) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-artifact-sidebar";
			tag.dataset.pluginCss = PLUGIN_CSS_ID;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}

		function apiGet(url) {
			return fetch(url).then((r) => r.json());
		}
		function apiPost(path, body) {
			return fetch(path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			}).then((r) => r.json());
		}

		const apply = (ctx) => {
			const slots = ctx.get('slots');
			const timer = ctx.get('timer');
			const layout = ctx.get('layout');
			if (!slots) return;

			let store = { open: false, sessionId: null, top: 0, headH: 44 };
			const subs = new Set();
			const setStore = (patch) => {
				store = Object.assign({}, store, patch);
				subs.forEach((fn) => { try { fn(store); } catch (e) {} });
			};
			const useStore = () => {
				const [s, setS] = React.useState(store);
				React.useEffect(() => {
					const fn = (v) => setS(v);
					subs.add(fn);
					return () => subs.delete(fn);
				}, []);
				return s;
			};

			const PanelIcon = () => React.createElement('svg', {
				viewBox: '0 0 16 16', width: '16', height: '16',
				fill: 'none', stroke: 'currentColor', strokeWidth: '1.3',
				strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
			},
				React.createElement('rect', { x: '1.5', y: '2.5', width: '13', height: '11', rx: '2' }),
				React.createElement('line', { x1: '5.5', y1: '2.5', x2: '5.5', y2: '13.5' }),
			);

			const fmtSize = (n) => {
				if (!n) return '';
				if (n < 1024) return n + ' B';
				if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
				return (n / 1048576).toFixed(1) + ' MB';
			};
			const fmtTime = (t) => {
				if (!t) return '';
				const diff = Date.now() - t;
				if (diff < 60000) return '刚刚';
				if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
				if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
				if (diff < 7 * 86400000) return Math.floor(diff / 86400000) + ' 天前';
				const d = new Date(t);
				return (d.getMonth() + 1) + '月' + d.getDate() + '日';
			};

			const copyText = async (text) => {
				try {
					if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
						await navigator.clipboard.writeText(text);
						return true;
					}
				} catch (e) { /* fall through */ }
				try {
					if (typeof document.execCommand !== 'function') return false;
					const el = document.createElement('textarea');
					el.value = text;
					el.setAttribute('readonly', '');
					el.style.position = 'fixed';
					el.style.left = '-9999px';
					document.body.appendChild(el);
					el.select();
					const ok = document.execCommand('copy');
					el.remove();
					return ok;
				} catch (e) {
					return false;
				}
			};

			const measureHeader = (el) => {
				try {
					if (!el || typeof el.getBoundingClientRect !== 'function') return null;
					const btnRect = el.getBoundingClientRect();
					let h = null;
					if (typeof el.closest === 'function') h = el.closest('header');
					if (h && typeof h.getBoundingClientRect === 'function') {
						const r = h.getBoundingClientRect();
						if (r.height > 0) return { top: r.top, headH: r.height };
					}
					const parent = el.parentElement;
					if (parent && typeof parent.getBoundingClientRect === 'function') {
						const pr = parent.getBoundingClientRect();
						return { top: Math.min(btnRect.top, pr.top), headH: 44 };
					}
					return { top: btnRect.top, headH: 44 };
				} catch (e) {
					return null;
				}
			};

			const ArtifactToggle = (props) => {
				const s = useStore();
				const sid = props.sessionId;
				React.useEffect(() => {
					if (sid && sid !== store.sessionId) {
						setStore({ sessionId: sid });
						if (store.open && layout !== undefined && timer !== undefined) {
							timer.timeout(() => { if (store.open) layout.openDetails(); }, 80);
						}
					}
				}, [sid]);
				if (s.open) return null;
				const toggle = (ev) => {
					const btnEl = ev && ev.currentTarget;
					const targetSid = sid || store.sessionId;
					const pre = measureHeader(btnEl);
					if (layout !== undefined) layout.openDetails();
					if (timer !== undefined && btnEl) {
						timer.timeout(() => {
							const m = measureHeader(btnEl);
							const top = (m && m.top !== undefined && m.top > 0) ? m.top : ((pre && pre.top) || 0);
							const headH = (m && m.headH) ? m.headH : ((pre && pre.headH) || 44);
							setStore({ open: true, sessionId: targetSid, top, headH });
						}, 60);
					} else {
						setStore({ open: true, sessionId: targetSid, top: (pre && pre.top) || 0, headH: (pre && pre.headH) || 44 });
					}
				};
				return React.createElement('button', {
					className: 'dsh-art-toggle',
					onClick: toggle,
					title: '展开产物侧栏（会话区自动收窄）',
				}, React.createElement(PanelIcon, null));
			};

			const PanelBody = (props) => {
				const sessionId = props.sessionId;
				const [loading, setLoading] = React.useState(true);
				const [error, setError] = React.useState(null);
				const [data, setData] = React.useState(null);
				const [feedback, setFeedback] = React.useState({});
				const [preview, setPreview] = React.useState({});
				const [activePv, setActivePv] = React.useState(null);
				const [fullscreen, setFullscreen] = React.useState(false);
				const load = (refresh) => {
					if (!sessionId) {
						setData(null);
						setLoading(false);
						setError(null);
						return;
					}
					setLoading(true);
					setError(null);
					apiGet('/api/artifact-sidebar/current?sessionId=' + encodeURIComponent(sessionId) + '&refresh=' + (refresh ? '1' : '0')).then((d) => {
						console.log('[artifact] current files:', d && d.files ? d.files.length : 0);
						setData(d);
						setLoading(false);
					}).catch((e) => {
						console.error('[artifact] load failed:', e);
						setError(String((e && e.message) || e));
						setLoading(false);
					});
				};
				React.useEffect(() => {
					setPreview({});
					setActivePv(null);
					load(false);
				}, [sessionId]);
				const files = (data && data.files) || [];
				const title = (data && data.title) || '当前会话';
				const headH = props.headH || 44;
				const showFb = (key, text) => {
					setFeedback((prev) => {
						const next = {};
						for (const k in prev) next[k] = prev[k];
						next[key] = text;
						return next;
					});
					if (timer !== undefined) {
						timer.timeout(() => {
							setFeedback((prev) => {
								const next = {};
								for (const k in prev) next[k] = prev[k];
								delete next[key];
								return next;
							});
						}, 1600);
					}
				};
				const doCopy = (f) => {
					const text = f.abs || '';
					if (!text) { showFb(f.rel || f.name, '无路径'); return; }
					copyText(text).then((ok) => showFb(f.rel || f.name, ok ? '✓ 已复制' : '复制失败'));
				};
				const doReveal = (f) => {
					const path = f.abs || '';
					if (!path) { showFb(f.rel || f.name, '无路径'); return; }
					apiPost('/api/artifact-sidebar/reveal', { path }).then((r) => {
						const msg = r && r.ok ? '✓ 已打开文件夹' : (r && r.error ? '打开失败：' + r.error : '打开失败');
						showFb(f.rel || f.name, msg);
					}).catch(() => showFb(f.rel || f.name, '打开失败'));
				};
				const closePreview = () => {
					if (activePv) {
						const key = activePv.rel || activePv.name;
						setPreview((prev) => {
							const next = {};
							for (const k in prev) next[k] = prev[k];
							delete next[key];
							return next;
						});
					}
					setActivePv(null);
				};
				const doPreview = (f) => {
					const key = f.rel || f.name;
					if (activePv && (activePv.rel || activePv.name) === key) {
						closePreview();
						return;
					}
					setPreview((prev) => {
						const next = {};
						for (const k in prev) next[k] = prev[k];
						next[key] = 'loading';
						return next;
					});
					setActivePv(f);
					apiPost('/api/artifact-sidebar/read', { path: f.abs || '' }).then((r) => {
						setPreview((prev) => {
							const next = {};
							for (const k in prev) next[k] = prev[k];
							next[key] = (r && r.ok) ? { content: r.content || '', truncated: !!r.truncated } : { error: (r && r.error) || '预览失败' };
							return next;
						});
					}).catch(() => {
						setPreview((prev) => {
							const next = {};
							for (const k in prev) next[k] = prev[k];
							next[key] = { error: '预览失败' };
							return next;
						});
					});
				};
				const renderFile = (f, i) => {
					const key = f.rel || (f.name + i);
					const fb = feedback[key] || '';
					return React.createElement('div', { key, className: 'dsh-art-filewrap' },
						React.createElement('div', { className: 'dsh-art-file' },
							React.createElement('span', { className: 'dsh-art-ftype' }, '\u{1F4C4}'),
							React.createElement('span', { className: 'dsh-art-file-name', title: f.rel }, f.rel || f.name),
							fb ? React.createElement('span', { className: 'dsh-art-fb' }, fb) :
							React.createElement('span', { className: 'dsh-art-actions' },
								React.createElement('button', { className: 'dsh-art-mini', title: '预览', onClick: (ev) => { ev.stopPropagation(); doPreview(f); } }, '\u{1F4D6}'),
								React.createElement('button', { className: 'dsh-art-mini', title: '在文件夹中打开', onClick: (ev) => { ev.stopPropagation(); doReveal(f); } }, '\u2197'),
								React.createElement('button', { className: 'dsh-art-mini', title: '复制路径', onClick: (ev) => { ev.stopPropagation(); doCopy(f); } }, '\u29C9'),
							),
							React.createElement('span', { className: 'dsh-art-file-meta' }, fmtSize(f.size)),
							React.createElement('span', { className: 'dsh-art-file-meta' }, fmtTime(f.mtime)),
						),
					);
				};
				const pvKey = activePv ? (activePv.rel || activePv.name) : null;
				const pv = pvKey ? preview[pvKey] : undefined;
				const bodyEl = activePv
					? React.createElement('div', { className: 'dsh-art-body' },
						!pv || pv === 'loading' ? React.createElement('div', { className: 'dsh-art-hint' }, '加载中…') :
						pv.error ? React.createElement('div', { className: 'dsh-art-hint dsh-art-error' }, pv.error) :
						React.createElement('div', null,
							React.createElement('pre', { className: 'dsh-art-preview' }, pv.content),
							pv.truncated ? React.createElement('div', { className: 'dsh-art-hint' }, '（内容较长，仅显示前 256KB）') : null,
						),
					)
					: React.createElement('div', { className: 'dsh-art-body' },
						files.length === 0 ? React.createElement('div', { className: 'dsh-art-hint' }, '当前会话暂无产物文件') : files.map(renderFile),
					);
				const headEl = activePv
					? React.createElement('div', { className: 'dsh-art-head', style: { height: headH + 'px' } },
						React.createElement('span', { className: 'dsh-art-ftype' }, '\u{1F4C4}'),
						React.createElement('div', { className: 'dsh-art-pvname' },
							React.createElement('div', { className: 'dsh-art-pvtitle', title: activePv.abs || '' }, activePv.name || ''),
							React.createElement('div', { className: 'dsh-art-pvpath', title: activePv.abs || '' }, activePv.rel || activePv.abs || ''),
						),
						React.createElement('button', { className: 'dsh-art-btn', onClick: () => doReveal(activePv), title: '在文件夹中打开' }, '\u{1F4C2}'),
						React.createElement('button', { className: 'dsh-art-btn', onClick: closePreview, title: '关闭预览（返回产物目录）' }, '\u2715'),
						React.createElement('button', { className: 'dsh-art-btn' + (fullscreen ? ' dsh-art-btn--on' : ''), onClick: () => setFullscreen(!fullscreen), title: fullscreen ? '退出全屏' : '全屏展示' }, fullscreen ? '\u2921' : '\u2922'),
						React.createElement('button', { className: 'dsh-art-btn', onClick: props.onClose, title: '收起侧栏（会话区恢复宽度）' }, React.createElement(PanelIcon, null)),
					)
					: React.createElement('div', { className: 'dsh-art-head', style: { height: headH + 'px' } },
						React.createElement('div', { className: 'dsh-art-title', title: (data && data.path) || '' }, title),
						React.createElement('button', { className: 'dsh-art-btn' + (fullscreen ? ' dsh-art-btn--on' : ''), onClick: () => setFullscreen(!fullscreen), title: fullscreen ? '退出全屏' : '全屏展示' }, fullscreen ? '\u2921' : '\u2922'),
						React.createElement('button', { className: 'dsh-art-btn', onClick: () => load(true), title: '刷新' }, '\u21BB'),
						React.createElement('button', { className: 'dsh-art-btn', onClick: props.onClose, title: '收起侧栏（会话区恢复宽度）' }, React.createElement(PanelIcon, null)),
					);
				return React.createElement('div', { className: 'dsh-art-panel' + (fullscreen ? ' dsh-art-panel--fs' : ''), style: { top: (props.top || 0) + 'px' } },
					headEl,
					loading ? React.createElement('div', { className: 'dsh-art-hint' }, '加载中…') :
					error ? React.createElement('div', { className: 'dsh-art-hint dsh-art-error' }, error) :
					!sessionId ? React.createElement('div', { className: 'dsh-art-hint' }, '请先进入一个会话，再查看产物') : bodyEl,
				);
			};

			const ArtifactDock = () => {
				const s = useStore();
				if (!s.open) return null;
				return React.createElement(PanelBody, { sessionId: s.sessionId, top: s.top, headH: s.headH, onClose: () => {
					setStore({ open: false });
					if (layout !== undefined) layout.closeDetails();
				} });
			};

			slots.inject('shell.overlay', () => slots.register(
				{ name: 'shell.overlay', id: 'artifact-dock', order: 100 },
				ArtifactDock,
			));
			slots.inject('conversation.session.header.utilities', () => slots.register(
				{ name: 'conversation.session.header.utilities', id: 'artifact-toggle', order: 10, label: '会话产物' },
				ArtifactToggle,
			));
		};

		exports.apply = apply;
		return module.exports;
	}
});
