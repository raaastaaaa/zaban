/* زبان رستا — منطق برنامه (بدون فریم‌ورک، برای سرعت) */
'use strict';

/* ───────── ابزارهای پایه ───────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const faNum = n => Number(n).toLocaleString('fa-IR', { useGrouping: Math.abs(n) >= 10000 });
const bidi = s => esc(s).replace(/([A-Za-z][A-Za-z0-9'’,.\/\- ]*[A-Za-z0-9.'’)])/g, '<bdi class="en">$1</bdi>');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const DAY = 864e5;
const isoDay = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const parseDay = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }; // ظهر: مصون از تغییر ساعت تابستانی
const addDays = (s, n) => isoDay(new Date(parseDay(s).getTime() + n * DAY));
const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('حافظهٔ دستگاه پر است؛ از بخش «من» پشتیبان بگیر و تصاویر را پاک کن.'); } }

/* IndexedDB کوچک برای فایل‌ها (صدای درس، تصویر دلخواه) */
const idb = (() => {
  let dbp;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('zd', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('kv', mode); const q = fn(t.objectStore('kv')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
  return { get: k => tx('readonly', s => s.get(k)).catch(() => null), set: (k, v) => tx('readwrite', s => s.put(v, k)).catch(() => null), del: k => tx('readwrite', s => s.delete(k)).catch(() => null) };
})();

/* ───────── تاریخ شمسی (با Intl، بدون کتابخانه) ───────── */
const jFmt = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' });
const J_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const J_WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
function toJ(s) { const p = Object.fromEntries(jFmt.formatToParts(parseDay(s)).map(x => [x.type, x.value])); return { y: +p.year, m: +p.month, d: +p.day }; }
function jLabel(s, withYear = false) { const j = toJ(s); return `${faNum(j.d)} ${J_MONTHS[j.m - 1]}${withYear ? ' ' + faNum(j.y) : ''}`; }
const weekdayIdx = s => (parseDay(s).getDay() + 1) % 7; // شنبه = ۰

/* ───────── داده‌ها و وضعیت ───────── */
const CEFR_OF = { intro: 'A1', l1: 'A2', l2: 'A2+/B1', l3: 'B1', owsb: 'A1-A2', owsi: 'B1-B2', owsa: 'B2-C1' };
const ALL_UNITS = LEVELS.flatMap(L => L.units.map((u, i) => ({ ...u, n: i + 1, level: L.id, levelFa: L.fa, cefr: CEFR_OF[L.id] || 'A2' })));
ALL_UNITS.forEach((u, i) => { u.idx = i; u.baseWords = parseWords(u.words || ''); });
const WS_UNITS = WORD_TRACK.flatMap(L => L.units.map(u => ({ ...u, level: L.id, levelFa: L.fa, cefr: CEFR_OF[L.id] || 'A2', track: 'ws' })));
WS_UNITS.forEach((u, i) => { u.idx = 2000 + i; u.wsi = i; u.baseWords = []; });
/* واژه‌های Word Skills از فایل‌های آفلاین words/<سطح>.json (یک بار دانلود، بعد بدون اینترنت) */
const WS_LOADED = {};
function wsLoad(level) { if (!WORD_TRACK.some(l => l.id === level)) return Promise.resolve(); return WS_LOADED[level] || (WS_LOADED[level] = fetch(`words/${level}.json`).then(r => r.json()).then(j => { WS_UNITS.filter(u => u.level === level).forEach(u => { u.baseWords = parseWords(j[u.id] || ''); }); }).catch(() => { delete WS_LOADED[level]; })); }
const wsLevelOf = id => WS_UNITS.find(u => u.id === id)?.level;
setTimeout(() => WORD_TRACK.forEach(l => wsLoad(l.id)), 5000);
const nextUnit = u => u.track === 'ws' ? WS_UNITS[u.wsi + 1] : u.idx < 1000 ? ALL_UNITS[u.idx + 1] : null;
const currentWS = () => WS_UNITS.find(u => isOpen(u) && !isMastered(u)) || WS_UNITS[WS_UNITS.length - 1];
function parseWords(txt) { return txt.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [w, ipa, fa, img, pos, ex, reg, use, exFa] = l.split('|'); return { w, ipa, fa, img, pos, ex, reg, use, exFa }; }); }
const REG = { f: ['رسمی', 'acc'], n: ['خنثی؛ همه‌جا', ''], i: ['خودمونی', 'ok'], s: ['عامیانه', 'bad'] };
const regPill = w => w.reg && REG[w.reg] ? ` <span class="pill ${REG[w.reg][1]}" title="سطح رسمی بودن">${REG[w.reg][0]}</span>` : '';
const POS = { n: 'اسم', v: 'فعل', adj: 'صفت', adv: 'قید', prep: 'حرف اضافه', phr: 'عبارت', sent: 'جمله' };

const DEFAULT_SETTINGS = {
  brain: 'gemini',
  prov: {
    gemini: { key: '', model: 'gemini-3.1-flash-lite' },
    anthropic: { key: '', model: 'claude-haiku-5-5' },
    openai: { key: '', model: 'gpt-4.1-mini', base: '' },
    groq: { key: '', model: 'llama-3.3-70b-versatile' },
    openrouter: { key: '', model: 'meta-llama/llama-3.3-70b-instruct:free' },
    custom: { key: '', model: '', base: '' }
  },
  voiceEn: 'browser', voiceFa: 'gemini', listen: 'browser',
  accent: 'US', rate: 0.95,
  geminiTtsModel: 'gemini-3.8-flash-tts', geminiVoice: 'Kore', openaiVoice: 'nova',
  teacher: 'رستا', img: 'set', pixabayKey: '', passScore: 95, theme: 'light', autoSpeak: true
};
const G = { // سراسری (مشترک بین کاربران همین دستگاه)
  users: lsGet('zd:users', []),
  active: lsGet('zd:active', null),
  settings: deepMerge(structuredClone(DEFAULT_SETTINGS), lsGet('zd:settings', {})),
  extra: lsGet('zd:extra', {}),      // لغات و محتوای تکمیلی هر درس (ساخته‌شده با AI) — مشترک
  img: lsGet('zd:img', {}),          // آدرس تصویر هر واژه
  cache: lsGet('zd:cache', {})       // دیالوگ‌ها، «چرا این درس» و…
};
const makeCode = () => 'ZD1.' + btoa(unescape(encodeURIComponent(JSON.stringify({ q: +G.settings.dailyBudget || 1.5, b: G.settings.brain, p: Object.fromEntries(Object.entries(G.settings.prov).filter(([, x]) => x.key).map(([k, x]) => [k, { key: x.key, model: x.model }])), v: G.settings.voiceFa, l: G.settings.listen }))));
function useCode(c) { // فقط کلید و نام مدل ارائه‌دهنده‌های شناخته‌شده پذیرفته می‌شود (آدرس سرور هرگز)
  const d = JSON.parse(decodeURIComponent(escape(atob(c.trim().replace(/^ZD1\./, ''))))); const P = d && typeof d.p === 'object' ? d.p : {};
  for (const k of Object.keys(DEFAULT_SETTINGS.prov)) { const x = P[k]; if (!x || typeof x !== 'object') continue; if (typeof x.key === 'string' && /^[\w.\-]{10,300}$/.test(x.key)) G.settings.prov[k].key = x.key; if (typeof x.model === 'string' && /^[\w.\-/:]{2,80}$/.test(x.model)) G.settings.prov[k].model = x.model; }
  if (typeof d.q === 'number' && d.q >= 0.05 && d.q <= 50) G.settings.dailyBudget = d.q;
  if (Object.keys(DEFAULT_SETTINGS.prov).includes(d.b)) G.settings.brain = d.b; if (['gemini', 'openai', 'browser'].includes(d.v)) G.settings.voiceFa = d.v; if (['browser', 'groq', 'gemini', 'openai'].includes(d.l)) G.settings.listen = d.l; saveG('settings'); }
function deepMerge(a, b) { for (const k in b) { if (k === '__proto__' || k === 'constructor' || k === 'prototype' || !Object.prototype.hasOwnProperty.call(b, k)) continue; if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) a[k] = deepMerge(a[k] || {}, b[k]); else a[k] = b[k]; } return a; }
const saveG = k => lsSet('zd:' + k, G[k]);
G.settings.passScore = 95;
if (G.settings.img !== 'photo' && G.settings.img !== 'set') { G.settings.img = 'set'; saveG('settings'); }
for (const k in G.img) if (/pollinations/.test(G.img[k])) delete G.img[k]; saveG('img');
if (G.settings.teacher === 'سارا') { G.settings.teacher = 'رستا'; lsSet('zd:settings', G.settings); }
if (G.settings.prov.gemini.model === 'gemini-2.5-flash') { G.settings.prov.gemini.model = 'gemini-3.1-flash-lite'; G.settings.geminiTtsModel = 'gemini-3.8-flash-tts'; saveG('settings'); }
const GEM_FALLBACK = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash'];
const TTS_FALLBACK = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-2.5-flash-preview-tts'];
/* سرور واسط: کلیدهای مدیر روی سرور (Supabase Edge Function) است؛ کاربر هیچ کلیدی وارد نمی‌کند */
const serverOK = () => typeof SB_URL !== 'undefined' && lsGet('zd:noServer', 0) < Date.now();
try { localStorage.removeItem('zd:noServer'); } catch { }
const gemKey = () => G.settings.prov.gemini.key || (serverOK() ? 'server' : '');
async function serverGem(models, path, body) {
  let s = await session(); if (!s) { const { error } = await sb().auth.signInAnonymously(); if (error) throw new Error('NOKEY'); s = await session(); }
  const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), 60000);
  let r; try { r = await fetch(SB_URL + '/functions/v1/ai', { method: 'POST', signal: ac.signal, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + s.access_token, apikey: SB_KEY }, body: JSON.stringify({ models: [...new Set(models)], path, payload: body }) }); }
  catch (e) { clearTimeout(tm); if (e.name === 'AbortError') throw new Error('پاسخ دیر شد'); throw new Error('اتصال به اینترنت برقرار نشد؛ دوباره امتحان کن.'); }
  clearTimeout(tm); const d = await r.json().catch(() => ({}));
  if (r.ok) return d; if (r.status === 402) throw new Error('BUDGET'); if (r.status === 403 && /AI_OFF/.test(d.error || '')) throw new Error('AIOFF'); if (r.status === 404 || (r.status === 503 && /no server key/.test(d.error || ''))) { lsSet('zd:noServer', Date.now() + 2 * 60000); throw new Error('هوش مصنوعی برنامه لحظه‌ای در دسترس نیست؛ چند دقیقهٔ دیگر امتحان کن.'); }
  if (r.status === 503 || r.status === 429) throw new Error('هوش مصنوعی الان شلوغ است؛ چند دقیقهٔ دیگر دوباره امتحان کن.');
  throw new Error(d.error || r.status);
}
async function gemFetch(models, path, body, key) { // اگر مدلی شلوغ یا حذف شده بود، مدل بعدی
  if (key === 'server') return serverGem(models, path, body);
  let last; for (const m of [...new Set(models)]) {
    const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), 20000);
    let r; try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:${path}`, { method: 'POST', signal: ac.signal, headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) }); }
    catch (e) { clearTimeout(tm); if (e.name === 'AbortError') { last = new Error('پاسخ دیر شد'); continue; } throw e; }
    clearTimeout(tm); const d = await r.json().catch(() => ({})); if (r.ok) return d;
    last = new Error(d.error?.message || r.status); if (![404, 429, 500, 503].includes(r.status)) throw last;
  } throw last;
}

let U = null; // داده‌های کاربر فعال
const blankUser = () => ({ srs: {}, units: {}, mistakes: [], mem: [], log: {}, xp: 0, badges: [], convos: {}, plan: null, placement: null, custom: [] });
function loadUser(id) { U = Object.assign(blankUser(), lsGet('zd:u:' + id, {})); G.active = id; saveG('active'); if (!U.mig1) { U.mig1 = 1; if (Object.values(U.units).some(x => x.mastered) && !U.units.hello) U.units.hello = { mastered: true, auto: true, steps: {}, best: {} }; if (U.placement) U.placement.openTo = (U.placement.openTo || 0) + 1; saveU(); }
  if (!U.mig2) { U.mig2 = 1; if (U.plan) { try { const P = U.plan; const end = addDays(P.start, P.dayCount - 1); const left = Math.max(30, Math.round((parseDay(end) - parseDay(isoDay())) / DAY) + 1); U.plan = buildPlan({ ...P, start: isoDay(), days: left }); U.plan.dayCount = left; } catch { } } saveU(); } }
function saveU() { if (G.active) lsSet('zd:u:' + G.active, U); }
const userData = id => Object.assign(blankUser(), lsGet('zd:u:' + id, {}));
const me = () => G.users.find(u => u.id === G.active);

function unitWords(u) {
  const extra = (G.extra[u.id]?.words) || [];
  const seen = new Set(u.baseWords.map(w => w.w.toLowerCase()));
  return [...u.baseWords, ...extra.filter(w => !seen.has(w.w.toLowerCase()))];
}
const unitById = id => ALL_UNITS.find(u => u.id === id) || WS_UNITS.find(u => u.id === id) || (U?.custom || []).map(c => ({ ...c, baseWords: c.words || [], idx: 1000 })).find(u => u.id === id);
const wid = (u, w) => u.id + ':' + w.w;

/* ───────── مرور فاصله‌دار (لایتنر هشت‌خانه) ───────── */
const BOX_DAYS = [0, 1, 3, 7, 14, 30, 60, 120];
function srsOf(id) { return U.srs[id] || { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; }
function grade(id, ok) {
  const s = srsOf(id); s.seen++;
  if (ok) { s.right++; s.box = Math.min(7, s.box + 1); } else { s.wrong++; s.box = Math.max(0, s.box >= 3 ? 1 : 0); s.lastWrong = isoDay(); }
  s.due = addDays(isoDay(), BOX_DAYS[s.box]); U.srs[id] = s; addXP(ok ? 2 : 1); saveU();
}
const dueIds = () => Object.entries(U.srs).filter(([, s]) => s.due <= isoDay()).map(([k]) => k);
const learnedCount = () => Object.values(U.srs).filter(s => s.box >= 4).length;
function wordFromId(id) { const [uidp, ...rest] = id.split(':'); const u = unitById(uidp); if (!u) return null; const w = unitWords(u).find(x => x.w === rest.join(':')); return w ? { u, w } : null; }
function weakWords(limit = 20) {
  return Object.entries(U.srs).filter(([, s]) => s.wrong > 0 && s.box <= 2).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, limit).map(([k]) => wordFromId(k)).filter(Boolean);
}
function forgottenFromPrevious(cur) { // واژه‌های درس‌های قبل که فراموش شده‌اند
  return Object.entries(U.srs).filter(([k, s]) => { const u = unitById(k.split(':')[0]); return u && cur && u.id !== cur.id && (u.track === 'ws' ? isMastered(u) : u.idx < cur.idx) && s.lastWrong && s.box <= 1; }).slice(0, 12).map(([k]) => wordFromId(k)).filter(Boolean);
}

/* ───────── پیشرفت، باز شدن درس‌ها و امتیاز ───────── */
function unitState(u) { return U.units[u.id] || (U.units[u.id] = { steps: {}, best: {} }); }
function isMastered(u) { return !!unitState(u).mastered; }
function isOpen(u) { return true; // همهٔ درس‌ها برای همه باز است (قفل برداشته شد)
  { const ul = lsGet('zd:unlock:' + G.active, ''); if (ul === 'all') return true; if (ul && u.idx < 1000) { const order = LEVELS.map(l => l.id); if (order.indexOf(u.level) <= order.indexOf(ul)) return true; } }
  if (u.track === 'ws') return true; // واژگان موضوعی مثل کتاب مرجع؛ همهٔ موضوع‌ها باز
  if (u.idx >= 1000) return true;
  if (u.idx === 0) return true;
  if (U.placement && u.idx <= U.placement.openTo) return true;
  const prev = ALL_UNITS[u.idx - 1];
  return isMastered(prev);
}
function currentUnit() { return ALL_UNITS.find(u => isOpen(u) && !isMastered(u)) || ALL_UNITS[ALL_UNITS.length - 1]; }
function markStep(u, k) { const st = unitState(u); if (!st.steps[k]) { st.steps[k] = isoDay(); addXP(20); toast('یک قدم از درس کامل شد ✓ +۲۰ امتیاز'); } saveU(); }
function masteredCount(data = U) { return Object.values(data.units).filter(x => x.mastered).length; }

const BADGES = [
  { id: 'first', ic: '🌱', fa: 'اولین قدم', test: d => d.xp > 0 },
  { id: 'w50', ic: '📚', fa: '۵۰ واژهٔ تثبیت‌شده', test: d => Object.values(d.srs).filter(s => s.box >= 4).length >= 50 },
  { id: 'w200', ic: '🧠', fa: '۲۰۰ واژهٔ تثبیت‌شده', test: d => Object.values(d.srs).filter(s => s.box >= 4).length >= 200 },
  { id: 's3', ic: '🔥', fa: 'سه روز پشت‌سرهم', test: d => streakOf(d) >= 3 },
  { id: 's7', ic: '⚡', fa: 'یک هفتهٔ بی‌وقفه', test: d => streakOf(d) >= 7 },
  { id: 's30', ic: '🏔️', fa: 'یک ماه بی‌وقفه', test: d => streakOf(d) >= 30 },
  { id: 'u1', ic: '🎓', fa: 'اولین درس قبول', test: d => masteredCount(d) >= 1 },
  { id: 'intro', ic: '🥉', fa: 'پایان مقدماتی', test: d => ALL_UNITS.filter(u => u.level === 'intro').every(u => d.units[u.id]?.mastered) },
  { id: 'l1', ic: '🥈', fa: 'پایان سطح ۱', test: d => ALL_UNITS.filter(u => u.level === 'l1').every(u => d.units[u.id]?.mastered) },
  { id: 'talk', ic: '🗣️', fa: '۱۰۰ نوبت مکالمه', test: d => (d.talkTurns || 0) >= 100 },
  { id: 'perfect', ic: '💯', fa: 'نمرهٔ کامل در آزمون', test: d => Object.values(d.units).some(x => x.best?.exam >= 100) }
];
function addXP(n) {
  U.xp = (U.xp || 0) + n; const t = isoDay(); const L = U.log[t] || (U.log[t] = { xp: 0, min: 0 }); L.xp += n;
  for (const b of BADGES) if (!U.badges.includes(b.id) && b.test(U)) { U.badges.push(b.id); setTimeout(() => toast(`نشان تازه: ${b.ic} ${b.fa}`), 600); }
}
function streakOf(d) { let n = 0, day = isoDay(); if (!d.log[day]?.xp) day = addDays(day, -1); while (d.log[day]?.xp) { n++; day = addDays(day, -1); } return n; }
const weekXP = d => { let s = 0; for (let i = 0; i < 7; i++) s += d.log[addDays(isoDay(), -i)]?.xp || 0; return s; };
const rankOf = xp => xp < 300 ? 'تازه‌کار' : xp < 1500 ? 'کاشف' : xp < 4000 ? 'سخنور' : xp < 9000 ? 'روان‌گو' : 'استاد';

/* زمان مطالعه: هر ۳۰ ثانیهٔ فعال حساب می‌شود */
let lastAct = Date.now();
['pointerdown', 'keydown'].forEach(e => addEventListener(e, () => { lastAct = Date.now(); unlockAudio(); }, { passive: true }));
/* زمان مطالعهٔ هر زبان جدا (برای رقابت فقط بین هم‌زبان‌ها): هر افزایش دقیقه به زبانِ در حال یادگیری نسبت داده می‌شود */
let LM_SEEN = null;
function langMinTick() { try { if (!U) return; const t = isoDay(); const L = U.log[t]; if (!L) return; const k = t + ':' + (G?.active || ''); if (!LM_SEEN || LM_SEEN.k !== k) { LM_SEEN = { k, v: L.min || 0 }; return; } const d = (L.min || 0) - LM_SEEN.v; LM_SEEN.v = L.min || 0; if (d > 0 && d < 120) { L.ml = L.ml || {}; const lg = tl(); L.ml[lg] = +((L.ml[lg] || 0) + d).toFixed(2); } } catch { } }
setInterval(langMinTick, 5000);
const langMinOf = (day, lg) => { const L = U.log[day]; if (!L) return 0; if (L.ml) return L.ml[lg] || 0; return lg === 'en' ? (L.min || 0) : 0; }; // روزهای قبل از این قابلیت = انگلیسی
setInterval(() => { if (U && document.visibilityState === 'visible' && Date.now() - lastAct < 60000) { const t = isoDay(); const L = U.log[t] || (U.log[t] = { xp: 0, min: 0 }); L.min = +(L.min + 0.5).toFixed(1); saveU(); } }, 30000);

function paceInfo() { // سرعت یادگیری و پیش‌بینی
  const days = Object.keys(U.log).sort(); const first = days[0] || isoDay();
  const span = Math.max(7, Math.round((parseDay(isoDay()) - parseDay(first)) / DAY) + 1);
  const m = masteredCount(); const perWeek = m / span * 7;
  const target = ALL_UNITS.length; const left = target - m;
  const eta = perWeek > 0 ? addDays(isoDay(), Math.ceil(left / perWeek * 7)) : null;
  const minutes = days.reduce((s, d) => s + (U.log[d].min || 0), 0);
  return { perWeek: +perWeek.toFixed(1), eta, mastered: m, left, minutes: Math.round(minutes), span: Math.round(span) };
}

/* ───────── هوش مصنوعی (چند ارائه‌دهنده) ───────── */
const PROVIDERS_NOTE = 'برای ایران بدون VPN: کلید یک سرویس واسط ایرانی سازگار با OpenAI را در بخش OpenAI بگذار و آدرسش را در «آدرس واسط» بنویس.';
const PROVIDERS = {
  gemini: { fa: 'Google Gemini (رایگان)', keyUrl: 'https://aistudio.google.com/apikey' },
  anthropic: { fa: 'Claude (Anthropic)', keyUrl: 'https://console.anthropic.com/settings/keys' },
  openai: { fa: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys' },
  groq: { fa: 'Groq (رایگان، بسیار سریع)', keyUrl: 'https://console.groq.com/keys' },
  openrouter: { fa: 'OpenRouter', keyUrl: 'https://openrouter.ai/keys' },
  custom: { fa: 'سرویس سازگار با OpenAI', keyUrl: '' }
};
const hasAI = () => !!G.settings.prov[G.settings.brain]?.key || serverOK();
function firstKeyed() { const p = G.settings.prov; return ['gemini', 'groq', 'anthropic', 'openai', 'openrouter', 'custom'].find(k => p[k]?.key) || (serverOK() ? 'server' : undefined); }

/* اگر سهمیهٔ یک سرویس تمام شد یا خطا داد، خودکار سراغ سرویس بعدیِ دارای کلید می‌رود */
/* ───── زبان هدف: انگلیسی یا عربی (با لهجه) ───── */
const TLANGS = {
  ar: { fa: 'عربی', flag: '🇴🇲', name: 'ARABIC', def: 'om', v: { om: ['Omani / Gulf Arabic (Khaleeji, as spoken in Oman)', 'عمانی / خلیجی', 'ar-OM'], msa: ['Modern Standard Arabic (Fusha)', 'فصحی (عربی معیار)', 'ar-SA'], eg: ['Egyptian Arabic', 'مصری', 'ar-EG'], lev: ['Levantine Arabic (Syrian/Lebanese)', 'شامی', 'ar-SY'], iq: ['Iraqi Arabic', 'عراقی', 'ar-IQ'] },
    rules: 'Write Arabic in Arabic script with harakat on new words, ALWAYS add the pronunciation in PERSIAN SCRIPT (e.g. «السلام عليكم = اَسّلامُ عَلِیکُم») — NEVER Latin transliteration, point out the Modern Standard Arabic form when the dialect differs, and point out false friends with Persian (words shared with Persian but different in meaning or pronunciation).' },
  de: { fa: 'آلمانی', flag: '🇩🇪', name: 'GERMAN', def: 'de', v: { de: ['Standard German (Hochdeutsch, as spoken in Germany)', 'آلمانی معیار', 'de-DE'], at: ['Austrian German', 'اتریشی', 'de-AT'], ch: ['Swiss Standard German', 'سوئیسی', 'de-CH'] },
    rules: 'ALWAYS give every noun with its article (der/die/das) and plural, verbs with their key forms (infinitive, 3rd person present, Präteritum, Partizip II with haben/sein), mark the case after prepositions, explain du vs Sie, and add the pronunciation in PERSIAN SCRIPT (never Latin transliteration).' },
  tr: { fa: 'ترکی استانبولی', flag: '🇹🇷', name: 'TURKISH', def: 'tr', v: { tr: ['Istanbul Turkish (standard Türkiye Türkçesi)', 'استانبولی', 'tr-TR'] },
    rules: 'Explain vowel harmony and suffix chains step by step (split every long word into root + suffixes with the meaning of each), give the pronunciation in PERSIAN SCRIPT, point out the many words shared with Persian and the false friends, and teach sen vs siz.' },
  zh: { fa: 'چینی', flag: '🇨🇳', name: 'CHINESE', def: 'cmn', v: { cmn: ['Mandarin Chinese (Putonghua, simplified characters)', 'ماندارین', 'zh-CN'], tw: ['Taiwanese Mandarin (traditional characters)', 'ماندارین تایوانی', 'zh-TW'], yue: ['Cantonese (Hong Kong)', 'کانتونی', 'zh-HK'] },
    rules: 'ALWAYS write each item as Chinese characters + pinyin WITH tone marks (Jyutping for Cantonese) + pronunciation in PERSIAN SCRIPT + Persian meaning. Teach tones explicitly and how a wrong tone changes meaning; give the measure word with every noun; use radicals as memory tricks.' } };
const tl = () => (typeof U !== 'undefined' && U?.tl) || 'en';
const tlInfo = () => TLANGS[tl()];
const tlDia = () => { const L = tlInfo(); if (!L) return ['English', 'انگلیسی', 'en-US']; const k = (typeof U !== 'undefined' && U?.tlv?.[tl()]) || L.def; return L.v[k] || L.v[L.def]; };
const tlFa = () => tl() === 'en' ? 'انگلیسی' : `${tlInfo().fa} (${tlDia()[1]})`;
const TL_OVERRIDE = () => tl() === 'en' ? '' : `

=== TARGET LANGUAGE OVERRIDE (most important rule) ===
The learner is learning ${tlInfo().name} — ${tlDia()[0]} — NOT English. Wherever these instructions mention English, an English accent (American/British), IPA or English examples, apply them to ${tlDia()[0]} instead. Teach real, natural ${tlDia()[0]} as natives actually speak it. ${tlInfo().rules} Always give the Persian meaning, register (formal/everyday/slang) and real example sentences with Persian translations. Keep JSON field names exactly as requested (fields named "en"/"w"/"ex" simply hold the ${tlDia()[0]} text).`;
async function ai(opts) {
  if (tl() !== 'en' && opts?.system && !opts.__tl) opts = { ...opts, system: opts.system + TL_OVERRIDE(), __tl: 1 };
  const order = [G.settings.brain, 'gemini', 'groq', 'openrouter', 'anthropic', 'openai', 'custom'].filter((k, i, a) => a.indexOf(k) === i && G.settings.prov[k]?.key);
  if (serverOK()) order.push('server');
  if (!order.length) throw new Error('NOKEY'); if (order[0] !== 'server') budgetGuard();
  let last; for (const pv of order) {
    if (lsGet('zd:cool:' + pv, 0) > Date.now() && pv !== order[order.length - 1]) continue; // سرویسی که تازه به سقف خورده، چند دقیقه کنار می‌رود
    try { return await aiOne(pv, opts); }
    catch (e) { last = e; if (/JSON|قابل خواندن/.test(e.message) || opts.images?.length && pv !== 'gemini') throw e; if (/quota|rate|limit|429|exhaust|insufficient|credit|billing|overloaded|503|500/i.test(e.message)) lsSet('zd:cool:' + pv, Date.now() + 10 * 60000); }
  }
  throw last;
}
async function aiOne(pv, { system, messages, json = true, images = [], max = 1400, temp = 0.8, heavy = false }) {
  const c = pv === 'server' ? { key: 'server', model: G.settings.prov.gemini.model } : G.settings.prov[pv];
  const sys = system + (json ? '\nReturn ONLY valid JSON, no markdown fences.' : '');
  let text = '';
  if (pv === 'gemini' || pv === 'server') {
    const contents = messages.map((m, i) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }, ...(i === messages.length - 1 ? images.map(im => ({ inlineData: { mimeType: im.mime, data: im.b64 } })) : [])] }));
    const gc = { temperature: temp, maxOutputTokens: max };
    if (json) gc.responseMimeType = 'application/json';
    const d = await gemFetch(heavy ? ['gemini-3.5-flash', 'gemini-flash-latest', c.model, ...GEM_FALLBACK] : [c.model, ...GEM_FALLBACK], 'generateContent', { systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: gc }, c.key);
    text = d.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  } else if (pv === 'anthropic') {
    const msgs = messages.map((m, i) => ({ role: m.role, content: i === messages.length - 1 && images.length ? [...images.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.mime, data: im.b64 } })), { type: 'text', text: m.content }] : m.content }));
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: c.model, max_tokens: max, temperature: temp, system: sys, messages: msgs }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
    text = d.content?.map(b => b.text || '').join('') || '';
  } else {
    const oaBase = () => (G.settings.prov.openai.base || 'https://api.openai.com/v1').replace(/\/$/, '');
    const base = pv === 'openai' ? oaBase() : pv === 'groq' ? 'https://api.groq.com/openai/v1' : pv === 'openrouter' ? 'https://openrouter.ai/api/v1' : c.base.replace(/\/$/, '');
    const msgs = [{ role: 'system', content: sys }, ...messages.map((m, i) => ({ role: m.role, content: i === messages.length - 1 && images.length ? [{ type: 'text', text: m.content }, ...images.map(im => ({ type: 'image_url', image_url: { url: `data:${im.mime};base64,${im.b64}` } }))] : m.content }))];
    const body = { model: c.model, messages: msgs, temperature: temp, max_tokens: max }; if (json) body.response_format = { type: 'json_object' };
    const r = await fetch(base + '/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + c.key }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
    text = d.choices?.[0]?.message?.content || '';
  }
  const inC = sys.length + messages.reduce((n, m) => n + (m.content?.length || 0), 0) + images.length * 1000; trackAI('chat', inC + text.length, costOf(pv, c.model, inC, text.length) * (heavy ? 2 : 1));
  if (!json) return text;
  return parseJSON(text);
}
function trackAI(kind, chars, usd = 0) { if (!U) return; const t = isoDay(); const a = U.aiUse || (U.aiUse = {}); const d = a[t] || (a[t] = { chat: 0, voice: 0, chars: 0 }); d[kind]++; d.chars += chars || 0; d.usd = +((d.usd || 0) + usd).toFixed(5); if (!U.aiStart) U.aiStart = t; saveU(); }
/* ───── سهمیهٔ روزانهٔ هوش مصنوعی: مانده هر روز برای روزهای بعد ذخیره می‌شود (حداکثر ۳۰ روز) ───── */
const PRICE = { anthropic: m => /sonnet/.test(m) ? [2, 10] : /opus/.test(m) ? [10, 50] : [0.10, 0.50], gemini: m => /pro/.test(m) ? [1.25, 10] : [0.10, 0.40], openai: () => [0.15, 0.60], groq: () => [0.05, 0.10], openrouter: () => [0.20, 0.80], custom: () => [0.20, 0.80] };
const costOf = (pv, model, inC, outC) => { const [pi, po] = (PRICE[pv] || PRICE.custom)(model || ''); return (inC / 4 * pi + outC / 4 * po) / 1e6; };
const isAdminHere = () => !!lsGet('zd:admin:' + G.active, false);
function aiBudget() {
  const daily = +G.settings.dailyBudget || 1.5; const today = isoDay(); const start = U.aiStart || today; let bank = 0;
  for (let d = start, n = 0; d < today && n < 400; d = addDays(d, 1), n++) bank = Math.min(daily * 30, bank + daily - (U.aiUse?.[d]?.usd || 0));
  bank = Math.max(0, bank); const spent = U.aiUse?.[today]?.usd || 0; const left = daily + bank - spent;
  return { daily, bank, spent, left, unlimited: isAdminHere() };
}
function budgetGuard() { if (!U) return; const b = aiBudget(); if (!b.unlimited && b.left <= 0) throw new Error('BUDGET'); }
function aiUseSum(d, days = 30) { let chat = 0, voice = 0, chars = 0; for (let i = 0; i < days; i++) { const x = d.aiUse?.[addDays(isoDay(), -i)]; if (x) { chat += x.chat; voice += x.voice; chars += x.chars; } } return { chat, voice, chars }; }
function parseJSON(t) {
  try { return JSON.parse(t); } catch { }
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s >= 0 && e > s) { try { return JSON.parse(t.slice(s, e + 1)); } catch { } }
  throw new Error('پاسخ هوش مصنوعی قابل خواندن نبود؛ دوباره امتحان کن.');
}
function aiErr(e) {
  if (e.message === 'AIOFF') { toast('دسترسی هوش مصنوعی برای حساب تو فعلاً بسته است؛ با مدیر برنامه تماس بگیر.', 6000); return; }
  if (e.message === 'BUDGET') { toast('سهمیهٔ هوش مصنوعی امروزت تمام شد 🙂 فردا دوباره پر می‌شود؛ تا آن موقع فلش‌کارت، تمرین آفلاین و رادیو در دسترس است.', 6000); return; }
  if (e.message === 'NOKEY') { toast('هوش مصنوعی برنامه الان در دسترس نیست؛ اینترنت را بررسی کن و چند دقیقهٔ دیگر دوباره امتحان کن.', 5000); return; }
  if (/failed to fetch|networkerror|load failed|location is not supported|not available in your country/i.test(e.message)) { toast('اتصال به هوش مصنوعی برقرار نشد. اگر در ایران هستی، VPN را روشن کن و دوباره امتحان کن.', 6000); return; }
  toast('خطای هوش مصنوعی: ' + e.message);
}

/* زمینهٔ شخصی هر کاربر برای هوش مصنوعی (حافظه) */
function learnerContext(unit) {
  const u = me(); const cur = unit || currentUnit(); const p = paceInfo();
  const weak = weakWords(15).map(x => x.w.w).join(', ');
  const forgot = forgottenFromPrevious(cur).map(x => `${x.w.w} (unit ${x.u.en})`).join(', ');
  const prevUnits = ALL_UNITS.filter(x => x.idx < cur.idx && isMastered(x)).slice(-4);
  const prevWords = prevUnits.flatMap(x => pick(unitWords(x), 4).map(w => w.w)).join(', ');
  const mistakes = (typeof cleanMistakes === 'function' ? cleanMistakes(8) : U.mistakes.slice(-8)).map(m => `${m.wrong} → ${m.right}`).join('; ');
  const seenM = new Set(); const mem = U.mem.slice().reverse().filter(m => { const t = String(m.t || '').trim(); if (!t || t.length > 160 || /^(rasta|mona)?,? ?you\b/i.test(t) || /asking for clarification|starting the first quiz|completed the first practice/i.test(t)) return false; const k = t.toLowerCase().replace(/[^a-z\u0600-\u06ff]/g, ''); if (seenM.has(k)) return false; seenM.add(k); return true; }).slice(0, 15).reverse().map(m => '- ' + m.t).join('\n');
  return `LEARNER PROFILE
