/* ───────── دورهٔ کامل زبان‌های دیگر (عربی، آلمانی، ترکی، چینی) — دقیقاً به سبک دورهٔ انگلیسی ─────────
   • قفسهٔ کتاب برای هر سطح (A0 تا C1) با جلد مخصوص هر زبان
   • صفحهٔ هر دوره: فهرست درس‌ها مثل کتاب (درس فعلی، تمام‌شده‌ها)
   • صفحهٔ هر درس مثل کتاب انگلیسی: نوار ابزار (ترجمه، پخش همه)، کاشی‌های بخش‌ها، هر بخش صفحهٔ جدا،
     پخش پشت‌سرهم، داستان صوتی، کتاب تمرین، فلش‌کارت، معلم زنده، درس قبل/بعد */
const TL_LV = { A0: ['آشنایی', 'Starter'], A1: ['مقدماتی', 'Beginner'], A2: ['پایه', 'Elementary'], B1: ['متوسط', 'Intermediate'], B2: ['فوق‌متوسط', 'Upper-Intermediate'], C1: ['پیشرفته', 'Advanced'] };
const TL_UNITWORD = { ar: n => `الدرس ${n}`, de: n => `Lektion ${n}`, tr: n => `Ders ${n}`, zh: n => `第${n}课` };
const TL_HUE = { ar: [168, 40], de: [0, 45], tr: [212, 182], zh: [355, 42] };
const tlLevels = () => [...new Set(curUnits().map(a => a[1]))];
const tlDone = id => !!(U.arDone || {})[id];
const tlLang = () => ({ ar: 'ar', de: 'de', tr: 'tr', zh: 'zh' })[tl()] || 'en';
const tlDir = () => tl() === 'ar' ? 'rtl' : 'ltr';

function tlCover(lv, big) {
  const [h1, h2] = TL_HUE[tl()] || [200, 230]; const k = tlLevels().indexOf(lv);
  const us = curUnits().filter(a => a[1] === lv); const done = us.filter(a => tlDone(a[0])).length;
  return `<div class="cover${big ? ' big' : ''}" style="--h1:${h1 + k * 9};--h2:${h2 + k * 7}"><span class="cv-brand">زبان رستا · ${esc(tlInfo().flag)}</span><b class="cv-name">${esc(tlInfo().fa)} ${esc(TL_LV[lv]?.[0] || lv)}</b><span class="cv-en en">${esc(TL_LV[lv]?.[1] || '')}</span><span class="cv-lv en">${esc(lv)}</span><span class="cv-pr">${faNum(done)}/${faNum(us.length)}</span></div>`;
}
const tlShelf = (title, sub) => `<div class="shelf card"><div><b class="shelf-t">${title}</b><div class="small muted">${sub}</div></div><div class="shelf-row">${tlLevels().map(lv => `<a class="book" href="#tlc/${lv}">${tlCover(lv)}<b>${esc(tlInfo().fa)} ${esc(TL_LV[lv]?.[0] || lv)}</b><span class="tiny muted">${faNum(curUnits().filter(a => a[1] === lv).length)} درس · ${esc(lv)}</span></a>`).join('')}</div></div>`;
const tlUnitCard = (a, i) => `<a class="ucard-l card row" href="#aru/${esc(a[0])}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="lr-ic" style="--h:${(TL_HUE[tl()] || [200])[0] + i * 11}">${tlDone(a[0]) ? '✓' : faNum(i + 1)}</span><span class="grow"><b>${esc(a[2])}</b><br><span class="tiny muted">سطح ${esc(a[1])} · درس ${faNum(i + 1)} از ${faNum(curUnits().length)}</span></span><span class="pill ${i === curIdx() ? 'acc' : ''}">${i === curIdx() ? 'ادامه' : tlDone(a[0]) ? '✓' : '›'}</span></a>`;

function tlHomeBottom() {
  const c = curIdx(); const next = curUnits().slice(c, c + 4);
  return `${tlShelf(`دوره‌های ${esc(tlInfo().fa)}`, 'یک دوره را بزن تا درس‌هایش را مثل کتاب ببینی')}
  <div class="sec">درس‌های پیش رو <small><a href="#arc">همهٔ درس‌ها ›</a></small></div><div class="stack">${next.map((a, k) => tlUnitCard(a, c + k)).join('')}</div>
  <div class="row"><a class="btn line sm" href="#story">🎧 داستان‌های صوتی</a><a class="btn line sm" href="#wb">📘 کتاب تمرین</a><a class="btn line sm" href="#flash">🃏 فلش‌کارت</a><a class="btn line sm" href="#listen">📻 رادیو و شنیدن</a></div>`;
}
function tlProgressCard() {
  const all = curUnits(); const done = all.filter(a => tlDone(a[0])).length; const cur = all[curIdx()];
  return `<div class="card stack"><div class="row"><b class="grow">پیشرفت من در ${esc(tlInfo().fa)}</b><span class="pill">${rankOf(U.xp)} · ${faNum(U.xp)} امتیاز</span></div>
    <div class="grid2 small"><span>درس‌های تمام‌شده: <b class="num">${faNum(done)}</b> از ${faNum(all.length)}</span><span>سطح فعلی: <b>${esc(cur?.[1] || '')} · ${esc(TL_LV[cur?.[1]]?.[0] || '')}</b></span><span class="grow">درس فعلی: <b>${esc(cur?.[2] || '')}</b></span></div>
    <div class="bar"><i style="width:${Math.round(done / Math.max(1, all.length) * 100)}%"></i></div></div>`;
}

