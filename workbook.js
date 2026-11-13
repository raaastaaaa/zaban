/* ───────── کتاب تمرین (Workbook) برای هر سطح و هر درس، در همهٔ زبان‌ها ─────────
   • برای هر درس ۶ بخش تمرین: انتخاب گزینه، جای خالی، ترجمه، تبدیل گرامری، مرتب‌کردن کلمات، پیدا کردن غلط
   • جواب درست ← سبز ✓ ؛ جواب غلط ← روی جواب خط قرمز کشیده می‌شود، جواب درست سبز زیرش نوشته می‌شود و ایرادش به فارسی توضیح داده می‌شود
   • جواب‌های هم‌معنا را معلم هوشمند قبول می‌کند؛ بدون اینترنت با فهرست جواب‌های درستِ همان تمرین مقایسه می‌شود */
const WB_TYPES = { choose: ['🔘', 'گزینهٔ درست'], fill: ['✏️', 'جای خالی'], translate: ['🔁', 'ترجمه'], transform: ['🔧', 'تبدیل جمله'], order: ['🧩', 'مرتب‌کردن کلمات'], error: ['🔍', 'پیدا کردن غلط'] };

function wbUnits() {
  if (tl() === 'en') return ALL_UNITS.map(u => ({ id: u.id, lvl: u.levelFa || u.level, cefr: u.cefr, fa: u.fa, en: u.en, gram: u.gram || '' }));
  return curUnits().map(a => ({ id: a[0], lvl: a[1], cefr: a[1], fa: a[2], en: a[3], gram: a[4] || '' }));
}
const wbKey = id => `${tl()}:${tl() === 'en' ? 'en' : tlDia()[2]}:${id}`;
const wbState = id => { U.wb = U.wb || {}; return U.wb[wbKey(id)] || (U.wb[wbKey(id)] = { ans: {}, res: {} }); };
const wbLangName = () => tl() === 'en' ? 'English' : tlDia()[0];

