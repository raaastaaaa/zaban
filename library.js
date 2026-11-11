/* زبان رستا — کتابخانه: کتاب‌های درجه‌بندی‌شدهٔ دوزبانه با پخش صوتی
   همهٔ کتاب‌ها یا بازنویسی ساده‌شدهٔ آثار آزاد از حق نشر هستند یا داستان‌های اختصاصی برنامه. */
'use strict';
const BOOKS = [
  { id: 'muscat', lvl: 'easy', t: 'A New Life Abroad', fa: 'زندگی تازه در یک کشور دیگر', by: 'داستان اختصاصی زبان رستا', hue: 190, ic: '✈️', ch: 8, about: 'a young Iranian family that moves to a new country: finding an apartment, the first day at work, the market, new friends' },
  { id: 'sinbad', lvl: 'easy', t: 'Sinbad the Sailor', fa: 'سندباد بحری', by: 'هزار و یک شب', hue: 205, ic: '⛵', ch: 7, about: 'the seven voyages of Sinbad the sailor from the Arabian Nights' },
  { id: 'aladdin', lvl: 'easy', t: 'Aladdin', fa: 'علاءالدین', by: 'هزار و یک شب', hue: 40, ic: '🪔', ch: 6, about: 'Aladdin and the magic lamp from the Arabian Nights' },
  { id: 'magi', lvl: 'easy', t: 'The Gift of the Magi', fa: 'هدیهٔ کریسمس', by: 'اُ. هنری', hue: 0, ic: '🎁', ch: 3, about: "O. Henry's short story The Gift of the Magi" },
  { id: 'prince', lvl: 'easy', t: 'The Prince and the Pauper', fa: 'شاهزاده و گدا', by: 'مارک تواین', hue: 30, ic: '👑', ch: 8, about: "Mark Twain's The Prince and the Pauper" },
  { id: 'treasure', lvl: 'easy', t: 'Treasure Island', fa: 'جزیرهٔ گنج', by: 'رابرت لوئیس استیونسن', hue: 25, ic: '🏴‍☠️', ch: 8, about: "Robert Louis Stevenson's Treasure Island" },
  { id: 'gatsby', lvl: 'mid', t: 'The Great Gatsby', fa: 'گتسبی بزرگ', by: 'اف. اسکات فیتزجرالد', hue: 45, ic: '🥂', ch: 9, about: "F. Scott Fitzgerald's The Great Gatsby (1925)" },
  { id: 'holmes', lvl: 'mid', t: 'The Red-Headed League', fa: 'شرلوک هلمز: انجمن موقرمزها', by: 'آرتور کانن دویل', hue: 15, ic: '🔎', ch: 6, about: "Arthur Conan Doyle's Sherlock Holmes story The Red-Headed League" },
  { id: 'tom', lvl: 'mid', t: 'The Adventures of Tom Sawyer', fa: 'ماجراهای تام سایر', by: 'مارک تواین', hue: 110, ic: '🛶', ch: 8, about: "Mark Twain's The Adventures of Tom Sawyer" },
  { id: 'alice', lvl: 'mid', t: "Alice's Adventures in Wonderland", fa: 'آلیس در سرزمین عجایب', by: 'لوئیس کارول', hue: 280, ic: '🐇', ch: 8, about: "Lewis Carroll's Alice's Adventures in Wonderland" },
  { id: 'pride', lvl: 'mid', t: 'Pride and Prejudice', fa: 'غرور و تعصب', by: 'جین آستن', hue: 330, ic: '💌', ch: 9, about: "Jane Austen's Pride and Prejudice" },
  { id: 'timemachine', lvl: 'adv', t: 'The Time Machine', fa: 'ماشین زمان', by: 'اچ. جی. ولز', hue: 220, ic: '⏳', ch: 8, about: "H. G. Wells's The Time Machine" },
  { id: 'frankenstein', lvl: 'adv', t: 'Frankenstein', fa: 'فرانکنشتاین', by: 'مری شلی', hue: 140, ic: '⚡', ch: 9, about: "Mary Shelley's Frankenstein" },
  { id: 'hamlet', lvl: 'adv', t: 'Hamlet', fa: 'هملت', by: 'ویلیام شکسپیر', hue: 260, ic: '💀', ch: 7, about: "Shakespeare's Hamlet retold as a prose story" },
  { id: 'dracula', lvl: 'adv', t: 'Dracula', fa: 'دراکولا', by: 'برام استوکر', hue: 350, ic: '🦇', ch: 8, about: "Bram Stoker's Dracula" }
];
const LVL = { easy: { fa: 'ساده', cefr: 'A1–A2', words: 120 }, mid: { fa: 'متوسط', cefr: 'B1', words: 220 }, adv: { fa: 'پیشرفته', cefr: 'B2', words: 320 } };
const coverUrl = b => `https://image.pollinations.ai/prompt/${encodeURIComponent(`illustrated book cover art for "${b.t}", ${b.about}, painterly, vivid, no text, no letters`)}?width=360&height=540&nologo=true&seed=${parseInt(hashStr(b.id), 36) % 9999}`;
const bookState = id => (U.books || (U.books = {}))[id] || (U.books[id] = { read: [], sec: 0, last: 0, added: isoDay() });
const bookPct = b => { const s = U.books?.[b.id]; return s ? Math.round(s.read.length / b.ch * 100) : 0; };
const hms = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, Math.floor(s % 60)].map(x => String(x).padStart(2, '0')).join(':');
function ring(p, label, col = 'var(--accent)') { return `<div style="width:62px;height:62px;border-radius:50%;background:conic-gradient(${col} ${p * 3.6}deg,var(--sunk) 0);display:grid;place-items:center"><div style="width:50px;height:50px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-size:11px;font-weight:800;text-align:center;line-height:1.2">${label}</div></div>`; }
function coverHTML(b, w = 96) { return `<div style="width:${w}px;aspect-ratio:2/3;border-radius:10px;overflow:hidden;position:relative;background:hsl(${b.hue} var(--tile-s) var(--tile-l));display:grid;place-items:center;font-size:${w / 2.6}px;flex:none"><span style="position:relative">${b.ic}</span><img src="em/${emCode(b.ic)}.webp" alt="" loading="lazy" style="position:absolute;inset:18% 12%;width:76%;height:64%;object-fit:contain;filter:drop-shadow(0 4px 6px rgb(0 0 0 / .25))" onload="this.previousElementSibling.style.visibility='hidden'" onerror="this.remove()"><span style="position:absolute;inset:auto 0 0 0;height:30%;background:linear-gradient(transparent,rgb(0 0 0 / .18))"></span></div>`; }

