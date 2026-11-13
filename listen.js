/* ───────── استودیوی شنیداری: رادیو/پادکست ساختگی متناسب با سطح و درس، با زمان دلخواه ─────────
   برای انگلیسی و عربی. برنامه قطعه‌قطعه ساخته می‌شود تا زمان انتخاب‌شده (مثلاً ۲۰ دقیقه) پر شود،
   دو مجری با صدای متفاوت، موسیقی ملایم، متن و ترجمه، و در پایان چند سؤال درک مطلب. */
const LS_FORMATS = {
  radio: ['📻', 'برنامهٔ رادیویی', 'Two radio hosts (friendly, witty) chat about the topic, with a short "listener call" segment.'],
  news: ['📰', 'اخبار ساده', 'A calm news bulletin with 4-6 short items about the topic area, then a quick recap of key words.'],
  story: ['📖', 'داستان صوتی', 'A narrator tells an engaging short story that uses the target words naturally; two characters speak in dialogue parts.'],
  dialog: ['💬', 'مکالمه‌های واقعی', 'Several realistic everyday conversations in the situation of the topic (shop, phone, office…), each followed by a one-sentence Persian hint of what happened.'],
  podcast: ['🎧', 'پادکست آموزشی', 'A teacher-host explains the topic\'s key words and phrases in the target language slowly, with examples, like a learner podcast.'] };
