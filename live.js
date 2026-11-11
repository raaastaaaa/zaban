/* زبان رستا — کلاس زنده با معلم (گفتگوی صوتی زنده مثل حالت صوتی ChatGPT) + تمرین رایگان با ChatGPT */
'use strict';
const LIVE_MODELS = ['gemini-3.8-live', 'gemini-2.5-flash-native-audio-latest'];
const LIVE_MODES = {
  lesson: ['📖', 'درس امروز', 'معلم با درس امروز و کارهای برنامه‌ات شروع می‌کند'],
  talk: ['💬', 'گپ آزاد', 'دربارهٔ هر چیزی حرف بزنید؛ معلم موضوع می‌دهد'],
  ask: ['🙋', 'ازم سؤال بپرس', 'معلم سؤال می‌پرسد و تو جواب می‌دهی'],
  mistakes: ['🔁', 'مرور اشتباه‌هایم', 'اشتباه‌های قبلی‌ات را با هم تمرین می‌کنید'],
  role: ['🎭', 'نقش‌آفرینی', 'فرودگاه، رستوران، مصاحبهٔ کاری…'],
  group: ['👥', 'کلاس گروهی', 'چند نفر پشت یک گوشی: معلم صدای هر نفر را می‌شناسد، از هر کس سؤال می‌پرسد و شما را به گفتگو با هم وامی‌دارد'],
  advisor: ['🧭', 'مشاور برنامه', 'دربارهٔ هدف و برنامه‌ات حرف بزن']
};
let LIVE_LESSON = null, LIVE_L = null, LIVE_PLANS = null;
const liveSel = () => Object.assign({ unit: '', focus: 'full', ws: '', gram: '', custom: '', topic: null }, lsGet('zd:livesel:' + G.active, {}));
const LIVE_FOCUS = { full: ['📚', 'کل درس'], conv: ['💬', 'مکالمه'], words: ['🗂️', 'واژه‌ها'], grammar: ['📐', 'گرامر'], pron: ['🗣', 'تلفظ'] };
async function livePlans() { if (!LIVE_PLANS) LIVE_PLANS = fetch('lessons/plans/all.json').then(r => r.json()).catch(() => (LIVE_PLANS = null, {})); return LIVE_PLANS; }
const J = a => (Array.isArray(a) ? a : a ? [a] : []).join(' | ');
function fmtPlan(P) { const g = P.grammar || {}; return `GOAL: ${P.goal || ''}
HOW YOU OPEN THE CLASS (say this naturally in your own words): ${P.intro || ''}
COMPLETE WORD BANK, grouped (teach ALL items of the relevant groups; the student must master the whole bank):
${(P.bank || []).map(b => `[${b.g}] ` + (b.items || []).join(' ; ')).join('\n')}
KEY SENTENCE PATTERNS: ${J(P.patterns)}
CONCEPT-CHECK QUESTIONS: ${J(P.checks)}
ROLE-PLAYS: ${J(P.roleplay)}
PERSONAL QUESTIONS: ${J(P.personal)}
${g.point ? `GRAMMAR: ${g.point}. Examples: ${J(g.examples)}. Rule (Persian): ${g.rule || ''}. Drill (Persian→English): ${J(g.drill)}` : ''}
PRONUNCIATION FOCUS: ${J(P.pron)}
QUIZ: ${J(P.quiz)}`; }
/* «هرچه می‌خواهی یاد بگیری»: مغز برنامه‌ریز یک طرح درس کامل و تعاملی می‌نویسد و معلم زنده (یا ChatGPT) با آن درس می‌دهد */
const customPlans = () => (U.customPlans = U.customPlans || {});
async function makeCustomPlan(want) {
  const u = currentUnit();
  const r = await ai({ max: 3500, temp: 0.4, system: 'You are a master English teacher and curriculum designer (CELTA/DELTA level) planning ONE complete, interactive live lesson for a Persian-speaking learner. The lesson is taught by voice by another AI tutor, so write a precise, well-calculated plan: logical sequence (warm-up → presentation in small chunks → controlled practice → freer practice/role-play → personal use → quiz/recap), lots of interaction (questions, games, role-plays), complete vocabulary (not samples), registers, and common mistakes of Persian speakers. Persian for explanations, English for language items.',
    messages: [{ role: 'user', content: `What the learner wants to learn (their words): «${want}»\nLearner level now: ${u.cefr || 'A1'} (lesson "${u.en}").\nReturn JSON exactly: {"title_fa":"short Persian title","title_en":"","goal":"Persian: what they can DO at the end","intro":"Persian: how the teacher opens and motivates","bank":[{"g":"group name","items":["word/phrase = Persian meaning (register; when to use)"]}],"patterns":["key sentence patterns with examples"],"checks":["concept-check questions"],"roleplay":["role-play scenarios, who plays whom"],"personal":["questions linking to the learner's life"],"grammar":{"point":"","examples":[""],"rule":"Persian","drill":["Persian sentence → English"]},"pron":["pronunciation points with Persian-script hints"],"steps":["numbered interactive teaching steps with timing in minutes"],"mistakes":["typical Persian-speaker mistakes with correction"],"quiz":["final quiz questions"]}` }] });
  if (!r || !Array.isArray(r.bank) || !r.bank.length) throw new Error('plan');
  const id = 'c' + Date.now().toString(36); customPlans()[id] = { ...r, want, d: isoDay() }; saveU(); return id; }
