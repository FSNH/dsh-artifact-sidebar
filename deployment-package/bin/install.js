#!/usr/bin/env node
// dsh-plugin-artifact-sidebar — one-command installer
// Usage: npx dsh-plugin-artifact-sidebar@latest install
// Auto-detects DSH profiles under $DSH_HOME (default ~/.dsh), adds the
// dependency to package.json and the insert row to cordis.patch.yml, then
// runs npm install. Idempotent: re-running is a no-op.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PKG = 'dsh-plugin-artifact-sidebar';
const ownPkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const ownVersion = JSON.parse(readFileSync(ownPkgPath, 'utf8').replace(/^\uFEFF/, '')).version || '1.0.0';
const DEP_VERSION = '^' + ownVersion;
const INSERT_BLOCK = '- insert:\n    - id: artifact-sidebar\n      name: ' + PKG + '\n';

const stripBom = (s) => s.replace(/^\uFEFF/, '');

const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh');
const profilesDir = join(dshHome, 'profiles');

function findProfiles() {
	if (!existsSync(profilesDir)) return [];
	return readdirSync(profilesDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => join(profilesDir, d.name))
		.filter((dir) => existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'cordis.patch.yml')));
}

function ensureDependency(pkgPath) {
	const raw = stripBom(readFileSync(pkgPath, 'utf8'));
	let json;
	try { json = JSON.parse(raw); } catch (e) { throw new Error('package.json 解析失败: ' + pkgPath); }
	json.dependencies = json.dependencies || {};
	if (json.dependencies[PKG]) return false;
	writeFileSync(pkgPath + '.bak', raw);
	json.dependencies[PKG] = DEP_VERSION;
	writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
	return true;
}

function ensurePatchRow(patchPath) {
	const raw = stripBom(readFileSync(patchPath, 'utf8'));
	if (raw.includes('name: ' + PKG)) return false;
	writeFileSync(patchPath + '.bak', raw);
	const lines = raw.split(/\r?\n/);
	const idx = lines.findIndex((l) => l.trim() === '[]');
	if (idx >= 0) {
		lines[idx] = INSERT_BLOCK.replace(/\n$/, '');
		writeFileSync(patchPath, lines.join('\n'));
	} else {
		writeFileSync(patchPath, raw.replace(/\s+$/, '') + '\n' + INSERT_BLOCK);
	}
	return true;
}

async function main() {
	const args = process.argv.slice(2);
	const wantUninstall = args.includes('uninstall');
	const profiles = findProfiles();
	if (!profiles.length) {
		console.error('✗ 未找到 DSH profile（' + profilesDir + '）。请确认本机安装并启动过 DSH Web。');
		process.exit(1);
	}
	let handled = 0;
	for (const dir of profiles) {
		const pkgPath = join(dir, 'package.json');
		const patchPath = join(dir, 'cordis.patch.yml');
		if (wantUninstall) {
			// uninstall: remove the insert row and the dependency
			let changed = false;
			const raw = stripBom(readFileSync(pkgPath, 'utf8'));
			const json = JSON.parse(raw);
			if (json.dependencies && json.dependencies[PKG]) {
				delete json.dependencies[PKG];
				if (Object.keys(json.dependencies).length === 0) delete json.dependencies;
				writeFileSync(pkgPath + '.bak', raw);
				writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
				changed = true;
			}
			const pr = readFileSync(patchPath, 'utf8');
			if (pr.includes('name: ' + PKG)) {
				writeFileSync(patchPath + '.bak', pr);
				writeFileSync(patchPath, pr.split(/\r?\n/).filter((l) => !l.includes('artifact-sidebar') && !l.includes('name: ' + PKG)).join('\n').replace(/\n{3,}/g, '\n\n'));
				changed = true;
			}
			console.log('- ' + dir + ': ' + (changed ? '已卸载配置' : '未安装'));
			if (changed) {
				const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], { cwd: dir, stdio: 'inherit' });
				if (r.status !== 0) console.error('  npm install 退出码 ' + r.status);
			}
			handled++;
			continue;
		}
		let changed = false;
		try {
			changed = ensureDependency(pkgPath) || changed;
			changed = ensurePatchRow(patchPath) || changed;
		} catch (e) {
			console.error('- ' + dir + ': ' + e.message);
			continue;
		}
		console.log('- ' + dir + ': ' + (changed ? '已写入配置' : '已是最新'));
		if (changed) {
			console.log('  安装依赖 (npm install)...');
			const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], { cwd: dir, stdio: 'inherit' });
			if (r.status !== 0) console.error('  npm install 退出码 ' + r.status);
		}
		handled++;
	}
	console.log('\n' + (wantUninstall ? '✅ 卸载完成' : '✅ 安装完成') + '（处理 ' + handled + ' 个 profile）');
	if (!wantUninstall) {
		console.log('请硬刷新 DSH Web 页面（Ctrl+F5 / Cmd+Shift+R），或重启服务。');
		console.log('插件将出现在「设置 → 插件」，并可在会话右上角展开产物侧栏。');
	}
}

main();
