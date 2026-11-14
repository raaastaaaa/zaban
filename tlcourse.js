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
  const line = (x, k, who) => { const { t, fa } = tlSplit(x); const sp = tlSpeakable(t); return `<div class="bk-line" data-k="${k}"><button class="icon-btn" data-play="${esc(sp)}" aria-label="پخش">🔊</button><div class="grow"><p class="tl-t" dir="${D}" lang="${L}">${who ? `<span class="who">${esc(who)}:</span> ` : ''}${esc(t)}</p>${fa ? `<p class="fa-tr">${esc(fa)}</p>` : ''}</div></div>`; };
  const dlg = (x, k) => { const s = String(x); const m = s.match(/^\s*([^:：]{1,24})\s*[:：]\s*(.+)$/); return m ? line(m[2], k, m[1]) : line(s, k); };
  const tiles = Object.entries(TL_SEC).filter(([k]) => has[k]);
  v.innerHTML = `<div class="book-bar" role="toolbar">
    <button data-b="menu" aria-label="فهرست درس‌ها">☰<small>درس‌ها</small></button>
    <button data-b="tr" class="${bookTr() ? 'on' : ''}" aria-label="ترجمه"><b>文A</b><small>ترجمه</small></button>
    <button data-b="live" aria-label="معلم زنده">🎓<small>معلم زنده</small></button>
    <button data-b="dl" aria-label="صوت آفلاین">⬇<small>آفلاین</small></button></div>
  <button class="mini-play" id="mp" aria-label="پخش همه">▶</button>
  <article class="book${bookTr() ? ' tr' : ''}" id="bk">
    <div class="bk-head"><span class="small muted">${esc(tlInfo().fa)} ${esc(TL_LV[A[1]]?.[0] || '')} · ${esc(A[1])} · ${esc(tlDia()[1] || '')}</span>
      <h2 class="en keep-en">${esc((TL_UNITWORD[tl()] || (n => 'Unit ' + n))(i + 1))}</h2><div class="bk-title">${esc(P.title_fa || A[2])}</div><div class="fa-tr en keep-en">${esc(P.title_en || '')}</div></div>
    ${!sec ? `<div class="card stack" style="margin:8px 0"><span class="small"><b>🎯 هدف:</b> ${esc(P.goal || '')}</span><span class="small muted">${esc(P.intro || '')}</span></div>
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
    const b = e.target.closest('[data-b]'); if (!b) return; const k = b.dataset.b;
    if (k === 'menu') return go('tlc/' + A[1]);
    if (k === 'tr') { const on = !bookTr(); lsSet('zd:bookTr', on); bk.classList.toggle('tr', on); $$('[data-b="tr"]', v).forEach(x => x.classList.toggle('on', on)); return; }
    if (k === 'live') { U.cIdx = U.cIdx || {}; U.cIdx[tl()] = i; saveU(); return teachThis({ custom: `${tl()}:${A[0]}:${tlDia()[2]}` }, P.title_fa || A[2]); }
    if (k === 'dl') return tlDownload(A, b);
  };
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
