/* زبان رستا — تئاتر داستان صوتی با موسیقی، تمرین‌های آنلاین/آفلاین، چشم‌انداز شخصی */
'use strict';

/* ───────── موسیقی پس‌زمینه (ساخته‌شده در خود مرورگر، بدون فایل و بدون حق نشر) ───────── */
const Music = (() => {
  let ctx, master, timer, nodes = [];
  const MOODS = { // آکوردها به هرتز ریشه + نوع
    calm: { bpm: 60, prog: [[220, 'maj7'], [196, 'maj7'], [174.6, 'maj7'], [196, 'maj']], wave: 'sine' },
    happy: { bpm: 96, prog: [[261.6, 'maj'], [196, 'maj'], [220, 'min'], [174.6, 'maj']], wave: 'triangle' },
    adventure: { bpm: 88, prog: [[146.8, 'min'], [116.5, 'maj'], [130.8, 'maj'], [174.6, 'maj']], wave: 'sawtooth' },
    mystery: { bpm: 54, prog: [[110, 'min'], [116.5, 'maj'], [103.8, 'dim'], [110, 'min']], wave: 'sine' },
    romantic: { bpm: 66, prog: [[174.6, 'maj7'], [164.8, 'min7'], [146.8, 'min7'], [196, 'maj']], wave: 'triangle' },
    tense: { bpm: 72, prog: [[98, 'min'], [103.8, 'maj'], [98, 'min'], [92.5, 'dim']], wave: 'sawtooth' }
  };
  const IV = { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dim: [0, 3, 6] };
  const f = (r, s) => r * Math.pow(2, s / 12);
  function tone(freq, t, dur, type, gain) {
    const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq; fl.type = 'lowpass'; fl.frequency.value = type === 'sawtooth' ? 900 : 2200;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.6, dur / 3)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(fl).connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05); nodes.push(o);
  }
  function play(mood = 'calm') {
    stop(); try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch { return; }
    master = ctx.createGain(); master.gain.value = lsGet('zd:musicVol', 0.5) * 0.18; master.connect(ctx.destination);
    const M = MOODS[mood] || MOODS.calm; const beat = 60 / M.bpm; let bar = 0, next = ctx.currentTime + 0.1;
    const sched = () => {
      while (next < ctx.currentTime + 2) {
        const [root, q] = M.prog[bar % M.prog.length]; const len = beat * 4;
        IV[q].forEach(s => tone(f(root, s), next, len * 1.05, M.wave === 'sawtooth' ? 'triangle' : M.wave, 0.09));
        tone(root / 2, next, len, 'sine', 0.12);
        for (let k = 0; k < 4; k++) if ((bar + k) % 2 === 0 || mood === 'happy' || mood === 'adventure') tone(f(root * 2, IV[q][(k + bar) % IV[q].length]), next + k * beat, beat * 0.9, 'sine', 0.05);
        next += len; bar++;
      }
    };
    sched(); timer = setInterval(sched, 500);
  }
  function stop() { clearInterval(timer); nodes.forEach(n => { try { n.stop(); } catch { } }); nodes = []; try { master?.disconnect(); } catch { } }
  function duck(on) { if (master && ctx) master.gain.setTargetAtTime((on ? 0.35 : 1) * lsGet('zd:musicVol', 0.5) * 0.18, ctx.currentTime, 0.3); }
  return { play, stop, duck, moods: Object.keys(MOODS) };
})();
addEventListener('hashchange', () => { if (!location.hash.startsWith('#theater/')) Music.stop(); });