/* قفسهٔ دوره‌ها (به‌جای صفحهٔ «دوره‌ها و درس‌ها»ی انگلیسی) */
routes.arc = () => {
  if (tl() === 'en') return go('path');
  setTop(`دوره‌های ${tlInfo().fa}`, true);
  view().innerHTML = `<div class="stack">${tlShelf(`دوره‌های آموزشی ${esc(tlInfo().fa)}`, `${esc(tlFa())} · از صفر تا پیشرفته، درس‌به‌درس مثل کتاب`)}
  ${tlProgressCard()}
  ${tlLevels().map(lv => `<div class="sec">${esc(tlInfo().fa)} ${esc(TL_LV[lv]?.[0] || lv)} <small>${esc(lv)}</small></div><div class="stack">${curUnits().map((a, i) => a[1] === lv ? tlUnitCard(a, i) : '').join('')}</div>`).join('')}</div>`;
};
/* صفحهٔ یک دوره (یک سطح) — مثل routes.course انگلیسی */
routes.tlc = lv => {
  if (tl() === 'en') return go('path'); const us = curUnits().map((a, i) => [a, i]).filter(([a]) => a[1] === lv); if (!us.length) return go('arc');
  setTop(`${tlInfo().fa} ${TL_LV[lv]?.[0] || lv}`, true);
  view().innerHTML = `<div class="stack"><div class="course-head">${tlCover(lv, true)}</div>
  ${us[0][1] === 0 && typeof ABC !== 'undefined' && ABC[tl()] ? `<a class="lrow${abcDone() ? '' : ' current'}" href="#abc"><span class="lr-ic">🔤</span><div class="grow"><b>شروع از صفر · الفبا و تلفظ حروف</b><div class="small">${esc(ABC[tl()].title)}</div></div><span class="lr-st">${abcDone() ? '<span class="pill ok">✓</span>' : ''}</span></a>` : ''}
  <div class="lesson-list">${us.map(([a, i], k) => { const m = tlDone(a[0]), cur = i === curIdx();
    return `<a class="lrow${cur ? ' current' : ''}" href="#aru/${esc(a[0])}"><span class="lr-ic" style="--h:${(TL_HUE[tl()] || [200])[0] + k * 13}">${faNum(i + 1)}</span><div class="grow"><b>${esc((TL_UNITWORD[tl()] || (n => 'Unit ' + n))(i + 1))} · درس ${faNum(i + 1)}</b><div class="small">${esc(a[2])}</div><div class="tiny muted en keep-en">${esc(String(a[3]).split(/[:;]/)[0])}</div></div><span class="lr-st">${m ? '<span class="pill ok">✓</span>' : cur ? '<span class="pill acc">ادامه</span>' : ''}</span></a>`; }).join('')}</div></div>`;
  $('.lrow.current')?.scrollIntoView({ block: 'center' });
};