Name: ${u?.name || ''} (always write this name exactly as given, never change its spelling). Native language: Persian. Lives.
Current unit: ${cur.en} (${cur.levelFa || ''}, CEFR ${cur.cefr || ''}), units mastered: ${p.mastered}/${ALL_UNITS.length}, study streak: ${streakOf(U)} days, pace: ${p.perWeek} units/week, total study ${p.minutes} minutes${p.eta ? ', predicted finish of B1+ path: ' + p.eta : ''}.
Words from previous units to recycle naturally: ${prevWords || '-'}
Words from previous units the learner FORGOT (mention this humanly, e.g. "I didn't expect you to forget this one from unit X", then re-teach briefly): ${forgot || '-'}
Study plan: ${U.plan ? `target ${U.plan.target === 'l1' ? 'Intro+Level 1' : 'up to B1+'} by ${addDays(U.plan.start, U.plan.dayCount - 1)}, ${U.plan.minutes} min/day, behind by ${planGap()} units (if behind, firmly but kindly push the learner to catch up today)` : 'none yet (encourage making one)'}.
Weak words: ${weak || '-'}
Recent mistakes: ${mistakes || '-'}
Long-term memory about the learner (names other than the learner's own name that appear here usually come from role-play or example sentences — the learner's real name is the one above):
${mem || '- (nothing yet)'}`;
}
function remember(t) { if (!t || typeof t !== 'string' || t.length < 4) return; if (U.mem.some(m => m.t === t)) return; U.mem.push({ t, d: isoDay() }); if (U.mem.length > 60) U.mem.shift(); saveU(); }
function logMistakes(list, src) { (list || []).forEach(m => { if (m && m.wrong && m.right) U.mistakes.push({ wrong: m.wrong, right: m.right, why: m.why || '', src, d: isoDay() }); }); if (U.mistakes.length > 200) U.mistakes = U.mistakes.slice(-200); saveU(); }

/* ───────── صدا: خواندن (TTS) ───────── */
const player = new Audio(); player.preload = 'auto';
let audioUnlocked = false;
function unlockAudio() { if (audioUnlocked) return; audioUnlocked = true; try { player.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; player.play().catch(() => { }); } catch { } try { speechSynthesis.getVoices(); } catch { } }
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch { voices = []; } }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function bestVoice(lang) {
  const pref = lang === 'fa' ? ['fa-IR', 'fa'] : /^(ar|de|tr|zh)/.test(lang) ? [lang, lang.slice(0, 2)] : G.settings.accent === 'UK' ? ['en-GB'] : ['en-US'];
  const list = voices.filter(v => pref.some(p => v.lang.replace('_', '-').toLowerCase().startsWith(p.toLowerCase())));
  const score = v => (/natural|online|neural|premium|enhanced/i.test(v.name) ? 3 : 0) + (/google|microsoft|samantha|daniel|serena/i.test(v.name) ? 1 : 0);
  return list.sort((a, b) => score(b) - score(a))[0] || (lang === 'fa' ? null : voices.find(v => v.lang.startsWith('en')));
}
let speakToken = 0;
let blobRes = null;
function haltAudio() { try { speechSynthesis.cancel(); } catch { } try { player.pause(); } catch { } const r = blobRes; blobRes = null; r?.(); }
function stopSpeak() { speakToken++; haltAudio(); }
function browserSay(text, lang, rate) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res(false);
    const v = bestVoice(lang); if (lang === 'fa' && !v) return res(false);
    const u = new SpeechSynthesisUtterance(text); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = G.settings.accent === 'UK' ? 'en-GB' : 'en-US';
    u.rate = rate || G.settings.rate; u.onend = () => res(true); u.onerror = () => res(true);
    try { if (speechSynthesis.paused) speechSynthesis.resume(); speechSynthesis.speak(u); } catch { res(false); }
  });
}
function pcmToWav(b64, rate = 24000) {
  const bin = atob(b64);
  if (bin.startsWith('RIFF')) { const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: 'audio/wav' }); } // خروجی جدید Gemini خودش WAV است
  const len = bin.length; const buf = new ArrayBuffer(44 + len); const v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + len, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, len, true);
  const u8 = new Uint8Array(buf, 44); for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: 'audio/wav' });
}
const EMO = { cheerful: 'cheerful and warm', calm: 'calm and gentle', excited: 'excited and energetic', encouraging: 'encouraging and supportive', empathetic: 'kind and empathetic', proud: 'proud and happy', surprised: 'playfully surprised', serious: 'clear and serious' };
const TTS_INFLIGHT = new Map(); // درخواست تکراری برای یک متن، یک بار ساخته می‌شود
function cloudTTS(engine, text, lang, emotion) { const k = [engine, lang, emotion, G.settings.accent, text].join('|'); if (TTS_INFLIGHT.has(k)) return TTS_INFLIGHT.get(k); const p = cloudTTS0(engine, text, lang, emotion).finally(() => setTimeout(() => TTS_INFLIGHT.delete(k), 50)); TTS_INFLIGHT.set(k, p); return p; }
async function cloudTTS0(engine, text, lang, emotion) {
  const acc = G.settings.accent === 'UK' ? 'British (Received Pronunciation)' : 'General American';
  const style = tl() !== 'en' && lang !== 'fa'
    ? `Say the following in natural ${tlDia()[0]}, as a friendly native speaker, clearly and at a learner-friendly pace`
    : tl() !== 'en' && lang === 'fa'
    ? `Say the following in a ${EMO[emotion] || 'warm'} voice, like a friendly Iranian teacher speaking natural, fluent Tehrani Persian; pronounce the foreign words and sentences authentically in ${tlDia()[0]}`
    : lang === 'fa'
    ? `Say the following in a ${EMO[emotion] || 'warm'} voice, like a friendly Iranian teacher speaking natural, fluent Tehrani Persian; pronounce any English words with a clear ${acc} accent`
    : `Say the following in a clear, natural ${acc} English accent, with a ${EMO[emotion] || 'friendly'} tone, at a learner-friendly pace`;
  const key = 'a:' + hashStr([tl() !== 'en' ? tl() + '-' + tlDia()[2] : '', engine, G.settings.geminiVoice, G.settings.openaiVoice, acc, lang, emotion, text].join('|'));
  let blob = await idb.get(key);
  if (!blob) {
    budgetGuard();
    if (engine === 'gemini') {
      const c = { key: gemKey() }; if (!c.key) throw new Error('NOKEY');
      const d = await gemFetch([G.settings.geminiTtsModel, ...TTS_FALLBACK], 'generateContent', { contents: [{ parts: [{ text: `${style}:\n${text}` }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: G.settings.geminiVoice } } } } }, c.key);
      const part = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData); if (!part) throw new Error('صدا ساخته نشد');
      const m = /rate=(\d+)/.exec(part.inlineData.mimeType || ''); blob = pcmToWav(part.inlineData.data, m ? +m[1] : 24000);
    } else {
      const c = G.settings.prov.openai; if (!c.key) throw new Error('NOKEY');
      const r = await fetch((G.settings.prov.openai.base || 'https://api.openai.com/v1').replace(/\/$/, '') + '/audio/speech', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + c.key }, body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: G.settings.openaiVoice, input: text, instructions: style, response_format: 'mp3' }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error?.message || r.status);
      blob = await r.blob();
    }
    idb.set(key, blob); trackAI('voice', text.length, text.length * (engine === 'openai' ? 0.000015 : 0.00002));
  }
  return blob;
}
/* بستهٔ صدای انگلیسی ازپیش‌ساخته (آمریکایی و بریتانیایی) — رایگان، سریع و آفلاین */
const EN_PACK = {};
async function enPackIdx(acc) { if (!EN_PACK[acc]) EN_PACK[acc] = fetch(`audio/en/${acc}/index.json`).then(r => r.json()).then(j => ({ j, all: new Set(Object.values(j).flat()) })).catch(() => (delete EN_PACK[acc], null)); return EN_PACK[acc]; }
const FA_PACK = {};
async function faPackUrl(text) { const acc = G.settings.accent === 'UK' ? 'UK' : 'US'; if (!FA_PACK[acc]) FA_PACK[acc] = fetch(`audio/fa/${acc}/index.json`).then(r => r.json()).then(j => new Set(Object.values(j).flat())).catch(() => (delete FA_PACK[acc], null)); const ix = await FA_PACK[acc]; const h = hashStr((text || '').trim()); return ix?.has(h) ? `audio/fa/${acc}/${h}.mp3` : null; }
const PACKS = {}; // صدای آفلاین هر زبان/لهجه (Microsoft neural؛ از قبل ساخته‌شده)
async function packUrl(text) { const dir = (typeof OFFLINE_DIR !== 'undefined') && OFFLINE_DIR[tlDia()[2]]; if (!dir) return null;
  if (!PACKS[dir]) PACKS[dir] = fetch(`audio/${dir}/index.json`).then(r => r.json()).then(j => new Set(Object.values(j).flat())).catch(() => (delete PACKS[dir], null));
  const ix = await PACKS[dir]; if (!ix) return null; const h = hashStr(arCore(text)); return ix.has(h) ? `audio/${dir}/${h}.mp3` : null; }
const arPackUrl = packUrl;
const arCore = t => String(t || '').split(/\s+[=—–-]\s+|\s*\(/)[0].trim();
async function enPackUrl(text) { const acc = G.settings.accent === 'UK' ? 'UK' : 'US'; const ix = await enPackIdx(acc); if (!ix) return null; for (const t of [(text || '').trim(), (text || '').replace(/\s*\([^)]*\)/g, '').trim()]) { const h = hashStr(t); if (ix.all.has(h)) return `audio/en/${acc}/${h}.mp3`; } return null; }
function playUrl(url, tok) { return new Promise(res => { if (tok !== speakToken) return res(); const done = () => { if (blobRes === done) blobRes = null; res(); }; blobRes = done; player.src = url; player.playbackRate = 1; player.onended = player.onerror = done; player.play().catch(done); }); }
async function downloadEnPack(unitId, btn) {
  const out = {}; for (const acc of ['US', 'UK']) { const ix = await enPackIdx(acc); out[acc] = (ix?.j[unitId] || []).map(h => `audio/en/${acc}/${h}.mp3`); }
  for (const acc of ['US', 'UK']) { const j = await fetch(`audio/fa/${acc}/index.json`).then(r => r.json()).catch(() => ({})); out[acc].push(...(j[unitId] || []).map(h => `audio/fa/${acc}/${h}.mp3`)); }
  const all = [...out.US, ...out.UK]; if (!all.length) return toast('برای این درس هنوز بستهٔ صدا ساخته نشده.');
  const c = await caches.open('zd-media'); let i = 0;
  for (const u of all) { if (!(await c.match(u))) { try { const r = await fetch(u); if (r.ok) await c.put(u, r); } catch { toast('اینترنت قطع شد؛ دوباره بزن تا ادامه بدهد.'); return; } } i++; if (btn) btn.textContent = `⬇ در حال دانلود… ${faNum(Math.round(i / all.length * 100))}٪`; }
  lsSet('zd:enpack:' + unitId, 1); if (btn) btn.textContent = '✓ صدای انگلیسی این درس (آمریکایی + بریتانیایی) آفلاین ذخیره شد'; toast('حالا بدون اینترنت هم همهٔ واژه‌ها و جمله‌ها پخش می‌شوند.');
}
function playBlob(blob, tok) {
  return new Promise(res => { if (tok !== speakToken) return res(); const url = URL.createObjectURL(blob); const done = () => { if (blobRes === done) blobRes = null; URL.revokeObjectURL(url); res(); }; blobRes = done; player.src = url; player.playbackRate = 1; player.onended = player.onerror = done; player.play().catch(done); });
}
/* lang: 'en' یا 'fa' (فارسی همراه با واژه‌های انگلیسی) */
async function say(text, lang = 'en', emotion = 'cheerful', btn) {
  if (!text) return; haltAudio(); const tok = ++speakToken; btn?.classList.add('on'); try { Spatial.wake(); } catch { }
  const engine = lang === 'fa' ? G.settings.voiceFa : G.settings.voiceEn;
  try {
    if (tl() === 'en') { const f = lang === 'en' ? await enPackUrl(text) : await faPackUrl(text); if (f) { await playUrl(f, tok); return; } }
    if (tl() !== 'en' && lang === 'en') { const f = await packUrl(text); if (f) { await playUrl(f, tok); return; } }
    if (tl() !== 'en' && lang === 'en') { try { await playBlob(await cloudTTS(G.settings.voiceFa === 'browser' ? 'gemini' : G.settings.voiceFa, text, tl(), emotion), tok); return; } catch (e) { } await browserSay(text, tlDia()[2]); return; }
    if (engine !== 'browser') { try { await playBlob(await cloudTTS(engine, text, lang, emotion), tok); return; } catch (e) { if (e.message !== 'NOKEY') console.warn(e); } }
    if (lang === 'en') { await browserSay(text, 'en'); return; }
    // فارسی با صدای مرورگر: بخش‌های انگلیسی با صدای انگلیسی
    const parts = text.split(/([A-Za-z][A-Za-z0-9'’,.!?\- ]*[A-Za-z0-9.!?])/).filter(s => s.trim());
    const faOk = !!bestVoice('fa');
    for (const p of parts) { if (tok !== speakToken) break; const en = /^[A-Za-z]/.test(p); if (en) await browserSay(p, 'en'); else if (faOk) await browserSay(p, 'fa', 1); }
    if (!faOk) toast('صدای فارسی روی این دستگاه نیست؛ در تنظیمات «صدای فارسی» را روی Gemini بگذار.');
  } finally { btn?.classList.remove('on'); }
}

/* say() حالا true برمی‌گرداند اگر وسطش قطع نشده باشد (برای پخش پشت‌سرهم) */
const _say = say; say = async (...a) => { const before = speakToken; await _say(...a); return speakToken === before + 1; };

/* ───────── صوت کامل درس/فصل برای دانلود و آفلاین ───────── */
async function pcmOf(blob) { const b = new Uint8Array(await blob.arrayBuffer()); let i = 12; while (i < b.length - 8) { const id = String.fromCharCode(...b.slice(i, i + 4)); const sz = b[i + 4] | b[i + 5] << 8 | b[i + 6] << 16 | b[i + 7] << 24; if (id === 'data') return b.slice(i + 8, i + 8 + sz); i += 8 + sz; } return b.slice(44); }
async function joinWavs(blobs, rate = 24000) {
  const gap = new Uint8Array(rate * 2 * 0.8); const parts = []; for (const b of blobs) { parts.push(await pcmOf(b), gap); }
  const len = parts.reduce((s, p) => s + p.length, 0); let bin = ''; const all = new Uint8Array(len); let o = 0; parts.forEach(p => { all.set(p, o); o += p.length; });
  const h = new DataView(new ArrayBuffer(44)); const w = (k, t) => [...t].forEach((c, j) => h.setUint8(k + j, c.charCodeAt(0)));
  w(0, 'RIFF'); h.setUint32(4, 36 + len, true); w(8, 'WAVE'); w(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true); h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, 'data'); h.setUint32(40, len, true);
  return new Blob([h.buffer, all], { type: 'audio/wav' });
}
/* chunks: [{text, lang}] → یک فایل صوتی؛ هر تکه یک بار ساخته و ذخیره می‌شود */
async function buildAudio(key, chunks, onProgress) {
  const done = await idb.get(key); if (done) return done;
  const eng = gemKey() ? 'gemini' : G.settings.prov.openai.key ? 'openai' : null; if (!eng) throw new Error('NOKEY');
  const blobs = []; for (let i = 0; i < chunks.length; i++) { onProgress?.(i, chunks.length); blobs.push(await cloudTTS(eng, chunks[i].text, chunks[i].lang, chunks[i].emo || 'calm')); }
  const out = eng === 'gemini' ? await joinWavs(blobs) : new Blob(blobs, { type: 'audio/mpeg' }); await idb.set(key, out); return out;
}
function audioBox(el, blob, name) {
  const url = URL.createObjectURL(blob); const ext = blob.type.includes('wav') ? 'wav' : 'mp3';
  el.innerHTML = `<audio controls src="${url}" style="width:100%"></audio><a class="btn ghost sm" href="${url}" download="${esc(name)}.${ext}">⬇ دانلود فایل صوتی</a>`;
}
function unitAudioChunks(u) {
  const words = unitWords(u); const chunks = [{ lang: 'fa', emo: 'cheerful', text: `درس «${u.fa}». بیایید واژه‌ها را با هم مرور کنیم. هر واژه را بشنو و تکرار کن.` }];
  for (let i = 0; i < words.length; i += 8) chunks.push({ lang: 'fa', emo: 'calm', text: words.slice(i, i + 8).map(w => `${w.w} ... یعنی ${w.fa} ... ${w.ex || ''}`).join('\n') });
  const d = G.cache['dlg:' + u.id]; if (d?.lines) chunks.push({ lang: 'en', emo: 'cheerful', text: 'Now listen to the conversation.\n' + d.lines.map(l => `${l.name || l.who}: ${l.en}`).join('\n') });
  return chunks;
}

/* ───────── شنیدن (تشخیص گفتار) ───────── */
function listen(lang = 'en-US') {
  const eng = G.settings.listen; const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (eng === 'browser' && SR) {
    let rec; const p = new Promise((res, rej) => {
      rec = new SR(); rec.lang = lang; rec.interimResults = false; rec.maxAlternatives = 1; let got = '';
      rec.onresult = e => { const fin = [...e.results].filter(r => r.isFinal).map(r => r[0].transcript); got = cleanRepeats(fin.length ? fin[fin.length - 1] : e.results[e.results.length - 1][0].transcript); };
      rec.onerror = e => rej(new Error(e.error === 'not-allowed' ? 'اجازهٔ میکروفون داده نشده' : e.error));
      rec.onend = () => res(got); rec.start();
    });
    return { promise: p, stop: () => { try { rec.stop(); } catch { } } };
  }
  // ضبط و تبدیل ابری
  let mr, stream, chunks = [], stopFn; const p = (async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'].find(m => window.MediaRecorder?.isTypeSupported?.(m)) || '';
    mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise(r => { mr.onstop = r; }); mr.start(); stopFn = () => { try { mr.stop(); } catch { } };
    setTimeout(stopFn, 60000); await done; stream.getTracks().forEach(t => t.stop());
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
    return transcribe(blob, lang);
  })();
  return { promise: p, stop: () => stopFn && stopFn() };
}
async function transcribe(blob, lang) {
  const eng = G.settings.listen === 'browser' ? (G.settings.prov.groq.key ? 'groq' : G.settings.prov.openai.key ? 'openai' : 'gemini') : G.settings.listen;
  const ext = /mp4|aac/.test(blob.type) ? 'm4a' : 'webm';
  if (eng === 'gemini') {
    const c = { key: gemKey(), model: G.settings.prov.gemini.model }; if (!c.key) throw new Error('NOKEY');
    const b64 = await blobB64(blob);
    const d = await gemFetch([c.model, ...GEM_FALLBACK], 'generateContent', { contents: [{ parts: [{ text: `Transcribe this audio exactly as spoken (language: ${lang}). Output only the transcript, keep the learner's mistakes.` }, { inlineData: { mimeType: blob.type.split(';')[0], data: b64 } }] }] }, c.key);
    return d.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim() || '';
  }
  const c = G.settings.prov[eng]; if (!c?.key) throw new Error('NOKEY');
  const fd = new FormData(); fd.append('file', blob, 'speech.' + ext); fd.append('model', eng === 'groq' ? 'whisper-large-v3-turbo' : 'whisper-1'); fd.append('language', lang.slice(0, 2));
  const r = await fetch((eng === 'groq' ? 'https://api.groq.com/openai/v1' : (G.settings.prov.openai.base || 'https://api.openai.com/v1').replace(/\/$/, '')) + '/audio/transcriptions', { method: 'POST', headers: { authorization: 'Bearer ' + c.key }, body: fd });
  const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status); return (d.text || '').trim();
}
function recordAudio() {
  let mr, stream, chunks = [], stopFn; const promise = (async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'].find(m => window.MediaRecorder?.isTypeSupported?.(m)) || '';
    mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise(r => { mr.onstop = r; }); mr.start(); stopFn = () => { try { mr.stop(); } catch { } }; setTimeout(stopFn, 30000); await done; stream.getTracks().forEach(t => t.stop());
    return new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
  })(); return { promise, stop: () => stopFn && stopFn() };
}
/* مربی تلفظ: صدای واقعی کاربر را با لهجهٔ انتخابی مقایسه می‌کند و علت خطا و روش درست گفتن را توضیح می‌دهد */
function pronCoach(el, target) {
  const acc = G.settings.accent === 'UK' ? 'British (RP)' : 'General American';
  el.innerHTML = `<div class="card stack"><b>🎯 مربی تلفظ (${G.settings.accent === 'UK' ? 'بریتانیایی' : 'آمریکایی'})</b><span class="small muted">دکمه را بزن، «<span class="en">${esc(target)}</span>» را بگو و دوباره بزن تا ضبط تمام شود.</span><div class="row"><button class="btn" id="pc">🎙 ضبط و ارزیابی</button><button class="btn ghost" id="pl">🔊 الگو</button></div><div id="pr"></div></div>`;
  $('#pl', el).onclick = e => say(target, 'en', 'calm', e.currentTarget);
  let job = null; const btn = $('#pc', el);
  btn.onclick = async () => {
    if (job) { job.stop(); return; } if (!gemKey()) return toast('مربی تلفظ به اینترنت نیاز دارد؛ وصل شو و دوباره امتحان کن.');
    stopSpeak(); job = recordAudio(); btn.textContent = '⏹ تمام شد'; btn.classList.add('bad');
    try {
      const blob = await job.promise; job = null; btn.textContent = '🎙 ضبط و ارزیابی'; btn.classList.remove('bad'); $('#pr', el).innerHTML = loading('در حال گوش دادن به تلفظت…');
      const b64 = await blobB64(blob);
      const d = await gemFetch([G.settings.prov.gemini.model, ...GEM_FALLBACK], 'generateContent', { contents: [{ parts: [{ text: `You are an expert ${acc} pronunciation coach for Persian (Farsi) speakers. The learner tried to say: "${target}". Listen carefully to the audio. Judge against ${acc}. Detect specific errors: wrong phonemes (e.g. /w/→/v/, /θ/→/t/ or /s/, /ð/→/d/ or /z/, /æ/ vs /e/, /ɪ/ vs /iː/, /ʊ/ vs /uː/), extra vowel before or inside consonant clusters (e.g. "espeak", "estreet"), wrong word stress, flat intonation, final consonants dropped, ${acc.startsWith('British') ? 'pronounced r after vowels (should be silent in RP)' : 'missing r-coloring or flap t'}. Also note if the learner sounds unnatural because they pronounce every word separately instead of natural connected speech (linking, weak forms, flap t, yod coalescence). Explain WHY a Persian speaker makes each error and exactly HOW to place tongue/lips. VERY IMPORTANT: the learner does NOT understand English explanations, so "verdict", "you", "why", "how" and "stress" MUST be written entirely in simple, warm, colloquial Persian (Farsi script, like a friendly Iranian teacher); only the English example words and IPA may stay in English. Also add "fa_sound": how the target is pronounced, written in Persian script (e.g. «اِر» for air in American). JSON {"heard":"what you heard","score":0-100,"verdict":"Persian one sentence, human and encouraging","errors":[{"sound":"the sound or word part","fa_sound":"Persian-script pronunciation of the correct sound","you":"Persian: what the learner did (e.g. «ر رو مثل فارسی غلتوندی»)","correct":"IPA target","why":"Persian: why (Persian L1 influence)","how":"Persian: mouth/tongue instructions","practice":"English minimal pairs or drill words"}],"stress":"Persian note about stress/intonation or empty"}` }, { inlineData: { mimeType: blob.type.split(';')[0], data: b64 } }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } }, gemKey());
      const r = parseJSON(d.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '{}');
      $('#pr', el).innerHTML = `<div class="stack"><div class="row"><span class="score" style="font-size:36px">${faNum(r.score ?? 0)}</span><div class="grow small">شنیدم: <b class="en">${esc(r.heard || '')}</b><br>${esc(r.verdict || '')}</div></div>
      ${(r.errors || []).map(x => `<div class="card stack small" style="box-shadow:inset 0 0 0 1px var(--line)"><div><b class="en">${esc(x.sound)}</b> — درستش <b class="en">/${esc(x.correct)}/</b>${x.fa_sound ? ` یعنی «${esc(x.fa_sound)}»` : ''}</div><div><b>ایرادت:</b> ${esc(x.you)}</div><div><b>چرا:</b> ${esc(x.why)}</div><div><b>چطور:</b> ${esc(x.how)}</div>${x.practice ? `<div><b>تمرین:</b> <span class="en">${esc(x.practice)}</span> <button class="pill" data-p="${esc(x.practice)}">🔊</button></div>` : ''}</div>`).join('')}
      ${r.stress ? `<div class="notice soft small">${esc(r.stress)}</div>` : ''}
      ${(r.errors || []).length ? '<button class="btn ghost" id="pfa">🔊 توضیح صوتی ایرادهام به فارسی</button>' : ''}</div>`;
      $$('[data-p]', el).forEach(b => b.onclick = () => say(b.dataset.p, 'en', 'calm'));
      $('#pfa', el) && ($('#pfa', el).onclick = async () => { const parts = [r.verdict, ...(r.errors || []).flatMap(x => [`ایراد در ${x.sound}: ${x.you}`, x.why, x.how])].filter(Boolean); for (const t of parts) if (!(await say(t, 'fa', 'encouraging'))) break; });
      addXP(r.score >= 85 ? 8 : 4); if (r.errors?.length) logMistakes(r.errors.map(x => ({ wrong: `${target}: ${x.you}`, right: `/${x.correct}/`, why: x.why })), 'pron'); saveU();
      if (r.verdict) say(r.verdict, 'fa', r.score >= 85 ? 'proud' : 'encouraging');
    } catch (e) { job = null; btn.textContent = '🎙 ضبط و ارزیابی'; btn.classList.remove('bad'); $('#pr', el).innerHTML = ''; aiErr(e); }
  };
}
/* «نیتیوها واقعاً چطور می‌گویند؟» — گفتار پیوسته: حذف، اتصال، t نرم، ادغام صداها */
async function nativeSay(el, text) {
  const acc = G.settings.accent === 'UK' ? 'British (RP) casual speech' : 'General American casual speech';
  const key = 'native:' + G.settings.accent + ':' + text.toLowerCase(); const show = r => {
    el.innerHTML = `<div class="card stack small" style="box-shadow:inset 0 0 0 1px var(--line)"><b>🗣 نیتیوها در مکالمهٔ روزمره چطور می‌گویند (${G.settings.accent === 'UK' ? 'بریتانیایی' : 'آمریکایی'})</b>
    <div>شمرده: <span class="en">/${esc(String(r.careful).replace(/\//g, ''))}/</span></div><div>طبیعی و سریع: <b class="en">/${esc(String(r.natural).replace(/\//g, ''))}/</b></div><div>تقریباً به این شکل: <b>«${esc(r.fa)}»</b></div>
    ${(r.rules || []).map(x => `<div>• <b>${esc(x.rule)}</b>: ${esc(x.explain)}</div>`).join('')}<div class="row"><button class="btn ghost sm" data-n="0.75">🐢 آهسته</button><button class="btn ghost sm" data-n="1">▶ سرعت طبیعی</button></div></div>`;
    $$('[data-n]', el).forEach(b => b.onclick = () => { const r0 = G.settings.rate; G.settings.rate = +b.dataset.n; say(text, 'en', 'cheerful', b).finally(() => G.settings.rate = r0); });
  };
  if (G.cache[key]) return show(G.cache[key]); if (needAI(el)) return; el.innerHTML = loading();
  try { const r = await ai({ temp: 0.2, system: 'You are a phonetics expert in connected speech for Persian-speaking learners. Be precise and honest; do not exaggerate reductions that natives do not really make.', messages: [{ role: 'user', content: `How do native speakers really say "${text}" in ${acc}? Explain connected-speech processes actually used (linking, elision, flap/tap t, yod coalescence like "meet you"→"meechu", weak forms like "to"→/tə/, contractions, gonna/wanna where natural). JSON {"careful":"IPA careful speech","natural":"IPA natural fast speech","fa":"approximate pronunciation written in Persian script","rules":[{"rule":"English name","explain":"Persian: what happens and why"}]}` }] }); G.cache[key] = r; saveG('cache'); show(r); }
  catch (e) { el.innerHTML = ''; aiErr(e); }
}
const blobB64 = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1]); f.readAsDataURL(b); });
const enLang = () => G.settings.accent === 'UK' ? 'en-GB' : 'en-US';
function micButton(onText, lang) {
  const b = document.createElement('button'); b.className = 'icon-btn'; b.type = 'button'; b.title = 'صحبت کن'; b.innerHTML = I.mic;
  let job = null;
  b.onclick = async () => {
    if (job) { job.stop(); return; }
    stopSpeak(); b.classList.add('rec');
    try { job = listen(lang || enLang()); const t = await job.promise; if (t) onText(t); else toast('صدایی شنیده نشد؛ دوباره امتحان کن.'); }
    catch (e) { if (e.message === 'NOKEY') toast('تبدیل صدا به متن الان در دسترس نیست؛ از 🎤 روی کیبورد گوشی استفاده کن یا چند دقیقهٔ دیگر امتحان کن.'); else toast('میکروفون: ' + e.message); }
    finally { job = null; b.classList.remove('rec'); }
  };
  return b;
}
function similarity(a, b) {
  a = a.toLowerCase().replace(/[^a-z' ]/g, '').trim(); b = b.toLowerCase().replace(/[^a-z' ]/g, '').trim();
  if (!a || !b) return 0; const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return Math.round((1 - d[m][n] / Math.max(m, n)) * 100);
}