const LS = { on: false };
function lsLevel() { if (tl() === 'ar') return curUnits()[curIdx()]?.[1] || 'A1'; return currentUnit().cefr || 'A1'; }
function lsTopicDefault() { if (tl() === 'ar') { const A = curUnits()[curIdx()]; return `${A[2]} — ${A[3]}`; } const u = currentUnit(); return `${u.en} (${u.fa})`; }
function lsWords() { try { if (tl() === 'ar') { const P = (U.customPlans || {})[`ar:${curUnits()[curIdx()][0]}:${tlDia()[2]}`]; return (P?.bank || []).flatMap(g => g.items).map(x => String(x).split(/\s[=—]\s/)[0]).slice(0, 40); } return unitWords(currentUnit()).map(w => w.w).slice(0, 40); } catch { return []; } }
routes.listen = () => {
  setTop('استودیوی شنیداری', true); const v = view(); const S = U.listen || (U.listen = { min: 20, fmt: 'radio', speed: 'normal', fa: true });
  v.innerHTML = `<div class="stack">
  <div class="card stack"><b>🎧 تقویت شنیداری متناسب با سطح و درس تو</b><span class="small muted">یک برنامهٔ صوتی تازه، دقیقاً در سطح ${esc(lsLevel())} و با واژه‌های درسی که داری می‌خوانی، به ${esc(tlFa())}. مدت را خودت تعیین می‌کنی؛ برنامه آن‌قدر ادامه می‌دهد تا زمانت پر شود. آخرش چند سؤال درک مطلب می‌پرسد.</span>
    <label class="f">قالب</label><div class="seg wrap" id="lsf">${Object.entries(LS_FORMATS).map(([k, f]) => `<button data-v="${k}" class="${S.fmt === k ? 'on' : ''}">${f[0]} ${f[1]}</button>`).join('')}</div>
    <label class="f">موضوع</label><input class="in" id="lst" value="${esc(S.topic || '')}" placeholder="${esc(lsTopicDefault())} (خالی = درس فعلی)">
    <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><span class="small">مدت:</span><div class="seg" id="lsm">${[5, 10, 20, 30, 45].map(m => `<button data-v="${m}" class="${S.min === m ? 'on' : ''}">${faNum(m)}′</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><span class="small">سرعت:</span><div class="seg" id="lss">${[['slow', '🐢 آهسته'], ['normal', 'معمولی'], ['native', '⚡ بومی']].map(([k, t]) => `<button data-v="${k}" class="${S.speed === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    <label class="row small" style="gap:6px"><input type="checkbox" id="lsfa" ${S.fa ? 'checked' : ''}> نمایش ترجمهٔ فارسی زیر هر جمله</label>
    <div class="row" style="gap:6px"><button class="btn" id="lsgo">▶ شروع برنامه</button><button class="btn ghost" id="lsst" hidden>⏹ توقف</button><span class="pill" id="lsclk" hidden></span></div></div>
  <div id="lsq"></div><div id="lsbody" class="card stack" hidden></div></div>`;
  const seg = (id, key) => $(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; S[key] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; saveU(); $$(`${id} button`).forEach(x => x.classList.toggle('on', x === b)); };
  seg('#lsf', 'fmt'); seg('#lsm', 'min'); seg('#lss', 'speed'); $('#lsfa').onchange = e => { S.fa = e.target.checked; saveU(); };
  $('#lst').onchange = e => { S.topic = e.target.value.trim(); saveU(); };
  $('#lsst').onclick = () => lsStop();
  $('#lsgo').onclick = () => lsRun(S);
};
function lsStop() { LS.on = false; stopSpeak(); try { Music.stop(); } catch { } clearInterval(LS.clk); const s = $('#lsst'); if (s) s.hidden = true; const c = $('#lsclk'); if (c) c.hidden = true; }
async function lsRun(S) {
  const v = view(); if (needAI($('#lsq'))) return; const topic = S.topic || lsTopicDefault(); const lvl = lsLevel(); const words = lsWords();
  const L = tl() === 'ar' ? tlDia()[0] : (G.settings.accent === 'UK' ? 'British English' : 'American English');
  const body = $('#lsbody'); body.hidden = false; body.innerHTML = `<b>${LS_FORMATS[S.fmt][0]} ${esc(LS_FORMATS[S.fmt][1])} · ${esc(topic)}</b><div id="lslines" class="stack" style="gap:4px"></div>`;
  LS.on = true; $('#lsst').hidden = false; const clk = $('#lsclk'); clk.hidden = false; const t0 = Date.now(); const total = S.min * 60;
  LS.clk = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); clk.textContent = `${faNum(Math.floor(s / 60))}:${faNum(String(s % 60).padStart(2, '0'))} / ${faNum(S.min)}:۰۰`; }, 1000);
  const SYS = `You write ${L} listening material for a Persian-speaking learner at CEFR ${lvl}. Strictly at this level: simple structures and high-frequency words for A1/A2, richer for B1+. ${LS_FORMATS[S.fmt][2]} Natural spoken language as natives really talk (contractions, fillers, reactions). Use the target words naturally and recycle them. Every line is one speaker turn of 1-3 sentences.${tl() === 'ar' ? ' Write Arabic in Arabic script with harakat on difficult words; dialect: ' + L + '.' : ''} Persian translations must be natural colloquial Persian.`;
  const hosts = tl() === 'ar' ? [['سالم', 'Charon'], ['مريم', 'Kore'], ['متصل', 'Puck']] : [['Sam', 'Puck'], ['Lily', 'Kore'], ['Caller', 'Charon']];
  const POS = { [hosts[0][0]]: [-1.3, -1], [hosts[1][0]]: [1.3, -1], [hosts[2][0]]: [0, -2.4] }; const VO = Object.fromEntries(hosts);
  const rate = { slow: 0.82, normal: 1, native: 1.12 }[S.speed] || 1; const keepRate = G.settings.rate;
  const asked = []; let part = 0, spokenSec = 0, prev = ''; const allLines = [];
  const gen = async () => { const left = total - (Date.now() - t0) / 1000; const mins = Math.max(2, Math.min(5, Math.round(left / 60)));
    const r = await ai({ temp: 0.9, max: 4000, system: SYS, messages: [{ role: 'user', content: `${typeof learnerContext === 'function' ? learnerContext() : ''}\nTopic: "${topic}". Target words/phrases: ${words.join(', ') || '(none given)'}.\nThis is PART ${part + 1} of a continuous programme; ${part ? 'continue naturally from where part ' + part + ' ended (do not re-introduce the show). Previous ending: «' + prev.slice(-300) + '»' : 'open the programme with a short intro'}. Write about ${mins} minutes of speech (${mins * 11}-${mins * 14} lines). Speakers: ${hosts.map(h => h[0]).join(', ')}${S.fmt === 'story' ? ' (use the first as narrator)' : ''}. ${left < 150 ? 'This is the FINAL part: wrap up and say goodbye.' : ''}\nReturn JSON {"lines":[{"who":"speaker name","t":"line in ${L}","fa":"Persian translation"}],"questions":[{"q":"comprehension question in Persian","a":"short answer in Persian"}]} with 3 questions about this part.` }] });
    part++; prev = (r.lines || []).map(l => l.t).join(' '); (r.questions || []).forEach(q => asked.push(q)); return r.lines || []; };
  try { Music.play('happy'); await wait(1500); Music.duck(true); } catch { }
  let next = gen();
  try {
    while (LS.on) {
      let lines; try { lines = await next; } catch (e) { if (!allLines.length) { lsStop(); return aiErr(e); } break; }
      if (!LS.on) break;
      const left = total - (Date.now() - t0) / 1000; if (left > 120) next = gen(); else next = null;
      for (const l of lines) {
        if (!LS.on || !/^#listen/.test(location.hash)) { LS.on = false; break; }
        allLines.push(l); const el = document.createElement('div'); el.className = 'small ln'; el.style.cssText = 'padding:4px 6px;border-radius:8px;background:var(--accent-soft)';
        el.innerHTML = `<span class="pill">${esc(l.who)}</span> <span class="en">${esc(l.t)}</span>${S.fa && l.fa ? `<div class="muted">${esc(l.fa)}</div>` : ''}`; $('#lslines').append(el); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); $$('.ln', body).forEach(x => { if (x !== el) x.style.background = ''; });
        const [x, z] = POS[l.who] || [0, -1.2]; G.settings.rate = rate; const ts = Date.now(); await voiceAt(l.t, 'en', 'cheerful', VO[l.who] || 'Puck', x, z); spokenSec += (Date.now() - ts) / 1000; await wait(250);
      }
      if (!next) break;
    }
  } finally { G.settings.rate = keepRate; }
  const played = Math.round((Date.now() - t0) / 60000);
  try { Music.duck(false); await wait(1200); Music.stop(); } catch { } clearInterval(LS.clk); $('#lsst') && ($('#lsst').hidden = true);
  if (/^#listen/.test(location.hash)) { const Lg = todayLog(); Lg.news = (Lg.news || 0) + played; Lg.min = (Lg.min || 0) + played; saveU(); lsQuiz(asked.slice(-6), allLines); }
  LS.on = false;
}
function lsQuiz(qs, lines) {
  const q = $('#lsq'); if (!qs.length) { q.innerHTML = ''; return; } let i = 0, score = 0;
  const show = () => { if (i >= qs.length) { q.innerHTML = `<div class="notice soft stack"><b>نتیجهٔ درک مطلب: ${faNum(score)} از ${faNum(qs.length)}</b><span class="small">${score >= qs.length * 0.7 ? 'عالی! گوشَت داره به این سطح عادت می‌کنه 👏' : 'اشکال نداره؛ یک بار دیگر با سرعت آهسته گوش بده.'}</span><button class="btn sm" id="lsagain">🔁 یک برنامهٔ تازه</button></div>`; $('#lsagain').onclick = () => routes.listen(); addXP(score * 3); return; }
    const Q = qs[i]; q.innerHTML = `<div class="notice soft stack"><b class="small">سؤال ${faNum(i + 1)} از ${faNum(qs.length)}:</b><span>${esc(Q.q)}</span><input class="in" id="lsa" placeholder="جوابت را بنویس (فارسی یا ${esc(tlInfo()?.fa || 'انگلیسی')})"><div class="row" style="gap:6px"><button class="btn sm" id="lsok">بررسی</button><button class="btn ghost sm" id="lsshow">نشان بده</button></div><div id="lsr"></div></div>`;
    $('#lsshow').onclick = () => { $('#lsr').innerHTML = `<span class="small">پاسخ: ${esc(Q.a)}</span>`; setTimeout(() => { i++; show(); }, 2500); };
    $('#lsok').onclick = async () => { const a = $('#lsa').value.trim(); if (!a) return; $('#lsr').innerHTML = loading();
      try { const r = await ai({ temp: 0.2, max: 200, system: 'You grade a listening comprehension answer. Be lenient about wording; judge meaning.', messages: [{ role: 'user', content: `Question: ${Q.q}\nExpected: ${Q.a}\nLearner answer: ${a}\nJSON {"ok":true|false,"fb":"one short warm Persian sentence"}` }] }); if (r.ok) score++; $('#lsr').innerHTML = `<span class="small">${r.ok ? '✅' : '❌'} ${esc(r.fb || '')}${r.ok ? '' : ' — پاسخ: ' + esc(Q.a)}</span>`; }
      catch { const ok = a && Q.a && (Q.a.includes(a) || a.includes(Q.a)); if (ok) score++; $('#lsr').innerHTML = `<span class="small">${ok ? '✅' : '❌'} پاسخ: ${esc(Q.a)}</span>`; }
      setTimeout(() => { i++; show(); }, 2500); }; };
  show();
}
