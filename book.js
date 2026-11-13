/* زبان رستا — صفحهٔ درس به شکل کتاب: منوی درس‌ها، ترجمه، صوت آفلاین (آمریکایی/بریتانیایی)، دیکشنری روی هر کلمه و آموزش کامل به فارسی */
'use strict';
const unitSteps = routes.unit;
const BSEC = { conv: ['💬', 'مکالمه', 'Conversation'], read: ['📖', 'متن خواندنی', 'Reading'], gram: ['📐', 'گرامر', 'Grammar'], words: ['🗂️', 'واژه‌ها', 'Words'], phr: ['📒', 'همهٔ عبارت‌ها (رسمی تا عامیانه)', 'Phrasebook'] };
routes.unit = (id, sub) => !sub ? routes.book(id) : BSEC[sub] ? routes.book(id, sub) : unitSteps(id, sub === 'steps' ? undefined : sub);
const bookTr = () => lsGet('zd:bookTr', true);
const teachUrl = id => `audio/teach/${G.settings.accent === 'UK' ? 'UK' : 'US'}/${id}.mp3`;
const twWrap = s => esc(s).split(/(&[a-z#0-9]+;)/).map(p => p[0] === '&' ? p : p.replace(/([A-Za-z][A-Za-z'’-]*)/g, '<span class="tw">$1</span>')).join('');
let PRON = null; const pronLoad = () => PRON || (PRON = fetch('audio/pron.json').then(r => r.json()).catch(() => (PRON = null, {})));
const PRON_LV = {}; const pronLevel = async lv => { const P = await pronLoad(); if (!lv || !/^ows/.test(lv)) return P; if (!PRON_LV[lv]) PRON_LV[lv] = fetch(`audio/pron-${lv}.json`).then(r => r.json()).then(j => { for (const a of ['US', 'UK']) Object.assign(P[a] = P[a] || {}, j[a] || {}); }).catch(() => delete PRON_LV[lv]); await PRON_LV[lv]; return P; };
const pronOf = (P, t) => (P?.[G.settings.accent === 'UK' ? 'UK' : 'US'] || {})[(t || '').trim()] || '';
const pronHTML = (P, t) => { const x = pronOf(P, t); return x ? `<p class="pron">🗣 ${G.settings.accent === 'UK' ? '🇬🇧' : '🇺🇸'} «${esc(x)}»</p>` : ''; };

/* پخش پیوسته با هایلایت و اسکرول خودکار؛ با رفتن به صفحهٔ دیگر هم ادامه می‌دهد */
const BGP = window.BGP = { on: false, lastTouch: 0,
  async start(items, title) {
    this.stop(); this.on = true; const me = this.run = {}; this.ui(title, true);
    for (let i = 0; i < items.length && this.on && this.run === me; i++) {
      const it = items[i]; $$('.reading-now').forEach(x => x.classList.remove('reading-now'));
      const el = it.k && document.querySelector(`[data-k="${it.k}"]`);
      if (el) { el.classList.add('reading-now'); if (Date.now() - this.lastTouch > 4000) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      const ok = await say(it.t, 'en', 'calm'); if (!ok || this.run !== me) break; await wait(450);
    }
    if (this.run === me) this.stop();
  },
  stop() { const was = this.on; this.on = false; this.run = null; $$('.reading-now').forEach(x => x.classList.remove('reading-now')); $('#bgp')?.remove(); if (was) stopSpeak(); $$('#mp').forEach(b => b.textContent = '▶'); },
  ui(title) { let b = $('#bgp'); if (!b) { b = document.createElement('div'); b.id = 'bgp'; document.body.appendChild(b); } b.innerHTML = `<span class="small grow">🔊 ${esc(title || 'در حال پخش')}</span><button class="btn sm" aria-label="توقف">⏹ توقف</button>`; b.querySelector('button').onclick = () => this.stop(); }
};
['touchstart', 'wheel'].forEach(ev => addEventListener(ev, () => BGP.lastTouch = Date.now(), { passive: true }));
const _libBook = routes.book; // کتاب‌های صوتی کتابخانه
routes.book = async (id, sec) => {
  if (!unitById(id) && typeof BOOKS !== 'undefined' && [...BOOKS, ...(typeof AR_BOOKS !== 'undefined' ? AR_BOOKS : [])].some(b => b.id === id)) return _libBook(id);
  const u = unitById(id); if (!u) return go('home'); if (!isOpen(u)) { toast('این درس هنوز قفل است.'); return go('home'); }
  const us = courseUnits(u.level); const n = us.indexOf(u) + 1; const lv = [...LEVELS, ...WORD_TRACK].find(l => l.id === u.level) || {};
  setTop(sec ? `${BSEC[sec][1]} · درس ${faNum(n)}` : `درس ${faNum(n)}`, true);
  const v = view(); v.innerHTML = loading('درس را باز می‌کنم…');
  let L = null; try { L = u.track === 'ws' ? null : await lessonGet(u); } catch { } const P = await pronLevel(u.level);
  if (decodeURIComponent(location.hash.split('/')[1] || '') !== id) return;
  if (sec === 'conv' && !L?.conversation?.lines?.length || sec === 'read' && !L?.reading?.en || sec === 'gram' && !L?.grammar || sec === 'phr' && !(L?.phrasebook || []).length) return go('unit/' + id);
  const words = unitWords(u); const conv = L?.conversation; const g = L?.grammar;
  const acc = G.settings.accent === 'UK' ? 'UK' : 'US';
  v.innerHTML = `<div class="book-bar" role="toolbar">
    <button data-b="menu" aria-label="فهرست درس‌ها">☰<small>درس‌ها</small></button>
    <button data-b="words" aria-label="واژه‌ها"><b class="en">W</b><small>واژه‌ها</small></button>
    <button data-b="tr" class="${bookTr() ? 'on' : ''}" aria-label="ترجمه"><b>文A</b><small>ترجمه</small></button>
    <button data-b="pron" class="${lsGet('zd:showPron', true) ? 'on' : ''}" aria-label="تلفظ فارسی"><b>🗣</b><small>تلفظ</small></button>
    <button data-b="audio" aria-label="صوت"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg><small>صوت</small></button>
    <button data-b="more" aria-label="منو">⋮<small>بیشتر</small></button></div>
  <button class="mini-play" id="mp" aria-label="پخش مکالمه">▶</button>
  <article class="book${bookTr() ? ' tr' : ''}" id="bk">
    <div class="bk-head"><span class="small muted">${esc((COVER[u.level] || [])[2] || lv.fa || '')}</span>
      <div class="seg acc-seg" role="group" aria-label="لهجه">${[['US', '🇺🇸 لهجهٔ آمریکایی'], ['UK', '🇬🇧 لهجهٔ بریتانیایی']].map(([k, t]) => `<button data-acc="${k}" class="${acc === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <h2 class="en">Unit ${n}</h2><div class="bk-title en">${esc(u.en)}</div><div class="fa-tr">${esc(u.fa)}</div></div>
    ${!sec ? `<button class="btn wide teach-cta" data-b="teach">👩‍🏫 آموزش کامل این درس به فارسی<small>مکالمه، ترجمهٔ خط‌به‌خط، گرامر و واژه‌ها — صوتی و آفلاین</small></button>
    <div class="sec-grid">${Object.entries(BSEC).filter(([k]) => ({ conv: conv?.lines?.length, read: L?.reading?.en, gram: g, words: words.length, phr: (L?.phrasebook || []).length })[k]).map(([k, [ic, fa, en]], i) => `<a class="sec-tile" href="#unit/${u.id}/${k}"><span class="st-n">${faNum(i + 1)}</span><span class="st-ic">${ic}</span><b>${fa}</b><span class="en tiny muted">${en}</span></a>`).join('')}
      <a class="sec-tile" href="#unit/${u.id}/steps"><span class="st-ic">✍️</span><b>تمرین، فلش‌کارت و آزمون</b><span class="en tiny muted">Practice</span></a><a class="sec-tile" href="#story/${u.id}"><span class="st-ic">🎧</span><b>داستان صوتی</b><span class="en tiny muted">Audio story</span></a><a class="sec-tile" href="#wb/${u.id}"><span class="st-ic">📘</span><b>کتاب تمرین</b><span class="en tiny muted">Workbook</span></a></div>
    <div class="row" style="justify-content:space-between">${n > 1 ? `<a class="btn ghost sm" href="#unit/${us[n - 2].id}">› درس قبل</a>` : '<span></span>'}${us[n] && isOpen(us[n]) ? `<a class="btn ghost sm" href="#unit/${us[n].id}">درس بعد ‹</a>` : ''}</div>` : ''}
    ${sec === 'conv' ? `<section><div class="bk-chip en">Conversation</div>${conv.title ? `<b class="en">${esc(conv.title)}</b>` : ''}${conv.setting ? `<div class="small muted">${esc(conv.setting)}</div>` : ''}
      <div class="bk-lines">${conv.lines.map((l, i) => `<div class="bk-line" data-i="${i}" data-k="c${i}"><button class="icon-btn" data-play="${esc(l.en)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en"><span class="who">${esc(l.who || '')}:</span> ${twWrap(l.en)}</p>${pronHTML(P, l.en)}<p class="fa-tr">${esc(l.fa || '')}</p></div></div>`).join('')}</div></section>` : ''}
    ${sec === 'read' ? `<section><div class="bk-chip en">Reading</div>${L.reading.title ? `<b class="en">${esc(L.reading.title)}</b>` : ''}<p class="en bk-p">${twWrap(L.reading.en)} <button class="icon-btn" data-play="${esc(L.reading.en)}" aria-label="پخش">${I.spk}</button></p>${(() => { const ps = (L.reading.en.match(/[^.!?]+[.!?]+/g) || []).map(x => pronOf(P, x.trim())).filter(Boolean); return ps.length ? `<p class="pron">🗣 ${G.settings.accent === 'UK' ? '🇬🇧' : '🇺🇸'} «${esc(ps.join(' '))}»</p>` : ''; })()}<p class="fa-tr">${esc(L.reading.fa || '')}</p></section>` : ''}
    ${sec === 'gram' ? `<section><div class="bk-chip en">Grammar</div><b class="en">${esc(g.title || '')}</b><p class="small">${esc(g.explain || '')}</p>
      ${(g.rules || []).map(r => `<div class="bk-rule"><span>${esc(r.fa || '')}</span><div class="en">${twWrap(r.en || '')}</div></div>`).join('')}
      ${(g.examples || []).map((x, gi) => `<div class="bk-line" data-k="g${gi}"><button class="icon-btn" data-play="${esc(x.en || x)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en">${twWrap(x.en || x)}</p>${pronHTML(P, x.en || x)}<p class="fa-tr">${esc(x.fa || '')}</p></div></div>`).join('')}
      ${(g.mistakes || []).length ? `<b class="small">اشتباه‌های رایج</b>${g.mistakes.map(m => `<div class="small"><s class="en">${esc(m.wrong || '')}</s> ← <b class="en">${esc(m.right || '')}</b><div class="muted">${esc(m.why || '')}</div></div>`).join('')}` : ''}</section>` : ''}
    ${sec === 'words' ? `<section id="bk-words"><div class="bk-chip en">Words</div><span class="small muted">روی هر کلمه بزن: معنی، مترادف، متضاد، جمله‌ها و افزودن به لایتنر.</span>
      ${words.map((w, wi) => `<div class="bk-line" data-k="w${wi}"><button class="icon-btn" data-play="${esc(w.w)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en"><b class="tw">${esc(w.w)}</b> <span class="muted small">${w.ipa ? '/' + esc(w.ipa) + '/' : ''}</span> ${w.reg && window.regPill ? regPill(w) : ''}</p>${pronHTML(P, w.w)}<p class="fa-tr">${esc(w.fa || '')}</p>${w.use ? `<p class="small muted">🧭 ${esc(w.use)}</p>` : ''}${w.ex ? `<p class="en small" style="cursor:pointer" data-play="${esc(w.ex)}">${twWrap(w.ex)}</p>${pronHTML(P, w.ex)}${w.exFa ? `<p class="fa-tr small">${esc(w.exFa)}</p>` : ''}` : ''}</div><button class="icon-btn" data-lt="${esc(w.w)}" aria-label="افزودن به لایتنر" title="افزودن به لایتنر">＋</button></div>`).join('')}</section>` : ''}
    ${sec === 'phr' ? `<section><div class="bk-chip en">Phrasebook</div><div class="row" style="gap:6px">${[['all', 'همه'], ['formal', 'رسمی'], ['neutral', 'خنثی'], ['informal', 'خودمونی'], ['slang', 'عامیانه']].map(([k, t], i) => `<button class="btn sm${i ? ' ghost' : ''}" data-pb="${k}">${t}</button>`).join('')}</div>
      ${L.phrasebook.map(gr => `<b class="small" style="color:var(--accent);margin-top:6px">${esc(gr.group || '')}</b>${(gr.items || []).map((x, xi) => `<div class="bk-line pbi" data-k="p${esc(gr.group || '').length}-${xi}" data-reg="${esc(x.register || '')}"><button class="icon-btn" data-play="${esc(x.en)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en"><b>${twWrap(x.en)}</b> <span class="pill ${({ formal: 'acc', informal: 'ok', slang: 'bad' })[x.register] || ''}">${({ formal: 'رسمی', neutral: 'خنثی', informal: 'خودمونی', slang: 'عامیانه' })[x.register] || ''}</span></p>${pronHTML(P, x.en)}<p class="fa-tr">${esc(x.fa || '')}</p>${x.use ? `<p class="small muted">🧭 ${esc(x.use)}</p>` : ''}${x.ex ? `<p class="en small" data-play="${esc(x.ex)}" style="cursor:pointer">“${esc(x.ex)}”</p>` : ''}</div></div>`).join('')}`).join('')}</section>` : ''}
    ${sec ? (() => { const ks = Object.keys(BSEC).filter(k => ({ conv: conv?.lines?.length, read: L?.reading?.en, gram: g, words: words.length, phr: (L?.phrasebook || []).length })[k]); const i = ks.indexOf(sec); return `<div class="row" style="justify-content:space-between"><a class="btn ghost sm" href="#unit/${u.id}">› فهرست این درس</a>${ks[i + 1] ? `<a class="btn sm" href="#unit/${u.id}/${ks[i + 1]}">${BSEC[ks[i + 1]][0]} ${BSEC[ks[i + 1]][1]} ‹</a>` : `<a class="btn sm" href="#unit/${u.id}/steps">✍️ تمرین ‹</a>`}</div>`; })() : ''}
  </article>`;
  const bk = $('#bk', v);
  const mp = $('#mp', v); if (BGP.on) mp.textContent = '⏸';
  mp.onclick = () => { if (BGP.on) return BGP.stop();
    const its = $$('[data-k]', v).filter(el => !el.hidden).map(el => ({ k: el.dataset.k, t: el.querySelector('[data-play]')?.dataset.play })).filter(x => x.t);
    const list = its.length ? its : (conv?.lines || []).map((l, i) => ({ k: 'c' + i, t: l.en }));
    mp.textContent = '⏸'; BGP.start(list, `درس ${faNum(n)} · ${sec ? BSEC[sec][1] : 'مکالمه'}`); };
  const playSeq = list => BGP.start(list.map(t => ({ t })), `درس ${faNum(n)}`);
  v.onclick = async e => {
    const tw = e.target.closest('.tw'); if (tw) return wordPanel(tw.textContent, tw.closest('p')?.textContent?.slice(0, 200));
    const lt = e.target.closest('[data-lt]'); if (lt) { const w = words.find(x => x.w === lt.dataset.lt); if (w) { const k = wid(u, w); if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; saveU(); window.LMAP = null; lt.textContent = '✓'; toast('به جعبهٔ لایتنر اضافه شد؛ به‌موقع یادآوری می‌شود.'); } return; }
    const ab = e.target.closest('[data-acc]'); if (ab) { G.settings.accent = ab.dataset.acc; saveG('settings'); stopSpeak(); $$('[data-acc]', v).forEach(x => x.classList.toggle('on', x === ab)); toast(ab.dataset.acc === 'UK' ? 'از این به بعد همهٔ صداها با لهجهٔ بریتانیایی' : 'از این به بعد همهٔ صداها با لهجهٔ آمریکایی'); $$('.pron', v).length && routes.book(id, sec); return say(conv?.lines?.[0]?.en || words[0]?.w || 'Hello!', 'en', 'calm'); }
    const pb = e.target.closest('[data-pb]'); if (pb) { $$('[data-pb]', v).forEach(b => b.classList.toggle('ghost', b !== pb)); $$('.pbi', v).forEach(r => r.hidden = pb.dataset.pb !== 'all' && r.dataset.reg !== pb.dataset.pb); return; }
    const p = e.target.closest('[data-play]'); if (p) return say(p.dataset.play, 'en', 'calm', p.classList.contains('icon-btn') ? p : null);
    const b = e.target.closest('[data-b]'); if (!b) return;
    const k = b.dataset.b;
    if (k === 'pron') { const on = !lsGet('zd:showPron', true); lsSet('zd:showPron', on); document.body.classList.toggle('nopron', !on); b.classList.toggle('on', on); toast(on ? 'تلفظ نیتیو به خط فارسی نمایش داده می‌شود' : 'تلفظ فارسی پنهان شد'); return; }
    if (k === 'tr') { const on = !bookTr(); lsSet('zd:bookTr', on); bk.classList.toggle('tr', on); b.classList.toggle('on', on); }
    else if (k === 'words') go('unit/' + u.id + '/words');
    else if (k === 'menu') { const bg = sheet(`<div class="stack"><div class="course-head">${courseCover(u.level, true)}</div><div class="lesson-list">${us.map((x, i) => `<a class="lrow${isOpen(x) ? '' : ' locked'}${x === u ? ' current' : ''}" href="${isOpen(x) ? '#unit/' + x.id : 'javascript:void 0'}"><span class="lr-ic" style="--h:${x.hue}">${esc(x.icon)}</span><div class="grow"><b>درس ${faNum(i + 1)}</b><div class="small">${esc(x.fa)}</div></div><span class="lr-st">${isMastered(x) ? '✓' : isOpen(x) ? '' : '🔒'}</span></a>`).join('')}</div><a class="btn ghost" href="#path">همهٔ دوره‌ها</a></div>`); bg.onclick = ev => { if (ev.target === bg || ev.target.closest('a')) bg.remove(); }; }
    else if (k === 'more') bookMenu(u, L, words, playSeq);
    else if (k === 'dl') { const bg = sheet(`<div class="stack"><b>⬇ دانلود صداهای درس</b><span class="small muted">همهٔ جمله‌ها و واژه‌ها با هر دو لهجه، و صوت آموزش فارسی؛ بعد بدون اینترنت پخش می‌شوند.</span><button class="btn" id="dl">شروع دانلود</button></div>`); $('#dl', bg).onclick = () => dlLesson(u, $('#dl', bg)); }
    else if (k === 'note') noteSheet(u);
    else if (k === 'audio' || k === 'teach') audioSheet(u, L, words, playSeq, k === 'teach');
  };
};

async function audioSheet(u, L, words, playSeq, teachNow) {
  const acc = G.settings.accent === 'UK' ? 'UK' : 'US';
  const has = await fetch(teachUrl(u.id), { method: 'HEAD' }).then(r => r.ok).catch(() => false) || !!(await caches.open('zd-media').then(c => c.match(teachUrl(u.id))).catch(() => null));
  const bg = sheet(`<div class="stack"><b>🎧 صوت درس</b>
    <div class="seg" id="acc2">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([k, t]) => `<button data-v="${k}" class="${acc === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    ${has ? `<div class="card stack" style="padding:12px"><b>👩‍🏫 آموزش کامل به فارسی</b><span class="small muted">معلم کل درس را توضیح می‌دهد: مکالمه، ترجمهٔ خط‌به‌خط، واژه‌ها، گرامر و تلفظ.</span><audio controls preload="none" src="${teachUrl(u.id)}" style="width:100%" id="tau"></audio></div>`
      : `<a class="btn" href="#lesson/${u.id}">👩‍🏫 کلاس درس با توضیح فارسی</a><span class="small muted">صوت آمادهٔ این درس به‌زودی اضافه می‌شود؛ فعلاً متن کلاس با پخش جمله‌به‌جمله در دسترس است.</span>`}
    ${L?.conversation?.lines?.length ? `<button class="btn ghost" id="pc">▶ پخش کل مکالمه</button>` : ''}
    <button class="btn ghost" id="pw">▶ پخش همهٔ واژه‌ها و مثال‌ها</button>
    <button class="btn line" id="dl">⬇ دانلود همهٔ صداهای این درس برای آفلاین (هر دو لهجه)</button></div>`);
  $('#acc2', bg).onclick = e => { const b = e.target.closest('button'); if (!b) return; G.settings.accent = b.dataset.v; saveG('settings'); bg.remove(); audioSheet(u, L, words, playSeq, false); routes.book(u.id); };
  if (teachNow && has) setTimeout(() => $('#tau', bg)?.play().catch(() => 0), 100);
  if (teachNow && !has) { bg.remove(); return go('lesson/' + u.id); }
  $('#pc', bg) && ($('#pc', bg).onclick = () => { bg.remove(); const its = L.conversation.lines.map((l, i) => ({ k: 'c' + i, t: l.en })); if (!/\/conv$/.test(location.hash)) { go('unit/' + u.id + '/conv'); setTimeout(() => BGP.start(its, 'مکالمه'), 1200); } else BGP.start(its, 'مکالمه'); });
  $('#pw', bg).onclick = () => { bg.remove(); const its = words.flatMap((w, i) => [{ k: 'w' + i, t: w.w }, w.ex && { k: 'w' + i, t: w.ex }].filter(Boolean)); if (!/\/words$/.test(location.hash)) { go('unit/' + u.id + '/words'); setTimeout(() => BGP.start(its, 'واژه‌ها'), 1200); } else BGP.start(its, 'واژه‌ها'); };
  $('#dl', bg).onclick = async () => {
    const b = $('#dl', bg); b.disabled = true;
    try { const c = await caches.open('zd-media'); for (const a of ['US', 'UK']) { const url = `audio/teach/${a}/${u.id}.mp3`; if (!(await c.match(url))) { const r = await fetch(url).catch(() => null); if (r?.ok) await c.put(url, r); } } } catch { }
    await downloadEnPack(u.id, b); b.disabled = false;
  };
}

async function dlLesson(u, b) {
  b.disabled = true;
  try { const c = await caches.open('zd-media'); for (const a of ['US', 'UK']) { const url = `audio/teach/${a}/${u.id}.mp3`; if (!(await c.match(url))) { const r = await fetch(url).catch(() => null); if (r?.ok) await c.put(url, r); } } } catch { }
  await downloadEnPack(u.id, b); b.disabled = false;
}
function noteSheet(u) {
  const N = U.notes || (U.notes = {}); const n = N[u.id] || { text: '', mark: false };
  const bg = sheet(`<div class="stack"><b>📝 یادداشت‌ها و نشانه‌ها</b><label class="row small"><input type="checkbox" id="nm" ${n.mark ? 'checked' : ''}> 🔖 این درس را نشانه‌گذاری کن</label>
    <textarea id="nt" rows="6" class="input" placeholder="یادداشت تو دربارهٔ این درس…">${esc(n.text)}</textarea><button class="btn" id="ns">ذخیره</button>
    ${Object.entries(N).filter(([k, x]) => x.mark || x.text).length ? `<div class="small muted">همهٔ یادداشت‌ها و نشانه‌ها:</div>${Object.entries(N).filter(([k, x]) => x.mark || x.text).map(([k, x]) => { const uu = unitById(k); return uu ? `<a class="btn ghost sm" style="justify-content:flex-start" href="#unit/${k}">${x.mark ? '🔖 ' : '📝 '}${esc(uu.fa)}${x.text ? ' — ' + esc(x.text.slice(0, 40)) : ''}</a>` : ''; }).join('')}` : ''}</div>`);
  $('#ns', bg).onclick = () => { N[u.id] = { text: $('#nt', bg).value.trim(), mark: $('#nm', bg).checked }; saveU(); toast('ذخیره شد.'); bg.remove(); };
  bg.onclick = e => { if (e.target === bg || e.target.closest('a')) bg.remove(); };
}
function bookMenu(u, L, words, playSeq) {
  $('.bk-menu')?.remove();
  const m = document.createElement('div'); m.className = 'bk-menu'; m.setAttribute('role', 'menu');
  const items = [['#live/lesson', '📞 کلاس زنده با معلم (صوتی)'], ['dl', '⬇ دانلود همهٔ فایل‌های صوتی درس'], ['audio', '▶ پخش صوتی (آمریکایی / بریتانیایی)'], ['teach', '👩‍🏫 آموزش کامل درس به فارسی'], ['#dict', '🔍 جستجو در دیکشنری'], ['note', '📝 یادداشت‌ها و نشانه‌ها'], ['#unit/' + u.id + '/steps', '✍️ تمرین‌ها، کوییز و آزمون'], ['#leitner', '🗃️ جعبهٔ لایتنر و کوییز از واژه‌هایم'], ['#settings', '⚙️ تنظیمات']];
  m.innerHTML = items.map(([k, t]) => k[0] === '#' ? `<a href="${k}" role="menuitem">${t}</a>` : `<button data-b="${k}" role="menuitem">${t}</button>`).join('');
  view().appendChild(m);
  const close = e => { if (!e.target.closest('[data-b="more"]')) { m.remove(); document.removeEventListener('click', close, true); } };
  setTimeout(() => document.addEventListener('click', close, true));
}
