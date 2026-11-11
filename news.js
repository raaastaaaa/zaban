/* زبان رستا — شنیدن روزانه: رادیو زنده، اخبار سادهٔ امروز، برنامهٔ شنیداری و صدای سه‌بعدی */

/* ───── صدای سه‌بعدی (HRTF؛ با هدفون) ───── */
const Spatial = (() => {
  let ctx, src, pan, wet, dry, ready = false;
  const impulse = (c, sec, decay) => { const n = c.sampleRate * sec, b = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; };
  function init() {
    if (ready) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      src = ctx.createMediaElementSource(player);
      pan = ctx.createPanner(); pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = 1; pan.rolloffFactor = 0.6;
      const conv = ctx.createConvolver(); conv.buffer = impulse(ctx, 1.4, 2.8);
      wet = ctx.createGain(); dry = ctx.createGain();
      src.connect(dry); dry.connect(ctx.destination); // مسیر عادی
      pan.connect(ctx.destination); pan.connect(conv); conv.connect(wet); wet.connect(ctx.destination);
      ready = true; route(); return true;
    } catch (e) { console.warn('3D', e); return false; }
  }
  let orb = 0, orbA = 0;
  function orbit() { // حالت ۸D: صدا آرام دور سر می‌چرخد
    cancelAnimationFrame(orb); if (G.settings.spatial !== '2') return;
    const step = () => { if (!player.paused) { orbA += 0.006; pan.positionX ? (pan.positionX.value = Math.sin(orbA) * 1.6, pan.positionZ.value = -Math.cos(orbA) * 1.6) : pan.setPosition(Math.sin(orbA) * 1.6, 0, -Math.cos(orbA) * 1.6); } orb = requestAnimationFrame(step); };
    orb = requestAnimationFrame(step);
  }
  function route() {
    if (!ready) return; const on = G.settings.spatial === '1' || G.settings.spatial === '2'; orbit();
    try { src.disconnect(); } catch { }
    if (on) { src.connect(pan); wet.gain.value = 0.14; } else { src.connect(dry); dry.gain.value = 1; wet.gain.value = 0; }
  }
  function at(x = 0, z = -1.2, y = 0) {
    if (!ready || G.settings.spatial === '2') return; const t = ctx.currentTime;
    if (pan.positionX) { pan.positionX.setTargetAtTime(x, t, 0.25); pan.positionY.setTargetAtTime(y, t, 0.25); pan.positionZ.setTargetAtTime(z, t, 0.25); } else pan.setPosition(x, y, z);
  }
  // فقط در لحظهٔ لمس کاربر ساخته می‌شود تا صدا هیچ‌وقت قطع نشود
  function prep() { if (!['1', '2'].includes(G.settings.spatial) && !ready) return; if (init()) { route(); if (ctx.state === 'suspended') ctx.resume().catch(() => { }); } }
  let extra = null;
  function attach(el) { if (!init()) return false; if (!extra) { extra = ctx.createMediaElementSource(el); extra.connect(pan); } if (ctx.state === 'suspended') ctx.resume().catch(() => { }); return true; }
  const wake = () => { if (ready && ctx.state === 'suspended') ctx.resume().catch(() => { }); };
  return { prep, wake, at, route, attach, get on() { return ['1', '2'].includes(G.settings.spatial); } };
})();
document.addEventListener('pointerdown', () => { try { Spatial.prep(); } catch { } }, { capture: true });

/* ───── سطح و برنامهٔ شنیداری روزانه ───── */
const CEFR = { intro: 'A1', l1: 'A2', l2: 'A2+', l3: 'B1', wsb: 'A2', wsi: 'B1' };
const cefrNow = () => CEFR[currentUnit()?.level] || 'A2';
function listenDiet() {
  const M = U.plan?.minutes || 30; const lv = cefrNow();
  const act = lv === 'A1' ? 10 : lv === 'B1' ? 20 : 15; const bg = lv === 'A1' ? 20 : lv === 'B1' ? 45 : 30;
  const r = x => Math.max(5, Math.round(M * x / 5) * 5);
  return {
    lv, act, bg,
    parts: [
      ['🗣️', 'مکالمه و صحبت', r(.35), 'گفتگوی درس، نقش‌آفرینی، گپ آزاد با رستا'],
      ['🃏', 'بانک لغت', r(.25), 'فلش‌کارت لایتنر + واژه‌های موضوعی'],
      ['🎧', 'شنیدن فعال', act, 'خبر سادهٔ امروز یا مکالمهٔ درس؛ با تمرکز و تکرار'],
      ['📐', 'گرامر', r(.15), 'کلاس گرامر درس و تمرین'],
      ['📻', 'شنیدن ناخودآگاه', bg, 'رادیو در پس‌زمینه (آشپزی، رانندگی، پیاده‌روی)؛ لازم نیست همه را بفهمی'],
    ],
    why: lv === 'A1' ? 'الان گوشت باید به آهنگ و ریتم انگلیسی عادت کند. رادیو را آرام در پس‌زمینه بگذار و فقط دنبال واژه‌هایی بگرد که بلدی. خبر ساده را دو بار گوش بده: یک بار بدون متن، یک بار با متن.'
      : lv === 'B1' ? 'حالا وقت شنیدن واقعی است: خبر ساده را اول بدون متن گوش بده و خلاصه‌اش را به انگلیسی بگو، بعد رادیوی واقعی را با تمرکز ۵ دقیقه گوش کن و ۳ واژهٔ تازه بردار.'
        : 'خبر سادهٔ امروز را جمله‌به‌جمله گوش بده و پشت سرش تکرار کن (سایه‌خوانی). رادیو را در پس‌زمینه روشن بگذار تا مغزت بی‌آنکه زور بزنی به سرعت طبیعی عادت کند.',
  };
}
const todayLog = () => { const t = isoDay(); return U.log[t] || (U.log[t] = { xp: 0, min: 0 }); };
function listenTasks() { const D = listenDiet(); return [{ k: 'news', t: `🎧 شنیدن فعال: خبر سادهٔ امروز (${faNum(D.act)} دقیقه)` }, { k: 'radio', t: `📻 رادیو در پس‌زمینه برای ناخودآگاه (${faNum(D.bg)} دقیقه)` }]; }
function listenDone(t) { const L = U.log[isoDay()] || {}; const D = listenDiet(); if (t.k === 'news') return (L.news || 0) >= D.act; if (t.k === 'radio') return (L.radio || 0) >= D.bg; return null; }