/* تجزیهٔ ردیف‌ها: «متن مقصد = معنی فارسی (توضیح)» */
function tlSplit(x) {
  const s = String(x || '').trim();
  let m = s.match(/^(.+?)\s+=\s+(.+)$/); if (m) return { t: m[1].trim(), fa: m[2].trim() };
  m = s.match(/^(.+?)\s+[—–-]\s+(.+)$/); if (m && !/[؀-ۿ]/.test(m[1]) || m && tl() === 'ar') return { t: m[1].trim(), fa: m[2].trim() };
  m = s.match(/^(.+?)\s*\(([^()]*[؀-ۿ][^()]*)\)\s*\.?$/); if (m) return { t: m[1].trim(), fa: m[2].trim() };
  return { t: s, fa: '' };
}
function tlSpeakable(t) { const c = typeof arCore === 'function' ? arCore(t) : t; return c || t; }
const TL_SEC = {
  conv: ['🎭', 'مکالمه', 'Dialogue'], words: ['📚', 'واژه‌ها', 'Words'], verbs: ['🔤', 'افعال', 'Verbs'], sent: ['💬', 'جمله‌های کاربردی', 'Sentences'],
  gram: ['📐', 'گرامر', 'Grammar'], coll: ['😎', 'محاوره و اصطلاحات', 'Colloquial'], dia: ['🗺️', 'تفاوت لهجه‌ها', 'Varieties'], speak: ['🗣️', 'تمرین گفتاری و مرور', 'Speaking & review']
};
async function tlPlan(A, v) {
  let P = await arPlanGet(A);
  if (!P) { if (needAI(v)) return null; v.innerHTML = loading('در حال طراحی کامل این درس (واژه‌ها، افعال، جمله‌ها، اصطلاحات)…'); const i = curUnits().indexOf(A);
    try { await makeCustomPlan(`درس ${faNum(i + 1)} دورهٔ ${tlInfo().fa} (${A[1]}): ${A[2]} — ${A[3]}. Grammar focus: ${A[4]}`, `${tl()}:${A[0]}:${tlDia()[2]}`); P = await arPlanGet(A); } catch (e) { aiErr(e); return null; } }
  return P;
}
routes.aru = async (id, sec) => {
  if (tl() === 'en') return go('path');
  const i = curUnits().findIndex(a => a[0] === id); if (i < 0) return go('arc'); const A = curUnits()[i]; const all = curUnits();
  setTop(sec ? `${TL_SEC[sec]?.[1] || ''} · درس ${faNum(i + 1)}` : `درس ${faNum(i + 1)}`, true);
  const v = view(); v.innerHTML = loading('درس را باز می‌کنم…'); const g0 = routeGen;
  const P = await tlPlan(A, v); if (g0 !== routeGen || !P) return;
  const has = { conv: P.dialogue?.length, words: P.bank?.length, verbs: P.verbs?.length, sent: P.sentences?.length, gram: P.grammar?.point, coll: P.colloquial?.length, dia: P.us_uk?.length, speak: (P.roleplay || P.personal || P.checks || P.quiz)?.length };
  if (sec && !has[sec]) return go('aru/' + id);
  const L = tlLang(), D = tlDir();
  const line = (x, k, who) => { let { t, fa } = tlSplit(x); let pr = '';
    const bm = t.match(/^(.*?)\s*\[([^\]]*[؀-ۿ][^\]]*)\]\s*$/); if (bm) { t = bm[1]; pr = bm[2]; } // تلفظ آماده داخل [ ]
    const sp = tlSpeakable(t);
    return `<div class="bk-line" data-k="${k}"><button class="icon-btn" data-play="${esc(sp)}" aria-label="پخش">🔊</button><div class="grow"><p class="tl-t" dir="${D}" lang="${L}">${who ? `<span class="who">${esc(who)}:</span> ` : ''}${esc(t)}</p>${pr ? `<p class="pron">🗣 «${esc(pr)}»</p>` : `<p class="pron" data-pron="${esc(sp)}" hidden></p>`}${fa ? `<p class="fa-tr">${esc(fa)}</p>` : `<p class="fa-tr" data-tr="${esc(t)}" hidden></p>`}</div></div>`; };
  const dlg = (x, k) => { const s = String(x); const m = s.match(/^\s*([^:：]{1,24})\s*[:：]\s*(.+)$/); return m ? line(m[2], k, m[1]) : line(s, k); };
  const tiles = Object.entries(TL_SEC).filter(([k]) => has[k]);
  const dias = Object.entries(tlInfo().v || {}); const curDia = (U.tlv || {})[tl()] || tlInfo().def;
  const diaSeg = () => dias.length > 1 ? `<div class="seg acc-seg" role="group" aria-label="لهجه">${dias.map(([k, d]) => `<button data-dia="${k}" class="${curDia === k ? 'on' : ''}">${esc(d[1])}</button>`).join('')}</div>` : '';
  v.innerHTML = `<div class="book-bar" role="toolbar">
    <button data-b="menu" aria-label="فهرست درس‌ها">☰<small>درس‌ها</small></button>
    <button data-b="words" aria-label="واژه‌ها"><b>${esc(TL_WCHIP[tl()] || 'W')}</b><small>واژه‌ها</small></button>
    <button data-b="tr" class="${bookTr() ? 'on' : ''}" aria-label="ترجمه"><b>文A</b><small>ترجمه</small></button>
    <button data-b="pron" class="${lsGet('zd:showPron', true) ? 'on' : ''}" aria-label="تلفظ فارسی"><b>🗣</b><small>تلفظ</small></button>
    <button data-b="audio" aria-label="صوت"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg><small>صوت</small></button>
    <button data-b="more" aria-label="منو">⋮<small>بیشتر</small></button></div>
  <button class="mini-play" id="mp" aria-label="پخش همه">▶</button>
  <article class="book${bookTr() ? ' tr' : ''}" id="bk">
    <div class="bk-head"><span class="small muted">${esc(tlInfo().fa)} ${esc(TL_LV[A[1]]?.[0] || '')} · ${esc(A[1])} · ${esc(tlDia()[1] || '')}</span>
      ${diaSeg()}
      <h2 class="en keep-en">${esc((TL_UNITWORD[tl()] || (n => 'Unit ' + n))(i + 1))}</h2><div class="bk-title">${esc(P.title_fa || A[2])}</div><div class="fa-tr en keep-en">${esc(P.title_en || '')}</div></div>
    ${!sec ? `<div class="card stack" style="margin:8px 0"><span class="small"><b>🎯 هدف:</b> ${esc(P.goal || '')}</span><span class="small muted">${esc(P.intro || '')}</span></div>
    ${i === 0 && typeof ABC !== 'undefined' && ABC[tl()] ? `<a class="btn wide teach-cta" href="#abc" style="background:var(--ok,#1c7c54)">🔤 ${abcDone() ? 'مرور الفبا و تلفظ حروف' : 'قدم اول: الفبا و صدای حروف را از صفر یاد بگیر'}<small>هر حرف با صدای بومی، تلفظ به خط فارسی و یک واژهٔ نمونه + تمرین شنیداری</small></a>` : ''}
    <button class="btn wide teach-cta" data-b="live">👩‍🏫 آموزش کامل این درس با معلم زنده<small>به فارسی؛ همهٔ واژه‌ها، جمله‌ها و گرامر — با صدای بومی</small></button>
    <div class="sec-grid">${tiles.map(([k, [ic, fa, en]], n) => `<a class="sec-tile" href="#aru/${esc(id)}/${k}"><span class="st-n">${faNum(n + 1)}</span><span class="st-ic">${ic}</span><b>${fa}</b><span class="en tiny muted">${en}</span></a>`).join('')}
      <a class="sec-tile" href="#story/${esc(id)}"><span class="st-ic">🎧</span><b>داستان صوتی</b><span class="en tiny muted">Audio story</span></a>
      <a class="sec-tile" href="#wb/${esc(id)}"><span class="st-ic">📘</span><b>کتاب تمرین</b><span class="en tiny muted">Workbook</span></a>
      <a class="sec-tile" href="#flash"><span class="st-ic">🃏</span><b>فلش‌کارت</b><span class="en tiny muted">Flashcards</span></a></div>
    <button class="btn wide" id="ardone">${tlDone(id) ? '✓ این درس را تمام کرده‌ای' : '✓ این درس را یاد گرفتم'}</button>
    <div class="row" style="justify-content:space-between">${i > 0 ? `<a class="btn ghost sm" href="#aru/${esc(all[i - 1][0])}">› درس قبل</a>` : '<span></span>'}${all[i + 1] ? `<a class="btn ghost sm" href="#aru/${esc(all[i + 1][0])}">درس بعد ‹</a>` : ''}</div>` : ''}
    ${sec === 'conv' ? `<section><div class="bk-chip en">Dialogue</div><div class="bk-lines">${P.dialogue.map((x, k) => dlg(x, 'c' + k)).join('')}</div></section>` : ''}
    ${sec === 'words' ? `<section>${P.bank.map((g, gi) => `<div class="bk-chip">${esc(g.g || '')}</div>${(g.items || []).map((x, k) => line(x, `w${gi}-${k}`)).join('')}`).join('')}</section>` : ''}
    ${sec === 'verbs' ? `<section><div class="bk-chip en">Verbs</div>${P.verbs.map((x, k) => line(x, 'v' + k)).join('')}</section>` : ''}
    ${sec === 'sent' ? `<section><div class="bk-chip en">Sentences</div>${P.sentences.map((x, k) => line(x, 's' + k)).join('')}</section>` : ''}
    ${sec === 'coll' ? `<section><div class="bk-chip en">Colloquial</div>${P.colloquial.map((x, k) => line(x, 'o' + k)).join('')}</section>` : ''}
    ${sec === 'dia' ? `<section><div class="bk-chip en">Varieties</div><span class="small muted">تفاوت شکل رسمی/محاوره و لهجه‌ها</span>${P.us_uk.map((x, k) => { const s = String(x); const m = s.match(/^(.+?)\s*↔\s*(.+?)(\s*\((.+)\))?$/); return m ? `<div class="bk-line" data-k="d${k}"><button class="icon-btn" data-play="${esc(m[1])}">🔊</button><div class="grow"><p class="tl-t" dir="${D}" lang="${L}">${esc(m[1])} ↔ ${esc(m[2])}</p>${m[4] ? `<p class="small muted">${esc(m[4])}</p>` : ''}</div></div>` : line(s, 'd' + k); }).join('')}</section>` : ''}
    ${sec === 'gram' ? `<section><div class="bk-chip en">Grammar</div><b>${esc(P.grammar.point || '')}</b><p class="small">${esc(P.grammar.rule || '')}</p>
      ${(P.grammar.examples || []).map((x, k) => line(x, 'g' + k)).join('')}
      ${(P.patterns || []).length ? `<b class="small">الگوهای جمله</b>${P.patterns.map((x, k) => line(x, 'p' + k)).join('')}` : ''}
      ${(P.pron || []).length ? `<b class="small">🔈 نکته‌های تلفظ</b>${P.pron.map(x => `<div class="small">• ${esc(x)}</div>`).join('')}` : ''}
      ${(P.mistakes || []).length ? `<b class="small">⚠️ اشتباه‌های رایج فارسی‌زبان‌ها</b>${P.mistakes.map(x => `<div class="small">• ${esc(x)}</div>`).join('')}` : ''}</section>` : ''}
    ${sec === 'speak' ? `<section><div class="bk-chip en">Speaking</div>
      ${(P.personal || []).length ? `<b class="small">🙋 دربارهٔ خودت جواب بده (بلند بگو)</b>${P.personal.map(x => `<div class="small">• ${esc(x)}</div>`).join('')}` : ''}
      ${(P.roleplay || []).length ? `<b class="small">🎭 نقش‌آفرینی با معلم زنده</b>${P.roleplay.map(x => `<div class="small">• ${esc(x)}</div>`).join('')}` : ''}
      ${(P.checks || []).length ? `<b class="small">✅ خودت را بسنج</b>${P.checks.map(x => `<div class="small">• ${esc(x)}</div>`).join('')}` : ''}
      ${(P.quiz || []).length ? `<b class="small">📝 سؤال‌های مرور</b>${P.quiz.map(x => `<div class="small">${esc(x)}</div>`).join('')}` : ''}
      <button class="btn wide" data-b="live">🎓 این تمرین‌ها را با معلم زنده انجام بده</button></section>` : ''}
    ${sec ? (() => { const ks = tiles.map(([k]) => k); const n = ks.indexOf(sec); return `<div class="row" style="justify-content:space-between"><a class="btn ghost sm" href="#aru/${esc(id)}">› فهرست درس</a>${ks[n + 1] ? `<a class="btn ghost sm" href="#aru/${esc(id)}/${ks[n + 1]}">${TL_SEC[ks[n + 1]][1]} ‹</a>` : `<a class="btn ghost sm" href="#wb/${esc(id)}">📘 کتاب تمرین ‹</a>`}</div>`; })() : ''}
  </article>`;
  const bk = $('#bk', v); const mp = $('#mp', v); let run = 0;
  const playAll = async () => { const my = ++run; const els = $$('.bk-line', v); if (!els.length) return toast('یکی از بخش‌ها را باز کن تا پشت‌سرهم پخش شود.'); mp.textContent = '⏸';
    for (const el of els) { if (my !== run) return; $$('.reading-now', v).forEach(x => x.classList.remove('reading-now')); el.classList.add('reading-now'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await say(el.querySelector('[data-play]').dataset.play, 'en', 'calm'); await new Promise(r => setTimeout(r, 250)); }
    if (my === run) { mp.textContent = '▶'; $$('.reading-now', v).forEach(x => x.classList.remove('reading-now')); } };
  mp.onclick = () => { if (mp.textContent === '⏸') { run++; stopSpeak(); mp.textContent = '▶'; return; } playAll(); };
  v.onclick = e => {
    const p = e.target.closest('[data-play]'); if (p) { run++; mp.textContent = '▶'; return say(p.dataset.play, 'en', 'calm', p); }
    const dz = e.target.closest('[data-dia]'); if (dz) { U.tlv = U.tlv || {}; U.tlv[tl()] = dz.dataset.dia; saveU(); PACKS && Object.keys(PACKS).forEach(x => delete PACKS[x]); return routes.aru(id, sec); }
    const b = e.target.closest('[data-b]'); if (!b) return; const k = b.dataset.b; $('.bk-menu')?.remove();
    if (k === 'menu') return go('tlc/' + A[1]);
    if (k === 'words') return go('aru/' + id + '/words');
    if (k === 'pron') { const on = !lsGet('zd:showPron', true); lsSet('zd:showPron', on); document.body.classList.toggle('nopron', !on); b.classList.toggle('on', on); toast(on ? 'تلفظ به خط فارسی نمایش داده می‌شود' : 'تلفظ فارسی پنهان شد'); if (on) tlFillPron(v); return; }
    if (k === 'audio') return tlAudioSheet();
    if (k === 'more') return tlMoreMenu();
    if (k === 'note') return noteSheet({ id: 'tl:' + A[0], fa: P.title_fa || A[2] });
    if (k === 'playsec') { if (!$$('.bk-line', v).length) return toast('یکی از بخش‌ها را باز کن تا پشت‌سرهم پخش شود.'); return playAll(); }
    if (k === 'tr') { const on = !bookTr(); lsSet('zd:bookTr', on); bk.classList.toggle('tr', on); $$('[data-b="tr"]', v).forEach(x => x.classList.toggle('on', on)); return; }
    if (k === 'live') { U.cIdx = U.cIdx || {}; U.cIdx[tl()] = i; saveU(); return teachThis({ custom: `${tl()}:${A[0]}:${tlDia()[2]}` }, P.title_fa || A[2]); }
    if (k === 'dl') return tlDownload(A, b);
  };
  const tlAudioSheet = () => { const bg = sheet(`<div class="stack"><b>🎧 صوت درس</b>${diaSeg()}
    <button class="btn" data-b="live">👩‍🏫 آموزش کامل درس به فارسی با معلم زنده</button>
    ${has.conv ? `<button class="btn ghost" id="pc">▶ پخش کل مکالمه</button>` : ''}
    ${has.words ? `<button class="btn ghost" id="pw">▶ پخش همهٔ واژه‌ها</button>` : ''}
    ${sec ? `<button class="btn ghost" id="ps">▶ پخش همین بخش</button>` : ''}
    <a class="btn ghost" href="#story/${esc(id)}">🎧 داستان صوتی این درس</a>
    <button class="btn line" id="dl">⬇ دانلود همهٔ صداهای این درس برای آفلاین</button></div>`);
    const jump = s2 => { bg.remove(); if (sec === s2) return playAll(); go('aru/' + id + '/' + s2); setTimeout(() => $('#mp')?.click(), 1200); };
    bg.addEventListener('click', ev => { const t = ev.target; if (t === bg || t.closest('a')) return bg.remove();
      if (t.closest('[data-dia]')) { U.tlv = U.tlv || {}; U.tlv[tl()] = t.closest('[data-dia]').dataset.dia; saveU(); Object.keys(PACKS).forEach(x => delete PACKS[x]); bg.remove(); return routes.aru(id, sec); }
      if (t.closest('[data-b="live"]')) { bg.remove(); U.cIdx = U.cIdx || {}; U.cIdx[tl()] = i; saveU(); return teachThis({ custom: `${tl()}:${A[0]}:${tlDia()[2]}` }, P.title_fa || A[2]); }
      if (t.id === 'pc') return jump('conv'); if (t.id === 'pw') return jump('words'); if (t.id === 'ps') { bg.remove(); return playAll(); }
      if (t.id === 'dl') return tlDownload(A, t); }); };
  const tlMoreMenu = () => { const m = document.createElement('div'); m.className = 'bk-menu'; m.setAttribute('role', 'menu');
    const items = [['live', '📞 کلاس زنده با معلم (صوتی)'], ['dl', '⬇ دانلود همهٔ فایل‌های صوتی درس'], ['audio', '▶ پخش صوتی درس'], ['#story/' + id, '🎧 داستان صوتی'], ['#dict', '🔍 جستجو در دیکشنری'], ['note', '📝 یادداشت‌ها و نشانه‌ها'], ['#wb/' + id, '📘 کتاب تمرین'], ['#flash', '🃏 فلش‌کارت'], ['#leitner', '🗃️ جعبهٔ لایتنر'], ['#settings', '⚙️ تنظیمات']];
    m.innerHTML = items.map(([k, t]) => k[0] === '#' ? `<a href="${k}" role="menuitem">${t}</a>` : `<button data-b="${k}" role="menuitem">${t}</button>`).join('');
    v.appendChild(m); const close = ev => { if (!ev.target.closest('[data-b="more"]') && !m.contains(ev.target)) { m.remove(); document.removeEventListener('click', close, true); } }; setTimeout(() => document.addEventListener('click', close, true)); };
  if (sec === 'words' || sec === 'verbs') fcPickBar(v, sec); document.body.classList.toggle('nopron', !lsGet('zd:showPron', true)); tlFillPron(v); tlFillTr(v, P.title_fa || A[2]);
  $('#ardone', v) && ($('#ardone', v).onclick = () => { (U.arDone = U.arDone || {})[A[0]] = isoDay(); U.cIdx = U.cIdx || {}; U.cIdx[tl()] = Math.min(all.length - 1, i + 1); addXP(20); saveU(); toast('آفرین! برو سراغ درس بعد 🎉'); all[i + 1] ? go('aru/' + all[i + 1][0]) : go('arc'); });
  addEventListener('hashchange', () => { run++; }, { once: true });
};
async function tlDownload(A, b) {
  const dir = OFFLINE_DIR[tlDia()[2]]; const ix = dir ? await fetch(`audio/${dir}/index.json`).then(r => r.json()).catch(() => null) : null; const L = ix?.[A[0]] || [];
  const st = []; try { const S = await storyGet(A[0]); if (S) S.lines.forEach((_, n) => st.push(`audio/story/${storyAudioDir()}/${A[0]}/${n}.mp3`)); } catch { }
  const urls = [...L.map(h => `audio/${dir}/${h}.mp3`), ...st]; if (!urls.length) return toast('صدای آفلاین این درس هنوز آماده نیست.');
  const c = await caches.open('zd-media'); let n = 0; const lab = b.querySelector('small') || b;
  for (const u of urls) { if (!(await c.match(u))) { try { const r = await fetch(u); if (r.ok) await c.put(u, r); } catch { return toast('اینترنت قطع شد؛ دوباره بزن.'); } } lab.textContent = `${faNum(++n)}/${faNum(urls.length)}`; }
  lab.textContent = '✓ آفلاین'; toast('صدای این درس (و داستانش) آفلاین ذخیره شد ✓');
}

