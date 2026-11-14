/* ───────── «درس با معلم» — درس صوتی کامل + درس‌نامهٔ نوشتاری (معلم متکلم‌وحدهٔ آفلاین) ─────────
   هر درس: روایت پیوستهٔ معلم خصوصی به فارسیِ محاوره‌ایِ حرفه‌ای + جمله‌ها با صدای بومی + ترجمه + «تو بگو» با مکث.
   • یک فایل صوتی پیوسته (برای گوش دادن قبل از خواب، با صفحهٔ قفل): فصل‌بندی، سرعت، تایمر خواب، ادامه از همان‌جا
   • همان متن به‌صورت نوشتاری، هم‌زمان با صدا رنگی می‌شود
   • دانلود کامل برای آفلاین (در حافظهٔ گوشی) */
const DARS_BASE = 'audio_dars/'; // میزبان فایل‌های صوتی بلند (بعداً: مخزن جداگانهٔ صوت)
const darsDir = () => tl() === 'en' ? 'en' : (typeof OFFLINE_DIR !== 'undefined' && OFFLINE_DIR[tlDia()[2]]) || null;
async function darsGet(id) { const d = darsDir(); if (!d) return null; try { const r = await fetch(`lessons/dars/${d}/${id}.json`); return r.ok ? await r.json() : null; } catch { return null; } }
const darsUrl = id => `${DARS_BASE}${darsDir()}/${id}.mp3`;
const fmtT = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return `${faNum(m)}:${faNum(String(s % 60).padStart(2, '0'))}`; };
let DARS_AUDIO = null; // یک پخش‌کنندهٔ سراسری تا بین صفحه‌ها قطع نشود

