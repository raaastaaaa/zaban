/* زبان دوم — دورهٔ کامل گرامر (همهٔ زمان‌ها و مباحث تا سطح متوسط) و بانک افعال کاربردی دسته‌بندی‌شده */
'use strict';
const GRAMMAR = [
  ['A1', 'be', 'فعل to be (am / is / are)'], ['A1', 'poss', 'ضمایر فاعلی و صفات ملکی (I, my, your…)'], ['A1', 'articles', 'حرف تعریف a / an / the'],
  ['A1', 'plural', 'جمع بستن اسم‌ها'], ['A1', 'this', 'this / that / these / those'], ['A1', 'thereis', 'There is / There are'],
  ['A1', 'have', 'have و have got'], ['A1', 'presimple', 'زمان حال ساده (Present Simple)'], ['A1', 'freq', 'قیدهای تکرار (always, usually, never…)'],
  ['A1', 'presprog', 'زمان حال استمراری (Present Continuous)'], ['A1', 'simplevsprog', 'حال ساده یا حال استمراری؟'], ['A1', 'can', 'can / can\'t برای توانایی و اجازه'],
  ['A1', 'count', 'اسم‌های شمارش‌پذیر و ناشمارش؛ some / any / much / many'], ['A1', 'prep', 'حروف اضافهٔ زمان و مکان (in, on, at…)'],
  ['A2', 'pastbe', 'گذشتهٔ to be (was / were)'], ['A2', 'pastsimple', 'زمان گذشتهٔ ساده (افعال باقاعده و بی‌قاعده)'], ['A2', 'pastprog', 'زمان گذشتهٔ استمراری (Past Continuous)'],
  ['A2', 'goingto', 'آینده با be going to'], ['A2', 'will', 'آینده با will'], ['A2', 'presfuture', 'حال استمراری برای برنامه‌های آینده'],
  ['A2', 'compare', 'صفت تفضیلی و عالی (bigger, the biggest)'], ['A2', 'adverbs', 'قید حالت (quickly, well)'], ['A2', 'presperf', 'زمان حال کامل (Present Perfect)'],
  ['A2', 'forsince', 'حال کامل با for / since، ever / never، just / already / yet'], ['A2', 'perfvspast', 'حال کامل یا گذشتهٔ ساده؟'], ['A2', 'modals', 'should / must / have to'],
  ['A2', 'usedto', 'used to برای عادت‌های گذشته'], ['A2', 'cond1', 'جملهٔ شرطی صفر و نوع اول'], ['A2', 'tooenough', 'too و enough'],
  ['B1', 'cond2', 'جملهٔ شرطی نوع دوم'], ['B1', 'passive', 'مجهول (حال و گذشته)'], ['B1', 'relative', 'جملهٔ موصولی (who, which, that, where)'],
  ['B1', 'reported', 'نقل قول غیرمستقیم'], ['B1', 'gerund', 'gerund و infinitive (enjoy doing / want to do)'], ['B1', 'tags', 'سؤال‌های کوتاه و tag questions'],
  ['B1', 'perfprog', 'حال کامل استمراری'], ['B1', 'pastperf', 'زمان گذشتهٔ کامل (Past Perfect)'], ['B1', 'deduction', 'افعال وجهی استنباطی (must be, might be, can\'t be)'],
  ['B1', 'tenses', 'مرور همهٔ زمان‌ها: کدام زمان را کی به کار ببریم؟']
].map(([lvl, id, fa], i) => ({ lvl, id, fa, n: i + 1 }));