/* یکسان‌سازی برای مقایسه: حروف کوچک، بدون علائم، فاصلهٔ یکنواخت، بدون حرکات عربی، ی/ک یکسان */
function wbNorm(s) {
  return String(s || '').toLowerCase().normalize('NFKC')
    .replace(/[ً-ْٰـ]/g, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه')
    .replace(/[’‘`´]/g, "'").replace(/\b(i)'m\b/g, 'i am').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'s\b/g, ' is').replace(/'ll\b/g, ' will').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would')
    .replace(/[.,!?؟،؛:;"«»“”()\[\]{}…。，！？、\-–—_/\\]/g, ' ').replace(/\s+/g, ' ').trim();
}
const wbMatch = (user, answers) => { const u = wbNorm(user); return !!u && (answers || []).some(a => wbNorm(a) === u); };

async function wbLoad(u) {
  const key = 'wb:' + wbKey(u.id);
  const hit = await idb.get(key).catch(() => null); if (hit?.sections?.length) return hit;
  try { const r = await fetch(`lessons/wb/${tl() === 'en' ? 'en' : OFFLINE_DIR[tlDia()[2]] || 'x'}/${u.id}.json`); if (r.ok) { const j = await r.json(); if (j?.sections?.length) { idb.set(key, j).catch(() => { }); return j; } } } catch { }
  const LN = wbLangName();
  const r = await ai({ max: 6000, temp: 0.5, heavy: true,
    system: `You are an expert ${LN} teacher writing a printed WORKBOOK page for Persian-speaking learners. Exercises must test exactly this lesson at CEFR ${u.cefr || 'A1'}; every item must have one clear correct answer (list acceptable variants). Persian text must be natural Persian.`,
    messages: [{ role: 'user', content: `Lesson: "${u.en}" (${u.fa}). Grammar focus: ${u.gram || '—'}.
Write a workbook with exactly these 6 sections, 6 items each (36 items total), in ${LN}${tl() === 'ar' ? ' (Arabic script)' : tl() === 'zh' ? ' (simplified characters)' : ''}:
1. type "choose": q = sentence with ___ ; opts = 3 options; a = [the correct option]
2. type "fill": q = sentence with ___ (one word/short phrase missing); a = all acceptable fillers
3. type "translate": q = a short PERSIAN sentence; a = 2–4 acceptable ${LN} translations
4. type "transform": q = instruction in Persian + sentence (e.g. «منفی کن: ...»); a = acceptable results
5. type "order": q = the words of one sentence shuffled, separated by " / "; a = the correct sentence(s)
6. type "error": q = a sentence with exactly ONE typical Persian-learner mistake; a = corrected full sentence(s)
For every item also give why_fa: one short Persian sentence explaining the rule (shown when the learner is wrong).
JSON: {"sections":[{"type":"choose","title_fa":"…","instr_fa":"…","items":[{"q":"…","opts":["…","…","…"],"a":["…"],"why_fa":"…"}]}]}` }] });
  if (!r?.sections?.length) throw new Error('تمرین قابل خواندن نبود');
  r.sections.forEach(s => (s.items || []).forEach(it => { it.a = (Array.isArray(it.a) ? it.a : [it.a]).filter(Boolean).map(String); }));
  idb.set(key, r).catch(() => { }); return r;
}

/* بررسی هوشمند جواب‌هایی که با فهرست جواب‌ها جور نیستند (شاید هم‌معنا و درست باشند) */
async function wbJudge(list) {
  if (!list.length || !(hasAI() || firstKeyed())) return list.map(() => null);
  try {
    const r = await ai({ max: 2500, temp: 0.1, system: `You are a strict but fair ${wbLangName()} teacher grading a Persian speaker's workbook. Accept an answer if it is fully correct and natural for the task, even if worded differently from the key. Ignore capitalisation and final punctuation. Reject any grammar, spelling or word-choice mistake.`,
      messages: [{ role: 'user', content: `Grade each answer. For wrong ones give the corrected answer (closest to what the learner wrote) and a short Persian explanation of the mistake.
${JSON.stringify(list.map((x, i) => ({ i, task: x.type, question: x.q, key: x.a, learner: x.user })))}
JSON: {"r":[{"i":0,"ok":true|false,"fix":"…","why_fa":"…"}]}` }] });
    return list.map((_, i) => (r?.r || []).find(x => x.i === i) || null);
  } catch { return list.map(() => null); }
}