routes.dars = async (id) => {
  if (!id) return darsIndex();
  setTop('درس با معلم', true); const v = view(); v.innerHTML = loading('درس را باز می‌کنم…');
  const D = await darsGet(id); if (decodeURIComponent(location.hash.split('/')[1] || '') !== id) return;
  if (!D) { v.innerHTML = `<div class="card stack"><b>درس صوتی این درس هنوز آماده نیست.</b><span class="small muted">درس‌های صوتی یکی‌یکی اضافه می‌شوند.</span><a class="btn" href="#dars">همهٔ درس‌های صوتی</a></div>`; return; }
  const A = D.audio || { chapters: [], marks: {} }; const posKey = 'zd:darsPos:' + darsDir() + ':' + id;
  const segHTML = (s, ci, si) => {
    const k = `${ci}:${si}`;
    if (s.T) return `<p class="ds-t" data-m="${k}">${esc(s.T)}</p>`;
    if (s.E) return `<div class="ds-e" data-m="${k}"><button class="icon-btn sm" data-say="${esc(s.E)}" aria-label="پخش">🔊</button><div class="grow"><b class="en keep-en" dir="auto">${esc(s.E)}</b>${s.tr ? `<div class="small muted">${esc(s.tr)}</div>` : ''}</div></div>`;
    if (s.Q) return `<div class="ds-q" data-m="${k}"><span>🗣️ ${esc(s.Q)}</span><button class="chip sm" data-ans="${esc(s.A || '')}">جواب</button></div>`;
    return '';
  };
  v.innerHTML = `<div class="stack dars">
    <div class="today dars-player"><b style="font-size:18px">👩‍🏫 ${esc(D.title_fa || '')}</b><span class="small">درس کامل با معلم — فقط گوش بده؛ هر جا گفت «بگو»، بلند تکرار کن.</span>
      <div class="dp-bar"><input type="range" id="dps" min="0" max="${Math.round(A.dur || 0)}" value="0" step="1" aria-label="جای پخش"><div class="row tiny" style="justify-content:space-between"><span id="dpt">۰:۰۰</span><span>${fmtT(A.dur || 0)}</span></div></div>
      <div class="row dp-ctl" style="justify-content:center"><button class="icon-btn" id="dpb" aria-label="۱۵ ثانیه عقب">⟲۱۵</button><button class="btn dp-play" id="dpp" aria-label="پخش">▶</button><button class="icon-btn" id="dpf" aria-label="۱۵ ثانیه جلو">۱۵⟳</button></div>
      <div class="row" style="justify-content:center;gap:6px"><button class="chip sm" id="dpr">سرعت ۱×</button><button class="chip sm" id="dpz">🌙 تایمر خواب</button><button class="chip sm" id="dpd">⬇ آفلاین</button></div><span class="tiny muted" id="dpm"></span></div>
    <div class="card stack"><b class="small">فصل‌های درس</b>${(A.chapters || []).map((c, i) => `<button class="row ds-ch" data-t="${c.t}" style="justify-content:space-between;flex-wrap:nowrap;text-align:right"><span>${faNum(i + 1)}. ${esc(c.h)}</span><span class="tiny muted">${fmtT(c.t)}</span></button>`).join('')}</div>
    ${D.chapters.map((ch, ci) => `<section class="card stack ds-sec" id="dc${ci}"><b>${faNum(ci + 1)}. ${esc(ch.h)}</b>${ch.seg.map((s, si) => segHTML(s, ci, si)).join('')}</section>`).join('')}</div>`;
  // پخش‌کننده
  if (!D.audio) { $('.dars-player', v).innerHTML = `<b style="font-size:18px">👩‍🏫 ${esc(D.title_fa || '')}</b><span class="small">نسخهٔ صوتی این درس به‌زودی اضافه می‌شود؛ فعلاً درس‌نامهٔ نوشتاری‌اش آماده است 👇</span>`; v.querySelectorAll('.ds-ch').forEach(b => b.remove()); v.addEventListener('click', e => { const s = e.target.closest('[data-say]'); if (s) return say(s.dataset.say, 'en', 'calm', s); const a = e.target.closest('[data-ans]'); if (a) a.outerHTML = `<b class="en keep-en" dir="auto">${esc(a.dataset.ans)}</b>`; }); return; }
  if (DARS_AUDIO?.dataset.id !== id) { try { DARS_AUDIO?.pause(); } catch { } DARS_AUDIO = new Audio(); DARS_AUDIO.preload = 'metadata'; DARS_AUDIO.dataset.id = id;
    const off = await idb.get('dars:' + darsDir() + ':' + id).catch(() => null); DARS_AUDIO.src = off ? URL.createObjectURL(off) : darsUrl(id);
    const pos = +lsGet(posKey, 0); if (pos > 5 && pos < (A.dur || 1e9) - 10) DARS_AUDIO.currentTime = pos; }
  const au = DARS_AUDIO; const marks = Object.entries(A.marks || {}).map(([k, t]) => [t, k]).sort((a, b) => a[0] - b[0]);
  const els = Object.fromEntries($$('[data-m]', v).map(e => [e.dataset.m, e])); let lastK = '', follow = true;
  const tick = () => { if (!document.body.contains(v) || location.hash.indexOf('#dars/' + id) !== 0) return;
    const t = au.currentTime; $('#dps').value = Math.round(t); $('#dpt').textContent = fmtT(t); $('#dpp').textContent = au.paused ? '▶' : '⏸';
    let k = ''; for (const [mt, mk] of marks) { if (mt <= t + 0.05) k = mk; else break; }
    if (k && k !== lastK) { els[lastK]?.classList.remove('on'); els[k]?.classList.add('on'); lastK = k; if (follow && !au.paused) els[k]?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    if (!au.paused && Math.round(t) % 5 === 0) lsSet(posKey, Math.round(t)); };
  ['timeupdate', 'play', 'pause', 'seeked'].forEach(e => au.addEventListener(e, tick));
  au.onended = () => { lsSet(posKey, 0); const L = todayLog(); L.min = (L.min || 0) + Math.round((A.dur || 0) / 60); addXP(15); saveU(); toast('درس تمام شد؛ آفرین! 🎉'); };
  $('#dpp').onclick = () => { if (au.paused) { haltAudio(); au.play().catch(() => toast('پخش نشد؛ اینترنت را بررسی کن یا درس را آفلاین کن.')); } else au.pause(); };
  $('#dpb').onclick = () => au.currentTime = Math.max(0, au.currentTime - 15); $('#dpf').onclick = () => au.currentTime = Math.min(A.dur || au.duration || 0, au.currentTime + 15);
  $('#dps').oninput = e => au.currentTime = +e.target.value;
  const RATES = [0.85, 1, 1.15, 1.3]; $('#dpr').onclick = () => { const r = RATES[(RATES.indexOf(au.playbackRate) + 1) % RATES.length] || 1; au.playbackRate = r; $('#dpr').textContent = `سرعت ${faNum(r)}×`; };
  let sleepT = null; const SL = [15, 30, 45, 60, 0]; let sli = -1;
  $('#dpz').onclick = () => { sli = (sli + 1) % SL.length; clearTimeout(sleepT); const m = SL[sli];
    if (!m) { $('#dpz').textContent = '🌙 تایمر خواب'; $('#dpm').textContent = ''; return; }
    $('#dpz').textContent = `🌙 ${faNum(m)} دقیقه`; $('#dpm').textContent = `بعد از ${faNum(m)} دقیقه آرام قطع می‌شود.`;
    sleepT = setTimeout(() => { let vol = 1; const f = setInterval(() => { vol -= 0.05; au.volume = Math.max(0, vol); if (vol <= 0) { clearInterval(f); au.pause(); au.volume = 1; } }, 400); }, m * 60000); };
  $('#dpd').onclick = async () => { const b = $('#dpd'); b.textContent = '⏳ در حال دانلود…';
    try { const r = await fetch(darsUrl(id)); if (!r.ok) throw 0; const blob = await r.blob(); await idb.set('dars:' + darsDir() + ':' + id, blob); b.textContent = '✓ آفلاین شد'; toast('این درس صوتی روی گوشی ذخیره شد؛ بدون اینترنت هم پخش می‌شود ✓'); } catch { b.textContent = '⬇ آفلاین'; toast('دانلود نشد؛ اینترنت را بررسی کن.'); } };
  idb.get('dars:' + darsDir() + ':' + id).then(x => { if (x) $('#dpd').textContent = '✓ آفلاین'; }).catch(() => { });
  v.querySelectorAll('.ds-ch').forEach(b => b.onclick = () => { au.currentTime = +b.dataset.t; if (au.paused) $('#dpp').click(); });
  v.addEventListener('click', e => { const s = e.target.closest('[data-say]'); if (s) { au.pause(); return say(s.dataset.say, 'en', 'calm', s); }
    const a = e.target.closest('[data-ans]'); if (a) { a.outerHTML = `<b class="en keep-en" dir="auto">${esc(a.dataset.ans)}</b>`; return; }
    const m = e.target.closest('[data-m]'); if (m && A.marks?.[m.dataset.m] != null && !e.target.closest('button')) { au.currentTime = A.marks[m.dataset.m]; if (au.paused) $('#dpp').click(); } });
  addEventListener('touchmove', () => { follow = false; clearTimeout(follow._t); follow._t = setTimeout(() => follow = true, 8000); }, { passive: true });
  if ('mediaSession' in navigator) { navigator.mediaSession.metadata = new MediaMetadata({ title: D.title_fa || 'درس صوتی', artist: 'زبان رستا — درس با معلم', album: tl() === 'en' ? 'انگلیسی' : tlInfo().fa, artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
    navigator.mediaSession.setActionHandler('play', () => au.play()); navigator.mediaSession.setActionHandler('pause', () => au.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => au.currentTime -= 15); navigator.mediaSession.setActionHandler('seekforward', () => au.currentTime += 15);
    const chT = (A.chapters || []).map(c => c.t); navigator.mediaSession.setActionHandler('nexttrack', () => { const n = chT.find(t => t > au.currentTime + 1); if (n != null) au.currentTime = n; });
    navigator.mediaSession.setActionHandler('previoustrack', () => { const p = chT.filter(t => t < au.currentTime - 3).pop(); au.currentTime = p ?? 0; }); }
  tick();
};
function darsIndex() {
  setTop('درس با معلم', true); const v = view(); const all = typeof wbUnits === 'function' ? wbUnits() : [];
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">👩‍🏫 درس با معلم (صوتی)</b><span class="small">هر درس یک کلاس خصوصی کامل است: معلم به فارسی توضیح می‌دهد، موقعیت‌های رسمی و خودمانی را مقایسه می‌کند، مکالمه پخش و جمله‌به‌جمله ترجمه می‌شود و از تو می‌خواهد بلند تکرار کنی. فقط گوش بده — حتی قبل از خواب.</span></div>
  <div class="stack">${all.map((u, i) => `<a class="card row" href="#dars/${esc(u.id)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="pill">${faNum(i + 1)}</span><span class="grow"><b>${esc(u.fa)}</b><br><span class="tiny muted en keep-en">${esc(u.en)}</span></span><span>🎧</span></a>`).join('')}</div></div>`;
}