/* ───────── تئاتر داستان صوتی ───────── */
const VOICES = ['Kore', 'Puck', 'Charon', 'Aoede', 'Fenrir', 'Leda'];
const sceneImg = (s, b, i) => `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic storybook illustration, ${s.img}, warm light, no text, no letters`)}?width=640&height=400&nologo=true&seed=${parseInt(hashStr(b.id), 36) % 9000 + i}`;
async function storyList() { return (await idb.get('stories:' + G.active)) || []; }
routes.theater = async (id) => {
  if (id) return playStory(id);
  setTop('داستان‌های صوتی'); const v = view(); const list = await storyList();
  const cur = currentUnit();
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">🎬 تئاتر داستان</b><span class="muted">داستانی با سناریو، صحنه‌های تصویری، صداپیشه برای هر شخصیت و موسیقی متن — ساخته‌شده با واژه‌های درس فعلی، واژه‌های ضعیفت و درس‌های قبل.</span></div>
  <div class="card stack"><label class="f">حال‌وهوای داستان<select id="md" class="in">${[['adventure', 'ماجرایی'], ['mystery', 'معمایی'], ['happy', 'شاد و خنده‌دار'], ['romantic', 'احساسی'], ['tense', 'هیجانی'], ['calm', 'آرام']].map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
  <label class="f">ایدهٔ داستان (اختیاری)<input id="id" class="in" placeholder="مثلاً: گم شدن چمدان در فرودگاه"></label>
  <button class="btn" id="mk">ساخت داستان تازه با واژه‌های «${esc(cur.fa)}»</button></div>
  ${list.length ? `<div class="sec">داستان‌های من</div>` + list.map(s => `<a class="card row" style="text-decoration:none;color:inherit;flex-wrap:nowrap" href="#theater/${s.id}"><img src="${sceneImg(s.scenes[0], s, 0)}" alt="" style="width:84px;height:56px;object-fit:cover;border-radius:10px;background:var(--sunk)" onerror="this.style.visibility='hidden'"><div class="grow"><b class="en">${esc(s.title)}</b><div class="small muted">${esc(s.fa_title || '')} · ${faNum(s.scenes.length)} صحنه</div></div>${s.done ? '<span class="pill ok">دیده شد</span>' : ''}</a>`).join('') : ''}</div>`;
  $('#mk').onclick = async () => {
    if (needAI(v)) return; const mood = $('#md').value, idea = $('#id').value.trim();
    const words = [...weakWords(8).map(x => x.w.w), ...pick(unitWords(cur), 8).map(w => w.w), ...ALL_UNITS.filter(x => x.idx < cur.idx).slice(-3).flatMap(x => pick(unitWords(x), 2).map(w => w.w))];
    v.innerHTML = loading('در حال نوشتن سناریو و طراحی صحنه‌ها… (حدود ۳۰ ثانیه)');
    try {
      const s = await ai({ heavy: true, max: 9000, temp: 0.9, system: 'You are a screenwriter of short, gripping audio dramas for adult Persian-speaking English learners. Language strictly at the learner level. Natural, idiomatic dialogue.', messages: [{ role: 'user', content: `${learnerContext(cur)}\nMood: ${mood}. ${idea ? 'Idea: ' + idea : 'Invent an original plot set or Iran.'}\nUse ALL these words naturally: ${words.join(', ')}.\nWrite 5-6 scenes; each has a short narration and 2-6 dialogue lines between 2-3 named characters. End with a twist or emotional moment. JSON {"title":"","fa_title":"","mood":"${mood}","characters":[{"name":"","desc_fa":""}],"scenes":[{"title":"","img":"visual description for illustration","narration":"","narration_fa":"","lines":[{"who":"name","en":"","fa":"","emotion":"cheerful|calm|excited|serious|surprised|empathetic"}]}],"vocab":[{"w":"","fa":""}],"quiz":[{"q":"","options":["","","",""],"a":0}]}` }] });
      if (!s.scenes?.length) throw new Error('داستان کامل ساخته نشد؛ دوباره امتحان کن.');
      s.id = 's' + uid(); s.created = isoDay(); const l = await storyList(); l.unshift(s); await idb.set('stories:' + G.active, l.slice(0, 30)); addXP(10); saveU(); go('theater/' + s.id);
    } catch (e) { aiErr(e); routes.theater(); }
  };
};
async function playStory(id) {
  const list = await storyList(); const s = list.find(x => x.id === id); if (!s) return go('theater');
  setTop(s.title, true); const v = view(); const chars = (s.characters || []).map(c => c.name);
  const voiceOf = who => who === 'narrator' ? G.settings.geminiVoice : VOICES[(chars.indexOf(who) + 1) % VOICES.length];
  let showFa = lsGet('zd:showFa', true), playing = false, si = 0, li = -1;
  v.innerHTML = `<div class="stack" style="padding-bottom:80px"><div class="card stack"><b style="font-size:18px" class="en">${esc(s.title)}</b><span class="small muted">${esc(s.fa_title || '')} · شخصیت‌ها: ${(s.characters || []).map(c => `<b>${esc(c.name)}</b> (${esc(c.desc_fa)})`).join('، ')}</span></div>
  ${s.scenes.map((sc, i) => `<div class="card stack sc" data-s="${i}"><span class="pill acc" style="align-self:flex-start">صحنهٔ ${faNum(i + 1)} · <span class="en">${esc(sc.title)}</span></span>
  ${G.settings.img === 'ai' ? `<img alt="" src="${sceneImg(sc, s, i)}" loading="lazy" style="border-radius:12px;aspect-ratio:16/10;object-fit:cover;width:100%;background:var(--sunk)" onerror="this.remove()">` : ''}
  <div class="ln" data-l="-1"><i class="en" style="font-size:16px">${esc(sc.narration)}</i><div class="small muted fa"${showFa ? '' : ' hidden'}>${esc(sc.narration_fa)}</div></div>
  ${(sc.lines || []).map((l, k) => `<div class="ln" data-l="${k}" style="border-radius:10px;padding:4px 6px"><span class="pill mark">${esc(l.who)}</span> <span class="en" style="font-size:16px">${esc(l.en)}</span><div class="small muted fa"${showFa ? '' : ' hidden'}>${esc(l.fa)}</div></div>`).join('')}</div>`).join('')}
  ${s.vocab?.length ? `<div class="card stack small"><b>واژه‌های این داستان</b>${s.vocab.map(w => `<span><b class="en">${esc(w.w)}</b> — ${esc(w.fa)}</span>`).join('')}<button class="btn ghost sm" id="addv">افزودن همه به فلش‌کارت‌ها</button></div>` : ''}
  <div id="qz"></div></div>
  <div style="position:fixed;left:0;right:0;bottom:calc(var(--nav) + env(safe-area-inset-bottom,0px));z-index:25;display:flex;justify-content:center;padding:0 max(16px,env(safe-area-inset-left,0px)) 8px"><div class="card row" style="max-width:728px;width:100%;padding:8px;flex-wrap:nowrap;gap:6px">
  <button class="icon-btn on" id="pl">▶</button><button class="icon-btn" id="nx">⏭</button><span class="small grow" id="st">آماده</span><label class="small">🎵<input type="range" id="vol" min="0" max="1" step="0.1" value="${lsGet('zd:musicVol', 0.5)}" style="width:70px"></label><button class="icon-btn" id="tr">آ</button></div></div>`;
  const hi = (i, k) => { $$('.ln', v).forEach(x => x.style.background = ''); const el = $(`.sc[data-s="${i}"] .ln[data-l="${k}"]`, v); if (el) { el.style.background = 'var(--accent-soft)'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } };
  const speakLine = async (text, who, emo) => {
    const keep = G.settings.geminiVoice; if (G.settings.prov.gemini.key) G.settings.geminiVoice = voiceOf(who);
    const ve = G.settings.voiceEn; if (G.settings.prov.gemini.key) G.settings.voiceEn = 'gemini';
    try { const ci = chars.indexOf(who); Spatial.at(who === 'narrator' ? 0 : [-1.4, 1.4, -0.7, 0.7][ci % 4], who === 'narrator' ? -0.6 : -1.3); Music.duck(true); return await say(text, 'en', emo || 'calm'); } finally { G.settings.geminiVoice = keep; G.settings.voiceEn = ve; Music.duck(false); Spatial.at(0, -1.2); }
  };
  let gen = 0; const myHash = location.hash;
  const run = async () => {
    const my = ++gen; playing = true; $('#pl').textContent = '⏸'; Music.play(s.mood); const live = () => playing && my === gen && location.hash === myHash;
    for (; si < s.scenes.length && live(); si++, li = -1) {
      const sc = s.scenes[si]; if (!$('#st')) break; $('#st').textContent = `صحنهٔ ${faNum(si + 1)} از ${faNum(s.scenes.length)}`;
      if (li < 0) { hi(si, -1); if (!(await speakLine(sc.narration, 'narrator', 'calm')) || !live()) break; li = 0; }
      let cut = false; for (; li < (sc.lines || []).length && live(); li++) { const l = sc.lines[li]; hi(si, li); if (!(await speakLine(l.en, l.who, l.emotion)) || !live()) { cut = true; break; } await sleep(250); }
      if (cut || !live()) break; await sleep(700);
    }
    if (my !== gen) return; if (si >= s.scenes.length && location.hash === myHash) { finish(); }
    playing = false; $('#pl') && ($('#pl').textContent = '▶');
  };
  const pause = () => { playing = false; stopSpeak(); Music.stop(); $('#pl').textContent = '▶'; };
  $('#pl').onclick = () => playing ? pause() : run();
  $('#nx').onclick = () => { pause(); si = Math.min(s.scenes.length - 1, si + 1); li = -1; run(); };
  $('#vol').oninput = e => { lsSet('zd:musicVol', +e.target.value); if (playing) { Music.stop(); Music.play(s.mood); } };
  $('#tr').onclick = () => { showFa = !showFa; lsSet('zd:showFa', showFa); $$('.fa', v).forEach(x => x.hidden = !showFa); };
  $('#addv') && ($('#addv').onclick = () => { s.vocab.forEach(w => addBookWord({ w: w.w, fa: w.fa }, { t: s.title })); toast('اضافه شد.'); });
  const finish = async () => {
    Music.stop(); if (!s.done) { s.done = true; addXP(20); saveU(); await idb.set('stories:' + G.active, list); }
    if (!s.quiz?.length) return; let score = 0, qi = 0; const qz = $('#qz');
    const ask = () => { if (qi >= s.quiz.length) { qz.innerHTML = `<div class="card" style="text-align:center"><div class="score">${faNum(score)}/${faNum(s.quiz.length)}</div><b>${score === s.quiz.length ? 'آفرین! همه را درست فهمیدی 🎉' : 'خوب بود! یک بار دیگر گوش بده.'}</b></div>`; addXP(score * 3); saveU(); return; }
      const q = s.quiz[qi]; qz.innerHTML = `<div class="card stack"><b>سؤال درک مطلب ${faNum(qi + 1)}</b><div class="en">${esc(q.q)}</div><div class="opts">${q.options.map((o, k) => `<button class="opt en" data-k="${k}">${esc(o)}</button>`).join('')}</div></div>`;
      $$('.opt', qz).forEach(b => b.onclick = () => { if (qz.dataset.lock === String(qi)) return; qz.dataset.lock = String(qi); const ok = +b.dataset.k === +q.a; b.classList.add(ok ? 'right' : 'wrong'); if (ok) score++; else $$('.opt', qz)[q.a]?.classList.add('right'); setTimeout(() => { qi++; ask(); }, 1100); }); };
    ask(); qz.scrollIntoView({ behavior: 'smooth' });
  };
}

