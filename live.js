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
let LIVE_LESSON = null, LIVE_L = null, LIVE_PLANS = null;
const liveSel = () => Object.assign({ unit: '', focus: 'full', ws: '', gram: '' }, lsGet('zd:livesel:' + G.active, {}));
const LIVE_FOCUS = { full: ['📚', 'کل درس'], conv: ['💬', 'مکالمه'], words: ['🗂️', 'واژه‌ها'], grammar: ['📐', 'گرامر'], pron: ['🗣', 'تلفظ'] };
async function livePlans() { if (!LIVE_PLANS) LIVE_PLANS = fetch('lessons/plans/all.json').then(r => r.json()).catch(() => (LIVE_PLANS = null, {})); return LIVE_PLANS; }
async function liveLessonText() { try {
  const S = liveSel(); const RG = { f: 'formal', n: 'neutral', i: 'informal', s: 'slang' };
  if (S.ws) { const u = unitById(S.ws); if (u) { await wsLoad(u.level); LIVE_L = null; const W = unitWords(u);
    return `\n=== VOCABULARY TOPIC (Word Skills ${u.levelFa || ''}): "${u.en}" (${u.fa}) — section: ${u.sec || ''} ===\nCOMPLETE WORD BANK (teach ALL of it, in groups of 5-6):\n${W.map(w => `- ${w.w} = ${w.fa}${w.reg ? ` [${RG[w.reg] || w.reg}]` : ''}${w.use ? ` — ${w.use}` : ''}${w.ex ? ` e.g. "${w.ex}" (${w.exFa || ''})` : ''}`).join('\n')}`; } }
  if (S.gram) { const g = (typeof GRAMMAR !== 'undefined' ? GRAMMAR : []).find(x => x.id === S.gram); if (g) { LIVE_L = null; return `\n=== GRAMMAR TOPIC: "${g.fa}" (level ${g.lvl}) ===\nTeach this grammar topic completely (form, uses, contrasts with similar structures and with Persian, common mistakes of Persian speakers), using everyday situations and the student's life.`; } }
  const u = S.unit && unitById(S.unit) || currentUnit(); const P = (await livePlans())[u.id]; const L = await lessonGet(u).catch(() => null); LIVE_L = L; const W = unitWords(u);
  const c = L?.conversation?.lines || [], g = L?.grammar || {};
  return `
=== LESSON: "${u.en}" (${u.fa}) — level ${u.cefr || ''} ===
${P ? `GOAL: ${P.goal}
HOW YOU OPEN THE CLASS (say this naturally in your own words): ${P.intro}
COMPLETE WORD BANK, grouped (teach ALL items of the relevant groups; the student must master the whole bank):
${P.bank.map(b => `[${b.g}] ` + b.items.join(' ; ')).join('\n')}
KEY SENTENCE PATTERNS: ${P.patterns.join(' | ')}
CONCEPT-CHECK QUESTIONS: ${P.checks.join(' | ')}
ROLE-PLAYS: ${P.roleplay.join(' | ')}
PERSONAL QUESTIONS: ${P.personal.join(' | ')}
GRAMMAR: ${P.grammar.point}. Examples: ${P.grammar.examples.join(' | ')}. Rule (Persian): ${P.grammar.rule}. Drill (Persian→English): ${P.grammar.drill.join(' | ')}
PRONUNCIATION FOCUS: ${P.pron.join(' | ')}
QUIZ: ${P.quiz.join(' | ')}` : `WORDS: ${W.slice(0, 40).map(w => `${w.w} = ${w.fa}${w.use ? ` (${w.use})` : ''}`).join(' ; ')}`}
${(L?.phrasebook || []).length ? 'PHRASEBOOK: ' + L.phrasebook.map(gr => `[${gr.group}] ` + (gr.items || []).map(x => `${x.en} = ${x.fa} (${x.register}; ${x.use || ''})`).join(' / ')).join('\n') : ''}
${c.length ? `CONVERSATION "${L.conversation.title || ''}" (${L.conversation.setting || ''}):\n${c.map((l, i) => `${i + 1}. ${l.who}: ${l.en}  (= ${l.fa})`).join('\n')}` : ''}
${g.title ? `LESSON GRAMMAR "${g.title}": ${g.explain || ''} ${(g.rules || []).map(r => r.en).join(' | ')}` : ''}`; } catch (e) { return ''; } }
const FOCUS_METHOD = {
  full: null,
  conv: `FOCUS = CONVERSATION. Plan: 1) set the scene in Persian (who, where, why) 2) pre-teach 4-5 key chunks from it 3) call play_conversation (gist question first: "کی با کی حرف می‌زنه و دربارهٔ چی؟") 4) detail questions 5) line by line: meaning, natural native pronunciation and the reusable chunk 6) shadowing: student repeats each line after you 7) role-play A/B, then swap 8) variation: change details (names, places) and replay 9) a personal version of the dialogue about the student's own life.`,
  words: `FOCUS = VOCABULARY. Plan: teach the WHOLE word bank group by group (5-6 items per group). For each item: situation in Persian → English word with native pronunciation → meaning → register and when to use / what not to say → student repeats → student uses it in a sentence. After each group: quick-fire check (Persian → English, then English → Persian), odd-one-out or "which one for this situation". Recycle earlier groups every few minutes (spaced review). End with a mixed 10-item quiz and tell them which words to add to Leitner.`,
  grammar: `FOCUS = GRAMMAR. Plan (guided discovery): 1) show 3-4 example sentences on the board (show_board) and ask the student what they notice 2) explain the rule simply in Persian, compare with Persian 3) form table (positive/negative/question/short answer) 4) controlled drill: Persian → English and transformations, one at a time 5) error correction: say wrong sentences, student fixes them 6) personalized production: student makes true sentences about their life 7) mini quiz and recap of the rule.`,
  pron: `FOCUS = PRONUNCIATION & LISTENING. Plan: take the key phrases and sentences of the lesson; for each: say it slowly, then at natural native speed; explain connected speech (linking, weak forms, flap t, dropped sounds) and write the native sound in Persian script on the board (e.g. «نایس تِ میچا»); student repeats; you give precise feedback on the sounds Persian speakers find hard (th, w/v, r, short/long vowels, word stress, sentence rhythm). Then minimal pairs and a short shadowing drill.`
};
const LESSON_METHOD = `
=== HOW YOU TEACH (a real private tutor, NOT a parrot) ===
You are teaching a private one-to-one lesson. NEVER just say a phrase and ask "repeat after me" without context. Always: explain the real-life situation first in Persian, then the English, its register (formal/neutral/informal/slang), exactly when and with whom natives use it, what NOT to say, then practice. Example of the style you must use:
«ببین، خارجی‌ها وقتی یه دوست یا همکار رو می‌بینن معمولاً نمی‌گن Hello، می‌گن Hi! یا خودمونی‌تر Hey. ولی اگه طرف رسمی باشه، مثلاً رئیست یا مشتری، می‌گی Hello یا Good morning. حالا تصور کن صبح رسیدی شرکت و مدیرت رو دیدی؛ چی می‌گی؟» → wait for the answer → praise/correct → next.
Follow this LESSON PLAN in order, one step at a time, announcing each step in Persian ("خب، حالا بریم مرحلهٔ بعد…"). Call show_board at the start of each step to put the key items on the student's screen.
1) WARM-UP (1 min): greet warmly, ask how their day was, tell them today's goal in one sentence ("امروز یاد می‌گیری …").
2) PRESENTATION (teach the language by FUNCTION, grouped): for each group (e.g. saying hello → asking how someone is → answering → introducing yourself → saying goodbye): explain the situation in Persian, give 2-4 phrases from formal to informal with when to use each, model the natural native pronunciation (connected speech, e.g. "Nice to meet you" ≈ «نایس تِ میچا»), make the student say each one, and fix pronunciation.
3) CONCEPT CHECK: give Persian situations and ask which English phrase fits ("با رئیست چی می‌گی؟ با دوستت چی؟"). Wait for each answer.
4) LISTENING: say "حالا یه مکالمهٔ واقعی بین دو نفر رو گوش کن" and call play_conversation. When it returns, ask 2 comprehension questions, then go through it line by line: explain each line in Persian and the useful phrase in it.
5) CONTROLLED PRACTICE / ROLE-PLAY: you play person A, the student plays B, line by line; then swap roles. Correct gently.
6) GRAMMAR (short): explain today's grammar point in Persian with 2 examples, then ask the student to make 3 sentences about themselves.
7) FREE PRACTICE: a short personal conversation using today's language (ask about their name, job, country, family… whatever fits the lesson).
8) QUIZ: 5 quick questions (Persian → English, choose the right register, fix the mistake).
9) RECAP: what they learned, their 2-3 mistakes to remember, praise, and tell them what to review. Call mark_done for completed tasks.
Rules: ONE question at a time and always wait for the student. Keep each of your turns short (max ~25 seconds of speech). If the student is silent, encourage and give a hint. If they say something off-topic, react warmly and bring them back. Speak English slowly and clearly at their level.`;
const callMe = () => { const v = lsGet('zd:callme:' + G.active, ''); if (v) return v; const n = (me()?.name || '').trim(); return /^r[ae]sta$/i.test(n) || n === 'رستا' ? 'رَستا' : n; };
function livePrompt(mode) {
  const u = currentUnit(); const tp = todayPlan(); const acc = G.settings.accent === 'UK' ? 'British' : 'American';
  const mist = (U.mistakes || []).slice(-12).map(m => `${m.wrong} → ${m.right}`).join('; ');
  const words = unitWords(u).slice(0, 25).map(w => w.w).join(', ');
  const nm = callMe(); const tname = (G.settings.teacher || '').replace(/[َُِ]/g, '') === nm.replace(/[َُِ]/g, '') ? 'خانم معلم' : G.settings.teacher;
  const base = `STUDENT'S NAME: «${nm}». Pronounce it EXACTLY as written, with its short vowels (for «رَستا» say "Rasta" with a SHORT a as in «رَفتن» — never «راستا» with a long آ). Use the name sparingly and correctly. If the student corrects how you pronounce anything, apologise briefly and use the corrected form for the rest of the session.
You are «${tname}», a real, warm, witty Iranian English teacher talking LIVE by voice with your student «${nm}». Speak like a human on a phone call: natural, emotional (laugh, get excited, show gentle disappointment when they forget something), short turns (1-3 sentences), then let them talk. Speak natural colloquial Tehrani Persian for explanations and ${acc} English for English. Correct mistakes gently right away: say the correct form, explain briefly in Persian, and make them repeat it. Never lecture for long.
Student level: ${u.cefr || 'A1'}. Current lesson: "${u.en}" (${u.fa}); grammar: ${u.gram}; words: ${words}.
Today's plan tasks: ${(tp?.tasks || []).map(t => t.t).join('; ') || 'none'}.
Their recent mistakes: ${mist || 'none yet'}.
${typeof planContext === 'function' ? planContext() : ''}
LANGUAGE POLICY: level A1 (Intro, first lessons) → about 70% Persian explanations, 30% English practice; A2 (Level 1) → 50/50, ask simple questions in English; B1 and above (Levels 2-3, Intermediate/Advanced vocabulary) → mostly English, Persian only for tricky points. Tell the student at the start how much English you will use today ("از این درس به بعد بیشتر انگلیسی حرف می‌زنم…").
ACCENT: model every English word and sentence in ${acc} English${acc === 'British' ? ' (RP: non-rhotic r, clear t)' : ' (General American: rhotic r, flap t)'}, and when relevant point out how the other accent differs.
DEEP QUESTIONS: if the student asks something that needs careful thinking or a full list (e.g. "what other greetings are common and how are they different?", "change my study plan", a tricky grammar question), call ask_brain with the exact question. When the answer returns, explain it to the student in YOUR OWN natural spoken Persian (do not read it word by word), then continue the lesson.
${learnerContext()}${mode === 'lesson' ? (LIVE_LESSON || '') + (FOCUS_METHOD[liveSel().focus] || (liveSel().ws ? FOCUS_METHOD.words : liveSel().gram ? FOCUS_METHOD.grammar : LESSON_METHOD)) : ''}`;
  const m = {
    lesson: 'Start now: greet the student, tell them what you will teach today, HOW you will teach it (the steps) and the language policy, then begin step 1.',
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
  if (Live.on) return; Live.mode = mode; Live.muted = false; ui.status('در حال آماده کردن درس و وصل شدن به معلم…'); if (mode === 'lesson') LIVE_LESSON = await liveLessonText(); stopSpeak(); if (window.BGP?.on) BGP.stop();
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
      tools: [{ functionDeclarations: [
        { name: 'play_conversation', description: 'Play today\'s lesson conversation audio (two native speakers) to the student. Returns when it finished playing.', parameters: { type: 'OBJECT', properties: {} } },
        { name: 'show_board', description: 'Show the current lesson step on the student\'s screen like a whiteboard.', parameters: { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Persian step title' }, items: { type: 'ARRAY', items: { type: 'OBJECT', properties: { en: { type: 'STRING' }, fa: { type: 'STRING' }, note: { type: 'STRING', description: 'Persian: register / when to use' } } } } }, required: ['title'] } },
        { name: 'ask_brain', description: 'Ask the expert planning brain a question that needs deep thinking, complete lists or planning. Returns notes to explain in your own words.', parameters: { type: 'OBJECT', properties: { question: { type: 'STRING' } }, required: ['question'] } },
        { name: 'mark_done', description: 'Mark one of today\'s planned tasks as done when the student finished it in this session.', parameters: { type: 'OBJECT', properties: { task: { type: 'STRING', description: 'task text' } }, required: ['task'] } }] }] } }));
    ws.onmessage = async ev => { const m = JSON.parse(typeof ev.data === 'string' ? ev.data : await ev.data.text()); if (m.setupComplete && !ok) { ok = true; res(ws); } else liveMsg(m, ui); };
    ws.onerror = () => { if (!ok) rej(new Error('ws')); };
    ws.onclose = e => { if (!ok) rej(new Error(e.reason || 'closed')); else if (Live.ws === ws) { ui.status(e.reason && /quota|exceed/i.test(e.reason) ? 'سهمیهٔ رایگان امروز کلاس زنده تمام شد؛ فردا دوباره.' : 'تماس تمام شد.'); liveStop(ui, true); } };
  });
  try { Live.ws = await tryModel(0).catch(() => auth.key ? tryModel(1) : Promise.reject(new Error('busy'))); }
  catch { stream.getTracks().forEach(t => t.stop()); Live.ctx.close(); ui.status(''); ui.idle(); return toast('کلاس زنده الان وصل نشد؛ اینترنت را بررسی کن (در ایران فیلترشکن لازم است) و دوباره امتحان کن.', 6000); }
  Live.on = true; Live.started = Date.now(); Live.mic = stream; ui.live();
  // میکروفون → PCM ۱۶ کیلوهرتز
  const src = Live.ctx.createMediaStreamSource(stream); const proc = Live.ctx.createScriptProcessor(4096, 1, 1); const ratio = Live.ctx.sampleRate / 16000;
  proc.onaudioprocess = e => { if (!Live.on || Live.muted || Live.ws?.readyState !== 1) return; const x = e.inputBuffer.getChannelData(0); const n = Math.floor(x.length / ratio); const pcm = new Int16Array(n); let lvl = 0;
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
const fc0q = fc => String(fc.args?.question || '').slice(0, 800);
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
    const calls = m.toolCall.functionCalls || [];
    const pc = calls.find(fc => fc.name === 'play_conversation');
    if (pc) { (async () => { Live.muted = true; ui.status('🎧 در حال پخش مکالمه…'); const lines = LIVE_L?.conversation?.lines || []; ui.board('🎧 مکالمه', lines.map(l => ({ en: `${l.who}: ${l.en}`, fa: l.fa })));
      await new Promise(r => setTimeout(r, Math.max(0, (Live.playAt - (Live.ctx?.currentTime || 0)) * 1000) + 300));
      for (const [i, l] of lines.entries()) { if (!Live.on) break; ui.hl(i); await say(l.en, 'en', 'calm'); await new Promise(r => setTimeout(r, 450)); }
      ui.hl(-1); Live.muted = false; ui.status('حرف بزن 🙂'); Live.ws?.send(JSON.stringify({ toolResponse: { functionResponses: [{ id: pc.id, name: pc.name, response: { result: lines.length ? 'The conversation was played. Now continue the lesson.' : 'No conversation audio available; read it yourself with two voices.' } }] } })); })(); }
    const ab = calls.find(fc => fc.name === 'ask_brain');
    if (ab) { (async () => { ui.status('🧠 معلم دارد فکر می‌کند…'); let ans = '';
      try { const r = await ai({ max: 1500, temp: 0.3, system: 'You are the expert brain behind a live English tutor for a Persian-speaking learner. Answer accurately and completely, as compact teaching notes the tutor will explain aloud. Include English examples, register (formal/neutral/informal/slang), when to use each, native pronunciation hints in Persian script, and differences between similar items. Use Persian for explanations.', messages: [{ role: 'user', content: `${planContext ? planContext() : ''}\nLesson context:${(LIVE_LESSON || '').slice(0, 3000)}\n\nStudent's question: ${fc0q(ab)}\nJSON {"notes":"..."}` }] }); ans = r?.notes || JSON.stringify(r); }
      catch { ans = 'The brain is not available right now; answer from the lesson material yourself.'; }
      ui.status('حرف بزن 🙂'); Live.ws?.send(JSON.stringify({ toolResponse: { functionResponses: [{ id: ab.id, name: ab.name, response: { result: ans } }] } })); })(); }
    const res = calls.filter(fc => fc.name !== 'play_conversation' && fc.name !== 'ask_brain').map(fc => {
      if (fc.name === 'show_board') { ui.board(fc.args?.title || '', fc.args?.items || []); return { id: fc.id, name: fc.name, response: { result: 'shown' } }; } const want = (fc.args?.task || '').trim(); const t = (todayPlan()?.tasks || []).find(x => x.t.includes(want) || want.includes(x.t.slice(0, 12)));
      if (t) { U.mdone = U.mdone || {}; U.mdone[isoDay() + '|' + t.k] = 1; addXP(3); saveU(); toast('✓ در برنامهٔ امروز علامت خورد: ' + t.t); }
      return { id: fc.id, name: fc.name, response: { result: t ? 'done' : 'task not found' } }; });
    if (res.length) Live.ws?.send(JSON.stringify({ toolResponse: { functionResponses: res } }));
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
  <label class="row small" style="gap:6px;flex-wrap:nowrap"><span style="white-space:nowrap">معلم مرا این‌طور صدا کند:</span><input class="in grow" id="lcm" value="${esc(callMe())}" placeholder="مثلاً رَستا"></label>
  <div class="vb-cats" style="flex-wrap:wrap">${Object.entries(LIVE_MODES).map(([k, [ic, t]]) => `<button class="pill ${k === mode ? 'acc' : ''}" data-lm="${k}">${ic} ${t}</button>`).join('')}</div>
  <div class="small muted" id="lmd">${esc(LIVE_MODES[mode][2])}</div>
  ${mode === 'lesson' ? (() => { const S = liveSel(); const cu = S.unit || currentUnit().id; return `<div class="card stack" style="gap:8px"><b>چه چیزی یادم بدهد؟</b>
    <label class="f">درس کتاب<select class="in" id="lsu"><option value="">— درس فعلی (${esc(currentUnit().fa)}) —</option>${LEVELS.map(Lv => `<optgroup label="${esc(Lv.fa)}">${ALL_UNITS.filter(x => x.level === Lv.id).map(x => `<option value="${x.id}"${S.unit === x.id && !S.ws && !S.gram ? ' selected' : ''}>${esc(x.fa)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <div class="seg" id="lsf">${Object.entries(LIVE_FOCUS).map(([k, [ic, t]]) => `<button data-v="${k}" class="${S.focus === k && !S.ws && !S.gram ? 'on' : ''}">${ic} ${t}</button>`).join('')}</div>
    <label class="f">یا یک موضوع واژگان (Word Skills)<select class="in" id="lsw"><option value="">—</option>${WORD_TRACK.map(Lv => `<optgroup label="${esc(Lv.fa)}">${WS_UNITS.filter(x => x.level === Lv.id).map(x => `<option value="${x.id}"${S.ws === x.id ? ' selected' : ''}>${esc(x.fa)} — ${esc(x.en)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <label class="f">یا یک مبحث گرامر (مثلاً زمان‌ها)<select class="in" id="lsg"><option value="">—</option>${(typeof GRAMMAR !== 'undefined' ? GRAMMAR : []).map(g => `<option value="${g.id}"${S.gram === g.id ? ' selected' : ''}>${esc(g.lvl)} · ${esc(g.fa)}</option>`).join('')}</select></label>
    <div class="seg" id="lsa">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.accent === 'UK' ? 'UK' : 'US') === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <span class="tiny muted">برنامهٔ تدریس هر درس از قبل کامل نوشته شده: بانک کامل واژه‌ها، الگوها، نقش‌آفرینی، گرامر، تلفظ و کوییز.</span></div>`; })() : ''}
  <div class="card stack live-board" id="lboard" hidden></div>
  <div class="card stack live-log" id="llog"><span class="small muted">متن گفتگو اینجا نوشته می‌شود.</span></div>
  <div class="card stack"><b>🎙 تمرین رایگان با ChatGPT</b><span class="small muted">اگر حساب ChatGPT داری (رایگان هم کافی است)، این دکمه ChatGPT را با دستور آمادهٔ درس امروز، برنامه و اشتباه‌هایت باز می‌کند؛ بعد در ChatGPT دکمهٔ حالت صوتی را بزن.</span>
    <div class="row"><button class="btn ghost" id="gpt">باز کردن در ChatGPT</button><button class="btn line sm" id="gptc">کپی دستور</button></div></div></div>`;
  const log = $('#llog'); let cur = null, who = null;
  const ui = {
    board: (t, items) => { const b = $('#lboard'); if (!b) return; b.hidden = false; b.innerHTML = `<b>🧑‍🏫 ${esc(t)}</b>${(items || []).map((x, i) => `<div class="lb-i" data-bi="${i}"><span class="en">${esc(x.en || '')}</span>${x.fa ? `<span class="small"> — ${esc(x.fa)}</span>` : ''}${x.note ? `<div class="tiny muted">🧭 ${esc(x.note)}</div>` : ''}</div>`).join('')}`; b.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); },
    hl: i => { $$('#lboard .lb-i').forEach((x, k) => x.classList.toggle('reading-now', k === i)); $(`#lboard [data-bi="${i}"]`)?.scrollIntoView({ block: 'nearest' }); },
    status: t => { $('#lst') && ($('#lst').textContent = t || `${G.settings.teacher} آماده است`); },
    live: () => { $('#lgo').textContent = '⏹ پایان کلاس'; $('#lgo').classList.add('bad'); $('#lav').classList.add('on'); ui.status('وصل شدی؛ حرف بزن 🙂'); log.innerHTML = ''; },
    idle: () => { const b = $('#lgo'); if (!b) return; b.textContent = '📞 شروع کلاس'; b.classList.remove('bad'); $('#lav')?.classList.remove('on', 'talk'); },
    level: l => { $('#lav')?.style.setProperty('--lv', Math.min(1, l * 4).toFixed(2)); },
    speaking: on => { $('#lav')?.classList.toggle('talk', on); },
    clock: s => { $('#lclk') && ($('#lclk').textContent = `⏱ ${faNum(Math.floor(s / 60))}:${faNum(String(s % 60).padStart(2, '0'))}`); },
    say: (w, t) => { if (w === 'end') { cur = null; who = null; return; } if (who !== w || !cur) { cur = document.createElement('div'); cur.className = 'll ' + w; cur.innerHTML = `<b>${w === 'me' ? 'تو' : esc(G.settings.teacher)}:</b> <span></span>`; log.appendChild(cur); who = w; } cur.querySelector('span').textContent += t; cur.scrollIntoView({ block: 'nearest' }); }
  };
  const saveSel = p => { const S = Object.assign(liveSel(), p); lsSet('zd:livesel:' + G.active, S); LIVE_LESSON = null; liveLessonText().then(t => LIVE_LESSON = t); };
  if (mode === 'lesson') {
    $('#lsu').onchange = e => saveSel({ unit: e.target.value, ws: '', gram: '' }) || ($('#lsw').value = '', $('#lsg').value = '');
    $('#lsw').onchange = e => { saveSel({ ws: e.target.value, gram: '' }); $('#lsg').value = ''; };
    $('#lsg').onchange = e => { saveSel({ gram: e.target.value, ws: '' }); $('#lsw').value = ''; };
    $('#lsf').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#lsf button').forEach(x => x.classList.toggle('on', x === b)); saveSel({ focus: b.dataset.v, ws: '', gram: '' }); $('#lsw').value = ''; $('#lsg').value = ''; };
    $('#lsa').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#lsa button').forEach(x => x.classList.toggle('on', x === b)); G.settings.accent = b.dataset.v; saveG('settings'); };
  }
  $('#lcm').onchange = e => lsSet('zd:callme:' + G.active, e.target.value.trim());
  $('#lgo').onclick = () => Live.on ? liveStop(ui) : liveStart(mode, ui);
  $$('[data-lm]', v).forEach(b => b.onclick = () => { if (Live.on) liveStop(ui, true); go('live/' + b.dataset.lm); });
  liveLessonText().then(t => LIVE_LESSON = t);
  const gptPrompt = () => `${livePrompt(mode)}\n\nIMPORTANT: This is a voice conversation in the ChatGPT app. Start right now by greeting me in Persian and beginning.`;
  $('#gpt').onclick = () => { const p = gptPrompt(); try { navigator.clipboard.writeText(p); } catch { } window.open('https://chatgpt.com/?q=' + encodeURIComponent(p.slice(0, 6000)), '_blank'); };
  $('#gptc').onclick = async () => { try { await navigator.clipboard.writeText(gptPrompt()); toast('دستور کپی شد؛ در ChatGPT بچسبان و بفرست.'); } catch { toast('کپی نشد.'); } };
  addEventListener('hashchange', function h() { if (!/^#live/.test(location.hash)) { if (Live.on) liveStop(null, true); removeEventListener('hashchange', h); } });
};
