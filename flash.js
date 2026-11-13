/* ───────── استودیوی فلش‌کارت: دوطرفه (فارسی⇄انگلیسی/عربی) برای واژه، جمله، فعل و گرامر ─────────
   دسته‌ها از درس‌های انگلیسی، درس‌های عربی، موضوع‌های دلخواه و واژه‌های موضوعی ساخته می‌شوند.
   هر کارت در هر جهت جعبهٔ لایتنر جدا دارد. صدا برای هر دو طرف. آفلاین. */
const FC_BOX = [0, 1, 3, 7, 15, 30];
const fcStore = () => (U.fc = U.fc || {});
const fcKey = (deck, i, dir) => `${deck}|${i}|${dir}`;
function fcParseItem(x) { // «target = معنی (توضیح)» → {t, fa, note}
  const s = String(x || ''); const m = s.match(/^(.*?)\s[=—]\s(.*)$/); if (!m) return { t: s.trim(), fa: '', note: '' };
  const rest = m[2]; const n = rest.match(/^(.*?)\s*[(（]([^)）]*)[)）]\s*(.*)$/); return { t: m[1].trim(), fa: (n ? n[1] : rest).trim(), note: n ? (n[2] + (n[3] ? ' ' + n[3] : '')).trim() : '' }; }
/* همهٔ دسته‌های در دسترس برای زبان فعلی */
async function fcDecks() {
  const out = [];
  if (tl() !== 'en') {
    for (const [i, A] of curUnits().entries()) { const pid = `${tl()}:${A[0]}:${tlDia()[2]}`; let P = (U.customPlans || {})[pid]; if (!P && OFFLINE_DIR[tlDia()[2]]) { try { const r = await fetch(`lessons/${OFFLINE_DIR[tlDia()[2]]}/${A[0]}.json`); if (r.ok) P = await r.json(); } catch { } } if (!P) continue;
      const id = `${tl()}:${A[0]}`; const words = (P.bank || []).flatMap(g => g.items).map(fcParseItem).filter(c => c.t && c.fa); const sents = [...(P.sentences || []), ...(P.colloquial || [])].map(fcParseItem).filter(c => c.t && c.fa);
      const verbs = (P.verbs || []).map(x => { const c = fcParseItem(x); const ex = String(x).split(' — ')[1] || ''; return { ...c, note: (c.note + ' ' + ex).trim() }; }).filter(c => c.t && c.fa);
      const gram = (P.grammar?.examples || []).map(x => fcParseItem(x)).filter(c => c.t).map(c => ({ ...c, fa: c.fa || P.grammar.rule || '', note: P.grammar.point || '' }));
      out.push({ id, title: `درس ${faNum(i + 1)}: ${A[2]}`, lvl: A[1], kinds: { words, sents, verbs, gram } }); }
  } else {
    for (const u of ALL_UNITS) { const W = (typeof unitWords === 'function' ? unitWords(u) : []); if (!W?.length) continue;
      const words = W.map(w => ({ t: w.w, fa: w.fa, note: w.ipa ? '/' + w.ipa + '/' : '' })); const sents = W.filter(w => w.ex && w.exFa).map(w => ({ t: w.ex, fa: w.exFa, note: w.w }));
      out.push({ id: `en:${u.id}`, title: `${u.fa}`, lvl: u.cefr || '', kinds: { words, sents, verbs: [], gram: [] } }); }
    try { const L = await Promise.all(ALL_UNITS.filter(u => u.track !== 'ws').slice(0, 60).map(u => lessonGet(u).catch(() => null)));
      L.forEach((Ls, k) => { if (!Ls) return; const u = ALL_UNITS.filter(u => u.track !== 'ws')[k]; const d = out.find(x => x.id === `en:${u.id}`); if (!d) return;
        const conv = (Ls.conversation?.lines || []).filter(l => l.en && l.fa).map(l => ({ t: l.en, fa: l.fa, note: l.who || '' })); const exp = (Ls.conversation?.expressions || []).filter(l => l.en && l.fa).map(l => ({ t: l.en, fa: l.fa, note: l.reg || '' }));
        d.kinds.sents = [...d.kinds.sents, ...conv, ...exp]; d.kinds.gram = (Ls.grammar?.examples || []).map(x => typeof x === 'string' ? { t: x, fa: '', note: Ls.grammar?.point || '' } : { t: x.en, fa: x.fa, note: Ls.grammar?.point || '' }).filter(c => c.t && c.fa); }); } catch { }
    if (typeof VERBS !== 'undefined') { const vs = VERBS.map(v => ({ t: `${v.v} (${v.past} / ${v.pp})`, fa: v.fa, note: v.ex || '' })); if (vs.length) out.push({ id: 'en:verbs', title: 'افعال کاربردی', lvl: '', kinds: { words: [], sents: [], verbs: vs, gram: [] } }); }
  }
  for (const [k, P] of Object.entries(U.customPlans || {})) { if (/^(ar|de|tr|zh):/.test(k) || !P?.bank) continue; const words = (P.bank || []).flatMap(g => g.items).map(fcParseItem).filter(c => c.t && c.fa); const sents = [...(P.sentences || []), ...(P.colloquial || [])].map(fcParseItem).filter(c => c.t && c.fa); const verbs = (P.verbs || []).map(fcParseItem).filter(c => c.t && c.fa);
    out.push({ id: 'cp:' + k, title: '✨ ' + (P.title_fa || P.want || 'درس دلخواه'), lvl: '', kinds: { words, sents, verbs, gram: [] } }); }
  const T = lsGet('zd:wtopics:' + G.active, {}); for (const [topic, items] of Object.entries(T)) { const words = (items || []).filter(x => x.en && x.fa).map(x => ({ t: x.en, fa: x.fa, note: x.register || '' })); const sents = (items || []).filter(x => x.ex && x.exFa).map(x => ({ t: x.ex, fa: x.exFa, note: x.en })); if (words.length) out.push({ id: 'wt:' + topic, title: '📚 ' + topic, lvl: '', kinds: { words, sents, verbs: [], gram: [] } }); }
  return out;
}
const FC_KINDS = { words: ['🗂️', 'واژه‌ها'], sents: ['💬', 'جمله‌ها و اصطلاحات'], verbs: ['🔤', 'افعال'], gram: ['📐', 'گرامر'] };
const fcDue = (deck, kind, n, dir) => { let d = 0; for (let i = 0; i < n; i++) { const s = fcStore()[fcKey(deck + '/' + kind, i, dir)]; if (!s || s.due <= isoDay()) d++; } return d; };
routes.flash = async (deckId, kind, dir) => {
  setTop('فلش‌کارت', true); const v = view(); const S = U.fcSet || (U.fcSet = { dir: 'fa2t', kind: 'words' });
  if (deckId && kind) return fcSession(decodeURIComponent(deckId), kind, dir || S.dir);
  v.innerHTML = loading('دسته‌ها را آماده می‌کنم…'); const decks = await fcDecks(); if (!/^#flash/.test(location.hash)) return;
  const T = tl() === 'en' ? 'انگلیسی' : tlInfo().fa;
  v.innerHTML = `<div class="stack">
  <div class="card stack fc-hero"><b>🃏 فلش‌کارت دوطرفه — ${esc(T)}</b><span class="small">از خودت بپرس: فارسی → ${esc(T)} یا ${esc(T)} → فارسی. واژه، جمله، فعل و گرامر — از همهٔ درس‌ها و موضوع‌هایی که ساخته‌ای. هر جهت جعبهٔ لایتنر جدا دارد.</span>
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><span class="small">جهت:</span><div class="seg" id="fcd">${[['fa2t', `فارسی → ${T}`], ['t2fa', `${T} → فارسی`], ['mix', '🔀 ترکیبی']].map(([k, t]) => `<button data-v="${k}" class="${S.dir === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><span class="small">نوع:</span><div class="seg" id="fck">${Object.entries(FC_KINDS).map(([k, [ic, t]]) => `<button data-v="${k}" class="${S.kind === k ? 'on' : ''}">${ic} ${t}</button>`).join('')}</div></div></div>
  <div id="fcl" class="stack"></div></div>`;
  const draw = () => { const kind = S.kind; const dir = S.dir === 'mix' ? 'fa2t' : S.dir; const L = decks.filter(d => d.kinds[kind]?.length);
    const dueAll = L.reduce((a, d) => a + fcDue(d.id, kind, d.kinds[kind].length, dir), 0);
    $('#fcl').innerHTML = `${L.length ? `<a class="btn wide" href="#flash/${encodeURIComponent('all')}/${kind}/${S.dir}">▶ مرور همهٔ موعددارها (${faNum(dueAll)})</a>` : ''}
      ${L.map(d => { const n = d.kinds[kind].length; const due = fcDue(d.id, kind, n, dir); const done = n - due; return `<a class="card row fc-deck" href="#flash/${encodeURIComponent(d.id)}/${kind}/${S.dir}"><span class="grow"><b>${esc(d.title)}</b> ${d.lvl ? `<span class="pill">${d.lvl}</span>` : ''}<br><span class="tiny muted">${faNum(n)} کارت · ${faNum(due)} برای امروز</span><div class="fc-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div></span><span class="pill ${due ? 'acc' : 'ok'}">${due ? faNum(due) : '✓'}</span></a>`; }).join('') || `<div class="card small muted">برای این نوع هنوز کارتی نیست. ${tl() === 'ar' ? 'یک درس عربی را باز کن تا کارت‌هایش ساخته شود.' : 'درس‌ها را باز کن یا یک موضوع بساز.'}</div>`}`; };
  $('#fcd').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.dir = b.dataset.v; saveU(); $$('#fcd button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
  $('#fck').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.kind = b.dataset.v; saveU(); $$('#fck button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
  draw();
};
async function fcSession(deckId, kind, dirSet) {
  const v = view(); v.innerHTML = loading('کارت‌ها…'); const decks = await fcDecks(); if (!/^#flash/.test(location.hash)) return;
  const L = deckId === 'all' ? decks.filter(d => d.kinds[kind]?.length) : decks.filter(d => d.id === deckId);
  const T = tl() === 'en' ? 'انگلیسی' : tlInfo().fa;
  let cards = []; for (const d of L) d.kinds[kind].forEach((c, i) => { const dirs = dirSet === 'mix' ? ['fa2t', 't2fa'] : [dirSet]; for (const dir of dirs) { const k = fcKey(d.id + '/' + kind, i, dir); const s = fcStore()[k]; if (!s || s.due <= isoDay()) cards.push({ ...c, k, dir, deck: d.title }); } });
  if (deckId === 'all') cards = cards.sort(() => Math.random() - .5).slice(0, 40); else cards = cards.slice(0, 60);
  if (!cards.length) { v.innerHTML = `<div class="stack"><div class="card stack" style="align-items:center;text-align:center"><div style="font-size:54px">🎉</div><b>برای امروز کارتی نمانده</b><span class="small muted">فردا دوباره بیا، یا نوع و جهت دیگری را انتخاب کن.</span><a class="btn" href="#flash">بازگشت</a></div></div>`; return; }
  let i = 0, right = 0, flipped = false; const total = cards.length; const t0 = Date.now();
  const speakT = (t, btn) => say(t.replace(/\s*\([^)]*\)\s*$/, ''), 'en', 'calm', btn);
  const draw = () => {
    if (i >= total) { const mins = Math.max(1, Math.round((Date.now() - t0) / 60000)); const Lg = todayLog(); Lg.min = (Lg.min || 0) + mins; Lg.cards = (Lg.cards || 0) + total; saveU();
      v.innerHTML = `<div class="stack"><div class="card stack" style="align-items:center;text-align:center"><div style="font-size:54px">${right / total >= .8 ? '🏆' : '👏'}</div><b>${faNum(right)} از ${faNum(total)} درست</b><span class="small muted">کارت‌های سخت زودتر برمی‌گردند؛ آسان‌ها دیرتر.</span><div class="row"><a class="btn" href="#flash">دسته‌ها</a><button class="btn line" onclick="location.reload()">دوباره</button></div></div></div>`; return; }
    const c = cards[i]; const front = c.dir === 'fa2t' ? c.fa : c.t; const back = c.dir === 'fa2t' ? c.t : c.fa; const frontIsT = c.dir !== 'fa2t';
    v.innerHTML = `<div class="stack">
    <div class="row small muted" style="justify-content:space-between"><span>${esc(c.deck)} · ${FC_KINDS[kind][0]} ${FC_KINDS[kind][1]}</span><span>${faNum(i + 1)} / ${faNum(total)}</span></div>
    <div class="fc-prog"><i style="width:${Math.round(i / total * 100)}%"></i></div>
    <div class="fc-card ${flipped ? 'flip' : ''}" id="fcc"><div class="fc-face fc-front"><span class="tiny muted">${c.dir === 'fa2t' ? `به ${esc(T)} چی می‌شه؟` : 'یعنی چی؟'}</span><b class="${frontIsT ? 'en fc-t' : 'fc-fa'}">${esc(front)}</b>${frontIsT ? `<button class="spk" data-s="${esc(c.t)}">🔊</button>` : ''}<span class="tiny muted">برای دیدن جواب بزن</span></div>
      <div class="fc-face fc-back"><span class="tiny muted">جواب</span><b class="${frontIsT ? 'fc-fa' : 'en fc-t'}">${esc(back)}</b>${!frontIsT ? `<button class="spk" data-s="${esc(c.t)}">🔊</button>` : ''}${c.note ? `<span class="small muted">${esc(c.note)}</span>` : ''}</div></div>
    <div class="row fc-btns" id="fcb" ${flipped ? '' : 'hidden'}><button class="btn bad" data-g="0">😕 نمی‌دونستم</button><button class="btn line" data-g="1">🤔 سخت بود</button><button class="btn ok" data-g="2">😎 بلد بودم</button></div>
    ${!flipped ? `<div class="row"><button class="btn wide" id="fcflip">نمایش جواب</button></div>` : ''}
    <div class="row" style="justify-content:space-between"><a class="small muted" href="#flash">خروج</a><button class="small muted" id="fcedit" style="background:none;border:0">✏️ این کارت اشتباه است</button></div></div>`;
    $('#fcc').onclick = e => { if (e.target.closest('.spk')) { speakT(e.target.closest('.spk').dataset.s, e.target.closest('.spk')); return; } if (!flipped) { flipped = true; draw(); if (c.dir === 'fa2t') setTimeout(() => speakT(c.t), 250); } };
    $('#fcflip') && ($('#fcflip').onclick = () => $('#fcc').click());
    if (!flipped && frontIsT) setTimeout(() => speakT(c.t), 200);
    $('#fcb').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; const g = +b.dataset.g; const s = fcStore()[c.k] || { box: 0, seen: 0, wrong: 0 }; s.seen++;
      if (g === 0) { s.box = 0; s.wrong++; cards.push({ ...c }); } else if (g === 1) { s.box = Math.max(0, Math.min(5, s.box)); if (Math.random() < .5) cards.splice(Math.min(cards.length, i + 4), 0, { ...c }); } else { s.box = Math.min(5, s.box + 1); right++; }
      s.due = addDays(isoDay(), FC_BOX[s.box]); fcStore()[c.k] = s; addXP(g === 2 ? 2 : 1); saveU(); i++; flipped = false; draw(); };
    $('#fcedit').onclick = () => { const bg = sheet(`<div class="stack"><b>اصلاح کارت</b><input class="in en" id="fe1" value="${esc(c.t)}"><input class="in" id="fe2" value="${esc(c.fa)}"><button class="btn" id="fesave">ذخیره</button></div>`); bg.querySelector('#fesave').onclick = () => { (U.fcFix = U.fcFix || {})[c.k.replace(/\|[a-z0-9]+$/, '')] = { t: bg.querySelector('#fe1').value, fa: bg.querySelector('#fe2').value }; c.t = bg.querySelector('#fe1').value; c.fa = bg.querySelector('#fe2').value; saveU(); bg.remove(); draw(); }; };
  };
  // اعمال اصلاح‌های کاربر
  cards.forEach(c => { const f = (U.fcFix || {})[c.k.replace(/\|[a-z0-9]+$/, '')]; if (f) { c.t = f.t; c.fa = f.fa; } });
  draw();
}