/* ───────── تمرین‌ها: آفلاین (بدون اینترنت) + آنلاین با هوش مصنوعی ───────── */
function offlineItems(u, n = 12) {
  const words = unitWords(u).filter(w => w.ex && w.ex.toLowerCase().includes(w.w.toLowerCase().split(' ')[0]));
  const items = [];
  for (const w of pick(words, n)) {
    const t = ['blank', 'order', 'dict', 'blank'][Math.floor(Math.random() * 4)];
    if (t === 'blank') { const re = new RegExp(w.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); items.push({ type: 'blank', q: w.ex.replace(re, '_____'), a: w.w, hint: w.fa, full: w.ex }); }
    else if (t === 'order') { const toks = w.ex.replace(/[.?!]$/, '').split(' '); if (toks.length < 3) continue; items.push({ type: 'order', toks: shuffle(toks), a: toks.join(' '), hint: w.fa, full: w.ex }); }
    else items.push({ type: 'dict', a: w.ex.replace(/[.?!]$/, ''), hint: 'آنچه می‌شنوی بنویس', full: w.ex });
  }
  return items;
}
const norm = s => s.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
routes.practice = (id) => {
  const u = unitById(id) || currentUnit(); setTop('تمرین · ' + u.fa, true); const v = view();
  v.innerHTML = `<div class="stack"><div class="card stack"><b>تمرین‌های «${esc(u.fa)}»</b><span class="small muted">تمرین آفلاین بدون اینترنت کار می‌کند؛ تمرین هوشمند گرامر و مکالمه را می‌سنجد. برای هر اشتباه، با یک دکمه تمرین مشابه می‌گیری.</span>
  <div class="grid2"><button class="btn" id="off">✍️ تمرین آفلاین</button><button class="btn ghost" id="on">🧠 تمرین هوشمند (آنلاین)</button></div></div><div id="ex"></div></div>`;
  $('#off').onclick = () => { const it = offlineItems(u); if (!it.length) return toast('اول لغات این درس را بساز.'); runEx($('#ex'), it, u); };
  $('#on').onclick = async () => {
    const ex = $('#ex'); if (needAI(ex)) return; ex.innerHTML = loading('در حال طراحی تمرین‌ها…');
    try { const r = await ai({ temp: 0.6, system: 'You design varied, accurate ESL exercises for Persian speakers.', messages: [{ role: 'user', content: `${learnerContext(u)}\nUnit "${u.en}", grammar "${u.gram}", words: ${unitWords(u).slice(0, 30).map(w => w.w).join(', ')}.\nCreate 10 mixed exercises focused on the grammar and conversation of this unit, plus 2 recycling earlier units/weak words. Types: "blank" (fill one gap), "fix" (correct the wrong sentence), "translate" (Persian sentence → English), "reply" (write a natural reply to a line). JSON {"items":[{"type":"blank|fix|translate|reply","q":"","a":"model answer","hint":"Persian hint"}]}` }] });
      runEx(ex, r.items || [], u, true);
    } catch (e) { ex.innerHTML = ''; aiErr(e); }
  };
};
function runEx(el, items, u, online) {
  let i = 0, ok = 0; const wrongs = [];
  const draw = () => {
    if (i >= items.length) {
      const pct = Math.round(ok / Math.max(1, items.length) * 100); addXP(ok * 3); logMistakes(wrongs, 'practice'); saveU();
      el.innerHTML = `<div class="card stack" style="text-align:center"><div class="score">${faNum(pct)}٪</div><b>${pct >= 90 ? 'عالی! 🌟' : pct >= 70 ? 'خوب بود 👍' : 'ادامه بده، داری یاد می‌گیری 💪'}</b>${wrongs.length ? `<div class="small" style="text-align:right">${wrongs.map(w => `<div>❌ <span class="en">${esc(w.wrong)}</span> ← ✅ <b class="en">${esc(w.right)}</b></div>`).join('')}</div><button class="btn" id="sim">ساخت تمرین مشابه برای اشتباه‌هایم</button>` : ''}</div>`;
      $('#sim') && ($('#sim').onclick = () => similar(el, wrongs, u)); return;
    }
    const it = items[i];
    const label = { blank: 'جای خالی را پر کن', order: 'کلمه‌ها را مرتب کن', dict: 'گوش بده و بنویس', fix: 'جمله را درست کن', translate: 'به انگلیسی ترجمه کن', reply: 'جواب طبیعی بده' }[it.type] || 'جواب بده';
    el.innerHTML = `<div class="stack"><div class="row small"><span class="grow muted">تمرین ${faNum(i + 1)} از ${faNum(items.length)}</span><span class="pill ok">${faNum(ok)} درست</span></div><div class="bar"><i style="width:${i / items.length * 100}%"></i></div>
    <div class="card stack"><span class="pill acc" style="align-self:flex-start">${label}</span>
    ${it.type === 'dict' ? `<button class="icon-btn on" style="width:72px;height:72px" id="pl">${I.spk}</button>` : it.type === 'order' ? `<div class="row" id="tk">${it.toks.map((t, k) => `<button class="pill acc en" style="font-size:15px;padding:6px 12px" data-k="${k}">${esc(t)}</button>`).join('')}</div>` : `<div class="${it.type === 'translate' ? '' : 'en'}" style="font-size:18px">${esc(it.q)}</div>`}
    <input id="ans" class="in" dir="ltr" autocomplete="off" placeholder="جواب…"><div class="small muted">${esc(it.hint || '')}</div><div id="fb"></div><button class="btn" id="ck">بررسی</button></div></div>`;
    const ans = $('#ans', el);
    if (it.type === 'dict') { const p = () => browserSay(it.a, 'en', 0.85); setTimeout(p, 200); $('#pl', el).onclick = p; }
    if (it.type === 'order') $$('[data-k]', el).forEach(b => b.onclick = () => { ans.value = (ans.value + ' ' + b.textContent).trim(); b.disabled = true; b.style.opacity = .3; });
    ans.onkeydown = e => { if (e.key === 'Enter') $('#ck', el).click(); };
    $('#ck', el).onclick = async () => {
      const a = ans.value.trim(); if (!a) return; const btn = $('#ck', el); btn.disabled = true;
      let good, fb;
      if (!online || ['blank', 'order', 'dict'].includes(it.type)) { good = norm(a) === norm(it.a) || similarity(a, it.a) >= 92; fb = good ? '✅ درست!' : `❌ جواب درست: <b class="en">${esc(it.a)}</b>`; }
      else { try { const r = await ai({ temp: 0.1, system: 'Strict but fair English teacher. Accept any natural correct answer.', messages: [{ role: 'user', content: `Exercise (${it.type}): ${it.q}\nModel answer: ${it.a}\nLearner answer: ${a}\nJSON {"correct":true|false,"feedback":"Persian, short, kind","better":"best natural version"}` }] }); good = !!r.correct; fb = `${good ? '✅' : '❌'} ${esc(r.feedback)}<br><b class="en">${esc(r.better || it.a)}</b>`; } catch { good = similarity(a, it.a) >= 85; fb = good ? '✅' : `❌ <b class="en">${esc(it.a)}</b>`; } }
      if (good) ok++; else wrongs.push({ wrong: a, right: it.a, why: it.q || it.full || '' });
      $('#fb', el).innerHTML = `<div class="${good ? 'notice soft' : 'fix'}" style="max-width:none">${fb}</div>`; say(it.full || it.a, 'en', 'calm');
      btn.disabled = false; btn.textContent = 'بعدی'; btn.onclick = () => { i++; draw(); };
    };
  };
  draw();
}
async function similar(el, wrongs, u) {
  if (needAI(el)) return; el.innerHTML = loading('در حال ساخت تمرین مشابه برای اشتباه‌هایت…');
  try { const r = await ai({ temp: 0.6, system: 'You design targeted remedial ESL exercises for Persian speakers.', messages: [{ role: 'user', content: `The learner made these mistakes:\n${wrongs.map(w => `${w.wrong} → ${w.right} (${w.why})`).join('\n')}\nFor each mistake, create 2 NEW similar exercises practicing the same point (different words/sentences). JSON {"items":[{"type":"blank|fix|translate","q":"","a":"","hint":"Persian hint explaining the point"}]}` }] });
    runEx(el, r.items || [], u, true);
  } catch (e) { el.innerHTML = ''; aiErr(e); }
}

