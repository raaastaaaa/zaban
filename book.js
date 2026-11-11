/* زبان رستا — صفحهٔ درس به شکل کتاب: منوی درس‌ها، ترجمه، صوت آفلاین (آمریکایی/بریتانیایی)، دیکشنری روی هر کلمه و آموزش کامل به فارسی */
'use strict';
const unitSteps = routes.unit;
routes.unit = (id, sub) => sub ? unitSteps(id, sub === 'steps' ? undefined : sub) : routes.book(id);
const bookTr = () => lsGet('zd:bookTr', true);
const teachUrl = id => `audio/teach/${G.settings.accent === 'UK' ? 'UK' : 'US'}/${id}.mp3`;
const twWrap = s => esc(s).replace(/([A-Za-z][A-Za-z'’-]*)/g, '<span class="tw">$1</span>');

routes.book = async id => {
  const u = unitById(id); if (!u) return go('home'); if (!isOpen(u)) { toast('این درس هنوز قفل است.'); return go('home'); }
  const us = courseUnits(u.level); const n = us.indexOf(u) + 1; const lv = [...LEVELS, ...WORD_TRACK].find(l => l.id === u.level) || {};
  setTop(`درس ${faNum(n)}`, true);
  const v = view(); v.innerHTML = loading('درس را باز می‌کنم…');
  let L = null; try { L = await lessonGet(u); } catch { }
  if (location.hash.split('/')[1] !== id) return;
  const words = unitWords(u); const conv = L?.conversation; const g = L?.grammar;
  const acc = G.settings.accent === 'UK' ? 'UK' : 'US';
  v.innerHTML = `<div class="book-bar" role="toolbar">
    <button data-b="menu" aria-label="فهرست درس‌ها">☰<small>درس‌ها</small></button>
    <button data-b="words" aria-label="واژه‌ها"><b class="en">W</b><small>واژه‌ها</small></button>
    <button data-b="tr" class="${bookTr() ? 'on' : ''}" aria-label="ترجمه"><b>文A</b><small>ترجمه</small></button>
    <button data-b="audio" aria-label="صوت"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg><small>صوت</small></button>
    <button data-b="more" aria-label="منو">⋮<small>بیشتر</small></button></div>
  <button class="mini-play" id="mp" aria-label="پخش مکالمه">▶</button>
  <article class="book${bookTr() ? ' tr' : ''}" id="bk">
    <div class="bk-head"><span class="small muted">${esc((COVER[u.level] || [])[2] || lv.fa || '')}</span>
      <div class="seg acc-seg" role="group" aria-label="لهجه">${[['US', '🇺🇸 لهجهٔ آمریکایی'], ['UK', '🇬🇧 لهجهٔ بریتانیایی']].map(([k, t]) => `<button data-acc="${k}" class="${acc === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <h2 class="en">Unit ${n}</h2><div class="bk-title en">${esc(u.en)}</div><div class="fa-tr">${esc(u.fa)}</div></div>
    <button class="btn wide teach-cta" data-b="teach">👩‍🏫 آموزش کامل این درس به فارسی<small>مکالمه، ترجمهٔ خط‌به‌خط، گرامر و واژه‌ها — صوتی و آفلاین</small></button>
    ${conv?.lines?.length ? `<section><div class="bk-chip en">Conversation</div>${conv.title ? `<b class="en">${esc(conv.title)}</b>` : ''}${conv.setting ? `<div class="small muted">${esc(conv.setting)}</div>` : ''}
      <div class="bk-lines">${conv.lines.map((l, i) => `<div class="bk-line" data-i="${i}"><button class="icon-btn" data-play="${esc(l.en)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en"><span class="who">${esc(l.who || '')}:</span> ${twWrap(l.en)}</p><p class="fa-tr">${esc(l.fa || '')}</p></div></div>`).join('')}</div></section>` : ''}
    ${L?.reading?.en ? `<section><div class="bk-chip en">Reading</div>${L.reading.title ? `<b class="en">${esc(L.reading.title)}</b>` : ''}<p class="en bk-p">${twWrap(L.reading.en)} <button class="icon-btn" data-play="${esc(L.reading.en)}" aria-label="پخش">${I.spk}</button></p><p class="fa-tr">${esc(L.reading.fa || '')}</p></section>` : ''}
    ${g ? `<section><div class="bk-chip en">Grammar</div><b class="en">${esc(g.title || '')}</b><p class="small">${esc(g.explain || '')}</p>
      ${(g.rules || []).map(r => `<div class="bk-rule"><span>${esc(r.fa || '')}</span><div class="en">${twWrap(r.en || '')}</div></div>`).join('')}
      ${(g.examples || []).map(x => `<div class="bk-line"><button class="icon-btn" data-play="${esc(x.en || x)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en">${twWrap(x.en || x)}</p><p class="fa-tr">${esc(x.fa || '')}</p></div></div>`).join('')}</section>` : ''}
    <section id="bk-words"><div class="bk-chip en">Words</div><span class="small muted">روی هر کلمه بزن: تلفظ آمریکایی و بریتانیایی، معنی، مترادف، متضاد، جمله‌ها و افزودن به لایتنر.</span>
      ${words.map(w => `<div class="bk-line"><button class="icon-btn" data-play="${esc(w.w)}" aria-label="پخش">${I.spk}</button><div class="grow"><p class="en"><b class="tw">${esc(w.w)}</b> <span class="muted small">${w.ipa ? '/' + esc(w.ipa) + '/' : ''}</span> ${w.reg && window.regPill ? regPill(w) : ''}</p><p class="fa-tr">${esc(w.fa || '')}${w.use ? ` · 🧭 ${esc(w.use)}` : ''}</p>${w.ex ? `<p class="en small" style="cursor:pointer" data-play="${esc(w.ex)}">${twWrap(w.ex)}</p>` : ''}</div><button class="icon-btn" data-lt="${esc(w.w)}" aria-label="افزودن به لایتنر" title="افزودن به لایتنر">＋</button></div>`).join('')}</section>
    ${(L?.phrasebook || []).length ? `<section><div class="bk-chip en">Phrasebook</div><a class="btn ghost sm" href="#lesson/${u.id}">همهٔ عبارت‌ها با سطح رسمی/خودمونی/عامیانه ›</a></section>` : ''}
    <a class="btn line wide" href="#unit/${u.id}/steps">✍️ تمرین‌ها، فلش‌کارت، کوییز و آزمون این درس ›</a>
    <div class="row" style="justify-content:space-between">${n > 1 ? `<a class="btn ghost sm" href="#unit/${us[n - 2].id}">› درس قبل</a>` : '<span></span>'}${us[n] && isOpen(us[n]) ? `<a class="btn ghost sm" href="#unit/${us[n].id}">درس بعد ‹</a>` : ''}</div>
  </article>`;
  const bk = $('#bk', v);
  let playing = false; const mp = $('#mp', v);
  mp.onclick = async () => { if (playing) { playing = false; stopSpeak(); mp.textContent = '▶'; return; } playing = true; mp.textContent = '⏸'; await playSeq(conv?.lines?.length ? conv.lines.map(l => l.en) : words.flatMap(w => [w.w, w.ex].filter(Boolean))); playing = false; mp.textContent = '▶'; };
  const playSeq = async list => { const h0 = location.hash; for (const t of list) { if (!(await say(t, 'en', 'calm')) || location.hash !== h0) break; await new Promise(r => setTimeout(r, 500)); } };
  v.onclick = async e => {
    const tw = e.target.closest('.tw'); if (tw) return wordPanel(tw.textContent, tw.closest('p')?.textContent?.slice(0, 200));
    const lt = e.target.closest('[data-lt]'); if (lt) { const w = words.find(x => x.w === lt.dataset.lt); if (w) { const k = wid(u, w); if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; saveU(); window.LMAP = null; lt.textContent = '✓'; toast('به جعبهٔ لایتنر اضافه شد؛ به‌موقع یادآوری می‌شود.'); } return; }
    const ab = e.target.closest('[data-acc]'); if (ab) { G.settings.accent = ab.dataset.acc; saveG('settings'); stopSpeak(); $$('[data-acc]', v).forEach(x => x.classList.toggle('on', x === ab)); toast(ab.dataset.acc === 'UK' ? 'از این به بعد همهٔ صداها با لهجهٔ بریتانیایی' : 'از این به بعد همهٔ صداها با لهجهٔ آمریکایی'); return say(conv?.lines?.[0]?.en || words[0]?.w || 'Hello!', 'en', 'calm'); }
    const p = e.target.closest('[data-play]'); if (p) return say(p.dataset.play, 'en', 'calm', p.classList.contains('icon-btn') ? p : null);
    const b = e.target.closest('[data-b]'); if (!b) return;
    const k = b.dataset.b;
    if (k === 'tr') { const on = !bookTr(); lsSet('zd:bookTr', on); bk.classList.toggle('tr', on); b.classList.toggle('on', on); }
    else if (k === 'words') $('#bk-words').scrollIntoView({ behavior: 'smooth' });
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
  $('#pc', bg) && ($('#pc', bg).onclick = () => { bg.remove(); playSeq(L.conversation.lines.map(l => l.en)); });
  $('#pw', bg).onclick = () => { bg.remove(); playSeq(words.flatMap(w => [w.w, w.ex].filter(Boolean))); };
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
  const items = [['dl', '⬇ دانلود همهٔ فایل‌های صوتی درس'], ['audio', '▶ پخش صوتی (آمریکایی / بریتانیایی)'], ['teach', '👩‍🏫 آموزش کامل درس به فارسی'], ['#dict', '🔍 جستجو در دیکشنری'], ['note', '📝 یادداشت‌ها و نشانه‌ها'], ['#unit/' + u.id + '/steps', '✍️ تمرین‌ها، کوییز و آزمون'], ['#leitner', '🗃️ جعبهٔ لایتنر و کوییز از واژه‌هایم'], ['#settings', '⚙️ تنظیمات']];
  m.innerHTML = items.map(([k, t]) => k[0] === '#' ? `<a href="${k}" role="menuitem">${t}</a>` : `<button data-b="${k}" role="menuitem">${t}</button>`).join('');
  view().appendChild(m);
  const close = e => { if (!e.target.closest('[data-b="more"]')) { m.remove(); document.removeEventListener('click', close, true); } };
  setTimeout(() => document.addEventListener('click', close, true));
}