const VERBS_RAW = `be|was / were|been|بودن|پایه|I am a student.
have|had|had|داشتن|پایه|I have two brothers.
do|did|done|انجام دادن|پایه|What do you do?
make|made|made|ساختن / درست کردن|پایه|I made a cake.
get|got|got (US: gotten)|گرفتن / رسیدن / شدن|پایه|I get home at six.
take|took|taken|برداشتن / بردن / گرفتن|پایه|Take your umbrella.
give|gave|given|دادن|پایه|Give me the book, please.
put|put|put|گذاشتن|پایه|Put it on the table.
try|tried|tried|سعی کردن / امتحان کردن|پایه|Try again.
use|used|used|استفاده کردن|پایه|Can I use your phone?
find|found|found|پیدا کردن|پایه|I can't find my phone.
lose|lost|lost|گم کردن / باختن|پایه|I lost my wallet.
keep|kept|kept|نگه داشتن|پایه|Keep the change.
begin|began|begun|شروع کردن / شروع شدن|پایه|The class begins at nine.
finish|finished|finished|تمام کردن|پایه|I finished my work.
open|opened|opened|باز کردن|پایه|Open the window, please.
close|closed|closed|بستن|پایه|Close the door.
wait|waited|waited|منتظر ماندن|پایه|Wait for me.
become|became|become|شدن|پایه|She became a doctor.
break|broke|broken|شکستن|پایه|I broke my phone.
grow|grew|grown|رشد کردن / بزرگ شدن|پایه|I grew up in Tehran.
hold|held|held|نگه داشتن (در دست)|پایه|Hold my hand.
let|let|let|اجازه دادن|پایه|Let me help you.
change|changed|changed|عوض کردن / عوض شدن|پایه|I changed my mind.
throw|threw|thrown|پرت کردن|پایه|Throw the ball to me.
give up|gave up|given up|دست کشیدن / ترک کردن|پایه|Don't give up!
say|said|said|گفتن|ارتباط|She said hello.
tell|told|told|گفتن (به کسی) / تعریف کردن|ارتباط|Tell me a story.
speak|spoke|spoken|صحبت کردن (به زبانی)|ارتباط|Do you speak English?
talk|talked|talked|حرف زدن|ارتباط|Let's talk about it.
ask|asked|asked|پرسیدن / خواستن|ارتباط|Can I ask a question?
answer|answered|answered|جواب دادن|ارتباط|Please answer the phone.
call|called|called|زنگ زدن / صدا زدن|ارتباط|I'll call you later.
write|wrote|written|نوشتن|ارتباط|Write your name here.
read|read|read|خواندن|ارتباط|I read the news every day.
listen|listened|listened|گوش دادن|ارتباط|Listen to me, please.
send|sent|sent|فرستادن|ارتباط|Send me a message.
meet|met|met|ملاقات کردن / آشنا شدن|ارتباط|Nice to meet you.
help|helped|helped|کمک کردن|ارتباط|Can you help me?
mean|meant|meant|معنی دادن / منظور داشتن|ارتباط|What do you mean?
show|showed|shown|نشان دادن|ارتباط|Show me your ticket.
explain|explained|explained|توضیح دادن|ارتباط|Can you explain it again?
see|saw|seen|دیدن|حواس|I saw him yesterday.
look|looked|looked|نگاه کردن|حواس|Look at this picture.
watch|watched|watched|تماشا کردن|حواس|We watched a movie.
hear|heard|heard|شنیدن|حواس|I can't hear you.
look for|looked for|looked for|دنبال … گشتن|حواس|I'm looking for my keys.
think|thought|thought|فکر کردن|ذهن|I think you're right.
know|knew|known|دانستن / شناختن|ذهن|I know the answer.
understand|understood|understood|فهمیدن|ذهن|I don't understand.
remember|remembered|remembered|به یاد آوردن|ذهن|I remember your name.
forget|forgot|forgotten|فراموش کردن|ذهن|Don't forget your keys.
learn|learned (UK: learnt)|learned (UK: learnt)|یاد گرفتن|ذهن|I'm learning English.
study|studied|studied|درس خواندن / مطالعه کردن|ذهن|She studies medicine.
choose|chose|chosen|انتخاب کردن|ذهن|Choose one.
decide|decided|decided|تصمیم گرفتن|ذهن|I decided to stay.
find out|found out|found out|فهمیدن (خبری را)|ذهن|I found out the truth.
feel|felt|felt|احساس کردن|احساس|I feel tired.
want|wanted|wanted|خواستن|احساس|I want a coffee.
need|needed|needed|لازم داشتن|احساس|I need help.
like|liked|liked|دوست داشتن|احساس|I like this song.
love|loved|loved|عاشق … بودن / خیلی دوست داشتن|احساس|I love my family.
hate|hated|hated|متنفر بودن|احساس|I hate waiting.
hope|hoped|hoped|امیدوار بودن|احساس|I hope you're well.
go|went|gone|رفتن|حرکت|We went to the beach.
come|came|come|آمدن|حرکت|Come here, please.
leave|left|left|ترک کردن / جا گذاشتن|حرکت|I left my bag in the taxi.
bring|brought|brought|آوردن|حرکت|Bring your passport.
drive|drove|driven|رانندگی کردن|حرکت|He drove to work.
ride|rode|ridden|سوار … شدن (دوچرخه، اسب)|حرکت|I rode a bike to school.
run|ran|run|دویدن|حرکت|He runs every morning.
walk|walked|walked|پیاده رفتن|حرکت|Let's walk home.
sit|sat|sat|نشستن|حرکت|Please sit down.
stand|stood|stood|ایستادن|حرکت|Stand up, please.
fall|fell|fallen|افتادن|حرکت|He fell down the stairs.
catch|caught|caught|گرفتن (توپ، اتوبوس)|حرکت|I caught the bus.
move|moved|moved|جابه‌جا شدن / اسباب‌کشی کردن|حرکت|We moved to a new flat.
pick up|picked up|picked up|برداشتن / دنبال کسی رفتن|حرکت|I'll pick you up at seven.
eat|ate|eaten|خوردن|روزمره|We ate dinner at eight.
drink|drank|drunk|نوشیدن|روزمره|Drink some water.
sleep|slept|slept|خوابیدن|روزمره|I slept well.
wake up|woke up|woken up|بیدار شدن|روزمره|I woke up early.
get up|got up|got up|از رختخواب بلند شدن|روزمره|I get up at seven.
wear|wore|worn|پوشیدن (به تن داشتن)|روزمره|She wore a red dress.
live|lived|lived|زندگی کردن|روزمره|I live in a small flat.
cook|cooked|cooked|آشپزی کردن|روزمره|I cooked dinner.
clean|cleaned|cleaned|تمیز کردن|روزمره|Clean your room.
cut|cut|cut|بریدن|روزمره|Cut the bread, please.
wash|washed|washed|شستن|روزمره|Wash your hands.
turn on|turned on|turned on|روشن کردن|روزمره|Turn on the light.
turn off|turned off|turned off|خاموش کردن|روزمره|Turn off your phone.
rent|rented|rented|اجاره کردن|روزمره|We rented a car.
buy|bought|bought|خریدن|خرید|I bought new shoes.
sell|sold|sold|فروختن|خرید|They sell fresh fruit.
pay|paid|paid|پرداختن|خرید|Can I pay by card?
cost|cost|cost|قیمت داشتن|خرید|How much does it cost?
spend|spent|spent|خرج کردن / گذراندن (وقت)|خرید|I spent too much money.
lend|lent|lent|قرض دادن|خرید|Can you lend me some money?
borrow|borrowed|borrowed|قرض گرفتن|خرید|Can I borrow your pen?
order|ordered|ordered|سفارش دادن|خرید|I ordered a pizza.
try on|tried on|tried on|پرو کردن|خرید|Can I try on this jacket?
travel|traveled (UK: travelled)|traveled (UK: travelled)|سفر کردن|سفر|I love to travel.
fly|flew|flown|پرواز کردن|سفر|We flew to Dubai.
arrive|arrived|arrived|رسیدن|سفر|The train arrived late.
stay|stayed|stayed|ماندن / اقامت کردن|سفر|We stayed at a hotel.
book|booked|booked|رزرو کردن|سفر|I booked a table for two.
check in|checked in|checked in|پذیرش شدن (هتل، پرواز)|سفر|We checked in at noon.
work|worked|worked|کار کردن|کار|I work in an office.
teach|taught|taught|درس دادن|کار|He teaches English.
build|built|built|ساختن (بنا)|کار|They built a new school.
fill in|filled in|filled in|پر کردن (فرم)|کار|Fill in this form, please.
apply|applied|applied|درخواست دادن|کار|I applied for the job.
earn|earned|earned|درآمد داشتن|کار|She earns a good salary.
play|played|played|بازی کردن / نواختن|سرگرمی|Let's play football.
sing|sang|sung|آواز خواندن|سرگرمی|She sings beautifully.
swim|swam|swum|شنا کردن|سرگرمی|Can you swim?
win|won|won|بردن|سرگرمی|We won the match.
draw|drew|drawn|نقاشی کشیدن|سرگرمی|Draw a picture.
dance|danced|danced|رقصیدن|سرگرمی|They danced all night.`;
const VERBS = VERBS_RAW.split('\n').map(l => { const [v, past, pp, fa, cat, ex] = l.split('|'); const reg = /^\w+(ed|d)\b/.test(past) && past.startsWith(v.slice(0, Math.max(2, v.length - 1))) && !/[\/(]/.test(past); return { v, past, pp, fa, cat, ex, irr: !reg }; });
const VCATS = [...new Set(VERBS.map(x => x.cat))];

/* ───── دورهٔ گرامر ───── */
routes.grammar = async (id) => {
  if (!id) {
    setTop('گرامر کامل', true); const done = lsGet('zd:gdone:' + G.active, {});
    view().innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">📐 دورهٔ کامل گرامر</b><span class="muted">${faNum(GRAMMAR.length)} مبحث از مقدماتی تا متوسط: همهٔ زمان‌ها، ساختارها و نکته‌ها؛ هر کدام با توضیح فارسی، جدول ساخت، مثال صوتی، اشتباه‌های رایج و تمرین با تصحیح.</span><div class="bar mark"><i style="width:${Math.round(Object.keys(done).length / GRAMMAR.length * 100)}%"></i></div></div>
    ${['A1', 'A2', 'B1'].map(l => `<div class="sec">${{ A1: 'مقدماتی', A2: 'پایه', B1: 'متوسط' }[l]} <small class="en">${l}</small></div><div class="stack">${GRAMMAR.filter(g => g.lvl === l).map(g => `<a class="step${done[g.id] ? ' done' : ''}" href="#grammar/${g.id}"><span class="n">${done[g.id] ? '✓' : faNum(g.n)}</span><span class="grow"><b>${esc(g.fa)}</b></span></a>`).join('')}</div>`).join('')}</div>`;
    return;
  }
  const g = GRAMMAR.find(x => x.id === id); if (!g) return go('grammar'); setTop(g.fa, true); const v = view();
  const key = 'gram:' + id; let L = G.cache[key];
  if (!L) {
    if (needAI(v)) return; v.innerHTML = loading('در حال آماده کردن درس گرامر…');
    try {
      L = await ai({ heavy: true, max: 7000, temp: 0.3, system: 'You are an expert English grammar teacher for Persian speakers. Explanations in clear, simple Persian; English examples natural and correct; contrast with Persian where it helps.', messages: [{ role: 'user', content: `Complete grammar lesson: "${g.fa}" (level ${g.lvl}). JSON {"intro":"Persian: what it is, in 2-3 sentences","why":"Persian: when you need it in real conversations","form":[{"type":"مثبت|منفی|سؤالی|جواب کوتاه or other label in Persian","pattern":"e.g. Subject + am/is/are + verb-ing","examples":["",""]}],"uses":[{"title":"Persian use title","explain":"Persian","examples":[{"en":"","fa":""}]}],"signals":"time words/signals in English, comma separated, or empty","compare":"Persian: how it differs from similar structures or from Persian","mistakes":[{"wrong":"","right":"","why":"Persian"}],"tip":"Persian memory tip","exercises":[{"type":"blank|fix|translate","q":"","a":"","hint":"Persian"}]} — 3-5 uses, 8 exercises.` }] });
      if (!L.form?.length) throw new Error('درس کامل ساخته نشد؛ دوباره امتحان کن.'); G.cache[key] = L; saveG('cache');
    } catch (e) { v.innerHTML = ''; return aiErr(e); }
  }
  const spk = t => `<button class="icon-btn" style="width:30px;height:30px" data-say="${esc(t)}">${I.spk}</button>`;
  v.innerHTML = `<div class="stack"><div class="card stack"><span class="pill acc" style="align-self:flex-start">${g.lvl} · مبحث ${faNum(g.n)}</span><div>${esc(L.intro)}</div><div class="notice soft small"><b>به چه دردم می‌خورد؟</b> ${esc(L.why)}</div></div>
  <div class="card stack"><b>ساخت</b><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">${L.form.map(f => `<tr style="border-top:1px solid var(--line)"><td style="padding:8px;white-space:nowrap"><b>${esc(f.type)}</b></td><td class="en" style="padding:8px">${esc(f.pattern)}</td><td style="padding:8px">${(f.examples || []).map(x => `<div class="row en small" style="flex-wrap:nowrap">${spk(x)} ${esc(x)}</div>`).join('')}</td></tr>`).join('')}</table></div>${L.signals ? `<div class="small"><b>نشانه‌ها:</b> <span class="en">${esc(L.signals)}</span></div>` : ''}</div>
  ${(L.uses || []).map((u, i) => `<div class="card stack"><b>${faNum(i + 1)}. ${esc(u.title)}</b><div class="small">${esc(u.explain)}</div>${(u.examples || []).map(x => `<div class="row small" style="flex-wrap:nowrap">${spk(x.en)}<div><span class="en">${esc(x.en)}</span><br><span class="muted">${esc(x.fa)}</span></div></div>`).join('')}</div>`).join('')}
  ${L.compare ? `<div class="card small"><b>مقایسه:</b> ${esc(L.compare)}</div>` : ''}
  ${L.mistakes?.length ? `<div class="card stack small"><b>اشتباه‌های رایج فارسی‌زبان‌ها</b>${L.mistakes.map(m => `<div><s class="en">${esc(m.wrong)}</s> ← <b class="en">${esc(m.right)}</b><br><span class="muted">${esc(m.why)}</span></div>`).join('')}</div>` : ''}
  ${L.tip ? `<div class="notice small">💡 ${esc(L.tip)}</div>` : ''}
  <div class="grid2"><button class="btn" id="ex">✍️ تمرین این مبحث</button><a class="btn ghost" href="#gclass/${g.id}">👩‍🏫 کلاس با ${esc(G.settings.teacher)}</a></div><button class="btn line sm" id="rg">ساخت دوبارهٔ درس</button><div id="exb"></div></div>`;
  $$('[data-say]', v).forEach(b => b.onclick = () => say(b.dataset.say, 'en', 'calm', b));
  $('#ex').onclick = () => { runEx($('#exb'), L.exercises || [], currentUnit(), true); $('#exb').scrollIntoView({ behavior: 'smooth' }); const d = lsGet('zd:gdone:' + G.active, {}); d[id] = isoDay(); lsSet('zd:gdone:' + G.active, d); addXP(15); saveU(); };
  $('#rg').onclick = () => { delete G.cache[key]; saveG('cache'); routes.grammar(id); };
};
routes.gclass = (id) => {
  const g = GRAMMAR.find(x => x.id === id); setTop('کلاس · ' + g.fa, true); const v = view(); if (needAI(v)) return;
  convo(v, { key: 'gclass:' + id, speakLang: 'fa', micLang: 'fa-IR', placeholder: 'جواب بده یا سؤال بپرس…', intro: 'Start the grammar class: explain briefly and ask me to make my first sentence.',
    system: () => `${TEACHER_STYLE()}\nGRAMMAR CLASS: "${g.fa}" (level ${g.lvl}). Teach it interactively in Persian: short explanation, examples, then make the learner produce sentences, correct them, gradually increase difficulty, and mix in real-life situations. Recycle the learner's words.\n${learnerContext()}\nJSON {"say":"","emotion":"cheerful|calm|excited|encouraging|empathetic|proud|surprised|serious","fixes":[{"wrong":"","right":"","why":"Persian"}],"memory":""}`,
    parse: r => ({ show: r.say, lang: 'fa', fixes: r.fixes }) });
};