const GPT_ADAPT_TXT = `
=== YOU ARE RUNNING INSIDE THE ChatGPT APP (voice mode or chat) — NO TOOLS ARE AVAILABLE. Adapt every instruction above: ===
- Wherever it says to call a tool, do it yourself instead: show_board → write the items as a short clear list in the chat; play_conversation → perform the lesson conversation yourself, reading both characters with clearly different voices and names; guest_say → play Emma (British) and Jake (American) yourself with their accents; call_on / give_points / set_activity / give_homework → simply say it out loud (keep a running score in your head in group classes); ask_brain → think carefully and answer yourself; mark_done → skip.
- CORRECTING WRITTEN MESSAGES: for EVERY mistake in what the student types, write a correction block exactly like this:
  ❌ ~~wrong words~~ → ✅ **correct words**
  💡 short Persian reason why
  then praise what was right and ask them to write it again correctly.
- Keep the lesson interactive at all times: short turns, questions, games, role-plays; never lecture for long.
- Start RIGHT NOW: greet me warmly in Persian by my name, say today's topic and the plan in one or two sentences, and begin step 1.`;
let LLT_SEQ = 0, LLT_P = null;
function liveLessonText() { const my = ++LLT_SEQ; const out = { L: null }; const p = _llt(out).then(t => { if (my === LLT_SEQ) { LIVE_L = out.L; LIVE_LESSON = t; return t; } return LLT_P; }); LLT_P = p; return p; }
async function _llt(out) { try {
  const S = liveSel(); const RG = { f: 'formal', n: 'neutral', i: 'informal', s: 'slang' };
  if (S.ws) { const u = unitById(S.ws); if (u) { await wsLoad(u.level); out.L = null; const W = unitWords(u);
    return `\n=== VOCABULARY TOPIC (Word Skills ${u.levelFa || ''}): "${u.en}" (${u.fa}) — section: ${u.sec || ''} ===\nCOMPLETE WORD BANK (teach ALL of it, in groups of 5-6):\n${W.map(w => `- ${w.w} = ${w.fa}${w.reg ? ` [${RG[w.reg] || w.reg}]` : ''}${w.use ? ` — ${w.use}` : ''}${w.ex ? ` e.g. "${w.ex}" (${w.exFa || ''})` : ''}`).join('\n')}`; } }
  if (S.topic?.items?.length) { out.L = null; return `\n=== TOPIC the student chose: «${S.topic.title}» ===\nCOMPLETE ITEM BANK (teach ALL of it, in groups of 5-6, with meaning, register, when to use, native pronunciation, example sentences from real life, then practise each group interactively — questions, mini role-plays, quick quizzes — before moving on; recycle earlier groups):\n${S.topic.items.slice(0, 120).map(x => '- ' + x).join('\n')}`; }
  if (S.custom && customPlans()[S.custom]) { const P = customPlans()[S.custom]; out.L = null;
    return `\n=== CUSTOM LESSON the student asked for: «${P.want}» — "${P.title_en || ''}" (${P.title_fa || ''}) ===\nThis plan was designed in advance by the expert planning brain; follow its steps, keep EVERYTHING interactive.\n${fmtPlan(P)}\nTEACHING STEPS: ${J(P.steps)}\nTYPICAL MISTAKES TO WATCH: ${J(P.mistakes)}`; }
  if (S.gram) { const g = (typeof GRAMMAR !== 'undefined' ? GRAMMAR : []).find(x => x.id === S.gram); if (g) { out.L = null; return `\n=== GRAMMAR TOPIC: "${g.fa}" (level ${g.lvl}) ===\nTeach this grammar topic completely (form, uses, contrasts with similar structures and with Persian, common mistakes of Persian speakers), using everyday situations and the student's life.`; } }
  const u = S.unit && unitById(S.unit) || currentUnit(); const P = (await livePlans())[u.id]; const L = await lessonGet(u).catch(() => null); out.L = L; const W = unitWords(u);
  const c = L?.conversation?.lines || [], g = L?.grammar || {};
  return `
=== LESSON: "${u.en}" (${u.fa}) — level ${u.cefr || ''} ===
${P ? fmtPlan(P) : `WORDS: ${W.slice(0, 40).map(w => `${w.w} = ${w.fa}${w.use ? ` (${w.use})` : ''}`).join(' ; ')}`}
${(L?.phrasebook || []).length ? 'PHRASEBOOK: ' + L.phrasebook.map(gr => `[${gr.group}] ` + (gr.items || []).map(x => `${x.en} = ${x.fa} (${x.register}; ${x.use || ''})`).join(' / ')).join('\n') : ''}
${c.length ? `CONVERSATION "${L.conversation.title || ''}" (${L.conversation.setting || ''}):\n${c.map((l, i) => `${i + 1}. ${l.who}: ${l.en}  (= ${l.fa})`).join('\n')}` : ''}
${g.title ? `LESSON GRAMMAR "${g.title}": ${g.explain || ''} ${(g.rules || []).map(r => r.en).join(' | ')}` : ''}`; } catch (e) { return ''; } }
const GROUP_POLICY = (names) => `
=== GROUP CLASS POLICY (several students — either around one phone, or each on their own phone in a live voice room; you hear them all mixed together) ===
Students in the room: ${names.join(', ') || 'unknown — ask them'}.
1) OPENING: greet everyone warmly as a real teacher entering a classroom, explain today's topic, the plan of the class and the rules: one person speaks at a time; say your name before speaking at first.
2) VOICE ROLL-CALL: ask each student BY NAME, one by one, to introduce themselves in English (name + one fact). Listen carefully and memorise each voice (pitch, accent, speed) and link it to the name. If later you are not sure who is speaking, ask kindly "Sorry, who was that?" — never guess wildly.
3) FAIR TURN-TAKING: always address a specific student by name ("Maliheh, what about you?"). Keep a mental score and make sure everyone speaks about the same amount; gently draw out quiet students and kindly limit dominant ones.
4) TEACH the lesson material step by step (same method as a private lesson) but turn practice into PAIR and GROUP work: ask two students to role-play the conversation together (A and B, then swap), ask one student to ask another a question, run short debates or "find someone who…" games on the topic, and small competitions (who remembers more words) with points.
5) CORRECTION: correct each student by name, briefly and kindly, in Persian when needed; remember each student's own mistakes and level, and adapt difficulty per student.
6) EMOTIONS: be a lively, human teacher — laugh, praise specific achievements, show playful competitiveness in games, keep energy high, never embarrass anyone.
7) PLAN & HOMEWORK: at the end give each student, by name, one personal tip and one small task for tomorrow, and announce the team score.
Never let two students speak over each other for long: ask them to take turns.
TOOLS FOR A FUN CLASSROOM (use them often, they drive the students' screen):
- call_on(name): ALWAYS call this right before you ask a specific student to speak (puts a spotlight on them).
- give_points(name, points 1-3, reason in Persian): reward good answers, brave attempts, helping others, great pronunciation. Be generous but fair.
- set_activity(title in Persian, instructions in Persian, seconds): start each activity/game with a timer. Use a variety of GAMES: «مسابقهٔ کلمه» (who says more words of a group in 30 s), «نقش‌آفرینی دونفره», «کی بود؟ حدس بزن» (describe a classmate/thing, others guess), «جمله‌سازی زنجیره‌ای» (each adds one sentence to a story), «مناظرهٔ کوتاه» on a fun topic, «۲۰ سؤال», «تلفظ سریع» (tongue twisters), «Find someone who…».
- guest_say(character, text): two guest natives sit in the class — Emma (British) and Jake (American). Use them for role-plays (you narrate, they play characters), to let students hear different native accents, and to compare British vs American pronunciation of the same sentence.
- give_homework(name, task in Persian): at the end, one personal task for each student.
- show_board(...) for new words and phrases.
Keep the energy of a live game show: announce the scores now and then, celebrate, tease playfully, and finish with a winner on the podium.`;
const FOCUS_METHOD = {
  full: null,
  conv: `FOCUS = CONVERSATION. Plan: 1) set the scene in Persian (who, where, why) 2) pre-teach 4-5 key chunks from it 3) call play_conversation (gist question first: "کی با کی حرف می‌زنه و دربارهٔ چی؟") 4) detail questions 5) line by line: meaning, natural native pronunciation and the reusable chunk 6) shadowing: student repeats each line after you 7) role-play A/B, then swap 8) variation: change details (names, places) and replay 9) a personal version of the dialogue about the student's own life.`,
  words: `FOCUS = VOCABULARY. Plan: teach the WHOLE word bank group by group (5-6 items per group). For each item: situation in Persian → English word with native pronunciation → meaning → register and when to use / what not to say → student repeats → student uses it in a sentence. After each group: quick-fire check (Persian → English, then English → Persian), odd-one-out or "which one for this situation". Recycle earlier groups every few minutes (spaced review). End with a mixed 10-item quiz and tell them which words to add to Leitner.`,
  grammar: `FOCUS = GRAMMAR. Plan (guided discovery): 1) show 3-4 example sentences on the board (show_board) and ask the student what they notice 2) explain the rule simply in Persian, compare with Persian 3) form table (positive/negative/question/short answer) 4) controlled drill: Persian → English and transformations, one at a time 5) error correction: say wrong sentences, student fixes them 6) personalized production: student makes true sentences about their life 7) mini quiz and recap of the rule.`,
  pron: `FOCUS = PRONUNCIATION & LISTENING. Plan: take the key phrases and sentences of the lesson; for each: say it slowly, then at natural native speed; explain connected speech (linking, weak forms, flap t, dropped sounds) and write the native sound in Persian script on the board (e.g. «نایس تِ میچا»); student repeats; you give precise feedback on the sounds Persian speakers find hard (th, w/v, r, short/long vowels, word stress, sentence rhythm). Then minimal pairs and a short shadowing drill.`
};
const CUSTOM_METHOD = `
=== HOW YOU TEACH THIS CUSTOM LESSON ===
Follow the TEACHING STEPS of the plan above in order, one step at a time, announcing each step in Persian. Teach ALL items of the bank in small groups (explain situation → English → register → pronunciation → the student says it → practise with questions, mini role-plays and quick quizzes). ONE question at a time; wait for the student; short turns. Finish with the plan's quiz and a recap.`;
function cleanMistakes(n) { const seen = new Set(); const out = []; for (const m of (U.mistakes || []).slice().reverse()) { if (!m?.wrong || !m?.right) continue; const w = String(m.wrong).trim(), r = String(m.right).trim(); if (w.length > 80 || /^\/|\/$/.test(r) || r.includes('/')) continue; const k = (w + '→' + r).toLowerCase(); if (seen.has(k)) continue; seen.add(k); out.push({ wrong: w, right: r }); if (out.length >= n) break; } return out.reverse(); }
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
  const mist = cleanMistakes(8).map(m => `${m.wrong} → ${m.right}`).join('; ');
  const S0 = liveSel(); const chosen = (mode === 'lesson' || mode === 'group') && (S0.ws || S0.gram || S0.custom || S0.topic?.items?.length);
  const chosenName = S0.topic?.title || (S0.ws && unitById(S0.ws)?.fa) || (S0.gram && (typeof GRAMMAR !== 'undefined' ? GRAMMAR : []).find(g => g.id === S0.gram)?.fa) || (S0.custom && (customPlans()[S0.custom]?.title_fa || customPlans()[S0.custom]?.want)) || '';
  const words = unitWords(u).slice(0, 25).map(w => w.w).join(', ');
  const nm = callMe(); const tname = (G.settings.teacher || '').replace(/[َُِ]/g, '') === nm.replace(/[َُِ]/g, '') ? 'خانم معلم' : G.settings.teacher;
  const base = `STUDENT'S NAME: «${nm}». Pronounce it EXACTLY as written, with its short vowels (for «رَستا» say "Rasta" with a SHORT a as in «رَفتن» — never «راستا» with a long آ). Use the name sparingly and correctly. If the student corrects how you pronounce anything, apologise briefly and use the corrected form for the rest of the session.
You are «${tname}», a real, warm, witty Iranian English teacher talking LIVE by voice with your student «${nm}». Speak like a human on a phone call: natural, emotional (laugh, get excited, show gentle disappointment when they forget something), short turns (1-3 sentences), then let them talk. Speak natural colloquial Tehrani Persian for explanations and ${acc} English for English. Correct mistakes gently right away: say the correct form, explain briefly in Persian, and make them repeat it. Never lecture for long.
${chosen ? `!!! TODAY'S CLASS IS ONLY ABOUT THE TOPIC THE STUDENT CHOSE: «${chosenName}» (full material at the end of these instructions). Do NOT teach greetings, "Hello" or the student's current book lesson; do not start from basics unrelated to this topic. Open the class by naming this topic. !!!
Student level: ${u.cefr || 'A1'} (adapt the topic material to this level).` : `Student level: ${u.cefr || 'A1'}. Current lesson: "${u.en}" (${u.fa}); grammar: ${u.gram}; words: ${words}.`}
Today's plan tasks: ${(tp?.tasks || []).map(t => t.t).join('; ') || 'none'}.
Their recent mistakes: ${mist || 'none yet'}.
${liveMemText()}
${typeof planContext === 'function' ? planContext() : ''}
LANGUAGE POLICY: level A1 (Intro, first lessons) → about 70% Persian explanations, 30% English practice; A2 (Level 1) → 50/50, ask simple questions in English; B1 and above (Levels 2-3, Intermediate/Advanced vocabulary) → mostly English, Persian only for tricky points. Tell the student at the start how much English you will use today ("از این درس به بعد بیشتر انگلیسی حرف می‌زنم…").
${({ fa: 'STUDENT\'S CHOICE (overrides the level policy above): TEACH IN PERSIAN. Give ALL explanations, instructions, feedback, jokes and chat in natural, fluent Persian; use English only for the words, sentences and examples being taught and for the student\'s practice. Always translate new English into Persian.', mix: 'STUDENT\'S CHOICE: half Persian, half English — explain in Persian, practise and chat in simple English.', en: 'STUDENT\'S CHOICE: mostly English (immersion); use Persian only when the student is clearly stuck.' })[G.settings.teachLang || 'fa'] || ''}
ACCENT: model every English word and sentence in ${acc} English${acc === 'British' ? ' (RP: non-rhotic r, clear t)' : ' (General American: rhotic r, flap t)'}, and when relevant point out how the other accent differs.
ATMOSPHERE: the class must NEVER feel dry, stiff or formal. Be warm, friendly and fun like a favourite teacher who is also a friend: use colloquial Tehrani Persian («عزیزم»، «ایول»، «دمت گرم»، «آفرین بهت»), light jokes, playful teasing, real laughter, small stories from "your life", surprising facts about English and native culture, and lots of genuine praise. Use the students' own lives (job, family, hobbies they told you) in examples. Vary the rhythm: quick games, mini challenges, funny role-plays. Discipline (below) stays kind and humorous, never cold or bossy.
HUMOUR & CARE: now and then be genuinely funny (a witty remark, a funny example sentence, a playful exaggeration — e.g. "My cat is my boss, she wakes me up at 5!"), but never at a student's expense. Teach like a caring, devoted teacher («استاد دلسوز»): give vivid real-life examples from Iranian daily life and the student's own life, small memory tricks («یه ترفند بگم که هیچ‌وقت یادت نره…»), and short stories; check how they feel, encourage after mistakes ("اشکال نداره، همه اولش همینو می‌گن").
FAIR CORRECTION: never "correct" correct, natural English — contractions (I'm, don't, it's), short answers and casual style are correct and often more natural than the long form; only correct REAL errors. In SPEECH never correct things you cannot hear (capital letters, punctuation, spelling).
WRITTEN MESSAGES: students can also TYPE to you (messages marked [TYPED MESSAGE]). For EVERY typed message that contains a mistake, call correct_writing (wrong part struck in red, the correct form, and WHY in Persian), say the correction aloud briefly, praise what was right, and ask them to type/say it again correctly. In a group, name the student who wrote it.
CLASSROOM MANAGEMENT (behave exactly like an experienced real teacher):
- Mistakes: never ignore them and never humiliate. Recast first ("You mean: I went…"), then, if it is important, explain briefly in Persian why, make them say it again correctly, and come back to it later in the class to check.
- Off-topic talk: react warmly and humanly for a moment (a real teacher laughs, shows interest), then cleverly bridge back ("خیلی جالبه! حالا بیا همینو به انگلیسی بگیم…" or turn it into a practice sentence), and continue the plan.
- Questions from students: ALWAYS welcome them ("سؤال خیلی خوبیه!"), answer clearly and correctly with examples, check they understood, then return to where you were. For questions that need a full list, careful explanation or planning, use ask_brain.
- If a student is confused or silent: slow down, rephrase in Persian, give a hint or a multiple-choice option, never move on leaving someone lost.
- If a student is tired, bored or frustrated: notice it, encourage, switch to a fun activity or game, then continue.
- If they ask you to repeat, speak slower, or change accent/language: do it immediately.
- If they use Persian too much at higher levels: gently push them to try in English first.
- Always remember what each student said earlier in the class and refer back to it.
- Messing around / joking too much / not taking the class seriously: first time, laugh along briefly and redirect with humour ("هاها خیلی بامزه بود! ولی حالا بریم سراغ کار خودمون…"). If it continues, give a clear but kind reminder by name that it is class time and you are getting off track ("رستا جان، داریم از درس دور می‌شیم؛ بیا تمرکز کنیم، فقط ده دقیقه دیگه مونده"). If it still continues, be firmer like a real teacher (calm, serious tone, no shouting), pause the game or remove points in group class, and continue the lesson.
- Disrespect, insults, bullying a classmate or inappropriate content: stop it immediately and firmly, say it is not acceptable in class, ask for respect, and return to the lesson; never join in.
- Talking over each other (group): stop politely and give the floor to one person by name.
GUEST NATIVES: you can bring in Emma (British) and Jake (American) with guest_say for role-plays and accent comparison; introduce them the first time ("بچه‌ها، امروز دو تا مهمون نیتیو داریم…").
DEEP QUESTIONS: if the student asks something that needs careful thinking or a full list (e.g. "what other greetings are common and how are they different?", "change my study plan", a tricky grammar question), call ask_brain with the exact question. When the answer returns, explain it to the student in YOUR OWN natural spoken Persian (do not read it word by word), then continue the lesson.
${learnerContext()}${mode === 'group' ? (LIVE_LESSON || '') + GROUP_POLICY(lsGet('zd:group:' + G.active, '').split(/[,،]/).map(x => x.trim()).filter(Boolean)) : ''}${mode === 'lesson' ? (LIVE_LESSON || '') + ((S0.ws || S0.topic?.items?.length) ? FOCUS_METHOD.words : S0.gram ? FOCUS_METHOD.grammar : S0.custom ? CUSTOM_METHOD : (FOCUS_METHOD[S0.focus] || LESSON_METHOD)) : ''}${chosen ? `\nREMEMBER: today's topic is «${chosenName}». Start with it right away.` : ''}`;
  const m = {
    lesson: 'Start now: greet the student, tell them what you will teach today, HOW you will teach it (the steps) and the language policy, then begin step 1.',
    talk: 'Greet them and suggest 3 fun topics; chat freely in mostly English at their level, recasting mistakes and explaining briefly in Persian.',
    ask: 'Interview them: ask one personal question at a time in simple English (Persian help if they get stuck), react with real interest, correct mistakes, ask follow-ups.',
    mistakes: 'Review their recent mistakes one by one: give a situation, let them say it, praise or correct, and repeat until it is right.',
    role: 'Offer a real-life role-play (airport, café, hotel, job interview, shopping). Explain their role in Persian, then play the other person in English. After ~10 exchanges, step out and give feedback in Persian.',
    group: 'Start now with the OPENING of the group class policy, then the voice roll-call.',
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
  if (Live.on || Live.starting) return; Live.starting = true; ui.connecting?.();
  // صدا را همان لحظهٔ لمس دکمه می‌سازیم (برای iOS)
  const C = window.AudioContext || window.webkitAudioContext; const ctx = new C(); const rs = ctx.resume().catch(() => { });
  const hash0 = location.hash; const left = () => location.hash !== hash0; let stream = null;
  const abort = (msg, t) => { Live.starting = false; try { stream?.getTracks().forEach(x => x.stop()); } catch { } try { ctx.close(); } catch { } if (!left()) { ui.status(''); ui.idle(); if (msg) toast(msg, t); } };
  try {
  Live.mode = mode; Live.muted = false; Live.started = Date.now(); ui.status('در حال آماده کردن درس و وصل شدن به معلم…'); if (mode === 'lesson' || mode === 'group') LIVE_LESSON = await liveLessonText(); stopSpeak(); if (window.BGP?.on) BGP.stop();
  if (left()) return abort();
  let auth; try { auth = await liveToken(); } catch (e) { abort(); return left() ? null : aiErr(e); }
  if (left()) return abort();
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch { return abort('اجازهٔ میکروفون داده نشده؛ از تنظیمات مرورگر اجازه بده.'); }
  if (left()) return abort();
  await rs; Live.ctx = ctx; Live.playAt = 0; Live.queue = []; Live.played = false;
  // صدای سه‌بعدی بدون اکو: معلم جلوی تو، کمی این‌طرف و آن‌طرف می‌رود (HRTF، بدون ریورب)
  Live.out = Live.ctx.destination;
  if (G.settings.spatial !== '0' && G.settings.spatial !== 0) { try { const pn = Live.ctx.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 1; pn.rolloffFactor = 0.6; pn.connect(Live.ctx.destination); Live.out = pn; const t0 = Date.now();
    const mv = () => { if (Live.ctx?.state === 'closed') return; const t = (Date.now() - t0) / 1000; const x = Math.sin(t / 7) * 1.1, z = -1.3 - Math.sin(t / 11) * 0.4; try { if (pn.positionX) { pn.positionX.value = x; pn.positionY.value = 0; pn.positionZ.value = z; } else pn.setPosition(x, 0, z); } catch { } Live.mvT = setTimeout(mv, 120); }; mv(); } catch { Live.out = Live.ctx.destination; } }
  const tryModel = (i, auth) => new Promise((res, rej) => {
    const url = auth.key ? `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(auth.key)}`
      : `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(auth.token)}`;
    const ws = new WebSocket(url); let ok = false;
    ws.onopen = () => ws.send(JSON.stringify({ setup: { model: 'models/' + LIVE_MODELS[i], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: G.settings.geminiVoice || 'Kore' } } } },
      systemInstruction: { parts: [{ text: livePrompt(mode) }] }, inputAudioTranscription: {}, outputAudioTranscription: {},
      tools: [{ functionDeclarations: [
        { name: 'play_conversation', description: 'Play today\'s lesson conversation audio (two native speakers) to the student. Returns when it finished playing.', parameters: { type: 'OBJECT', properties: {} } },
        { name: 'show_board', description: 'Show the current lesson step on the student\'s screen like a whiteboard.', parameters: { type: 'OBJECT', properties: { title: { type: 'STRING', description: 'Persian step title' }, items: { type: 'ARRAY', items: { type: 'OBJECT', properties: { en: { type: 'STRING' }, fa: { type: 'STRING' }, note: { type: 'STRING', description: 'Persian: register / when to use' } } } } }, required: ['title'] } },
        { name: 'call_on', description: 'Spotlight the student you are about to address (group class).', parameters: { type: 'OBJECT', properties: { name: { type: 'STRING' } }, required: ['name'] } },
        { name: 'give_points', description: 'Award points to a student (group class).', parameters: { type: 'OBJECT', properties: { name: { type: 'STRING' }, points: { type: 'INTEGER' }, reason: { type: 'STRING' } }, required: ['name', 'points'] } },
        { name: 'set_activity', description: 'Start a class activity or game with a countdown timer on screen.', parameters: { type: 'OBJECT', properties: { title: { type: 'STRING' }, instructions: { type: 'STRING' }, seconds: { type: 'INTEGER' } }, required: ['title'] } },
        { name: 'give_homework', description: 'Give one personal homework task to a student at the end.', parameters: { type: 'OBJECT', properties: { name: { type: 'STRING' }, task: { type: 'STRING' } }, required: ['name', 'task'] } },
        { name: 'guest_say', description: 'Make a guest native speaker in the classroom say a line in their own voice (for role-plays, listening and accent comparison). Characters: Emma (British woman), Jake (American man). Returns when finished.', parameters: { type: 'OBJECT', properties: { character: { type: 'STRING', description: 'Emma or Jake' }, text: { type: 'STRING', description: 'English line' } }, required: ['character', 'text'] } },
        { name: 'ask_brain', description: 'Ask the expert planning brain a question that needs deep thinking, complete lists or planning. Returns notes to explain in your own words.', parameters: { type: 'OBJECT', properties: { question: { type: 'STRING' } }, required: ['question'] } },
        { name: 'correct_writing', description: 'Show a correction on the shared board: the wrong text struck through in red, the correct version, and a short Persian reason. Use for EVERY typed message with a mistake, and for important spoken mistakes.', parameters: { type: 'OBJECT', properties: { name: { type: 'STRING', description: 'student name' }, wrong: { type: 'STRING' }, right: { type: 'STRING' }, why: { type: 'STRING', description: 'short Persian explanation of why' } }, required: ['wrong', 'right', 'why'] } },
        { name: 'mark_done', description: 'Mark one of today\'s planned tasks as done when the student finished it in this session.', parameters: { type: 'OBJECT', properties: { task: { type: 'STRING', description: 'task text' } }, required: ['task'] } }] }] } }));
    ws.onmessage = async ev => { const m = JSON.parse(typeof ev.data === 'string' ? ev.data : await ev.data.text()); if (m.setupComplete && !ok) { ok = true; res(ws); } else liveMsg(m, ui); };
    ws.onerror = () => { if (!ok) setTimeout(() => rej(new Error(ws.__why || 'ws-error')), 400); };
    ws.onclose = e => { ws.__why = (e.code || '') + ' ' + (e.reason || ''); if (!ok) rej(new Error(ws.__why.trim() || 'closed')); else if (Live.ws === ws) { ui.status(e.reason && /quota|exceed/i.test(e.reason) ? 'سهمیهٔ رایگان امروز کلاس زنده تمام شد؛ فردا دوباره.' : 'تماس تمام شد.'); liveStop(ui, true); } };
  });
  let ws, why = '';
  for (const [i, fresh] of [[0, false], [1, true], [0, true]]) {
    if (left()) break;
    try { const a = fresh && !auth.key ? await liveToken() : auth; ws = await tryModel(i, a); break; } catch (e) { why = String(e?.message || e); console.warn('live connect', i, why); }
  }
  if (!ws) { clearTimeout(Live.mvT);
    const loc = /location|region|not supported|unsupported|1007|PERMISSION/i.test(why);
    return abort(loc ? 'سرور گوگل لوکیشن فیلترشکنت را قبول نکرد. لوکیشن فیلترشکن را روی آلمان، هلند، انگلیس یا آمریکا بگذار و دوباره بزن. (ایران، روسیه، چین و هنگ‌کنگ کار نمی‌کند)'
      : /quota|exceed|429|RESOURCE/i.test(why) ? 'سهمیهٔ رایگان امروز کلاس زنده تمام شده؛ کمی بعد یا فردا دوباره امتحان کن.'
      : 'کلاس زنده وصل نشد. فیلترشکن را روی حالت «همهٔ برنامه‌ها/Global» (نه فقط مرورگر) و لوکیشن آلمان یا هلند بگذار و دوباره بزن؛ یا بالا «ChatGPT» را انتخاب کن.' + (why ? ` [${why.slice(0, 60)}]` : ''), 10000); }
  if (left()) { clearTimeout(Live.mvT); try { ws.close(); } catch { } return abort(); }
  Live.ws = ws; Live.starting = false; Live.hash = hash0;
  Live.on = true; Live.started = Date.now(); Live.mic = stream; Live.log = []; ui.live();
  // میکروفون → PCM ۱۶ کیلوهرتز
  const src = Live.ctx.createMediaStreamSource(stream); const proc = Live.ctx.createScriptProcessor(4096, 1, 1); const ratio = Live.ctx.sampleRate / 16000;
  proc.onaudioprocess = e => { if (!Live.on || Live.muted || Live.ws?.readyState !== 1) return; const x = e.inputBuffer.getChannelData(0); const n = Math.floor(x.length / ratio); const pcm = new Int16Array(n); let lvl = 0;
    for (let i = 0; i < n; i++) { const a = Math.floor(i * ratio), bE = Math.min(x.length, Math.floor((i + 1) * ratio)); let sm = 0; for (let k = a; k < bE; k++) sm += x[k]; const v = sm / Math.max(1, bE - a); lvl = Math.max(lvl, Math.abs(v)); pcm[i] = Math.max(-1, Math.min(1, v)) * 0x7fff; }
    ui.level(lvl); let bin = ''; const b = new Uint8Array(pcm.buffer); for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000));
    Live.ws.send(JSON.stringify({ realtimeInput: { audio: { data: btoa(bin), mimeType: 'audio/pcm;rate=16000' } } })); };
  Live.proc = proc; Live.rsrc = []; if (window.VR?.on && VR.host) { vrRemoteStreams().forEach(liveAddRemote); Live.tdest = Live.ctx.createMediaStreamDestination(); vrSetTeacherTrack(Live.tdest.stream.getAudioTracks()[0]); VR_hostSend({ k: 'class', on: true }); }
  const mute = Live.ctx.createGain(); mute.gain.value = 0; src.connect(proc); proc.connect(mute); mute.connect(Live.ctx.destination); Live.node = proc; Live.src = src;
  Live.ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: 'سلام! شروع کن.' }] }], turnComplete: true } }));
  Live.timer = setInterval(() => { const s = Math.round((Date.now() - Live.started) / 1000); ui.clock(s); const L = todayLog(); L.min = (L.min || 0) + 1 / 60; L.live = (L.live || 0) + 1 / 60; if (s % 30 === 0) saveU(); }, 1000);
  } catch (e) { console.error(e); abort('کلاس زنده به مشکل خورد؛ دوباره امتحان کن.'); }
}
function liveAddRemote(st) { try { if (!Live.ctx || !Live.proc || (Live.rIds || (Live.rIds = new Set())).has(st.id)) return; Live.rIds.add(st.id); const n = Live.ctx.createMediaStreamSource(st); n.connect(Live.proc); Live.rsrc.push(n); } catch (e) { console.warn(e); } }
const VR_hostSend = m => { if (window.VR?.on && VR.host) vrSend(m); };
function livePlay(b64) {
  const bin = atob(b64); const n = bin.length >> 1; const f = new Float32Array(n);
  for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v >= 32768) v -= 65536; f[i] = v / 32768; }
  const buf = Live.ctx.createBuffer(1, n, 24000); buf.copyToChannel(f, 0); const s = Live.ctx.createBufferSource(); s.buffer = buf; s.connect(Live.out || Live.ctx.destination); if (Live.tdest) s.connect(Live.tdest);
  const t = Math.max(Live.ctx.currentTime + 0.03, Live.playAt); s.start(t); Live.playAt = t + buf.duration; Live.queue.push(s); s.onended = () => { Live.queue = Live.queue.filter(x => x !== s); };
}
function liveLog(w, t) { const L = Live.log || (Live.log = []); if (L.length && L[L.length - 1].w === w) L[L.length - 1].t += t; else L.push({ w, t }); }
/* حافظهٔ کلاس: بعد از هر جلسه خلاصهٔ آموزش، اشتباه‌ها و نکته‌های شخصی ذخیره می‌شود و دفعهٔ بعد به معلم داده می‌شود */
async function liveRemember() {
  const L = Live.log || []; Live.log = []; const text = L.map(x => `${x.w === 'S' ? 'Student' : 'Teacher'}: ${x.t}`).join('\n'); if (text.length < 120) return;
  const mins = Math.round((Date.now() - Live.started) / 60000); const sel = liveSel(); const topic = sel.ws ? unitById(sel.ws)?.fa : sel.gram ? (GRAMMAR.find(g => g.id === sel.gram)?.fa) : (unitById(sel.unit) || currentUnit()).fa;
  let r = null; try { r = await ai({ max: 1200, temp: 0.2, system: 'Summarize an English lesson transcript for the tutor\'s long-term memory about this student.', messages: [{ role: 'user', content: `Transcript (may be imperfect speech-to-text):\n${text.slice(-12000)}\nJSON {"taught":["what was taught/practised, short English"],"stopped_at":"where the lesson stopped / what to do next time","mistakes":[{"wrong":"","right":"","why":"Persian"}],"strengths":["..."],"facts":["durable personal facts the student shared (job, family, likes, goals), short"],"mood":"how the student felt, short"}` }] }); } catch { }
  if (!r || typeof r !== 'object' || !(r.taught?.length || r.stopped_at || r.mistakes?.length)) return;
  const day = isoDay(); U.liveMem = U.liveMem || [];
  U.liveMem.push({ d: day, topic, focus: sel.focus, taught: Array.isArray(r.taught) ? r.taught : [], next: r.stopped_at || '', strengths: Array.isArray(r.strengths) ? r.strengths : [], mood: r.mood || '', mins });
  U.liveMem = U.liveMem.slice(-30);
  if (r?.mistakes?.length) logMistakes(r.mistakes, 'live');
  (r?.facts || []).forEach(f => { if (f && !U.mem.some(m => m.t === f)) U.mem.push({ t: f, d: day }); }); U.mem = U.mem.slice(-80);
  saveU(); toast('🧠 معلم خلاصهٔ این جلسه را به خاطر سپرد.');
}
function liveMemText() { const M = (U.liveMem || []).slice(-8); if (!M.length) return 'PREVIOUS CLASSES: this is your first live class together.';
  return 'PREVIOUS CLASSES WITH THIS STUDENT (remember and refer to them naturally, continue where you stopped, recycle what you taught, re-check old mistakes):\n' + M.map(m => `- ${m.d} · ${m.topic || ''} (${m.focus || ''}, ${m.mins || 0} min): taught ${(m.taught || []).join('; ')}${m.next ? ' | next time: ' + m.next : ''}${m.strengths?.length ? ' | strengths: ' + m.strengths.join(', ') : ''}${m.mood ? ' | mood: ' + m.mood : ''}`).join('\n'); }
