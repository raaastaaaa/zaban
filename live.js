/* زبان رستا — کلاس زنده با معلم (گفتگوی صوتی زنده مثل حالت صوتی ChatGPT) + تمرین رایگان با ChatGPT */
'use strict';
const LIVE_MODELS = ['gemini-3.8-live', 'gemini-2.5-flash-native-audio-latest'];
const LIVE_MODES = {
  lesson: ['📖', 'درس امروز', 'معلم با درس امروز و کارهای برنامه‌ات شروع می‌کند'],
  talk: ['💬', 'گپ آزاد', 'دربارهٔ هر چیزی حرف بزنید؛ معلم موضوع می‌دهد'],
  ask: ['🙋', 'ازم سؤال بپرس', 'معلم سؤال می‌پرسد و تو جواب می‌دهی'],
  mistakes: ['🔁', 'مرور اشتباه‌هایم', 'اشتباه‌های قبلی‌ات را با هم تمرین می‌کنید'],
  role: ['🎭', 'نقش‌آفرینی', 'فرودگاه، رستوران، مصاحبهٔ کاری…'],
  advisor: ['🧭', 'مشاور برنامه', 'دربارهٔ هدف و برنامه‌ات حرف بزن']
};
let LIVE_LESSON = null;
async function liveLessonText() { try { const u = currentUnit(); const L = await lessonGet(u); if (!L) return ''; const c = L.conversation?.lines || [], g = L.grammar || {};
  return `\nTODAY'S LESSON MATERIAL (teach from this, interactively, step by step):\n- Conversation "${L.conversation?.title || ''}": ${c.map(l => `${l.who}: ${l.en}`).join(' | ')}\n- Grammar "${g.title || ''}": ${(g.rules || []).map(r => r.en).join(' | ')}\n- Examples: ${(g.examples || []).map(x => x.en || x).join(' | ')}\n- Key phrases: ${(L.phrasebook || []).flatMap(x => x.items || []).slice(0, 20).map(x => x.en).join(', ')}\nTeaching order: 1) warm-up question 2) teach 5-6 new words (say them, meaning in Persian, make student repeat and use them) 3) read the conversation line by line, explain each line in Persian, student repeats 4) teach the grammar with examples, then student makes own sentences 5) role-play the conversation with the student 6) quick 5-question quiz 7) recap what they learned and their mistakes. Always wait for the student's answer before moving on.`; } catch { return ''; } }