routes.wb = async (id) => {
  if (!id) return wbIndex();
  const u = wbUnits().find(x => x.id === id); if (!u) return go('wb');
  const all = wbUnits(); const n = all.indexOf(u) + 1;
  setTop(`کتاب تمرین · درس ${faNum(n)}`, true); const v = view(); v.innerHTML = loading('صفحهٔ کتاب تمرین را آماده می‌کنم…');
  let W; try { W = await wbLoad(u); } catch (e) { v.innerHTML = `<div class="card stack"><b>کتاب تمرین این درس هنوز آماده نیست.</b><span class="small muted">برای ساختنش اینترنت لازم است (یک بار؛ بعد آفلاین می‌ماند).</span><button class="btn" onclick="routes.wb('${esc(id)}')">دوباره</button></div>`; if (e) aiErr?.(e); return; }
  if (decodeURIComponent(location.hash.split('/')[1] || '') !== id) return;
  const S = wbState(id);
  const field = (si, ii, it, sec) => {
    const k = si + ':' + ii; const val = S.ans[k] ?? '';
    if (sec.type === 'choose') return `<div class="wb-opts" data-k="${k}">${(it.opts || []).map(o => `<button class="chip wb-opt en" data-k="${k}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    return `<div class="row wb-inrow" style="flex-wrap:nowrap"><input class="in wb-in en" dir="auto" data-k="${k}" value="${esc(val)}" placeholder="${sec.type === 'translate' ? 'ترجمه را بنویس…' : 'جوابت را بنویس…'}" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn sm" data-chk="${k}">بررسی</button></div>`;
  };
  v.innerHTML = `<div class="stack wb">
    <div class="today"><b style="font-size:18px">📘 کتاب تمرین — ${esc(u.fa)}</b><span class="small muted en keep-en">${esc(u.en)}</span><span class="small">${esc(u.lvl || '')} · ${faNum(W.sections.reduce((s, x) => s + (x.items || []).length, 0))} تمرین · درست = <b style="color:var(--ok)">سبز</b>، غلط = <s style="color:var(--bad,#c0392b)">خط‌خورده</s> + جواب درست</span><div class="wb-score" id="wbs"></div></div>
    ${W.sections.map((sec, si) => `<section class="card stack wb-sec"><div class="row" style="justify-content:space-between"><b>${(WB_TYPES[sec.type] || ['📝'])[0]} ${faNum(si + 1)}. ${esc(sec.title_fa || (WB_TYPES[sec.type] || [, 'تمرین'])[1])}</b></div>${sec.instr_fa ? `<span class="small muted">${esc(sec.instr_fa)}</span>` : ''}
      ${(sec.items || []).map((it, ii) => `<div class="wb-item" id="wb-${si}-${ii}"><div class="wb-q"><span class="wb-n">${faNum(ii + 1)}</span> <span class="${sec.type === 'translate' ? '' : 'en'}" dir="auto">${esc(it.q)}</span></div>${field(si, ii, it, sec)}<div class="wb-res" data-res="${si}:${ii}"></div></div>`).join('')}</section>`).join('')}
    <button class="btn wide" id="wball">✅ بررسی همهٔ جواب‌ها</button>
    <div class="row" style="justify-content:space-between">${n > 1 ? `<a class="btn ghost sm" href="#wb/${all[n - 2].id}">› درس قبل</a>` : '<span></span>'}<button class="btn line sm" id="wbreset">پاک کردن جواب‌ها</button>${all[n] ? `<a class="btn ghost sm" href="#wb/${all[n].id}">درس بعد ‹</a>` : '<span></span>'}</div></div>`;
  const item = k => { const [si, ii] = k.split(':').map(Number); return { sec: W.sections[si], it: W.sections[si].items[ii] }; };
  const show = k => {
    const box = v.querySelector(`[data-res="${k}"]`); const r = S.res[k]; const { sec, it } = item(k); if (!box) return;
    const wrap = box.closest('.wb-item'); wrap.classList.toggle('ok', r?.ok === true); wrap.classList.toggle('bad', r?.ok === false);
    if (sec.type === 'choose') v.querySelectorAll(`.wb-opt[data-k="${k}"]`).forEach(b => { b.classList.toggle('pick', b.dataset.v === S.ans[k]); b.classList.toggle('good', !!r && wbMatch(b.dataset.v, it.a)); b.classList.toggle('wrong', r?.ok === false && b.dataset.v === S.ans[k]); });
    if (!r) { box.innerHTML = ''; return; }
    if (r.ok) { box.innerHTML = `<div class="wb-ok">✓ درست است${r.alt ? ` <span class="small muted">(جواب کتاب: <span class="en">${esc(it.a[0])}</span>)</span>` : ''} <button class="icon-btn sm" data-say="${esc(sec.type === 'choose' || sec.type === 'fill' ? it.q.replace(/_{2,}/, S.ans[k]) : S.ans[k])}" aria-label="پخش">🔊</button></div>`; }
    else box.innerHTML = `<div class="wb-bad"><s class="en" dir="auto">${esc(S.ans[k] || '—')}</s></div><div class="wb-fix">✔ <b class="en" dir="auto">${esc(r.fix || it.a[0])}</b> <button class="icon-btn sm" data-say="${esc(r.fix || it.a[0])}" aria-label="پخش">🔊</button></div><div class="small wb-why">💡 ${esc(r.why || it.why_fa || '')}</div>`;
    score();
  };
  const score = () => { const ks = Object.keys(S.res).filter(k => S.res[k]); const ok = ks.filter(k => S.res[k].ok).length; const tot = W.sections.reduce((s, x) => s + (x.items || []).length, 0); $('#wbs').innerHTML = ks.length ? `<div class="fc-prog" style="margin-top:6px"><i style="width:${Math.round(ok / tot * 100)}%"></i></div><span class="small">${faNum(ok)} درست از ${faNum(tot)} · ${faNum(ks.length - ok)} غلط</span>` : ''; S.score = { ok, tot, at: isoDay() }; };
  const check = async (keys) => {
    const pending = [];
    for (const k of keys) { const { sec, it } = item(k); const val = (S.ans[k] || '').trim(); if (!val) continue;
      if (wbMatch(val, it.a)) S.res[k] = { ok: true }; else pending.push({ k, type: sec.type, q: it.q, a: it.a, user: val, why: it.why_fa }); }
    keys.forEach(k => show(k));
    if (pending.length) {
      pending.forEach(p => { const b = v.querySelector(`[data-res="${p.k}"]`); if (b) b.innerHTML = '<span class="small muted">⏳ معلم دارد جوابت را بررسی می‌کند…</span>'; });
      const J = await wbJudge(pending);
      pending.forEach((p, i) => { const j = J[i]; S.res[p.k] = j ? (j.ok ? { ok: true, alt: true } : { ok: false, fix: j.fix || p.a[0], why: j.why_fa || p.why }) : { ok: false, fix: p.a[0], why: p.why }; show(p.k); });
    }
    const gained = keys.filter(k => S.res[k]?.ok).length; if (gained) addXP(gained); saveU();
  };
  // رویدادها
  v.querySelectorAll('.wb-in').forEach(inp => { inp.oninput = () => { S.ans[inp.dataset.k] = inp.value; delete S.res[inp.dataset.k]; show(inp.dataset.k); saveU(); }; inp.onkeydown = e => { if (e.key === 'Enter') check([inp.dataset.k]); }; });
  v.querySelectorAll('[data-chk]').forEach(b => b.onclick = () => check([b.dataset.chk]));
  v.querySelectorAll('.wb-opt').forEach(b => b.onclick = () => { const k = b.dataset.k; if (S.res[k]) return; S.ans[k] = b.dataset.v; check([k]); });
  v.onclick = e => { const s = e.target.closest('[data-say]'); if (s) say(s.dataset.say, 'en', 'cheerful', s); };
  $('#wball').onclick = () => check(Object.keys(S.ans).filter(k => !S.res[k]));
  $('#wbreset').onclick = () => { U.wb[wbKey(id)] = { ans: {}, res: {} }; saveU(); routes.wb(id); };
  Object.keys(S.res).forEach(show); score();
};

function wbIndex() {
  setTop('کتاب تمرین', true); const v = view(); const all = wbUnits();
  const groups = []; all.forEach((u, i) => { const g = groups.find(x => x.lvl === u.lvl) || (groups.push({ lvl: u.lvl, us: [] }), groups[groups.length - 1]); g.us.push([u, i]); });
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">📘 کتاب تمرین ${esc(tl() === 'en' ? 'انگلیسی' : tlInfo().fa)}</b><span class="small muted">برای هر درس یک صفحه تمرین: گزینهٔ درست، جای خالی، ترجمه، تبدیل جمله، مرتب‌کردن و پیدا کردن غلط. جوابت را بنویس؛ درست سبز می‌شود و غلط خط می‌خورد و جواب درست با توضیح کنارش نوشته می‌شود.</span></div>
  ${groups.map(g => `<div class="sec">سطح ${esc(g.lvl)}</div><div class="stack">${g.us.map(([u, i]) => { const s = U.wb?.[wbKey(u.id)]?.score; return `<a class="card row" href="#wb/${esc(u.id)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="pill">${faNum(i + 1)}</span><span class="grow"><b>${esc(u.fa)}</b><br><span class="tiny muted en keep-en">${esc(u.en)}</span></span>${s ? `<span class="pill ${s.ok === s.tot ? 'ok' : ''}">${faNum(s.ok)}/${faNum(s.tot)}</span>` : '<span class="tiny muted">شروع ‹</span>'}</a>`; }).join('')}</div>`).join('')}</div>`;
}