/* ───── رادیو زنده ───── */
const STATIONS = {
  US: [{ id: 'npr', n: 'NPR News', d: 'رادیوی ملی آمریکا؛ خبر و گزارش با لهجهٔ آمریکایی', u: 'https://npr-ice.streamguys1.com/live.mp3' },
  { id: 'wnyc', n: 'WNYC 93.9 New York', d: 'گفتگو، خبر و برنامه‌های روزمرهٔ نیویورک', u: 'https://fm939.wnyc.org/wnycfm', cors: 1 }],
  UK: [{ id: 'bbcws', n: 'BBC World Service', d: 'بی‌بی‌سی جهانی؛ خبر، مستند و گفتگو با لهجهٔ بریتانیایی', u: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service', cors: 1 },
  { id: 'bbcnews', n: 'BBC World Service News', d: 'فقط خبر؛ برای تمرین شنیدن خبر واقعی', u: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service_news_internet', cors: 1 }],
};
const MUSIC_ST = {
  US: [{ id: 'kexp', n: 'KEXP Seattle', d: 'موسیقی انگلیسی‌زبان؛ مجری‌ها بین آهنگ‌ها آمریکایی حرف می‌زنند', u: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', cors: 1 },
  { id: 'indie', n: 'SomaFM Indie Pop Rocks', d: 'پاپ و ایندی شاد و پرانرژی', u: 'https://ice1.somafm.com/indiepop-128-mp3', cors: 1 }],
  UK: [{ id: 'heart', n: 'Heart London', d: 'پاپ شاد و پرانرژی؛ مجری‌های بریتانیایی', u: 'https://media-ssl.musicradio.com/HeartLondon', cors: 1 },
  { id: 'u80', n: 'SomaFM Underground 80s', d: 'پاپ بریتانیایی دههٔ ۸۰', u: 'https://ice1.somafm.com/u80s-128-mp3', cors: 1 }],
};
const radioPlain = new Audio(); radioPlain.preload = 'none';
const radio3d = new Audio(); radio3d.preload = 'none'; radio3d.crossOrigin = 'anonymous';
let radio = radioPlain;
let radioSt = null, radioEnd = 0, radioTm = 0;
setInterval(() => {
  if (!U) return;
  if (!radio.paused && radioSt) { const L = todayLog(); L.radio = +((L.radio || 0) + 0.5).toFixed(1); saveU(); if (radioEnd && Date.now() > radioEnd) stopRadio(); }
  if (/^#news\b/.test(location.hash) && document.visibilityState === 'visible' && (!player.paused || Date.now() - lastAct < 60000)) { const L = todayLog(); L.news = +((L.news || 0) + 0.5).toFixed(1); saveU(); }
  const el = document.getElementById('rstat'); if (el) el.textContent = radioLabel();
}, 30000);
function radioLabel() { const L = U?.log[isoDay()] || {}; return `${radioSt ? '● در حال پخش: ' + radioSt.n + ' · ' : ''}امروز ${faNum(Math.round(L.radio || 0))} دقیقه رادیو`; }
function playRadio(st, keep) {
  stopSpeak(); RNoise.set(0); try { radio.pause(); } catch { } radioSt = st; radio = st.cors && Spatial.on && Spatial.attach(radio3d) ? radio3d : radioPlain; radio.src = st.u;
  radio.play().then(() => { if ('mediaSession' in navigator) { navigator.mediaSession.metadata = new MediaMetadata({ title: st.n, artist: 'زبان رستا · شنیدن ناخودآگاه' }); } }).catch(() => { toast('این ایستگاه الان پخش نشد؛ اینترنت را بررسی کن (در ایران ممکن است فیلتر باشد).'); radioSt = null; drawRadio(); });
  radio.onerror = () => { if (radioSt) { toast('پخش قطع شد؛ دوباره امتحان کن.'); radioSt = null; drawRadio(); } };
  if (keep) { document.querySelector('.radio-set')?.classList.add('on'); const el = document.getElementById('rstat'); if (el) el.textContent = radioLabel(); } else drawRadio();
}
function stopRadio() { RNoise.set(0); rPower = false; radio.pause(); radio.removeAttribute('src'); try { radio.load(); } catch { } radioSt = null; radioEnd = 0; radioTm = 0; drawRadio(); }
/* رادیوی قدیمی با پیچ تنظیم فرکانس؛ ایستگاه‌ها از قبل روی موج ذخیره شده‌اند و بینشان خش‌خش رادیو شنیده می‌شود */
const FREQ = { npr: 89.3, wnyc: 93.9, bbcws: 97.6, bbcnews: 101.4, kexp: 90.3, indie: 95.5, u80: 103.1, heart: 106.2 };
const RNoise = { ctx: null, g: null,
  start() { try { if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; this.ctx = new C(); const n = this.ctx.sampleRate * 2, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; l = (l + 0.04 * w) / 1.04; d[i] = w * 0.35 + l * 2.2 + (Math.random() < 0.0008 ? (Math.random() - .5) * 3 : 0); } const src = this.ctx.createBufferSource(); src.buffer = b; src.loop = true; const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6; this.g = this.ctx.createGain(); this.g.gain.value = 0; src.connect(bp).connect(this.g).connect(this.ctx.destination); src.start(); } this.ctx.resume(); } catch { } },
  set(v) { if (this.g) this.g.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05); } };
let rFreq = null, rTuneTm = 0, rPower = false;
function drawRadio() {
  const box = document.getElementById('radio') || document.getElementById('mradio'); if (!box) return;
  const kind = box.dataset.kind === 'music' ? 'music' : 'news'; const src = kind === 'music' ? MUSIC_ST : STATIONS;
  const list = [...src.US.map(x => ({ ...x, acc: 'US' })), ...src.UK.map(x => ({ ...x, acc: 'UK' }))].map(x => ({ ...x, f: FREQ[x.id] || 100 })).sort((a, b) => a.f - b.f);
  if (rFreq == null || rFreq < 87.5 || rFreq > 108) rFreq = lsGet('zd:rfreq:' + kind, list.find(x => x.acc === (G.settings.accent === 'UK' ? 'UK' : 'US'))?.f || 98);
  const X = f => ((f - 87.5) / 20.5 * 100).toFixed(2) + '%';
  box.innerHTML = `<div class="radio-set${radioSt ? ' on' : ''}">
    <div class="rs-top"><span class="rs-brand">RASTA <i>FM</i></span><span class="rs-lamp" title="روشن"></span></div>
    <div class="rs-dial"><div class="rs-scale">${[88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108].map(f => `<span style="left:${X(f)}">${f}</span>`).join('')}${Array.from({ length: 41 }, (_, i) => `<i style="left:${X(88 + i * 0.5)}" class="${i % 4 ? '' : 'big'}"></i>`).join('')}</div>
      <div class="rs-st">${list.map(x => `<button style="left:${X(x.f)}" data-go="${x.f}" title="${esc(x.n)}">${x.acc === 'UK' ? '🇬🇧' : '🇺🇸'}</button>`).join('')}</div>
      <div class="rs-track"><div class="rs-needle" style="left:${X(rFreq)}"></div></div></div>
    <div class="rs-lcd"><b class="en" id="rsf">${rFreq.toFixed(1)} MHz</b><span id="rsn">${esc(nearSt(list, rFreq)?.n || '··· در حال جستجو ···')}</span><small id="rsd">${esc(nearSt(list, rFreq)?.d || 'پیچ را بچرخان تا به یک ایستگاه برسی')}</small></div>
    <div class="rs-ctl">
      <div class="rs-grill"></div>
      <div class="rs-btns"><button class="rs-pw${rPower ? ' on' : ''}" id="rpw" aria-label="روشن / خاموش">⏻</button><div class="row" style="gap:6px;justify-content:center"><button class="rs-sk" data-sk="-1" aria-label="ایستگاه قبل">⏮</button><button class="rs-sk" data-sk="1" aria-label="ایستگاه بعد">⏭</button></div></div>
      <div class="rs-knob" id="rknob" role="slider" tabindex="0" aria-label="پیچ تنظیم فرکانس" aria-valuemin="87.5" aria-valuemax="108" aria-valuenow="${rFreq.toFixed(1)}" style="--a:${(rFreq * 90) % 360}deg"><span></span></div>
    </div></div>
  <div class="row small" style="gap:6px;padding-top:10px"><span class="muted">خاموش شدن خودکار:</span>${[[15, '۱۵ دقیقه'], [30, '۳۰ دقیقه'], [60, '۱ ساعت'], [0, 'بدون تایمر']].map(([m, l]) => `<button class="btn sm${radioTm === m ? '' : ' ghost'}" data-tm="${m}">${l}</button>`).join('')}</div>
  <div class="small muted" id="rstat">${radioLabel()}</div>`;
  const knob = $('#rknob', box), needle = $('.rs-needle', box);
  const tune = (f, fromUser) => {
    rFreq = Math.round(clamp(f, 87.5, 108) * 10) / 10; lsSet('zd:rfreq:' + kind, rFreq);
    needle.style.left = X(rFreq); knob.style.setProperty('--a', (rFreq * 90) % 360 + 'deg'); knob.setAttribute('aria-valuenow', rFreq.toFixed(1));
    const st = nearSt(list, rFreq); const dist = st ? Math.abs(st.f - rFreq) : 9;
    $('#rsf', box).textContent = rFreq.toFixed(1) + ' MHz'; $('#rsn', box).textContent = st ? st.n : '··· در حال جستجو ···'; $('#rsd', box).textContent = st ? st.d : 'پیچ را بچرخان تا به یک ایستگاه برسی';
    if (!rPower) return;
    RNoise.start(); RNoise.set(dist < 0.05 ? 0 : Math.min(0.5, 0.12 + dist * 0.4));
    radio.volume = dist < 0.05 ? 1 : Math.max(0, 1 - dist * 3);
    clearTimeout(rTuneTm);
    if (!st || dist > 0.3) { if (radioSt) { radio.pause(); radioSt = null; box.querySelector('.radio-set').classList.remove('on'); } return; }
    rTuneTm = setTimeout(() => { if (radioSt?.id !== st.id) { playRadio(st, true); } }, fromUser ? 450 : 0);
  };
  knob.onpointerdown = e => {
    e.preventDefault(); knob.setPointerCapture(e.pointerId); if (!rPower) { rPower = true; $('#rpw', box).classList.add('on'); }
    const r = knob.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let last = Math.atan2(e.clientY - cy, e.clientX - cx);
    knob.onpointermove = ev => { const a = Math.atan2(ev.clientY - cy, ev.clientX - cx); let d = a - last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; last = a; tune(rFreq + d / (2 * Math.PI) * 4, true); if (navigator.vibrate && Math.abs((rFreq * 10) % 5) < 0.5) navigator.vibrate(3); };
    knob.onpointerup = knob.onpointercancel = () => { knob.onpointermove = null; const st = nearSt(list, rFreq); if (st && Math.abs(st.f - rFreq) <= 0.6) tune(st.f, true); };
  };
  knob.onwheel = e => { e.preventDefault(); rPower = true; tune(rFreq + (e.deltaY > 0 ? -0.1 : 0.1), true); };
  knob.onkeydown = e => { const d = { ArrowUp: .1, ArrowRight: -.1, ArrowLeft: .1, ArrowDown: -.1 }[e.key]; if (d) { e.preventDefault(); rPower = true; tune(rFreq + d, true); } };
  box.onclick = e => {
    const g = e.target.closest('[data-go]'); if (g) { rPower = true; $('#rpw', box).classList.add('on'); return glide(+g.dataset.go); }
    const k = e.target.closest('[data-sk]'); if (k) { rPower = true; $('#rpw', box).classList.add('on'); const d = +k.dataset.sk; const nx = d > 0 ? list.find(x => x.f > rFreq + 0.05) || list[0] : [...list].reverse().find(x => x.f < rFreq - 0.05) || list[list.length - 1]; return glide(nx.f); }
    if (e.target.closest('#rpw')) { rPower = !rPower; e.target.closest('#rpw').classList.toggle('on', rPower); if (!rPower) { RNoise.set(0); stopRadio(); } else tune(rFreq); return; }
    const t = e.target.closest('[data-tm]'); if (t) { const m = +t.dataset.tm; radioTm = m; radioEnd = m ? Date.now() + m * 60000 : 0; toast(m ? `رادیو بعد از ${faNum(m)} دقیقه خاموش می‌شود.` : 'تایمر خاموش شد.'); $$('[data-tm]', box).forEach(b => b.classList.toggle('ghost', b !== t)); }
  };
  const glide = to => { const from = rFreq, t0 = performance.now(), dur = Math.min(1600, 250 + Math.abs(to - from) * 90); const step = now => { const k = Math.min(1, (now - t0) / dur); const e2 = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; tune(from + (to - from) * e2, k < 1); if (k < 1) requestAnimationFrame(step); else tune(to); }; requestAnimationFrame(step); };
}
function nearSt(list, f) { let b = null; for (const x of list) if (!b || Math.abs(x.f - f) < Math.abs(b.f - f)) b = x; return b && Math.abs(b.f - f) <= 0.6 ? b : null; }

/* ───── اخبار سادهٔ امروز (خبر واقعی از جستجوی گوگل، بازنویسی در سطح تو) ───── */
async function fetchNews(lv) {
  const key = gemKey(); if (!key) throw new Error('NOGEM'); if (key !== 'server') budgetGuard();
  const acc = G.settings.accent === 'UK' ? 'British' : 'American';
  const prompt = `Today is ${isoDay()}. Use Google Search to find 4 real, important news stories from the last 48 hours (mix: world, Middle East, science/technology, health or sport; avoid graphic violence). Use ONLY facts found in the search results; never invent details.
Rewrite each for an English learner at CEFR ${lv} (${lv.startsWith('A1') ? 'very short sentences, present simple mostly, 60-80 words' : lv.startsWith('A2') ? 'short clear sentences, 90-110 words' : '120-150 words, natural but clear'}), ${acc} spelling.
Return ONLY a JSON array, no markdown: [{"title":"","topic":"Persian one word","text":"","fa":"Persian summary 2 sentences","words":[{"w":"","fa":"","ipa":""}],"questions":[{"q":"","options":["","",""],"a":0}],"source":"news outlet name"}] with 5 key words and 2 questions per story.`;
  const d = await gemFetch([G.settings.prov.gemini.model, ...GEM_FALLBACK], 'generateContent', { contents: [{ role: 'user', parts: [{ text: prompt }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0.3, maxOutputTokens: 6000 } }, key);
  trackAI('chat', 9000, 0.004);
  const c = d.candidates?.[0]; const txt = (c?.content?.parts || []).map(p => p.text || '').join('');
  const m = txt.match(/\[[\s\S]*\]/); if (!m) throw new Error('خبر پیدا نشد');
  const items = JSON.parse(m[0]).filter(x => x && x.title && x.text).slice(0, 5);
  const links = (c.groundingMetadata?.groundingChunks || []).map(g => g.web).filter(w => w?.uri).map(w => ({ t: w.title || 'source', u: w.uri })).filter(l => /^https:\/\//.test(l.u)).slice(0, 8);
  if (!items.length) throw new Error('خبر پیدا نشد');
  return { day: isoDay(), lv, accent: G.settings.accent, items, links };
}
const sentencesOf = t => (t.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g) || [t]).map(s => s.trim()).filter(Boolean);
const tapWords = s => esc(s).replace(/([A-Za-z][A-Za-z'’-]*)/g, '<span class="tw">$1</span>');

routes.listen = () => {
  setTop('شنیدن روزانه', true); const D = listenDiet(); const L = U.log[isoDay()] || {};
  const ring = (v, max) => Math.min(100, Math.round((v || 0) / max * 100));
  view().innerHTML = `<div class="stack">
  <div class="card stack"><div class="row" style="justify-content:space-between"><b>برنامهٔ امروز تو</b><span class="pill acc">سطح ${esc(D.lv)}</span></div>
    <span class="small muted">بر اساس ${faNum(U.plan?.minutes || 30)} دقیقه مطالعهٔ روزانه و سطح فعلی‌ات چیده شده است.</span>
    ${D.parts.map(([ic, t, m, d]) => `<div class="row" style="flex-wrap:nowrap;gap:10px"><span style="font-size:20px">${ic}</span><div class="grow"><b>${t}</b> <span class="small muted">· ${faNum(m)} دقیقه</span><div class="small muted">${d}</div></div></div>`).join('')}
    <div class="notice soft small">${esc(D.why)}</div></div>
  <div class="grid2">
    <div class="card stack" style="gap:6px"><span class="small muted">شنیدن فعال امروز</span><b>${faNum(Math.round(L.news || 0))} از ${faNum(D.act)} دقیقه</b><div class="bar"><i style="width:${ring(L.news, D.act)}%"></i></div></div>
    <div class="card stack" style="gap:6px"><span class="small muted">رادیو امروز</span><b>${faNum(Math.round(L.radio || 0))} از ${faNum(D.bg)} دقیقه</b><div class="bar mark"><i style="width:${ring(L.radio, D.bg)}%"></i></div></div></div>
  <div class="card stack"><b>لهجه</b><div class="seg" id="acc">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([v, l]) => `<button data-v="${v}" class="${G.settings.accent === v ? 'on' : ''}">${l}</button>`).join('')}</div><span class="small muted">ایستگاه‌های رادیو، صدای خبرها و تلفظ‌ها با همین لهجه است.</span></div>
  <a class="btn wide" href="#news">🎧 خبر سادهٔ امروز (شنیدن فعال)</a>
  <div class="grid2"><a class="btn ghost" href="#myradio">📻 رادیوی شخصی من (تعاملی)</a><a class="btn ghost" href="#sleep">🌙 مرور قبل از خواب</a></div>
  <a class="btn ghost wide" href="#music">🎵 موسیقی انگلیسی (با زیرنویس، سه‌بعدی)</a>
  <div class="card stack"><b>📻 رادیو زنده برای ناخودآگاه</b><span class="small muted">روشنش کن و به کارت برس؛ صفحه را هم می‌توانی ببندی. دقیقه‌ها خودکار حساب می‌شوند.</span><div id="radio"></div></div>
  <div class="small muted">پخش زنده مستقیم از خود ایستگاه‌هاست. در ایران ممکن است بعضی ایستگاه‌ها بدون فیلترشکن باز نشوند.</div></div>`;
  drawRadio();
  $('#acc').onclick = e => { const b = e.target.closest('button'); if (!b) return; G.settings.accent = b.dataset.v; saveG('settings'); if (radioSt) stopRadio(); routes.listen(); };
};

routes.news = async () => {
  setTop('خبر سادهٔ امروز', true); const lv = cefrNow(); const v = view();
  const ck = 'zd:news:' + isoDay() + ':' + lv + ':' + G.settings.accent;
  let N = lsGet(ck, null);
  const draw = () => {
    v.innerHTML = `<div class="stack"><div class="row" style="justify-content:space-between"><span class="small muted">خبرهای واقعی امروز، بازنویسی‌شده در سطح ${esc(lv)} · لهجهٔ ${G.settings.accent === 'UK' ? 'بریتانیایی' : 'آمریکایی'}</span><button class="btn ghost sm" id="rf">تازه کن</button></div>
    <div class="notice soft small">روش: ۱) یک بار بدون متن گوش بده ۲) جمله‌به‌جمله گوش بده و تکرار کن ۳) به دو سؤال جواب بده. روی هر واژه بزن تا معنی‌اش بیاید.</div>
    ${N.items.map((it, i) => `<div class="card stack" data-i="${i}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b class="en" style="font-size:17px">${esc(it.title)}</b><span class="pill">${esc(it.topic || 'خبر')}</span></div>
      <div class="row" style="gap:6px"><button class="btn sm" data-a="all">🔊 کل خبر</button><button class="btn ghost sm" data-a="line">جمله‌به‌جمله</button><button class="btn ghost sm" data-a="hide">پنهان کردن متن</button><button class="btn ghost sm" data-a="fa">خلاصهٔ فارسی</button></div>
      <p class="en txt" style="font-size:16px;line-height:1.9;margin:0">${sentencesOf(it.text).map((s, k) => `<span class="sn" data-k="${k}">${tapWords(s)}</span> `).join('')}</p>
      <div class="small muted fa" hidden>${esc(it.fa || '')}</div>
      ${it.words?.length ? `<div class="row" style="gap:6px">${it.words.map((w, k) => `<button class="btn ghost sm" data-w="${k}"><b class="en">${esc(w.w)}</b> · ${esc(w.fa)}</button>`).join('')}</div><button class="btn ghost sm" data-a="addw">+ افزودن واژه‌ها به لایتنر</button>` : ''}
      ${(it.questions || []).map((q, k) => `<div class="stack" style="gap:6px" data-q="${k}"><b class="small en">${esc(q.q)}</b><div class="row" style="gap:6px">${(q.options || []).map((o, j) => `<button class="btn ghost sm en" data-o="${j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
      ${it.source ? `<span class="small muted">منبع: ${esc(it.source)}</span>` : ''}</div>`).join('')}
    ${N.links?.length ? `<details class="card small"><summary>منابع خبرها (برای خواندن نسخهٔ اصلی)</summary>${N.links.map(l => `<a href="${esc(l.u)}" target="_blank" rel="noopener" style="display:block;padding:4px 0">${esc(l.t)}</a>`).join('')}</details>` : ''}</div>`;
  };
  const load = async () => {
    v.innerHTML = loading('خبرهای امروز را پیدا و ساده می‌کنم…');
    try { N = await fetchNews(lv); lsSet(ck, N); draw(); }
    catch (e) {
      if (e.message === 'NOGEM') v.innerHTML = `<div class="card stack"><b>خبرهای امروز به اینترنت نیاز دارد</b><span class="small muted">به اینترنت وصل شو و دوباره امتحان کن. تا آن موقع رادیو و درس‌ها در دسترس است.</span><button class="btn" onclick="router()">دوباره</button></div>`;
      else { v.innerHTML = `<div class="card stack"><b>الان خبر نیامد</b><span class="small muted">${esc(e.message || '')}</span><button class="btn" id="re">دوباره</button><a class="btn ghost" href="#listen">رادیو</a></div>`; $('#re').onclick = load; }
    }
  };
  if (!N) await load(); else draw();
  v.onclick = async e => {
    if (e.target.id === 'rf') { localStorage.removeItem(ck); return load(); }
    const card = e.target.closest('[data-i]'); if (!card) return; const it = N.items[+card.dataset.i];
    const tw = e.target.closest('.tw'); if (tw) { wordPanel(tw.textContent, tw.closest('.sn')?.textContent); return; }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'all') { Spatial.at(0, -1.2); return say(it.text, 'en', 'calm', e.target.closest('button')); }
    if (a === 'line') {
      const ss = $$('.sn', card); const h0 = location.hash;
      for (const s of ss) { $$('.sn', card).forEach(x => x.style.background = ''); s.style.background = 'var(--accent-soft)'; s.style.borderRadius = '6px'; if (!(await say(s.textContent, 'en', 'calm')) || location.hash !== h0) break; await new Promise(r => setTimeout(r, 1600)); }
      $$('.sn', card).forEach(x => x.style.background = ''); return;
    }
    if (a === 'hide') { const p = $('.txt', card); p.hidden = !p.hidden; e.target.textContent = p.hidden ? 'نمایش متن' : 'پنهان کردن متن'; return; }
    if (a === 'fa') { const f = $('.fa', card); f.hidden = !f.hidden; return; }
    if (a === 'addw') { (it.words || []).forEach(w => addDictWord({ word: w.w, ipa_us: w.ipa || '', senses: [{ fa: w.fa || '—', examples: [] }] })); toast('واژه‌ها به جعبهٔ لایتنر اضافه شدند.'); return; }
    const wb = e.target.closest('[data-w]'); if (wb) { const w = it.words[+wb.dataset.w]; return say(w.w, 'en'); }
    const ob = e.target.closest('[data-o]'); if (ob) {
      const qb = ob.closest('[data-q]'); const q = it.questions[+qb.dataset.q]; if (qb.dataset.done) return; qb.dataset.done = 1;
      const ok = +ob.dataset.o === +q.a; $$('[data-o]', qb).forEach((x, j) => { if (j === +q.a) x.style.boxShadow = 'inset 0 0 0 2px var(--ok)'; }); if (!ok) ob.style.boxShadow = 'inset 0 0 0 2px var(--bad)';
      toast(ok ? 'آفرین! درست فهمیدی 👏' : 'نزدیک بود؛ جواب درست را سبز کردم.'); if (ok && typeof addXP === 'function') addXP(5);
    }
  };
};

/* ───── پخش با صدای شخصیت و جای سه‌بعدی ───── */
async function voiceAt(text, lang, emo, gv, x, z) {
  const keep = G.settings.geminiVoice, ve = G.settings.voiceEn;
  if (gemKey()) { if (gv) G.settings.geminiVoice = gv; if (lang === 'en') G.settings.voiceEn = 'gemini'; }
  try { Spatial.at(x, z); return await say(text, lang, emo); } finally { G.settings.geminiVoice = keep; G.settings.voiceEn = ve; }
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const unitPick = (sel) => { const opts = [...ALL_UNITS, ...WS_UNITS].filter(u => isOpen(u)); return `<select class="in" id="${sel}">${opts.map(u => `<option value="${u.id}"${u.id === currentUnit().id ? ' selected' : ''}>${esc(u.fa)} · ${esc(u.en)}</option>`).join('')}</select>`; };

/* ───── مرور آرام قبل از خواب ───── */
routes.sleep = (id) => {
  setTop('مرور قبل از خواب', true); const v = view(); let on = false, stopAt = 0;
  v.innerHTML = `<div class="stack"><div class="card stack"><b>🌙 مرور آرام درس، قبل از خواب</b>
    <span class="small muted">واژه‌ها با معنی و مثال، گرامر درس و مکالمه‌اش آرام و با فاصله پخش می‌شود و موسیقی ملایم زیرش است. با هدفون و «صدای سه‌بعدی» روشن، صداها دور سرت جای خودشان را دارند.</span>
    <label class="f">کدام درس؟</label>${unitPick('su')}
    <label class="f">خاموش شدن خودکار</label><div class="seg" id="stm">${[[15, '۱۵ دقیقه'], [30, '۳۰ دقیقه'], [45, '۴۵ دقیقه']].map(([m, l], i) => `<button data-v="${m}" class="${i === 1 ? 'on' : ''}">${l}</button>`).join('')}</div>
    <label class="row small" style="gap:6px"><input type="checkbox" id="spr" checked> چند واژه از درس‌های قبلی هم مرور شود</label>
    <button class="btn wide" id="go">▶ شروع مرور</button><div class="small muted" id="now"></div></div>
    ${Spatial.on ? '' : '<a class="notice soft small" href="#settings" style="display:block">نکته: «صدای سه‌بعدی» را در تنظیمات روشن کن و هدفون بگذار ›</a>'}</div>`;
  if (id) $('#su').value = id;
  $('#stm').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#stm button').forEach(x => x.classList.remove('on')); b.classList.add('on'); };
  const show = t => { const n = $('#now'); if (n) n.textContent = t; };
  $('#go').onclick = async () => {
    if (on) { on = false; stopSpeak(); Music.stop(); $('#go').textContent = '▶ شروع مرور'; return; }
    const u = unitById($('#su').value); const ws = unitWords(u); if (!ws.length) return toast('لغت‌های این درس هنوز ساخته نشده؛ اول درس را باز کن.');
    on = true; $('#go').textContent = '⏸ توقف'; stopAt = Date.now() + +$('#stm .on').dataset.v * 60000;
    const alive = () => on && Date.now() < stopAt && /^#sleep/.test(location.hash);
    Music.play('calm'); Music.duck(true);
    const T = G.settings.teacher;
    await voiceAt(`شب بخیر عزیزم. من ${T} هستم. امشب درس «${u.fa}» رو آروم با هم مرور می‌کنیم. لازم نیست کاری بکنی؛ فقط گوش بده، نفس عمیق بکش و بذار ذهنت کار خودش رو بکنه.`, 'fa', 'calm', null, 0, -0.7);
    let prev = [];
    if ($('#spr').checked) prev = ALL_UNITS.filter(x => x.idx < u.idx && U.units[x.id]?.mastered).slice(-2).flatMap(x => unitWords(x).slice(0, 5));
    for (let r = 0; alive(); r++) {
      const list = [...ws].sort(() => Math.random() - .5).slice(0, 14).concat(prev.sort(() => Math.random() - .5).slice(0, 4));
      for (const [k, w] of list.entries()) {
        if (!alive()) break; show(`واژهٔ ${faNum(k + 1)} از ${faNum(list.length)}: ${w.w}`);
        const side = k % 2 ? 1.1 : -1.1;
        await voiceAt(w.w, 'en', 'calm', 'Aoede', side, -1); await wait(900);
        if (!alive()) break; await voiceAt(w.fa, 'fa', 'calm', null, 0, -0.7); await wait(700);
        if (w.ex && alive()) { await voiceAt(w.ex, 'en', 'calm', 'Aoede', side * 0.6, -1.3); await wait(2600); }
      }
      if (!alive()) break;
      if (u.gram) { show('گرامر درس'); await voiceAt(`حالا گرامر این درس: ${u.gram}. به این جمله‌ها گوش بده.`, 'fa', 'calm', null, 0, -0.7); for (const w of ws.filter(x => x.ex).slice(0, 4)) { if (!alive()) break; await voiceAt(w.ex, 'en', 'calm', 'Aoede', 0, -1.2); await wait(2200); } }
      const d = G.cache['dlg:' + u.id];
      if (d?.lines && alive()) { show('مکالمهٔ درس'); await voiceAt('و حالا مکالمهٔ درس.', 'fa', 'calm', null, 0, -0.7); for (const l of d.lines) { if (!alive()) break; await voiceAt(l.en, 'en', 'calm', l.who === 'A' ? 'Kore' : 'Puck', l.who === 'A' ? -1.3 : 1.3, -1); await wait(1200); } }
      if (alive()) { show('دور بعد…'); await wait(4000); }
    }
    if (Date.now() >= stopAt && /^#sleep/.test(location.hash)) await voiceAt('خوب خوابیدی عزیزم. فردا این واژه‌ها برات آشناتر هستند. شب بخیر.', 'fa', 'calm', null, 0, -0.6);
    Music.stop(); on = false; const g = $('#go'); if (g) g.textContent = '▶ شروع مرور'; show('');
  };
};

/* ───── رادیوی شخصی من: برنامهٔ رادیویی تعاملی با موضوع، واژه‌ها و سطح خودم ───── */
routes.myradio = (id) => {
  setTop('رادیوی من', true); const v = view(); let on = false;
  v.innerHTML = `<div class="stack"><div class="card stack"><b>📻 رادیوی شخصی تو</b>
    <span class="small muted">دو مجری مثل یک برنامهٔ رادیویی واقعی دربارهٔ موضوع درست حرف می‌زنند، با همان واژه‌ها و در سطح خودت. وسط برنامه از تو سؤال می‌پرسند؛ جواب بده تا با تو حرف بزنند.</span>
    <label class="f">موضوع</label>${unitPick('ru')}
    <div class="row" style="gap:6px"><button class="btn" id="go">▶ پخش برنامهٔ تازه</button><button class="btn ghost" id="st" hidden>⏹ توقف</button></div>
    <div id="ask"></div></div><div id="script" class="card stack" hidden></div></div>`;
  if (id) $('#ru').value = id;
  const ask = $('#ask');
  const answer = q => new Promise(res => {
    ask.innerHTML = `<div class="notice soft stack"><b class="small">مجری از تو می‌پرسد:</b><span class="en">${esc(q)}</span><div class="row" style="gap:6px"><button class="btn sm" id="mic">🎙 جواب بده</button><button class="btn ghost sm" id="sk">رد شدن</button></div><span class="small muted" id="cd"></span></div>`;
    let n = 15; const tm = setInterval(() => { n--; const c = $('#cd'); if (c) c.textContent = `${faNum(n)} ثانیه…`; if (n <= 0) { clearInterval(tm); ask.innerHTML = ''; res(''); } }, 1000);
    $('#sk').onclick = () => { clearInterval(tm); ask.innerHTML = ''; res(''); };
    $('#mic').onclick = async () => { clearInterval(tm); const L = listen(enLang()); $('#mic').textContent = '⏹ تمام'; $('#mic').onclick = () => L.stop(); try { const t = await L.promise; ask.innerHTML = ''; res(t || ''); } catch (e) { ask.innerHTML = ''; toast(e.message); res(''); } };
  });
  $('#st').onclick = () => { on = false; stopSpeak(); Music.stop(); $('#st').hidden = true; ask.innerHTML = ''; };
  $('#go').onclick = async () => {
    if (needAI($('#ask'))) return; const u = unitById($('#ru').value); const words = unitWords(u).map(w => w.w).slice(0, 30);
    $('#script').hidden = true; ask.innerHTML = loading('برنامهٔ رادیویی را می‌سازم…');
    let S; try {
      S = await ai({ temp: 0.9, max: 3500, system: 'You write fun, natural English radio shows for language learners. Two hosts with distinct personalities. Real, idiomatic spoken English.', messages: [{ role: 'user', content: `${learnerContext()}\nWrite a 3-4 minute radio show episode about "${u.en}" for a CEFR ${u.cefr || 'A2'} listener. Use many of these words naturally: ${words.join(', ')}. Grammar to feature: ${u.gram || ''}. Include: a catchy show name, a little news or fun fact, a short story or "caller" moment, a mini tip about one useful expression, and exactly 3 moments where a host asks THE LISTENER a direct personal question (mark them ask:true). 18-24 lines, each max 25 words. JSON {"show":"","lines":[{"who":"Sam|Lily|Caller","en":"","fa":"Persian translation","ask":false}]}` }] });
    } catch (e) { ask.innerHTML = ''; return aiErr(e); }
    ask.innerHTML = ''; on = true; $('#st').hidden = false;
    const sc = $('#script'); sc.hidden = false; sc.innerHTML = `<b class="en">🎙 ${esc(S.show || 'My Radio')}</b>${(S.lines || []).map((l, k) => `<div class="small ln" data-k="${k}" style="padding:4px 6px;border-radius:8px"><span class="pill">${esc(l.who)}</span> <span class="en">${esc(l.en)}</span><div class="muted">${esc(l.fa || '')}</div></div>`).join('')}`;
    const POS = { Sam: [-1.3, -1], Lily: [1.3, -1], Caller: [0, -2.4] }, VO = { Sam: 'Puck', Lily: 'Kore', Caller: 'Charon' };
    Music.play('happy'); await wait(2500); Music.duck(true);
    for (const [k, l] of (S.lines || []).entries()) {
      if (!on || !/^#myradio/.test(location.hash)) break;
      $$('.ln', sc).forEach(x => x.style.background = ''); const el = $(`.ln[data-k="${k}"]`, sc); if (el) { el.style.background = 'var(--accent-soft)'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      const [x, z] = POS[l.who] || [0, -1.2];
      await voiceAt(l.en, 'en', 'cheerful', VO[l.who] || 'Puck', x, z); await wait(350);
      if (l.ask && on) {
        const a = await answer(l.en); if (!on) break;
        if (a) {
          try { const r = await ai({ temp: 0.8, max: 300, system: 'You are a warm radio host replying live to a listener who is learning English.', messages: [{ role: 'user', content: `You asked: "${l.en}". The listener (CEFR ${u.cefr || 'A2'}) answered: "${a}". Reply in 1-2 short, natural sentences reacting warmly; if there is an important mistake, naturally recast the correct form (don't lecture). JSON {"en":""}` }] });
            const box = document.createElement('div'); box.className = 'small'; box.innerHTML = `<span class="pill ok">تو</span> <span class="en">${esc(a)}</span><br><span class="pill">${esc(l.who)}</span> <span class="en">${esc(r.en)}</span>`; el?.after(box);
            await voiceAt(r.en, 'en', 'excited', VO[l.who] || 'Puck', x, z); } catch { }
        } else await voiceAt("No worries, maybe next time! Let's keep going.", 'en', 'cheerful', VO[l.who] || 'Puck', x, z);
      }
    }
    Music.duck(false); await wait(2500); Music.stop(); on = false; const s = $('#st'); if (s) s.hidden = true;
    if (/^#myradio/.test(location.hash)) { const L = todayLog(); L.news = (L.news || 0) + 4; saveU(); toast('برنامه تمام شد؛ ۴ دقیقه شنیدن فعال ثبت شد 🎧'); }
  };
};

/* ───── موسیقی انگلیسی: ایستگاه‌های موسیقی (سه‌بعدی) + ترانه‌های انگیزشی ساخته‌شده با واژه‌های درس ───── */
const REAL_SONGS = [['Happy', 'Pharrell Williams', 'y6Sxv-sUYtM'], ['Roar', 'Katy Perry', 'CevxZvSJLk8'], ['Fight Song', 'Rachel Platten', 'xo1VInw-SKc'], ['Lovely Day', 'Bill Withers', 'bEeaS6fuUoA'], ["Don't Stop Me Now", 'Queen', 'HgzGwKwLmgM'], ['Eye of the Tiger', 'Survivor', 'btPJPFnesV4'], ['Unstoppable', 'Sia', 'cxjvTXo9WWM'], ['Hall of Fame', 'The Script', 'mk48xRzuNvA'], ['Walking on Sunshine', 'Katrina and the Waves', 'iPUmE-tne5U'], ['Good as Hell', 'Lizzo', 'vuq-VAiW9kw'], ['Three Little Birds', 'Bob Marley', 'HNBCVM4KbUM'], ['Count on Me', 'Bruno Mars', '6k8cpUkKK4c']];
/* پخش داخل برنامه: ویدیوی رسمی (کامل) یا پیش‌نمایش ۳۰ ثانیه‌ای اپل (بدون فیلترشکن) */
async function songPreview(t, a) {
  const k = 'zd:prev:' + t; const c = lsGet(k, null); if (c) return c;
  const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(t + ' ' + a)}&entity=song&limit=5`).then(r => r.json());
  const m = (r.results || []).find(x => x.artistName?.toLowerCase().includes(a.split(' ')[0].toLowerCase())) || r.results?.[0];
  const o = m ? { url: m.previewUrl, art: (m.artworkUrl100 || '').replace('100x100', '300x300') } : null; if (o) lsSet(k, o); return o;
}
function bindSongs(box) {
  box.onclick = async e => {
    const b = e.target.closest('[data-sg]'); if (!b) return; const [t, a, id] = REAL_SONGS[+b.dataset.sg]; const pl = $('#sgp', box); stopSpeak(); if (radioSt) try { stopRadio(); } catch { }
    if (b.dataset.m === 'full') { pl.innerHTML = `<div class="stack" style="gap:6px"><b class="en">${esc(t)} · <span class="muted">${esc(a)}</span></b><div style="position:relative;padding-top:56.25%;border-radius:12px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&cc_load_policy=1&cc_lang_pref=en&hl=fa&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0" title="${esc(t)}"></iframe></div><span class="tiny muted">زیرنویس را از دکمهٔ CC داخل پخش‌کننده روشن کن. اگر ویدیو باز نشد (فیلتر)، «پیش‌نمایش» را بزن.</span></div>`; pl.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    pl.innerHTML = loading('در حال آماده کردن آهنگ…');
    try { const p = await songPreview(t, a); if (!p) throw 0;
      pl.innerHTML = `<div class="row" style="flex-wrap:nowrap">${p.art ? `<img src="${p.art}" alt="" width="72" height="72" style="border-radius:10px">` : ''}<div class="grow stack" style="gap:4px"><b class="en">${esc(t)} · <span class="muted">${esc(a)}</span></b><audio controls autoplay src="${p.url}" style="width:100%"></audio><span class="tiny muted">پیش‌نمایش ۳۰ ثانیه‌ای؛ برای کل آهنگ «کامل» را بزن.</span></div></div>`;
    } catch { pl.innerHTML = '<span class="small muted">پیش‌نمایش در دسترس نبود؛ «کامل» را امتحان کن.</span>'; }
  };
}
routes.music = () => {
  setTop('موسیقی انگلیسی', true); const v = view();
  const songs = lsGet('zd:songs:' + G.active, []);
  v.innerHTML = `<div class="stack">
  <div class="card stack"><b>🎵 ترانه‌های انگیزشی با واژه‌های درس خودت</b><span class="small muted">ترانهٔ تازه و شاد با واژه‌های همین درس ساخته می‌شود؛ زیرنویس انگلیسی و فارسی همزمان می‌آید، روی هر واژه بزنی معنی‌اش را می‌بینی و صدا سه‌بعدی پخش می‌شود.</span>
    <label class="f">با واژه‌های کدام درس؟</label>${unitPick('mu')}
    <button class="btn" id="mk">✨ ساخت ترانهٔ تازه</button>
    ${songs.length ? `<div class="stack" id="sl" style="gap:4px">${songs.map((x, i) => `<button class="btn ghost sm" data-song="${i}" style="justify-content:flex-start">▶ <span class="en">${esc(x.title)}</span> · ${esc(x.unitFa || '')}</button>`).join('')}</div>` : ''}</div>
  <div id="kar"></div>
  <div class="card stack"><b>📻 ایستگاه‌های موسیقی انگلیسی</b><span class="small muted">آهنگ‌های واقعی و مجری‌هایی که بین آهنگ‌ها حرف می‌زنند؛ لهجه از تنظیمات «شنیدن روزانه» انتخاب می‌شود. ${Spatial.on ? 'با هدفون سه‌بعدی پخش می‌شود.' : 'برای پخش سه‌بعدی، صدای سه‌بعدی را در تنظیمات روشن کن.'}</span><div id="mradio" data-kind="music"></div></div>
  <div class="card stack" id="songs"><b>⭐ آهنگ‌های مثبت و انگیزشی معروف</b><span class="small muted">داخل خود برنامه پخش می‌شوند: «کامل» ویدیوی رسمی آهنگ با زیرنویس انگلیسی است، «پیش‌نمایش» ۳۰ ثانیه از آهنگ است که بدون فیلترشکن هم باز می‌شود.</span>
    <div id="sgp"></div>
    ${REAL_SONGS.map(([t, a], i) => `<div class="row small" style="padding:6px 0;border-top:1px solid var(--line);flex-wrap:nowrap"><div class="grow"><b class="en">${esc(t)}</b> <span class="en muted">${esc(a)}</span></div><button class="btn sm" data-sg="${i}" data-m="full">▶ کامل</button><button class="btn ghost sm" data-sg="${i}" data-m="prev">پیش‌نمایش</button></div>`).join('')}</div></div>`;
  drawRadio(); bindSongs($('#songs'));
  let on = false;
  const play = async S => {
    const k = $('#kar'); on = false; stopSpeak(); await wait(50); on = true; const h0 = location.hash;
    k.innerHTML = `<div class="card stack"><div class="row" style="justify-content:space-between"><b class="en">🎤 ${esc(S.title)}</b><button class="btn ghost sm" id="kst">⏹ توقف</button></div>
      ${S.lines.map((l, i) => `<div class="kl" data-i="${i}" style="padding:6px 8px;border-radius:10px;transition:background .2s"><div class="en" style="font-size:17px">${tapWords(l.en)}</div><div class="small muted">${esc(l.fa)}</div></div>`).join('')}</div>`;
    $('#kst').onclick = () => { on = false; stopSpeak(); Music.stop(); };
    k.onclick = e => { const t = e.target.closest('.tw'); if (t) wordPanel(t.textContent, t.closest('.kl')?.textContent); };
    Music.play('happy'); await wait(1800); Music.duck(true);
    for (const [i, l] of S.lines.entries()) {
      if (!on || location.hash !== h0) break;
      $$('.kl', k).forEach(x => x.style.background = ''); const el = $(`.kl[data-i="${i}"]`, k); el.style.background = 'var(--accent-soft)'; el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const chorus = /chorus/i.test(l.part || ''); if (!(await voiceAt(l.en, 'en', 'excited', chorus ? 'Kore' : 'Puck', chorus ? 0 : (i % 2 ? 1.2 : -1.2), chorus ? -0.8 : -1.2))) {} await wait(450);
    }
    Music.duck(false); await wait(2500); Music.stop(); on = false;
  };
  $('#mk').onclick = async () => {
    if (needAI($('#kar'))) return; const u = unitById($('#mu').value); $('#kar').innerHTML = loading('ترانه را می‌نویسم…');
    try {
      const r = await ai({ temp: 1, max: 2500, system: 'You are a songwriter who writes ORIGINAL, upbeat, motivational pop songs for English learners. Never copy or imitate existing song lyrics.', messages: [{ role: 'user', content: `Write an original, positive, energetic, motivational song (CEFR ${u.cefr || 'A2'} English, simple clear words, strong rhythm and rhyme) using many of these words from the lesson "${u.en}": ${unitWords(u).slice(0, 25).map(w => w.w).join(', ')}. Structure: verse 1 (4 lines), chorus (4 lines), verse 2 (4 lines), chorus again. Theme: believing in yourself, learning English and a bright future. JSON {"title":"","lines":[{"part":"verse|chorus","en":"","fa":"natural Persian translation"}]}` }] });
      if (!r.lines?.length) throw new Error('ترانه ساخته نشد');
      const S = { title: r.title || 'My Song', unitFa: u.fa, lines: r.lines.slice(0, 24) }; const L = lsGet('zd:songs:' + G.active, []); L.unshift(S); lsSet('zd:songs:' + G.active, L.slice(0, 20));
      play(S);
    } catch (e) { $('#kar').innerHTML = ''; aiErr(e); }
  };
  $('#sl') && ($('#sl').onclick = e => { const b = e.target.closest('[data-song]'); if (b) play(songs[+b.dataset.song]); });
};

/* ───── دانلود یکجای صداهای هر درس؛ بعد از آن بدون اینترنت و فوری پخش می‌شود ───── */
const voiceSig = () => [G.settings.voiceEn, G.settings.accent, G.settings.geminiVoice].join('-');
async function preloadUnitVoice(u, btn) {
  const eng = G.settings.voiceEn; const ws = unitWords(u);
  if (!ws.length) return toast('اول واژه‌های درس را باز کن تا ساخته شوند.');
  if (eng === 'browser') { lsSet('zd:voiceDl:' + u.id + ':' + voiceSig(), 1); btn.textContent = '✓ صدای دستگاه همیشه آفلاین است'; return toast('صدای انگلیسی روی «صدای دستگاه» است؛ بدون اینترنت هم کار می‌کند. برای صدای طبیعی‌تر، در تنظیمات Gemini را انتخاب کن و دوباره دانلود کن.', 6000); }
  const items = [];
  ws.forEach(w => { items.push(w.w); if (w.ex) items.push(w.w + '. ' + w.ex); });
  const d = G.cache['dlg:' + u.id]; (d?.lines || []).forEach(l => items.push([l.en, l.emotion || 'cheerful']));
  let ok = 0, fail = 0; btn.disabled = true;
  for (let i = 0; i < items.length; i++) {
    const [t, emo] = Array.isArray(items[i]) ? items[i] : [items[i], 'calm'];
    btn.textContent = `در حال دانلود صداها… ${faNum(i + 1)} از ${faNum(items.length)}`;
    try { await cloudTTS(eng, t, 'en', emo); ok++; } catch (e) { fail++; if (e.message === 'BUDGET' || e.message === 'NOKEY') break; await wait(800); }
  }
  btn.disabled = false;
  if (ok && !fail) { lsSet('zd:voiceDl:' + u.id + ':' + voiceSig(), 1); btn.textContent = '✓ صداهای این درس روی دستگاه ذخیره شد'; toast('همهٔ صداهای این درس ذخیره شد؛ از این به بعد بدون اینترنت و فوری پخش می‌شوند.'); }
  else { btn.textContent = `⬇ ادامهٔ دانلود صداها (${faNum(ok)} از ${faNum(items.length)} آماده)`; toast('بعضی صداها دانلود نشد؛ دوباره بزن تا بقیه کامل شود.'); }
}
