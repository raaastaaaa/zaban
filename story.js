/* ───────── داستان صوتی هر درس (همهٔ زبان‌ها، آفلاین) ─────────
   متن: lessons/story/<زبان>/<درس>.json  ·  صدا: audio/story/<زبان>/<درس>/<شمارهٔ جمله>.mp3 (انگلیسی: US و UK)
   پخش پیوسته و بی‌مکث با موتور صدا، رنگی شدن جملهٔ در حال پخش، ترجمهٔ فارسی، واژه‌ها و سؤال درک مطلب */
const storyDir = () => tl() === 'en' ? 'en' : (typeof OFFLINE_DIR !== 'undefined' && OFFLINE_DIR[tlDia()[2]]) || null;
const storyAudioDir = () => tl() === 'en' ? 'en/' + (G.settings.accent === 'UK' ? 'UK' : 'US') : storyDir();
async function storyGet(id) { const d = storyDir(); if (!d) return null; try { const r = await fetch(`lessons/story/${d}/${id}.json`); return r.ok ? await r.json() : null; } catch { return null; } }
const storyLink = (id, title) => `<a class="card row story-cta" href="#story/${esc(id)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span style="font-size:28px">🎧</span><span class="grow"><b>داستان صوتی این درس</b><br><span class="small muted">${esc(title || 'یک داستان کوتاه با واژه‌های همین درس — با صدای بومی، متن و ترجمه')}</span></span><span class="pill">▶</span></a>`;