function livePrompt(mode) {
  const u = currentUnit(); const tp = todayPlan(); const acc = G.settings.accent === 'UK' ? 'British' : 'American';
  const mist = (U.mistakes || []).slice(-12).map(m => `${m.wrong} → ${m.right}`).join('; ');
  const words = unitWords(u).slice(0, 25).map(w => w.w).join(', ');
  const base = `You are «${G.settings.teacher}», a real, warm, witty Iranian English teacher talking LIVE by voice with your student «${me()?.name || ''}». Speak like a human on a phone call: natural, emotional (laugh, get excited, show gentle disappointment when they forget something), short turns (1-3 sentences), then let them talk. Speak natural colloquial Tehrani Persian for explanations and ${acc} English for English. Correct mistakes gently right away: say the correct form, explain briefly in Persian, and make them repeat it. Never lecture for long.
Student level: ${u.cefr || 'A1'}. Current lesson: "${u.en}" (${u.fa}); grammar: ${u.gram}; words: ${words}.
Today's plan tasks: ${(tp?.tasks || []).map(t => t.t).join('; ') || 'none'}.
Their recent mistakes: ${mist || 'none yet'}.
${typeof planContext === 'function' ? planContext() : ''}
${learnerContext()}${mode === 'lesson' && LIVE_LESSON ? LIVE_LESSON : ''}`;
  const m = {
    lesson: 'Start by greeting them warmly in Persian, then say what you will do today (lesson words → conversation practice → grammar → quick quiz), and begin. Teach today\'s lesson step by step, making them speak a lot. When a planned task is clearly finished, call mark_done with its text.',
    talk: 'Greet them and suggest 3 fun topics; chat freely in mostly English at their level, recasting mistakes and explaining briefly in Persian.',
    ask: 'Interview them: ask one personal question at a time in simple English (Persian help if they get stuck), react with real interest, correct mistakes, ask follow-ups.',
    mistakes: 'Review their recent mistakes one by one: give a situation, let them say it, praise or correct, and repeat until it is right.',
    role: 'Offer a real-life role-play (airport, café, hotel, job interview, shopping). Explain their role in Persian, then play the other person in English. After ~10 exchanges, step out and give feedback in Persian.',
    advisor: 'You are now their study ADVISOR. Speak only Persian. Discuss their goal, progress, missed days and a realistic plan, with concrete numbers. Ask one question at a time.'
  }[mode];
  return base + '\n' + m;
}
async function liveToken() {
  if (G.settings.prov.gemini.key) return { key: G.settings.prov.gemini.key };
  const d = await serverGem(LIVE_MODELS, 'liveToken', {});
  if (!d?.token) throw new Error('NOKEY'); return { token: d.token };
}
const Live = { ws: null, ctx: null, mic: null, node: null, src: null, playAt: 0, queue: [], on: false, mode: 'lesson', started: 0, timer: 0 };
async function liveStart(mode, ui) {
  if (Live.on) return; Live.mode = mode; ui.status('در حال وصل شدن به معلم…'); stopSpeak(); if (window.BGP?.on) BGP.stop();
  let auth; try { auth = await liveToken(); } catch (e) { ui.status(''); ui.idle(); return aiErr(e); }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch { ui.status(''); ui.idle(); return toast('اجازهٔ میکروفون داده نشده؛ از تنظیمات مرورگر اجازه بده.'); }
  const C = window.AudioContext || window.webkitAudioContext; Live.ctx = new C(); await Live.ctx.resume(); Live.playAt = 0; Live.queue = [];
  const tryModel = i => new Promise((res, rej) => {
    const url = auth.key ? `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(auth.key)}`
      : `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(auth.token)}`;
    const ws = new WebSocket(url); let ok = false;
    ws.onopen = () => ws.send(JSON.stringify({ setup: { model: 'models/' + LIVE_MODELS[i], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: G.settings.geminiVoice || 'Kore' } } } },
      systemInstruction: { parts: [{ text: livePrompt(mode) }] }, inputAudioTranscription: {}, outputAudioTranscription: {},
      tools: [{ functionDeclarations: [{ name: 'mark_done', description: 'Mark one of today\'s planned tasks as done when the student finished it in this session.', parameters: { type: 'OBJECT', properties: { task: { type: 'STRING', description: 'task text' } }, required: ['task'] } }] }] } }));
    ws.onmessage = async ev => { const m = JSON.parse(typeof ev.data === 'string' ? ev.data : await ev.data.text()); if (m.setupComplete && !ok) { ok = true; res(ws); } else liveMsg(m, ui); };
    ws.onerror = () => { if (!ok) rej(new Error('ws')); };
    ws.onclose = e => { if (!ok) rej(new Error(e.reason || 'closed')); else if (Live.ws === ws) { ui.status(e.reason && /quota|exceed/i.test(e.reason) ? 'سهمیهٔ رایگان امروز کلاس زنده تمام شد؛ فردا دوباره.' : 'تماس تمام شد.'); liveStop(ui, true); } };
  });
  try { Live.ws = await tryModel(0).catch(() => auth.key ? tryModel(1) : Promise.reject(new Error('busy'))); }
  catch { stream.getTracks().forEach(t => t.stop()); Live.ctx.close(); ui.status(''); ui.idle(); return toast('کلاس زنده الان وصل نشد؛ اینترنت را بررسی کن (در ایران فیلترشکن لازم است) و دوباره امتحان کن.', 6000); }
  Live.on = true; Live.started = Date.now(); Live.mic = stream; ui.live();
  // میکروفون → PCM ۱۶ کیلوهرتز
  const src = Live.ctx.createMediaStreamSource(stream); const proc = Live.ctx.createScriptProcessor(4096, 1, 1); const ratio = Live.ctx.sampleRate / 16000;
  proc.onaudioprocess = e => { if (!Live.on || Live.ws?.readyState !== 1) return; const x = e.inputBuffer.getChannelData(0); const n = Math.floor(x.length / ratio); const pcm = new Int16Array(n); let lvl = 0;
    for (let i = 0; i < n; i++) { const v = x[Math.floor(i * ratio)]; lvl = Math.max(lvl, Math.abs(v)); pcm[i] = Math.max(-1, Math.min(1, v)) * 0x7fff; }
    ui.level(lvl); let bin = ''; const b = new Uint8Array(pcm.buffer); for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000));
    Live.ws.send(JSON.stringify({ realtimeInput: { audio: { data: btoa(bin), mimeType: 'audio/pcm;rate=16000' } } })); };
  const mute = Live.ctx.createGain(); mute.gain.value = 0; src.connect(proc); proc.connect(mute); mute.connect(Live.ctx.destination); Live.node = proc; Live.src = src;
  Live.ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: 'سلام! شروع کن.' }] }], turnComplete: true } }));
  Live.timer = setInterval(() => { const s = Math.round((Date.now() - Live.started) / 1000); ui.clock(s); const L = todayLog(); L.min = (L.min || 0) + 1 / 60; L.live = (L.live || 0) + 1 / 60; if (s % 30 === 0) saveU(); }, 1000);
}
function livePlay(b64) {
  const bin = atob(b64); const n = bin.length >> 1; const f = new Float32Array(n);
  for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v >= 32768) v -= 65536; f[i] = v / 32768; }
  const buf = Live.ctx.createBuffer(1, n, 24000); buf.copyToChannel(f, 0); const s = Live.ctx.createBufferSource(); s.buffer = buf; s.connect(Live.ctx.destination);
  const t = Math.max(Live.ctx.currentTime + 0.03, Live.playAt); s.start(t); Live.playAt = t + buf.duration; Live.queue.push(s); s.onended = () => { Live.queue = Live.queue.filter(x => x !== s); };
}
function liveMsg(m, ui) {
  const sc = m.serverContent;
  if (sc) {
    if (sc.interrupted) { Live.queue.forEach(s => { try { s.stop(); } catch { } }); Live.queue = []; Live.playAt = 0; }
    for (const p of sc.modelTurn?.parts || []) if (p.inlineData?.data) { livePlay(p.inlineData.data); ui.speaking(true); }
    if (sc.inputTranscription?.text) ui.say('me', sc.inputTranscription.text);
    if (sc.outputTranscription?.text) ui.say('t', sc.outputTranscription.text);
    if (sc.turnComplete) { ui.say('end'); setTimeout(() => ui.speaking(false), Math.max(0, (Live.playAt - Live.ctx.currentTime) * 1000)); }
  }
  if (m.toolCall) {
    const res = (m.toolCall.functionCalls || []).map(fc => { const want = (fc.args?.task || '').trim(); const t = (todayPlan()?.tasks || []).find(x => x.t.includes(want) || want.includes(x.t.slice(0, 12)));
      if (t) { U.mdone = U.mdone || {}; U.mdone[isoDay() + '|' + t.k] = 1; addXP(3); saveU(); toast('✓ در برنامهٔ امروز علامت خورد: ' + t.t); }
      return { id: fc.id, name: fc.name, response: { result: t ? 'done' : 'task not found' } }; });
    Live.ws?.send(JSON.stringify({ toolResponse: { functionResponses: res } }));
  }
  if (m.goAway) ui.status('جلسه رو به پایان است؛ بعد از قطع، دوباره وصل شو.');
}
function liveStop(ui, silent) {
  Live.on = false; clearInterval(Live.timer); try { Live.node?.disconnect(); Live.src?.disconnect(); } catch { } Live.mic?.getTracks().forEach(t => t.stop());
  Live.queue.forEach(s => { try { s.stop(); } catch { } }); Live.queue = []; const ws = Live.ws; Live.ws = null; try { ws?.close(); } catch { } try { Live.ctx?.close(); } catch { }
  saveU(); ui?.idle(); if (!silent) ui?.status('تماس تمام شد. آفرین! 👏');
}