routes.library = (tab = 'mine') => {
  setTop('کتابخانه'); const v = view(); const mine = BOOKS.filter(b => U.books?.[b.id]);
  const tabs = `<div class="seg" style="align-self:flex-start">${[['mine', 'کتابخانهٔ من'], ['online', 'همهٔ کتاب‌ها'], ['stories', 'داستان صوتی'], ['talks', 'مکالمه‌ها']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" onclick="go('library/${k}')">${l}</button>`).join('')}</div>`;
  if (tab === 'mine') {
    v.innerHTML = `<div class="stack">${tabs}${mine.length ? mine.sort((a, b) => (U.books[b.id].last || 0) - (U.books[a.id].last || 0)).map(b => { const s = U.books[b.id]; return `<a class="card row" style="text-decoration:none;color:inherit;flex-wrap:nowrap" href="#book/${b.id}">${coverHTML(b, 70)}<div class="grow"><b>${esc(b.fa)}</b><div class="en small muted">${esc(b.t)}</div><div class="row" style="margin-top:6px;gap:8px">${ring(bookPct(b), faNum(bookPct(b)) + '٪')}${ring(100, hms(s.sec), 'var(--mark)')}${ring(100, LVL[b.lvl].fa, 'var(--ok)')}</div></div></a>`; }).join('') : `<div class="card stack" style="text-align:center"><div class="big-ic">📚</div><b>کتابخانه‌ات خالی است</b><span class="small muted">از «همهٔ کتاب‌ها» یک کتاب هم‌سطح خودت انتخاب کن.</span><a class="btn" href="#library/online">دیدن کتاب‌ها</a></div>`}</div>`;
  } else if (tab === 'online') {
    v.innerHTML = `<div class="stack">${tabs}${Object.entries(LVL).map(([k, L]) => `<div class="sec">کتاب‌های ${L.fa} <small class="en">${L.cefr}</small></div><div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:6px">${BOOKS.filter(b => b.lvl === k).map(b => `<div class="card" style="padding:8px;width:128px;flex:none;display:flex;flex-direction:column;gap:6px"><a href="#book/${b.id}">${coverHTML(b, 112)}</a><b class="small" style="line-height:1.4">${esc(b.fa)}</b><span class="tiny muted">${esc(b.by)}</span>${U.books?.[b.id] ? '<span class="pill ok">در کتابخانه</span>' : `<button class="btn ghost sm" data-add="${b.id}">+ افزودن</button>`}</div>`).join('')}</div>`).join('')}</div>`;
    $$('[data-add]').forEach(x => x.onclick = () => { bookState(x.dataset.add); saveU(); toast('به کتابخانه‌ات اضافه شد.'); routes.library('online'); });
  } else if (tab === 'stories') { return go('theater');
  } else {
    v.innerHTML = `<div class="stack">${tabs}<div class="card stack" style="align-items:center;text-align:center"><div style="font-size:60px">🧑‍🤝‍🧑</div><b>مکالمه‌های درس‌ها</b><span class="small muted">هر درس یک مکالمهٔ واقعی با صدا و ترجمه دارد؛ گوش بده و پشت سرش تکرار کن.</span></div>
    <div class="units">${ALL_UNITS.filter(isOpen).map(u => `<a class="unit" href="#dialog/${u.id}"><span class="tile" style="--h:${u.hue}">${esc(u.icon)}</span><b>${esc(u.fa)}</b><span class="en">${esc(u.en)}</span>${unitState(u).steps.dialog ? '<span class="pill ok">تمرین شد</span>' : ''}</a>`).join('')}</div>
    <a class="btn ghost" href="#role">نقش‌آفرینی موقعیت‌های واقعی</a></div>`;
  }
  autoImages(v);
};

routes.book = async id => {
  const b = BOOKS.find(x => x.id === id); if (!b) return go('library'); setTop(b.fa, true); const v = view();
  const key = 'book:' + id; let meta = await idb.get(key);
  const render = () => {
    const s = U.books?.[id];
    v.innerHTML = `<div class="stack"><div class="card stack" style="align-items:center;text-align:center">${coverHTML(b, 150)}<b style="font-size:19px">${esc(b.fa)}</b><span class="en muted">${esc(b.t)}</span><span class="small muted">${esc(b.by)} · سطح ${LVL[b.lvl].fa} (${LVL[b.lvl].cefr})</span>
    ${meta ? `<div class="small" style="text-align:justify">${esc(meta.synopsis)}</div>` : ''}
    ${s ? `<div class="row" style="justify-content:center">${ring(bookPct(b), faNum(bookPct(b)) + '٪')}${ring(100, hms(s.sec), 'var(--mark)')}</div>` : `<button class="btn" id="add">افزودن به کتابخانهٔ من</button>`}</div>
    ${meta ? `<div class="sec">فصل‌ها</div><div class="stack">${meta.chapters.map((c, i) => `<a class="step${s?.read.includes(i) ? ' done' : ''}" href="#read/${id}/${i}"><span class="n">${s?.read.includes(i) ? '✓' : faNum(i + 1)}</span><span class="grow"><b class="en">${esc(c.en)}</b><br><span class="small muted">${esc(c.fa)}</span></span></a>`).join('')}</div>` : ''}</div>`;
    $('#add') && ($('#add').onclick = () => { bookState(id); saveU(); render(); });
  };
  if (meta) return render();
  if (needAI(v)) return; v.innerHTML = loading('در حال آماده کردن کتاب…');
  try {
    meta = await ai({ temp: 0.5, system: 'You are an expert author of graded readers for Persian-speaking learners of English.', messages: [{ role: 'user', content: `Plan a ${b.ch}-chapter graded reader retelling of ${b.about}, level ${LVL[b.lvl].cefr}. JSON {"synopsis":"Persian synopsis, 3-4 sentences","chapters":[{"en":"chapter title","fa":"Persian title","beats":"what happens (English, 1-2 sentences)"}]}` }] });
    if (!meta.chapters?.length) throw new Error('فصل‌ها ساخته نشد');
    await idb.set(key, meta); render();
  } catch (e) { v.innerHTML = ''; aiErr(e); }
};

routes.read = async (id, idx) => {
  const b = BOOKS.find(x => x.id === id); idx = +idx; const meta = await idb.get('book:' + id); if (!meta) return go('book/' + id);
  const st = bookState(id); st.last = Date.now(); saveU(); const c = meta.chapters[idx]; setTop(c.en, true); const v = view();
  const key = `chap:${id}:${idx}`; let ch = await idb.get(key);
  if (!ch) {
    if (needAI(v)) return; v.innerHTML = loading('در حال نوشتن فصل ' + faNum(idx + 1) + '…');
    try {
      const prev = idx ? meta.chapters.slice(0, idx).map(x => x.beats).join(' ') : '';
      ch = await ai({ max: 7000, temp: 0.7, system: 'You write engaging graded readers for adult Persian speakers. Grammar and vocabulary strictly at the requested CEFR level. Translations into fluent natural Persian.', messages: [{ role: 'user', content: `Book: ${b.about}. Level ${LVL[b.lvl].cefr}. Chapter ${idx + 1} of ${b.ch}: "${c.en}" — ${c.beats}\nStory so far: ${prev || '(beginning)'}\nWrite ~${LVL[b.lvl].words * 2} words in 6-9 short paragraphs. Mark 10-14 useful vocabulary items in the English with **double asterisks**. JSON {"paragraphs":[{"en":"","fa":"Persian translation"}],"words":[{"w":"","ipa":"","fa":""}]}` }] });
      if (!Array.isArray(ch.paragraphs) || !ch.paragraphs.length) throw new Error('فصل کامل ساخته نشد؛ دوباره امتحان کن.'); ch.words = ch.words || [];
      await idb.set(key, ch);
    } catch (e) { v.innerHTML = ''; return aiErr(e); }
  }
  let showFa = lsGet('zd:showFa', true); let playing = false; let cur = 0; const t0 = Date.now();
  const para = p => esc(p).replace(/\*\*(.+?)\*\*/g, '<span class="kw" style="color:var(--accent);font-weight:700">$1</span>').replace(/(<span[^>]*>.*?<\/span>)|([A-Za-z][A-Za-z'’-]*)/g, (m, kw, w) => kw || `<span class="tw">${w}</span>`);
  v.innerHTML = `<div class="stack" style="padding-bottom:70px">
  <div class="row" style="position:sticky;top:calc(58px + env(safe-area-inset-top,0px));z-index:5;background:var(--bg);padding-block:4px"><span class="small muted grow">فصل ${faNum(idx + 1)} از ${faNum(b.ch)}</span><button class="icon-btn" id="tr" title="ترجمه">آ</button><button class="icon-btn" id="wl" title="واژه‌ها" style="font-family:var(--en);font-weight:800">W</button></div>
  ${G.settings.img === 'ai' ? `<img alt="" style="border-radius:14px;aspect-ratio:16/10;object-fit:cover;width:100%;background:var(--sunk)" src="https://image.pollinations.ai/prompt/${encodeURIComponent(`illustration, ${b.about}, scene: ${c.beats}, painterly, no text`)}?width=640&height=400&nologo=true&seed=${idx + 7}" onerror="this.remove()">` : ''}
  ${ch.paragraphs.map((p, i) => `<div class="pp" data-i="${i}" style="border-radius:12px;padding:6px 8px;transition:background .2s"><p class="en" style="font-size:17px;line-height:1.9;margin:0">${para(p.en)}</p><p class="fa small muted" style="margin:4px 0 0;text-align:justify"${showFa ? '' : ' hidden'}>${esc(p.fa)}</p></div>`).join('')}
  <div class="card stack" id="cb"><button class="btn ghost sm" id="mkca">🎧 صوت کامل این فصل برای آفلاین و دانلود</button></div>
  <div class="row">${idx > 0 ? `<a class="btn ghost" href="#read/${id}/${idx - 1}">فصل قبل</a>` : ''}<span class="grow"></span>${idx < meta.chapters.length - 1 ? `<a class="btn" href="#read/${id}/${idx + 1}" id="nx">فصل بعد</a>` : `<a class="btn" href="#book/${id}" id="nx">پایان کتاب 🎉</a>`}</div></div>
  <div style="position:fixed;left:0;right:0;bottom:calc(var(--nav) + env(safe-area-inset-bottom,0px));z-index:25;display:flex;justify-content:center;padding:0 max(16px,env(safe-area-inset-left,0px)) 8px"><div class="card row" style="max-width:728px;width:100%;padding:8px;flex-wrap:nowrap;gap:6px">
  <button class="icon-btn on" id="pl">▶</button><button class="icon-btn" id="pv" title="پاراگراف قبل">⏮</button><button class="icon-btn" id="nxp" title="پاراگراف بعد">⏭</button><div class="bar grow"><i id="pb" style="width:0"></i></div><select id="sp" class="in" style="width:auto;min-height:34px;padding:4px"><option value="0.75">۰٫۷۵×</option><option value="0.9" selected>۱×</option><option value="1.1">۱٫۲×</option></select><label class="small row" style="gap:4px;flex-wrap:nowrap"><input type="checkbox" id="rf">فارسی</label></div></div>`;
  const pps = $$('.pp', v);
  const ck = `chapwav:${id}:${idx}`; idb.get(ck).then(bl => { if (bl) audioBox($('#cb'), bl, `${id}-ch${idx + 1}`); });
  $('#mkca').onclick = async () => { const box = $('#cb'); const chunks = []; for (let i = 0; i < ch.paragraphs.length; i += 3) chunks.push({ lang: 'en', emo: 'calm', text: ch.paragraphs.slice(i, i + 3).map(p => p.en.replace(/\*\*/g, '')).join('\n\n') }); try { const bl = await buildAudio(ck, chunks, (i, n) => box.innerHTML = loading(`ساخت صوت… ${faNum(i + 1)} از ${faNum(n)}`)); audioBox(box, bl, `${id}-ch${idx + 1}`); } catch (e) { box.innerHTML = ''; aiErr(e); } };
  const hi = i => { pps.forEach((p, k) => p.style.background = k === i ? 'var(--accent-soft)' : ''); $('#pb').style.width = ((i + 1) / pps.length * 100) + '%'; pps[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const play = async () => {
    playing = true; $('#pl').textContent = '⏸';
    while (playing && cur < pps.length) {
      hi(cur); const r = G.settings.rate; G.settings.rate = +$('#sp').value;
      const okEn = await say(ch.paragraphs[cur].en.replace(/\*\*/g, ''), 'en', 'calm'); G.settings.rate = r;
      if (!okEn || !playing) { playing = false; $('#pl') && ($('#pl').textContent = '▶'); return; } if ($('#rf').checked) { if (!(await say(ch.paragraphs[cur].fa, 'fa', 'calm'))) { playing = false; $('#pl') && ($('#pl').textContent = '▶'); return; } }
      cur++;
    }
    playing = false; $('#pl') && ($('#pl').textContent = '▶'); if (cur >= pps.length) finish();
  };
  const pause = () => { playing = false; stopSpeak(); $('#pl').textContent = '▶'; };
  $('#pl').onclick = () => playing ? pause() : play();
  $('#pv').onclick = () => { pause(); cur = Math.max(0, cur - 1); hi(cur); play(); };
  $('#nxp').onclick = () => { pause(); cur = Math.min(pps.length - 1, cur + 1); hi(cur); play(); };
  pps.forEach((p, i) => p.ondblclick = () => { pause(); cur = i; play(); });
  $('#tr').onclick = () => { showFa = !showFa; lsSet('zd:showFa', showFa); $$('.pp .fa', v).forEach(x => x.hidden = !showFa); $('#tr').classList.toggle('on', showFa); }; $('#tr').classList.toggle('on', showFa);
  $('#wl').onclick = () => { const bg = sheet(`<div class="stack"><b>واژه‌های این فصل</b>${ch.words.map(w => `<div class="row small" style="flex-wrap:nowrap"><button class="icon-btn" data-s="${esc(w.w)}">${I.spk}</button><span class="grow"><b class="en">${esc(w.w)}</b> <span class="en muted">/${esc(w.ipa)}/</span><br>${esc(w.fa)}</span></div>`).join('')}<button class="btn" id="addall">افزودن همه به فلش‌کارت‌ها</button></div>`); $$('[data-s]', bg).forEach(x => x.onclick = () => say(x.dataset.s, 'en', 'calm', x)); $('#addall', bg).onclick = () => { ch.words.forEach(w => addBookWord(w, b)); toast('به فلش‌کارت‌ها اضافه شد.'); bg.remove(); }; };
  v.onclick = e => { const t = e.target.closest('.tw,.kw'); if (!t) return; $$('.tw,.kw', v).forEach(x => x.style.background = ''); t.style.background = 'var(--mark)'; t.style.borderRadius = '4px'; wordPanel(t.textContent, t.closest('p')?.textContent?.slice(0, 200)); };
  highlightLeitner(v);
  const finish = () => { if (!st.read.includes(idx)) { st.read.push(idx); addXP(25); toast('فصل تمام شد ✓ +۲۵ امتیاز'); } saveU(); };
  $('#nx').addEventListener('click', finish);
  clearInterval(window._readTimer); const myHash = location.hash; window._readTimer = setInterval(() => { if (location.hash !== myHash) return clearInterval(window._readTimer); if (document.visibilityState === 'visible') { st.sec += 5; saveU(); } }, 5000);
};
function addBookWord(w, b) {
  let cu = U.custom.find(x => x.id === 'mybooks'); if (!cu) { cu = { id: 'mybooks', en: 'From My Books', fa: 'واژه‌های کتاب‌هایم', icon: '📖', hue: 45, gram: '—', talk: 'دربارهٔ کتاب‌هایی که خواندی صحبت کن.', words: [] }; U.custom.push(cu); }
  if (!cu.words.some(x => x.w.toLowerCase() === w.w.toLowerCase())) cu.words.push({ w: w.w, ipa: w.ipa || '', fa: w.fa, img: '📖', pos: w.pos || '', ex: w.ex || '' });
  const k = 'mybooks:' + w.w; if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; saveU();
}
async function wordPop(word, ch, b) {
  const lw = word.toLowerCase().replace(/[’']s$/, '');
  const local = ch.words.find(w => w.w.toLowerCase() === lw) || ALL_UNITS.flatMap(u => unitWords(u)).find(w => w.w.toLowerCase() === lw);
  const bg = sheet(`<div class="stack"><div class="row"><b class="en grow" style="font-size:22px">${esc(word)}</b><button class="icon-btn" id="ps">${I.spk}</button></div><div id="wm">${local ? `<div class="en muted">/${esc(local.ipa || '')}/</div><div style="font-size:18px">${esc(local.fa)}</div>` : loading('معنی…')}</div><div class="grid2"><button class="btn" id="af">افزودن به فلش‌کارت‌ها</button><a class="btn ghost" href="#dict/${encodeURIComponent(word)}" onclick="this.closest('.sheet-bg').remove()">دیکشنری کامل</a></div><a class="btn line sm" target="_blank" rel="noopener" href="https://www.ldoceonline.com/dictionary/${encodeURIComponent(word.toLowerCase())}">باز کردن «${esc(word)}» در لانگمن ↗</a></div>`);
  say(word, 'en', 'calm'); $('#ps', bg).onclick = e => say(word, 'en', 'calm', e.currentTarget);
  let data = local; const ck = 'dict:' + lw;
  if (!data) { data = G.cache[ck]; if (data) $('#wm', bg).innerHTML = `<div class="en muted">/${esc(data.ipa)}/</div><div style="font-size:18px">${esc(data.fa)}</div><div class="en small muted">${esc(data.ex || '')}</div>`; }
  if (!data) { if (!hasAI() && !firstKeyed()) { $('#wm', bg).innerHTML = '<span class="small muted">برای معنی واژه‌های تازه، کلید هوش مصنوعی لازم است.</span>'; } else try { data = await ai({ max: 300, temp: 0.2, system: 'English-Persian dictionary.', messages: [{ role: 'user', content: `Word "${word}" as used in this sentence context from "${b.t}". JSON {"w":"base form","ipa":"","fa":"Persian meaning in this context","pos":"n|v|adj|adv|prep|phr","ex":"short example"}` }] }); G.cache[ck] = data; saveG('cache'); $('#wm', bg).innerHTML = `<div class="en muted">/${esc(data.ipa)}/</div><div style="font-size:18px">${esc(data.fa)}</div><div class="en small muted">${esc(data.ex || '')}</div>`; } catch (e) { aiErr(e); } }
  $('#af', bg).onclick = () => { if (data) { addBookWord({ ...data, w: data.w || word }, b); toast('اضافه شد.'); } bg.remove(); };
}