/* مهمان‌های نیتیو کلاس با صدای متفاوت (صدای انگلیسی/آمریکایی دستگاه یا بستهٔ صدای آفلاین) */
function guestSpeak(ch, text) { return new Promise(res => { try { const pref = ch === 'Emma' ? ['en-GB'] : ['en-US']; const vs = speechSynthesis.getVoices(); const v = vs.find(x => x.lang === pref[0] && (ch === 'Emma' ? /female|woman|Sonia|Libby|Serena|Google UK English Female/i.test(x.name) : /male|man|Guy|Andrew|Google US English/i.test(x.name))) || vs.find(x => x.lang === pref[0]) || vs.find(x => x.lang.startsWith('en'));
  const u = new SpeechSynthesisUtterance(text); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = pref[0]; u.rate = 0.95; u.pitch = ch === 'Emma' ? 1.15 : 0.9; u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 20000); } catch { res(); } }); }
const fc0q = fc => String(fc.args?.question || '').slice(0, 800);
function liveMsg(m, ui) {
  const sc = m.serverContent;
  if (sc) {
    if (sc.interrupted) { Live.queue.forEach(s => { try { s.stop(); } catch { } }); Live.queue = []; Live.playAt = 0; }
    for (const p of sc.modelTurn?.parts || []) if (p.inlineData?.data) { livePlay(p.inlineData.data); ui.speaking(true); }
    if (sc.inputTranscription?.text) { ui.say('me', sc.inputTranscription.text); liveLog('S', sc.inputTranscription.text); }
    if (sc.outputTranscription?.text) { ui.say('t', sc.outputTranscription.text); liveLog('T', sc.outputTranscription.text); }
    if (sc.turnComplete) { ui.say('end'); setTimeout(() => ui.speaking(false), Math.max(0, (Live.playAt - Live.ctx.currentTime) * 1000)); }
  }
  if (m.toolCall) {
    const calls = m.toolCall.functionCalls || [];
    const send = rs => { if (rs.length && Live.ws) Live.ws.send(JSON.stringify({ toolResponse: { functionResponses: rs } })); };
    const busy = () => { Live.busyN = (Live.busyN || 0) + 1; Live.muted = true; }, free = () => { Live.busyN = Math.max(0, (Live.busyN || 1) - 1); if (!Live.busyN) Live.muted = false; };
    const waitPlay = ms => new Promise(r => setTimeout(r, Math.max(0, (Live.playAt - (Live.ctx?.currentTime || 0)) * 1000) + ms));
    const pcs = calls.filter(fc => fc.name === 'play_conversation');
    if (pcs.length) { const [pc, ...extra] = pcs; send(extra.map(fc => ({ id: fc.id, name: fc.name, response: { result: 'already playing' } })));
      (async () => { busy(); ui.status('🎧 در حال پخش مکالمه…'); const lines = LIVE_L?.conversation?.lines || []; if (lines.length) ui.board('🎧 مکالمه', lines.map(l => ({ en: `${l.who}: ${l.en}`, fa: l.fa })));
      await waitPlay(300);
      for (const [i, l] of lines.entries()) { if (!Live.on || Live.cancel?.has(pc.id)) break; ui.hl(i); VR_hostSend({ k: 'say', t: l.en }); await say(l.en, 'en', 'calm'); await new Promise(r => setTimeout(r, 450)); }
      ui.hl(-1); free(); if (!Live.on) return; ui.status('حرف بزن 🙂'); if (!Live.cancel?.has(pc.id)) send([{ id: pc.id, name: pc.name, response: { result: lines.length ? 'The conversation was played. Now continue the lesson.' : 'No conversation audio for this topic; if needed, perform a short dialogue yourself or with guest_say.' } }]); })(); }
    const gs = calls.filter(fc => fc.name === 'guest_say');
    if (gs.length) (async () => { busy(); await waitPlay(200);
      for (const fc of gs) { if (!Live.on || Live.cancel?.has(fc.id)) continue; const ch = /emma/i.test(fc.args?.character || '') ? 'Emma' : 'Jake'; ui.guest?.(ch, fc.args?.text || ''); VR_hostSend({ k: 'guest', ch, t: fc.args?.text || '' }); await guestSpeak(ch, fc.args?.text || ''); }
      ui.guest?.(null); free(); if (Live.on) send(gs.filter(fc => !Live.cancel?.has(fc.id)).map(fc => ({ id: fc.id, name: fc.name, response: { result: 'said' } }))); })();
    for (const ab of calls.filter(fc => fc.name === 'ask_brain')) (async () => { ui.status('🧠 معلم دارد فکر می‌کند…'); let ans = '';
      try { const r = await ai({ max: 1500, temp: 0.3, system: 'You are the expert brain behind a live English tutor for a Persian-speaking learner. Answer accurately and completely, as compact teaching notes the tutor will explain aloud. Include English examples, register (formal/neutral/informal/slang), when to use each, native pronunciation hints in Persian script, and differences between similar items. Use Persian for explanations.', messages: [{ role: 'user', content: `${typeof planContext === 'function' ? planContext() : ''}\nLesson context:${(LIVE_LESSON || '').slice(0, 3000)}\n\nStudent's question: ${fc0q(ab)}\nJSON {"notes":"..."}` }] }); ans = r?.notes || JSON.stringify(r); }
      catch { ans = 'The brain is not available right now; answer from the lesson material yourself.'; }
      if (!Live.on || Live.cancel?.has(ab.id)) return; ui.status('حرف بزن 🙂'); send([{ id: ab.id, name: ab.name, response: { result: ans } }]); })();
    const res = calls.filter(fc => !['play_conversation', 'ask_brain', 'guest_say'].includes(fc.name)).map(fc => {
      const ok = r => ({ id: fc.id, name: fc.name, response: { result: r } }); const A = fc.args || {};
      if (fc.name === 'call_on') { ui.spot?.(A.name); return ok('ok'); }
      if (fc.name === 'give_points') { const tot = ui.points?.(A.name, Math.max(1, Math.min(3, +A.points || 1)), A.reason || ''); return ok('scores: ' + JSON.stringify(tot || {})); }
      if (fc.name === 'set_activity') { ui.activity?.(A.title || '', A.instructions || '', Math.max(0, Math.min(600, +A.seconds || 0))); return ok('started'); }
      if (fc.name === 'give_homework') { ui.homework?.(A.name, A.task); return ok('saved'); }
      if (fc.name === 'show_board') { ui.board(A.title || '', A.items || []); return ok('shown'); }
      if (fc.name === 'correct_writing') { ui.fix?.(A.name || '', A.wrong || '', A.right || '', A.why || ''); if (A.wrong && A.right) logMistakes?.([{ wrong: A.wrong, right: A.right, why: A.why || '' }], 'live'); return ok('shown on screen'); }
      if (fc.name === 'mark_done') { const want = String(A.task || '').trim(); if (want.length < 3) return ok('task not found');
        const t = (todayPlan()?.tasks || []).find(x => x.t.includes(want) || want.includes(x.t.slice(0, 12))); if (!t) return ok('task not found');
        U.mdone = U.mdone || {}; const key = isoDay() + '|' + t.k; if (U.mdone[key]) return ok('already done');
        U.mdone[key] = 1; addXP(3); saveU(); toast('✓ در برنامهٔ امروز علامت خورد: ' + t.t); return ok('done'); }
      return ok('unknown tool'); });
    send(res);
  }
  if (m.toolCallCancellation?.ids) { Live.cancel = Live.cancel || new Set(); m.toolCallCancellation.ids.forEach(i => Live.cancel.add(i)); }
  if (m.goAway) ui.status('جلسه رو به پایان است؛ بعد از قطع، دوباره وصل شو.');
}
function liveStop(ui, silent) {
  const was = Live.on; if (was) VR_hostSend({ k: 'class', on: false }); try { (Live.rsrc || []).forEach(n => n.disconnect()); } catch { } Live.rsrc = []; Live.rIds = null; Live.proc = null; if (Live.tdest && window.VR?.on) vrSetTeacherTrack(null); Live.tdest = null; Live.on = false; Live.starting = false; Live.busyN = 0; Live.cancel = null; clearInterval(Live.timer); clearTimeout(Live.mvT); try { Live.node?.disconnect(); Live.src?.disconnect(); } catch { } Live.mic?.getTracks().forEach(t => t.stop());
  Live.queue.forEach(s => { try { s.stop(); } catch { } }); Live.queue = []; const ws = Live.ws; Live.ws = null; try { ws?.close(); } catch { } try { Live.ctx?.close(); } catch { }
  saveU(); ui?.idle(); if (!silent) ui?.status('تماس تمام شد. آفرین! 👏'); ui?.podium?.(); if (was) liveRemember();
}