routes.live = (mode = 'lesson') => {
  if (!LIVE_MODES[mode]) mode = 'lesson'; setTop('کلاس زنده با معلم', true); const v = view(); const L = todayLog();
  v.innerHTML = `<div class="stack">
  <div class="live-card"><div class="live-av" id="lav"><span>👩‍🏫</span><i></i></div><b id="lst">${esc(G.settings.teacher)} آماده است</b><span class="small" id="lclk">${faNum(Math.round(L.live || 0))} دقیقه کلاس زندهٔ امروز</span>
    <div class="row" style="justify-content:center"><button class="btn live-go" id="lgo">📞 شروع کلاس</button></div>
    <span class="tiny" style="opacity:.8">مثل تماس تلفنی حرف بزن؛ وسط حرف معلم هم می‌توانی بپری. هدفون بهتر است.</span></div>
  <div class="vb-cats" style="flex-wrap:wrap">${Object.entries(LIVE_MODES).map(([k, [ic, t]]) => `<button class="pill ${k === mode ? 'acc' : ''}" data-lm="${k}">${ic} ${t}</button>`).join('')}</div>
  <div class="small muted" id="lmd">${esc(LIVE_MODES[mode][2])}</div>
  <div class="card stack live-log" id="llog"><span class="small muted">متن گفتگو اینجا نوشته می‌شود.</span></div>
  <div class="card stack"><b>🎙 تمرین رایگان با ChatGPT</b><span class="small muted">اگر حساب ChatGPT داری (رایگان هم کافی است)، این دکمه ChatGPT را با دستور آمادهٔ درس امروز، برنامه و اشتباه‌هایت باز می‌کند؛ بعد در ChatGPT دکمهٔ حالت صوتی را بزن.</span>
    <div class="row"><button class="btn ghost" id="gpt">باز کردن در ChatGPT</button><button class="btn line sm" id="gptc">کپی دستور</button></div></div></div>`;
  const log = $('#llog'); let cur = null, who = null;
  const ui = {
    status: t => { $('#lst') && ($('#lst').textContent = t || `${G.settings.teacher} آماده است`); },
    live: () => { $('#lgo').textContent = '⏹ پایان کلاس'; $('#lgo').classList.add('bad'); $('#lav').classList.add('on'); ui.status('وصل شدی؛ حرف بزن 🙂'); log.innerHTML = ''; },
    idle: () => { const b = $('#lgo'); if (!b) return; b.textContent = '📞 شروع کلاس'; b.classList.remove('bad'); $('#lav')?.classList.remove('on', 'talk'); },
    level: l => { $('#lav')?.style.setProperty('--lv', Math.min(1, l * 4).toFixed(2)); },
    speaking: on => { $('#lav')?.classList.toggle('talk', on); },
    clock: s => { $('#lclk') && ($('#lclk').textContent = `⏱ ${faNum(Math.floor(s / 60))}:${faNum(String(s % 60).padStart(2, '0'))}`); },
    say: (w, t) => { if (w === 'end') { cur = null; who = null; return; } if (who !== w || !cur) { cur = document.createElement('div'); cur.className = 'll ' + w; cur.innerHTML = `<b>${w === 'me' ? 'تو' : esc(G.settings.teacher)}:</b> <span></span>`; log.appendChild(cur); who = w; } cur.querySelector('span').textContent += t; cur.scrollIntoView({ block: 'nearest' }); }
  };
  $('#lgo').onclick = () => Live.on ? liveStop(ui) : liveStart(mode, ui);
  $$('[data-lm]', v).forEach(b => b.onclick = () => { if (Live.on) liveStop(ui, true); go('live/' + b.dataset.lm); });
  liveLessonText().then(t => LIVE_LESSON = t);
  const gptPrompt = () => `${livePrompt(mode)}\n\nIMPORTANT: This is a voice conversation in the ChatGPT app. Start right now by greeting me in Persian and beginning.`;
  $('#gpt').onclick = () => { const p = gptPrompt(); try { navigator.clipboard.writeText(p); } catch { } window.open('https://chatgpt.com/?q=' + encodeURIComponent(p.slice(0, 6000)), '_blank'); };
  $('#gptc').onclick = async () => { try { await navigator.clipboard.writeText(gptPrompt()); toast('دستور کپی شد؛ در ChatGPT بچسبان و بفرست.'); } catch { toast('کپی نشد.'); } };
  addEventListener('hashchange', function h() { if (!/^#live/.test(location.hash)) { if (Live.on) liveStop(null, true); removeEventListener('hashchange', h); } });
};