routes.story = async (id) => {
  if (!id) return storyIndex();
  setTop('داستان صوتی', true); const v = view(); v.innerHTML = loading('داستان را باز می‌کنم…');
  const S = await storyGet(id);
  if (!S) { v.innerHTML = `<div class="card stack"><b>داستان صوتی این درس هنوز آماده نیست.</b><span class="small muted">به‌زودی برای همهٔ درس‌ها اضافه می‌شود.</span><a class="btn" href="#story">همهٔ داستان‌ها</a></div>`; return; }
  const ad = storyAudioDir(); const tr = lsGet('zd:storyTr', true);
  const who = w => w === 'A' ? '👩' : w === 'B' ? '👨' : '📖';
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:19px" class="en keep-en" dir="auto">${esc(S.title)}</b><span>${esc(S.title_fa || '')}</span>
    <div class="row"><button class="btn" id="sply">▶ پخش داستان</button><button class="btn line sm" id="str">${tr ? 'پنهان کردن ترجمه' : 'نمایش ترجمه'}</button>${tl() === 'en' ? `<span class="pill">${G.settings.accent === 'UK' ? '🇬🇧 بریتانیایی' : '🇺🇸 آمریکایی'}</span>` : ''}</div></div>
    <div class="card stack story ${tr ? 'tr' : ''}" id="sto">${S.lines.map((l, i) => `<div class="st-line" data-i="${i}"><span class="st-who">${who(l.who)}</span><div class="grow"><p class="en" dir="auto">${esc(l.t)}</p><p class="fa-tr small">${esc(l.fa || '')}</p></div></div>`).join('')}</div>
    ${(S.words || []).length ? `<div class="sec">🔑 واژه‌های داستان</div><div class="card stack">${S.words.map(w => `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><button class="chip en" data-say="${esc(w.w)}" dir="auto">🔊 ${esc(w.w)}</button><span class="small">${esc(w.fa)}</span></div>`).join('')}</div>` : ''}
    ${(S.quiz || []).length ? `<div class="sec">❓ فهمیدی؟</div><div class="stack">${S.quiz.map((q, qi) => `<div class="card stack"><b>${esc(q.q)}</b><div class="wb-opts">${q.opts.map((o, oi) => `<button class="chip" data-q="${qi}" data-o="${oi}">${esc(o)}</button>`).join('')}</div></div>`).join('')}</div>` : ''}</div>`;
  const lines = [...v.querySelectorAll('.st-line')]; let playing = false;
  const mark = i => { lines.forEach((el, j) => el.classList.toggle('on', j === i)); if (lines[i]) lines[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); };
  const urlOf = i => `audio/story/${ad}/${id}/${i}.mp3`;
  async function playFrom(start) {
    haltAudio(); playing = true; $('#sply').textContent = '⏸ توقف'; const myGen = AE.gen;
    // پیش‌بارگذاری چند جملهٔ بعدی و چیدن پشت سر هم (بدون مکث و پرش)
    let at = AE.now() + 0.05; const bufs = []; const get = i => bufs[i] || (bufs[i] = AE.decode(urlOf(i)).catch(() => null));
    for (let i = start; i < S.lines.length; i++) {
      for (let k = i; k < Math.min(i + 3, S.lines.length); k++) get(k);
      const buf = await get(i); if (!playing || AE.gen !== myGen) return;
      if (!buf) { mark(i); await say(S.lines[i].t, 'en', 'calm'); at = AE.now() + 0.05; continue; } // اگر فایل آفلاین نبود
      const r = AE.schedule(buf, Math.max(at, AE.now() + 0.02)); const gap = S.lines[i + 1] && S.lines[i + 1].who !== S.lines[i].who ? 0.45 : 0.3;
      setTimeout(() => { if (playing && AE.gen === myGen) mark(i); }, Math.max(0, (r.start - AE.now()) * 1000));
      at = r.end + gap;
      if (r.end - AE.now() > 4) await new Promise(res => setTimeout(res, (r.end - AE.now() - 3) * 1000));
    }
    await new Promise(res => setTimeout(res, Math.max(0, (at - AE.now()) * 1000)));
    if (AE.gen === myGen) { playing = false; $('#sply').textContent = '▶ پخش دوباره'; mark(-1); const Lg = todayLog(); Lg.min = (Lg.min || 0) + Math.round(S.lines.length * 4 / 60); Lg.news = (Lg.news || 0) + 1; addXP(5); saveU(); }
  }
  $('#sply').onclick = () => { if (playing) { playing = false; haltAudio(); $('#sply').textContent = '▶ ادامه'; return; } const cur = lines.findIndex(el => el.classList.contains('on')); playFrom(cur > 0 ? cur : 0); };
  $('#str').onclick = () => { const on = !$('#sto').classList.contains('tr'); $('#sto').classList.toggle('tr', on); lsSet('zd:storyTr', on); $('#str').textContent = on ? 'پنهان کردن ترجمه' : 'نمایش ترجمه'; };
  lines.forEach((el, i) => el.onclick = () => playFrom(i));
  v.querySelectorAll('[data-say]').forEach(b => b.onclick = () => say(b.dataset.say, 'en', 'cheerful', b));
  v.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const q = S.quiz[+b.dataset.q]; const ok = +b.dataset.o === +q.a; b.closest('.wb-opts').querySelectorAll('button').forEach((x, oi) => { x.classList.toggle('good', oi === +q.a); x.classList.toggle('wrong', !ok && x === b); }); if (ok) addXP(2); });
  addEventListener('hashchange', () => { playing = false; haltAudio(); }, { once: true });
};

function storyIndex() {
  setTop('داستان‌های صوتی درس‌ها', true); const v = view(); const all = typeof wbUnits === 'function' ? wbUnits() : [];
  const groups = []; all.forEach((u, i) => { const g = groups.find(x => x.lvl === u.lvl) || (groups.push({ lvl: u.lvl, us: [] }), groups[groups.length - 1]); g.us.push([u, i]); });
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">🎧 داستان صوتی برای هر درس</b><span class="small muted">هر داستان با واژه‌ها و گرامر همان درس و در همان سطح نوشته شده؛ صدای بومی (آفلاین)، متن، ترجمهٔ فارسی، واژه‌ها و سؤال درک مطلب.</span></div>
  ${groups.map(g => `<div class="sec">سطح ${esc(g.lvl)}</div><div class="stack">${g.us.map(([u, i]) => `<a class="card row" href="#story/${esc(u.id)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="pill">${faNum(i + 1)}</span><span class="grow"><b>${esc(u.fa)}</b><br><span class="tiny muted en keep-en">${esc(u.en)}</span></span><span>🎧</span></a>`).join('')}</div>`).join('')}</div>`;
}