/* ───────── چشم‌انداز شخصی ───────── */
function forecast() {
  const last = [...Array(14)].map((_, i) => U.log[addDays(isoDay(), -i)]?.min || 0); const avgMin = last.reduce((a, b) => a + b, 0) / 14;
  const p = paceInfo(); const minsPerUnit = p.mastered ? Math.max(90, p.minutes / p.mastered) : 240; // تخمین اولیه: ۴ ساعت برای هر درس
  const dailyMin = Math.max(avgMin, U.plan?.minutes ? U.plan.minutes * 0.5 : 20);
  const daysPerUnit = minsPerUnit / Math.max(10, dailyMin);
  const cur = currentUnit();
  const at = idx => addDays(isoDay(), Math.ceil((idx - cur.idx + 1) * daysPerUnit));
  const milestones = [
    ['🙋', 'معرفی خودت و خانواده، صحبت از کارهای روزانه', ALL_UNITS.find(u => u.id === 'family').idx],
    ['🛒', 'خرید، رستوران و پرسیدن نشانی', ALL_UNITS.find(u => u.id === 'city').idx],
    ['🩺', 'داروخانه، دکتر و سفر', ALL_UNITS.find(u => u.id === 'travel').idx],
    ['💼', 'مصاحبهٔ کاری و صحبت در محیط کار', ALL_UNITS.find(u => u.id === 'work').idx],
    ['🏠', 'حل مشکلات روزمره: صاحبخانه، بانک، شکایت', ALL_UNITS.find(u => u.id === 'banking').idx],
    ['🗣️', 'مکالمهٔ روان روزمره (سطح متوسط B1)', ALL_UNITS.length - 1]
  ].map(([ic, t, idx]) => ({ ic, t, idx, done: idx < cur.idx || isMastered(ALL_UNITS[idx]), date: at(idx) }));
  return { avgMin: Math.round(avgMin), daysPerUnit: +daysPerUnit.toFixed(1), milestones, dailyMin: Math.round(dailyMin) };
}
routes.vision = () => {
  setTop('چشم‌انداز من', true); const f = forecast(); const v = view();
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">🔭 با همین سرعت به کجا می‌رسی؟</b><span class="muted">بر اساس ${faNum(f.avgMin)} دقیقه مطالعهٔ روزانهٔ اخیرت و سرعت قبولی در درس‌ها (هر درس حدود ${faNum(f.daysPerUnit)} روز).</span></div>
  ${f.milestones.map(m => `<div class="card row" style="flex-wrap:nowrap"><span style="font-size:28px">${m.ic}</span><div class="grow"><b>${esc(m.t)}</b><div class="small muted">${m.done ? 'رسیدی ✓' : 'پیش‌بینی: ' + jLabel(m.date, true)}</div></div>${m.done ? '<span class="pill ok">✓</span>' : ''}</div>`).join('')}
  <div class="notice soft small">اگر روزی ${faNum(f.dailyMin + 20)} دقیقه بخوانی، همهٔ این تاریخ‌ها حدود ${faNum(Math.round(20 / Math.max(1, f.dailyMin + 20) * 100))}٪ جلوتر می‌آیند.</div>
  <button class="btn ghost" id="mv">پیام ${esc(G.settings.teacher)} دربارهٔ آینده‌ام</button><div id="mvo"></div></div>`;
  $('#mv').onclick = async () => { if (needAI($('#mvo'))) return; $('#mvo').innerHTML = loading(); try { const r = await ai({ system: TEACHER_STYLE(), messages: [{ role: 'user', content: `${learnerContext()}\nForecast: ${f.milestones.map(m => `${m.t}: ${m.done ? 'done' : m.date}`).join('; ')}. Daily study ${f.avgMin} min.\nIn Persian (5-6 sentences), give a realistic, emotional, motivating vision: what they will be able to do and by when (use the dates), what changes in their real life, and one concrete thing to do today. JSON {"say":"","emotion":"excited|proud|encouraging"}` }] }); $('#mvo').innerHTML = `<div class="notice soft">${esc(r.say)}</div>`; say(r.say, 'fa', r.emotion); } catch (e) { $('#mvo').innerHTML = ''; aiErr(e); } };
};