/* ───── افعال کاربردی ───── */
routes.verbs = (cat = 'همه') => {
  setTop('افعال کاربردی', true); const v = view(); let only = lsGet('zd:virr', false);
  const list = VERBS.filter(x => (cat === 'همه' || x.cat === cat) && (!only || x.irr));
  v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">🔁 ${faNum(VERBS.length)} فعل پرکاربرد انگلیسی</b><span class="muted">دسته‌بندی‌شده بر اساس موضوع، با سه شکل فعل (حال، گذشته، اسم مفعول)، معنی، مثال و تلفظ. برای افعال هر درس هم بانک لغات همان درس را ببین.</span></div>
  <div class="row">${['همه', ...VCATS].map(c => `<button class="pill ${c === cat ? 'acc' : ''}" style="font-size:13px;padding:5px 12px" data-c="${c}">${c}</button>`).join('')}</div>
  <div class="row"><label class="small row" style="gap:6px"><input type="checkbox" id="irr"${only ? ' checked' : ''}> فقط افعال بی‌قاعده</label><span class="grow"></span><button class="btn sm" id="qz">🎯 آزمون سه شکل فعل</button><button class="btn ghost sm" id="add">+ همه به فلش‌کارت</button></div>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px;min-width:560px"><thead><tr style="color:var(--muted);text-align:right"><th></th><th>فعل</th><th>گذشته</th><th>اسم مفعول</th><th>معنی</th><th>مثال</th></tr></thead><tbody>
  ${list.map(x => `<tr style="border-top:1px solid var(--line)"><td><button class="icon-btn" style="width:30px;height:30px" data-s="${esc(x.v + ', ' + x.past.split(' (')[0].split(' /')[0] + ', ' + x.pp.split(' (')[0])}">${I.spk}</button></td><td class="en"><b>${esc(x.v)}</b>${x.irr ? ' <span class="pill mark">بی‌قاعده</span>' : ''}</td><td class="en">${esc(x.past)}</td><td class="en">${esc(x.pp)}</td><td>${esc(x.fa)}</td><td class="en small">${esc(x.ex)} <button class="pill" data-e="${esc(x.ex)}">🔊</button></td></tr>`).join('')}</tbody></table></div><div id="vq"></div></div>`;
  $$('[data-c]').forEach(b => b.onclick = () => routes.verbs(b.dataset.c));
  $('#irr').onchange = e => { lsSet('zd:virr', e.target.checked); routes.verbs(cat); };
  $$('[data-s]').forEach(b => b.onclick = () => browserSay(b.dataset.s, 'en', 0.8)); $$('[data-e]').forEach(b => b.onclick = () => say(b.dataset.e, 'en', 'calm', b));
  $('#add').onclick = () => { let cu = U.custom.find(x => x.id === 'myverbs'); if (!cu) { cu = { id: 'myverbs', en: 'Useful Verbs', fa: 'افعال کاربردی', icon: '🔁', hue: 150, gram: 'سه شکل فعل: حال، گذشته، اسم مفعول', talk: 'با این افعال دربارهٔ دیروز و تجربه‌هایت حرف بزن.', words: [] }; U.custom.push(cu); }
    list.forEach(x => { if (!cu.words.some(w => w.w === x.v)) cu.words.push({ w: x.v, ipa: '', fa: `${x.fa} — ${x.past} / ${x.pp}`, img: '🔁', pos: 'v', ex: x.ex, g: x.cat }); const k = 'myverbs:' + x.v; if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; }); saveU(); toast(`${faNum(list.length)} فعل به فلش‌کارت‌ها اضافه شد.`); };
  $('#qz').onclick = () => { const items = pick(list.filter(x => x.irr).length >= 5 ? list.filter(x => x.irr) : list, 10).map(x => ({ type: 'blank', q: `${x.v} (${x.fa}) → گذشته و اسم مفعول را با «/» بنویس`, a: `${x.past.split(' (')[0].split(' / ')[0]} / ${x.pp.split(' (')[0]}`, hint: 'مثال: went / gone', full: x.ex })); runEx($('#vq'), items, currentUnit(), false); $('#vq').scrollIntoView({ behavior: 'smooth' }); };
};