/* ───── تقویم و برنامهٔ مطالعه — برای هر زبان جدا (عربی، آلمانی، ترکی، چینی) ───── */
const tlPlanGet = () => (U.tplan || {})[tl() + ':' + tlDia()[2]] || null;
const tlPlanSet = p => { U.tplan = U.tplan || {}; U.tplan[tl() + ':' + tlDia()[2]] = p; saveU(); };
function tlBuildPlan({ start = isoDay(), end, target, minutes, reminder, review }) {
  const all = curUnits(); const lastIdx = all.map(a => a[1]).lastIndexOf(target); const from = curIdx();
  const units = all.slice(from, lastIdx + 1).filter(a => !tlDone(a[0]));
  const days = {}; const list = []; for (let d = start; d <= end; d = addDays(d, 1)) list.push(d);
  const study = list.filter(d => weekdayIdx(d) !== review); let j = 0, prev = -1;
  for (const d of list) {
    if (weekdayIdx(d) === review) { days[d] = { review: true, tasks: ['مرور فلش‌کارت‌های هفته', 'گوش دادن دوباره به داستان‌های صوتی هفته', 'کلاس مرور با معلم زنده'] }; continue; }
    const n = units.length ? Math.min(units.length - 1, Math.floor(j * units.length / Math.max(1, study.length))) : -1; j++;
    const u = units[n]; const firstDay = n !== prev; prev = n;
    days[d] = u ? { unit: u[0], tasks: firstDay ? ['واژه‌ها و افعال درس (با صدا)', 'مکالمه و جمله‌های کاربردی', 'داستان صوتی درس'] : ['گرامر و محاوره', 'کتاب تمرین درس', 'فلش‌کارت و تمرین گفتاری با معلم زنده'] } : { tasks: ['مرور آزاد و فلش‌کارت'] };
  }
  return { start, end, target, minutes, reminder, review, days, created: isoDay(), lang: tl() };
}
function tlPlanPage(mOffset = '0') {
  setTop(`تقویم ${tlInfo().fa}`); const v = view(); const P = tlPlanGet(); const lv = tlLevels(); const lg = tl();
  const WD = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  if (!P) {
    const cur = curUnits()[curIdx()]?.[1];
    v.innerHTML = `<div class="stack"><div class="card stack"><div class="big-ic">🗓️</div><b>برنامهٔ مطالعهٔ ${esc(tlInfo().fa)}</b><span class="small muted">بر اساس درس فعلی‌ات، وقت روزانه و سطحی که می‌خواهی به آن برسی، روزبه‌روز برایت برنامه می‌چینیم: کدام درس، کدام بخش، کی مرور. (برنامهٔ هر زبان جداست.)</span>
      <label class="f">هدف<select id="tg" class="in">${lv.filter(x => lv.indexOf(x) >= lv.indexOf(cur)).map(x => `<option value="${x}">پایان ${esc(tlInfo().fa)} ${esc(TL_LV[x]?.[0] || x)} (${x}) — تا درس ${faNum(curUnits().map(a => a[1]).lastIndexOf(x) + 1)}</option>`).join('')}</select></label>
      <div class="grid2"><label class="f">مدت (روز)<input id="dy" class="in" type="number" min="14" max="365" value="90"></label><label class="f">وقت روزانه (دقیقه)<input id="mn" class="in" type="number" min="15" max="240" value="45"></label></div>
      <div class="grid2"><label class="f">ساعت یادآور<input id="rm" class="in" type="time" value="20:00"></label><label class="f">روز مرور هفتگی<select id="rv" class="in">${WD.map((w, i) => `<option value="${i}" ${i === 6 ? 'selected' : ''}>${w}</option>`).join('')}</select></label></div>
      <div class="notice soft small" id="est"></div><button class="btn" id="mk">ساخت برنامه</button></div></div>`;
    const est = () => { const n = curUnits().map(a => a[1]).lastIndexOf($('#tg').value) + 1 - curIdx(); const d = +$('#dy').value * 6 / 7; $('#est').textContent = `${faNum(n)} درس در ${faNum(Math.round(d))} روز مطالعه ← هر درس حدود ${faNum(Math.max(1, Math.round(d / Math.max(1, n))))} روز.`; };
    ['tg', 'dy'].forEach(i => $('#' + i).oninput = est); est();
    $('#mk').onclick = () => { tlPlanSet(tlBuildPlan({ end: addDays(isoDay(), clamp(+$('#dy').value || 90, 14, 365) - 1), target: $('#tg').value, minutes: clamp(+$('#mn').value || 45, 15, 240), reminder: $('#rm').value, review: +$('#rv').value })); addXP(10); tlPlanPage(); };
    return;
  }
  const off = +mOffset; let first = addDays(isoDay(), -(toJ(isoDay()).d - 1));
  for (let i = 0; i < Math.abs(off); i++) { first = off > 0 ? addDays(first, 32 - toJ(addDays(first, 31)).d) : addDays(first, -1); first = addDays(first, -(toJ(first).d - 1)); }
  const jm = toJ(first); const cells = []; for (let d = first; toJ(d).m === jm.m; d = addDays(d, 1)) cells.push(d);
  const status = day => { const p = P.days[day]; if (!p) return ''; if (day > isoDay()) return p.review ? 'rev' : ''; return langMinOf(day, lg) >= P.minutes * 0.5 ? 'done' : day < isoDay() ? 'miss' : ''; };
  const ix = id => curUnits().findIndex(a => a[0] === id); const nm = id => curUnits()[ix(id)]?.[2] || '';
  const planned = P.days[isoDay()]?.unit || Object.keys(P.days).filter(d => d <= isoDay() && P.days[d].unit).sort().map(d => P.days[d].unit).pop(); const gap = planned ? ix(planned) - curIdx() : 0;
  v.innerHTML = `<div class="stack"><div class="card stack"><div class="row"><b class="grow">هدف: پایان ${esc(tlInfo().fa)} ${esc(TL_LV[P.target]?.[0] || P.target)} تا ${jLabel(P.end, true)}</b><span class="pill">${faNum(P.minutes)} دقیقه در روز</span></div>
    <div class="small">${gap > 0 ? `<span class="pill bad">${faNum(gap)} درس عقب‌تر از برنامه</span>` : gap < 0 ? `<span class="pill ok">${faNum(-gap)} درس جلوتر از برنامه 👏</span>` : '<span class="pill ok">طبق برنامه</span>'}</div>
    <div class="row"><button class="btn sm" id="upd">${gap > 0 ? 'برنامهٔ جبرانی (همان تاریخ هدف)' : 'به‌روزرسانی برنامه از امروز'}</button><button class="btn ghost sm" id="ics">افزودن به تقویم گوشی</button><button class="btn ghost sm" id="rst">برنامهٔ تازه</button></div></div>
    <div class="card stack"><div class="row"><button class="icon-btn" id="pm">${I.back}</button><b class="grow" style="text-align:center">${J_MONTHS[jm.m - 1]} ${faNum(jm.y)}</b><button class="icon-btn" style="transform:scaleX(-1)" id="nm">${I.back}</button></div>
    <div class="cal">${J_WEEK.map(w => `<span class="h">${w}</span>`).join('')}${Array(weekdayIdx(first)).fill('<span class="d empty"></span>').join('')}${cells.map(c => { const p = P.days[c]; return `<button class="d ${status(c)} ${p?.review ? 'rev' : ''} ${c === isoDay() ? 'today' : ''}" data-d="${c}"><b>${faNum(toJ(c).d)}</b>${p?.unit ? `<i>${faNum(ix(p.unit) + 1)}</i>` : p?.review ? '<i>↻</i>' : ''}</button>`; }).join('')}</div>
    <div class="row tiny muted"><span class="pill ok">انجام شد</span><span class="pill bad">جا ماند</span><span class="pill acc">روز مرور</span><span>عدد هر روز = شمارهٔ درس</span></div></div><div id="dd"></div></div>`;
  const showDay = day => { const p = P.days[day]; $$('.cal .d').forEach(b => b.classList.toggle('sel', b.dataset.d === day)); $('#dd').innerHTML = p ? `<div class="card stack"><b>${jLabel(day, true)}${p.unit ? ' · درس ' + faNum(ix(p.unit) + 1) + ': ' + esc(nm(p.unit)) : ' · روز مرور'}</b>${p.tasks.map(t => `<div class="small">☐ ${esc(t)}</div>`).join('')}${p.unit ? `<div class="row"><a class="btn sm" href="#aru/${esc(p.unit)}">باز کردن درس</a><a class="btn ghost sm" href="#story/${esc(p.unit)}">🎧 داستان</a><a class="btn ghost sm" href="#wb/${esc(p.unit)}">📘 تمرین</a></div>` : '<a class="btn sm" href="#flash">🃏 مرور فلش‌کارت</a>'}<span class="tiny muted">مطالعهٔ ${esc(tlInfo().fa)} در این روز: ${fmtMin(Math.round(langMinOf(day, lg)))}</span></div>` : ''; };
  $$('.cal .d[data-d]').forEach(b => b.onclick = () => showDay(b.dataset.d)); showDay(isoDay());
  $('#pm').onclick = () => tlPlanPage(off - 1); $('#nm').onclick = () => tlPlanPage(off + 1);
  $('#upd').onclick = () => { tlPlanSet(tlBuildPlan({ ...P, start: isoDay(), end: P.end > isoDay() ? P.end : addDays(isoDay(), 30) })); toast('برنامه از امروز تا همان تاریخ هدف دوباره چیده شد.'); tlPlanPage(); };
  $('#rst').onclick = () => { tlPlanSet(null); tlPlanPage(); };
  $('#ics').onclick = () => { const ev = Object.entries(P.days).filter(([d]) => d >= isoDay()).slice(0, 120).map(([d, p]) => { const t = (P.reminder || '20:00').replace(':', '') + '00'; return `BEGIN:VEVENT\r\nUID:${d}-${tl()}@zaban-rasta\r\nDTSTART:${d.replace(/-/g, '')}T${t}\r\nDURATION:PT${P.minutes}M\r\nSUMMARY:${tlInfo().fa} — ${p.unit ? 'درس ' + (ix(p.unit) + 1) + ': ' + nm(p.unit) : 'مرور هفته'}\r\nBEGIN:VALARM\r\nTRIGGER:-PT5M\r\nACTION:DISPLAY\r\nDESCRIPTION:وقت مطالعه\r\nEND:VALARM\r\nEND:VEVENT`; }).join('\r\n');
    const blob = new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//zaban-rasta//FA\r\n${ev}\r\nEND:VCALENDAR`], { type: 'text/calendar' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `zaban-${tl()}.ics`; a.click(); };
}
const _planR = routes.plan; routes.plan = (m) => tl() === 'en' ? _planR(m) : tlPlanPage(m);

const TL_WCHIP = { ar: 'ك', de: 'W', tr: 'K', zh: '字' };
/* تلفظ به خط فارسی برای هر جمله/واژه (مثل نسخهٔ انگلیسی) — یک بار ساخته و برای همیشه ذخیره می‌شود */
async function tlFillPron(v) {
  if (!lsGet('zd:showPron', true)) return; const els = $$('[data-pron]', v); if (!els.length) return;
  const dia = tlDia()[2], key = t => 'pr:' + dia + ':' + hashStr(t), show = (el, p) => { if (p) { el.textContent = `🗣 «${p}»`; el.hidden = false; } };
  const miss = []; for (const el of els) { const p = await idb.get(key(el.dataset.pron)); if (p) show(el, p); else miss.push(el); }
  const texts = [...new Set(miss.map(el => el.dataset.pron))]; if (!texts.length || !hasAI() && !firstKeyed()) return;
  for (let o = 0; o < texts.length; o += 25) { const chunk = texts.slice(o, o + 25);
    try { const r = await ai({ temp: 0.1, max: 3000, system: `You transliterate ${tlDia()[0]} into PERSIAN SCRIPT exactly as natives pronounce it, for Persian speakers (use Persian vowel marks َ ِ ُ where they help, no Latin letters, no meaning, no explanation).`, messages: [{ role: 'user', content: `Give the Persian-script pronunciation of each item, same order. JSON: {"p":["..."]}\n${JSON.stringify(chunk)}` }] });
      const arr = (typeof r === 'string' ? JSON.parse(r) : r)?.p || []; for (let n = 0; n < chunk.length; n++) { const p = String(arr[n] || '').trim(); if (!p) continue; idb.set(key(chunk[n]), p); miss.filter(el => el.dataset.pron === chunk[n]).forEach(el => show(el, p)); }
    } catch (e) { console.warn(e); return; } }
}

/* ترجمهٔ فارسی برای جمله‌هایی که ترجمه ندارند (مثلاً مکالمه‌ها) — یک بار ساخته و ذخیره می‌شود */
async function tlFillTr(v, topic) {
  const els = $$('[data-tr]', v); if (!els.length) return;
  const dia = tlDia()[2], key = t => 'tr:' + dia + ':' + hashStr(t), show = (el, p) => { if (p) { el.textContent = p; el.hidden = false; } };
  const miss = []; for (const el of els) { const p = await idb.get(key(el.dataset.tr)); if (p) show(el, p); else miss.push(el); }
  const texts = [...new Set(miss.map(el => el.dataset.tr))]; if (!texts.length || !hasAI() && !firstKeyed()) return;
  const ctx = $$('.tl-t', v).map(x => x.textContent).join('\n').slice(0, 3000);
  for (let o = 0; o < texts.length; o += 25) { const chunk = texts.slice(o, o + 25);
    try { const r = await ai({ temp: 0.2, max: 3500, system: `You are a professional ${tlDia()[0]}→Persian translator for a language course (lesson topic: ${topic}). Translate each line into natural, fluent, everyday Persian (محاوره‌ای مؤدبانه), faithful to the meaning and tone in this dialogue context. No transliteration, no notes.`, messages: [{ role: 'user', content: `Context (whole dialogue):\n${ctx}\n\nTranslate each item into Persian, same order. JSON: {"t":["..."]}\n${JSON.stringify(chunk)}` }] });
      const arr = (typeof r === 'string' ? JSON.parse(r) : r)?.t || []; for (let n = 0; n < chunk.length; n++) { const p = String(arr[n] || '').trim(); if (!p) continue; idb.set(key(chunk[n]), p); miss.filter(el => el.dataset.tr === chunk[n]).forEach(el => show(el, p)); }
    } catch (e) { console.warn(e); return; } }
}