/* ───────── تصاویر ───────── */
const emCode = e => [...String(e || '')].map(c => c.codePointAt(0).toString(16)).filter(c => c !== 'fe0f').join('-');
const em3d = e => e && !String(e).startsWith('#') ? `<img class="em3d" alt="" src="em/${emCode(e)}.webp" loading="lazy" onerror="this.remove()">` : '';
function picHTML(u, w, big) {
  const k = wid(u, w); const url = G.img[k];
  const inner = w.img?.startsWith('#') ? `<span class="sw" style="background:${w.img}"></span>` : esc(w.img || '🖼️') + (url ? '' : em3d(w.img));
  return `<div class="pic${big ? ' big' : ''}" style="--h:${u.hue}" data-pic="${esc(k)}">${inner}${url ? `<img alt="${esc(w.w)}" src="${esc(url)}" loading="lazy" onerror="this.remove()">` : ''}</div>`;
}
function aiImageUrl(u, w) {
  const p = `simple friendly flat illustration of "${w.w}" (${w.pos === 'v' || w.pos === 'phr' ? 'a person doing it' : 'the object'}), topic ${u.en}, soft colors, plain background, educational flashcard, no text, no letters`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=384&height=384&nologo=true&seed=${parseInt(hashStr(w.w), 36) % 9999}`;
}
async function photoUrl(u, w) {
  const q = w.w.replace(/[^a-zA-Z ]/g, ' ').trim();
  if (G.settings.pixabayKey) {
    const r = await fetch(`https://pixabay.com/api/?key=${encodeURIComponent(G.settings.pixabayKey)}&q=${encodeURIComponent(q)}&image_type=all&safesearch=true&per_page=5`);
    const d = await r.json(); const h = d.hits?.[0]; if (h) return h.webformatURL;
  }
  const r = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=5&mature=false`);
  const d = await r.json(); const h = d.results?.find(x => x.thumbnail); if (h) return h.thumbnail;
  return null;
}
function autoImages(root) {
  const mode = G.settings.img; if (mode !== 'photo') return; // پیش‌فرض: تصاویر سه‌بعدی داخل خود برنامه
  const io = new IntersectionObserver(es => es.forEach(async e => {
    if (!e.isIntersecting) return; io.unobserve(e.target); const k = e.target.dataset.pic; if (G.img[k]) return;
    const x = wordFromId(k); if (!x || x.w.img?.startsWith('#')) return;
    try { const url = mode === 'photo' ? await photoUrl(x.u, x.w) : aiImageUrl(x.u, x.w); if (url) { G.img[k] = url; saveG('img'); $$(`[data-pic="${CSS.escape(k)}"]`).forEach(el => { if (!el.querySelector('img')) el.insertAdjacentHTML('beforeend', `<img alt="" src="${esc(url)}" onerror="this.remove()">`); }); } } catch { }
  }), { rootMargin: '200px' });
  $$('[data-pic]', root).forEach(el => { if (!el.querySelector('img')) io.observe(el); });
}

/* ───────── رابط کاربری: کمکی‌ها ───────── */
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  spk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 4L3 11l7 2 2 7z"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 5l7 7-7 7"/></svg>',
  ask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>',
  img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
  lock: '🔒'
};
function toast(t, ms = 3200) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, ms); }
function setTop(title, back) { try { ['ar', 'de', 'tr', 'zh'].forEach(k => document.body.classList.toggle('tl-' + k, tl() === k)); } catch { } if (!back && !['home', 'plan', 'library', 'chat', 'tools', 'me', ''].includes((location.hash.slice(1).split('/')[0]))) back = true; $('#top').innerHTML = `${back ? `<button class="back" aria-label="بازگشت" onclick="history.length>1?history.back():go('home')">${I.back}</button>` : ''}<h1>${esc(title)}</h1><button class="back" aria-label="حالت روز و شب" title="روز / شب" onclick="toggleDayNight()">${document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙'}</button>${U && !U.online && window.loginSheet ? `<button class="btn sm" style="margin-inline-start:auto" onclick="loginSheet(()=>router())">ورود / ثبت‌نام</button>` : ''}${me() ? `<button class="userchip" onclick="go('users')"><span class="avatar">${avHTML(me())}</span>${esc(me().name)}</button>` : ''}`; }
function go(h) { location.hash = h; }
const view = () => $('#view');
function sheet(html) { const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.innerHTML = `<div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`; bg.onclick = e => { if (e.target === bg) bg.remove(); }; document.body.appendChild(bg); return bg; }
const loading = (t = 'در حال فکر کردن…') => `<div class="card row"><span class="typing"><i></i><i></i><i></i></span><span class="muted">${t}</span></div>`;
function needAI(el) { if (hasAI() || firstKeyed()) return false; el.innerHTML = `<div class="card stack"><b>این بخش به اینترنت نیاز دارد.</b><span class="muted">هوش مصنوعی برنامه آنلاین کار می‌کند. به اینترنت وصل شو و دوباره امتحان کن. درس‌ها، صداها، واژه‌ها، فعل‌ها و رادیو بدون اینترنت هم کار می‌کنند.</span><button class="btn" onclick="router()">دوباره امتحان کن</button></div>`; return true; }

/* ───────── نصب برنامه (آیکن روی صفحهٔ گوشی و کامپیوتر) ───────── */
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (location.hash === '' || location.hash === '#home') { const b = $('#install-box'); if (b) b.innerHTML = installHTML(); bindInstall(); } });
addEventListener('appinstalled', () => { installEvt = null; toast('«زبان رستا» نصب شد 🎉 از این به بعد از آیکنش وارد شو.'); $('#install-box') && ($('#install-box').innerHTML = ''); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installHTML() { if (isStandalone() || lsGet('zd:installHide', '') === isoDay()) return ''; if (!installEvt && !isIOS()) return ''; return `<div class="install"><img src="icon-192.png" alt="" style="width:40px;height:40px;border-radius:10px"><b>«زبان رستا» را روی ${isIOS() ? 'آیفونت' : 'دستگاهت'} نصب کن تا همیشه با یک لمس بازش کنی.</b><button id="inst">نصب</button><button id="insx" aria-label="بعداً" style="background:transparent;color:inherit;padding:8px">✕</button></div>`; }
function bindInstall() {
  $('#insx') && ($('#insx').onclick = () => { lsSet('zd:installHide', isoDay()); $('#install-box').innerHTML = ''; });
  $('#inst') && ($('#inst').onclick = async () => {
    if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice; if (r.outcome === 'accepted') installEvt = null; return; }
    sheet(`<div class="stack" style="text-align:center"><img src="icon-192.png" alt="" style="width:72px;height:72px;border-radius:18px;align-self:center"><b style="font-size:18px">نصب روی آیفون</b>
    <div class="stack" style="text-align:right"><div>۱. این صفحه باید در <b>Safari</b> باز باشد.</div><div>۲. دکمهٔ <b>اشتراک‌گذاری</b> را بزن (مربع با فلش رو به بالا، پایین صفحه).</div><div>۳. کمی پایین برو و <b>Add to Home Screen</b> را بزن.</div><div>۴. بالا سمت راست <b>Add</b> را بزن.</div></div>
    <div class="notice soft small">از این به بعد آیکن «زبان رستا» روی صفحهٔ گوشی است و مثل یک اپ بدون نوار آدرس باز می‌شود.</div><button class="btn" onclick="this.closest('.sheet-bg').remove()">فهمیدم</button></div>`);
  });
}

/* ───────── مسیریاب ───────── */
const routes = {};
let routeGen = 0;
function router() {
  if (/access_token|error_description|[?&]code=/.test(location.hash + location.search) && window.handleAuthRedirect) { if (!G.active && G.users[0]) loadUser(G.users[0].id); return handleAuthRedirect(); }
  if (!window.BGP?.on) stopSpeak(); window.scrollTo(0, 0); view().onclick = null; $('nav.bottom').hidden = false; $$('.sheet-bg').forEach(x => x.remove()); document.body.classList.toggle('session', /^#(cards|quiz|exam|guide)\b/.test(location.hash));
  if (!G.users.length || !G.active || !G.users.some(u => u.id === G.active)) { if (!G.users.length) return viewWelcome(); loadUser(G.users[0].id); }
  if (!U) loadUser(G.active);
  if (!U.online && !window.TEST_MODE && !/access_token|type=recovery/.test(location.hash)) return viewWelcome('in', true); // بدون حساب نمی‌شود وارد برنامه شد
  routeGen++; const [r, ...args] = (location.hash.slice(1) || 'home').split('/');
  if (['unit', 'lesson', 'cards', 'quiz', 'teach', 'talk', 'dialog', 'exam', 'practice', 'sleep', 'myradio'].includes(r) && args[0]) { const gu = unitById(decodeURIComponent(args[0])); if (!gu) { location.hash = 'home'; return; } if (gu.idx < 1000 && !isOpen(gu)) { toast(`این درس هنوز قفل است؛ اول درس قبلی را با نمرهٔ ${faNum(G.settings.passScore)} قبول شو.`); location.hash = 'home'; return; } }
  if (['role', 'gclass'].includes(r) && !args[0]) { location.hash = r === 'role' ? 'chat' : 'grammar'; return; }
  $$('nav.bottom a').forEach(a => a.classList.toggle('on', a.dataset.r === ({ unit: 'home', cards: 'home', quiz: 'home', teach: 'home', talk: 'chat', role: 'chat', dialog: 'home', exam: 'home', tool: 'tools', dict: 'tools', guide: 'me', settings: 'me', theater: 'library', practice: 'home', vision: 'home', rooms: 'chat', path: 'home', u: 'home', admin: 'me', dm: 'chat', grammar: 'tools', gclass: 'tools', verbs: 'tools', wtopics: 'tools', feedback: 'tools', live: 'home', progress: 'me', leitner: 'tools', lesson: 'home', listen: 'tools', vclass: 'tools', news: 'tools', sleep: 'home', myradio: 'chat', music: 'tools', users: 'me', placement: 'home', book: 'library', read: 'library', talkfree: 'chat', coach: 'chat' }[r] || r)));
  { const a0 = decodeURIComponent(args[0] || ''); const lv = wsLevelOf(a0) || (r === 'course' && WORD_TRACK.some(l => l.id === a0) ? a0 : null); if (lv && !WS_UNITS.some(u => u.level === lv && u.baseWords.length)) { view().innerHTML = loading('واژه‌ها را باز می‌کنم…'); const h = location.hash; return wsLoad(lv).then(() => { if (location.hash === h) router(); }); } }
  (routes[r] || routes.home)(...args.map(decodeURIComponent));
}
addEventListener('hashchange', router);

/* ───────── خوش‌آمد و کاربران ───────── */
const safeImg = s => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(s || '') && s.length < 200000 ? s : '';
const avHTML = u => safeImg(u?.photo) ? `<img src="${safeImg(u.photo)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : esc(u?.avatar || '🙂');
const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐨', '🦉', '🐬', '🦄', '🐙', '🐝', '🌵', '🚀'];
/* ───── معرفی کوتاه امکانات (با «رد شدن») و بعد ورود / ثبت‌نام ───── */
const INTRO = [
  ['👩‍🏫', 'معلم هوشمندی که فارسی حرف می‌زند', 'رستا مثل یک معلم واقعی با صدای گرم فارسی درس می‌دهد، اشتباه‌هایت را یادش می‌ماند، تشویقت می‌کند و درس‌های قبلی را هم مرور می‌کند.'],
  ['🎯', 'از صفر تا مکالمهٔ روان (A1 تا B1)', 'چهار سطح: مقدماتی (A1)، سطح ۱ (A2)، سطح ۲ (A2+/B1) و سطح ۳ (B1) + مسیر واژگان موضوعی. هر درس یک موضوع زندگی واقعی است: خانواده، خرید، سفر، کار، سلامت…'],
  ['📚', 'هر درس دقیقاً چه یادت می‌دهد', 'بانک کامل واژه‌ها و فعل‌ها با تصویر و تلفظ، یک مکالمهٔ واقعی، گرامر همان درس، صحبت با معلم و آزمون پایانی. درس بعد وقتی باز می‌شود که ۹۵ بگیری.'],
  ['🎧', 'شنیدن هر روز؛ حتی ناخودآگاه', 'رادیوی زندهٔ آمریکایی و بریتانیایی، خبر واقعی امروز به زبان ساده، رادیوی شخصی تعاملی، مرور قبل از خواب و موسیقی با زیرنویس؛ با صدای سه‌بعدی.'],
  ['🗓️', 'برنامهٔ شخصی روی تقویم شمسی', 'می‌گویی تا کی و روزی چند دقیقه؛ برنامه روزبه‌روز چیده می‌شود، یادآوری می‌کند و اگر عقب بیفتی برنامهٔ جبرانی می‌سازد.'],
  ['🏆', 'رقابت، انجمن و دوستان', 'جدول رقابت هفتگی، چت‌روم هر موضوع با معلمی که نقش می‌دهد و اصلاح می‌کند، پیام خصوصی و صفحهٔ اختصاصی هر کاربر.'],
];
/* ذخیرهٔ رمز در مدیر رمز خودِ مرورگر/گوشی (امن؛ برنامه رمز را جایی نگه نمی‌دارد) */
function savePw(id, pw) { try { if ($('#rem')?.checked && window.PasswordCredential) navigator.credentials.store(new PasswordCredential({ id, password: pw, name: id })).catch(() => { }); } catch { } }
function viewIntro(i = 0) {
  $('#top').innerHTML = ''; $('nav.bottom').hidden = true; const [ic, t, d] = INTRO[i];
  view().innerHTML = `<div class="auth intro"><div class="hero2" style="min-height:380px;justify-content:center"><img class="logo" src="icon-192.png" alt=""><div style="font-weight:800;font-size:15px;opacity:.9">آموزش زبان رستا</div>
    <div style="font-size:54px;line-height:1">${ic}</div><h2>${t}</h2><span style="opacity:.88;line-height:1.9">${d}</span>
    <div class="row" style="gap:6px;justify-content:center">${INTRO.map((_, k) => `<span style="width:${k === i ? 22 : 8}px;height:8px;border-radius:9px;background:${k === i ? 'var(--mark)' : 'color-mix(in srgb,var(--hero-ink) 35%,transparent)'}"></span>`).join('')}</div></div>
    <div class="form"><button class="btn wide" id="nx">${i < INTRO.length - 1 ? 'بعدی' : 'شروع کنیم'}</button>${lsGet('zd:introSeen', 0) ? '<button class="btn line wide" id="sk">رد شدن و ورود</button>' : ''}</div></div>`;
  const end = () => { lsSet('zd:introSeen', 1); viewWelcome('in'); };
  $('#nx').onclick = () => i < INTRO.length - 1 ? viewIntro(i + 1) : end(); $('#sk') && ($('#sk').onclick = end);
}
function viewWelcome(tab = 'in', returning = false) {
  if (!G.users.length && !lsGet('zd:introSeen', 0)) return viewIntro(0);
  if (returning) window._wReturning = true;
  $('#top').innerHTML = ''; $('nav.bottom').hidden = true;
  const up = tab === 'up';
  view().innerHTML = `<div class="auth">
  <div class="hero2"><img class="logo" src="icon-192.png" alt=""><div style="font-weight:800;font-size:15px;opacity:.9">آموزش زبان رستا</div><h2>انگلیسی را مثل یک گفتگوی واقعی یاد بگیر</h2>
  <span style="opacity:.85">معلم هوشمندی که با تو فارسی حرف می‌زند و قدم‌به‌قدم تا مکالمهٔ روان همراهت است.</span><button class="btn line sm" id="tourb" style="align-self:flex-start">امکانات برنامه را ببین ›</button></div>
  <div class="form"><div class="tabs"><button data-t="in" class="${up ? '' : 'on'}">ورود</button><button data-t="up" class="${up ? 'on' : ''}">ثبت‌نام</button></div>
  ${up ? `<label class="f">نام<input id="nm" class="in" placeholder="مثلاً رستا" maxlength="24" autocomplete="given-name"></label>
  <label class="f">نام کاربری (حروف انگلیسی کوچک، عدد و _)<input id="un" class="in" dir="ltr" maxlength="20" autocomplete="username" placeholder="rasta_eng"></label><span class="tiny muted" id="unh"></span>
  <label class="f">ایمیل (برای تأیید حساب)<input id="em" class="in" dir="ltr" type="email" autocomplete="email" placeholder="you@gmail.com"></label>` :
  `<label class="f">نام کاربری یا ایمیل<input id="un" class="in" dir="ltr" autocomplete="username" placeholder="rasta_eng"></label>`}
  <label class="f">رمز عبور${up ? ' (حداقل ۸ حرف)' : ''}<span class="row" style="flex-wrap:nowrap;gap:6px"><input id="pw" class="in grow" dir="ltr" type="password" autocomplete="${up ? 'new-password' : 'current-password'}"><button type="button" class="icon-btn" id="eye" aria-label="نمایش رمز" title="نمایش رمز">👁</button></span></label>
  <label class="row small" style="gap:6px"><input type="checkbox" id="rem" ${lsGet('zd:remember', true) ? 'checked' : ''}> مرا به خاطر بسپار (نام کاربری ذخیره شود و ورودم بماند)</label>
  ${up ? `<div class="small muted">تصویر پروفایل</div><div class="row" id="av">${AVATARS.map((a, i) => `<button class="icon-btn${i ? '' : ' on'}" data-a="${a}" style="font-size:20px">${a}</button>`).join('')}</div>` : ''}
  <details><summary class="small">کد اتصال هوش مصنوعی دارم</summary><input id="cd" class="in" dir="ltr" placeholder="ZD1…" style="margin-top:6px"><span class="tiny muted">کد را از مدیر برنامه بگیر و اینجا بچسبان.</span></details>
  <button class="btn wide" id="go">${up ? 'ساخت حساب' : 'ورود'}</button>
  ${up ? '' : '<div class="row small" style="justify-content:space-between"><a href="javascript:void 0" id="fg">رمز را فراموش کرده‌ام</a><a href="javascript:void 0" id="ml">ورود با لینک ایمیل</a></div>'}
  <button class="btn line wide" id="go2">فعلاً بدون حساب امتحان می‌کنم</button>
  <span class="tiny muted" style="text-align:center">${up ? 'بعد از ساخت حساب، یک ایمیل تأیید می‌آید؛ روی لینکش بزن تا حسابت فعال شود.' : 'حساب نداری؟ از برگهٔ «ثبت‌نام» بساز.'}</span></div></div>`;
  $$('.tabs button').forEach(b => b.onclick = () => viewWelcome(b.dataset.t)); $('#tourb').onclick = () => viewIntro(0);
  $('#eye').onclick = () => { const i = $('#pw'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; $('#eye').textContent = show ? '🙈' : '👁'; $('#eye').title = show ? 'پنهان کردن رمز' : 'نمایش رمز'; };
  if (!up && lsGet('zd:remember', true) && lsGet('zd:lastUser', '')) $('#un').value = lsGet('zd:lastUser', '');
  $('#rem').onchange = e => lsSet('zd:remember', e.target.checked);
  $$('.form input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter' && i.type !== 'checkbox') { e.preventDefault(); $('#go').click(); } }));
  let av = AVATARS[0]; $$('#av button').forEach(b => b.onclick = () => { $$('#av button').forEach(x => x.classList.remove('on')); b.classList.add('on'); av = b.dataset.a; });
  const code = () => { const c = $('#cd').value.trim(); if (!c) return true; try { useCode(c); toast('هوش مصنوعی وصل شد ✓'); return true; } catch { toast('کد اتصال درست نیست؛ دوباره کپی کن.'); return false; } };
  const enter = (n, a, h = 'guide') => { addUser(n, a); $('nav.bottom').hidden = false; go(h); router(); };
  $('#go2').hidden = !window.TEST_MODE; // ورود بدون حساب ممنوع
  if (window._wReturning && G.users.length) { $('#go2').textContent = `ادامه با ${me()?.name || 'همین دستگاه'} بدون ورود`; $('#go2').onclick = () => { window._wReturning = false; $('nav.bottom').hidden = false; go('home'); router(); }; }
  else $('#go2').onclick = () => { if (!code()) return; enter('کاربر', AVATARS[0], 'guide'); };
  $('#ml') && ($('#ml').onclick = () => { if (!code()) return; if (!G.users.length) addUser('کاربر', AVATARS[0]); else if (!U) loadUser(G.active || G.users[0].id); window.loginSheet && loginSheet(p => { if (p?.display_name) { me().name = p.display_name; if (p.avatar) me().avatar = p.avatar; saveG('users'); } $('nav.bottom').hidden = false; go('home'); router(); }); });
  $('#fg') && ($('#fg').onclick = () => window.forgotPassword && forgotPassword($('#un').value.trim()));
  $('#go').onclick = async () => {
    if (!window.authSignUp) return toast('بخش آنلاین بارگذاری نشد؛ اینترنت را بررسی کن.');
    const b = $('#go'); const pw = $('#pw').value;
    if (up) {
      const n = $('#nm').value.trim(), un = $('#un').value.trim().toLowerCase(), em = $('#em').value.trim().toLowerCase();
      if (!n) return toast('نامت را بنویس.'); if (!/^[a-z0-9_]{3,20}$/.test(un)) return $('#unh').textContent = 'نام کاربری: فقط حروف انگلیسی کوچک، عدد و _ ؛ ۳ تا ۲۰ حرف.';
      if (!/^\S+@\S+\.\S+$/.test(em)) return toast('ایمیلت را درست بنویس.'); if (pw.length < 8) return toast('رمز عبور باید حداقل ۸ حرف باشد.'); if (!code()) return;
      if ($('#rem').checked) lsSet('zd:lastUser', un); savePw(un, pw);
      b.disabled = true; b.textContent = 'در حال ساخت حساب…'; const r = await authSignUp({ name: n, un, email: em, pw, avatar: av }); b.disabled = false; b.textContent = 'ساخت حساب';
      if (r === 'taken') return $('#unh').textContent = 'این نام کاربری گرفته شده؛ یکی دیگر بنویس.';
    } else {
      const id = $('#un').value.trim(); if (!id || !pw) return toast('نام کاربری و رمز را بنویس.'); if (!code()) return;
      if ($('#rem').checked) lsSet('zd:lastUser', id); else lsSet('zd:lastUser', ''); savePw(id, pw);
      b.disabled = true; b.textContent = 'در حال ورود…'; await authSignIn(id, pw); b.disabled = false; b.textContent = 'ورود';
    }
  };
}
function addUser(name, avatar) { const u = { id: uid(), name, avatar, created: isoDay() }; G.users.push(u); saveG('users'); loadUser(u.id); saveU(); return u; }
routes.users = () => {
  setTop('کاربران', true);
  view().innerHTML = `<div class="stack"><div class="users">${G.users.map(u => { const d = userData(u.id); return `<button class="ucard${u.id === G.active ? ' on' : ''}" data-u="${u.id}"><div class="row"><span class="avatar">${avHTML(u)}</span><b class="grow">${esc(u.name)}</b><span class="pill">${faNum(d.xp)} امتیاز</span></div><span class="small muted">${faNum(masteredCount(d))} درس قبول · ${faNum(streakOf(d))} روز پیاپی</span><span class="small">🤖 ۳۰ روز اخیر: ${faNum(aiUseSum(d).chat)} گفتگو/درخواست · ${faNum(aiUseSum(d).voice)} صدای ساخته‌شده · ${faNum(Math.round(Object.values(d.log).reduce((a, x) => a + (x.min || 0), 0)))} دقیقه مطالعه</span></button>`; }).join('')}</div>
  <div class="card stack"><b>کاربر تازه</b><div class="row"><input id="nn" class="in grow" placeholder="اسم" maxlength="24"><button class="btn" id="add">افزودن</button></div></div>
  <div class="card stack"><b>ویرایش کاربر فعلی</b><div class="row"><span class="avatar" style="width:56px;height:56px;font-size:28px;overflow:hidden">${avHTML(me())}</span><label class="btn ghost sm">📷 عکس پروفایل<input type="file" accept="image/*" hidden id="ph"></label>${me().photo ? '<button class="btn line sm" id="phx">حذف عکس</button>' : ''}</div><div class="row"><input id="rn" class="in grow" value="${esc(me().name)}"><button class="btn ghost" id="ren">ذخیره</button></div><button class="btn line" id="del">حذف این کاربر و همهٔ پیشرفتش</button><div id="delc"></div></div></div>`;
  $$('[data-u]').forEach(b => b.onclick = () => { loadUser(b.dataset.u); toast('کاربر عوض شد: ' + me().name); go('home'); });
  $('#add').onclick = () => { const n = $('#nn').value.trim(); if (!n) return; addUser(n, AVATARS[G.users.length % AVATARS.length]); go('placement'); };
  $('#ph').onchange = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 160; const m = Math.min(img.width, img.height); c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, 160, 160); me().photo = c.toDataURL('image/jpeg', 0.82); saveG('users'); routes.users(); toast('عکس پروفایل ذخیره شد.'); }; img.src = URL.createObjectURL(f); };
  $('#phx') && ($('#phx').onclick = () => { delete me().photo; saveG('users'); routes.users(); });
  $('#ren').onclick = () => { me().name = $('#rn').value.trim() || me().name; saveG('users'); routes.users(); };
  $('#del').onclick = () => { $('#delc').innerHTML = `<div class="notice row"><span class="grow">مطمئنی؟ پیشرفت ${esc(me().name)} برای همیشه پاک می‌شود.</span><button class="btn bad sm" id="yes">بله، حذف کن</button></div>`; $('#yes').onclick = () => { localStorage.removeItem('zd:u:' + G.active); G.users = G.users.filter(u => u.id !== G.active); saveG('users'); G.active = G.users[0]?.id || null; saveG('active'); U = null; if (G.active) loadUser(G.active); go('home'); router(); }; };
};

/* ───────── صفحهٔ اول ───────── */
function planGap() { // چند درس عقب‌تر از برنامه
  const P = U?.plan; if (!P) return 0; const days = Object.keys(P.days).filter(d => d <= isoDay()).sort().reverse(); const d = days.find(x => P.days[x].unit); if (!d) return 0;
  const u = unitById(P.days[d].unit); return u ? Math.max(0, u.idx - currentUnit().idx) : 0;
}
function addTopicTasks(P) {
  const T = P.topics || []; if (!T.length) return; const days = Object.keys(P.days).sort().filter(d => !P.days[d].review); const step = Math.max(2, T.length);
  T.forEach((tp, i) => { let m = 0; for (let k = i; k < days.length; k += step, m++) { const d = P.days[days[k]]; const w = m % 2; d.tasks.splice(d.tasks.length - 1, 0, { k: (w ? 'wtopic:' : 'topic:') + tp, t: w ? `واژه‌ها و عبارت‌های «${tp}» (۱۵ دقیقه)` : `فعل‌های «${tp}» + کوییز (۱۵ دقیقه)` }); } });
}
function catchUpPlan() { const P = U.plan; const end = addDays(P.start, P.dayCount - 1); const left = Math.max(7, Math.round((parseDay(end) - parseDay(isoDay())) / DAY) + 1); const gap = planGap();
  const base = P.baseMin || P.minutes; U.plan = buildPlan({ ...P, start: isoDay(), days: left, minutes: clamp(base + Math.min(gap, 6) * 10, base, 180) }); U.plan.baseMin = base; U.plan.dayCount = left; U.plan.catchUp = (P.catchUp || 0) + 1; U.plan.goal = P.goal; U.plan.topics = P.topics; U.plan.firstStart = P.firstStart || P.start; addTopicTasks(U.plan); saveU(); }
function todayPlan() { const p = U.plan; if (!p) return null; return p.days?.[isoDay()] || null; }
/* ───────── قفسهٔ دوره‌ها (مثل کتاب) و فهرست درس‌های هر دوره ───────── */
const COVER = { intro: [350, 18, 'مقدماتی'], l1: [190, 220, 'سطح ۱'], l2: [140, 90, 'سطح ۲'], l3: [265, 300, 'سطح ۳'], owsb: [28, 48, 'واژه‌ها · پایه'], owsi: [230, 260, 'واژه‌ها · متوسط'], owsa: [300, 330, 'واژه‌ها · پیشرفته'], wsb: [28, 48, 'واژه‌ها ۱'], wsi: [230, 260, 'واژه‌ها ۲'] };
const courseUnits = id => LEVELS.some(l => l.id === id) ? ALL_UNITS.filter(u => u.level === id) : WS_UNITS.filter(u => u.level === id);
function courseCover(id, big) {
  const [h1, h2, name] = COVER[id] || [200, 230, '']; const Lv = [...LEVELS, ...WORD_TRACK].find(l => l.id === id) || {};
  const us = courseUnits(id); const done = us.filter(isMastered).length;
  return `<div class="cover${big ? ' big' : ''}" style="--h1:${h1};--h2:${h2}"><span class="cv-brand">زبان رستا</span><b class="cv-name">${esc(name)}</b><span class="cv-en en">${esc(Lv.en || '')}</span><span class="cv-lv en">${esc(CEFR_OF[id] || '')}</span><span class="cv-pr">${faNum(done)}/${faNum(us.length)} درس</span></div>`;
}
const shelfHTML = (title, sub, ids) => `<div class="shelf card"><div><b class="shelf-t">${title}</b><div class="small muted">${sub}</div></div><div class="shelf-row">${ids.map(id => `<a class="book" href="#course/${id}">${courseCover(id)}<b>${esc((COVER[id] || [])[2] || id)}</b><span class="tiny muted">${faNum(courseUnits(id).length)} درس · ${esc(CEFR_OF[id] || '')}</span></a>`).join('')}</div></div>`;
routes.path = () => {
  setTop('دوره‌ها و درس‌ها', true);
  view().innerHTML = `<div class="stack">${shelfHTML('دوره‌های آموزشی', 'از صفر تا متوسط، درس‌به‌درس مثل کتاب', LEVELS.map(l => l.id))}
  ${shelfHTML('آموزش واژه‌ها', 'واژه‌های پرکاربرد، موضوع‌به‌موضوع', WORD_TRACK.map(l => l.id))}
  ${U.custom.length ? `<div class="sec">درس‌های خودم</div><div class="units">${U.custom.map(c => unitCard({ ...c, idx: 1000, baseWords: c.words })).join('')}</div>` : ''}<a class="btn line wide" href="#tool/import">+ افزودن درس از کتاب خودم یا ساخت درس تازه</a></div>`;
};
routes.course = id => {
  const us = courseUnits(id); if (!us.length) return go('path');
  setTop((COVER[id] || [])[2] || 'دوره', true);
  view().innerHTML = `<div class="stack"><div class="course-head">${courseCover(id, true)}</div>
  <div class="lesson-list">${us.map((u, i) => { const hd = u.sec && u.sec !== us[i - 1]?.sec ? `<div class="lr-sec">${esc(u.sec)}</div>` : ''; const open = isOpen(u), m = isMastered(u), cur = !m && open && (u.track === 'ws' ? u.id === currentWS().id : u.idx === currentUnit().idx);
    return hd + `<a class="lrow${open ? '' : ' locked'}${cur ? ' current' : ''}" href="${open ? '#unit/' + u.id : 'javascript:void 0'}" ${open ? '' : `onclick="toast('این درس بعد از قبولی در درس قبل باز می‌شود.')"`}>
      <span class="lr-ic" style="--h:${u.hue}">${esc(u.icon)}</span><div class="grow"><b>درس ${faNum(i + 1)}</b><div class="small">${esc(u.fa)}</div><div class="tiny muted en">${esc(u.en)}${u.baseWords?.length ? ` · ${faNum(u.baseWords.length)} واژه` : ''}</div></div>
      <span class="lr-st">${m ? '<span class="pill ok">✓</span>' : cur ? '<span class="pill acc">ادامه</span>' : open ? '' : '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3zm3 4a2 2 0 0 1 1 3.7V19h-2v-1.3A2 2 0 0 1 12 14z"/></svg>'}</span></a>`; }).join('')}</div></div>`;
  $('.lrow.current')?.scrollIntoView({ block: 'center' });
};
routes.home = () => {
  if (!lsGet('zd:tourDone:' + G.active, false) && !window.TEST_MODE) return go('guide');
  setTop('زبان رستا');
  if (U.plan) { try { const md = missedDays(); if (md && U.plan.lastCatch !== isoDay()) { catchUpPlan(); U.plan.lastCatch = isoDay(); U.plan.missedNote = md; saveU(); } } catch (e) { console.warn(e); } }
  const cur = currentUnit(); const due = dueIds().length; const p = paceInfo(); const tp = todayPlan(); const L = U.log[isoDay()] || { xp: 0, min: 0 };
  const board = G.users.map(u => ({ u, d: userData(u.id) })).map(x => ({ ...x, w: weekXP(x.d) })).sort((a, b) => b.w - a.w);
  const tasks = (tp ? tp.tasks : [{ k: 'cards', t: `مرور ${faNum(due)} فلش‌کارت موعددار` }, { k: 'unit', t: `ادامهٔ درس «${tl() !== 'en' ? curUnits()[curIdx()][2] : cur.fa}»` }]).filter(t => !(t.k === 'cards' && !due)).concat(listenTasks());
  view().innerHTML = `<div class="stack">
  <div class="today">
    <div class="row"><span class="grow small muted">${jLabel(isoDay(), true)} · ${faNum(Math.round(L.min))} دقیقه مطالعهٔ امروز</span><span class="pill mark">🔥 ${faNum(streakOf(U))} روز</span></div>
    ${tl() !== 'en' ? (() => { const A = curUnits()[curIdx()]; return `<b style="font-size:19px">درس ${faNum(curIdx() + 1)} ${esc(tlInfo().fa)}: ${esc(A[2])} <span class="small" style="opacity:.8">· سطح ${A[1]}</span></b>`; })() : `<b style="font-size:19px">درس ${faNum(cur.idx + 1)}: ${esc(cur.fa)} <span class="en" style="opacity:.7;font-size:14px">${esc(cur.en)}</span></b>`}
    <ul class="tasks">${tasks.map(t => `<li class="${taskDone(t) ? 'done' : ''}" data-tk="${esc(t.k || '')}" style="cursor:pointer"><span class="chk">${taskDone(t) ? '✓' : ''}</span><span class="grow">${esc(t.t)}</span>${taskLink(t) ? `<a href="${taskLink(t)}" class="small" onclick="event.stopPropagation()">برو ›</a>` : ''}</li>`).join('')}</ul>
    <div class="row"><a class="btn" href="${tl() !== 'en' ? '#aru/' + curUnits()[curIdx()][0] : '#unit/' + cur.id}">ادامهٔ یادگیری</a><a class="btn" style="background:#fff;color:#0c5f5d" href="#live/lesson">📞 کلاس زنده</a><a class="btn ghost" style="background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor" href="#leitner">🗃️ لایتنر${due ? ' · ' + faNum(due) + ' امروز' : ''}</a></div>
  </div>
  <div class="card stack tl-card"><b>🌐 زبانی که یاد می‌گیری</b><div class="seg" id="tlsel">${[['en', '🇬🇧 انگلیسی'], ...Object.entries(TLANGS).map(([k, L]) => [k, L.flag + ' ' + L.fa])].map(([k, t]) => `<button data-v="${k}" class="${tl() === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    ${tl() !== 'en' ? `<div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">لهجه/گونه:</span>${Object.entries(tlInfo().v).map(([k, d]) => `<button class="pill ${tlDia() === d ? 'acc' : ''}" data-tlv="${k}">${d[1]}</button>`).join('')}</div>
    <span class="small muted">معلم زنده، دورهٔ کامل ${esc(tlInfo().fa)} از پایه تا پیشرفته (هر درس با طراح درس کامل)، «بگو چه می‌خواهی یاد بگیری»، واژه‌های موضوعی، افعال، دیکشنری و گفتگو حالا به ${esc(tlFa())} است — توضیح فارسی + تلفظ به خط فارسی.</span>
    <div class="row"><a class="btn" href="#arc">📖 دورهٔ ${esc(tlInfo().fa)}</a><a class="btn" href="#live/lesson">📞 کلاس زنده</a><a class="btn line" href="#wtopics">📚 واژه‌های موضوعی</a><a class="btn line" href="#verbs">🔤 افعال</a></div>` : ''}</div>
  <div id="install-box">${installHTML()}</div>
  <div id="online-home"></div>
  ${(() => { if (!U.plan) return ''; const md = U.plan.lastCatch === isoDay() ? U.plan.missedNote || 0 : 0; if (!md) return ''; const end = addDays(U.plan.start, U.plan.dayCount - 1); return `<div class="notice stack"><b>⏰ ${faNum(md)} روز است که طبق برنامه درس نخوانده‌ای</b><span class="small">برای اینکه باز هم تا <b>${jLabel(end, true)}</b> به هدفت برسی، برنامه خودکار جبرانی شد: از امروز روزی <b>${faNum(U.plan.minutes)} دقیقه</b> لازم است. کارهای جامانده به روزهای بعد پخش شد.</span><div class="row"><a class="btn sm" href="#coach/advisor">🧭 مشورت با مشاور</a><a class="btn ghost sm" href="#plan">دیدن تقویم</a></div></div>`; })()}
  ${planGap() > 0 && !(U.plan?.lastCatch === isoDay() && U.plan?.missedNote) ? `<div class="notice stack"><b>⚠ ${faNum(planGap())} درس از برنامه‌ات عقبی</b><span class="small">هدفت عقب نمی‌افتد: برنامهٔ جبرانی همان تاریخ پایان را نگه می‌دارد و وقت روزانه را کمی بیشتر می‌کند.</span><button class="btn sm" id="cu" style="align-self:flex-start">ساخت برنامهٔ جبرانی</button></div>` : ''}
  ${G.users.length > 1 ? `<div class="sec">رقابت این هفته <small>کاربران این دستگاه</small></div>
  <div class="users">${board.map((x, i) => `<button class="ucard${x.u.id === G.active ? ' on' : ''}" data-u="${x.u.id}"><div class="row"><span style="font-weight:900;width:20px">${['🥇', '🥈', '🥉'][i] || faNum(i + 1)}</span><span class="avatar">${avHTML(x.u)}</span><b class="grow">${esc(x.u.name)}</b><span class="pill acc num">${faNum(x.w)}</span></div>
    <div class="small muted">درس ${faNum((ALL_UNITS.find(u => !x.d.units[u.id]?.mastered)?.idx ?? 0) + 1)} از ${faNum(ALL_UNITS.length)} · ${faNum(Object.values(x.d.srs).filter(s => s.box >= 4).length)} واژهٔ تثبیت‌شده · ${rankOf(x.d.xp)}</div>
    <div class="bar"><i style="width:${Math.round(masteredCount(x.d) / ALL_UNITS.length * 100)}%"></i></div></button>`).join('')}</div>` : ''}
  <div class="card stack"><div class="row"><b class="grow">پیشرفت من</b><span class="pill">${rankOf(U.xp)} · ${faNum(U.xp)} امتیاز</span></div>
    <div class="grid2 small"><span>درس‌های قبول‌شده: <b class="num">${faNum(p.mastered)}</b> از ${faNum(ALL_UNITS.length)}</span><span>واژه‌های تثبیت‌شده: <b>${faNum(learnedCount())}</b></span>
    <span>سرعت: <b>${faNum(p.perWeek)}</b> درس در هفته</span><span>${p.eta ? `پیش‌بینی پایان سطح متوسط: <b>${jLabel(p.eta, true)}</b>` : 'پیش‌بینی بعد از اولین درس'}</span></div>
    ${U.badges.length ? `<div class="row">${U.badges.map(b => { const x = BADGES.find(y => y.id === b); return x ? `<span class="pill mark" title="${x.fa}">${x.ic} ${x.fa}</span>` : ''; }).join('')}</div>` : ''}</div>
  ${(() => { const f = forecast(); const m = f.milestones.find(x => !x.done); return m ? `<a class="card row" href="#vision" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span style="font-size:30px">🔭</span><div class="grow"><b>چشم‌انداز تو</b><div class="small">با همین سرعت، تا <b>${jLabel(m.date, true)}</b> می‌توانی ${esc(m.t)}.</div></div><span class="muted">›</span></a>` : ''; })()}
  ${shelfHTML('دوره‌های آموزشی', 'یک دوره را بزن تا درس‌هایش را ببینی', [...LEVELS, ...WORD_TRACK].map(l => l.id))}
  <div class="sec">درس‌های پیش رو <small><a href="#path">همهٔ درس‌ها ›</a></small></div><div class="units">${ALL_UNITS.slice(cur.idx, cur.idx + 4).map(unitCard).join('')}${unitCard(currentWS())}</div>
  <a class="btn line wide" href="#tool/import">+ افزودن درس از کتاب خودم یا ساخت درس تازه با هوش مصنوعی</a>
  ${!U.placement ? `<a class="btn ghost wide" href="#placement">تعیین سطح با هوش مصنوعی</a>` : ''}
  </div>`;
  $$('[data-u]').forEach(b => b.onclick = () => { loadUser(b.dataset.u); router(); });
  $$('[data-tk]').forEach(li => li.onclick = () => { const k = isoDay() + '|' + li.dataset.tk; U.mdone = U.mdone || {}; if (U.mdone[k]) delete U.mdone[k]; else { U.mdone[k] = 1; addXP(3); toast('آفرین! در برنامهٔ امروز علامت خورد ✓'); } saveU(); routes.home(); });
  window.homeOnline && homeOnline(); bindInstall();
  $('#cu') && ($('#cu').onclick = () => { catchUpPlan(); toast(`برنامهٔ جبرانی ساخته شد: روزی ${faNum(U.plan.minutes)} دقیقه تا همان تاریخ هدف.`, 5000); go('plan'); });
  if (!U.plan && !lsGet('zd:planAsked:' + G.active, false)) { setTimeout(() => { if (!['', '#home'].includes(location.hash) || $('.sheet-bg')) return; lsSet('zd:planAsked:' + G.active, true); const bg = sheet(`<div class="stack"><div class="big-ic">🗓️</div><b>برنامهٔ شخصی‌ات را بسازیم؟</b><span class="small muted">بگو تا کی می‌خواهی به کجا برسی و روزی چقدر وقت داری؛ برنامه روی تقویم شمسی چیده می‌شود، یادآوری می‌کند و اگر عقب بیفتی برنامهٔ جبرانی می‌دهد.</span><a class="btn" href="#plan" onclick="this.closest('.sheet-bg').remove()">بله، بسازیم</a><button class="btn ghost" onclick="this.closest('.sheet-bg').remove()">بعداً</button></div>`); }, 800); }
};
function unitCard(u) {
  const open = isOpen(u), m = u.idx < 1000 || u.track === 'ws' ? isMastered(u) : false, cur = !m && open && (u.track === 'ws' ? u.id === currentWS().id : u.idx === currentUnit().idx);
  const words = unitWords(u); const learned = words.filter(w => (U.srs[wid(u, w)]?.box || 0) >= 4).length;
  return `<a class="unit${open ? '' : ' locked'}${cur ? ' current' : ''}" href="${open ? '#unit/' + u.id : 'javascript:void 0'}" ${open ? '' : `onclick="toast('این درس بعد از قبولی در درس قبل (نمرهٔ ${faNum(G.settings.passScore)} به بالا) باز می‌شود.')"`}>
    <span class="badge">${m ? '<span class="pill ok">قبول ✓</span>' : open ? (cur ? '<span class="pill acc">درس فعلی</span>' : '') : '🔒'}</span>
    <span class="tile" style="--h:${u.hue}">${esc(u.icon)}</span>${u.track === 'ws' ? `<span class="tiny muted">سرفصل ${faNum(u.wsi + 1)}</span>` : u.idx < 1000 ? `<span class="tiny muted" style="font-weight:700">درس ${faNum(u.n)}</span>` : ''}<b>${esc(u.fa)}</b><span class="en">${esc(u.en)}</span>
    <div class="bar mark"><i style="width:${words.length ? Math.round(learned / words.length * 100) : 0}%"></i></div></a>`;
}
function taskLink(t) { const k = t.k || ''; if (tl() !== 'en' && (k === 'unit' || k.startsWith('step:') || k.startsWith('unit:'))) return '#aru/' + curUnits()[curIdx()][0]; if (k.startsWith('topic:')) return '#verbs/' + encodeURIComponent('⭐ ' + k.slice(6)); if (k.startsWith('wtopic:')) return '#wtopics/' + encodeURIComponent(k.slice(7)); if (k.startsWith('step:')) { const [, id, st] = k.split(':'); return st === 'words' ? `#unit/${id}/words` : st === 'dialog' ? `#unit/${id}/conv` : st === 'teach' ? `#unit/${id}/gram` : `#${st}/${id}`; } if (k.startsWith('exam:')) return '#exam/' + k.split(':')[1]; if (k === 'cards') return '#leitner'; if (k === 'radio') return '#listen'; if (k === 'news') return tl() === 'en' ? '#news' : '#listen'; return ''; }
function taskDone(t) {
  if ((U.mdone || {})[isoDay() + '|' + t.k]) return true;
  const cur = currentUnit(); const st = unitState(cur);
  if (t.k === 'news' || t.k === 'radio') return listenDone(t);
  if (t.k === 'cards') return dueIds().length === 0;
  if (t.k === 'min') return (U.log[isoDay()]?.min || 0) >= (U.plan?.minutes || 30);
  if (t.k?.startsWith('step:')) { const [, uidp, s] = t.k.split(':'); return !!U.units[uidp]?.steps?.[s]; }
  if (t.k?.startsWith('exam:')) return !!U.units[t.k.split(':')[1]]?.mastered;
  return false;
}

/* ───────── صفحهٔ درس ───────── */
const STEPS = [
  { k: 'lesson', ic: '📖', fa: 'کلاس درس (مثل کتاب)', d: 'متن، مکالمه، گرامر با توضیح معلم، تمرین و جمع‌بندی' },
  { k: 'words', ic: '👂', fa: 'شنیدن و دیدن واژه‌ها', d: 'همهٔ واژه‌ها را با تصویر و تلفظ ببین و بشنو' },
  { k: 'cards', ic: '🃏', fa: 'فلش‌کارت هوشمند', d: 'یادآوری فعال؛ همراه واژه‌های درس‌های قبل' },
  { k: 'dialog', ic: '🎭', fa: 'مکالمهٔ درس', d: 'گوش بده و پشت سرش تکرار کن (سایه‌خوانی)' },
  { k: 'teach', ic: '👩‍🏫', fa: 'کلاس با معلم صوتی', d: 'گرامر و کاربرد، به فارسی و قدم‌به‌قدم' },
  { k: 'talk', ic: '🗣️', fa: 'صحبت دربارهٔ موضوع', d: 'گفتگوی آزاد با همین واژه‌ها، با اصلاح فوری' },
  { k: 'quiz', ic: '✍️', fa: 'کوییز تمرینی', d: 'تصویر، شنیدن و ترجمه' },
  { k: 'exam', ic: '🏁', fa: 'آزمون نهایی درس', d: 'کوییز + آزمون شفاهی با هوش مصنوعی' }
];
routes.unit = (id, sub) => {
  const u = unitById(id); if (!u) return go('home'); if (!isOpen(u)) { toast('این درس هنوز قفل است.'); return go('home'); }
  setTop(u.fa, true); const st = unitState(u); const words = unitWords(u);
  view().innerHTML = `<div class="stack">
  <div class="hero"><span class="tile" style="--h:${u.hue}">${esc(u.icon)}</span><div class="grow"><div class="small muted">${esc(u.levelFa || 'درس من')} ${u.track === 'ws' ? '· سرفصل ' + faNum(u.wsi + 1) : u.idx < 1000 ? '· درس ' + faNum(u.n) : ''}</div><b style="font-size:20px">${esc(u.fa)}</b> <span class="en muted">${esc(u.en)}</span>
  <div class="row small"><span class="pill">${faNum(words.length)} واژه</span>${st.mastered ? `<span class="pill ok">قبول با نمرهٔ ${faNum(st.best.exam)}</span>` : st.best.exam ? `<span class="pill bad">بهترین نمره: ${faNum(st.best.exam)}</span>` : ''}</div></div></div>
  <div class="card stack"><div class="row" style="justify-content:space-between"><b>در این درس یاد می‌گیری</b><span class="pill acc">سطح ${esc(u.cefr || 'A2')} · ${esc(u.levelFa || 'درس من')}</span></div>
  <ul class="small" style="margin:0;padding-inline-start:18px;line-height:2"><li>${faNum(unitWords(u).length || 20)}+ واژه، فعل و عبارت دربارهٔ «${esc(u.fa)}» با تصویر و تلفظ</li><li><b>گرامر:</b> ${bidi(u.gram || '—')}</li><li><b>در پایان می‌توانی:</b> ${bidi(u.talk || '—')}</li><li>یک مکالمهٔ واقعی این موقعیت، شنیدن و تکرار، و صحبت با معلم</li></ul>
  <span class="tiny muted">قبولی: نمرهٔ ${faNum(G.settings.passScore)} در آزمون پایانی؛ بعد درس بعدی باز می‌شود.</span>
  <div id="why">${G.cache['why:' + u.id] ? `<div class="notice soft small">${esc(G.cache['why:' + u.id])}</div>` : `<button class="btn ghost sm" id="whyb">این درس به چه دردم می‌خورد؟</button>`}</div>
  <div id="ua"></div><div class="stack" id="ub"><div class="row" style="gap:6px"><a class="btn ghost sm" href="#sleep/${u.id}">🌙 مرور قبل از خواب (سه‌بعدی)</a><a class="btn ghost sm" href="#myradio/${u.id}">📻 رادیوی این درس</a></div><button class="btn ghost sm wide" id="dlv">⬇ دانلود صدای انگلیسی این درس برای آفلاین (🇺🇸 آمریکایی + 🇬🇧 بریتانیایی)</button><button class="btn ghost sm wide" id="mkaudio">🎧 صوت کامل درس (واژه‌ها + مکالمه) برای گوش دادن آفلاین و دانلود</button></div></div>
  ${!words.length ? `<div class="notice">لغات این سرفصل هنوز ساخته نشده. با یک دکمه هوش مصنوعی همهٔ واژه‌ها و افعال کاربردی‌اش را می‌سازد.</div>` : ''}
  <ul class="steps">${STEPS.map((s, i) => `<li><a class="step${st.steps[s.k] || (s.k === 'exam' && st.mastered) ? ' done' : ''}" href="#${s.k === 'words' ? 'unit/' + u.id + '/w' : s.k + '/' + u.id}"><span class="n">${st.steps[s.k] || (s.k === 'exam' && st.mastered) ? '✓' : faNum(i + 1)}</span><span class="grow"><b>${s.ic} ${s.fa}</b><br><span class="small muted">${s.d}</span></span></a></li>`).join('')}</ul>
  <div class="grid2"><a class="btn ghost" href="#grammar">📐 گرامر کامل</a><a class="btn ghost" href="#verbs">🔁 افعال کاربردی</a><a class="btn ghost" href="#practice/${u.id}">✍️ تمرین‌ها (آفلاین و هوشمند)</a><a class="btn ghost" href="#theater">🎬 داستان صوتی با این واژه‌ها</a></div>
  <div class="sec">واژه‌ها و افعال <small>${faNum(words.length)} مورد</small><span class="grow"></span><button class="btn ghost sm" id="more">${words.length ? '+ بانک کامل لغات، افعال و جمله‌ها' : 'ساخت بانک کامل لغات این درس'}</button></div>
  <button class="btn wide tlive-btn" id="tlive">🎓 این واژه‌ها را معلم زنده یادم بدهد</button>
  <div class="row" style="justify-content:space-between"><span class="small muted">تلفظ بومی به خط فارسی:</span><div class="seg" id="wacc">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.accent === 'UK' ? 'UK' : 'US') === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
  <div class="row"><button class="btn sm" id="playall">${I.spk} پخش همه</button><span class="small muted">رنگ نقطه: نارنجی = تازه، فیروزه‌ای = در حال تثبیت، سبز = تثبیت‌شده</span></div>
  <div class="stack" id="wl">${(() => { const groups = {}; words.forEach(w => (groups[w.g || 'واژه‌های اصلی درس'] = groups[w.g || 'واژه‌های اصلی درس'] || []).push(w)); return Object.entries(groups).map(([g, ws]) => `<details class="card" ${Object.keys(groups).length < 3 ? 'open' : ''}><summary>${esc(g)} <span class="pill">${faNum(ws.length)}</span></summary><div class="words" style="margin-top:8px">${ws.map(w => wordRow(u, w)).join('')}</div></details>`).join(''); })()}</div></div>`;
  bindWordRows(u); autoImages(view()); fillPron(view(), u.level);
  $('#wacc') && ($('#wacc').onclick = e => { const b = e.target.closest('button'); if (!b) return; G.settings.accent = b.dataset.v; saveG('settings'); $$('#wacc button').forEach(x => x.classList.toggle('on', x === b)); fillPron(view(), u.level); });
  $('#tlive').onclick = () => teachThis(u.track === 'ws' ? { ws: u.id } : { unit: u.id, focus: 'words' }, `واژه‌های «${u.fa}»`);
  $('#whyb') && ($('#whyb').onclick = async () => { if (needAI($('#why'))) return; $('#why').innerHTML = loading(); try { const r = await ai({ system: 'You are a motivating Persian-speaking English teacher.', messages: [{ role: 'user', content: `${learnerContext(u)}\n\nIn Persian, in 3 short sentences, tell this learner why the unit "${u.en}" (grammar: ${u.gram}) is useful for their real real life and how it moves them toward fluent speaking. JSON {"why":"..."}` }] }); G.cache['why:' + u.id] = r.why; saveG('cache'); $('#why').innerHTML = `<div class="notice soft small">${esc(r.why)}</div>`; say(r.why, 'fa', 'encouraging'); } catch (e) { aiErr(e); $('#why').innerHTML = ''; } });
  $('#more').onclick = () => expandWords(u);
  idb.get('unitwav:' + u.id).then(b => { if (b) audioBox($('#ub'), b, 'zaban-' + u.id); });
  $('#dlv') && (lsGet('zd:enpack:' + u.id, 0) && ($('#dlv').textContent = '✓ صدای انگلیسی این درس آفلاین ذخیره شده'), $('#dlv').onclick = () => downloadEnPack(u.id, $('#dlv')));
  $('#mkaudio') && ($('#mkaudio').onclick = async () => { if (!unitWords(u).length) return toast('اول لغات این درس را بساز.'); const box = $('#ub'); try { const b = await buildAudio('unitwav:' + u.id, unitAudioChunks(u), (i, n) => box.innerHTML = loading(`در حال ساخت صوت درس… ${faNum(i + 1)} از ${faNum(n)}`)); audioBox(box, b, 'zaban-' + u.id); } catch (e) { box.innerHTML = ''; aiErr(e); } });
  $('#playall').onclick = async e => { for (const w of words) { if (!(await say(w.w, 'en', 'calm'))) break; await sleep(350); } };
  idb.get('unitaudio:' + u.id).then(b => { $('#ua').innerHTML = `${b ? `<audio controls src="${URL.createObjectURL(b)}" style="width:100%"></audio>` : ''}<label class="btn line sm" style="margin-top:6px">${b ? 'جایگزینی' : 'افزودن'} فایل صوتی دلخواه برای این درس<input type="file" accept="audio/*" hidden id="uaf"></label>`; $('#uaf').onchange = async e => { const f = e.target.files[0]; if (f) { await idb.set('unitaudio:' + u.id, f); routes.unit(id, 'steps'); } }; });
  if (sub === 'w') { markStep(u, 'words'); setTimeout(() => $('#wl')?.scrollIntoView({ behavior: 'smooth' }), 100); }
};
/* تلفظ بومی به خط فارسی (آمریکایی/بریتانیایی) برای هر واژه و جملهٔ نمونه */
async function fillPron(root, lv) { if (typeof pronLevel !== 'function') return; const P = await pronLevel(lv); const flag = G.settings.accent === 'UK' ? '🇬🇧' : '🇺🇸';
  $$('.pron-w', root).forEach(el => { const x = pronOf(P, el.dataset.pw); el.innerHTML = x ? `<span class="pron">🗣 ${flag} «${esc(x)}»</span>` : ''; }); }
function wordRow(u, w) {
  const s = U.srs[wid(u, w)]; return `<div class="word" data-w="${esc(w.w)}">${picHTML(u, w)}<div class="t"><b>${esc(w.w)}</b><span class="ipa">/${esc(w.ipa || '')}/</span><span>${esc(w.fa)} <span class="pill">${POS[w.pos] || ''}</span>${regPill(w)}</span>${w.use ? `<span class="small muted">🧭 کجا: ${esc(w.use)}</span>` : ''}<span class="pron-w" data-pw="${esc(w.w)}"></span><span class="en small muted" style="text-align:right">${esc(w.ex || '')}</span><span class="pron-w" data-pw="${esc((w.ex || '').trim())}"></span></div>
  <span class="lv l${s ? s.box : 0}" title="سطح تثبیت"></span><div class="acts" style="flex-direction:column"><button class="icon-btn" data-a="say" title="تلفظ">${I.spk}</button><button class="icon-btn" data-a="ask" title="دربارهٔ این لغت بپرس">${I.ask}</button></div></div>`;
}
function bindWordRows(u) {
  $$('.word', view()).forEach(row => {
    const w = unitWords(u).find(x => x.w === row.dataset.w);
    row.querySelector('[data-a=say]').onclick = e => say(w.w + '. ' + (w.ex || ''), 'en', 'calm', e.currentTarget);
    row.querySelector('[data-a=ask]').onclick = () => askWord(u, w);
    row.querySelector('.pic').onclick = () => imageSheet(u, w);
  });
}
async function expandWords(u) {
  if (needAI(view().querySelector('.words') || view())) return;
  const have = unitWords(u).map(w => w.w);
  const bg = sheet(loading('در حال طراحی سرفصل‌های بانک لغات…'));
  const SYS = 'You are an expert ESL vocabulary-book author for Persian speakers (original content). Accuracy is critical: correct IPA (General American), natural Persian meanings, natural examples.';
  try {
    const plan = await ai({ heavy: true, temp: 0.3, system: SYS, messages: [{ role: 'user', content: `Topic "${u.en}" (${u.fa}), CEFR level ${u.cefr || 'A2'}, grammar ${u.gram}. Design 6-8 sub-topics that together cover EVERYTHING a learner needs to talk about this topic fluently in real life (things/nouns, all relevant verbs and phrasal verbs, describing adjectives, what one person says, what the other says, and a last group of complete ready-to-use sentences). JSON {"groups":[{"fa":"Persian sub-topic name","en":"English focus description","n":8-14}]}` }] });
    const ex = G.extra[u.id] || (G.extra[u.id] = { words: [] }); const seen = new Set(have.map(x => x.toLowerCase())); let added = 0, done = 0;
    const box = bg.querySelector('.sheet'); const upd = () => box.innerHTML = '<div class="grab"></div>' + loading(`در حال ساخت بانک لغات: ${faNum(done)} از ${faNum(plan.groups.length)} سرفصل · ${faNum(added)} مورد`);
    upd();
    for (const g of (plan.groups || []).slice(0, 9)) { // پشت‌سرهم، برای سهمیهٔ رایگان
      for (let attempt = 0; attempt < 3; attempt++) try {
        const sent = /sentence|جمل/i.test(g.en + g.fa);
        const r = await ai({ heavy: true, max: 6000, temp: 0.4, system: SYS, messages: [{ role: 'user', content: `Topic "${u.en}", sub-topic "${g.en}" (${g.fa}). Give ${g.n || 10} of the most useful everyday ${sent ? 'complete natural sentences (questions and answers people really say)' : 'items (words, verbs, phrasal verbs, collocations or set expressions)'} for this sub-topic. Avoid these (already included): ${[...seen].slice(0, 120).join(', ')}. JSON {"words":[{"w":"","ipa":"no slashes","fa":"Persian","img":"one emoji","pos":"${sent ? 'sent' : 'n|v|adj|adv|prep|phr'}","ex":"short natural example${sent ? ' reply' : ''}"}]}` }] });
        (r.words || []).forEach(w => { if (w.w && w.fa && !seen.has(w.w.toLowerCase())) { seen.add(w.w.toLowerCase()); ex.words.push({ ...w, g: g.fa }); added++; } });
        break;
      } catch { await sleep(4000 * (attempt + 1)); }
      done++; upd(); saveG('extra');
    }
    saveG('extra'); bg.remove(); toast(`${faNum(added)} مورد در ${faNum(plan.groups.length)} سرفصل اضافه شد.`, 4000); routes.unit(u.id, 'steps');
  } catch (e) { bg.remove(); aiErr(e); }
}
function imageSheet(u, w) {
  const k = wid(u, w);
  const bg = sheet(`<div class="stack"><b>تصویر «${esc(w.w)}»</b><div class="row" style="justify-content:center">${picHTML(u, w, true).replace('class="pic big"', 'class="pic" style="width:180px;height:180px;font-size:80px;--h:' + u.hue + '"')}</div>
  <div class="grid2"><button class="btn ghost" id="i1">تصویر سه‌بعدی برنامه</button><button class="btn ghost" id="i2">عکس واقعی از اینترنت</button><label class="btn ghost">تصویر از گوشی/کامپیوتر<input type="file" accept="image/*" hidden id="i3"></label><button class="btn line" id="i4">فقط ایموجی</button></div><span class="tiny muted">تصاویر سه‌بعدی: Microsoft Fluent Emoji (مجوز MIT)؛ همیشه آفلاین.</span></div>`);
  const set = url => { if (url) G.img[k] = url; else delete G.img[k]; saveG('img'); bg.remove(); routes.unit(u.id, 'steps'); };
  $('#i1', bg).onclick = () => set(null);
  $('#i2', bg).onclick = async () => { try { const url = await photoUrl(u, w); url ? set(url) : toast('عکسی پیدا نشد.'); } catch { toast('اتصال به منبع عکس ممکن نشد.'); } };
  $('#i3', bg).onchange = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = 256; c.width = c.height = s; const g = c.getContext('2d'); const m = Math.min(img.width, img.height); g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); set(c.toDataURL('image/jpeg', 0.8)); }; img.src = URL.createObjectURL(f); };
  $('#i4', bg).onclick = () => set(null);
}
async function askWord(u, w) {
  const bg = sheet(`<div class="stack"><div class="row">${picHTML(u, w)}<div class="grow"><b class="en" style="font-size:22px">${esc(w.w)}</b><div class="en muted">/${esc(w.ipa)}/</div><div>${esc(w.fa)}</div></div><button class="icon-btn" id="sp">${I.spk}</button></div><div class="row"><a class="btn ghost sm" href="#dict/${encodeURIComponent(w.w)}" onclick="this.closest('.sheet-bg').remove()">📕 دیکشنری کامل</a><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.ldoceonline.com/dictionary/${encodeURIComponent(w.w.toLowerCase().replace(/\s+/g, '-'))}">لانگمن ↗</a></div><div id="aw">${loading()}</div><button class="btn ghost sm" id="nat">🗣 نیتیوها واقعاً چطور می‌گویند؟</button><div id="natv"></div><div id="pcw"></div><div class="card stack"><b>تلفظ‌سنج سریع</b><span class="small muted">دکمهٔ میکروفون را بزن و واژه را بگو.</span><div class="row" id="pr"></div></div></div>`);
  pronCoach($('#pcw', bg), w.w); $('#nat', bg).onclick = () => nativeSay($('#natv', bg), w.ex || w.w);
  $('#sp', bg).onclick = e => say(w.w, 'en', 'calm', e.currentTarget);
  const pr = $('#pr', bg); const res = document.createElement('span'); res.className = 'grow small';
  pr.append(micButton(t => { const s = similarity(t, w.w); res.innerHTML = `شنیدم: <b class="en">${esc(t)}</b> — شباهت ${faNum(s)}٪ ${s >= 85 ? '👏 عالی' : s >= 60 ? '👍 نزدیک بود، دوباره' : '🔁 دوباره گوش بده و تکرار کن'}`; if (s >= 85) addXP(3); saveU(); }), res);
  const key = 'ask:' + u.id + ':' + w.w;
  const show = r => { $('#aw', bg).innerHTML = `<div class="card stack small"><div><b>کاربرد:</b> ${esc(r.usage)}</div>${r.collocations?.length ? `<div><b>ترکیب‌های رایج:</b><ul class="list">${r.collocations.map(c => `<li><span class="en">${esc(c.en)}</span> — ${esc(c.fa)}</li>`).join('')}</ul></div>` : ''}${r.mistakes?.length ? `<div><b>اشتباه‌های رایج فارسی‌زبان‌ها:</b><ul class="list">${r.mistakes.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}${r.examples?.length ? `<div><b>نمونه:</b><ul class="list">${r.examples.map(x => `<li><span class="en">${esc(x.en)}</span><br><span class="muted">${esc(x.fa)}</span></li>`).join('')}</ul></div>` : ''}${r.tip ? `<div class="notice soft">${esc(r.tip)}</div>` : ''}</div>`; };
  if (G.cache[key]) return show(G.cache[key]);
  if (needAI($('#aw', bg))) return;
  try { const r = await ai({ system: 'You are an expert English teacher for Persian speakers. Be accurate and practical.', messages: [{ role: 'user', content: `Explain the English word/phrase "${w.w}" (meaning: ${w.fa}) for a Persian-speaking learner. Persian explanations. JSON {"usage":"how and when it is used (Persian)","collocations":[{"en":"","fa":""}] (4-6),"mistakes":["common mistakes Persian speakers make with it (Persian)"],"examples":[{"en":"","fa":""}] (3),"tip":"memory trick in Persian"}` }] }); G.cache[key] = r; saveG('cache'); show(r); }
  catch (e) { $('#aw', bg).innerHTML = ''; aiErr(e); }
}

/* ───────── فلش‌کارت ───────── */
routes.cards = id => {
  const cur = id === 'due' ? null : unitById(id);
  setTop(cur ? 'فلش‌کارت · ' + cur.fa : 'مرور امروز', true);
  let deck;
  if (cur) {
    const own = unitWords(cur).map(w => wid(cur, w));
    const fresh = own.filter(k => !U.srs[k] || U.srs[k].due <= isoDay());
    const prevDue = dueIds().filter(k => !k.startsWith(cur.id + ':'));
    deck = [...shuffle(fresh).slice(0, 20), ...shuffle(prevDue).slice(0, 8)]; // مرور مارپیچی درس‌های قبل
    if (!deck.length) deck = pick(own, 12);
  } else deck = shuffle(dueIds()).slice(0, 40);
  deck = shuffle(deck).map(k => wordFromId(k)).filter(Boolean);
  if (!deck.length) { view().innerHTML = `<div class="card stack" style="text-align:center"><div class="big-ic">🎉</div><b>امروز چیزی برای مرور نمانده.</b><a class="btn" href="#unit/${currentUnit().id}">ادامهٔ درس</a></div>`; return; }
  let i = 0, right = 0; const modes = ['img', 'fa', 'listen'];
  const draw = () => {
    if (i >= deck.length) { if (cur) markStep(cur, 'cards'); view().innerHTML = `<div class="card stack" style="text-align:center"><div class="big-ic">${right / deck.length > .8 ? '🌟' : '💪'}</div><b>${faNum(right)} از ${faNum(deck.length)} را به یاد آوردی.</b><span class="muted small">واژه‌هایی که یادت نبود، همین امروز دوباره مرور می‌شوند؛ آن‌هایی که بلد بودی، با فاصلهٔ بیشتر.</span><div class="row" style="justify-content:center"><a class="btn" href="${cur ? '#unit/' + cur.id : '#home'}">بازگشت</a><button class="btn ghost" onclick="routes.cards('${id}')">یک دور دیگر</button></div></div>`; return; }
    const { u, w } = deck[i]; const mode = modes[(i + (U.srs[wid(u, w)]?.box || 0)) % 3]; const prev = cur && u.id !== cur.id;
    view().innerHTML = `<div class="stack"><div class="row small"><span class="grow muted">${faNum(i + 1)} از ${faNum(deck.length)}${prev ? ` · <span class="pill acc">مرور از «${esc(u.fa)}»</span>` : ''}</span><span class="pill">${mode === 'img' ? 'از روی تصویر بگو' : mode === 'fa' ? 'انگلیسی‌اش را بگو' : 'گوش بده، معنی را بگو'}</span></div>
    <div class="bar"><i style="width:${i / deck.length * 100}%"></i></div>
    <div class="flash" id="fc"><div class="inner">
      <div class="face front">${mode === 'listen' ? `<button class="icon-btn on" style="width:96px;height:96px" id="ls">${I.spk}</button><span class="muted">گوش بده</span>` : `${picHTML(u, w, true)}${mode === 'fa' ? `<div class="fa">${esc(w.fa)}</div>` : ''}`}<span class="small muted">برای دیدن جواب بزن</span></div>
      <div class="face back">${picHTML(u, w)}<div class="w">${esc(w.w)}</div><div class="en muted">/${esc(w.ipa)}/</div><div class="fa">${esc(w.fa)}</div><div class="ex">${esc(w.ex || '')}</div></div>
    </div></div>
    <div class="row" id="say"></div>
    <div class="grid2"><button class="btn bad" id="no">یادم نبود</button><button class="btn ok" id="yes">بلد بودم</button></div></div>`;
    autoImages(view()); const fc = $('#fc');
    const flip = () => { fc.classList.add('flip'); say(w.w, 'en', 'calm'); };
    fc.onclick = flip; $('#ls') && ($('#ls').onclick = e => { e.stopPropagation(); say(w.w, 'en', 'calm'); }); if (mode === 'listen') setTimeout(() => say(w.w, 'en', 'calm'), 250);
    const res = document.createElement('span'); res.className = 'small grow';
    $('#say').append(micButton(t => { const s = similarity(t, w.w); res.innerHTML = `گفتی: <b class="en">${esc(t)}</b> · ${s >= 80 ? '✅ درست' : '❌ ' + esc(w.w)}`; flip(); }), res);
    const next = ok => { grade(wid(u, w), ok); if (ok) right++; i++; draw(); };
    $('#yes').onclick = () => next(true); $('#no').onclick = () => next(false);
  };
  draw();
};

/* ───────── کوییز تمرینی (و بخش اول آزمون نهایی) ───────── */
function buildQuiz(u, n) {
  const pool = unitWords(u); const prev = ALL_UNITS.filter(x => x.idx < u.idx && x.idx >= u.idx - 3).flatMap(x => unitWords(x).map(w => ({ u: x, w })));
  const items = [...pick(pool, Math.min(n - 2, pool.length)).map(w => ({ u, w })), ...pick(prev, Math.min(2, prev.length))];
  return shuffle(items).map(({ u: uu, w }) => {
    const type = ['img', 'listen', 'fa2en', 'en2fa'][Math.floor(Math.random() * 4)];
    const others = pick(unitWords(uu).filter(x => x.w !== w.w && x.fa !== w.fa), 3);
    const ans = type === 'en2fa' || type === 'listen' ? w.fa : w.w;
    const opts = shuffle([ans, ...others.map(o => type === 'en2fa' || type === 'listen' ? o.fa : o.w)]);
    return { u: uu, w, type, ans, opts };
  });
}
function runQuiz(el, qs, onDone) {
  let i = 0, score = 0; const wrongs = [];
  const draw = () => {
    if (i >= qs.length) return onDone(Math.round(score / qs.length * 100), wrongs);
    const q = qs[i];
    el.innerHTML = `<div class="stack"><div class="row small"><span class="grow muted">سؤال ${faNum(i + 1)} از ${faNum(qs.length)}</span><span class="pill ok">${faNum(score)} درست</span></div><div class="bar"><i style="width:${i / qs.length * 100}%"></i></div>
    <div class="card stack" style="align-items:center;text-align:center">${q.type === 'img' ? picHTML(q.u, q.w, true).replace('class="pic big"', 'class="pic" style="width:150px;height:150px;font-size:70px;--h:' + q.u.hue + '"') + '<b>این چیست؟</b>' : q.type === 'listen' ? `<button class="icon-btn on" style="width:84px;height:84px" id="ql">${I.spk}</button><b>معنی چیزی که شنیدی؟</b>` : q.type === 'fa2en' ? `<b style="font-size:22px">${esc(q.w.fa)}</b><span class="muted">به انگلیسی؟</span>` : `<b class="en" style="font-size:24px">${esc(q.w.w)}</b><span class="muted">یعنی؟</span>`}</div>
    <div class="opts">${q.opts.map(o => `<button class="opt ${/[a-z]/i.test(o) ? 'en' : ''}">${esc(o)}</button>`).join('')}</div></div>`;
    autoImages(el); if (q.type === 'listen') { setTimeout(() => say(q.w.w, 'en', 'calm'), 200); $('#ql', el).onclick = () => say(q.w.w, 'en', 'calm'); }
    $$('.opt', el).forEach(b => b.onclick = () => {
      const ok = b.textContent === q.ans; $$('.opt', el).forEach(x => { x.disabled = true; if (x.textContent === q.ans) x.classList.add('right'); }); if (!ok) { b.classList.add('wrong'); wrongs.push({ wrong: b.textContent, right: q.ans, why: `${q.w.w} = ${q.w.fa}` }); }
      if (ok) { score++; addXP(5); } grade(wid(q.u, q.w), ok); say(q.w.w, 'en', 'calm'); const gen = routeGen; setTimeout(() => { if (gen !== routeGen) return; i++; draw(); }, ok ? 800 : 1700);
    });
  };
  draw();
}
routes.quiz = id => {
  const u = unitById(id); if (!unitWords(u).length) { toast('اول لغات این درس را بساز.'); return go('unit/' + u.id); } setTop('کوییز · ' + u.fa, true);
  runQuiz(view(), buildQuiz(u, 12), (s, wrongs) => { logMistakes(wrongs, 'quiz'); if (s >= 70) markStep(u, 'quiz'); unitState(u).best.quiz = Math.max(unitState(u).best.quiz || 0, s); saveU();
    view().innerHTML = `<div class="card stack" style="text-align:center"><div class="score">${faNum(s)}٪</div><b>${s >= 90 ? 'عالی بود!' : s >= 70 ? 'خوب بود؛ با کمی مرور عالی می‌شود.' : 'یک دور فلش‌کارت بزن و دوباره امتحان کن.'}</b>${wrongs.length ? `<div class="small" style="text-align:right">${wrongs.map(w => `<div>❌ ${esc(w.wrong)} ← ✅ ${esc(w.right)}</div>`).join('')}</div>` : ''}<div class="row" style="justify-content:center"><a class="btn" href="#unit/${u.id}">بازگشت به درس</a><button class="btn ghost" onclick="routes.quiz('${u.id}')">دوباره</button></div></div>`; });
};

/* ───────── گفتگو (مؤلفهٔ مشترک) ───────── */
function convo(el, { key, system, intro, parse, speakLang = 'en', placeholder = 'بنویس یا با میکروفون بگو…', micLang, extraTop = '' }) {
  const hist = U.convos[key] || (U.convos[key] = []);
  el.innerHTML = `<div class="convo">${extraTop}<div class="msgs" id="msgs"></div><div class="composer"><textarea id="tx" rows="1" placeholder="${placeholder}"></textarea><span id="mic"></span><button class="icon-btn on" id="snd" title="ارسال">${I.send}</button></div></div>`;
  const msgs = $('#msgs', el), tx = $('#tx', el);
  const addMsg = (m, animateSpeak) => {
    if (m.role === 'user') { msgs.insertAdjacentHTML('beforeend', `<div class="msg me" dir="auto">${esc(m.content)}</div>`); (m.fixes || []).forEach(f => msgs.insertAdjacentHTML('beforeend', `<div class="fix"><s class="en">${esc(f.wrong)}</s> ← <b class="en">${esc(f.right)}</b><br>${esc(f.why || '')}</div>`)); }
    else { const d = document.createElement('div'); d.className = 'msg ai'; d.dir = 'auto'; d.innerHTML = `${esc(m.show || m.content)}${m.fa ? `<div class="small muted" style="margin-top:6px">${esc(m.fa)}</div>` : ''}<div class="say"><button>🔊 بشنو</button>${m.lang === 'en' ? '<button data-s>🐢 آهسته</button>' : ''}</div>`; d.querySelector('button').onclick = () => say(m.speak || m.show || m.content, m.lang || speakLang, m.emotion); const sl = d.querySelector('[data-s]'); if (sl) sl.onclick = () => { const r = G.settings.rate; G.settings.rate = 0.7; const v = G.settings.voiceEn; G.settings.voiceEn = 'browser'; say(m.speak || m.show, 'en').finally(() => { G.settings.rate = r; G.settings.voiceEn = v; }); }; msgs.append(d); if (animateSpeak && G.settings.autoSpeak) say(m.speak || m.show || m.content, m.lang || speakLang, m.emotion); }
  };
  hist.slice(-30).forEach(m => addMsg(m, false));
  const scroll = () => msgs.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  const send = async (text, silent) => {
    text = (text || '').trim(); if (!text && !silent) return; tx.value = '';
    if (!silent) { hist.push({ role: 'user', content: text }); addMsg({ role: 'user', content: text }); }
    const typing = document.createElement('div'); typing.className = 'msg ai'; typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; msgs.append(typing); scroll();
    try {
      const apiMsgs = hist.slice(-16).map(m => ({ role: m.role, content: m.raw || m.content }));
      if (!apiMsgs.length || apiMsgs[apiMsgs.length - 1].role !== 'user') apiMsgs.push({ role: 'user', content: silent || 'Start.' });
      const r = await ai({ system: typeof system === 'function' ? system() : system, messages: apiMsgs });
      typing.remove(); const out = parse(r); if (!out.show) throw new Error('پاسخ خالی بود؛ دوباره بفرست.');
      if (out.fixes?.length && !silent) { const last = [...msgs.querySelectorAll('.msg.me')].pop(); out.fixes.forEach(f => last.insertAdjacentHTML('afterend', `<div class="fix"><s class="en">${esc(f.wrong)}</s> ← <b class="en">${esc(f.right)}</b><br>${esc(f.why || '')}</div>`)); hist[hist.length - 1].fixes = out.fixes; logMistakes(out.fixes, key); }
      if (r.memory) remember(r.memory);
      const m = { role: 'assistant', content: out.show, show: out.show, fa: out.fa, speak: out.speak, lang: out.lang || speakLang, emotion: r.emotion, raw: JSON.stringify(r) };
      hist.push(m); addMsg(m, true); U.talkTurns = (U.talkTurns || 0) + 1; addXP(3);
      if (hist.length > 60) hist.splice(0, hist.length - 60); saveU(); scroll(); out.after && out.after(r);
    } catch (e) { typing.remove(); aiErr(e); }
  };
  $('#snd', el).onclick = () => send(tx.value);
  tx.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(tx.value); } };
  $('#mic', el).append(micButton(t => send(t), micLang));
  if (!hist.length && intro) send('', intro); else scroll();
  return { send, hist };
}
const TEACHER_STYLE = () => `You are ${G.settings.teacher}, a warm, witty, emotionally expressive Iranian English teacher who talks like a real human (not a robot): you are NEVER dry or robotic: you laugh, you joke lightly, you get genuinely excited about progress, you give specific praise ("you used the past tense perfectly there!"), you motivate by connecting each lesson to the learner's real life goals and how close they are to speaking fluently, you show gentle disappointment when the learner forgets something they should know ("I didn't expect you to forget X from the family lesson!"), you encourage and you celebrate. You speak natural, fluent, conversational Tehrani Persian; English only for the English examples. If the learner drifts off-topic, react warmly for a moment, tell them kindly it's outside today's lesson, and cleverly bridge back to the lesson topic (e.g. turn their off-topic remark into a practice sentence). Keep every turn short (max ~80 words) and always end with ONE small question or task for the learner, then wait. Use the learner profile: recycle words from earlier units, re-teach forgotten ones, refer back to past mistakes, praise fast progress and mention the predicted date for fluent speaking when it motivates. Accent for English examples: ${G.settings.accent === 'UK' ? 'British' : 'American'}.`;

/* معلم صوتی */
routes.teach = id => {
  const u = unitById(id); setTop('کلاس · ' + u.fa, true); const v = view(); if (needAI(v)) return;
  const words = unitWords(u).map(w => `${w.w} (${w.fa})`).join(', ');
  const c = convo(v, {
    key: 'teach:' + u.id, speakLang: 'fa', micLang: 'fa-IR', placeholder: 'به فارسی یا انگلیسی جواب بده…',
    intro: 'Start the lesson: greet me by name, tell me in one or two sentences why this unit matters for my real life, then begin teaching step 1.',
    extraTop: `<div class="notice soft small">معلم به فارسی درس می‌دهد و هر جا لازم باشد از تو سؤال می‌پرسد. با میکروفون جواب بده (فارسی یا انگلیسی). وقتی ۸ نوبت گفتگو کامل شد، این قدم تیک می‌خورد.</div>`,
    system: () => `${TEACHER_STYLE()}
LESSON: unit "${u.en}" (${u.fa}). Grammar focus: ${u.gram}. Speaking goal: ${u.talk}.
Unit words: ${words}.
Teach like a structured live class: (1) warm-up with words, (2) grammar explained simply in Persian with 2-3 English examples using unit words, (3) controlled practice: ask the learner to make sentences, (4) freer speaking about the topic, (5) quick recap. Move to the next stage only when the learner shows understanding. Correct mistakes kindly and explain in Persian.
${learnerContext(u)}
JSON {"say":"what you say (Persian with English examples)","emotion":"cheerful|calm|excited|encouraging|empathetic|proud|surprised|serious","fixes":[{"wrong":"learner's wrong English","right":"corrected","why":"short Persian"}],"memory":"one new durable fact about the learner worth remembering (interests, recurring difficulty, goal) or empty"}`,
    parse: r => ({ show: r.say, lang: 'fa', fixes: r.fixes, after: () => { if (c.hist.filter(m => m.role === 'user').length >= 8) markStep(u, 'teach'); } })
  });
};

/* صحبت دربارهٔ موضوع درس */
routes.talk = id => {
  const u = unitById(id); setTop('صحبت · ' + u.fa, true); const v = view(); if (needAI(v)) return;
  const c = convo(v, {
    key: 'talk:' + u.id, intro: 'Start a friendly conversation about the unit topic with a simple question.',
    extraTop: `<div class="notice soft small">به انگلیسی حرف بزن؛ اشتباه‌هایت همان لحظه با توضیح فارسی زرد می‌شوند. هدف: ${esc(u.talk)}</div>`,
    system: () => `You are a friendly English conversation partner for a Persian-speaking learner (CEFR level ${u.cefr || 'A2'}). Topic: "${u.en}". Use and recycle these unit words: ${unitWords(u).map(w => w.w).join(', ')}. Use the grammar: ${u.gram}. Speak simple natural English suited to the level, max 45 words, always ask a follow-up question. Be warm, curious and encouraging, react with real emotion to what they say. If they drift off the unit topic, acknowledge it briefly, say it's off-topic in a friendly way, and smoothly steer back to the topic. If the learner writes Persian, help them say it in English.
${learnerContext(u)}
JSON {"reply":"your English reply","fa":"Persian translation of your reply","fixes":[{"wrong":"exact wrong part from learner","right":"natural correct version","why":"short Persian explanation"}],"emotion":"cheerful|calm|excited|encouraging|empathetic|surprised","memory":"durable fact about learner or empty"}`,
    parse: r => ({ show: r.reply, fa: r.fa, lang: 'en', fixes: r.fixes, after: () => { if (c.hist.filter(m => m.role === 'user').length >= 8) markStep(u, 'talk'); } })
  });
};

/* گپ آزاد */
routes.chat = () => {
  setTop('گفتگو با هوش مصنوعی'); const v = view();
  v.innerHTML = `<div class="stack"><div class="tools">
    ${Object.entries(COACH).map(([k, m]) => `<a class="tool" href="#coach/${k}"><span class="ic">${m[0]}</span><b>${m[1]}</b><span>${m[2]}</span></a>`).join('')}
    <a class="tool" href="#talkfree"><span class="ic">💬</span><b>گپ آزاد</b><span>دربارهٔ هر موضوعی حرف بزن؛ اشتباه‌ها همان لحظه به فارسی گفته می‌شوند.</span></a>
    <a class="tool" href="#role"><span class="ic">🎭</span><b>نقش‌آفرینی موقعیت‌های واقعی</b><span>تاکسی، داروخانه، مصاحبه، صاحبخانه… با نمره و جملهٔ بهتر.</span></a>
    <a class="tool" href="#teach/${currentUnit().id}"><span class="ic">👩‍🏫</span><b>کلاس با ${esc(G.settings.teacher)}</b><span>ادامهٔ درس فعلی با معلم صوتی.</span></a>
    <a class="tool" href="#exam/${currentUnit().id}"><span class="ic">🎙️</span><b>آزمون شفاهی درس</b><span>سؤال‌ها یکی‌یکی پرسیده می‌شوند و آخرش نمره می‌گیری.</span></a>
    <a class="tool" href="#dm"><span class="ic">💬</span><b>پیام خصوصی</b><span>ببین چه کسی آنلاین است (چراغ سبز) و به هر زبان‌آموز یا مدیر پیام بده.</span></a>
    <a class="tool" href="#rooms"><span class="ic">🗣️</span><b>انجمن و چت‌روم</b><span>با بقیهٔ زبان‌آموزها گپ بزن؛ معلم ناظر نقش می‌دهد و اشتباه‌ها را درست می‌کند.</span></a></div></div>`;
};
/* تمرین با هوش مصنوعی: کوییز شفاهی، نقش دادن، سؤال پرسیدن */
function missedDays() { const P = U.plan; if (!P) return 0; let n = 0; for (let i = 1; i <= 60; i++) { const d = addDays(isoDay(), -i); const p = P.days[d]; if (!p) break; if (p.review) continue; if ((U.log[d]?.min || 0) >= P.minutes * 0.5) break; n++; } return n; }
function planContext() { const P = U.plan; if (!P) return 'The learner has no study plan yet.'; const end = addDays(P.start, P.dayCount - 1); const left = Math.max(1, Math.round((parseDay(end) - parseDay(isoDay())) / DAY) + 1);
  return `STUDY PLAN: goal "${P.goal || (P.target === 'l1' ? 'finish Intro + Level 1' : 'reach intermediate')}", target end ${end} (${left} days left), planned ${P.minutes} min/day, topics: ${(P.topics || []).join(', ') || '-'}. Units behind plan: ${planGap()}. Consecutive missed study days: ${missedDays()}. Last 14 days minutes: ${[...Array(14)].map((_, i) => Math.round(U.log[addDays(isoDay(), -i)]?.min || 0)).join(',')}. Today's tasks: ${(todayPlan()?.tasks || []).map(t => t.t + (taskDone(t) ? ' [done]' : '')).join('; ')}.`; }
const COACH = {
  live: ['📞', 'کلاس زندهٔ صوتی', 'مثل حالت صوتی ChatGPT: معلم زنده با تو حرف می‌زند، درس امروز را کار می‌کند و اشتباه‌هایت را می‌گوید.', ''],
  advisor: ['🧭', 'مشاور هوشمند برنامه', 'دربارهٔ هدف، برنامه، عقب‌افتادگی، انگیزه و روش درس خواندنت با یک مشاور حرفه‌ای حرف بزن؛ برنامه‌ات را می‌بیند و راهکار دقیق می‌دهد.', 'You are a professional, warm and honest language-learning ADVISOR (مشاور تحصیلی) for an Iranian adult. You can see the learner\'s plan, progress and missed days. Talk ONLY in natural colloquial Persian. Be specific with numbers (minutes per day, words per day, which lessons, which days), realistic about feasibility, and motivating without flattery. If they are behind, say exactly how many days they missed and the concrete catch-up schedule needed to still reach the goal date, or suggest moving the date. Ask one focused question at a time when you need information (available time, preferred hours, obstacles). Max 90 words per reply.'],
  quiz: ['🧩', 'ازم کوییز بگیر', 'سؤال‌های کوتاه از واژه‌ها و گرامر درس‌هایی که خوانده‌ای؛ جواب بده، نمره و توضیح بگیر.', 'You are a lively quiz master. Ask ONE short quiz question at a time about the learner\'s studied words and grammar (mix: meaning, fill the gap, choose the right form, translate a short Persian sentence, say it in English). After each answer: say if it is right, give the correct answer, a one-line Persian tip, a running score like "Score: 3/4", then ask the next question. Keep it fun and fast.'],
  role: ['🎭', 'بهم نقش بده', 'معلم یک موقعیت واقعی می‌سازد (فروشگاه، فرودگاه، مهمانی…) و نقش طرف مقابل را بازی می‌کند.', 'Pick a realistic everyday situation matching the learner\'s level and topics (e.g. a cafe, a hotel check-in, meeting a new neighbor). First tell the learner in Persian (fa field) who they are and what their goal is, then play the other person. Stay in role, keep lines short, and gently recast mistakes. After about 8 exchanges, step out of role and give a short Persian review with 3 better sentences.'],
  ask: ['🙋', 'ازم سؤال بپرس', 'معلم دربارهٔ زندگی، روز و علاقه‌هایت سؤال می‌پرسد تا راحت صحبت کردن را تمرین کنی.', 'Interview the learner like a warm friend: ask ONE personal question at a time about their life, day, family, work, hobbies and plans, using the grammar and words of their current unit. React with real interest, recast mistakes naturally, then ask a follow-up question.'],
  story: ['📚', 'با هم داستان بسازیم', 'یک جمله تو، یک جمله معلم؛ داستانی خنده‌دار با واژه‌های خودت.', 'Build a funny story together, one or two sentences at a time, alternating with the learner. Use their studied words, keep the English at their level, gently fix their sentences, and keep the plot surprising.'],
};
routes.coach = mode => {
  if (mode === 'live') return go('live');
  const m = COACH[mode]; if (!m) return go('chat'); setTop(m[1], true); const v = view(); if (needAI(v)) return;
  convo(v, {
    key: 'coach:' + mode, intro: 'Start now: greet me by name in one short line and begin.',
    extraTop: `<div class="notice soft small">${esc(m[2])} می‌توانی بنویسی یا با میکروفون جواب بدهی.</div>`,
    system: () => mode === 'advisor' ? `${m[3]}\n${planContext()}\n${learnerContext()}\nJSON {"reply":"Persian","emotion":"cheerful|calm|encouraging|empathetic|serious","memory":"durable fact or empty"}` : `${m[3]}\nThe learner is a Persian speaker; current unit: ${currentUnit().en} (CEFR ${currentUnit().cefr || 'A1'}), grammar: ${currentUnit().gram}. Studied words: ${unitWords(currentUnit()).slice(0, 30).map(w => w.w).join(', ')}. Keep English simple for their level. Max 60 words per reply.\n${learnerContext()}\nJSON {"reply":"English","fa":"Persian translation or instruction","fixes":[{"wrong":"","right":"","why":"Persian"}],"emotion":"cheerful|calm|excited|encouraging|empathetic|surprised","memory":"durable fact or empty"}`,
    parse: r => mode === 'advisor' ? ({ show: r.reply, lang: 'fa' }) : ({ show: r.reply, fa: r.fa, lang: 'en', fixes: r.fixes })
  });
};
routes.talkfree = () => {
  setTop('گپ آزاد', true); const v = view(); if (needAI(v)) return;
  convo(v, {
    key: 'free', intro: 'Greet me by name and start a natural conversation about my day or something from my memory profile.',
    extraTop: `<div class="notice soft small">دربارهٔ هر چیزی حرف بزن. اگر جایی گیر کردی، فارسی بنویس تا معادلش را یاد بگیری.</div>`,
    system: () => `You are a friendly, curious English conversation partner with real personality and emotions, chatting with a Persian-speaking learner. Adapt your English to their level (current unit: ${currentUnit().en}). Weave in their weak words and words from units they have studied. Max 50 words per reply, end with a question.
${learnerContext()}
JSON {"reply":"","fa":"Persian translation","fixes":[{"wrong":"","right":"","why":"Persian"}],"emotion":"cheerful|calm|excited|encouraging|empathetic|surprised","memory":"durable fact or empty"}`,
    parse: r => ({ show: r.reply, fa: r.fa, lang: 'en', fixes: r.fixes })
  });
};

/* نقش‌آفرینی */
routes.role = id => {
  if (!id) { setTop('نقش‌آفرینی موقعیت‌های واقعی', true); view().innerHTML = `<div class="tools">${SCENARIOS.map(s => `<a class="tool" href="#role/${s.id}"><span class="ic">${s.icon}</span><b>${esc(s.fa)}</b>${U.convos['roleScore:' + s.id] ? `<span>بهترین نمره: ${faNum(U.convos['roleScore:' + s.id])}</span>` : '<span>شروع</span>'}</a>`).join('')}</div>`; return; }
  const s = SCENARIOS.find(x => x.id === id); setTop(s.fa, true); const v = view(); if (needAI(v)) return;
  U.convos['role:' + id] = []; // هر بار از نو
  const c = convo(v, {
    key: 'role:' + id, intro: 'Start the scene in character with your first line.',
    extraTop: `<div class="notice soft small">تو در این صحنه خودت هستی. هر وقت خواستی تمام کنی، «پایان و نمره» را بزن.</div><button class="btn line" id="fin">پایان و نمره</button>`,
    system: () => `Role-play. You are ${s.role} Stay in character, speak natural English adapted to the learner's level (current unit ${currentUnit().en}), max 40 words per turn. Make it realistic and a little challenging.
${learnerContext()}
JSON {"reply":"your line","fa":"Persian translation","fixes":[{"wrong":"","right":"","why":"Persian"}],"emotion":"cheerful|calm|serious|surprised|empathetic","memory":""}`,
    parse: r => ({ show: r.reply, fa: r.fa, lang: 'en', fixes: r.fixes })
  });
  $('#fin', v).onclick = async () => {
    const lines = c.hist.filter(m => m.role === 'user').map(m => m.content); if (lines.length < 2) return toast('چند جمله بیشتر صحبت کن.');
    const bg = sheet(loading('در حال ارزیابی…'));
    try { const r = await ai({ system: 'You are a fair, encouraging English speaking examiner for Persian speakers.', messages: [{ role: 'user', content: `Scenario: ${s.role}\nLearner lines:\n${lines.join('\n')}\nEvaluate task success, fluency, grammar, vocabulary. JSON {"score":0-100,"summary":"Persian","strengths":["Persian"],"better":[{"yours":"","better":"more natural version","why":"Persian"}]}` }] });
      U.convos['roleScore:' + id] = Math.max(U.convos['roleScore:' + id] || 0, r.score); addXP(Math.round(r.score / 4)); logMistakes((r.better || []).map(b => ({ wrong: b.yours, right: b.better, why: b.why })), 'role'); saveU();
      bg.querySelector('.sheet').innerHTML = `<div class="stack"><div class="score">${faNum(r.score)}</div><div>${esc(r.summary)}</div>${r.strengths?.length ? `<div><b>نقاط قوت</b><ul class="list">${r.strengths.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}<div><b>جمله‌های بهتر</b>${(r.better || []).map(b => `<div class="card small" style="margin-top:6px"><s class="en">${esc(b.yours)}</s><br><b class="en">${esc(b.better)}</b><br><span class="muted">${esc(b.why)}</span></div>`).join('')}</div><button class="btn" onclick="this.closest('.sheet-bg').remove()">باشه</button></div>`;
      say(r.summary, 'fa', r.score >= 80 ? 'proud' : 'encouraging');
    } catch (e) { bg.remove(); aiErr(e); }
  };
};

/* ───────── مکالمهٔ درس (دیالوگ + سایه‌خوانی) ───────── */
routes.dialog = async id => {
  const u = unitById(id); setTop('مکالمهٔ درس · ' + u.fa, true); const v = view();
  const key = 'dlg:' + u.id;
  const render = d => {
    v.innerHTML = `<div class="stack"><div class="card"><b>${esc(d.title)}</b><div class="small muted">${esc(d.setting || '')}</div></div>
    <div class="row"><button class="btn" id="pa">${I.spk} پخش کل مکالمه</button><button class="btn ghost" id="nw">مکالمهٔ تازه</button></div>
    <div class="stack" id="ln">${d.lines.map((l, i) => `<div class="card stack" data-i="${i}"><div class="row"><span class="pill ${l.who === 'A' ? 'acc' : 'mark'}">${esc(l.name || l.who)}</span><span class="grow"></span><button class="icon-btn" data-p>${I.spk}</button><button class="icon-btn" data-nat title="نیتیوها چطور می‌گویند">🗣</button><span data-m></span></div><div class="en" style="font-size:16px">${esc(l.en)}</div><div class="small muted">${esc(l.fa)}</div><div class="small" data-r></div><div data-nv></div></div>`).join('')}</div>
    ${d.phrases?.length ? `<div class="card stack"><b>عبارت‌های کلیدی برای حفظ</b>${d.phrases.map(p => `<div class="small"><span class="en"><b>${esc(p.en)}</b></span> — ${esc(p.fa)}</div>`).join('')}</div>` : ''}
    <div class="notice soft small">سایه‌خوانی: هر جمله را گوش بده، میکروفون را بزن و همان را تکرار کن. وقتی نصف جمله‌ها را با شباهت ۷۵٪ به بالا گفتی، این قدم کامل می‌شود.</div></div>`;
    let ok = new Set();
    $$('[data-i]', v).forEach(card => {
      const l = d.lines[+card.dataset.i]; card.querySelector('[data-nat]').onclick = () => nativeSay(card.querySelector('[data-nv]'), l.en); card.querySelector('[data-p]').onclick = e => say(l.en, 'en', l.emotion || 'cheerful', e.currentTarget);
      card.querySelector('[data-m]').append(micButton(t => { const s = similarity(t, l.en); card.querySelector('[data-r]').innerHTML = `گفتی: <span class="en">${esc(t)}</span> · ${faNum(s)}٪ ${s >= 75 ? '✅' : '🔁'}`; if (s >= 75) { ok.add(card.dataset.i); addXP(3); if (ok.size >= Math.ceil(d.lines.length / 2)) markStep(u, 'dialog'); saveU(); } }));
    });
    $('#pa', v).onclick = async () => { for (const l of d.lines) { if (!(await say(l.en, 'en', l.emotion))) break; await sleep(300); } };
    $('#nw', v).onclick = () => { delete G.cache[key]; saveG('cache'); routes.dialog(id); };
  };
  if (G.cache[key]) return render(G.cache[key]);
  if (needAI(v)) return; v.innerHTML = loading('در حال نوشتن مکالمهٔ درس…');
  try {
    const prev = ALL_UNITS.filter(x => x.idx < u.idx).slice(-3).flatMap(x => pick(unitWords(x), 3).map(w => w.w));
    const r = await ai({ system: 'You write natural, realistic ESL dialogues for adults. Correct, idiomatic English.', messages: [{ role: 'user', content: `Write a natural dialogue (10-12 lines), using a wide variety of the real everyday expressions natives use in this situation (not just one standard phrase each), for unit "${u.en}", CEFR level ${u.cefr || 'A2'}, practicing grammar "${u.gram}". Use many of these words: ${unitWords(u).map(w => w.w).join(', ')}. Also naturally reuse a few words from earlier units: ${prev.join(', ')}. Setting in everyday real life. JSON {"title":"","setting":"Persian one line","lines":[{"who":"A|B","name":"","en":"","fa":"Persian translation","emotion":"cheerful|calm|surprised|excited|serious"}],"phrases":[{"en":"key useful phrase","fa":""}]}` }] });
    if (!Array.isArray(r.lines) || !r.lines.length) throw new Error('مکالمه کامل ساخته نشد؛ دوباره امتحان کن.');
    G.cache[key] = r; saveG('cache'); render(r);
  } catch (e) { v.innerHTML = ''; aiErr(e); }
};

/* ───────── آزمون نهایی درس (شرط باز شدن درس بعد) ───────── */
routes.exam = id => {
  const u = unitById(id); if (!unitWords(u).length) { toast('اول لغات این درس را بساز.'); return go('unit/' + u.id); } setTop('آزمون نهایی · ' + u.fa, true); const v = view(); const pass = G.settings.passScore;
  v.innerHTML = `<div class="card stack"><div class="big-ic">🏁</div><b>آزمون نهایی «${esc(u.fa)}»</b>
  <div class="small">دو بخش دارد: <b>کوییز ۲۰ سؤالی</b> (واژه و شنیدن؛ ۴۰٪ نمره) و <b>آزمون شفاهی با هوش مصنوعی</b> (۶ سؤال گفتاری دربارهٔ موضوع و گرامر؛ ۶۰٪ نمره). برای باز شدن درس بعد باید نمرهٔ کل <b>${faNum(pass)}</b> یا بالاتر شود.</div>
  <div class="notice soft small">پیشنهاد معلم: قبل از آزمون، قدم‌های ۱ تا ۶ را تمام کن. هر چند بار بخواهی می‌توانی آزمون بدهی.</div>
  <button class="btn" id="st">شروع آزمون</button></div>`;
  $('#st').onclick = () => {
    if (!hasAI() && !firstKeyed()) return needAI(v);
    runQuiz(v, buildQuiz(u, 20), (qScore, wrongs) => { logMistakes(wrongs, 'exam'); oral(qScore); });
  };
  const oral = async qScore => {
    v.innerHTML = loading('بخش اول تمام شد (' + faNum(qScore) + '٪). معلم در حال آماده کردن سؤال‌های شفاهی است…');
    let qs; try { qs = (await ai({ system: 'You are an English speaking examiner for Persian speakers.', messages: [{ role: 'user', content: `Create 6 short spoken exam questions in English for unit "${u.en}" (CEFR level ${u.cefr || 'A2'}) that require the learner to USE the grammar "${u.gram}" and the unit words (${unitWords(u).slice(0, 25).map(w => w.w).join(', ')}). Include 1 question that recycles a previous unit. JSON {"questions":[{"q":"","fa":"Persian translation"}]}` }] })).questions; } catch (e) { aiErr(e); return routes.exam(id); }
    const ans = []; let i = 0;
    const ask = () => {
      if (i >= qs.length) return grade2();
      const q = qs[i]; v.innerHTML = `<div class="stack"><div class="row small"><span class="grow muted">سؤال شفاهی ${faNum(i + 1)} از ${faNum(qs.length)}</span></div><div class="bar"><i style="width:${i / qs.length * 100}%"></i></div>
      <div class="card stack"><div class="en" style="font-size:19px">${esc(q.q)}</div><div class="small muted">${esc(q.fa)}</div><div class="row"><button class="icon-btn" id="rp">${I.spk}</button><span class="small muted">دوباره بشنو</span></div></div>
      <div class="card stack"><b>جوابت را بگو (یا بنویس)</b><div class="row"><span id="mc"></span><textarea id="at" class="in grow" rows="3" dir="ltr" placeholder="Your answer…"></textarea></div><button class="btn" id="nx">ثبت جواب</button></div></div>`;
      say(q.q, 'en', 'calm'); $('#rp').onclick = () => say(q.q, 'en', 'calm');
      $('#mc').append(micButton(t => { $('#at').value = ($('#at').value + ' ' + t).trim(); }));
      $('#nx').onclick = () => { const a = $('#at').value.trim(); if (!a) return toast('جوابی ثبت نشده.'); ans.push({ q: q.q, a }); i++; ask(); };
    };
    const grade2 = async () => {
      v.innerHTML = loading('در حال تصحیح…');
      try {
        const r = await ai({ temp: 0.2, system: 'You are a strict but fair English speaking examiner (CEFR-aligned) for Persian speakers. Score honestly; 95+ means near-perfect use of the unit grammar and vocabulary for this level.', messages: [{ role: 'user', content: `Unit "${u.en}" CEFR level ${u.cefr || 'A2'}, grammar ${u.gram}.\n${ans.map((x, k) => `Q${k + 1}: ${x.q}\nA: ${x.a}`).join('\n')}\nJSON {"score":0-100,"summary":"Persian, human and emotional (praise or gentle push)","per":[{"q":"","feedback":"Persian","better":"model answer"}],"fixes":[{"wrong":"","right":"","why":"Persian"}],"memory":"durable fact about learner or empty"}` }] });
        const total = Math.round(qScore * 0.4 + r.score * 0.6); const st = unitState(u); st.best.exam = Math.max(st.best.exam || 0, total); st.attempts = (st.attempts || 0) + 1;
        logMistakes(r.fixes, 'exam'); remember(r.memory);
        const passed = total >= pass; if (passed && !st.mastered) { st.mastered = isoDay(); addXP(200); }
        saveU();
        const next = nextUnit(u);
        v.innerHTML = `<div class="stack"><div class="card stack" style="text-align:center"><div class="big-ic">${passed ? '🎉' : '💪'}</div><div class="score">${faNum(total)}</div><div class="small muted">کوییز ${faNum(qScore)}٪ · شفاهی ${faNum(r.score)}٪ · حد قبولی ${faNum(pass)}</div><b>${passed ? 'قبول شدی! درس بعد باز شد.' : 'هنوز به حد قبولی نرسیدی؛ نکته‌های زیر را کار کن و دوباره امتحان بده.'}</b><div>${esc(r.summary)}</div></div>
        ${(r.per || []).map((p, k) => `<div class="card small stack"><b class="en">${esc(ans[k]?.q || p.q)}</b><div class="en muted">${esc(ans[k]?.a || '')}</div><div>${esc(p.feedback)}</div><div class="en"><b>بهتر:</b> ${esc(p.better)}</div></div>`).join('')}
        <div class="row">${passed && next ? `<a class="btn" href="#unit/${next.id}">رفتن به درس بعد: ${esc(next.fa)}</a>` : `<a class="btn" href="#unit/${u.id}">بازگشت به درس</a>`}<button class="btn ghost" onclick="routes.exam('${u.id}')">آزمون دوباره</button></div></div>`;
        say(r.summary, 'fa', passed ? 'proud' : 'encouraging');
      } catch (e) { aiErr(e); routes.exam(id); }
    };
    ask();
  };
};

/* ───────── تعیین سطح ───────── */
routes.placement = () => {
  setTop('تعیین سطح', true); const v = view();
  v.innerHTML = `<div class="card stack"><div class="big-ic">🧭</div><b>از کجا شروع کنیم؟</b><span class="small muted">اگر قبلاً انگلیسی خوانده‌ای، در یک آزمون کوتاه ۸ سؤالی (نوشتاری یا گفتاری) سطحت را می‌سنجیم و درس‌هایی را که بلدی باز می‌کنیم. واژه‌های آن درس‌ها هم برای مرور در فلش‌کارت‌هایت می‌آیند.</span>
  <div class="grid2"><button class="btn" id="tp">آزمون تعیین سطح</button><button class="btn ghost" id="zero">از صفر شروع می‌کنم</button></div></div>`;
  $('#zero').onclick = () => { U.placement = { openTo: 0, level: 'A0', d: isoDay() }; saveU(); go('plan'); };
  $('#tp').onclick = async () => {
    if (needAI(v)) return; v.innerHTML = loading('در حال ساخت آزمون…');
    try {
      const r = await ai({ system: 'You are an English placement test designer.', messages: [{ role: 'user', content: `Create an 8-question adaptive-style placement test from A1 to B1+ (2 per level: A1, A2, B1, B1+). Each question asks the learner to answer in a sentence or two (production, not multiple choice). JSON {"questions":[{"q":"English question","fa":"Persian hint","level":"A1|A2|B1|B1+"}]}` }] });
      const qs = r.questions; const ans = []; let i = 0;
      const ask = () => {
        if (i >= qs.length) return evalP();
        const q = qs[i]; v.innerHTML = `<div class="stack"><div class="bar"><i style="width:${i / qs.length * 100}%"></i></div><div class="card stack"><span class="pill">${esc(q.level)}</span><div class="en" style="font-size:18px">${esc(q.q)}</div><div class="small muted">${esc(q.fa)}</div></div><div class="card stack"><div class="row"><span id="mc"></span><textarea id="at" class="in grow" dir="ltr" rows="3" placeholder="Answer… (اگر بلد نیستی بنویس: I don't know)"></textarea></div><button class="btn" id="nx">بعدی</button></div></div>`;
        say(q.q, 'en', 'calm'); $('#mc').append(micButton(t => $('#at').value = t)); $('#nx').onclick = () => { ans.push({ q: q.q, level: q.level, a: $('#at').value.trim() || "I don't know" }); i++; ask(); };
      };
      const evalP = async () => {
        v.innerHTML = loading('در حال سنجش سطح…');
        const list = ALL_UNITS.map(x => `${x.idx}: ${x.en} (${x.gram})`).join('\n');
        const e = await ai({ temp: 0.2, system: 'You are a CEFR placement examiner. Be conservative: only skip units the learner clearly masters.', messages: [{ role: 'user', content: `Answers:\n${ans.map(x => `[${x.level}] ${x.q}\n→ ${x.a}`).join('\n')}\nUnits:\n${list}\nDecide the CEFR level and the index of the FIRST unit the learner should study (units before it are considered known). JSON {"level":"A0|A1|A2|B1|B1+","startIndex":0,"summary":"Persian, warm, explain strengths/weaknesses and the plan","memory":"durable fact"}` }] });
        const start = clamp(+e.startIndex || 0, 0, ALL_UNITS.length - 1);
        U.placement = { openTo: start, level: e.level, d: isoDay() };
        for (const x of ALL_UNITS.slice(0, start)) { const st = unitState(x); st.mastered = st.mastered || 'placement'; st.best.exam = st.best.exam || 0; unitWords(x).forEach(w => { const k = wid(x, w); if (!U.srs[k]) U.srs[k] = { box: 2, due: addDays(isoDay(), 1 + Math.floor(Math.random() * 10)), seen: 1, wrong: 0, right: 1 }; }); }
        remember(e.memory); addXP(50); saveU();
        v.innerHTML = `<div class="card stack"><div class="big-ic">🎯</div><b>سطح تو: ${esc(e.level)}</b><div>${esc(e.summary)}</div><div class="notice soft">شروع از درس ${faNum(start + 1)}: «${esc(ALL_UNITS[start].fa)}». واژه‌های درس‌های قبل برای مرور در فلش‌کارت‌ها قرار گرفتند.</div><a class="btn" href="#plan">ساخت برنامهٔ آموزشی من</a></div>`;
        say(e.summary, 'fa', 'encouraging');
      };
      ask();
    } catch (e) { aiErr(e); routes.placement(); }
  };
};

/* ───────── تقویم و برنامهٔ آموزشی (شمسی) ───────── */
function buildPlan({ start = isoDay(), days = 120, minutes = 60, target = 'l1', reminder = '20:00', review = 6 }) {
  days = clamp(Math.round(+days || 120), 7, 730); minutes = clamp(Math.round(+minutes || 30), 10, 240); review = clamp(Math.round(+review || 6), 3, 14);
  const from = currentUnit().idx; const lastIdx = target === 'l1' ? ALL_UNITS.findLastIndex(u => u.level === 'l1') : ALL_UNITS.length - 1;
  const units = ALL_UNITS.slice(from, lastIdx + 1);
  const studyDays = []; for (let i = 0; i < days; i++) { const d = addDays(start, i); if (weekdayIdx(d) !== review) studyDays.push(d); }
  const per = Math.max(2, Math.floor(studyDays.length / Math.max(1, units.length)));
  const out = {}; let k = 0;
  const wsFrom = currentWS().wsi; const wsList = WS_UNITS.slice(wsFrom, target === 'l1' ? WS_UNITS.findIndex(u => u.level === 'owsi') : WS_UNITS.findIndex(u => u.level === 'owsa'));
  const wsPer = Math.max(2, Math.floor(studyDays.length / Math.max(1, wsList.length)));
  units.forEach((u, ui) => {
    for (let j = 0; j < per && k < studyDays.length; j++, k++) {
      const d = studyDays[k]; const phase = j / per; const t = k === 0 ? [] : [{ k: 'cards', t: 'مرور فلش‌کارت‌های موعددار (همراه درس‌های قبل)' }];
      if (j === 0) t.push({ k: `step:${u.id}:words`, t: `واژه‌های «${u.fa}»: دیدن و شنیدن` }, { k: `step:${u.id}:cards`, t: 'فلش‌کارت واژه‌های تازه' });
      else if (phase < .4) t.push({ k: `step:${u.id}:dialog`, t: 'مکالمهٔ درس و سایه‌خوانی' }, { k: `step:${u.id}:teach`, t: `کلاس گرامر با ${G.settings.teacher}` });
      else if (j < per - 1) t.push({ k: `step:${u.id}:talk`, t: 'صحبت دربارهٔ موضوع درس' }, { k: `step:${u.id}:quiz`, t: 'کوییز تمرینی' }, { k: 'role', t: 'یک نقش‌آفرینی موقعیت‌های واقعی' });
      else t.push({ k: `exam:${u.id}`, t: `آزمون نهایی «${u.fa}» (حد قبولی ${faNum(G.settings.passScore)})` });
      const ws = wsList[Math.floor(k / wsPer)];
      if (ws) { const wj = k % wsPer; t.push(wj === wsPer - 1 ? { k: `exam:${ws.id}`, t: `آزمون واژگان «${ws.fa}»` } : { k: `step:${ws.id}:${wj === 0 ? 'cards' : 'talk'}`, t: `واژگان موضوعی «${ws.fa}» — ${wj === 0 ? 'یادگیری و فلش‌کارت' : 'تمرین و صحبت'} (۱۵ دقیقه)` }); }
      t.push({ k: 'min', t: `${faNum(minutes)} دقیقه مطالعه` });
      out[d] = { unit: u.id, ws: ws?.id, tasks: t };
    }
  });
  for (let i = 0; i < days; i++) { const d = addDays(start, i); if (!out[d]) out[d] = { unit: null, review: true, tasks: [{ k: 'cards', t: 'روز مرور: همهٔ فلش‌کارت‌های موعددار' }, { k: 'story', t: 'داستان با واژه‌های ضعیفم' }, { k: 'free', t: 'گپ آزاد ۱۵ دقیقه' }, { k: 'min', t: `${faNum(Math.round(minutes / 2))} دقیقه` }] }; }
  return { start, days, minutes, target, reminder, review, per, created: isoDay(), units: units.length, days: out, dayCount: days };
}
/* هدف آزاد (نوشتنی یا صوتی) → برنامه */
function parseGoalLocal(txt) {
  const t = txt.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); const out = { target: /متوسط|سطح ?۳|سطح ?3|B1|پیشرفته/i.test(t) ? 'l3' : 'l1', topics: [] };
  const mi = J_MONTHS.findIndex(m => new RegExp('(?:^|[\\s\\d])' + m + '(?=$|[\\s.،,؟!])').test(t)); if (mi >= 0) { let d = isoDay(); let last = null; for (let i = 0; i < 800; i++) { const x = addDays(isoDay(), i); const j = toJ(x); if (j.m === mi + 1) last = x; else if (last) break; } const mm = new RegExp('(\\d{1,2})\\s*' + J_MONTHS[mi]).exec(t); if (last) { if (mm && !/آخر/.test(t)) { const j0 = toJ(last); last = addDays(last, -(j0.d - +mm[1])); } out.days = Math.round((parseDay(last) - parseDay(isoDay())) / DAY) + 1; if (out.days < 7) { const y = addDays(last, 365); out.days = Math.round((parseDay(y) - parseDay(isoDay())) / DAY) + 1; } } }
  const mh = /(\d+(?:\.\d+)?)\s*ساعت/.exec(t), mm2 = /(\d+)\s*دقیقه/.exec(t); if (mh) out.minutes = Math.round(+mh[1] * 60); else if (mm2) out.minutes = +mm2[1]; else if (/نیم ?ساعت/.test(t)) out.minutes = 30;
  const tm = /ساعت\s*(\d{1,2})(?::(\d\d))?\s*(صبح|عصر|شب|بعدازظهر|بعد از ظهر)?/.exec(mh ? t.slice(0, mh.index) + ' '.repeat(mh[0].length) + t.slice(mh.index + mh[0].length) : t); if (tm && +tm[1] < 24) { let h = +tm[1]; if (/عصر|شب|ظهر/.test(tm[3] || '') && h < 12) h += 12; out.reminder = String(h).padStart(2, '0') + ':' + (tm[2] || '00'); }
  const m = t.match(/(?:زمینه|موضوع|مباحث|تاپیک)(?:ِ|‌ی)?\s*([^.،؛\n]+)/g) || []; m.forEach(x => x.replace(/^(?:زمینه|موضوع|مباحث|تاپیک)(?:ِ|‌ی)?\s*/, '').split(/\s*(?:،|,| و | یا |یا مثلا|مثلا)\s*/).map(y => y.replace(/^(?:های|ی)\s*/, '').replace(/\s*(کردن|هم|حتی|بشم|مسلط).*$/, '').trim()).filter(y => y.length > 1 && y.length < 25).forEach(y => out.topics.includes(y) || out.topics.push(y)));
  return out;
}
function goalBuild(g) {
  const n = (g.target === 'l1' ? ALL_UNITS.filter(u => u.level === 'intro' || u.level === 'l1').length : ALL_UNITS.length) - currentUnit().idx;
  g.days = g.days || (g.target === 'l1' ? 90 : 180); if (!g.minutes) g.minutes = clamp(Math.round(n / (g.days * 6 / 7) * 4.5 * 30 / 10) * 10, 30, 180);
  const P = buildPlan({ days: g.days, minutes: g.minutes, target: g.target, reminder: g.reminder || '20:00', review: 6 });
  P.goal = g.txt; P.topics = g.topics; addTopicTasks(P); return P;
}
function goalBox() { return `<div class="card stack"><b>🎯 هدفت را بنویس یا بگو</b><span class="small muted">مثلاً: «می‌خوام تا آخر بهمن سطح مقدماتی رو تموم کنم و تا آخر خرداد به سطح متوسط برسم. در زمینهٔ ترید، پوشاک و خرید هم مسلط بشم. روزی یک ساعت، ساعت ۸ شب وقت دارم.» برنامه خودش وقت روزانه را حساب می‌کند و کار هر روز را روی تقویم می‌چیند.</span>
  <div class="row" style="flex-wrap:nowrap;align-items:stretch"><textarea id="goal" class="in grow" rows="4" placeholder="هدفم این است که…">${esc(cleanRepeats(U.plan?.goal || ''))}</textarea><button class="btn ghost" id="gmic" aria-label="گفتن با صدا" style="min-width:52px">🎤</button></div>
  <button class="btn" id="gmk">✨ برنامه‌ام را از روی هدفم بساز</button><div id="gmsg"></div></div>`; }
/* حذف تکرارهای اشتباه تبدیل صدا به متن (باگ اندروید که هر جمله را چند بار تکرار می‌کند) */
function cleanRepeats(t) {
  let w = (t || '').replace(/\s+/g, ' ').trim().split(' ');
  for (let changed = true; changed;) { changed = false;
    for (let n = Math.min(20, Math.floor(w.length / 2)); n >= 1; n--) for (let i = 0; i + 2 * n <= w.length; i++) if (w.slice(i, i + n).join(' ') === w.slice(i + n, i + 2 * n).join(' ')) { w.splice(i + n, n); changed = true; i--; } }
  // جمله‌ای که پیشوند جملهٔ بعدی است (نسخهٔ ناقص قبلی) حذف شود
  return w.join(' ');
}
/* دیکته با صدا: هر بار بزنی ضبط شروع/تمام می‌شود؛ بی‌نهایت بار قابل تکرار */
function dictate(ta, btn, lang = 'fa-IR') {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let rec = null, on = false;
  const idle = () => { on = false; rec = null; btn.textContent = '🎤'; btn.classList.remove('rec'); };
  btn.onclick = () => {
    if (!SR) return toast('ضبط صدا در این مرورگر پشتیبانی نمی‌شود؛ از 🎤 روی کیبورد گوشی استفاده کن.');
    if (on) { on = false; try { rec?.stop(); } catch { } return; }
    on = true; btn.textContent = '⏹'; btn.classList.add('rec'); stopSpeak();
    const startOne = () => {
      if (!on) return idle(); rec = new SR(); rec.lang = lang; rec.interimResults = false; rec.continuous = false; rec.maxAlternatives = 1; let got = '';
      rec.onresult = e => { const r = e.results[e.results.length - 1]; if (r.isFinal) got = r[0].transcript; };
      rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { toast('اجازهٔ میکروفون داده نشده؛ از تنظیمات مرورگر اجازه بده.'); on = false; } };
      rec.onend = () => { if (got) { const cur = ta.value.trim(); const g = got.trim(); if (!cur.endsWith(g)) ta.value = cleanRepeats((cur ? cur + ' ' : '') + g); ta.dispatchEvent(new Event('input')); } if (on) setTimeout(startOne, 150); else idle(); };
      try { rec.start(); } catch { setTimeout(startOne, 400); }
    };
    startOne();
  };
}
function bindGoal() {
  dictate($('#goal'), $('#gmic'));
  $('#goal').onblur = () => { $('#goal').value = cleanRepeats($('#goal').value); };
  $('#gmk').onclick = async () => { const txt = cleanRepeats($('#goal').value.trim()); $('#goal').value = txt; if (txt.length < 8) return toast('هدفت را کمی کامل‌تر بنویس.'); $('#gmsg').innerHTML = loading('هدفت را بررسی می‌کنم…'); const g = await goalParse(txt); g.txt = txt; goalReview(g); };
}
/* بررسی شدنی بودن هدف و پیشنهاد برنامه پیش از گذاشتن در تقویم */
function goalMath(g) {
  const unitsLeft = Math.max(0, (g.target === 'l1' ? ALL_UNITS.filter(u => u.level === 'intro' || u.level === 'l1').length : ALL_UNITS.length) - currentUnit().idx);
  const wsTarget = WS_UNITS.filter(u => g.target === 'l1' ? u.level === 'owsb' : u.level !== 'owsa');
  const wsWords = wsTarget.reduce((a, u) => a + (unitWords(u).length || 30), 0) + g.topics.length * 40;
  const study = Math.max(1, Math.round(g.days * 6 / 7));
  const wpd = Math.ceil(wsWords / study), upw = unitsLeft / (study / 6);
  const need = Math.round(unitsLeft * 270 / study + wpd * 1.6 + 15 + 10); // درس + واژه (با مرور) + شنیدن + مرور لایتنر
  const have = g.minutes || 0;
  const level = !have ? 'ask' : have >= need ? 'ok' : have >= need * 0.75 ? 'tight' : 'hard';
  const daysFor = m => Math.ceil((unitsLeft * 270 + wsWords * 1.6) / Math.max(10, m - 25) * 7 / 6);
  return { unitsLeft, wsWords, study, wpd, upw, need, have, level, daysFor, wsUnits: wsTarget.length };
}
async function goalParse(txt) {
  const g = parseGoalLocal(txt);
  if (hasAI() || firstKeyed()) try { const r = await ai({ max: 600, temp: 0.1, system: 'Extract a study goal. Today is ' + isoDay() + ' (Jalali ' + jLabel(isoDay(), true) + ').', messages: [{ role: 'user', content: `Learner goal (Persian): "${txt}". JSON {"target":"l1 (beginner/elementary) or l3 (up to intermediate)","endDate":"YYYY-MM-DD Gregorian or empty","minutes":minutes per day or 0,"reminder":"HH:MM or empty","topics":["topic names the learner wants to master, written in PERSIAN (Farsi script), e.g. ترید، پوشاک، خرید"]}` }] });
    if (r) { if (/^l[13]$/.test(r.target)) g.target = r.target; if (r.endDate && /^\d{4}-\d\d-\d\d$/.test(r.endDate)) { const d = Math.round((parseDay(r.endDate) - parseDay(isoDay())) / DAY) + 1; if (d > 6) g.days = d; } if (r.minutes > 9) g.minutes = r.minutes; if (/^\d\d:\d\d$/.test(r.reminder || '')) g.reminder = r.reminder; if (Array.isArray(r.topics) && r.topics.length) g.topics = r.topics.slice(0, 12); } } catch { }
  g.days = g.days > 6 ? g.days : (g.target === 'l1' ? 90 : 180); return g;
}
function goalReview(g) {
  const M = goalMath(g); const end = addDays(isoDay(), g.days - 1);
  const verdict = { ok: ['ok', '✅ شدنی است', `با ${faNum(M.have)} دقیقه در روز به هدفت می‌رسی؛ حتی کمی وقت اضافه برای مرور داری.`],
    tight: ['mark', '⚠️ شدنی ولی فشرده', `برای این هدف حدود ${faNum(M.need)} دقیقه در روز لازم است و تو ${faNum(M.have)} دقیقه گفتی. یا روزی ${faNum(M.need - M.have)} دقیقه بیشتر بخوان، یا تاریخ را تا ${jLabel(addDays(isoDay(), M.daysFor(M.have) - 1), true)} عقب ببر.`],
    hard: ['bad', '❌ با این وقت شدنی نیست', `این هدف روزی حدود ${faNum(M.need)} دقیقه می‌خواهد. با ${faNum(M.have)} دقیقه در روز، تاریخ واقع‌بینانه ${jLabel(addDays(isoDay(), M.daysFor(M.have) - 1), true)} است. می‌توانی وقت روزانه را بیشتر کنی یا تاریخ را عقب ببری.`],
    ask: ['acc', '❓ روزی چقدر وقت داری؟', `برای رسیدن به این هدف تا ${jLabel(end, true)} حدود ${faNum(M.need)} دقیقه در روز لازم است. بگو روزی چقدر می‌توانی وقت بگذاری تا برنامه را دقیق بچینم.`] }[M.level];
  const mins = M.have || M.need; const split = [['📖 درس کتاب (مکالمه، گرامر، تمرین)', Math.round(M.unitsLeft * 270 / M.study)], ['🗂️ واژه‌های تازه + فلش‌کارت', Math.round(M.wpd * 1.6)], ['🎧 شنیدن (رادیو، خبر ساده)', 15], ['🗃️ مرور لایتنر', 10]];
  const sum = split.reduce((a, x) => a + x[1], 0); split.forEach(x => x[1] = Math.max(5, Math.round(x[1] / sum * mins)));
  $('#gmsg').innerHTML = `<div class="card stack" style="box-shadow:0 0 0 2px var(--accent)">
    <b style="font-size:17px">🧭 بررسی هدفت</b>
    <div class="grid2 small"><span>هدف: <b>${g.target === 'l1' ? 'پایان مقدماتی و سطح ۱' : 'تا پایان سطح متوسط'}</b></span><span>تا: <b>${jLabel(end, true)}</b> (${faNum(g.days)} روز)</span>
      <span>درس‌های باقی‌مانده: <b>${faNum(M.unitsLeft)}</b></span><span>واژه‌ها: <b>${faNum(M.wsWords)}</b> در ${faNum(M.wsUnits + g.topics.length)} موضوع</span>
      <span>یعنی روزی <b>${faNum(M.wpd)}</b> واژهٔ تازه</span><span>و هفته‌ای <b>${faNum(M.upw.toFixed(1))}</b> درس</span></div>
    ${g.topics.length ? `<div class="small">موضوع‌های تو: ${g.topics.map(t => `<span class="pill acc">${esc(t)}</span>`).join(' ')} — هر کدام فعل‌ها و واژه‌هایش جدا در برنامه می‌آید.</div>` : ''}
    <div class="notice ${verdict[0] === 'bad' ? '' : 'soft'} small"><b>${verdict[1]}</b><div>${verdict[2]}</div></div>
    <label class="f">روزی چند دقیقه وقت داری؟</label>
    <div class="row" style="gap:6px" id="gmins">${[30, 45, 60, 90, 120, 180].map(m => `<button class="btn sm${mins === m ? '' : ' ghost'}" data-m="${m}">${faNum(m)}</button>`).join('')}<input class="in" id="gm2" type="number" min="10" max="300" style="width:90px" value="${mins}"></div>
    <div class="grid2"><label class="f">ساعت یادآور<input id="grm" class="in" type="time" value="${g.reminder || '20:00'}"></label><label class="f">تاریخ هدف (روز)<input id="gdy" class="in" type="number" min="14" max="730" value="${g.days}"></label></div>
    <div class="stack" style="gap:4px"><b class="small">یک روز نمونه از برنامه‌ات (${faNum(mins)} دقیقه):</b>${split.map(([t, m]) => `<div class="row small" style="flex-wrap:nowrap"><span class="grow">${t}</span><b>${faNum(m)} دقیقه</b></div>`).join('')}
      <span class="tiny muted">جمعه‌ها روز مرور است (فلش‌کارت‌ها، داستان با واژه‌های ضعیف، گپ آزاد). اگر عقب بیفتی، برنامهٔ جبرانی همان تاریخ هدف را نگه می‌دارد.</span></div>
    <div class="row"><button class="btn" id="gok">✅ تأیید و گذاشتن در تقویم</button><button class="btn ghost" id="gno">ویرایش هدف</button></div></div>`;
  const re = () => { g.minutes = clamp(+$('#gm2').value || 60, 10, 300); g.days = clamp(+$('#gdy').value || g.days, 14, 730); g.reminder = $('#grm').value; goalReview(g); };
  $('#gmins').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; $('#gm2').value = b.dataset.m; re(); };
  $('#gm2').onchange = re; $('#gdy').onchange = re;
  $('#gno').onclick = () => { $('#gmsg').innerHTML = ''; $('#goal').focus(); };
  $('#gok').onclick = () => { g.minutes = clamp(+$('#gm2').value || mins, 10, 300); g.reminder = $('#grm').value; const P = goalBuild(g); U.plan = P; saveU(); addXP(10); toast(`برنامه در تقویم گذاشته شد: روزی ${faNum(P.minutes)} دقیقه تا ${jLabel(addDays(P.start, P.dayCount - 1), true)}`, 6000); routes.plan(); };
  $('#gmsg').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
routes.plan = (mOffset = '0') => {
  setTop('تقویم و برنامه‌ریزی'); const v = view(); const P = U.plan;
  if (!P) {
    v.innerHTML = `<div class="stack">${goalBox()}<div class="card stack"><div class="big-ic">🗓️</div><b>یا برنامه را دستی بساز</b><span class="small muted">برنامه بر اساس سطح فعلی، وقت روزانه و هدفت روی تقویم شمسی چیده می‌شود. هر روز دقیقاً می‌دانی چه کار کنی، و اگر عقب بیفتی برنامه خودش را به‌روز می‌کند.</span>
    <label class="f">هدف<select id="tg" class="in"><option value="l1">پایان مقدماتی و سطح ۱ (۲۰ درس) + واژگان موضوعی پایه</option><option value="l3">پایان سطح ۳ — متوسط (۳۸ درس) + همهٔ واژگان موضوعی</option></select></label>
    <div class="grid2"><label class="f">مدت (روز)<input id="dy" class="in" type="number" min="30" max="365" value="120"></label><label class="f">وقت روزانه (دقیقه)<input id="mn" class="in" type="number" min="15" max="240" value="60"></label></div>
    <div class="grid2"><label class="f">ساعت یادآور<input id="rm" class="in" type="time" value="20:00"></label><label class="f">روز مرور هفتگی<select id="rv" class="in">${['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map((d, i) => `<option value="${i}"${i === 6 ? ' selected' : ''}>${d}</option>`).join('')}</select></label></div>
    <div class="notice soft small" id="est"></div><button class="btn" id="mk">ساخت برنامه</button></div></div>`;
    const est = () => { const n = $('#tg').value === 'l1' ? ALL_UNITS.filter(u => u.level === 'intro' || u.level === 'l1').length - currentUnit().idx : ALL_UNITS.length - currentUnit().idx; const d = +$('#dy').value * 6 / 7; const per = d / Math.max(1, n); $('#est').textContent = `${faNum(Math.max(0, n))} درس در ${faNum(+$('#dy').value)} روز ≈ هر درس ${faNum(per.toFixed(1))} روز مطالعه. ${per < 3 ? 'این برنامه خیلی فشرده است؛ روزی حداقل ۹۰ دقیقه لازم داری.' : per < 5 ? 'برنامهٔ جدی ولی شدنی؛ روزی یک ساعت کافی است.' : 'برنامهٔ راحت و پایدار.'} رسیدن به سطح متوسط (B1) در ۴ ماه با مطالعهٔ منظم روزانه شدنی است؛ صحبت کاملاً روان معمولاً تمرین مکالمهٔ بیشتری بعد از آن می‌خواهد.`; };
    ['tg', 'dy'].forEach(i => $('#' + i).oninput = est); est();
    bindGoal(); if (lsGet('zd:goalFirst', 0)) { lsSet('zd:goalFirst', 0); $('#goal').focus(); toast('هدفت را بنویس یا 🎤 را بزن و بگو؛ بقیه‌اش با ما.', 6000); }
    $('#mk').onclick = () => { U.plan = buildPlan({ days: +$('#dy').value, minutes: +$('#mn').value, target: $('#tg').value, reminder: $('#rm').value, review: +$('#rv').value }); saveU(); addXP(10); routes.plan(); };
    return;
  }
  // نمای ماه شمسی
  const off = +mOffset; let anchor = isoDay(); const jt = toJ(anchor);
  let first = addDays(anchor, -(jt.d - 1)); for (let i = 0; i < Math.abs(off); i++) { first = off > 0 ? addDays(first, 32 - toJ(addDays(first, 31)).d) : addDays(first, -1); first = addDays(first, -(toJ(first).d - 1)); }
  first = addDays(first, -(toJ(first).d - 1)); const jm = toJ(first); const cells = []; let d = first; while (toJ(d).m === jm.m) { cells.push(d); d = addDays(d, 1); }
  const status = day => { const p = P.days[day]; if (!p) return ''; if (day > isoDay()) return p.review ? 'rev' : ''; const L = U.log[day]; return L && L.min >= P.minutes * 0.5 ? 'done' : day < isoDay() ? 'miss' : ''; };
  const behind = Object.keys(P.days).filter(x => x < isoDay() && status(x) === 'miss').length;
  const planned = P.days[isoDay()]?.unit; const cu = currentUnit(); const planIdx = planned ? unitById(planned).idx : cu.idx; const gap = planIdx - cu.idx;
  v.innerHTML = `<div class="stack">
  ${P.goal ? `<div class="notice soft small">🎯 ${esc(cleanRepeats(P.goal))}${P.topics?.length ? `<div>موضوع‌ها: ${P.topics.map(esc).join('، ')}</div>` : ''}</div>` : ''}
  <div class="card stack"><div class="row"><b class="grow">هدف: ${P.target === 'l1' ? 'پایان سطح ۱' : 'پایان سطح متوسط'} تا ${jLabel(addDays(P.start, P.dayCount - 1), true)}</b><span class="pill">${faNum(P.minutes)} دقیقه در روز</span></div>
  <div class="small">${gap > 0 ? `<span class="pill bad">${faNum(gap)} درس عقب‌تر از برنامه</span>` : gap < 0 ? `<span class="pill ok">${faNum(-gap)} درس جلوتر از برنامه 👏</span>` : '<span class="pill ok">طبق برنامه</span>'} · روزهای ازدست‌رفته: ${faNum(behind)}</div>
  <div class="row"><button class="btn sm" id="upd">${gap > 0 ? 'برنامهٔ جبرانی (همان تاریخ هدف)' : 'به‌روزرسانی برنامه از امروز'}</button><button class="btn ghost sm" id="aiu">تنظیم با هوش مصنوعی</button><button class="btn ghost sm" id="ics">افزودن یادآورها به تقویم گوشی</button><button class="btn ghost sm" id="ntf">اعلان در برنامه</button><button class="btn line sm" id="rst">🎯 هدف / برنامهٔ تازه</button></div><div id="aim"></div></div>
  <div class="card stack"><div class="row"><button class="icon-btn" onclick="routes.plan(${off - 1})">${I.back}</button><b class="grow" style="text-align:center">${J_MONTHS[jm.m - 1]} ${faNum(jm.y)}</b><button class="icon-btn" style="transform:scaleX(-1)" onclick="routes.plan(${off + 1})">${I.back}</button></div>
  <div class="cal">${J_WEEK.map(w => `<span class="h">${w}</span>`).join('')}${Array(weekdayIdx(first)).fill('<span class="d empty"></span>').join('')}${cells.map(c => { const p = P.days[c]; const u = p?.unit && unitById(p.unit); return `<button class="d ${status(c)} ${c === isoDay() ? 'today' : ''}" data-d="${c}"><span class="num">${faNum(toJ(c).d)}</span><span class="e">${p ? (p.review ? '🔁' : u?.icon || '') : ''}</span></button>`; }).join('')}</div>
  <div class="row tiny muted"><span class="pill ok">انجام شد</span><span class="pill bad">جا ماند</span><span class="pill acc">روز مرور</span></div></div>
  <div id="dd"></div></div>`;
  const showDay = day => { const p = P.days[day]; $$('.cal .d').forEach(b => b.classList.toggle('sel', b.dataset.d === day)); $('#dd').innerHTML = p ? `<div class="card stack"><b>${jLabel(day, true)}${p.unit ? ' · ' + esc(unitById(p.unit).fa) : ' · روز مرور'}</b><ul class="list">${p.tasks.map(t => `<li>${day === isoDay() && taskDone(t) ? '✅ ' : ''}${esc(t.t)}${day === isoDay() && taskLink(t) ? ` <a href="${taskLink(t)}" class="small">برو ›</a>` : ''}</li>`).join('')}</ul>${U.log[day] ? `<span class="small muted">مطالعه: ${faNum(Math.round(U.log[day].min))} دقیقه · ${faNum(U.log[day].xp)} امتیاز</span>` : ''}${day === isoDay() && p.unit ? `<a class="btn sm" href="#unit/${cu.id}">شروع کار امروز</a>` : ''}</div>` : '<div class="card small muted">برای این روز برنامه‌ای نیست.</div>'; };
  $$('.cal .d[data-d]').forEach(b => b.onclick = () => showDay(b.dataset.d)); showDay(isoDay());
  $('#upd').onclick = () => { catchUpPlan(); toast('برنامهٔ جبرانی تا همان تاریخ هدف ساخته شد.'); routes.plan(); }; $('#upd_old') && ($('#upd_old').onclick = () => { const left = P.dayCount - Math.round((parseDay(isoDay()) - parseDay(P.start)) / DAY); U.plan = buildPlan({ ...P, start: isoDay(), days: Math.max(14, left) }); U.plan.dayCount = U.plan.days ? Object.keys(U.plan.days).length : left; saveU(); toast('برنامه از امروز و بر اساس پیشرفت واقعی‌ات دوباره چیده شد.'); routes.plan(); });
  $('#rst').onclick = () => { U.plan = null; saveU(); routes.plan(); };
  $('#aiu').onclick = async () => {
    if (needAI($('#aim'))) return; $('#aim').innerHTML = loading();
    try { const p = paceInfo(); const last14 = [...Array(14)].map((_, i) => addDays(isoDay(), -i)).map(d => `${d}:${Math.round(U.log[d]?.min || 0)}min`).join(', ');
      const r = await ai({ system: 'You are an expert language-learning coach. Be realistic, motivating and specific.', messages: [{ role: 'user', content: `${learnerContext()}\nPlan: target ${P.target === 'l1' ? 'finish Intro+Level1 (20 units)' : 'finish up to B1+ (38 units)'} by ${addDays(P.start, P.dayCount - 1)}, ${P.minutes} min/day. Behind by ${gap} units, missed days ${behind}. Last 14 days study: ${last14}. Exam scores: ${Object.entries(U.units).map(([k, x]) => k + ':' + (x.best?.exam || '-')).join(', ')}.\nAdjust the plan. JSON {"minutes":30-180,"days":remaining days to keep or extend (integer),"advice":"Persian, human, 4-6 sentences: praise or honest push, predicted date for fluent speaking at this pace, what to focus on","focus":["Persian short items"]}` }] });
      $('#aim').innerHTML = `<div class="notice soft small stack">${esc(r.advice)}${r.focus?.length ? `<ul class="list">${r.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}<button class="btn sm" id="apl">اعمال: ${faNum(r.minutes)} دقیقه در روز، ${faNum(r.days)} روز</button></div>`;
      say(r.advice, 'fa', gap > 0 ? 'encouraging' : 'proud');
      $('#apl').onclick = () => { U.plan = buildPlan({ ...P, start: isoDay(), days: clamp(+r.days || 90, 14, 365), minutes: clamp(+r.minutes || P.minutes, 15, 240) }); U.plan.dayCount = clamp(+r.days || 90, 14, 365); U.plan.goal = P.goal; U.plan.topics = P.topics; U.plan.firstStart = P.firstStart || P.start; U.plan.baseMin = U.plan.minutes; addTopicTasks(U.plan); saveU(); routes.plan(); };
    } catch (e) { $('#aim').innerHTML = ''; aiErr(e); }
  };
  $('#ics').onclick = () => downloadICS(P);
  $('#ntf').onclick = async () => { if (!('Notification' in window)) return toast('این مرورگر اعلان ندارد؛ از «افزودن به تقویم گوشی» استفاده کن.'); const p = await Notification.requestPermission(); toast(p === 'granted' ? `هر روز ساعت ${P.reminder} وقتی برنامه باز یا در پس‌زمینه است یادآوری می‌کنم. برای اطمینان، یادآورها را به تقویم گوشی هم اضافه کن.` : 'اجازهٔ اعلان داده نشد.'); };
};
function downloadICS(P) {
  const [hh, mm] = P.reminder.split(':'); const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ZabanDovom//FA', 'CALSCALE:GREGORIAN'];
  Object.entries(P.days).filter(([d]) => d >= isoDay()).forEach(([d, p]) => {
    const ds = d.replace(/-/g, ''); const u = p.unit && unitById(p.unit);
    const desc = p.tasks.map(t => '• ' + t.t).join('\\n');
    lines.push('BEGIN:VEVENT', `UID:${ds}-${G.active}@zabandovom`, `DTSTAMP:${ds}T000000`, `DTSTART:${ds}T${hh}${mm}00`, `DURATION:PT${P.minutes}M`, `SUMMARY:زبان رستا — ${u ? 'درس ' + u.fa : 'روز مرور'}`, `DESCRIPTION:${desc}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:وقت انگلیسی!', 'TRIGGER:-PT0M', 'END:VALARM', 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' })); a.download = 'zaban-dovom-plan.ics'; document.body.append(a); a.click(); a.remove();
  toast('فایل تقویم ساخته شد؛ بازش کن تا یادآورها به تقویم گوشی یا گوگل اضافه شوند.', 5000);
}
setInterval(() => { // یادآور درون‌برنامه‌ای
  if (!U?.plan || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date(); const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; const k = 'zd:notified:' + G.active;
  if (t >= U.plan.reminder && lsGet(k, '') !== isoDay() && (U.log[isoDay()]?.min || 0) < U.plan.minutes * 0.5) {
    lsSet(k, isoDay()); const body = (todayPlan()?.tasks || []).map(x => x.t).slice(0, 3).join('، ');
    navigator.serviceWorker?.ready.then(r => r.showNotification('وقت انگلیسی، ' + (me()?.name || ''), { body, icon: 'icon-192.png', tag: 'zd-daily' })).catch(() => new Notification('وقت انگلیسی', { body }));
  }
}, 60000);

/* ───────── ابزارها ───────── */
routes.tools = () => {
  setTop('ابزارها'); const T = [
    ['listen', '🎧', 'شنیدن روزانه: رادیو و خبر', 'رادیوی زندهٔ آمریکایی یا بریتانیایی، خبر واقعی امروز به زبان ساده و برنامهٔ شنیداری روزانه.'],
    ['leitner', '🗃️', 'جعبهٔ لایتنر', 'کارت‌های امروز، تازه و آموخته‌شده؛ دسته‌ها و افزودن کارت دستی.'],
    ['grammar', '📐', 'گرامر کامل', 'همهٔ زمان‌ها و مباحث از مقدماتی تا متوسط با توضیح فارسی، مثال صوتی و تمرین.'],
    ['feedback', '💡', 'انتقادات و پیشنهادات', 'ایده، درخواست یا ایرادی دیدی؟ با صدا یا متن به مدیر برنامه بگو.'],
    ['wtopics', '🗂️', 'واژه‌ها بر اساس موضوع', 'هر موضوعی بنویس (فرودگاه، ترید، پوشاک…)؛ همهٔ واژه‌ها با رسمی/عامیانه، کاربرد و مثال.'],
    ['verbs', '🔁', 'افعال کاربردی', 'فعل‌های پرکاربرد دسته‌بندی‌شده با سه شکل فعل، معنی، مثال و آزمون.'],
    ['story', '🎧', 'داستان صوتی هر درس', 'برای هر درس یک داستان کوتاه با واژه‌ها و سطح همان درس؛ صدای بومی آفلاین، متن، ترجمه و سؤال'],
    ['wb', '📘', 'کتاب تمرین', 'برای هر سطح و هر درس: گزینه، جای خالی، ترجمه، تبدیل، مرتب‌کردن و پیدا کردن غلط — درست سبز، غلط خط‌خورده با جواب درست و توضیح'],
    ['flash', '🃏', 'فلش‌کارت دوطرفه', 'فارسی⇄انگلیسی/عربی برای واژه، جمله، فعل و گرامر از همهٔ درس‌ها و موضوع‌ها؛ لایتنر جدا برای هر جهت، با صدا و آفلاین'],
    ['listen', '🎧', 'استودیوی شنیداری', 'رادیو، اخبار، داستان یا پادکست ساختگی دقیقاً در سطح و درس تو — با مدت دلخواه (۵ تا ۴۵ دقیقه) و سؤال درک مطلب؛ انگلیسی و عربی'],
    ['theater', '🎬', 'تئاتر داستان صوتی', 'داستان با سناریو، صحنه‌های تصویری، صداپیشه و موسیقی متن، با واژه‌های خودت.'],
    ['practice', '✍️', 'تمرین آفلاین و هوشمند', 'جای خالی، مرتب کردن، دیکته، ترجمه و جواب‌نویسی با تصحیح؛ و تمرین مشابه برای هر اشتباه.'],
    ['vision', '🔭', 'چشم‌انداز من', 'با همین سرعت کی به کجا می‌رسی؛ تاریخ‌ها روی تقویم شمسی.'],
    ['dict', '📕', 'دیکشنری کامل', 'انگلیسی↔فارسی با تلفظ آمریکایی و بریتانیایی، معانی، همنشین‌ها، اصطلاحات و اشتباه‌های رایج.'],
    ['howto', '🤔', '«چطور بگم؟»', 'جملهٔ فارسی بنویس؛ انگلیسی طبیعی در دو حالت رسمی و خودمانی بگیر.'],
    ['fix', '📝', 'اصلاح نوشته', 'متن انگلیسی‌ات با توضیح فارسی هر اشتباه اصلاح می‌شود.'],
    ['story', '📖', 'داستان با لغت‌های ضعیفم', 'داستانی کوتاه با همان واژه‌هایی که در فلش‌کارت یادت نمی‌ماند.'],
    ['mistakes', '🔍', 'تحلیل اشتباه‌هایم', 'الگوی اشتباه‌هایت را توضیح می‌دهد و تمرین تازه می‌دهد.'],
    ['photo', '📷', 'عکس بگیر، یاد بگیر', 'از هر چیزی دور و برت عکس بگیر؛ نامش را به انگلیسی یاد بگیر و به فلش‌کارت‌ها اضافه کن.'],
    ['shadow', '🎯', 'مربی تلفظ و لهجه', 'صدایت را ضبط کن؛ می‌گوید کدام صدا را اشتباه گفتی، چرا (تأثیر فارسی) و زبان و لب را چطور بگذاری.'],
    ['import', '📥', 'درس از کتاب خودم', 'لغت‌های هر درس کتابت را وارد کن یا با AI درس تازه بساز.'],
    ['role', '🎭', 'نقش‌آفرینی موقعیت‌های واقعی', 'موقعیت‌های واقعی زندگی روزمره.']
  ];
  view().innerHTML = `<div class="tools">${T.map(([k, ic, t, d]) => `<a class="tool" href="#${['role', 'dict', 'theater', 'vision', 'grammar', 'verbs', 'wtopics', 'feedback', 'leitner', 'listen', 'wb', 'story'].includes(k) ? k : k === 'practice' ? 'practice/' + currentUnit().id : 'tool/' + k}"><span class="ic">${ic}</span><b>${t}</b><span>${d}</span></a>`).join('')}</div>`;
};
routes.tool = k => (TOOLS[k] || routes.tools)();
const TOOLS = {
  howto() {
    setTop('چطور بگم؟', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><textarea id="q" class="in" placeholder="هر طور که در فارسی محاوره می‌گویی بنویس؛ مثلاً: آقا اینو یه سایز بزرگ‌ترش رو ندارین؟"></textarea><input id="sit" class="in" placeholder="کجا می‌خواهی بگویی؟ (اختیاری) مثلاً: موقع خرید لباس، به همکار، به صاحبخانه"><div class="row"><button class="btn grow" id="go">بگو چطور بگم</button><span id="mc"></span></div></div><div id="out"></div></div>`;
    $('#mc').append(micButton(t => $('#q').value = t, 'fa-IR'));
    $('#go').onclick = async () => {
      const q = $('#q').value.trim(); if (!q) return; if (needAI($('#out'))) return; $('#out').innerHTML = loading();
      try { const r = await ai({ system: 'You are a native English speaker and expert translator for Persian speakers. Give natural, idiomatic English (not literal).', messages: [{ role: 'user', content: `Persian (may be colloquial street Persian): "${q}"\nSituation: ${$('#sit').value.trim() || 'everyday real life'}.\nAccent/variety: ${G.settings.accent === 'UK' ? 'British' : 'American'}.\nGive what a native speaker would ACTUALLY say in that situation (not a literal translation). JSON {"formal":"","informal":"","alternatives":["",""],"notes":"Persian: why natives say it this way in this situation, key words/grammar, and what NOT to say (literal translation mistakes)"}` }] });
        $('#out').innerHTML = `<div class="stack">${[['رسمی', r.formal], ['خودمانی', r.informal], ...(r.alternatives || []).map(a => ['جایگزین', a])].map(([l, t]) => `<div class="card row"><span class="pill">${l}</span><b class="en grow">${esc(t)}</b><button class="icon-btn" data-t="${esc(t)}">${I.spk}</button></div>`).join('')}<div class="notice soft small">${esc(r.notes)}</div></div>`;
        $$('[data-t]', v).forEach(b => b.onclick = () => say(b.dataset.t, 'en', 'cheerful', b)); addXP(3); saveU();
      } catch (e) { $('#out').innerHTML = ''; aiErr(e); }
    };
  },
  fix() {
    setTop('اصلاح نوشته', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><textarea id="q" class="in" dir="ltr" placeholder="Write your English text here…"></textarea><button class="btn" id="go">اصلاح کن</button></div><div id="out"></div></div>`;
    $('#go').onclick = async () => {
      const q = $('#q').value.trim(); if (!q) return; if (needAI($('#out'))) return; $('#out').innerHTML = loading();
      try { const r = await ai({ system: 'You are an expert English writing tutor for Persian speakers.', messages: [{ role: 'user', content: `${learnerContext()}\nText:\n${q}\nCorrect it naturally. JSON {"corrected":"","score":0-100,"mistakes":[{"wrong":"","right":"","why":"Persian explanation"}],"overall":"Persian feedback, mention if a mistake repeats from their history","memory":""}` }] });
        logMistakes(r.mistakes, 'writing'); remember(r.memory); addXP(5); saveU();
        $('#out').innerHTML = `<div class="stack"><div class="card stack"><div class="row"><b class="grow">متن اصلاح‌شده</b><span class="pill acc">${faNum(r.score)} از ۱۰۰</span><button class="icon-btn" id="sp">${I.spk}</button></div><div class="en">${esc(r.corrected)}</div></div>${(r.mistakes || []).map(m => `<div class="fix" style="align-self:stretch;max-width:none"><s class="en">${esc(m.wrong)}</s> ← <b class="en">${esc(m.right)}</b><br>${esc(m.why)}</div>`).join('')}<div class="notice soft small">${esc(r.overall)}</div></div>`;
        $('#sp').onclick = e => say(r.corrected, 'en', 'calm', e.currentTarget);
      } catch (e) { $('#out').innerHTML = ''; aiErr(e); }
    };
  },
  async story() {
    setTop('داستان با لغت‌های ضعیفم', true); const v = view(); if (needAI(v)) return;
    const weak = weakWords(10); const cur = currentUnit(); const prev = ALL_UNITS.filter(x => x.idx < cur.idx).flatMap(x => pick(unitWords(x), 1)).slice(-6);
    const words = [...weak.map(x => x.w.w), ...pick(unitWords(cur), weak.length ? 4 : 8).map(w => w.w), ...prev.map(w => w.w)];
    v.innerHTML = loading('در حال نوشتن داستان با: ' + words.slice(0, 8).join('، ') + '…');
    try { const r = await ai({ system: 'You write short, funny, memorable graded-reader stories for adult Persian-speaking learners.', messages: [{ role: 'user', content: `${learnerContext(cur)}\nWrite a vivid 150-220 word story at the learner's level using ALL these words (bold them with **): ${words.join(', ')}. Make it personal using their memory profile if possible. JSON {"title":"","story":"","translation":"Persian translation","questions":[{"q":"comprehension question in English","a":"answer"}],"used":[""]}` }] });
      addXP(10); saveU();
      const html = esc(r.story).replace(/\*\*(.+?)\*\*/g, '<mark style="background:var(--mark);color:var(--mark-ink);border-radius:4px;padding:0 3px">$1</mark>');
      v.innerHTML = `<div class="stack"><div class="card stack"><div class="row"><b class="grow en">${esc(r.title)}</b><button class="icon-btn" id="sp">${I.spk}</button></div><div class="en" style="line-height:1.9;font-size:16px">${html}</div></div><details class="card"><summary>ترجمهٔ فارسی</summary><div style="margin-top:8px">${esc(r.translation)}</div></details>${(r.questions || []).length ? `<div class="card stack"><b>سؤال‌های درک مطلب</b>${r.questions.map(q => `<details><summary class="en">${esc(q.q)}</summary><div class="en muted">${esc(q.a)}</div></details>`).join('')}</div>` : ''}<button class="btn ghost" onclick="TOOLS.story()">داستان تازه</button></div>`;
      $('#sp').onclick = e => say(r.story.replace(/\*\*/g, ''), 'en', 'cheerful', e.currentTarget);
    } catch (e) { v.innerHTML = ''; aiErr(e); }
  },
  async mistakes() {
    setTop('تحلیل اشتباه‌هایم', true); const v = view();
    if (U.mistakes.length < 3) { v.innerHTML = `<div class="card">هنوز اشتباه کافی ثبت نشده. چند کوییز، گفتگو و اصلاح نوشته انجام بده تا تحلیل دقیق شود.</div>`; return; }
    if (needAI(v)) return; v.innerHTML = loading('در حال پیدا کردن الگوی اشتباه‌ها…');
    try { const r = await ai({ system: 'You are an expert error-analysis English teacher for Persian speakers (L1 interference aware).', messages: [{ role: 'user', content: `${learnerContext()}\nAll logged mistakes:\n${U.mistakes.slice(-80).map(m => `${m.wrong} → ${m.right} (${m.src})`).join('\n')}\nFind patterns, explain why Persian speakers make them, and give fresh exercises. JSON {"summary":"Persian, human","patterns":[{"title":"Persian","explain":"Persian","examples":[{"wrong":"","right":""}]}],"exercises":[{"q":"exercise in English (fill-in or rewrite)","answer":"","hint":"Persian"}],"memory":"main recurring difficulty"}` }] });
      remember(r.memory); saveU();
      v.innerHTML = `<div class="stack"><div class="notice soft">${esc(r.summary)}</div>${(r.patterns || []).map(p => `<div class="card stack"><b>${esc(p.title)}</b><div class="small">${esc(p.explain)}</div>${(p.examples || []).map(x => `<div class="small"><s class="en">${esc(x.wrong)}</s> ← <b class="en">${esc(x.right)}</b></div>`).join('')}</div>`).join('')}<div class="sec">تمرین تازه</div>${(r.exercises || []).map((x, i) => `<div class="card stack"><div class="en">${faNum(i + 1)}. ${esc(x.q)}</div><input class="in" dir="ltr" data-ans="${esc(x.answer)}" placeholder="جواب"><div class="small muted">${esc(x.hint)}</div><div class="small" data-r></div></div>`).join('')}<button class="btn" id="chk">بررسی جواب‌ها</button></div>`;
      say(r.summary, 'fa', 'empathetic');
      $('#chk').onclick = () => { let ok = 0; $$('[data-ans]', v).forEach(inp => { const s = similarity(inp.value, inp.dataset.ans); if (s >= 85) ok++; inp.parentElement.querySelector('[data-r]').innerHTML = s >= 85 ? '✅ درست' : `❌ جواب: <span class="en">${esc(inp.dataset.ans)}</span>`; }); addXP(ok * 3); saveU(); toast(`${faNum(ok)} جواب درست`); };
    } catch (e) { v.innerHTML = ''; aiErr(e); }
  },
  photo() {
    setTop('عکس بگیر، یاد بگیر', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><span class="small muted">از آشپزخانه، خیابان، سوپرمارکت یا هر جای دیگر عکس بگیر.</span><label class="btn">📷 گرفتن یا انتخاب عکس<input type="file" accept="image/*" capture="environment" hidden id="f"></label></div><div id="out"></div></div>`;
    $('#f').onchange = async e => {
      const f = e.target.files[0]; if (!f) return; if (needAI($('#out'))) return;
      const img = new Image(); img.src = URL.createObjectURL(f); await img.decode(); const c = document.createElement('canvas'); const s = Math.min(1, 768 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const url = c.toDataURL('image/jpeg', 0.8); $('#out').innerHTML = `<img src="${url}" style="border-radius:14px">` + loading('در حال دیدن عکس…');
      try { const r = await ai({ images: [{ mime: 'image/jpeg', b64: url.split(',')[1] }], system: 'You are an English vocabulary teacher for Persian speakers.', messages: [{ role: 'user', content: `Identify 6-10 useful, clearly visible things/actions in this photo for an English learner at CEFR level ${currentUnit().cefr || 'A2'}. JSON {"scene":"one Persian sentence","items":[{"w":"","ipa":"","fa":"","img":"emoji","pos":"n|v|adj|phr","ex":"example sentence about this photo"}]}` }] });
        const cu = U.custom.find(x => x.id === 'myphotos') || (U.custom.push({ id: 'myphotos', en: 'My Photos', fa: 'واژه‌های عکس‌هایم', icon: '📷', hue: 45, gram: '—', talk: 'دربارهٔ چیزهایی که در عکس‌ها دیدی حرف بزن.', words: [] }), U.custom[U.custom.length - 1]);
        $('#out').innerHTML = `<img src="${url}" style="border-radius:14px"><div class="notice soft small" style="margin-top:8px">${esc(r.scene)}</div><div class="words" style="margin-top:8px">${r.items.map(w => `<div class="word"><div class="pic">${esc(w.img)}</div><div class="t"><b>${esc(w.w)}</b><span class="ipa">/${esc(w.ipa)}/</span><span>${esc(w.fa)}</span><span class="en small muted">${esc(w.ex)}</span></div><button class="icon-btn" data-t="${esc(w.w)}">${I.spk}</button></div>`).join('')}</div><button class="btn wide" id="add" style="margin-top:8px">افزودن همه به فلش‌کارت‌ها</button>`;
        $$('[data-t]').forEach(b => b.onclick = () => say(b.dataset.t, 'en', 'calm', b));
        $('#add').onclick = () => { r.items.forEach(w => { if (!cu.words.some(x => x.w === w.w)) cu.words.push(w); U.srs['myphotos:' + w.w] = U.srs['myphotos:' + w.w] || { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; }); addXP(10); saveU(); toast('به درس «واژه‌های عکس‌هایم» اضافه شد.'); };
      } catch (e2) { aiErr(e2); }
    };
  },
  shadow() {
    setTop('تلفظ‌سنج جمله', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><textarea id="q" class="in" dir="ltr">Could you turn on the air conditioner, please?</textarea><div class="row"><button class="btn" id="pl">${I.spk} بشنو</button><button class="btn ghost" id="sl">🐢 آهسته</button><span id="mc"></span></div><div id="r" class="small"></div></div><div id="pcs"></div></div>`;
    pronCoach($('#pcs'), $('#q').value); $('#q').onchange = () => pronCoach($('#pcs'), $('#q').value);
    $('#pcs').insertAdjacentHTML('beforebegin', '<button class="btn ghost" id="nat2">🗣 نیتیوها این جمله را چطور می‌گویند؟</button><div id="nv2"></div>'); $('#nat2').onclick = () => nativeSay($('#nv2'), $('#q').value);
    $('#pl').onclick = () => say($('#q').value, 'en', 'calm'); $('#sl').onclick = () => browserSay($('#q').value, 'en', 0.65);
    $('#mc').append(micButton(t => { const s = similarity(t, $('#q').value); $('#r').innerHTML = `شنیدم: <b class="en">${esc(t)}</b><br>شباهت: <b>${faNum(s)}٪</b> ${s >= 90 ? '🌟 عالی' : s >= 70 ? '👍 خوب' : '🔁 دوباره'}`; addXP(s >= 70 ? 3 : 1); saveU(); }));
  },
  import() {
    setTop('افزودن درس', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><b>درس از کتاب خودم</b><span class="small muted">لغت‌های یک درس از کتابت را بنویس؛ هر خط یک لغت. می‌توانی معنی را هم با خط تیره بنویسی (مثلاً <span class="kbd">neighbor - همسایه</span>). اگر هوش مصنوعی فعال باشد، تلفظ، معنی، نوع کلمه و جملهٔ نمونه را خودش کامل می‌کند.</span>
    <div class="grid2"><label class="f">نام درس (فارسی)<input id="fa" class="in" placeholder="مثلاً درس ۳ کتاب"></label><label class="f">نام انگلیسی<input id="en" class="in" dir="ltr" placeholder="Unit 3"></label></div>
    <textarea id="ws" class="in" dir="ltr" placeholder="neighbor - همسایه&#10;borrow&#10;get along with"></textarea><button class="btn" id="imp">ساخت درس</button></div>
    <div class="card stack"><b>ساخت درس تازه با هوش مصنوعی</b><span class="small muted">هر موضوعی که لازم داری؛ مثلاً «تعمیر ماشین»، «گمرک و ترخیص کالا»، «مهمانی تولد».</span><input id="tp" class="in" placeholder="موضوع درس"><button class="btn ghost" id="gen">بساز</button></div></div>`;
    const save = (fa, en, words, gram, talk, icon) => { const id = 'c' + uid(); U.custom.push({ id, fa, en, icon: icon || '📘', hue: Math.floor(Math.random() * 360), gram: gram || '—', talk: talk || 'دربارهٔ موضوع این درس صحبت کن.', words }); saveU(); go('unit/' + id); };
    $('#imp').onclick = async () => {
      const lines = $('#ws').value.split('\n').map(s => s.trim()).filter(Boolean); if (!lines.length) return toast('لغتی وارد نشده.');
      const fa = $('#fa').value.trim() || 'درس من', en = $('#en').value.trim() || 'My Unit';
      if (!hasAI() && !firstKeyed()) return save(fa, en, lines.map(l => { const [w, m] = l.split(/\s*[-–—:=]\s*/); return { w, fa: m || '', ipa: '', img: '📘', pos: '', ex: '' }; }));
      const bg = sheet(loading('در حال کامل کردن لغت‌ها…'));
      try { const r = await ai({ heavy: true, max: 12000, temp: 0.3, system: 'You are an accurate ESL lexicographer for Persian speakers.', messages: [{ role: 'user', content: `Complete each item (keep the learner's words exactly; use given Persian meanings if provided):\n${lines.join('\n')}\nJSON {"grammar":"likely grammar focus in Persian or —","talk":"speaking goal in Persian","icon":"emoji","words":[{"w":"","ipa":"","fa":"","img":"emoji","pos":"n|v|adj|adv|prep|phr","ex":""}]}` }] }); bg.remove(); save(fa, en, r.words, r.grammar, r.talk, r.icon); }
      catch (e) { bg.remove(); aiErr(e); }
    };
    $('#gen').onclick = async () => {
      const t = $('#tp').value.trim(); if (!t) return; if (needAI(v)) return; const bg = sheet(loading('در حال ساخت درس…'));
      try { const r = await ai({ heavy: true, max: 12000, temp: 0.4, system: 'You are an expert ESL syllabus designer for Persian speakers. Accuracy is critical.', messages: [{ role: 'user', content: `Create a complete unit for the topic "${t}" for a learner at CEFR ${currentUnit().cefr || 'A2'} level: 25-35 most useful words, verbs and phrases. JSON {"en":"","fa":"","icon":"emoji","grammar":"suitable grammar focus in Persian","talk":"speaking goal in Persian","words":[{"w":"","ipa":"","fa":"","img":"emoji","pos":"n|v|adj|adv|prep|phr","ex":""}]}` }] }); bg.remove(); save(r.fa || t, r.en || t, r.words, r.grammar, r.talk, r.icon); }
      catch (e) { bg.remove(); aiErr(e); }
    };
  }
};

/* ───────── من: آمار، حافظه، اشتباه‌ها ───────── */
routes.me = () => {
  setTop('من'); const p = paceInfo(); const last = [...Array(14)].map((_, i) => addDays(isoDay(), -13 + i)); const mx = Math.max(10, ...last.map(d => U.log[d]?.min || 0));
  view().innerHTML = `<div class="stack">
  <div class="card stack"><div class="row"><span class="avatar" style="width:48px;height:48px;font-size:26px">${avHTML(me())}</span><div class="grow"><b style="font-size:18px">${esc(me().name)}</b><div class="small muted">${rankOf(U.xp)} · ${faNum(U.xp)} امتیاز · سطح ورودی: ${esc(U.placement?.level || '—')}</div></div><a class="btn ghost sm" href="#progress">📈 پیشرفت</a><a class="btn ghost sm" href="#guide">امکانات</a><a class="btn ghost sm" href="#users">کاربران</a></div>
  <div class="grid2 small"><span>درس‌های قبول: <b>${faNum(p.mastered)}</b></span><span>واژهٔ تثبیت‌شده: <b>${faNum(learnedCount())}</b></span><span>کل مطالعه: <b>${faNum(p.minutes)}</b> دقیقه</span><span>روزهای پیاپی: <b>${faNum(streakOf(U))}</b></span></div>
  <div><div class="small muted">دقیقه‌های مطالعه در ۱۴ روز اخیر</div><div style="display:flex;align-items:flex-end;gap:4px;height:70px">${last.map(d => `<div title="${jLabel(d)}: ${Math.round(U.log[d]?.min || 0)}" style="flex:1;background:${d === isoDay() ? 'var(--mark)' : 'var(--accent)'};opacity:${U.log[d]?.min ? 1 : .2};height:${Math.max(4, (U.log[d]?.min || 0) / mx * 100)}%;border-radius:4px 4px 0 0"></div>`).join('')}</div></div>
  <button class="btn ghost" id="coach">نظر معلم دربارهٔ پیشرفتم</button><div id="co"></div></div>
  ${(() => { const b = aiBudget(); return `<div class="card stack" style="gap:8px"><div class="row" style="justify-content:space-between"><b>اعتبار هوش مصنوعی</b>${b.unlimited ? '<span class="pill ok">مدیر · نامحدود</span>' : `<span class="pill acc">${faNum(Math.max(0, Math.round(b.left / (b.daily + b.bank || 1) * 100)))}٪ مانده</span>`}</div>
  ${b.unlimited ? `<span class="small muted">مصرف امروز حدود ${b.spent.toFixed(3)} دلار</span>` : `<div class="bar"><i style="width:${Math.min(100, Math.round(b.spent / (b.daily + b.bank || 1) * 100))}%"></i></div><span class="small muted">سهم روزانه ${b.daily} دلار · مصرف امروز ${b.spent.toFixed(3)} دلار · ذخیره از روزهای قبل ${b.bank.toFixed(2)} دلار</span><span class="tiny muted">هر روز که کمتر استفاده کنی، باقی‌مانده برای روزهای بعد ذخیره می‌شود (تا سقف ۳۰ روز).</span>`}</div>`; })()}
  ${isAdminHere() ? '<a class="card row" href="#admin" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span style="font-size:26px">🛠</span><div class="grow"><b>پنل مدیریت</b><div class="small muted">کاربران، مصرف هوش مصنوعی، زمان مطالعه، پیام به کاربران و مدیریت انجمن</div></div><span>›</span></a>' : ''}
  <div id="online-me"></div>
  <div class="card stack"><b>نشان‌ها</b><div class="row">${BADGES.map(b => `<span class="pill ${U.badges.includes(b.id) ? 'mark' : ''}" style="${U.badges.includes(b.id) ? '' : 'opacity:.5'}">${b.ic} ${b.fa}</span>`).join('')}</div></div>
  <div class="card stack"><b>حافظهٔ معلم دربارهٔ من</b><span class="small muted">هوش مصنوعی این‌ها را از گفتگوها یاد گرفته و در همهٔ درس‌ها به کار می‌برد.</span>${U.mem.length ? U.mem.slice().reverse().map((m, i) => `<div class="row small"><span class="grow">• ${esc(m.t)}</span><button class="btn line sm" data-dm="${U.mem.length - 1 - i}">حذف</button></div>`).join('') : '<span class="small muted">هنوز چیزی ثبت نشده.</span>'}
  <div class="row"><input id="nm" class="in grow" placeholder="چیزی که معلم باید بداند (مثلاً: هدفم مصاحبهٔ کاری است)"><button class="btn sm" id="am">افزودن</button></div></div>
  <div class="card stack"><b>آخرین اشتباه‌ها</b>${U.mistakes.slice(-12).reverse().map(m => `<div class="small"><s class="en">${esc(m.wrong)}</s> ← <b class="en">${esc(m.right)}</b> <span class="muted">${esc(m.why)}</span></div>`).join('') || '<span class="small muted">فعلاً اشتباهی ثبت نشده.</span>'}<a class="btn ghost sm" href="#tool/mistakes">تحلیل و تمرین</a></div>
  <a class="btn ghost wide" href="#feedback">💡 انتقادات و پیشنهادات (با صدا یا متن)</a>
  <a class="btn ghost wide" href="#about">ℹ️ دربارهٔ ما · ایدهٔ استارتاپ داری؟</a>
  <div class="card stack"><b>پشتیبان و انتقال</b><span class="small muted">برای بردن پیشرفت به گوشی یا کامپیوتر دیگر: پشتیبان بگیر و در دستگاه دیگر بازیابی کن.</span><div class="row"><button class="btn ghost sm" id="bk">گرفتن پشتیبان</button><label class="btn ghost sm">بازیابی<input type="file" hidden accept=".json" id="rs"></label><a class="btn ghost sm" href="#settings">تنظیمات</a></div></div></div>`;
  window.meOnline && meOnline();
  $$('[data-dm]').forEach(b => b.onclick = () => { U.mem.splice(+b.dataset.dm, 1); saveU(); routes.me(); });
  $('#am').onclick = () => { const t = $('#nm').value.trim(); if (t) { remember(t); routes.me(); } };
  $('#coach').onclick = async () => { if (needAI($('#co'))) return; $('#co').innerHTML = loading(); try { const r = await ai({ system: TEACHER_STYLE(), messages: [{ role: 'user', content: `${learnerContext()}\nGive me an honest, human progress review in Persian (5-7 sentences): what I mastered, what I keep forgetting, my learning speed, a realistic predicted date (Persian calendar wording is fine) for fluent everyday conversation at this pace, and one concrete challenge for this week. JSON {"say":"","emotion":"proud|encouraging|empathetic|excited"}` }] }); $('#co').innerHTML = `<div class="notice soft">${esc(r.say)}</div>`; say(r.say, 'fa', r.emotion); } catch (e) { $('#co').innerHTML = ''; aiErr(e); } };
  $('#bk').onclick = () => { const data = { v: 1, users: G.users, settings: { ...G.settings, prov: Object.fromEntries(Object.entries(G.settings.prov).map(([k, x]) => [k, { ...x, key: '' }])) }, extra: G.extra, cache: G.cache, img: G.img, u: Object.fromEntries(G.users.map(u => [u.id, userData(u.id)])) }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })); a.download = `zaban-dovom-backup-${isoDay()}.json`; document.body.append(a); a.click(); a.remove(); toast('پشتیبان ساخته شد (کلیدهای API داخلش نیست).'); };
  $('#rs').onchange = async e => { try { const d = JSON.parse(await e.target.files[0].text()); const mine = Object.entries(d.u || {}).find(([id]) => id === G.active); if (mine && (mine[1].xp || 0) < (U.xp || 0) && !confirm(`این پشتیبان ${faNum(mine[1].xp || 0)} امتیاز دارد ولی الان ${faNum(U.xp || 0)} امتیاز داری. پیشرفت فعلی‌ات با نسخهٔ قدیمی‌تر جایگزین شود؟`)) { e.target.value = ''; return; } for (const [id, ud] of Object.entries(d.u || {})) lsSet('zd:u:' + id, ud); const ids = new Set(G.users.map(u => u.id)); (d.users || []).forEach(u => { if (!ids.has(u.id)) G.users.push(u); }); Object.assign(G.extra, d.extra || {}); Object.assign(G.cache, d.cache || {}); Object.assign(G.img, d.img || {}); ['users', 'extra', 'cache', 'img'].forEach(saveG); loadUser(G.active || G.users[0].id); toast('بازیابی شد.'); go('home'); } catch { toast('فایل پشتیبان معتبر نیست.'); } };
};

/* ───────── راهنمای امکانات ───────── */
routes.guide = () => {
  const first = !lsGet('zd:tourDone:' + G.active, false);
  const F = [
    ['👋', `سلام ${me().name}! خوش اومدی`, 'در چند صفحهٔ کوتاه همهٔ امکانات «آموزش زبان رستا» را نشانت می‌دهم. آخرش هدفت را (حتی با صدا) می‌گویی و برنامه‌ات چیده می‌شود.', '#home'],
    ['🎯', 'هدفت را بگو؛ برنامه با ما', 'فقط بگو تا کی می‌خواهی به چه سطحی برسی، در چه موضوع‌هایی (مثلاً ترید، خرید، سفر) و روزی چقدر وقت داری؛ با تایپ یا با صدا. برنامه بررسی می‌کند شدنی است یا نه، وقت روزانه را حساب می‌کند و کار هر روز را روی تقویم می‌چیند. تو فقط هر روز طبق برنامه جلو برو.', '#plan'],
    ['📈', 'نمودار پیشرفت', 'هر روز می‌بینی چه چیزهایی یاد گرفته‌ای، چقدر تا سطح بعد مانده، کجای برنامه هستی و اگر عقب افتادی، برنامه خودش جبرانی می‌چیند و خبرت می‌کند.', '#progress'],
    ['📖', 'درس‌ها مثل کتاب (همه باز)', 'هیچ درسی قفل نیست. ۴۳ درس انگلیسی از مقدماتی تا متوسط و ۳۹ مبحث گرامر، هر درس با بخش‌های جدا: مکالمه، متن، گرامر، واژه‌ها، همهٔ عبارت‌ها از رسمی تا عامیانه، تمرین و آزمون. ترجمه، تلفظ نیتیو به خط فارسی و صدای آمریکایی یا بریتانیایی، همه آفلاین.', '#path'],
    ['🌐', 'کدام زبان؟', 'در صفحهٔ اول زبانت را انتخاب می‌کنی: انگلیسی (آمریکایی/بریتانیایی)، عربی (عمانی/خلیجی، فصحی، مصری، شامی، عراقی)، آلمانی، ترکی استانبولی یا چینی. همهٔ امکانات — معلم زنده، دوره، کتاب‌های صوتی، شنیداری، دیکشنری — با همان زبان کار می‌کنند. دورهٔ عربی ۴۰ درس از پایه تا پیشرفته (A0 تا C1) است و همه‌اش آفلاین با صدای عمانی.', '#home'],
    ['📞', 'کلاس زنده با معلم', 'مثل تماس تلفنی با یک معلم خصوصی که فارسی توضیح می‌دهد: اول کل درس را کامل و با مثال درس می‌دهد، بعد تمرین و پرسش و پاسخ. سه راه: «بدون فیلترشکن» (داخل ایران)، «زنده» (هم‌زمان و بی‌مکث، با فیلترشکن یا خارج از ایران) و ChatGPT. غلط‌های نوشتاری‌ات را با خط قرمز تصحیح می‌کند.', '#live/lesson'],
    ['🧭', 'طراحی کلاس به سلیقهٔ خودت', 'برای هر بخش کلاس (واژه‌ها، افعال، جمله‌ها، گرامر، مکالمه، تمرین، کوییز) زمان تعیین می‌کنی و می‌گویی تعاملی باشد یا فقط گوش بدهی. قالب‌های آماده هم هست: ۲۰ دقیقه، ۶۰ دقیقه، ۹۰ دقیقهٔ عمیق، فقط مکالمه.', '#live/lesson'],
    ['✨', 'هر چه بخواهی یاد بگیری', 'توی کلاس زنده بنویس یا بگو «مصاحبهٔ کاری»، «کلمات ترید»، «فرق since و for»… برنامه یک درس کامل طراحی می‌کند (همهٔ واژه‌ها، افعال، جمله‌ها، اصطلاحات محاوره‌ای، گرامر، مکالمه) و معلم همان را درس می‌دهد. از صفحهٔ واژه‌ها و افعال هم دکمهٔ «معلم زنده یادم بده» هست.', '#live/lesson'],
    ['👥', 'کلاس گروهی ۵ نفره', 'یک نفر «ساختن کلاس» را می‌زند و کد ۵ حرفی را می‌فرستد؛ بقیه از گوشی خودشان وارد می‌شوند. همه صدای هم را زنده می‌شنوند، معلم با همه کار می‌کند، امتیاز می‌دهد و بازی راه می‌اندازد. (با فیلترشکن)', '#live/group'],
    ['🎧', 'استودیوی شنیداری', 'رادیو، خبر ساده، داستان صوتی، مکالمه‌های واقعی یا پادکست آموزشی — ساختگی ولی دقیقاً در سطح و درس تو، با مدت دلخواه (۵ تا ۴۵ دقیقه)، سرعت آهسته تا بومی، ترجمه و سؤال درک مطلب آخر کار.', '#listen'],
    ['🗂️', 'بانک کامل واژه‌ها (Word Skills)', '۲۸۰ موضوع و حدود ۹۵۰۰ واژه در سه سطح؛ هر واژه با معنی، کاربرد، رسمی یا عامیانه بودن، مثال و ترجمه. هر موضوع دیگری هم بخواهی می‌نویسی و برایت ساخته می‌شود.', '#path'],
    ['🔁', 'افعال و موضوع‌های موقعیتی', 'فعل‌های فرودگاه، تاکسی، مرتب کردن خانه، آشپزی و… با سه شکل فعل، جمله، ترجمه، تلفظ و فرق فعل‌های شبیه؛ می‌توانی انگلیسی یا فارسی را پنهان کنی و از خودت بپرسی.', '#verbs'],
    ['🧠', 'لایتنر هوشمند', 'هر واژه‌ای را با یک دکمه به جعبهٔ لایتنر می‌فرستی؛ به‌موقع یادآوری می‌شود و از خودت کوییز می‌گیری.', '#leitner'],
    ['📻', 'رادیو، خبر و موسیقی', 'رادیوی قدیمی با پیچ تنظیم برای شنیدن ناخودآگاه، خبر سادهٔ روز، مرور قبل از خواب و آهنگ‌های انگیزشی داخل برنامه.', '#listen'],
    ['🗣', 'تلفظ و مربی صدا', 'جمله را بگو؛ مربی می‌گوید کجا را اشتباه گفتی و چطور درستش کنی، به فارسی.', '#tool/shadow'],
    ['🧭', 'مشاور برنامه', 'هر وقت گیر کردی یا عقب افتادی، با مشاور حرف بزن تا برنامه‌ات را واقع‌بینانه تنظیم کند.', '#coach/advisor'],
    ['💡', 'نظرت مهم است', 'هر ایده، درخواست یا ایرادی داشتی، از «انتقادات و پیشنهادات» با صدا یا متن بفرست؛ مستقیم به دست مدیر می‌رسد.', '#feedback'],
    ['🧭', 'هر چیزی کجاست؟', 'پایین صفحه: خانه = کار امروز · تقویم و برنامه‌ریزی · کتابخانه · گفتگو = معلم و کلاس زنده · ابزارها = دیکشنری، افعال، واژه‌ها، تلفظ · من = پیشرفت و تنظیمات. دکمهٔ 🌙 بالای صفحه روز و شب را عوض می‌کند.', '#home']
  ];
  let i = 0;
  const draw = () => {
    const [ic, t, d, h] = F[i]; const last = i === F.length - 1;
    view().innerHTML = `<div class="stack" style="min-height:calc(100vh - 220px);justify-content:center"><div class="card stack" style="align-items:center;text-align:center;padding:32px 22px;gap:16px">
      <div style="font-size:72px;line-height:1">${ic}</div><b style="font-size:22px">${esc(t)}</b><div style="max-width:52ch;color:var(--muted);line-height:1.9">${esc(d)}</div>
      <div class="tiny muted">${faNum(i + 1)} از ${faNum(F.length)}</div>
      <div class="row" style="justify-content:center;gap:6px">${F.map((_, k) => `<span style="width:${k === i ? 22 : 8}px;height:8px;border-radius:9px;background:${k === i ? 'var(--accent)' : 'var(--line)'};transition:width .2s"></span>`).join('')}</div></div>
      <div class="row">${first ? '' : '<button class="btn line" id="skp">بستن</button>'}<span class="grow"></span>${i ? '<button class="btn ghost" id="prv">قبلی</button>' : ''}<button class="btn" id="nxt">${last ? (first ? '🎯 حالا هدفم را بگویم' : 'تمام') : 'بعدی'}</button></div></div>`;
    const end = () => { lsSet('zd:tourDone:' + G.active, true); if (first && !U.plan) { lsSet('zd:goalFirst', 1); go('plan'); } else go('home'); };
    $('#skp') && ($('#skp').onclick = end); $('#nxt').onclick = () => { if (last) end(); else { i++; draw(); } }; $('#prv') && ($('#prv').onclick = () => { i--; draw(); });
  };
  setTop('آشنایی با امکانات'); if (first) $('nav.bottom').hidden = true; draw();
};

/* ───────── نمودار پیشرفت ───────── */
function progressData(d = U) {
  const lv = LEVELS.map(L => { const us = ALL_UNITS.filter(u => u.level === L.id); const m = us.filter(u => d.units[u.id]?.mastered); return { L, us, m, rest: us.filter(u => !d.units[u.id]?.mastered) }; });
  const learned = Object.values(d.srs || {}).filter(s => s.box >= 4).length, seen = Object.keys(d.srs || {}).length;
  const ws = WORD_TRACK.map(L => { const us = WS_UNITS.filter(u => u.level === L.id); const m = us.filter(u => d.units[u.id]?.mastered); return { L, us, m }; });
  const gdone = Object.keys(lsGet('zd:gdone:' + G.active, {})).length;
  const days = [...Array(30)].map((_, i) => addDays(isoDay(), i - 29)); const mins = days.map(x => Math.round(d.log?.[x]?.min || 0));
  const live = days.reduce((a, x) => a + (d.log?.[x]?.live || 0), 0), radio = days.reduce((a, x) => a + (d.log?.[x]?.radio || 0), 0);
  return { lv, ws, learned, seen, gdone, days, mins, live, radio };
}
routes.progress = () => {
  setTop('نمودار پیشرفت من', true); const v = view(); const D = progressData(); const cur = currentUnit(); const curL = D.lv.find(x => x.L.id === cur.level) || D.lv[0];
  const P = U.plan; const mx = Math.max(10, ...D.mins);
  const gap = P ? planGap() : 0; const md = P ? (typeof missedDays === 'function' ? missedDays() : 0) : 0;
  const bar = (n, t, c = 'var(--accent)') => `<div class="pbar"><i style="width:${t ? Math.round(n / t * 100) : 0}%;background:${c}"></i></div>`;
  v.innerHTML = `<div class="stack">
  <div class="today"><b style="font-size:18px">📈 ${esc(me().name)}، الان اینجایی:</b>
    <div>درس ${faNum(cur.n || cur.idx + 1)}: <b>${esc(cur.fa)}</b> · سطح <b>${esc(curL.L.fa)}</b> (${esc(CEFR_OF[cur.level] || '')})</div>
    ${P ? `<div class="small">${gap > 0 ? `⚠️ ${faNum(gap)} درس عقب‌تر از برنامه${md ? ` · ${faNum(md)} روز درس نخوانده‌ای` : ''}` : gap < 0 ? `👏 ${faNum(-gap)} درس جلوتر از برنامه` : '✅ دقیقاً طبق برنامه'} · هدف: ${jLabel(addDays(P.start, P.dayCount - 1), true)}</div>` : '<a class="btn sm" href="#plan" style="align-self:flex-start">🎯 هدف و برنامه‌ام را بسازم</a>'}</div>
  <div class="card stack"><b>🏁 سطح‌ها</b>${D.lv.map(x => `<div><div class="row small"><span class="grow"><b>${esc(x.L.fa)}</b> <span class="en muted">${esc(CEFR_OF[x.L.id] || '')}</span></span><span>${faNum(x.m.length)} از ${faNum(x.us.length)} درس</span></div>${bar(x.m.length, x.us.length)}</div>`).join('')}</div>
  <div class="card stack"><b>🧭 تا سطح بعد چه مانده؟ (${esc(curL.L.fa)})</b>
    ${curL.rest.length ? `<div class="small">${faNum(curL.rest.length)} درس دیگر: ${curL.rest.map(u => `<a href="#unit/${u.id}" class="pill">${esc(u.icon)} ${esc(u.fa)}</a>`).join(' ')}</div>` : '<div class="small">🎉 این سطح را کامل کرده‌ای!</div>'}
    <div class="small muted">برای قبولی هر درس نمرهٔ ${faNum(G.settings.passScore)} در آزمون پایانی لازم است.</div></div>
  <div class="card stack"><b>🧠 آنچه یاد گرفته‌ای</b>
    <div class="grid2 small"><span>واژه‌های تثبیت‌شده: <b>${faNum(D.learned)}</b></span><span>واژه‌های در حال یادگیری: <b>${faNum(Math.max(0, D.seen - D.learned))}</b></span>
    <span>مبحث‌های گرامر خوانده‌شده: <b>${faNum(D.gdone)}</b> از ${faNum(typeof GRAMMAR !== 'undefined' ? GRAMMAR.length : 0)}</span><span>درس‌های قبول‌شده: <b>${faNum(masteredCount())}</b> از ${faNum(ALL_UNITS.length)}</span>
    <span>کلاس زندهٔ ۳۰ روز: <b>${faNum(Math.round(D.live))}</b> دقیقه</span><span>رادیو و شنیدن ۳۰ روز: <b>${faNum(Math.round(D.radio))}</b> دقیقه</span></div>
    ${D.ws.map(x => `<div><div class="row small"><span class="grow">${esc(x.L.fa)}</span><span>${faNum(x.m.length)} از ${faNum(x.us.length)} موضوع</span></div>${bar(x.m.length, x.us.length, 'var(--warn)')}</div>`).join('')}</div>
  <div class="card stack"><b>⏱ دقیقه‌های مطالعه در ۳۰ روز اخیر</b>
    <div class="pchart">${D.days.map((d, i) => `<div title="${jLabel(d)}: ${D.mins[i]}" style="height:${Math.max(3, D.mins[i] / mx * 100)}%;${P && P.days[d] && !P.days[d].review ? `background:${D.mins[i] >= P.minutes * 0.5 ? 'var(--ok)' : 'var(--bad)'}` : ''}${d === isoDay() ? ';outline:2px solid var(--mark)' : ''}"></div>`).join('')}</div>
    <div class="row tiny muted"><span>${jLabel(D.days[0])}</span><span class="grow"></span><span>امروز</span></div>
    ${P ? `<div class="tiny muted">سبز = طبق برنامه خواندی · قرمز = کمتر از نصف برنامه · هدف روزانه ${faNum(P.minutes)} دقیقه</div>` : ''}</div>
  <a class="btn ghost" href="#coach/advisor">🧭 دربارهٔ پیشرفتم با مشاور حرف بزنم</a></div>`;
};
/* ───────── تنظیمات ───────── */
routes.settings = () => {
  setTop('تنظیمات', true); const S = G.settings;
  const seg = (id, opts, val) => `<div class="seg" data-seg="${id}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(val) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  view().innerHTML = `<div class="stack">
  <details class="card stack"><summary><b>اتصال به هوش مصنوعی شخصی (اختیاری)</b> <span class="small muted">— لازم نیست؛ هوش مصنوعی برنامه از قبل وصل است</span></summary><div class="stack" style="margin-top:10px"><b>مغز هوش مصنوعی</b><span class="notice soft small">${PROVIDERS_NOTE}</span><span class="small muted">هر چند کلید که داری بگذار؛ برنامه از «مغز اصلی» استفاده می‌کند و اگر کلیدش نبود، سراغ بعدی می‌رود. کلیدها فقط روی همین دستگاه ذخیره می‌شوند.</span>
  <label class="f">مغز اصلی<select class="in" id="brain">${Object.entries(PROVIDERS).map(([k, p]) => `<option value="${k}"${S.brain === k ? ' selected' : ''}>${p.fa}</option>`).join('')}</select></label>
  ${Object.entries(PROVIDERS).map(([k, p]) => `<details class="card" style="box-shadow:inset 0 0 0 1px var(--line)"${S.prov[k].key ? ' open' : ''}><summary>${p.fa} ${S.prov[k].key ? '<span class="pill ok">فعال</span>' : ''}</summary><div class="stack" style="margin-top:8px">${p.keyUrl ? `<a class="small" href="${p.keyUrl}" target="_blank" rel="noopener">گرفتن کلید ↗</a>` : ''}<input class="in" dir="ltr" type="password" autocomplete="off" placeholder="API key" data-k="${k}" value="${esc(S.prov[k].key)}"><input class="in" dir="ltr" placeholder="model" data-m="${k}" value="${esc(S.prov[k].model)}">${k === 'custom' || k === 'openai' ? `<input class="in" dir="ltr" placeholder="${k === 'openai' ? 'آدرس واسط (اختیاری، برای ایران) https://…/v1' : 'https://…/v1'}" data-b="${k}" value="${esc(S.prov[k].base || '')}">` : ''}</div></details>`).join('')}
  <button class="btn ghost" id="test">آزمایش اتصال</button><div id="tr" class="small"></div>
  <hr class="sep"><b>کد اتصال برای دستگاه‌ها و کاربران دیگر</b><span class="small muted">کد را بساز و فقط برای افراد مورد اعتماد بفرست؛ کلیدهای تو داخل این کد است. در دستگاه دیگر، کد را در صفحهٔ اول یا همین‌جا بچسبان.</span>
  <div class="row"><button class="btn ghost sm" id="mkc">ساخت و کپی کد اتصال</button></div><textarea id="cc" class="in" dir="ltr" rows="2" placeholder="کد اتصال را اینجا بچسبان…"></textarea><button class="btn line sm" id="usc">وصل شدن با این کد</button></div></details>

  <div class="card stack"><b>صدا</b>
  <label class="f">لهجهٔ انگلیسی</label>${seg('accent', [['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']], S.accent)}
  ${isAdminHere() ? `<label class="f">سهمیهٔ روزانهٔ هوش مصنوعی هر کاربر (دلار؛ در کد اتصال قرار می‌گیرد)<input class="in" id="dbud" type="number" min="0.05" max="50" step="0.05" dir="ltr" value="${+S.dailyBudget || 1.5}"></label>` : ''}
  <label class="f">صدای سه‌بعدی (با هدفون)</label>${seg('spatial', [['0', 'خاموش'], ['1', '🎧 سه‌بعدی'], ['2', '🌀 ۸D چرخشی']], S.spatial || '0')}<span class="small muted">«سه‌بعدی»: صدای معلم روبه‌رویت و هر شخصیت داستان جای خودش (چپ، راست، نزدیک). «۸D»: صدا آرام دور سرت می‌چرخد. فقط با هدفون حس می‌شود.</span>
  <label class="f">صدای انگلیسی</label>${seg('voiceEn', [['browser', 'صدای دستگاه (سریع، رایگان)'], ['gemini', 'Gemini'], ['openai', 'OpenAI']], S.voiceEn)}
  <label class="f">صدای فارسی معلم (احساس‌دار)</label>${seg('voiceFa', [['gemini', 'Gemini (پیشنهادی)'], ['openai', 'OpenAI'], ['browser', 'صدای دستگاه']], S.voiceFa)}
  <div class="grid2"><label class="f">صدای Gemini<select class="in" id="gv">${['Kore', 'Aoede', 'Leda', 'Zephyr', 'Callirrhoe', 'Despina', 'Sulafat', 'Achernar', 'Puck', 'Charon', 'Fenrir', 'Orus'].map(x => `<option${S.geminiVoice === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label><label class="f">صدای OpenAI<select class="in" id="ov">${['nova', 'shimmer', 'coral', 'sage', 'alloy', 'ash', 'echo', 'fable', 'onyx'].map(x => `<option${S.openaiVoice === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label></div>
  <label class="f">سرعت صدای دستگاه: <span id="rv">${S.rate}</span><input type="range" min="0.6" max="1.2" step="0.05" value="${S.rate}" id="rate"></label>
  <label class="row small"><input type="checkbox" id="as"${S.autoSpeak ? ' checked' : ''}> پاسخ‌ها خودکار خوانده شوند</label>
  <div class="row"><button class="btn ghost sm" id="t1">آزمایش صدای انگلیسی</button><button class="btn ghost sm" id="t2">آزمایش صدای معلم</button></div><div class="small muted" id="vinfo"></div></div>

  <div class="card stack"><b>شنیدن صدای من</b>${seg('listen', [['browser', 'مرورگر (رایگان)'], ['groq', 'Groq Whisper (رایگان)'], ['gemini', 'Gemini'], ['openai', 'OpenAI']], S.listen)}<span class="tiny muted">اگر روی آیفون میکروفون کار نکرد، Groq را انتخاب کن.</span></div>

  <div class="card stack"><b>تصاویر واژه‌ها</b>${seg('img', [['set', 'تصاویر سه‌بعدی برنامه (آفلاین)'], ['photo', 'عکس واقعی از اینترنت']], S.img)}
  <input class="in" dir="ltr" id="pk" placeholder="Pixabay API key (اختیاری، برای عکس بهتر)" value="${esc(S.pixabayKey)}"><button class="btn line sm" id="ci">پاک کردن تصاویر ذخیره‌شده</button></div>

  <div class="card stack"><b>آموزش</b><div class="grid2"><label class="f">نام معلم<input class="in" id="tn" value="${esc(S.teacher)}"></label><div class="f">حد قبولی آزمون درس<div class="in" style="display:flex;align-items:center">${faNum(95)} (ثابت)</div></div></div>
  <label class="f">ظاهر</label>${seg('theme', [['auto', 'خودکار'], ['light', 'روشن'], ['dark', 'تیره']], S.theme)}</div>
  <button class="btn" id="sv">ذخیرهٔ تنظیمات</button></div>`;
  $$('[data-seg]').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', g).forEach(x => x.classList.remove('on')); b.classList.add('on'); S[g.dataset.seg] = b.dataset.v; if (g.dataset.seg === 'theme') applyTheme(); if (g.dataset.seg === 'spatial') { Spatial.prep(); Spatial.route(); if (b.dataset.v === '2') say('Can you hear me moving around your head? This is eight D sound.', 'en'); if (b.dataset.v === '1') { Spatial.at(-1.5, -0.8); say('Hi! I am on your left… and now', 'en').then(() => { Spatial.at(1.5, -0.8); return say('I am on your right!', 'en'); }).then(() => Spatial.at(0, -1.2)); } } saveG('settings'); });
  const collect = () => { S.brain = $('#brain').value; $$('[data-k]').forEach(i => S.prov[i.dataset.k].key = i.value.trim()); $$('[data-m]').forEach(i => S.prov[i.dataset.m].model = i.value.trim()); $$('[data-b]').forEach(i => S.prov[i.dataset.b].base = i.value.trim()); S.geminiVoice = $('#gv').value; S.openaiVoice = $('#ov').value; S.rate = +$('#rate').value; S.autoSpeak = $('#as').checked; S.pixabayKey = $('#pk').value.trim(); S.teacher = $('#tn').value.trim() || 'رستا'; S.passScore = 95; if ($('#dbud')) { const q = +$('#dbud').value; if (q >= 0.05 && q <= 50) S.dailyBudget = q; } saveG('settings'); };
  $('#rate').oninput = e => $('#rv').textContent = e.target.value;
  $('#mkc').onclick = async () => { collect(); if (!firstKeyed()) return toast('اول یک کلید وارد کن.'); const c = makeCode(); $('#cc').value = c; try { await navigator.clipboard.writeText(c); toast('کد اتصال کپی شد؛ در واتساپ یا تلگرام بفرست.'); } catch { $('#cc').select(); toast('کد را از کادر زیر کپی کن.'); } };
  $('#usc').onclick = () => { try { useCode($('#cc').value); toast('هوش مصنوعی وصل شد ✓'); routes.settings(); } catch { toast('کد اتصال درست نیست.'); } };
  $('#sv').onclick = () => { collect(); toast('ذخیره شد.'); };
  $('#test').onclick = async () => { collect(); $('#tr').innerHTML = loading('در حال آزمایش…'); try { const t0 = performance.now(); const r = await ai({ system: 'Reply briefly.', messages: [{ role: 'user', content: 'Say hello to a Persian learner in Persian. JSON {"hi":""}' }] }); $('#tr').innerHTML = `✅ وصل شد (${faNum(Math.round(performance.now() - t0))} میلی‌ثانیه): ${esc(r.hi)}`; } catch (e) { $('#tr').textContent = '❌ ' + (e.message === 'NOKEY' ? 'کلیدی وارد نشده' : e.message); } };
  $('#t1').onclick = e => { collect(); say('Hello! Nice to meet you. How are you today?', 'en', 'cheerful', e.currentTarget); };
  $('#t2').onclick = e => { collect(); say(`سلام ${me()?.name || ''} جان! من ${S.teacher} هستم. امروز می‌خوایم یاد بگیریم بگیم Nice to meet you. آماده‌ای؟`, 'fa', 'cheerful', e.currentTarget); };
  $('#ci').onclick = () => { G.img = {}; saveG('img'); toast('تصاویر پاک شد.'); };
  setTimeout(() => { loadVoices(); const en = bestVoice('en'), fa = bestVoice('fa'); $('#vinfo') && ($('#vinfo').textContent = `صدای انگلیسی دستگاه: ${en ? en.name : 'یافت نشد'} · صدای فارسی دستگاه: ${fa ? fa.name : 'ندارد (Gemini را انتخاب کن)'}`); }, 400);
};
function toggleDayNight() { G.settings.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; saveG('settings'); applyTheme(); $('#top [title="روز / شب"]') && ($('#top [title="روز / شب"]').textContent = G.settings.theme === 'dark' ? '☀️' : '🌙'); }
function applyTheme() { document.body.classList.toggle('nopron', !lsGet('zd:showPron', true)); if (!lsGet('zd:themeMig', 0)) { lsSet('zd:themeMig', 1); if (G.settings.theme === 'auto') { G.settings.theme = 'light'; saveG('settings'); } } const t = G.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; }

/* ───────── شروع ───────── */
applyTheme();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) { navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => { }); let reloaded = false; const hadCtl = !!navigator.serviceWorker.controller; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || !hadCtl) return; reloaded = true; if (!/^#(teach|talk|exam|rooms|read|theater)/.test(location.hash)) location.reload(); }); }
try { navigator.storage?.persist?.(); } catch { } // جلوگیری از پاک شدن خودکار داده‌ها توسط مرورگر
/* انتخاب زبان هدف (انگلیسی/عربی) و لهجه — برای هر کاربر جدا ذخیره می‌شود */
document.addEventListener('click', e => {
  const b = e.target.closest('#tlsel button, [data-tlv]'); if (!b) return;
  if (b.dataset.tlv) { U.tlv = U.tlv || {}; U.tlv[tl()] = b.dataset.tlv; } else U.tl = b.dataset.v;
  saveU(); try { LIVE_LESSON = null; } catch { } toast(`حالا ${tlFa()} یاد می‌گیری.`); routes.home();
});
