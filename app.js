/* زبان دوم — منطق برنامه (بدون فریم‌ورک، برای سرعت) */
'use strict';

/* ───────── ابزارهای پایه ───────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const faNum = n => Number(n).toLocaleString('fa-IR');
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
const ALL_UNITS = LEVELS.flatMap(L => L.units.map(u => ({ ...u, level: L.id, levelFa: L.fa })));
ALL_UNITS.forEach((u, i) => { u.idx = i; u.baseWords = parseWords(u.words || ''); });
const WS_UNITS = WORD_TRACK.flatMap(L => L.units.map(u => ({ ...u, level: L.id, levelFa: L.fa, track: 'ws' })));
WS_UNITS.forEach((u, i) => { u.idx = 2000 + i; u.wsi = i; u.baseWords = []; });
const nextUnit = u => u.track === 'ws' ? WS_UNITS[u.wsi + 1] : u.idx < 1000 ? ALL_UNITS[u.idx + 1] : null;
const currentWS = () => WS_UNITS.find(u => isOpen(u) && !isMastered(u)) || WS_UNITS[WS_UNITS.length - 1];
function parseWords(txt) { return txt.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [w, ipa, fa, img, pos, ex] = l.split('|'); return { w, ipa, fa, img, pos, ex }; }); }
const POS = { n: 'اسم', v: 'فعل', adj: 'صفت', adv: 'قید', prep: 'حرف اضافه', phr: 'عبارت' };

const DEFAULT_SETTINGS = {
  brain: 'gemini',
  prov: {
    gemini: { key: '', model: 'gemini-2.5-flash' },
    anthropic: { key: '', model: 'claude-haiku-5-5' },
    openai: { key: '', model: 'gpt-4.1-mini' },
    groq: { key: '', model: 'llama-3.3-70b-versatile' },
    openrouter: { key: '', model: 'google/gemini-2.5-flash' },
    custom: { key: '', model: '', base: '' }
  },
  voiceEn: 'browser', voiceFa: 'gemini', listen: 'browser',
  accent: 'US', rate: 0.95,
  geminiTtsModel: 'gemini-2.5-flash-preview-tts', geminiVoice: 'Kore', openaiVoice: 'nova',
  teacher: 'سارا', img: 'ai', pixabayKey: '', passScore: 95, theme: 'auto', autoSpeak: true
};
const G = { // سراسری (مشترک بین کاربران همین دستگاه)
  users: lsGet('zd:users', []),
  active: lsGet('zd:active', null),
  settings: deepMerge(structuredClone(DEFAULT_SETTINGS), lsGet('zd:settings', {})),
  extra: lsGet('zd:extra', {}),      // لغات و محتوای تکمیلی هر درس (ساخته‌شده با AI) — مشترک
  img: lsGet('zd:img', {}),          // آدرس تصویر هر واژه
  cache: lsGet('zd:cache', {})       // دیالوگ‌ها، «چرا این درس» و…
};
function deepMerge(a, b) { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) a[k] = deepMerge(a[k] || {}, b[k]); else a[k] = b[k]; } return a; }
const saveG = k => lsSet('zd:' + k, G[k]);

let U = null; // داده‌های کاربر فعال
const blankUser = () => ({ srs: {}, units: {}, mistakes: [], mem: [], log: {}, xp: 0, badges: [], convos: {}, plan: null, placement: null, custom: [] });
function loadUser(id) { U = Object.assign(blankUser(), lsGet('zd:u:' + id, {})); G.active = id; saveG('active'); }
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
  return Object.entries(U.srs).filter(([k, s]) => { const u = unitById(k.split(':')[0]); return u && cur && u.idx < cur.idx && s.lastWrong && s.box <= 1; }).slice(0, 12).map(([k]) => wordFromId(k)).filter(Boolean);
}

/* ───────── پیشرفت، باز شدن درس‌ها و امتیاز ───────── */
function unitState(u) { return U.units[u.id] || (U.units[u.id] = { steps: {}, best: {} }); }
function isMastered(u) { return !!unitState(u).mastered; }
function isOpen(u) {
  if (u.track === 'ws') return u.wsi === 0 || isMastered(WS_UNITS[u.wsi - 1]);
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
const PROVIDERS = {
  gemini: { fa: 'Google Gemini (رایگان)', keyUrl: 'https://aistudio.google.com/apikey' },
  anthropic: { fa: 'Claude (Anthropic)', keyUrl: 'https://console.anthropic.com/settings/keys' },
  openai: { fa: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys' },
  groq: { fa: 'Groq (رایگان، بسیار سریع)', keyUrl: 'https://console.groq.com/keys' },
  openrouter: { fa: 'OpenRouter', keyUrl: 'https://openrouter.ai/keys' },
  custom: { fa: 'سرویس سازگار با OpenAI', keyUrl: '' }
};
const hasAI = () => !!G.settings.prov[G.settings.brain]?.key;
function firstKeyed() { const p = G.settings.prov; return ['gemini', 'groq', 'anthropic', 'openai', 'openrouter', 'custom'].find(k => p[k]?.key); }

async function ai({ system, messages, json = true, images = [], max = 1400, temp = 0.8 }) {
  let pv = G.settings.brain; if (!G.settings.prov[pv]?.key) pv = firstKeyed();
  if (!pv) throw new Error('NOKEY');
  const c = G.settings.prov[pv];
  const sys = system + (json ? '\nReturn ONLY valid JSON, no markdown fences.' : '');
  let text = '';
  if (pv === 'gemini') {
    const contents = messages.map((m, i) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }, ...(i === messages.length - 1 ? images.map(im => ({ inlineData: { mimeType: im.mime, data: im.b64 } })) : [])] }));
    const gc = { temperature: temp, maxOutputTokens: max };
    if (json) gc.responseMimeType = 'application/json';
    if (/2\.5-flash/.test(c.model)) gc.thinkingConfig = { thinkingBudget: 0 }; // سرعت بیشتر
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': c.key }, body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: gc }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
    text = d.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  } else if (pv === 'anthropic') {
    const msgs = messages.map((m, i) => ({ role: m.role, content: i === messages.length - 1 && images.length ? [...images.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.mime, data: im.b64 } })), { type: 'text', text: m.content }] : m.content }));
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: c.model, max_tokens: max, temperature: temp, system: sys, messages: msgs }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
    text = d.content?.map(b => b.text || '').join('') || '';
  } else {
    const base = pv === 'openai' ? 'https://api.openai.com/v1' : pv === 'groq' ? 'https://api.groq.com/openai/v1' : pv === 'openrouter' ? 'https://openrouter.ai/api/v1' : c.base.replace(/\/$/, '');
    const msgs = [{ role: 'system', content: sys }, ...messages.map((m, i) => ({ role: m.role, content: i === messages.length - 1 && images.length ? [{ type: 'text', text: m.content }, ...images.map(im => ({ type: 'image_url', image_url: { url: `data:${im.mime};base64,${im.b64}` } }))] : m.content }))];
    const body = { model: c.model, messages: msgs, temperature: temp, max_tokens: max }; if (json) body.response_format = { type: 'json_object' };
    const r = await fetch(base + '/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + c.key }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
    text = d.choices?.[0]?.message?.content || '';
  }
  if (!json) return text;
  return parseJSON(text);
}
function parseJSON(t) {
  try { return JSON.parse(t); } catch { }
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s >= 0 && e > s) { try { return JSON.parse(t.slice(s, e + 1)); } catch { } }
  throw new Error('پاسخ هوش مصنوعی قابل خواندن نبود؛ دوباره امتحان کن.');
}
function aiErr(e) {
  if (e.message === 'NOKEY') { toast('اول در «تنظیمات» یک کلید هوش مصنوعی بگذار (Gemini رایگان است).'); return; }
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
  const mistakes = U.mistakes.slice(-10).map(m => `${m.wrong} → ${m.right}`).join('; ');
  const mem = U.mem.slice(-25).map(m => '- ' + m.t).join('\n');
  return `LEARNER PROFILE
Name: ${u?.name || ''}. Native language: Persian. Lives in Oman.
Current unit: ${cur.en} (${cur.levelFa || ''}), units mastered: ${p.mastered}/${ALL_UNITS.length}, study streak: ${streakOf(U)} days, pace: ${p.perWeek} units/week, total study ${p.minutes} minutes${p.eta ? ', predicted finish of B1+ path: ' + p.eta : ''}.
Words from previous units to recycle naturally: ${prevWords || '-'}
Words from previous units the learner FORGOT (mention this humanly, e.g. "I didn't expect you to forget this one from unit X", then re-teach briefly): ${forgot || '-'}
Weak words: ${weak || '-'}
Recent mistakes: ${mistakes || '-'}
Long-term memory about the learner:
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
  const pref = lang === 'fa' ? ['fa-IR', 'fa'] : G.settings.accent === 'UK' ? ['en-GB'] : ['en-US'];
  const list = voices.filter(v => pref.some(p => v.lang.replace('_', '-').toLowerCase().startsWith(p.toLowerCase())));
  const score = v => (/natural|online|neural|premium|enhanced/i.test(v.name) ? 3 : 0) + (/google|microsoft|samantha|daniel|serena/i.test(v.name) ? 1 : 0);
  return list.sort((a, b) => score(b) - score(a))[0] || (lang === 'fa' ? null : voices.find(v => v.lang.startsWith('en')));
}
let speakToken = 0;
function stopSpeak() { speakToken++; try { speechSynthesis.cancel(); } catch { } try { player.pause(); } catch { } }
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
  const bin = atob(b64); const len = bin.length; const buf = new ArrayBuffer(44 + len); const v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + len, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, len, true);
  const u8 = new Uint8Array(buf, 44); for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: 'audio/wav' });
}
const EMO = { cheerful: 'cheerful and warm', calm: 'calm and gentle', excited: 'excited and energetic', encouraging: 'encouraging and supportive', empathetic: 'kind and empathetic', proud: 'proud and happy', surprised: 'playfully surprised', serious: 'clear and serious' };
async function cloudTTS(engine, text, lang, emotion) {
  const acc = G.settings.accent === 'UK' ? 'British (Received Pronunciation)' : 'General American';
  const style = lang === 'fa'
    ? `Say the following in a ${EMO[emotion] || 'warm'} voice, like a friendly Iranian teacher speaking natural, fluent Tehrani Persian; pronounce any English words with a clear ${acc} accent`
    : `Say the following in a clear, natural ${acc} English accent, with a ${EMO[emotion] || 'friendly'} tone, at a learner-friendly pace`;
  const key = 'a:' + hashStr([engine, G.settings.geminiVoice, G.settings.openaiVoice, acc, lang, emotion, text].join('|'));
  let blob = await idb.get(key);
  if (!blob) {
    if (engine === 'gemini') {
      const c = G.settings.prov.gemini; if (!c.key) throw new Error('NOKEY');
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${G.settings.geminiTtsModel}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': c.key }, body: JSON.stringify({ contents: [{ parts: [{ text: `${style}:\n${text}` }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: G.settings.geminiVoice } } } } }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
      const part = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData); if (!part) throw new Error('صدا ساخته نشد');
      const m = /rate=(\d+)/.exec(part.inlineData.mimeType || ''); blob = pcmToWav(part.inlineData.data, m ? +m[1] : 24000);
    } else {
      const c = G.settings.prov.openai; if (!c.key) throw new Error('NOKEY');
      const r = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + c.key }, body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: G.settings.openaiVoice, input: text, instructions: style, response_format: 'mp3' }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error?.message || r.status);
      blob = await r.blob();
    }
    idb.set(key, blob);
  }
  return blob;
}
function playBlob(blob, tok) {
  return new Promise(res => { if (tok !== speakToken) return res(); const url = URL.createObjectURL(blob); player.src = url; player.playbackRate = 1; player.onended = player.onerror = () => { URL.revokeObjectURL(url); res(); }; player.play().catch(() => res()); });
}
/* lang: 'en' یا 'fa' (فارسی همراه با واژه‌های انگلیسی) */
async function say(text, lang = 'en', emotion = 'cheerful', btn) {
  if (!text) return; stopSpeak(); const tok = ++speakToken; btn?.classList.add('on');
  const engine = lang === 'fa' ? G.settings.voiceFa : G.settings.voiceEn;
  try {
    if (engine !== 'browser') { try { await playBlob(await cloudTTS(engine, text, lang, emotion), tok); return; } catch (e) { if (e.message !== 'NOKEY') console.warn(e); } }
    if (lang === 'en') { await browserSay(text, 'en'); return; }
    // فارسی با صدای مرورگر: بخش‌های انگلیسی با صدای انگلیسی
    const parts = text.split(/([A-Za-z][A-Za-z0-9'’,.!?\- ]*[A-Za-z0-9.!?])/).filter(s => s.trim());
    const faOk = !!bestVoice('fa');
    for (const p of parts) { if (tok !== speakToken) break; const en = /^[A-Za-z]/.test(p); if (en) await browserSay(p, 'en'); else if (faOk) await browserSay(p, 'fa', 1); }
    if (!faOk) toast('صدای فارسی روی این دستگاه نیست؛ در تنظیمات «صدای فارسی» را روی Gemini بگذار.');
  } finally { btn?.classList.remove('on'); }
}

/* ───────── شنیدن (تشخیص گفتار) ───────── */
function listen(lang = 'en-US') {
  const eng = G.settings.listen; const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (eng === 'browser' && SR) {
    let rec; const p = new Promise((res, rej) => {
      rec = new SR(); rec.lang = lang; rec.interimResults = false; rec.maxAlternatives = 1; let got = '';
      rec.onresult = e => { got = [...e.results].map(r => r[0].transcript).join(' '); };
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
    const c = G.settings.prov.gemini; if (!c.key) throw new Error('NOKEY');
    const b64 = await blobB64(blob);
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${c.model}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': c.key }, body: JSON.stringify({ contents: [{ parts: [{ text: `Transcribe this audio exactly as spoken (language: ${lang}). Output only the transcript, keep the learner's mistakes.` }, { inlineData: { mimeType: blob.type.split(';')[0], data: b64 } }] }], generationConfig: { thinkingConfig: { thinkingBudget: 0 } } }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status);
    return d.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim() || '';
  }
  const c = G.settings.prov[eng]; if (!c?.key) throw new Error('NOKEY');
  const fd = new FormData(); fd.append('file', blob, 'speech.' + ext); fd.append('model', eng === 'groq' ? 'whisper-large-v3-turbo' : 'whisper-1'); fd.append('language', lang.slice(0, 2));
  const r = await fetch((eng === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1') + '/audio/transcriptions', { method: 'POST', headers: { authorization: 'Bearer ' + c.key }, body: fd });
  const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || r.status); return (d.text || '').trim();
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
    catch (e) { if (e.message === 'NOKEY') toast('برای ضبط روی این دستگاه، کلید Groq (رایگان) یا Gemini لازم است.'); else toast('میکروفون: ' + e.message); }
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
function picHTML(u, w, big) {
  const k = wid(u, w); const url = G.img[k];
  const inner = w.img?.startsWith('#') ? `<span class="sw" style="background:${w.img}"></span>` : esc(w.img || '🖼️');
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
  const mode = G.settings.img; if (mode === 'emoji') return;
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
function setTop(title, back) { $('#top').innerHTML = `${back ? `<button class="back" aria-label="بازگشت" onclick="history.length>1?history.back():go('home')">${I.back}</button>` : ''}<h1>${esc(title)}</h1>${me() ? `<button class="userchip" onclick="go('users')"><span class="avatar">${esc(me().avatar)}</span>${esc(me().name)}</button>` : ''}`; }
function go(h) { location.hash = h; }
const view = () => $('#view');
function sheet(html) { const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.innerHTML = `<div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`; bg.onclick = e => { if (e.target === bg) bg.remove(); }; document.body.appendChild(bg); return bg; }
const loading = (t = 'در حال فکر کردن…') => `<div class="card row"><span class="typing"><i></i><i></i><i></i></span><span class="muted">${t}</span></div>`;
function needAI(el) { if (hasAI() || firstKeyed()) return false; el.innerHTML = `<div class="card stack"><b>این بخش با هوش مصنوعی کار می‌کند.</b><span class="muted">یک کلید رایگان Gemini بگیر و در تنظیمات بگذار؛ دو دقیقه طول می‌کشد.</span><a class="btn" href="#settings">رفتن به تنظیمات</a></div>`; return true; }

/* ───────── مسیریاب ───────── */
const routes = {};
function router() {
  stopSpeak(); window.scrollTo(0, 0); view().onclick = null; $('nav.bottom').hidden = false;
  if (!G.users.length || !G.active || !G.users.some(u => u.id === G.active)) { if (!G.users.length) return viewWelcome(); loadUser(G.users[0].id); }
  if (!U) loadUser(G.active);
  const [r, ...args] = (location.hash.slice(1) || 'home').split('/');
  $$('nav.bottom a').forEach(a => a.classList.toggle('on', a.dataset.r === ({ unit: 'home', cards: 'home', quiz: 'home', teach: 'home', talk: 'chat', role: 'chat', dialog: 'home', exam: 'home', tool: 'tools', settings: 'me', users: 'me', placement: 'home', book: 'library', read: 'library', talkfree: 'chat' }[r] || r)));
  (routes[r] || routes.home)(...args.map(decodeURIComponent));
}
addEventListener('hashchange', router);

/* ───────── خوش‌آمد و کاربران ───────── */
const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐨', '🦉', '🐬', '🦄', '🐙', '🐝', '🌵', '🚀'];
function viewWelcome() {
  $('#top').innerHTML = '<h1>زبان دوم</h1>'; $('nav.bottom').hidden = true;
  view().innerHTML = `<div class="stack">
  <div class="today"><div class="big-ic">👋</div><b style="font-size:20px">به «زبان دوم» خوش آمدی</b><span class="muted">معلم هوشمندی که با تو فارسی حرف می‌زند، انگلیسی را از واژه تا مکالمهٔ روان قدم‌به‌قدم یادت می‌دهد و هیچ درسی را فراموش نمی‌کنی.</span></div>
  <div class="card stack"><label class="f">اسمت چیست؟<input id="nm" class="in" placeholder="مثلاً رستا" maxlength="24"></label>
  <div class="row" id="av">${AVATARS.map((a, i) => `<button class="icon-btn${i ? '' : ' on'}" data-a="${a}" style="font-size:20px">${a}</button>`).join('')}</div>
  <button class="btn wide" id="go">شروع</button></div></div>`;
  let av = AVATARS[0]; $$('#av button').forEach(b => b.onclick = () => { $$('#av button').forEach(x => x.classList.remove('on')); b.classList.add('on'); av = b.dataset.a; });
  $('#go').onclick = () => { const n = $('#nm').value.trim(); if (!n) return toast('اسمت را بنویس.'); addUser(n, av); $('nav.bottom').hidden = false; go('placement'); router(); };
}
function addUser(name, avatar) { const u = { id: uid(), name, avatar, created: isoDay() }; G.users.push(u); saveG('users'); loadUser(u.id); saveU(); return u; }
routes.users = () => {
  setTop('کاربران', true);
  view().innerHTML = `<div class="stack"><div class="users">${G.users.map(u => { const d = userData(u.id); return `<button class="ucard${u.id === G.active ? ' on' : ''}" data-u="${u.id}"><div class="row"><span class="avatar">${esc(u.avatar)}</span><b class="grow">${esc(u.name)}</b><span class="pill">${faNum(d.xp)} امتیاز</span></div><span class="small muted">${faNum(masteredCount(d))} درس قبول · ${faNum(streakOf(d))} روز پیاپی</span></button>`; }).join('')}</div>
  <div class="card stack"><b>کاربر تازه</b><div class="row"><input id="nn" class="in grow" placeholder="اسم" maxlength="24"><button class="btn" id="add">افزودن</button></div></div>
  <div class="card stack"><b>ویرایش کاربر فعلی</b><div class="row"><input id="rn" class="in grow" value="${esc(me().name)}"><button class="btn ghost" id="ren">ذخیره</button></div><button class="btn line" id="del">حذف این کاربر و همهٔ پیشرفتش</button><div id="delc"></div></div></div>`;
  $$('[data-u]').forEach(b => b.onclick = () => { loadUser(b.dataset.u); toast('کاربر عوض شد: ' + me().name); go('home'); });
  $('#add').onclick = () => { const n = $('#nn').value.trim(); if (!n) return; addUser(n, AVATARS[G.users.length % AVATARS.length]); go('placement'); };
  $('#ren').onclick = () => { me().name = $('#rn').value.trim() || me().name; saveG('users'); routes.users(); };
  $('#del').onclick = () => { $('#delc').innerHTML = `<div class="notice row"><span class="grow">مطمئنی؟ پیشرفت ${esc(me().name)} برای همیشه پاک می‌شود.</span><button class="btn bad sm" id="yes">بله، حذف کن</button></div>`; $('#yes').onclick = () => { localStorage.removeItem('zd:u:' + G.active); G.users = G.users.filter(u => u.id !== G.active); saveG('users'); G.active = G.users[0]?.id || null; saveG('active'); U = null; if (G.active) loadUser(G.active); go('home'); router(); }; };
};

/* ───────── صفحهٔ اول ───────── */
function todayPlan() { const p = U.plan; if (!p) return null; return p.days?.[isoDay()] || null; }
routes.home = () => {
  setTop('زبان دوم');
  const cur = currentUnit(); const due = dueIds().length; const p = paceInfo(); const tp = todayPlan(); const L = U.log[isoDay()] || { xp: 0, min: 0 };
  const board = G.users.map(u => ({ u, d: userData(u.id) })).map(x => ({ ...x, w: weekXP(x.d) })).sort((a, b) => b.w - a.w);
  const tasks = tp ? tp.tasks : [{ k: 'cards', t: `مرور ${faNum(due)} فلش‌کارت موعددار` }, { k: 'unit', t: `ادامهٔ درس «${cur.fa}»` }];
  view().innerHTML = `<div class="stack">
  <div class="today">
    <div class="row"><span class="grow small muted">${jLabel(isoDay(), true)} · ${faNum(Math.round(L.min))} دقیقه مطالعهٔ امروز</span><span class="pill mark">🔥 ${faNum(streakOf(U))} روز</span></div>
    <b style="font-size:19px">درس ${faNum(cur.idx + 1)}: ${esc(cur.fa)} <span class="en" style="opacity:.7;font-size:14px">${esc(cur.en)}</span></b>
    <ul class="tasks">${tasks.map(t => `<li class="${taskDone(t) ? 'done' : ''}"><span class="chk">${taskDone(t) ? '✓' : ''}</span>${esc(t.t)}</li>`).join('')}</ul>
    <div class="row"><a class="btn" href="#unit/${cur.id}">ادامهٔ یادگیری</a>${due ? `<a class="btn ghost" style="background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor" href="#cards/due">مرور ${faNum(due)} واژه</a>` : ''}</div>
  </div>
  ${!hasAI() && !firstKeyed() ? `<div class="notice">برای فعال شدن معلم صوتی و گفتگو، در <a href="#settings">تنظیمات</a> یک کلید رایگان Gemini بگذار.</div>` : ''}
  <div class="sec">رقابت این هفته <small>امتیاز هفت روز اخیر</small></div>
  <div class="users">${board.map((x, i) => `<button class="ucard${x.u.id === G.active ? ' on' : ''}" data-u="${x.u.id}"><div class="row"><span style="font-weight:900;width:20px">${['🥇', '🥈', '🥉'][i] || faNum(i + 1)}</span><span class="avatar">${esc(x.u.avatar)}</span><b class="grow">${esc(x.u.name)}</b><span class="pill acc num">${faNum(x.w)}</span></div>
    <div class="small muted">درس ${faNum((ALL_UNITS.find(u => !x.d.units[u.id]?.mastered)?.idx ?? 0) + 1)} از ${faNum(ALL_UNITS.length)} · ${faNum(Object.values(x.d.srs).filter(s => s.box >= 4).length)} واژهٔ تثبیت‌شده · ${rankOf(x.d.xp)}</div>
    <div class="bar"><i style="width:${Math.round(masteredCount(x.d) / ALL_UNITS.length * 100)}%"></i></div></button>`).join('')}</div>
  <div class="card stack"><div class="row"><b class="grow">پیشرفت من</b><span class="pill">${rankOf(U.xp)} · ${faNum(U.xp)} امتیاز</span></div>
    <div class="grid2 small"><span>درس‌های قبول‌شده: <b class="num">${faNum(p.mastered)}</b> از ${faNum(ALL_UNITS.length)}</span><span>واژه‌های تثبیت‌شده: <b>${faNum(learnedCount())}</b></span>
    <span>سرعت: <b>${faNum(p.perWeek)}</b> درس در هفته</span><span>${p.eta ? `پیش‌بینی پایان سطح متوسط: <b>${jLabel(p.eta, true)}</b>` : 'پیش‌بینی بعد از اولین درس'}</span></div>
    ${U.badges.length ? `<div class="row">${U.badges.map(b => { const x = BADGES.find(y => y.id === b); return x ? `<span class="pill mark" title="${x.fa}">${x.ic} ${x.fa}</span>` : ''; }).join('')}</div>` : ''}</div>
  ${LEVELS.map(Lv => `<div class="sec">${esc(Lv.fa)} <small class="en">${esc(Lv.en)}</small></div><div class="units">${ALL_UNITS.filter(u => u.level === Lv.id).map(unitCard).join('')}</div>`).join('')}
  ${WORD_TRACK.map(Lv => `<div class="sec">${esc(Lv.fa)} <small class="en">${esc(Lv.en)}</small></div><div class="units">${WS_UNITS.filter(u => u.level === Lv.id).map(unitCard).join('')}</div>`).join('')}
  ${U.custom.length ? `<div class="sec">درس‌های خودم</div><div class="units">${U.custom.map(c => unitCard({ ...c, idx: 1000, baseWords: c.words })).join('')}</div>` : ''}
  <a class="btn line wide" href="#tool/import">+ افزودن درس از کتاب خودم یا ساخت درس تازه با هوش مصنوعی</a>
  ${!U.placement ? `<a class="btn ghost wide" href="#placement">تعیین سطح با هوش مصنوعی</a>` : ''}
  </div>`;
  $$('[data-u]').forEach(b => b.onclick = () => { loadUser(b.dataset.u); router(); });
};
function unitCard(u) {
  const open = isOpen(u), m = u.idx < 1000 || u.track === 'ws' ? isMastered(u) : false, cur = !m && open && (u.track === 'ws' ? u.id === currentWS().id : u.idx === currentUnit().idx);
  const words = unitWords(u); const learned = words.filter(w => (U.srs[wid(u, w)]?.box || 0) >= 4).length;
  return `<a class="unit${open ? '' : ' locked'}${cur ? ' current' : ''}" href="${open ? '#unit/' + u.id : 'javascript:void 0'}" ${open ? '' : `onclick="toast('این درس بعد از قبولی در درس قبل (نمرهٔ ${faNum(G.settings.passScore)} به بالا) باز می‌شود.')"`}>
    <span class="badge">${m ? '<span class="pill ok">قبول ✓</span>' : open ? (cur ? '<span class="pill acc">درس فعلی</span>' : '') : '🔒'}</span>
    <span class="tile" style="--h:${u.hue}">${esc(u.icon)}</span><b>${u.track === 'ws' ? faNum(u.wsi + 1) + '. ' : u.idx < 1000 ? faNum(u.idx + 1) + '. ' : ''}${esc(u.fa)}</b><span class="en">${esc(u.en)}</span>
    <div class="bar mark"><i style="width:${words.length ? Math.round(learned / words.length * 100) : 0}%"></i></div></a>`;
}
function taskDone(t) {
  const cur = currentUnit(); const st = unitState(cur);
  if (t.k === 'cards') return dueIds().length === 0;
  if (t.k === 'min') return (U.log[isoDay()]?.min || 0) >= (U.plan?.minutes || 30);
  if (t.k?.startsWith('step:')) { const [, uidp, s] = t.k.split(':'); return !!U.units[uidp]?.steps?.[s]; }
  if (t.k?.startsWith('exam:')) return !!U.units[t.k.split(':')[1]]?.mastered;
  return false;
}

/* ───────── صفحهٔ درس ───────── */
const STEPS = [
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
  <div class="hero"><span class="tile" style="--h:${u.hue}">${esc(u.icon)}</span><div class="grow"><div class="small muted">${esc(u.levelFa || 'درس من')} ${u.track === 'ws' ? '· سرفصل ' + faNum(u.wsi + 1) : u.idx < 1000 ? '· درس ' + faNum(u.idx + 1) : ''}</div><b style="font-size:20px">${esc(u.fa)}</b> <span class="en muted">${esc(u.en)}</span>
  <div class="row small"><span class="pill">${faNum(words.length)} واژه</span>${st.mastered ? `<span class="pill ok">قبول با نمرهٔ ${faNum(st.best.exam)}</span>` : st.best.exam ? `<span class="pill bad">بهترین نمره: ${faNum(st.best.exam)}</span>` : ''}</div></div></div>
  <div class="card stack"><div class="small"><b>گرامر این درس:</b> ${esc(u.gram || '—')}</div><div class="small"><b>هدف گفتاری:</b> ${esc(u.talk || '—')}</div>
  <div id="why">${G.cache['why:' + u.id] ? `<div class="notice soft small">${esc(G.cache['why:' + u.id])}</div>` : `<button class="btn ghost sm" id="whyb">این درس به چه دردم می‌خورد؟</button>`}</div>
  <div id="ua"></div></div>
  ${!words.length ? `<div class="notice">لغات این سرفصل هنوز ساخته نشده. با یک دکمه هوش مصنوعی همهٔ واژه‌ها و افعال کاربردی‌اش را می‌سازد.</div>` : ''}
  <ul class="steps">${STEPS.map((s, i) => `<li><a class="step${st.steps[s.k] || (s.k === 'exam' && st.mastered) ? ' done' : ''}" href="#${s.k === 'words' ? 'unit/' + u.id + '/w' : s.k + '/' + u.id}"><span class="n">${st.steps[s.k] || (s.k === 'exam' && st.mastered) ? '✓' : faNum(i + 1)}</span><span class="grow"><b>${s.ic} ${s.fa}</b><br><span class="small muted">${s.d}</span></span></a></li>`).join('')}</ul>
  <div class="sec">واژه‌ها و افعال <small>${faNum(words.length)} مورد</small><span class="grow"></span><button class="btn ghost sm" id="more">${words.length ? '+ تکمیل لغات با هوش مصنوعی' : 'ساخت لغات این درس'}</button></div>
  <div class="row"><button class="btn sm" id="playall">${I.spk} پخش همه</button><span class="small muted">رنگ نقطه: نارنجی = تازه، فیروزه‌ای = در حال تثبیت، سبز = تثبیت‌شده</span></div>
  <div class="words" id="wl">${words.map(w => wordRow(u, w)).join('')}</div></div>`;
  bindWordRows(u); autoImages(view());
  $('#whyb') && ($('#whyb').onclick = async () => { if (needAI($('#why'))) return; $('#why').innerHTML = loading(); try { const r = await ai({ system: 'You are a motivating Persian-speaking English teacher.', messages: [{ role: 'user', content: `${learnerContext(u)}\n\nIn Persian, in 3 short sentences, tell this learner why the unit "${u.en}" (grammar: ${u.gram}) is useful for their real life in Oman and how it moves them toward fluent speaking. JSON {"why":"..."}` }] }); G.cache['why:' + u.id] = r.why; saveG('cache'); $('#why').innerHTML = `<div class="notice soft small">${esc(r.why)}</div>`; say(r.why, 'fa', 'encouraging'); } catch (e) { aiErr(e); $('#why').innerHTML = ''; } });
  $('#more').onclick = () => expandWords(u);
  $('#playall').onclick = async e => { const tok = speakToken + 1; for (const w of words) { await say(w.w, 'en', 'calm'); if (speakToken !== tok) break; await sleep(350); } };
  idb.get('unitaudio:' + u.id).then(b => { $('#ua').innerHTML = `${b ? `<audio controls src="${URL.createObjectURL(b)}" style="width:100%"></audio>` : ''}<label class="btn line sm" style="margin-top:6px">${b ? 'جایگزینی' : 'افزودن'} فایل صوتی درس (مثلاً از NotebookLM)<input type="file" accept="audio/*" hidden id="uaf"></label>`; $('#uaf').onchange = async e => { const f = e.target.files[0]; if (f) { await idb.set('unitaudio:' + u.id, f); routes.unit(id); } }; });
  if (sub === 'w') { markStep(u, 'words'); setTimeout(() => $('#wl')?.scrollIntoView({ behavior: 'smooth' }), 100); }
};
function wordRow(u, w) {
  const s = U.srs[wid(u, w)]; return `<div class="word" data-w="${esc(w.w)}">${picHTML(u, w)}<div class="t"><b>${esc(w.w)}</b><span class="ipa">/${esc(w.ipa || '')}/</span><span>${esc(w.fa)} <span class="pill">${POS[w.pos] || ''}</span></span><span class="en small muted" style="text-align:right">${esc(w.ex || '')}</span></div>
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
  const bg = sheet(loading('هوش مصنوعی در حال ساخت فهرست کامل واژه‌ها و افعال کاربردی است…'));
  try {
    const r = await ai({ max: 6000, temp: 0.4, system: 'You are an expert ESL syllabus designer for Persian speakers. Accuracy is critical: correct IPA (General American), correct and natural Persian meanings, natural example sentences.', messages: [{ role: 'user', content: `Unit topic: "${u.en}" (${u.fa}), level ${u.levelFa || 'any'}, grammar focus: ${u.gram}.\nAlready included: ${have.join(', ') || 'none'}.\nGive the remaining MOST USEFUL everyday words for this topic so the learner can talk about it fluently: nouns, VERBS, adjectives, and common phrases/collocations (aim for 25-35 new items, no duplicates, no rare words). JSON {"words":[{"w":"","ipa":"without slashes","fa":"Persian meaning","img":"one emoji","pos":"n|v|adj|adv|prep|phr","ex":"short natural example sentence"}]}` }] });
    const list = (r.words || []).filter(w => w.w && w.fa); const ex = G.extra[u.id] || (G.extra[u.id] = { words: [] });
    const seen = new Set(have.map(x => x.toLowerCase())); list.forEach(w => { if (!seen.has(w.w.toLowerCase())) { ex.words.push(w); seen.add(w.w.toLowerCase()); } });
    saveG('extra'); bg.remove(); toast(`${faNum(list.length)} واژهٔ تازه اضافه شد.`); routes.unit(u.id);
  } catch (e) { bg.remove(); aiErr(e); }
}
function imageSheet(u, w) {
  const k = wid(u, w);
  const bg = sheet(`<div class="stack"><b>تصویر «${esc(w.w)}»</b><div class="row" style="justify-content:center">${picHTML(u, w, true).replace('class="pic big"', 'class="pic" style="width:180px;height:180px;font-size:80px;--h:' + u.hue + '"')}</div>
  <div class="grid2"><button class="btn ghost" id="i1">تصویرسازی تازه با AI</button><button class="btn ghost" id="i2">عکس رایگان واقعی</button><label class="btn ghost">تصویر از گوشی/کامپیوتر<input type="file" accept="image/*" hidden id="i3"></label><button class="btn line" id="i4">فقط ایموجی</button></div><span class="tiny muted">عکس‌های واقعی از Openverse/Pixabay با مجوز آزادند؛ تصویرسازی با Pollinations رایگان است.</span></div>`);
  const set = url => { if (url) G.img[k] = url; else delete G.img[k]; saveG('img'); bg.remove(); routes.unit(u.id); };
  $('#i1', bg).onclick = () => set(aiImageUrl(u, w).replace(/seed=\d+/, 'seed=' + Math.floor(Math.random() * 99999)));
  $('#i2', bg).onclick = async () => { try { const url = await photoUrl(u, w); url ? set(url) : toast('عکسی پیدا نشد.'); } catch { toast('اتصال به منبع عکس ممکن نشد.'); } };
  $('#i3', bg).onchange = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = 256; c.width = c.height = s; const g = c.getContext('2d'); const m = Math.min(img.width, img.height); g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); set(c.toDataURL('image/jpeg', 0.8)); }; img.src = URL.createObjectURL(f); };
  $('#i4', bg).onclick = () => set(null);
}
async function askWord(u, w) {
  const bg = sheet(`<div class="stack"><div class="row">${picHTML(u, w)}<div class="grow"><b class="en" style="font-size:22px">${esc(w.w)}</b><div class="en muted">/${esc(w.ipa)}/</div><div>${esc(w.fa)}</div></div><button class="icon-btn" id="sp">${I.spk}</button></div><div id="aw">${loading()}</div><div class="card stack"><b>تلفظ‌سنج</b><span class="small muted">دکمهٔ میکروفون را بزن و واژه را بگو.</span><div class="row" id="pr"></div></div></div>`);
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
    if (i >= deck.length) { if (cur) markStep(cur, 'cards'); view().innerHTML = `<div class="card stack" style="text-align:center"><div class="big-ic">${right / deck.length > .8 ? '🌟' : '💪'}</div><b>${faNum(right)} از ${faNum(deck.length)} را به یاد آوردی.</b><span class="muted small">واژه‌هایی که یادت نبود، فردا دوباره می‌آیند؛ آن‌هایی که بلد بودی، با فاصلهٔ بیشتر.</span><div class="row" style="justify-content:center"><a class="btn" href="${cur ? '#unit/' + cur.id : '#home'}">بازگشت</a><button class="btn ghost" onclick="routes.cards('${id}')">یک دور دیگر</button></div></div>`; return; }
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
      if (ok) { score++; addXP(5); } grade(wid(q.u, q.w), ok); say(q.w.w, 'en', 'calm'); setTimeout(() => { i++; draw(); }, ok ? 800 : 1700);
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
const TEACHER_STYLE = () => `You are ${G.settings.teacher}, a warm, witty, emotionally expressive Iranian English teacher who talks like a real human (not a robot): you laugh, you get excited about progress, you show gentle disappointment when the learner forgets something they should know ("I didn't expect you to forget X from the family lesson!"), you encourage and you celebrate. You speak natural, fluent, conversational Tehrani Persian; English only for the English examples. Keep every turn short (max ~80 words) and always end with ONE small question or task for the learner, then wait. Use the learner profile: recycle words from earlier units, re-teach forgotten ones, refer back to past mistakes, praise fast progress and mention the predicted date for fluent speaking when it motivates. Accent for English examples: ${G.settings.accent === 'UK' ? 'British' : 'American'}.`;

/* معلم صوتی */
routes.teach = id => {
  const u = unitById(id); setTop('کلاس · ' + u.fa, true); const v = view(); if (needAI(v)) return;
  const words = unitWords(u).map(w => `${w.w} (${w.fa})`).join(', ');
  const c = convo(v, {
    key: 'teach:' + u.id, speakLang: 'fa', micLang: 'fa-IR', placeholder: 'به فارسی یا انگلیسی جواب بده…',
    intro: 'Start the lesson: greet me by name, tell me in one or two sentences why this unit matters for my life in Oman, then begin teaching step 1.',
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
    system: () => `You are a friendly English conversation partner for a Persian-speaking learner (level ${u.levelFa}). Topic: "${u.en}". Use and recycle these unit words: ${unitWords(u).map(w => w.w).join(', ')}. Use the grammar: ${u.gram}. Speak simple natural English suited to the level, max 45 words, always ask a follow-up question. If the learner writes Persian, help them say it in English.
${learnerContext(u)}
JSON {"reply":"your English reply","fa":"Persian translation of your reply","fixes":[{"wrong":"exact wrong part from learner","right":"natural correct version","why":"short Persian explanation"}],"emotion":"cheerful|calm|excited|encouraging|empathetic|surprised","memory":"durable fact about learner or empty"}`,
    parse: r => ({ show: r.reply, fa: r.fa, lang: 'en', fixes: r.fixes, after: () => { if (c.hist.filter(m => m.role === 'user').length >= 8) markStep(u, 'talk'); } })
  });
};

/* گپ آزاد */
routes.chat = () => {
  setTop('گپ آزاد'); const v = view();
  v.innerHTML = `<div class="stack"><div class="tools">
    <a class="tool" href="#talkfree"><span class="ic">💬</span><b>گپ آزاد</b><span>دربارهٔ هر موضوعی حرف بزن؛ اشتباه‌ها همان لحظه به فارسی گفته می‌شوند.</span></a>
    <a class="tool" href="#role"><span class="ic">🎭</span><b>نقش‌آفرینی در عمان</b><span>تاکسی مسقط، داروخانه، مصاحبه، صاحبخانه… با نمره و جملهٔ بهتر.</span></a>
    <a class="tool" href="#teach/${currentUnit().id}"><span class="ic">👩‍🏫</span><b>کلاس با ${esc(G.settings.teacher)}</b><span>ادامهٔ درس فعلی با معلم صوتی.</span></a>
    <a class="tool" href="#exam/${currentUnit().id}"><span class="ic">🎙️</span><b>آزمون شفاهی درس</b><span>سؤال‌ها یکی‌یکی پرسیده می‌شوند و آخرش نمره می‌گیری.</span></a></div></div>`;
};
routes.talkfree = () => {
  setTop('گپ آزاد', true); const v = view(); if (needAI(v)) return;
  convo(v, {
    key: 'free', intro: 'Greet me by name and start a natural conversation about my day or something from my memory profile.',
    extraTop: `<div class="notice soft small">دربارهٔ هر چیزی حرف بزن. اگر جایی گیر کردی، فارسی بنویس تا معادلش را یاد بگیری.</div>`,
    system: () => `You are a friendly, curious English conversation partner with real personality and emotions, chatting with a Persian-speaking learner who lives in Oman. Adapt your English to their level (current unit: ${currentUnit().en}). Weave in their weak words and words from units they have studied. Max 50 words per reply, end with a question.
${learnerContext()}
JSON {"reply":"","fa":"Persian translation","fixes":[{"wrong":"","right":"","why":"Persian"}],"emotion":"cheerful|calm|excited|encouraging|empathetic|surprised","memory":"durable fact or empty"}`,
    parse: r => ({ show: r.reply, fa: r.fa, lang: 'en', fixes: r.fixes })
  });
};

/* نقش‌آفرینی */
routes.role = id => {
  if (!id) { setTop('نقش‌آفرینی در عمان', true); view().innerHTML = `<div class="tools">${SCENARIOS.map(s => `<a class="tool" href="#role/${s.id}"><span class="ic">${s.icon}</span><b>${esc(s.fa)}</b>${U.convos['roleScore:' + s.id] ? `<span>بهترین نمره: ${faNum(U.convos['roleScore:' + s.id])}</span>` : '<span>شروع</span>'}</a>`).join('')}</div>`; return; }
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
    <div class="stack" id="ln">${d.lines.map((l, i) => `<div class="card stack" data-i="${i}"><div class="row"><span class="pill ${l.who === 'A' ? 'acc' : 'mark'}">${esc(l.name || l.who)}</span><span class="grow"></span><button class="icon-btn" data-p>${I.spk}</button><span data-m></span></div><div class="en" style="font-size:16px">${esc(l.en)}</div><div class="small muted">${esc(l.fa)}</div><div class="small" data-r></div></div>`).join('')}</div>
    ${d.phrases?.length ? `<div class="card stack"><b>عبارت‌های کلیدی برای حفظ</b>${d.phrases.map(p => `<div class="small"><span class="en"><b>${esc(p.en)}</b></span> — ${esc(p.fa)}</div>`).join('')}</div>` : ''}
    <div class="notice soft small">سایه‌خوانی: هر جمله را گوش بده، میکروفون را بزن و همان را تکرار کن. وقتی نصف جمله‌ها را با شباهت ۷۵٪ به بالا گفتی، این قدم کامل می‌شود.</div></div>`;
    let ok = new Set();
    $$('[data-i]', v).forEach(card => {
      const l = d.lines[+card.dataset.i]; card.querySelector('[data-p]').onclick = e => say(l.en, 'en', l.emotion || 'cheerful', e.currentTarget);
      card.querySelector('[data-m]').append(micButton(t => { const s = similarity(t, l.en); card.querySelector('[data-r]').innerHTML = `گفتی: <span class="en">${esc(t)}</span> · ${faNum(s)}٪ ${s >= 75 ? '✅' : '🔁'}`; if (s >= 75) { ok.add(card.dataset.i); addXP(3); if (ok.size >= Math.ceil(d.lines.length / 2)) markStep(u, 'dialog'); saveU(); } }));
    });
    $('#pa', v).onclick = async () => { const tok = speakToken + 1; for (const l of d.lines) { await say(l.en, 'en', l.emotion); if (speakToken !== tok) break; await sleep(300); } };
    $('#nw', v).onclick = () => { delete G.cache[key]; saveG('cache'); routes.dialog(id); };
  };
  if (G.cache[key]) return render(G.cache[key]);
  if (needAI(v)) return; v.innerHTML = loading('در حال نوشتن مکالمهٔ درس…');
  try {
    const prev = ALL_UNITS.filter(x => x.idx < u.idx).slice(-3).flatMap(x => pick(unitWords(x), 3).map(w => w.w));
    const r = await ai({ system: 'You write natural, realistic ESL dialogues for adults living in Oman. Correct, idiomatic English.', messages: [{ role: 'user', content: `Write a natural dialogue (10-12 lines) for unit "${u.en}", level ${u.levelFa}, practicing grammar "${u.gram}". Use many of these words: ${unitWords(u).map(w => w.w).join(', ')}. Also naturally reuse a few words from earlier units: ${prev.join(', ')}. Setting in everyday life in Oman. JSON {"title":"","setting":"Persian one line","lines":[{"who":"A|B","name":"","en":"","fa":"Persian translation","emotion":"cheerful|calm|surprised|excited|serious"}],"phrases":[{"en":"key useful phrase","fa":""}]}` }] });
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
    let qs; try { qs = (await ai({ system: 'You are an English speaking examiner for Persian speakers.', messages: [{ role: 'user', content: `Create 6 short spoken exam questions in English for unit "${u.en}" (level ${u.levelFa}) that require the learner to USE the grammar "${u.gram}" and the unit words (${unitWords(u).slice(0, 25).map(w => w.w).join(', ')}). Include 1 question that recycles a previous unit. JSON {"questions":[{"q":"","fa":"Persian translation"}]}` }] })).questions; } catch (e) { aiErr(e); return routes.exam(id); }
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
        const r = await ai({ temp: 0.2, system: 'You are a strict but fair English speaking examiner (CEFR-aligned) for Persian speakers. Score honestly; 95+ means near-perfect use of the unit grammar and vocabulary for this level.', messages: [{ role: 'user', content: `Unit "${u.en}" level ${u.levelFa}, grammar ${u.gram}.\n${ans.map((x, k) => `Q${k + 1}: ${x.q}\nA: ${x.a}`).join('\n')}\nJSON {"score":0-100,"summary":"Persian, human and emotional (praise or gentle push)","per":[{"q":"","feedback":"Persian","better":"model answer"}],"fixes":[{"wrong":"","right":"","why":"Persian"}],"memory":"durable fact about learner or empty"}` }] });
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
  const from = currentUnit().idx; const lastIdx = target === 'l1' ? ALL_UNITS.findLastIndex(u => u.level === 'l1') : ALL_UNITS.length - 1;
  const units = ALL_UNITS.slice(from, lastIdx + 1);
  const studyDays = []; for (let i = 0; i < days; i++) { const d = addDays(start, i); if (weekdayIdx(d) !== review) studyDays.push(d); }
  const per = Math.max(2, Math.floor(studyDays.length / Math.max(1, units.length)));
  const out = {}; let k = 0;
  const wsFrom = currentWS().wsi; const wsList = WS_UNITS.slice(wsFrom, target === 'l1' ? WS_UNITS.findIndex(u => u.level === 'wsi') : WS_UNITS.length);
  const wsPer = Math.max(2, Math.floor(studyDays.length / Math.max(1, wsList.length)));
  units.forEach((u, ui) => {
    for (let j = 0; j < per && k < studyDays.length; j++, k++) {
      const d = studyDays[k]; const phase = j / per; const t = [{ k: 'cards', t: 'مرور فلش‌کارت‌های موعددار (همراه درس‌های قبل)' }];
      if (j === 0) t.push({ k: `step:${u.id}:words`, t: `واژه‌های «${u.fa}»: دیدن و شنیدن` }, { k: `step:${u.id}:cards`, t: 'فلش‌کارت واژه‌های تازه' });
      else if (phase < .4) t.push({ k: `step:${u.id}:dialog`, t: 'مکالمهٔ درس و سایه‌خوانی' }, { k: `step:${u.id}:teach`, t: `کلاس گرامر با ${G.settings.teacher}` });
      else if (j < per - 1) t.push({ k: `step:${u.id}:talk`, t: 'صحبت دربارهٔ موضوع درس' }, { k: `step:${u.id}:quiz`, t: 'کوییز تمرینی' }, { k: 'role', t: 'یک نقش‌آفرینی عمان' });
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
routes.plan = (mOffset = '0') => {
  setTop('تقویم آموزشی'); const v = view(); const P = U.plan;
  if (!P) {
    v.innerHTML = `<div class="stack"><div class="card stack"><div class="big-ic">🗓️</div><b>برنامهٔ آموزشی شخصی‌ات را بسازیم</b><span class="small muted">برنامه بر اساس سطح فعلی، وقت روزانه و هدفت روی تقویم شمسی چیده می‌شود. هر روز دقیقاً می‌دانی چه کار کنی، و اگر عقب بیفتی برنامه خودش را به‌روز می‌کند.</span>
    <label class="f">هدف<select id="tg" class="in"><option value="l1">پایان مقدماتی و سطح ۱ (۲۰ درس) + واژگان موضوعی پایه</option><option value="l3">پایان سطح ۳ — متوسط (۳۸ درس) + همهٔ واژگان موضوعی</option></select></label>
    <div class="grid2"><label class="f">مدت (روز)<input id="dy" class="in" type="number" min="30" max="365" value="120"></label><label class="f">وقت روزانه (دقیقه)<input id="mn" class="in" type="number" min="15" max="240" value="60"></label></div>
    <div class="grid2"><label class="f">ساعت یادآور<input id="rm" class="in" type="time" value="20:00"></label><label class="f">روز مرور هفتگی<select id="rv" class="in">${['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map((d, i) => `<option value="${i}"${i === 6 ? ' selected' : ''}>${d}</option>`).join('')}</select></label></div>
    <div class="notice soft small" id="est"></div><button class="btn" id="mk">ساخت برنامه</button></div></div>`;
    const est = () => { const n = $('#tg').value === 'l1' ? ALL_UNITS.filter(u => u.level === 'intro' || u.level === 'l1').length - currentUnit().idx : ALL_UNITS.length - currentUnit().idx; const d = +$('#dy').value * 6 / 7; const per = d / Math.max(1, n); $('#est').textContent = `${faNum(Math.max(0, n))} درس در ${faNum(+$('#dy').value)} روز ≈ هر درس ${faNum(per.toFixed(1))} روز مطالعه. ${per < 3 ? 'این برنامه خیلی فشرده است؛ روزی حداقل ۹۰ دقیقه لازم داری.' : per < 5 ? 'برنامهٔ جدی ولی شدنی؛ روزی یک ساعت کافی است.' : 'برنامهٔ راحت و پایدار.'} رسیدن به سطح متوسط (B1) در ۴ ماه با مطالعهٔ منظم روزانه شدنی است؛ صحبت کاملاً روان معمولاً تمرین مکالمهٔ بیشتری بعد از آن می‌خواهد.`; };
    ['tg', 'dy'].forEach(i => $('#' + i).oninput = est); est();
    $('#mk').onclick = () => { U.plan = buildPlan({ days: +$('#dy').value, minutes: +$('#mn').value, target: $('#tg').value, reminder: $('#rm').value, review: +$('#rv').value }); saveU(); addXP(10); routes.plan(); };
    return;
  }
  // نمای ماه شمسی
  const off = +mOffset; let anchor = isoDay(); const jt = toJ(anchor);
  let first = addDays(anchor, -(jt.d - 1)); for (let i = 0; i < Math.abs(off); i++) first = off > 0 ? addDays(first, 32 - toJ(addDays(first, 31)).d + (toJ(addDays(first, 31)).d === 1 ? 0 : 0)) : addDays(first, -1);
  first = addDays(first, -(toJ(first).d - 1)); const jm = toJ(first); const cells = []; let d = first; while (toJ(d).m === jm.m) { cells.push(d); d = addDays(d, 1); }
  const status = day => { const p = P.days[day]; if (!p) return ''; if (day > isoDay()) return p.review ? 'rev' : ''; const L = U.log[day]; return L && L.min >= P.minutes * 0.5 ? 'done' : day < isoDay() ? 'miss' : ''; };
  const behind = Object.keys(P.days).filter(x => x < isoDay() && status(x) === 'miss').length;
  const planned = P.days[isoDay()]?.unit; const cu = currentUnit(); const planIdx = planned ? unitById(planned).idx : cu.idx; const gap = planIdx - cu.idx;
  v.innerHTML = `<div class="stack">
  <div class="card stack"><div class="row"><b class="grow">هدف: ${P.target === 'l1' ? 'پایان سطح ۱' : 'پایان سطح متوسط'} تا ${jLabel(addDays(P.start, P.dayCount - 1), true)}</b><span class="pill">${faNum(P.minutes)} دقیقه در روز</span></div>
  <div class="small">${gap > 0 ? `<span class="pill bad">${faNum(gap)} درس عقب‌تر از برنامه</span>` : gap < 0 ? `<span class="pill ok">${faNum(-gap)} درس جلوتر از برنامه 👏</span>` : '<span class="pill ok">طبق برنامه</span>'} · روزهای ازدست‌رفته: ${faNum(behind)}</div>
  <div class="row"><button class="btn sm" id="upd">به‌روزرسانی برنامه از امروز</button><button class="btn ghost sm" id="aiu">تنظیم با هوش مصنوعی</button><button class="btn ghost sm" id="ics">افزودن یادآورها به تقویم گوشی</button><button class="btn ghost sm" id="ntf">اعلان در برنامه</button><button class="btn line sm" id="rst">برنامهٔ تازه</button></div><div id="aim"></div></div>
  <div class="card stack"><div class="row"><button class="icon-btn" onclick="routes.plan(${off - 1})">${I.back}</button><b class="grow" style="text-align:center">${J_MONTHS[jm.m - 1]} ${faNum(jm.y)}</b><button class="icon-btn" style="transform:scaleX(-1)" onclick="routes.plan(${off + 1})">${I.back}</button></div>
  <div class="cal">${J_WEEK.map(w => `<span class="h">${w}</span>`).join('')}${Array(weekdayIdx(first)).fill('<span class="d empty"></span>').join('')}${cells.map(c => { const p = P.days[c]; const u = p?.unit && unitById(p.unit); return `<button class="d ${status(c)} ${c === isoDay() ? 'today' : ''}" data-d="${c}"><span class="num">${faNum(toJ(c).d)}</span><span class="e">${p ? (p.review ? '🔁' : u?.icon || '') : ''}</span></button>`; }).join('')}</div>
  <div class="row tiny muted"><span class="pill ok">انجام شد</span><span class="pill bad">جا ماند</span><span class="pill acc">روز مرور</span></div></div>
  <div id="dd"></div></div>`;
  const showDay = day => { const p = P.days[day]; $$('.cal .d').forEach(b => b.classList.toggle('sel', b.dataset.d === day)); $('#dd').innerHTML = p ? `<div class="card stack"><b>${jLabel(day, true)}${p.unit ? ' · ' + esc(unitById(p.unit).fa) : ' · روز مرور'}</b><ul class="list">${p.tasks.map(t => `<li>${day === isoDay() && taskDone(t) ? '✅ ' : ''}${esc(t.t)}</li>`).join('')}</ul>${U.log[day] ? `<span class="small muted">مطالعه: ${faNum(Math.round(U.log[day].min))} دقیقه · ${faNum(U.log[day].xp)} امتیاز</span>` : ''}${day === isoDay() && p.unit ? `<a class="btn sm" href="#unit/${cu.id}">شروع کار امروز</a>` : ''}</div>` : '<div class="card small muted">برای این روز برنامه‌ای نیست.</div>'; };
  $$('.cal .d[data-d]').forEach(b => b.onclick = () => showDay(b.dataset.d)); showDay(isoDay());
  $('#upd').onclick = () => { const left = P.dayCount - Math.round((parseDay(isoDay()) - parseDay(P.start)) / DAY); U.plan = buildPlan({ ...P, start: isoDay(), days: Math.max(14, left) }); U.plan.dayCount = U.plan.days ? Object.keys(U.plan.days).length : left; saveU(); toast('برنامه از امروز و بر اساس پیشرفت واقعی‌ات دوباره چیده شد.'); routes.plan(); };
  $('#rst').onclick = () => { U.plan = null; saveU(); routes.plan(); };
  $('#aiu').onclick = async () => {
    if (needAI($('#aim'))) return; $('#aim').innerHTML = loading();
    try { const p = paceInfo(); const last14 = [...Array(14)].map((_, i) => addDays(isoDay(), -i)).map(d => `${d}:${Math.round(U.log[d]?.min || 0)}min`).join(', ');
      const r = await ai({ system: 'You are an expert language-learning coach. Be realistic, motivating and specific.', messages: [{ role: 'user', content: `${learnerContext()}\nPlan: target ${P.target === 'l1' ? 'finish Intro+Level1 (20 units)' : 'finish up to B1+ (38 units)'} by ${addDays(P.start, P.dayCount - 1)}, ${P.minutes} min/day. Behind by ${gap} units, missed days ${behind}. Last 14 days study: ${last14}. Exam scores: ${Object.entries(U.units).map(([k, x]) => k + ':' + (x.best?.exam || '-')).join(', ')}.\nAdjust the plan. JSON {"minutes":30-180,"days":remaining days to keep or extend (integer),"advice":"Persian, human, 4-6 sentences: praise or honest push, predicted date for fluent speaking at this pace, what to focus on","focus":["Persian short items"]}` }] });
      $('#aim').innerHTML = `<div class="notice soft small stack">${esc(r.advice)}${r.focus?.length ? `<ul class="list">${r.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}<button class="btn sm" id="apl">اعمال: ${faNum(r.minutes)} دقیقه در روز، ${faNum(r.days)} روز</button></div>`;
      say(r.advice, 'fa', gap > 0 ? 'encouraging' : 'proud');
      $('#apl').onclick = () => { U.plan = buildPlan({ ...P, start: isoDay(), days: clamp(+r.days || 90, 14, 365), minutes: clamp(+r.minutes || P.minutes, 15, 240) }); U.plan.dayCount = clamp(+r.days || 90, 14, 365); saveU(); routes.plan(); };
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
    lines.push('BEGIN:VEVENT', `UID:${ds}-${G.active}@zabandovom`, `DTSTAMP:${ds}T000000`, `DTSTART:${ds}T${hh}${mm}00`, `DURATION:PT${P.minutes}M`, `SUMMARY:زبان دوم — ${u ? 'درس ' + u.fa : 'روز مرور'}`, `DESCRIPTION:${desc}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:وقت انگلیسی!', 'TRIGGER:-PT0M', 'END:VALARM', 'END:VEVENT');
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
    ['howto', '🤔', '«چطور بگم؟»', 'جملهٔ فارسی بنویس؛ انگلیسی طبیعی در دو حالت رسمی و خودمانی بگیر.'],
    ['fix', '📝', 'اصلاح نوشته', 'متن انگلیسی‌ات با توضیح فارسی هر اشتباه اصلاح می‌شود.'],
    ['story', '📖', 'داستان با لغت‌های ضعیفم', 'داستانی کوتاه با همان واژه‌هایی که در فلش‌کارت یادت نمی‌ماند.'],
    ['mistakes', '🔍', 'تحلیل اشتباه‌هایم', 'الگوی اشتباه‌هایت را توضیح می‌دهد و تمرین تازه می‌دهد.'],
    ['photo', '📷', 'عکس بگیر، یاد بگیر', 'از هر چیزی دور و برت عکس بگیر؛ نامش را به انگلیسی یاد بگیر و به فلش‌کارت‌ها اضافه کن.'],
    ['shadow', '🎧', 'تلفظ‌سنج جمله', 'هر جمله‌ای بنویس، بشنو، تکرار کن و درصد شباهت بگیر.'],
    ['import', '📥', 'درس از کتاب خودم', 'لغت‌های هر درس کتابت را وارد کن یا با AI درس تازه بساز.'],
    ['role', '🎭', 'نقش‌آفرینی عمان', 'موقعیت‌های واقعی زندگی در عمان.']
  ];
  view().innerHTML = `<div class="tools">${T.map(([k, ic, t, d]) => `<a class="tool" href="#${k === 'role' ? 'role' : 'tool/' + k}"><span class="ic">${ic}</span><b>${t}</b><span>${d}</span></a>`).join('')}</div>`;
};
routes.tool = k => (TOOLS[k] || routes.tools)();
const TOOLS = {
  howto() {
    setTop('چطور بگم؟', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><textarea id="q" class="in" placeholder="مثلاً: می‌شه لطفاً کولر رو یه کم کم کنی؟"></textarea><div class="row"><button class="btn grow" id="go">بگو چطور بگم</button><span id="mc"></span></div></div><div id="out"></div></div>`;
    $('#mc').append(micButton(t => $('#q').value = t, 'fa-IR'));
    $('#go').onclick = async () => {
      const q = $('#q').value.trim(); if (!q) return; if (needAI($('#out'))) return; $('#out').innerHTML = loading();
      try { const r = await ai({ system: 'You are a native English speaker and expert translator for Persian speakers. Give natural, idiomatic English (not literal).', messages: [{ role: 'user', content: `Persian: "${q}"\nAccent/variety: ${G.settings.accent === 'UK' ? 'British' : 'American'}.\nJSON {"formal":"","informal":"","alternatives":["",""],"notes":"Persian: key words/grammar and why it's said this way"}` }] });
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
    try { const r = await ai({ system: 'You write short, funny, memorable graded-reader stories for adult Persian-speaking learners living in Oman.', messages: [{ role: 'user', content: `${learnerContext(cur)}\nWrite a vivid 150-220 word story at the learner's level using ALL these words (bold them with **): ${words.join(', ')}. Make it personal using their memory profile if possible. JSON {"title":"","story":"","translation":"Persian translation","questions":[{"q":"comprehension question in English","a":"answer"}],"used":[""]}` }] });
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
      try { const r = await ai({ images: [{ mime: 'image/jpeg', b64: url.split(',')[1] }], system: 'You are an English vocabulary teacher for Persian speakers.', messages: [{ role: 'user', content: `Identify 6-10 useful, clearly visible things/actions in this photo for an English learner at level ${currentUnit().levelFa}. JSON {"scene":"one Persian sentence","items":[{"w":"","ipa":"","fa":"","img":"emoji","pos":"n|v|adj|phr","ex":"example sentence about this photo"}]}` }] });
        const cu = U.custom.find(x => x.id === 'myphotos') || (U.custom.push({ id: 'myphotos', en: 'My Photos', fa: 'واژه‌های عکس‌هایم', icon: '📷', hue: 45, gram: '—', talk: 'دربارهٔ چیزهایی که در عکس‌ها دیدی حرف بزن.', words: [] }), U.custom[U.custom.length - 1]);
        $('#out').innerHTML = `<img src="${url}" style="border-radius:14px"><div class="notice soft small" style="margin-top:8px">${esc(r.scene)}</div><div class="words" style="margin-top:8px">${r.items.map(w => `<div class="word"><div class="pic">${esc(w.img)}</div><div class="t"><b>${esc(w.w)}</b><span class="ipa">/${esc(w.ipa)}/</span><span>${esc(w.fa)}</span><span class="en small muted">${esc(w.ex)}</span></div><button class="icon-btn" data-t="${esc(w.w)}">${I.spk}</button></div>`).join('')}</div><button class="btn wide" id="add" style="margin-top:8px">افزودن همه به فلش‌کارت‌ها</button>`;
        $$('[data-t]').forEach(b => b.onclick = () => say(b.dataset.t, 'en', 'calm', b));
        $('#add').onclick = () => { r.items.forEach(w => { if (!cu.words.some(x => x.w === w.w)) cu.words.push(w); U.srs['myphotos:' + w.w] = U.srs['myphotos:' + w.w] || { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; }); addXP(10); saveU(); toast('به درس «واژه‌های عکس‌هایم» اضافه شد.'); };
      } catch (e2) { aiErr(e2); }
    };
  },
  shadow() {
    setTop('تلفظ‌سنج جمله', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="card stack"><textarea id="q" class="in" dir="ltr">Could you turn on the air conditioner, please?</textarea><div class="row"><button class="btn" id="pl">${I.spk} بشنو</button><button class="btn ghost" id="sl">🐢 آهسته</button><span id="mc"></span></div><div id="r" class="small"></div></div></div>`;
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
      try { const r = await ai({ max: 6000, temp: 0.3, system: 'You are an accurate ESL lexicographer for Persian speakers.', messages: [{ role: 'user', content: `Complete each item (keep the learner's words exactly; use given Persian meanings if provided):\n${lines.join('\n')}\nJSON {"grammar":"likely grammar focus in Persian or —","talk":"speaking goal in Persian","icon":"emoji","words":[{"w":"","ipa":"","fa":"","img":"emoji","pos":"n|v|adj|adv|prep|phr","ex":""}]}` }] }); bg.remove(); save(fa, en, r.words, r.grammar, r.talk, r.icon); }
      catch (e) { bg.remove(); aiErr(e); }
    };
    $('#gen').onclick = async () => {
      const t = $('#tp').value.trim(); if (!t) return; if (needAI(v)) return; const bg = sheet(loading('در حال ساخت درس…'));
      try { const r = await ai({ max: 6000, temp: 0.4, system: 'You are an expert ESL syllabus designer for Persian speakers. Accuracy is critical.', messages: [{ role: 'user', content: `Create a complete unit for the topic "${t}" for a learner at ${currentUnit().levelFa} level living in Oman: 25-35 most useful words, verbs and phrases. JSON {"en":"","fa":"","icon":"emoji","grammar":"suitable grammar focus in Persian","talk":"speaking goal in Persian","words":[{"w":"","ipa":"","fa":"","img":"emoji","pos":"n|v|adj|adv|prep|phr","ex":""}]}` }] }); bg.remove(); save(r.fa || t, r.en || t, r.words, r.grammar, r.talk, r.icon); }
      catch (e) { bg.remove(); aiErr(e); }
    };
  }
};

/* ───────── من: آمار، حافظه، اشتباه‌ها ───────── */
routes.me = () => {
  setTop('من'); const p = paceInfo(); const last = [...Array(14)].map((_, i) => addDays(isoDay(), -13 + i)); const mx = Math.max(10, ...last.map(d => U.log[d]?.min || 0));
  view().innerHTML = `<div class="stack">
  <div class="card stack"><div class="row"><span class="avatar" style="width:48px;height:48px;font-size:26px">${esc(me().avatar)}</span><div class="grow"><b style="font-size:18px">${esc(me().name)}</b><div class="small muted">${rankOf(U.xp)} · ${faNum(U.xp)} امتیاز · سطح ورودی: ${esc(U.placement?.level || '—')}</div></div><a class="btn ghost sm" href="#users">کاربران</a></div>
  <div class="grid2 small"><span>درس‌های قبول: <b>${faNum(p.mastered)}</b></span><span>واژهٔ تثبیت‌شده: <b>${faNum(learnedCount())}</b></span><span>کل مطالعه: <b>${faNum(p.minutes)}</b> دقیقه</span><span>روزهای پیاپی: <b>${faNum(streakOf(U))}</b></span></div>
  <div><div class="small muted">دقیقه‌های مطالعه در ۱۴ روز اخیر</div><div style="display:flex;align-items:flex-end;gap:4px;height:70px">${last.map(d => `<div title="${jLabel(d)}: ${Math.round(U.log[d]?.min || 0)}" style="flex:1;background:${d === isoDay() ? 'var(--mark)' : 'var(--accent)'};opacity:${U.log[d]?.min ? 1 : .2};height:${Math.max(4, (U.log[d]?.min || 0) / mx * 100)}%;border-radius:4px 4px 0 0"></div>`).join('')}</div></div>
  <button class="btn ghost" id="coach">نظر معلم دربارهٔ پیشرفتم</button><div id="co"></div></div>
  <div class="card stack"><b>نشان‌ها</b><div class="row">${BADGES.map(b => `<span class="pill ${U.badges.includes(b.id) ? 'mark' : ''}" style="${U.badges.includes(b.id) ? '' : 'opacity:.5'}">${b.ic} ${b.fa}</span>`).join('')}</div></div>
  <div class="card stack"><b>حافظهٔ معلم دربارهٔ من</b><span class="small muted">هوش مصنوعی این‌ها را از گفتگوها یاد گرفته و در همهٔ درس‌ها به کار می‌برد.</span>${U.mem.length ? U.mem.slice().reverse().map((m, i) => `<div class="row small"><span class="grow">• ${esc(m.t)}</span><button class="btn line sm" data-dm="${U.mem.length - 1 - i}">حذف</button></div>`).join('') : '<span class="small muted">هنوز چیزی ثبت نشده.</span>'}
  <div class="row"><input id="nm" class="in grow" placeholder="چیزی که معلم باید بداند (مثلاً: هدفم مصاحبهٔ کاری است)"><button class="btn sm" id="am">افزودن</button></div></div>
  <div class="card stack"><b>آخرین اشتباه‌ها</b>${U.mistakes.slice(-12).reverse().map(m => `<div class="small"><s class="en">${esc(m.wrong)}</s> ← <b class="en">${esc(m.right)}</b> <span class="muted">${esc(m.why)}</span></div>`).join('') || '<span class="small muted">فعلاً اشتباهی ثبت نشده.</span>'}<a class="btn ghost sm" href="#tool/mistakes">تحلیل و تمرین</a></div>
  <div class="card stack"><b>پشتیبان و انتقال</b><span class="small muted">برای بردن پیشرفت به گوشی یا کامپیوتر دیگر: پشتیبان بگیر و در دستگاه دیگر بازیابی کن.</span><div class="row"><button class="btn ghost sm" id="bk">گرفتن پشتیبان</button><label class="btn ghost sm">بازیابی<input type="file" hidden accept=".json" id="rs"></label><a class="btn ghost sm" href="#settings">تنظیمات</a></div></div></div>`;
  $$('[data-dm]').forEach(b => b.onclick = () => { U.mem.splice(+b.dataset.dm, 1); saveU(); routes.me(); });
  $('#am').onclick = () => { const t = $('#nm').value.trim(); if (t) { remember(t); routes.me(); } };
  $('#coach').onclick = async () => { if (needAI($('#co'))) return; $('#co').innerHTML = loading(); try { const r = await ai({ system: TEACHER_STYLE(), messages: [{ role: 'user', content: `${learnerContext()}\nGive me an honest, human progress review in Persian (5-7 sentences): what I mastered, what I keep forgetting, my learning speed, a realistic predicted date (Persian calendar wording is fine) for fluent everyday conversation at this pace, and one concrete challenge for this week. JSON {"say":"","emotion":"proud|encouraging|empathetic|excited"}` }] }); $('#co').innerHTML = `<div class="notice soft">${esc(r.say)}</div>`; say(r.say, 'fa', r.emotion); } catch (e) { $('#co').innerHTML = ''; aiErr(e); } };
  $('#bk').onclick = () => { const data = { v: 1, users: G.users, settings: { ...G.settings, prov: Object.fromEntries(Object.entries(G.settings.prov).map(([k, x]) => [k, { ...x, key: '' }])) }, extra: G.extra, cache: G.cache, img: G.img, u: Object.fromEntries(G.users.map(u => [u.id, userData(u.id)])) }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })); a.download = `zaban-dovom-backup-${isoDay()}.json`; document.body.append(a); a.click(); a.remove(); toast('پشتیبان ساخته شد (کلیدهای API داخلش نیست).'); };
  $('#rs').onchange = async e => { try { const d = JSON.parse(await e.target.files[0].text()); for (const [id, ud] of Object.entries(d.u || {})) lsSet('zd:u:' + id, ud); const ids = new Set(G.users.map(u => u.id)); (d.users || []).forEach(u => { if (!ids.has(u.id)) G.users.push(u); }); Object.assign(G.extra, d.extra || {}); Object.assign(G.cache, d.cache || {}); Object.assign(G.img, d.img || {}); ['users', 'extra', 'cache', 'img'].forEach(saveG); loadUser(G.active || G.users[0].id); toast('بازیابی شد.'); go('home'); } catch { toast('فایل پشتیبان معتبر نیست.'); } };
};

/* ───────── تنظیمات ───────── */
routes.settings = () => {
  setTop('تنظیمات', true); const S = G.settings;
  const seg = (id, opts, val) => `<div class="seg" data-seg="${id}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(val) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  view().innerHTML = `<div class="stack">
  <div class="card stack"><b>مغز هوش مصنوعی</b><span class="small muted">هر چند کلید که داری بگذار؛ برنامه از «مغز اصلی» استفاده می‌کند و اگر کلیدش نبود، سراغ بعدی می‌رود. کلیدها فقط روی همین دستگاه ذخیره می‌شوند.</span>
  <label class="f">مغز اصلی<select class="in" id="brain">${Object.entries(PROVIDERS).map(([k, p]) => `<option value="${k}"${S.brain === k ? ' selected' : ''}>${p.fa}</option>`).join('')}</select></label>
  ${Object.entries(PROVIDERS).map(([k, p]) => `<details class="card" style="box-shadow:inset 0 0 0 1px var(--line)"${S.prov[k].key ? ' open' : ''}><summary>${p.fa} ${S.prov[k].key ? '<span class="pill ok">فعال</span>' : ''}</summary><div class="stack" style="margin-top:8px">${p.keyUrl ? `<a class="small" href="${p.keyUrl}" target="_blank" rel="noopener">گرفتن کلید ↗</a>` : ''}<input class="in" dir="ltr" type="password" autocomplete="off" placeholder="API key" data-k="${k}" value="${esc(S.prov[k].key)}"><input class="in" dir="ltr" placeholder="model" data-m="${k}" value="${esc(S.prov[k].model)}">${k === 'custom' ? `<input class="in" dir="ltr" placeholder="https://…/v1" data-b="custom" value="${esc(S.prov.custom.base)}">` : ''}</div></details>`).join('')}
  <button class="btn ghost" id="test">آزمایش اتصال</button><div id="tr" class="small"></div></div>

  <div class="card stack"><b>صدا</b>
  <label class="f">لهجهٔ انگلیسی</label>${seg('accent', [['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']], S.accent)}
  <label class="f">صدای انگلیسی</label>${seg('voiceEn', [['browser', 'صدای دستگاه (سریع، رایگان)'], ['gemini', 'Gemini'], ['openai', 'OpenAI']], S.voiceEn)}
  <label class="f">صدای فارسی معلم (احساس‌دار)</label>${seg('voiceFa', [['gemini', 'Gemini (پیشنهادی)'], ['openai', 'OpenAI'], ['browser', 'صدای دستگاه']], S.voiceFa)}
  <div class="grid2"><label class="f">صدای Gemini<select class="in" id="gv">${['Kore', 'Aoede', 'Leda', 'Zephyr', 'Callirrhoe', 'Despina', 'Sulafat', 'Achernar', 'Puck', 'Charon', 'Fenrir', 'Orus'].map(x => `<option${S.geminiVoice === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label><label class="f">صدای OpenAI<select class="in" id="ov">${['nova', 'shimmer', 'coral', 'sage', 'alloy', 'ash', 'echo', 'fable', 'onyx'].map(x => `<option${S.openaiVoice === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label></div>
  <label class="f">سرعت صدای دستگاه: <span id="rv">${S.rate}</span><input type="range" min="0.6" max="1.2" step="0.05" value="${S.rate}" id="rate"></label>
  <label class="row small"><input type="checkbox" id="as"${S.autoSpeak ? ' checked' : ''}> پاسخ‌ها خودکار خوانده شوند</label>
  <div class="row"><button class="btn ghost sm" id="t1">آزمایش صدای انگلیسی</button><button class="btn ghost sm" id="t2">آزمایش صدای معلم</button></div><div class="small muted" id="vinfo"></div></div>

  <div class="card stack"><b>شنیدن صدای من</b>${seg('listen', [['browser', 'مرورگر (رایگان)'], ['groq', 'Groq Whisper (رایگان)'], ['gemini', 'Gemini'], ['openai', 'OpenAI']], S.listen)}<span class="tiny muted">اگر روی آیفون میکروفون کار نکرد، Groq را انتخاب کن.</span></div>

  <div class="card stack"><b>تصاویر واژه‌ها</b>${seg('img', [['ai', 'تصویرسازی AI'], ['photo', 'عکس رایگان واقعی'], ['emoji', 'فقط ایموجی (سریع‌ترین)']], S.img)}
  <input class="in" dir="ltr" id="pk" placeholder="Pixabay API key (اختیاری، برای عکس بهتر)" value="${esc(S.pixabayKey)}"><button class="btn line sm" id="ci">پاک کردن تصاویر ذخیره‌شده</button></div>

  <div class="card stack"><b>آموزش</b><div class="grid2"><label class="f">نام معلم<input class="in" id="tn" value="${esc(S.teacher)}"></label><label class="f">حد قبولی آزمون درس<input class="in" type="number" min="60" max="100" id="ps" value="${S.passScore}"></label></div>
  <label class="f">ظاهر</label>${seg('theme', [['auto', 'خودکار'], ['light', 'روشن'], ['dark', 'تیره']], S.theme)}</div>
  <button class="btn" id="sv">ذخیرهٔ تنظیمات</button></div>`;
  $$('[data-seg]').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', g).forEach(x => x.classList.remove('on')); b.classList.add('on'); S[g.dataset.seg] = b.dataset.v; if (g.dataset.seg === 'theme') applyTheme(); saveG('settings'); });
  const collect = () => { S.brain = $('#brain').value; $$('[data-k]').forEach(i => S.prov[i.dataset.k].key = i.value.trim()); $$('[data-m]').forEach(i => S.prov[i.dataset.m].model = i.value.trim()); S.prov.custom.base = $('[data-b]').value.trim(); S.geminiVoice = $('#gv').value; S.openaiVoice = $('#ov').value; S.rate = +$('#rate').value; S.autoSpeak = $('#as').checked; S.pixabayKey = $('#pk').value.trim(); S.teacher = $('#tn').value.trim() || 'سارا'; S.passScore = clamp(+$('#ps').value || 95, 60, 100); saveG('settings'); };
  $('#rate').oninput = e => $('#rv').textContent = e.target.value;
  $('#sv').onclick = () => { collect(); toast('ذخیره شد.'); };
  $('#test').onclick = async () => { collect(); $('#tr').innerHTML = loading('در حال آزمایش…'); try { const t0 = performance.now(); const r = await ai({ system: 'Reply briefly.', messages: [{ role: 'user', content: 'Say hello to a Persian learner in Persian. JSON {"hi":""}' }] }); $('#tr').innerHTML = `✅ وصل شد (${faNum(Math.round(performance.now() - t0))} میلی‌ثانیه): ${esc(r.hi)}`; } catch (e) { $('#tr').textContent = '❌ ' + (e.message === 'NOKEY' ? 'کلیدی وارد نشده' : e.message); } };
  $('#t1').onclick = e => { collect(); say('Hello! Nice to meet you. How are you today?', 'en', 'cheerful', e.currentTarget); };
  $('#t2').onclick = e => { collect(); say(`سلام ${me()?.name || ''} جان! من ${S.teacher} هستم. امروز می‌خوایم یاد بگیریم بگیم Nice to meet you. آماده‌ای؟`, 'fa', 'cheerful', e.currentTarget); };
  $('#ci').onclick = () => { G.img = {}; saveG('img'); toast('تصاویر پاک شد.'); };
  setTimeout(() => { loadVoices(); const en = bestVoice('en'), fa = bestVoice('fa'); $('#vinfo') && ($('#vinfo').textContent = `صدای انگلیسی دستگاه: ${en ? en.name : 'یافت نشد'} · صدای فارسی دستگاه: ${fa ? fa.name : 'ندارد (Gemini را انتخاب کن)'}`); }, 400);
};
function applyTheme() { const t = G.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; }

/* ───────── شروع ───────── */
applyTheme();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