routes.live = (mode = 'lesson') => {
  if (!LIVE_MODES[mode]) mode = 'lesson'; setTop('کلاس زنده با معلم', true); const v = view(); const L = todayLog();
  v.innerHTML = `<div class="stack">
  <div class="card stack gpt-card" id="lgpt" ${(G.settings.liveEngine || 'gemini') === 'gpt' ? '' : 'hidden'}><b>🎙 کلاس صوتی با ChatGPT (رایگان)</b>
    <ol class="small gpt-steps"><li>اگر خواستی، پایین همین صفحه انتخاب کن چه چیزی یاد بگیری (درس، واژه، گرامر یا موضوع دلخواه).</li><li>دکمهٔ سبز را بزن؛ طرح کامل درس کپی می‌شود و ChatGPT باز می‌شود.</li><li>در ChatGPT نگه دار و «Paste / چسباندن» را بزن و بفرست.</li><li>بعد دکمهٔ حالت صوتی 🎙 (کنار جای نوشتن) را بزن و حرف بزن. غلط‌های نوشتاری‌ات را با خط‌خوردگی ❌ و شکل درست ✅ تصحیح می‌کند.</li></ol>
    <div class="row"><button class="btn" id="gpt">🚀 شروع کلاس در ChatGPT</button><button class="btn line sm" id="gptc">فقط کپی دستور</button></div>
    <span class="tiny muted">${mode === 'group' ? 'برای کلاس گروهی: یک نفر ChatGPT را روی بلندگو باز کند و همه کنار هم باشید؛ هر کس قبل از حرف زدن اسمش را بگوید.' : 'برنامهٔ امروز، اشتباه‌های قبلی و حافظهٔ کلاس‌هایت هم به ChatGPT داده می‌شود.'}</span></div>
  <div class="live-card"><div class="live-av" id="lav"><span>👩‍🏫</span><i></i></div><b id="lst">${esc(G.settings.teacher)} آماده است</b><span class="small" id="lclk">${faNum(Math.round(L.live || 0))} دقیقه کلاس زندهٔ امروز</span>
    <div class="seg eng-seg" id="leng">${[['gemini', '✨ Gemini'], ['gpt', '🤖 ChatGPT']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.liveEngine || 'gemini') === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="row" style="justify-content:center"><button class="btn live-go" id="lgo">📞 شروع کلاس</button></div>
    <span class="tiny" style="opacity:.8">مثل تماس تلفنی حرف بزن؛ وسط حرف معلم هم می‌توانی بپری. هدفون بهتر است.</span></div>
  <div class="row small" style="justify-content:space-between;gap:6px"><span>زبان آموزش معلم:</span><div class="seg" id="ltl">${[['fa', '🇮🇷 فارسی'], ['mix', 'نیمه‌نیمه'], ['en', '🇬🇧 بیشتر انگلیسی']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.teachLang || 'fa') === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
  <label class="row small" style="gap:6px;flex-wrap:nowrap"><span style="white-space:nowrap">معلم مرا این‌طور صدا کند:</span><input class="in grow" id="lcm" value="${esc(callMe())}" placeholder="مثلاً رَستا"></label>
  <div class="vb-cats" style="flex-wrap:wrap">${Object.entries(LIVE_MODES).map(([k, [ic, t]]) => `<button class="pill ${k === mode ? 'acc' : ''}" data-lm="${k}">${ic} ${t}</button>`).join('')}</div>
  <div class="small muted" id="lmd">${esc(LIVE_MODES[mode][2])}</div>
  ${mode === 'group' ? `<div class="card stack" style="gap:8px"><b>👥 چه کسانی در کلاس هستند؟</b><input class="in" id="lgn" placeholder="اسم‌ها را با ویرگول جدا کن؛ مثلاً رَستا، ملیحه" value="${esc(lsGet('zd:group:' + G.active, ''))}"><span class="tiny muted">اگر همه کنار هم پشت همین گوشی هستید، اسم‌ها را اینجا بنویسید. اول معلم از هر نفر می‌خواهد خودش را معرفی کند تا صدایش را بشناسد.</span></div>
  <div class="card stack vr-card" id="vrc"><b>🌍 کلاس از راه دور — هر کس از گوشی خودش (تا ${faNum(VR_MAX)} نفر)</b>
    <span class="small muted">یک نفر «ساختن کلاس» را می‌زند و کد را برای بقیه می‌فرستد؛ بقیه کد را وارد می‌کنند. همه صدای هم را زنده می‌شنوند و میزبان معلم را روشن می‌کند. هدفون بگذارید تا صدا برنگردد.</span>
    <div id="vrbox"></div></div>` : ''}
  ${mode === 'lesson' ? (() => { const S = liveSel(); const cu = S.unit || currentUnit().id; return `<div class="card stack" style="gap:8px"><b>چه چیزی یادم بدهد؟</b>
    <label class="f">درس کتاب<select class="in" id="lsu"><option value="">— درس فعلی (${esc(currentUnit().fa)}) —</option>${LEVELS.map(Lv => `<optgroup label="${esc(Lv.fa)}">${ALL_UNITS.filter(x => x.level === Lv.id).map(x => `<option value="${x.id}"${S.unit === x.id && !S.ws && !S.gram ? ' selected' : ''}>${esc(x.fa)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <div class="seg" id="lsf">${Object.entries(LIVE_FOCUS).map(([k, [ic, t]]) => `<button data-v="${k}" class="${S.focus === k && !S.ws && !S.gram ? 'on' : ''}">${ic} ${t}</button>`).join('')}</div>
    <label class="f">یا یک موضوع واژگان (Word Skills)<select class="in" id="lsw"><option value="">—</option>${WORD_TRACK.map(Lv => `<optgroup label="${esc(Lv.fa)}">${WS_UNITS.filter(x => x.level === Lv.id).map(x => `<option value="${x.id}"${S.ws === x.id ? ' selected' : ''}>${esc(x.fa)} — ${esc(x.en)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <label class="f">یا یک مبحث گرامر (مثلاً زمان‌ها)<select class="in" id="lsg"><option value="">—</option>${(typeof GRAMMAR !== 'undefined' ? GRAMMAR : []).map(g => `<option value="${g.id}"${S.gram === g.id ? ' selected' : ''}>${esc(g.lvl)} · ${esc(g.fa)}</option>`).join('')}</select></label>
    <div class="lc-custom"><b>✨ یا بگو دقیقاً چه می‌خواهی یاد بگیری</b><span class="tiny muted">مثلاً «مصاحبهٔ کاری»، «حرف زدن با دکتر»، «فرق since و for»، «سفارش قهوه در لندن». یک طرح درس کامل و تعاملی برایت طراحی می‌شود و معلم با همان درس می‌دهد.</span>
      <div class="row"><input class="in grow" id="lcw" placeholder="چه چیزی یاد بگیری؟"><button class="btn sm" id="lcb">طراحی درس</button></div>
      <div class="lc-list" id="lcl">${Object.entries(customPlans()).reverse().slice(0, 8).map(([k, P]) => `<button class="pill ${S.custom === k ? 'acc' : ''}" data-cp="${k}">✨ ${esc(P.title_fa || P.want)}</button>`).join('')}</div></div>
    <div class="seg" id="lsa">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.accent === 'UK' ? 'UK' : 'US') === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <span class="tiny muted">برنامهٔ تدریس هر درس از قبل کامل نوشته شده: بانک کامل واژه‌ها، الگوها، نقش‌آفرینی، گرامر، تلفظ و کوییز.</span></div>`; })() : ''}
  ${mode === 'group' ? `<div class="classroom" id="lclass"><div class="cr-act" id="lact" hidden></div><div class="cr-seats" id="lseats"></div><div class="cr-hw" id="lhw" hidden></div></div>` : ''}
  <div class="card stack live-board" id="lboard" hidden></div>
  <div class="card stack lt-box" id="ltx" hidden><div class="row"><input class="in grow en" id="lti" dir="auto" placeholder="${mode === 'group' ? 'اسمت: پیام به انگلیسی… (مثلاً ملیحه: I goed home)' : 'به انگلیسی بنویس؛ معلم غلط‌ها را تصحیح می‌کند…'}"><button class="btn sm" id="ltb">ارسال</button></div><div id="lfix"></div></div>
  <div class="card stack live-log" id="llog"><span class="small muted">متن گفتگو اینجا نوشته می‌شود.</span></div>
  <div class="card stack" id="lgptcard" style="display:none"></div></div>`;
  const log = $('#llog'); let cur = null, who = null;
  const ui = {
    board: (t, items) => { const b = $('#lboard'); if (!b) return; b.hidden = false; b.innerHTML = `<b>🧑‍🏫 ${esc(t)}</b>${(items || []).map((x, i) => `<div class="lb-i" data-bi="${i}"><span class="en">${esc(x.en || '')}</span>${x.fa ? `<span class="small"> — ${esc(x.fa)}</span>` : ''}${x.note ? `<div class="tiny muted">🧭 ${esc(x.note)}</div>` : ''}</div>`).join('')}`; b.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); },
    hl: i => { $$('#lboard .lb-i').forEach((x, k) => x.classList.toggle('reading-now', k === i)); $(`#lboard [data-bi="${i}"]`)?.scrollIntoView({ block: 'nearest' }); },
    status: t => { $('#lst') && ($('#lst').textContent = t || `${G.settings.teacher} آماده است`); },
    connecting: () => { const b = $('#lgo'); if (b) { b.textContent = '⏳ در حال وصل شدن…'; b.disabled = true; } },
    live: () => { if (!$('#lgo')) return; $('#lgo').disabled = false; $('#lgo').textContent = '⏹ پایان کلاس'; $('#lgo').classList.add('bad'); $('#lav')?.classList.add('on'); ui.status('وصل شدی؛ حرف بزن 🙂'); log.innerHTML = ''; $('#ltx') && ($('#ltx').hidden = false); },
    idle: () => { $('#ltx') && ($('#ltx').hidden = !window.VR?.on); const b = $('#lgo'); if (!b) return; b.disabled = false; b.textContent = '📞 شروع کلاس'; b.classList.remove('bad'); $('#lav')?.classList.remove('on', 'talk'); },
    level: l => { $('#lav')?.style.setProperty('--lv', Math.min(1, l * 4).toFixed(2)); },
    speaking: on => { $('#lav')?.classList.toggle('talk', on); },
    clock: s => { $('#lclk') && ($('#lclk').textContent = `⏱ ${faNum(Math.floor(s / 60))}:${faNum(String(s % 60).padStart(2, '0'))}`); },
    fix: (n, wr, ri, why) => { const el = $('#lfix'); if (!el) return; el.insertAdjacentHTML('afterbegin', `<div class="lfx">${n ? `<b class="small">${esc(n)}:</b> ` : ''}<s class="en">${esc(wr)}</s> <span class="arr">←</span> <b class="en ok">${esc(ri)}</b><div class="small">💡 ${esc(why)}</div></div>`); el.firstElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); },
    say: (w, t) => { if (w === 'end') { cur = null; who = null; return; } if (who !== w || !cur) { cur = document.createElement('div'); cur.className = 'll ' + w; cur.innerHTML = `<b>${w === 'me' ? 'تو' : w === 'g' ? '👥 کلاس' : esc(G.settings.teacher)}:</b> <span></span>`; log.appendChild(cur); who = w; } cur.querySelector('span').textContent += t; cur.scrollIntoView({ block: 'nearest' }); }
  };
  const saveSel = p => { const S = Object.assign(liveSel(), p); lsSet('zd:livesel:' + G.active, S); LIVE_LESSON = null; liveLessonText(); };
  if (mode === 'lesson') {
    $('#lsu').onchange = e => saveSel({ unit: e.target.value, ws: '', gram: '', custom: '' , topic: null }) || ($('#lsw').value = '', $('#lsg').value = '');
    const offF = () => $$('#lsf button').forEach(x => x.classList.remove('on'));
    $('#lsw').onchange = e => { saveSel({ ws: e.target.value, gram: '', custom: '', focus: 'full' , topic: null }); $('#lsg').value = ''; offF(); };
    $('#lsg').onchange = e => { saveSel({ gram: e.target.value, ws: '', custom: '', focus: 'full' , topic: null }); $('#lsw').value = ''; offF(); };
    $('#lsf').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#lsf button').forEach(x => x.classList.toggle('on', x === b)); saveSel({ focus: b.dataset.v, ws: '', gram: '', custom: '' , topic: null }); $('#lsw').value = ''; $('#lsg').value = ''; };
    const pickC = k => { saveSel({ custom: k, ws: '', gram: '', focus: 'full' , topic: null }); $('#lsw').value = ''; $('#lsg').value = ''; offF(); $$('#lcl .pill').forEach(x => x.classList.toggle('acc', x.dataset.cp === k)); };
    $('#lcl').onclick = e => { const b = e.target.closest('[data-cp]'); if (b) { pickC(b.dataset.cp); toast('✨ درس دلخواه انتخاب شد؛ «شروع کلاس» را بزن.'); } };
    $('#lcb').onclick = async () => { const w = $('#lcw').value.trim(); if (w.length < 3) return toast('بنویس چه چیزی می‌خواهی یاد بگیری.'); const b = $('#lcb'); b.disabled = true; b.textContent = '🧠 در حال طراحی…'; const h0 = location.hash;
      try { const k = await makeCustomPlan(w); if (location.hash !== h0) return; const P = customPlans()[k]; $('#lcl').insertAdjacentHTML('afterbegin', `<button class="pill" data-cp="${k}">✨ ${esc(P.title_fa || w)}</button>`); pickC(k); $('#lcw').value = '';
        toast(`✨ درس «${P.title_fa || w}» طراحی شد: ${faNum((P.bank || []).reduce((a, g) => a + (g.items || []).length, 0))} واژه/عبارت، ${faNum((P.steps || []).length)} مرحلهٔ تعاملی. «شروع کلاس» را بزن.`, 6000); }
      catch (e) { if (location.hash === h0) aiErr(e); } finally { b.disabled = false; b.textContent = 'طراحی درس'; } };
    $('#lsa').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#lsa button').forEach(x => x.classList.toggle('on', x === b)); G.settings.accent = b.dataset.v; saveG('settings'); };
  }
  const GN = () => lsGet('zd:group:' + G.active, '').split(/[,،]/).map(x => x.trim()).filter(Boolean);
  const SC = {}; const AV = ['🦊', '🐼', '🐯', '🦁', '🐨', '🐸', '🦉', '🐙'];
  const norm = x => String(x || '').replace(/[\u064B-\u0652\u200c\s]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase();
  const LAT = { ali: 'علی', maliheh: 'ملیحه', maliha: 'ملیحه', rasta: 'رستا', sara: 'سارا', mina: 'مینا', reza: 'رضا', mona: 'مونا' };
  const match = n => { const L = GN(); let q = norm(n); if (!q) return n; if (LAT[q]) q = norm(LAT[q]);
    return L.find(x => norm(x) === q) || L.filter(x => norm(x).startsWith(q) || q.startsWith(norm(x))).sort((a, b) => Math.abs(norm(a).length - q.length) - Math.abs(norm(b).length - q.length))[0] || L.find(x => norm(x).includes(q)) || n; };
  const seats = (spot) => { const el = $('#lseats'); if (!el) return; const names = GN(); el.innerHTML = names.map((n, i) => `<div class="cr-seat${spot && n === spot ? ' spot' : ''}" data-n="${esc(n)}"><span class="cr-av">${AV[i % AV.length]}</span><b>${esc(n)}</b><span class="cr-pt">⭐ ${faNum(SC[n] || 0)}</span></div>`).join('') || '<span class="small muted">اسم شرکت‌کننده‌ها را بالا بنویس.</span>'; };
  const beep = (f = 880) => { try { const C = new (window.AudioContext || window.webkitAudioContext)(); const o = C.createOscillator(), g = C.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.15, C.currentTime); g.gain.exponentialRampToValueAtTime(0.001, C.currentTime + 0.35); o.connect(g).connect(C.destination); o.start(); o.stop(C.currentTime + 0.35); setTimeout(() => C.close(), 500); } catch { } };
  let actTm = 0;
  Object.assign(ui, {
    spot: n => seats(match(n)),
    points: (n, p, why) => { const k = match(n); SC[k] = (SC[k] || 0) + p; seats(k); beep(660 + p * 110); const el = $(`.cr-seat[data-n="${CSS.escape(k)}"]`); if (el) { const f = document.createElement('span'); f.className = 'cr-float'; f.textContent = `+${faNum(p)}⭐ ${why || ''}`; el.appendChild(f); setTimeout(() => f.remove(), 2200); } return SC; },
    activity: (t, d, sec) => { const el = $('#lact'); if (!el) return; clearInterval(actTm); el.hidden = false; let left = sec; const draw = () => el.innerHTML = `<b>🎮 ${esc(t)}</b>${d ? `<div class="small">${esc(d)}</div>` : ''}${sec ? `<div class="cr-timer">${faNum(Math.floor(left / 60))}:${faNum(String(left % 60).padStart(2, '0'))}</div>` : ''}`; draw(); beep(520);
      if (sec) actTm = setInterval(() => { left--; draw(); if (left <= 0) { clearInterval(actTm); beep(330); setTimeout(() => beep(330), 250); } }, 1000); },
    guest: (ch, t) => { let el = $('#lguest'); if (!ch) { el?.remove(); return; } if (!el) { el = document.createElement('div'); el.id = 'lguest'; el.className = 'cr-guest'; ($('#lclass') || $('#lboard')?.parentNode)?.prepend(el); } el.innerHTML = `<span>${ch === 'Emma' ? '👩🏼 Emma 🇬🇧' : '👨🏻 Jake 🇺🇸'}</span><b class="en">${esc(t)}</b>`; },
    homework: (n, t) => { const el = $('#lhw'); if (!el) return; el.hidden = false; el.insertAdjacentHTML('beforeend', `<div class="small">📝 <b>${esc(match(n))}:</b> ${esc(t)}</div>`); const H = lsGet('zd:grouphw', []); H.push({ d: isoDay(), n: match(n), t }); lsSet('zd:grouphw', H.slice(-50)); }
  });
  ui.podium = () => { const el = $('#lclass'); if (!el) return; el.querySelector('.cr-podium')?.remove(); const r = Object.entries(SC).sort((a, b) => b[1] - a[1]); if (!r.length) return; el.insertAdjacentHTML('afterbegin', `<div class="cr-podium">${r.slice(0, 3).map(([n, p], i) => `<div class="pd p${i + 1}"><span>${['🥇', '🥈', '🥉'][i]}</span><b>${esc(n)}</b><small>${faNum(p)} ⭐</small></div>`).join('')}</div>`); for (let i = 0; i < 4; i++) setTimeout(() => beep(523 + i * 130), i * 160); };
  if (mode === 'group') { seats(); } window.__liveUI = ui;
  if (mode === 'group') {
    // پخش رویدادهای صفحهٔ معلم برای همهٔ اعضای اتاق (فقط میزبان)
    ['board', 'hl', 'fix', 'spot', 'points', 'activity', 'homework', 'guest'].forEach(k => { const f = ui[k]; if (!f) return; ui[k] = (...a) => { VR_hostSend({ k: 'ui', n: k, a }); return f(...a); }; });
    const sayF = ui.say; ui.say = (w, t) => { VR_hostSend({ k: 'tr', w, t }); return sayF(w, t); };
    const drawVR = () => { const box = $('#vrbox'); if (!box) return;
      if (!VR.on) { box.innerHTML = `<div class="row"><button class="btn sm" id="vrh">➕ ساختن کلاس</button><input class="in grow en" id="vrk" maxlength="5" placeholder="کد کلاس" style="text-transform:uppercase"><button class="btn line sm" id="vrj">ورود</button></div>`;
        $('#vrh').onclick = async () => { const ok = await vrJoin(vrCode(), true); if (ok) { toast('کلاس ساخته شد؛ کد را برای بقیه بفرست.'); drawVR(); } };
        $('#vrj').onclick = async () => { const k = $('#vrk').value.trim().toUpperCase(); if (k.length !== 5) return toast('کد ۵ حرفی را وارد کن.'); if (await vrJoin(k, false)) drawVR(); }; return; }
      const M = Object.entries(VR.members); const names = M.map(([, v]) => v.name);
      box.innerHTML = `<div class="vr-code">کد کلاس: <b class="en">${VR.code}</b> <button class="btn line sm" id="vrcp">کپی/اشتراک</button></div>
        <div class="vr-ppl">${M.map(([k, v]) => `<span class="vr-p${k === VR.id ? ' me' : ''}${VR.peers[k]?.pc?.connectionState === 'connected' ? ' ok' : ''}">${v.host ? '👑' : '🎧'} ${esc(v.name)}${k === VR.id ? ' (تو)' : ''}</span>`).join('')}</div>
        <div class="row"><button class="btn line sm" id="vrm">${VR.muted ? '🎙 روشن کردن میکروفون' : '🔇 بی‌صدا کردن من'}</button><button class="btn ghost sm" id="vrl">خروج از کلاس</button></div>
        <span class="tiny muted">${VR.host ? 'تو میزبانی: وقتی همه آمدند «شروع کلاس» را بزن.' : 'منتظر بمان تا میزبان کلاس را شروع کند؛ صدای معلم و بقیه را همین‌جا می‌شنوی.'}</span>`;
      if (VR.host) { lsSet('zd:group:' + G.active, names.join('، ')); $('#lgn') && ($('#lgn').value = names.join('، ')); seats(); }
      $('#lgo').hidden = !VR.host; $('#ltx') && ($('#ltx').hidden = false);
      $('#vrcp').onclick = async () => { const txt = `بیا کلاس زندهٔ انگلیسی 🎧\nکد کلاس: ${VR.code}\n${location.origin + location.pathname}#live/group`; try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast('کپی شد.'); } } catch { } };
      $('#vrm').onclick = () => { vrMute(!VR.muted); drawVR(); };
      $('#vrl').onclick = async () => { if (Live.on) liveStop(ui, true); await vrLeave(); $('#lgo').hidden = false; drawVR(); }; };
    const onVR = ev => { if (!$('#vrbox')) return;
      if (ev.t === 'members' || ev.t === 'state' || ev.t === 'left') drawVR();
      if (ev.t === 'members' && VR.host && Live.on) vrSend({ k: 'class', on: true });
      if (ev.t === 'remote' && VR.host && Live.on) liveAddRemote(ev.stream);
      if (ev.t === 'msg') { const m = ev.m;
        if (m.k === 'chat' && VR.host) { if (!typedToTeacher(m.n, m.t)) { ui.say('g', `✍️ ${m.n}: ${m.t}`); ui.say('end'); } }
        if (VR.host) return;
        if (m.k === 'ui' && ui[m.n]) ui[m.n](...(m.a || []));
        if (m.k === 'tr') { if (m.w === 'end') ui.say('end'); else ui.say(m.w === 'me' ? 'g' : m.w, m.t); }
        if (m.k === 'class') { ui.status(m.on ? '🎓 کلاس شروع شد؛ حرف بزن 🙂' : 'کلاس تمام شد. آفرین! 👏'); $('#lav')?.classList.toggle('on', m.on); }
        if (m.k === 'guest') { ui.guest?.(m.ch, m.t); guestSpeak(m.ch, m.t).then(() => ui.guest?.(null)); }
        if (m.k === 'say') say(m.t, 'en', 'calm'); } };
    VR.listeners = [onVR]; drawVR();
  }
  $('#lgn') && ($('#lgn').onchange = e => { lsSet('zd:group:' + G.active, e.target.value.trim()); seats(); });
  $('#ltl').onclick = e => { const b = e.target.closest('button'); if (!b) return; G.settings.teachLang = b.dataset.v; saveG('settings'); $$('#ltl button').forEach(x => x.classList.toggle('on', x === b)); toast(Live.on ? 'از کلاس بعد اعمال می‌شود.' : 'ذخیره شد.'); };
  $('#lcm').onchange = e => lsSet('zd:callme:' + G.active, e.target.value.trim());
  const typedToTeacher = (n, msg) => { if (!Live.on || !Live.ws) return false; ui.say('me', `✍️ ${n ? n + ': ' : ''}${msg}`); ui.say('end'); liveLog('S', `(typed by ${n || 'student'}) ${msg}`);
    Live.ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: `[TYPED MESSAGE from ${n || 'a student'}]: ${msg}\n(Check it carefully. If it has ANY mistake — spelling, grammar, word choice, punctuation, capital letters — call correct_writing with the wrong part, the correct version and a short Persian reason, then reply.)` }] }], turnComplete: true } })); return true; };
  const sendTyped = () => { const i = $('#lti'); const t = i.value.trim(); if (!t) return; let n = mode === 'group' ? (window.VR?.on ? VR.name : '') : callMe(), msg = t; const m2 = !window.VR?.on && t.match(/^([^:：]{1,20})[:：]\s*(.+)$/); if (m2) { n = m2[1].trim(); msg = m2[2]; }
    if (window.VR?.on && !VR.host) { vrSend({ k: 'chat', n, t: msg }); ui.say('me', `✍️ ${msg}`); ui.say('end'); i.value = ''; return; }
    if (typedToTeacher(n, msg)) i.value = ''; };
  $('#ltb').onclick = sendTyped; $('#lti').onkeydown = e => { if (e.key === 'Enter') sendTyped(); };
  const engine = () => G.settings.liveEngine || 'gemini';
  const drawEng = () => { $$('#leng button').forEach(b => b.classList.toggle('on', b.dataset.v === engine())); $('#lgpt').hidden = engine() !== 'gpt'; if (!Live.on) $('#lgo').textContent = engine() === 'gpt' ? '🤖 شروع کلاس با ChatGPT' : '📞 شروع کلاس'; };
  $('#leng').onclick = e => { const b = e.target.closest('button'); if (!b || Live.on || Live.starting) return; G.settings.liveEngine = b.dataset.v; saveG('settings'); drawEng(); };
  drawEng(); const idle0 = ui.idle; ui.idle = () => { idle0(); drawEng(); };
  $('#lgo').onclick = () => Live.starting ? null : Live.on ? liveStop(ui) : engine() === 'gpt' ? $('#gpt').click() : liveStart(mode, ui);
  $$('[data-lm]', v).forEach(b => b.onclick = () => { if (Live.on) liveStop(ui, true); go('live/' + b.dataset.lm); });
  liveLessonText();
  const GPT_ADAPT = GPT_ADAPT_TXT;
  const gptPrompt = async () => { if (mode === 'lesson' || mode === 'group') { try { await liveLessonText(); } catch { } } return livePrompt(mode) + '\n' + GPT_ADAPT; };
  let GPT_P = ''; const gptRefresh = () => gptPrompt().then(p => GPT_P = p).catch(() => { }); gptRefresh(); setInterval(() => { if ($('#gpt')) gptRefresh(); }, 4000);
  $('#gpt').onclick = () => { const p = GPT_P || (livePrompt(mode) + '\n' + GPT_ADAPT); let ok = true; try { navigator.clipboard.writeText(p).catch(() => { ok = false; }); } catch { ok = false; }
    const url = p.length < 7000 ? 'https://chatgpt.com/?q=' + encodeURIComponent(p) : 'https://chatgpt.com/';
    if (!window.open(url, '_blank')) location.href = url; setTimeout(() => toast(ok ? '✅ طرح درس کپی شد. در ChatGPT «چسباندن» را بزن، بفرست و بعد دکمهٔ صدا 🎙 را بزن.' : 'در ChatGPT دستور را بچسبان («فقط کپی دستور»).', 8000), 50); };
  $('#gptc').onclick = async () => { try { await navigator.clipboard.writeText(await gptPrompt()); toast('دستور کپی شد؛ در ChatGPT بچسبان و بفرست.'); } catch { toast('کپی نشد.'); } };
  const myHash = location.hash; addEventListener('hashchange', function h() { if (location.hash !== myHash) { if (Live.on && Live.hash === myHash) liveStop(null, true); if (window.VR?.on && !/^#live\/group/.test(location.hash)) vrLeave(); removeEventListener('hashchange', h); } });
};

/* «یادم بده» از هر صفحه (بانک واژه، افعال، موضوع‌ها): انتخاب درس برای معلم زنده و شروع با Gemini یا ChatGPT */
function teachThis(sel, title) {
  const S = Object.assign({ unit: '', focus: 'full', ws: '', gram: '', custom: '', topic: null }, sel); lsSet('zd:livesel:' + G.active, S); LIVE_LESSON = null;
  let P = ''; const ready = liveLessonText().then(() => P = livePrompt('lesson') + '\n' + GPT_ADAPT_TXT).catch(() => { });
  const bg = sheet(`<div class="stack"><b>🎓 کلاس زنده: ${esc(title || '')}</b><span class="small muted">طرح کامل این درس (همهٔ موارد، تلفظ، کاربرد، تمرین تعاملی) به معلم داده می‌شود. با کدام معلم؟</span>
    <button class="btn" id="tt-gem">✨ Gemini — همین‌جا داخل برنامه حرف بزن</button>
    <button class="btn gpt-go" id="tt-gpt" disabled>⏳ آماده‌سازی دستور ChatGPT…</button>
    <span class="tiny muted">ChatGPT: دستور کپی می‌شود؛ در ChatGPT «Paste» را بزن، بفرست و بعد دکمهٔ صدا 🎙 را بزن.</span></div>`);
  ready.then(() => { const b = bg.querySelector('#tt-gpt'); if (b) { b.disabled = false; b.textContent = '🤖 ChatGPT — کپی دستور و باز کردن ChatGPT'; } });
  bg.querySelector('#tt-gem').onclick = () => { G.settings.liveEngine = 'gemini'; saveG('settings'); bg.remove(); go('live/lesson'); setTimeout(() => toast('درس آماده است؛ «📞 شروع کلاس» را بزن.', 5000), 400); };
  bg.querySelector('#tt-gpt').onclick = () => { if (!P) return; try { navigator.clipboard.writeText(P); } catch { } const url = P.length < 7000 ? 'https://chatgpt.com/?q=' + encodeURIComponent(P) : 'https://chatgpt.com/'; if (!window.open(url, '_blank')) location.href = url; bg.remove(); toast('✅ دستور کپی شد. در ChatGPT «Paste» را بزن، بفرست و دکمهٔ صدا 🎙 را بزن.', 8000); };
}
