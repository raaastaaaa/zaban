/* زبان دوم — دیکشنری هوشمند انگلیسی‌به‌فارسی و فارسی‌به‌انگلیسی (مدخل کامل با هوش مصنوعی، ذخیره برای استفادهٔ آفلاین) */
'use strict';
const dictHist = () => lsGet('zd:dicthist', []);
function pushHist(w) { const h = dictHist().filter(x => x !== w); h.unshift(w); lsSet('zd:dicthist', h.slice(0, 40)); }
function localSuggest(q) {
  q = q.toLowerCase(); if (q.length < 2) return [];
  const all = [...ALL_UNITS, ...WS_UNITS].flatMap(u => unitWords(u).map(w => ({ w, u })));
  const fa = /[؀-ۿ]/.test(q);
  return all.filter(x => fa ? x.w.fa.includes(q) : x.w.w.toLowerCase().startsWith(q)).slice(0, 8);
}
function addDictWord(e) {
  let cu = U.custom.find(x => x.id === 'mydict'); if (!cu) { cu = { id: 'mydict', en: 'My Dictionary', fa: 'واژه‌های دیکشنری من', icon: '📕', hue: 210, gram: '—', talk: 'با واژه‌هایی که در دیکشنری جستجو کردی جمله بساز.', words: [] }; U.custom.push(cu); }
  const s = e.senses?.[0] || {};
  if (!cu.words.some(x => x.w.toLowerCase() === e.word.toLowerCase())) cu.words.push({ w: e.word, ipa: e.ipa_us || '', fa: s.fa || '', img: '📕', pos: s.posKey || '', ex: s.examples?.[0]?.en || '' });
  const k = 'mydict:' + e.word; if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; addXP(2); saveU();
}
routes.dict = (q = '') => {
  setTop('دیکشنری'); const v = view();
  v.innerHTML = `<div class="stack"><div class="card stack"><div class="row" style="flex-wrap:nowrap"><input id="dq" class="in grow" dir="auto" placeholder="واژه یا عبارت انگلیسی، یا معنی فارسی…" value="${esc(q)}" autocomplete="off"><span id="dm"></span><button class="btn" id="dg">جستجو</button></div><div id="sug" class="row small"></div></div><div id="dr"></div></div>`;
  const inp = $('#dq'), sug = $('#sug');
  const showHist = () => { const h = dictHist(); sug.innerHTML = h.length ? `<span class="muted">اخیر:</span>${h.slice(0, 12).map(w => `<button class="pill" data-w="${esc(w)}">${esc(w)}</button>`).join('')}` : '<span class="muted">مثلاً: get, take off, interview, «تجربه»</span>'; bindPills(); };
  const bindPills = () => $$('[data-w]', sug).forEach(b => b.onclick = () => { inp.value = b.dataset.w; search(); });
  inp.oninput = () => { const s = localSuggest(inp.value.trim()); if (!inp.value.trim()) return showHist(); sug.innerHTML = s.map(x => `<button class="pill acc" data-w="${esc(x.w.w)}"><span class="en">${esc(x.w.w)}</span> · ${esc(x.w.fa)}</button>`).join(''); bindPills(); };
  inp.onkeydown = e => { if (e.key === 'Enter') search(); };
  $('#dg').onclick = () => search();
  $('#dm').append(micButton(t => { inp.value = t; search(); }));
  const search = async () => {
    const w = inp.value.trim(); if (!w) return; const out = $('#dr');
    if (/[؀-ۿ]/.test(w)) return faSearch(w, out);
    const key = 'dict:' + w.toLowerCase(); let e = await idb.get(key);
    if (!e) {
      if (needAI(out)) return; out.innerHTML = loading('در حال آماده کردن مدخل کامل «' + w + '»…');
      try {
        e = await ai({ max: 5000, temp: 0.2, system: 'You are a senior lexicographer writing a complete learner\'s dictionary entry (like the best learner\'s dictionaries) for Persian-speaking learners. Original wording only. Accuracy is critical: correct IPA, real collocations, natural examples, precise Persian equivalents.', messages: [{ role: 'user', content: `Full entry for "${w}". If misspelled, use the intended word. JSON {"word":"","ipa_us":"","ipa_uk":"","cefr":"A1|A2|B1|B2|C1|C2","frequency":"very common|common|less common","forms":"inflections e.g. take, took, taken, taking","family":[{"w":"","pos":"","fa":""}],"senses":[{"pos":"noun|verb|adjective|adverb|phrasal verb|preposition|conjunction|idiom","posKey":"n|v|adj|adv|phr|prep","def":"clear English definition with simple words","fa":"Persian equivalent(s)","grammar":"pattern e.g. take sth to sb / [countable]","register":"formal|informal|spoken|written|''","examples":[{"en":"","fa":""}]}],"collocations":[{"en":"","fa":""}],"phrasal":[{"en":"","fa":""}],"idioms":[{"en":"","fa":""}],"synonyms":[""],"antonyms":[""],"usage":"Persian usage note: differences from similar words, US/UK differences","mistakes":["typical mistakes of Persian speakers (Persian)"]}. Give all main senses (up to 8), 2 examples each.` }] });
        if (!e.word || !e.senses?.length) throw new Error('مدخل کامل ساخته نشد؛ دوباره امتحان کن.');
        await idb.set(key, e);
      } catch (err) { out.innerHTML = ''; return aiErr(err); }
    }
    pushHist(e.word); render(e, out);
  };
  const faSearch = async (w, out) => {
    const local = localSuggest(w); if (needAI(out)) return; out.innerHTML = loading();
    try {
      const r = await ai({ temp: 0.2, system: 'Persian-English dictionary for learners.', messages: [{ role: 'user', content: `Persian: "${w}". Give the best English equivalents with nuance. JSON {"items":[{"en":"","pos":"","note":"Persian: when to use","example":""}]}` }] });
      out.innerHTML = `<div class="stack">${(r.items || []).map(x => `<button class="card row" style="text-align:right;border:0" data-w="${esc(x.en)}"><div class="grow"><b class="en">${esc(x.en)}</b> <span class="pill">${esc(x.pos)}</span><div class="small">${esc(x.note)}</div><div class="en small muted">${esc(x.example)}</div></div><span class="muted">›</span></button>`).join('')}${local.length ? `<div class="small muted">در درس‌ها: ${local.map(x => esc(x.w.w)).join('، ')}</div>` : ''}</div>`;
      $$('[data-w]', out).forEach(b => b.onclick = () => { inp.value = b.dataset.w; search(); });
    } catch (err) { out.innerHTML = ''; aiErr(err); }
  };
  const render = (e, out) => {
    const acc = (t, a) => { const keep = G.settings.accent; G.settings.accent = a; say(t, 'en', 'calm').finally(() => G.settings.accent = keep); };
    const list = (title, arr, f) => arr?.length ? `<div class="card stack"><b>${title}</b>${arr.map(f).join('')}</div>` : '';
    out.innerHTML = `<div class="stack">
    <div class="card stack"><div class="row"><b class="en grow" style="font-size:28px">${esc(e.word)}</b><span class="pill acc">${esc(e.cefr || '')}</span><span class="pill">${esc({ 'very common': 'بسیار پرکاربرد', common: 'پرکاربرد', 'less common': 'کم‌کاربردتر' }[e.frequency] || e.frequency || '')}</span></div>
    <div class="row"><button class="btn ghost sm" id="us">🇺🇸 <span class="en">/${esc(e.ipa_us)}/</span></button><button class="btn ghost sm" id="uk">🇬🇧 <span class="en">/${esc(e.ipa_uk)}/</span></button></div>
    ${e.forms ? `<div class="small"><b>صورت‌ها:</b> <span class="en">${esc(e.forms)}</span></div>` : ''}
    <div class="row"><button class="btn sm" id="add">+ افزودن به فلش‌کارت</button><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.ldoceonline.com/dictionary/${encodeURIComponent(e.word.toLowerCase().replace(/\s+/g, '-'))}">باز کردن در لانگمن ↗</a><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.oxfordlearnersdictionaries.com/search/english/?q=${encodeURIComponent(e.word)}">آکسفورد ↗</a><button class="btn line sm" id="re">ساخت دوباره</button></div></div>
    ${e.senses.map((s, i) => `<div class="card stack"><div class="row"><span class="pill mark">${faNum(i + 1)}</span><span class="pill">${esc(s.pos)}</span>${s.register ? `<span class="pill">${esc(s.register)}</span>` : ''}${s.grammar ? `<span class="en small muted">${esc(s.grammar)}</span>` : ''}</div><div class="en">${esc(s.def)}</div><b>${esc(s.fa)}</b>${(s.examples || []).map(x => `<div class="row small" style="flex-wrap:nowrap"><button class="icon-btn" style="width:30px;height:30px" data-say="${esc(x.en)}">${I.spk}</button><div><span class="en">${esc(x.en)}</span><br><span class="muted">${esc(x.fa)}</span></div></div>`).join('')}</div>`).join('')}
    ${list('همنشین‌ها (Collocations)', e.collocations, x => `<div class="small"><span class="en"><b>${esc(x.en)}</b></span> — ${esc(x.fa)}</div>`)}
    ${list('افعال چندبخشی', e.phrasal, x => `<div class="small"><span class="en"><b>${esc(x.en)}</b></span> — ${esc(x.fa)}</div>`)}
    ${list('اصطلاحات', e.idioms, x => `<div class="small"><span class="en"><b>${esc(x.en)}</b></span> — ${esc(x.fa)}</div>`)}
    ${list('خانوادهٔ واژه', e.family, x => `<div class="small"><span class="en"><b>${esc(x.w)}</b></span> <span class="pill">${esc(x.pos)}</span> ${esc(x.fa)}</div>`)}
    ${(e.synonyms?.length || e.antonyms?.length) ? `<div class="card stack small">${e.synonyms?.length ? `<div><b>هم‌معنی:</b> ${e.synonyms.map(x => `<button class="pill acc en" data-w="${esc(x)}">${esc(x)}</button>`).join(' ')}</div>` : ''}${e.antonyms?.length ? `<div><b>متضاد:</b> ${e.antonyms.map(x => `<button class="pill en" data-w="${esc(x)}">${esc(x)}</button>`).join(' ')}</div>` : ''}</div>` : ''}
    ${e.usage ? `<div class="notice soft small"><b>نکتهٔ کاربرد:</b> ${esc(e.usage)}</div>` : ''}
    ${e.mistakes?.length ? `<div class="card stack small"><b>اشتباه‌های رایج فارسی‌زبان‌ها</b><ul class="list">${e.mistakes.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}</div>`;
    $('#us').onclick = () => acc(e.word, 'US'); $('#uk').onclick = () => acc(e.word, 'UK');
    $$('[data-say]', out).forEach(b => b.onclick = () => say(b.dataset.say, 'en', 'calm', b));
    $$('[data-w]', out).forEach(b => b.onclick = () => { inp.value = b.dataset.w; search(); });
    $('#add').onclick = () => { addDictWord(e); toast('به فلش‌کارت‌ها اضافه شد.'); };
    $('#re').onclick = async () => { await idb.del('dict:' + e.word.toLowerCase()); await idb.del('dict:' + inp.value.trim().toLowerCase()); search(); };
    say(e.word, 'en', 'calm');
  };
  if (q) search(); else { showHist(); const pool = [...ALL_UNITS, ...WS_UNITS].filter(u => isOpen(u)).flatMap(u => unitWords(u)); const d = new Date(); const w = pool[(d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % Math.max(1, pool.length)];
    if (w) $('#dr').innerHTML = `<div class="card stack"><span class="pill mark" style="align-self:flex-start">واژهٔ امروز</span><b class="en" style="font-size:24px">${esc(w.w)}</b><span class="en muted">/${esc(w.ipa)}/</span><span>${esc(w.fa)}</span><span class="en small">${esc(w.ex || '')}</span><button class="btn ghost sm" id="wod">مدخل کامل</button></div>`, $('#wod').onclick = () => { inp.value = w.w; search(); }; }
};
