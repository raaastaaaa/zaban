/* دورهٔ عربی (عمانی/خلیجی و سایر لهجه‌ها) — از پایه تا پیشرفته؛ سرفصل‌ها را Claude نوشته است.
   هر درس با «طراح درس» کامل ساخته می‌شود (واژه‌ها، افعال، جمله‌ها، اصطلاحات، گرامر، مکالمه) و معلم زنده آن را درس می‌دهد. */
const AR_UNITS = [
  // سطح ۰ — آشنایی (A0)
  ['ar01', 'A0', 'حروف و صداهای عربی که در فارسی نیست', 'The Arabic sounds Persians find hard: ع، ح، ق، ص، ض، ط، ظ، ث، ذ؛ short and long vowels; how the Omani/Gulf dialect pronounces ق (g) and ك (ch)', 'pronunciation, letters, harakat'],
  ['ar02', 'A0', 'سلام و احوال‌پرسی', 'Greetings and how-are-you in everyday life: السلام عليكم، مرحبا، شحالك/شلونك، الحمد لله، صباح الخير، مع السلامة', 'greetings and replies; masculine/feminine "you"'],
  ['ar03', 'A0', 'معرفی خود و دیگران', 'Introducing yourself: name, nationality, where you live, job; هذا/هذي', 'pronouns (أنا، إنت، إنتي، هو، هي، إحنا، إنتو، هم) and no verb "to be"'],
  ['ar04', 'A0', 'اعداد، پول و قیمت', 'Numbers 0-1000, prices, Omani rial and baisa, bargaining basics', 'numbers with nouns; كم؟'],
  ['ar05', 'A0', 'روزها، ماه‌ها و ساعت', 'Days, months, telling the time, appointments', 'time expressions; متى؟'],
  // سطح ۱ — مقدماتی (A1)
  ['ar06', 'A1', 'خانواده', 'All family members, relatives and in-laws; talking about your family', 'possessive suffixes (ـي، ـك، ـه، ـها، ـنا…)'],
  ['ar07', 'A1', 'خانه و وسایل خانه', 'Rooms, furniture, appliances, describing your home', 'في / ما في (there is / there isn\'t)'],
  ['ar08', 'A1', 'غذا، رستوران و سفارش دادن', 'Food, drinks, Omani dishes, ordering in a restaurant and café', 'أبا/أبغى (I want), polite requests'],
  ['ar09', 'A1', 'خرید و بازار', 'Shopping, sizes, colours, souq, supermarket, bargaining', 'adjective agreement (masc./fem.), colours'],
  ['ar10', 'A1', 'شهر، آدرس و جهت‌ها', 'Places in the city, asking and giving directions', 'imperatives (روح، لف، يمين/يسار)'],
  ['ar11', 'A1', 'حمل‌ونقل و تاکسی', 'Taxi, bus, car, airport basics, renting a car', 'present tense basics (أروح، أبا أروح)'],
  ['ar12', 'A1', 'کارهای روزانه', 'Daily routine from morning to night', 'present tense conjugation of common verbs'],
  ['ar13', 'A1', 'آب‌وهوا و فصل‌ها', 'Weather in Oman and the Gulf, seasons, heat, khareef in Salalah', 'adjectives and comparatives (أحر، أبرد)'],
  ['ar14', 'A1', 'بدن و سلامتی', 'Body parts, illness, pharmacy, doctor visit', 'يعورني (it hurts me), need/have to'],
  ['ar15', 'A1', 'گذشته: دیروز چه کردی؟', 'Talking about yesterday and the weekend', 'past tense of regular verbs'],
  // سطح ۲ — پیش‌متوسط (A2)
  ['ar16', 'A2', 'کار و محل کار', 'Jobs, office, colleagues, meetings, working hours in Oman', 'future with بـ / راح; negation ما / مب'],
  ['ar17', 'A2', 'مصاحبهٔ کاری و رزومه', 'Job interview questions and answers, describing experience', 'past vs present, اشتغلت…'],
  ['ar18', 'A2', 'بانک، اداره و کارهای اداری', 'Bank, residence card, visa office, ministry, filling forms', 'polite formal requests (لو سمحت، ممكن…)'],
  ['ar19', 'A2', 'تلفن، پیام و شبکه‌های اجتماعی', 'Phone calls, WhatsApp voice messages, appointments', 'common phone phrases, وين؟ شو؟ ليش؟'],
  ['ar20', 'A2', 'مسکن و اجارهٔ خانه', 'Renting a flat, contract, landlord, problems at home', 'conditional basics (إذا…)'],
  ['ar21', 'A2', 'سفر و هتل', 'Hotel check-in, complaints, tourist places in Oman', 'requests and complaints'],
  ['ar22', 'A2', 'تفریح و سرگرمی', 'Hobbies, sport, the beach, wadis, weekend plans', 'like/love (يعجبني، أحب)'],
  ['ar23', 'A2', 'فرهنگ و آداب عمانی', 'Hospitality, coffee (قهوة) and dates, majlis, greetings etiquette, Ramadan and Eid', 'cultural expressions (ما شاء الله، إن شاء الله، الله يعطيك العافية)'],
  ['ar24', 'A2', 'احساسات و نظر دادن', 'Feelings, agreeing and disagreeing politely', 'أحس، أظن، يمكن'],
  // سطح ۳ — متوسط (B1)
  ['ar25', 'B1', 'تعریف کردن داستان و خاطره', 'Telling stories and past experiences', 'past continuous (كنت…) and time connectors'],
  ['ar26', 'B1', 'مذاکره و تجارت', 'Business negotiation, prices, contracts, suppliers', 'conditionals and polite persuasion'],
  ['ar27', 'B1', 'تجارت آزاد، گمرک و حمل بار', 'Free zones, customs clearance, shipping, logistics vocabulary', 'formal requests and MSA terms in business'],
  ['ar28', 'B1', 'اخبار و رسانه', 'Understanding news headlines and TV (MSA vs dialect)', 'passive in MSA, news vocabulary'],
  ['ar29', 'B1', 'مشکل‌ها و شکایت', 'Problems, complaints, solving issues with services', 'should/must (لازم، المفروض)'],
  ['ar30', 'B1', 'پزشک و بیمارستان (پیشرفته)', 'Hospital, insurance, describing symptoms in detail', 'detailed description, since/for'],
  ['ar31', 'B1', 'آموزش و دانشگاه', 'School, university, courses, exams', 'comparatives and superlatives'],
  ['ar32', 'B1', 'دین و مناسبت‌ها', 'Religious and national occasions, condolences and congratulations', 'fixed expressions for occasions'],
  // سطح ۴ — متوسط بالا (B2)
  ['ar33', 'B2', 'بحث و استدلال', 'Discussing opinions, pros and cons, debates', 'connectors (لكن، بالرغم، لأن، عشان)'],
  ['ar34', 'B2', 'اصطلاحات و ضرب‌المثل‌های خلیجی', 'Gulf idioms, proverbs and slang natives use', 'idiomatic language'],
  ['ar35', 'B2', 'نامه و ایمیل رسمی', 'Writing formal emails and letters in MSA', 'formal written Arabic (فصحى)'],
  ['ar36', 'B2', 'تفاوت لهجه‌ها', 'Omani vs Emirati vs Saudi vs Egyptian vs Levantine: the same sentences in each', 'dialect comparison'],
  ['ar37', 'B2', 'کار حرفه‌ای و جلسه', 'Leading meetings, presentations, giving feedback at work', 'formal register'],
  // سطح ۵ — پیشرفته (C1)
  ['ar38', 'C1', 'قرآن، شعر و ادبیات (آشنایی)', 'Reading classical texts, famous verses and poems, understanding MSA grammar', 'i\'rab basics, verb forms (الأوزان)'],
  ['ar39', 'C1', 'زبان حقوقی و قراردادها', 'Contracts, legal terms, labour law vocabulary in Oman', 'legal MSA'],
  ['ar40', 'C1', 'روان صحبت کردن مثل یک بومی', 'Fluency: fillers, humour, fast speech, mixing MSA and dialect naturally', 'native-like discourse']];


const DE_UNITS = [
  ['de01', 'A1', 'الفبا، تلفظ و صداهای آلمانی', 'German alphabet and the sounds Persians find hard: ü, ö, ä, ch (ich/ach), r, z, sch, ei/ie, eu; word stress', 'pronunciation rules'],
  ['de02', 'A1', 'سلام، معرفی و خداحافظی', 'Greetings at every time of day, introducing yourself, du vs Sie', 'sein and heißen; personal pronouns'],
  ['de03', 'A1', 'اعداد، قیمت و ساعت', 'Numbers (21 = einundzwanzig), prices in euro, telling the time', 'numbers; Wie viel? Wie spät?'],
  ['de04', 'A1', 'خانواده', 'All family members and relatives', 'possessive articles; der/die/das'],
  ['de05', 'A1', 'خانه و آپارتمان', 'Rooms, furniture, flat hunting (WG, Kaltmiete/Warmmiete)', 'Nominativ vs Akkusativ; es gibt'],
  ['de06', 'A1', 'غذا، خرید و سوپرمارکت', 'Food, shopping, bakery, ordering in a café', 'möchten, mögen; plurals'],
  ['de07', 'A1', 'کارهای روزانه و زمان', 'Daily routine, weekdays, appointments', 'separable verbs; verb-second word order'],
  ['de08', 'A1', 'شهر، آدرس و حمل‌ونقل', 'City, directions, U-Bahn/S-Bahn, Deutsche Bahn tickets', 'Dativ prepositions'],
  ['de09', 'A1', 'بدن، سلامتی و دکتر', 'Body, illness, Hausarzt, pharmacy, Krankenkasse', 'modal verbs'],
  ['de10', 'A1', 'گذشته: آخر هفته چه کردی؟', 'Talking about the past', 'Perfekt with haben/sein'],
  ['de11', 'A2', 'لباس و خرید', 'Clothes, sizes, returns', 'adjective endings (basic)'],
  ['de12', 'A2', 'کار و محل کار', 'Jobs, workplace, colleagues, work emails', 'weil/dass/wenn (verb at the end)'],
  ['de13', 'A2', 'مصاحبهٔ کاری و رزومه', 'Bewerbung, Lebenslauf, job interview', 'Präteritum of sein/haben/modals'],
  ['de14', 'A2', 'اداره‌ها: Anmeldung، اقامت، بانک', 'German bureaucracy: registration, residence permit, bank account, forms', 'polite requests (Könnten Sie…)'],
  ['de15', 'A2', 'سفر، هتل و تعطیلات', 'Travel, hotel, holidays, complaints', 'Wechselpräpositionen'],
  ['de16', 'A2', 'آب‌وهوا و طبیعت', 'Weather, seasons, outdoor activities', 'comparative and superlative'],
  ['de17', 'A2', 'تفریح، ورزش و دعوت', 'Hobbies, Verein, sport, invitations', 'reflexive verbs'],
  ['de18', 'A2', 'فرهنگ آلمانی و جشن‌ها', 'Weihnachten, Ostern, Oktoberfest, Pünktlichkeit, Mülltrennung, Sonntagsruhe', 'Genitiv basics'],
  ['de19', 'B1', 'تعریف تجربه و داستان', 'Telling stories and experiences', 'Präteritum vs Perfekt; als/wenn'],
  ['de20', 'B1', 'نظر دادن و بحث', 'Opinions, agreeing and disagreeing politely', 'Konjunktiv II'],
  ['de21', 'B1', 'رسانه، اخبار و فناوری', 'News, internet, social media', 'passive voice'],
  ['de22', 'B1', 'تحصیل و دانشگاه در آلمان', 'Studium, Uni, Prüfungen', 'relative clauses'],
  ['de23', 'B1', 'مسکن، اجاره و همسایه', 'Renting, contracts, Hausordnung', 'zu + infinitive, um…zu'],
  ['de24', 'B1', 'کار حرفه‌ای و جلسه', 'Meetings, presentations, phone calls at work', 'indirect questions'],
  ['de25', 'B1', 'آمادگی آزمون B1 (Goethe/telc)', 'Exam strategies for all four skills', 'exam phrases'],
  ['de26', 'B2', 'زبان محاوره و اصطلاحات', 'Colloquial German, idioms and slang', 'modal particles (doch, mal, ja, eben)'],
  ['de27', 'B2', 'نامه و ایمیل رسمی', 'Formal letters, complaints, applications', 'nominal style'],
  ['de28', 'B2', 'اقتصاد، تجارت و مذاکره', 'Business, trade, negotiation, contracts', 'Konjunktiv I'],
  ['de29', 'B2', 'جامعه و محیط زیست', 'Society, environment, politics vocabulary', 'connectors (obwohl, trotzdem)'],
  ['de30', 'B2', 'آلمانیِ آلمان، اتریش و سوئیس', 'Regional differences and dialects', 'regional vocabulary'],
  ['de31', 'C1', 'زبان آکادمیک', 'Lectures, papers, presentations', 'extended participle constructions'],
  ['de32', 'C1', 'زبان حقوقی و اداری', 'Legal and administrative German', 'Funktionsverbgefüge'],
  ['de33', 'C1', 'روان حرف زدن مثل بومی', 'Fluency, fillers, natural fast speech', 'native-like discourse']];
const TR_UNITS = [
  ['tr01', 'A1', 'الفبا و تلفظ ترکی', 'Turkish alphabet and sounds: ı, ö, ü, ç, ş, ğ; vowel harmony as the key of Turkish', 'vowel harmony'],
  ['tr02', 'A1', 'سلام، احوال‌پرسی و معرفی', 'Merhaba, Nasılsın, Memnun oldum; sen vs siz', 'personal suffixes (-ım, -sın…)'],
  ['tr03', 'A1', 'اعداد، پول و قیمت', 'Numbers, lira, prices, bargaining in the bazaar', 'kaç? ne kadar?'],
  ['tr04', 'A1', 'خانواده', 'Family members (anne, baba, abla, ağabey, teyze, hala, amca, dayı…)', 'possessive suffixes'],
  ['tr05', 'A1', 'خانه و محله', 'House, rooms, neighbourhood', 'var / yok; locative -de/-da'],
  ['tr06', 'A1', 'غذا، رستوران و چای', 'Turkish food, ordering, tea and coffee culture', 'istiyorum; -ı accusative'],
  ['tr07', 'A1', 'خرید و بازار', 'Shopping, sizes, colours, Grand Bazaar', 'plural -ler/-lar; bu/şu/o'],
  ['tr08', 'A1', 'شهر، آدرس و حمل‌ونقل', 'Directions, taxi, metro, dolmuş, ferry (vapur)', 'dative -e/-a, ablative -den/-dan'],
  ['tr09', 'A1', 'کارهای روزانه', 'Daily routine and time', 'present continuous -iyor'],
  ['tr10', 'A1', 'گذشته: دیروز چه کردی؟', 'Talking about yesterday', 'past tense -di'],
  ['tr11', 'A2', 'کار و محل کار', 'Jobs, office, colleagues', 'aorist (geniş zaman) -ir/-ar'],
  ['tr12', 'A2', 'مصاحبهٔ کاری', 'Job interview, CV, experience', 'future -ecek/-acak'],
  ['tr13', 'A2', 'اداره، اقامت و بانک', 'Residence permit (ikamet), bank, e-Devlet, forms', 'polite requests (-ebilir miyim?)'],
  ['tr14', 'A2', 'سلامتی و دکتر', 'Hospital, pharmacy, symptoms', 'ağrıyor; -meli (must)'],
  ['tr15', 'A2', 'سفر و هتل', 'Travel in Turkey, hotel, tickets', 'ability -ebil'],
  ['tr16', 'A2', 'فرهنگ ترکی و تعارف', 'Hospitality, Bayram, everyday courtesy phrases (Kolay gelsin, Afiyet olsun, Geçmiş olsun)', 'fixed expressions'],
  ['tr17', 'A2', 'آب‌وهوا و فصل‌ها', 'Weather and seasons', 'comparison daha/en'],
  ['tr18', 'B1', 'تجارت و خرید عمده', 'Trade with Turkish suppliers, prices, samples, shipping', 'conditional -se/-sa'],
  ['tr19', 'B1', 'تعریف داستان و تجربه', 'Telling stories', 'reported past -miş'],
  ['tr20', 'B1', 'نظر دادن و بحث', 'Opinions and discussion', 'bence, sanırım; ki'],
  ['tr21', 'B1', 'اخبار و رسانه', 'News, TV series vocabulary', 'participles -en/-an, -dik'],
  ['tr22', 'B1', 'مسکن و اجاره', 'Renting, contracts, neighbours', 'causative'],
  ['tr23', 'B2', 'اصطلاحات و ضرب‌المثل‌ها', 'Idioms, proverbs and slang', 'idiomatic language'],
  ['tr24', 'B2', 'نامه و ایمیل رسمی', 'Formal Turkish writing', 'formal register'],
  ['tr25', 'B2', 'مذاکره و قرارداد', 'Business negotiation and contracts', 'complex sentences'],
  ['tr26', 'B2', 'شباهت‌ها و تفاوت‌های ترکی و فارسی', 'Shared words (and false friends) between Turkish and Persian', 'word origins'],
  ['tr27', 'C1', 'ادبیات و سریال‌های ترکی', 'Literature, poetry, TV series language', 'stylistic variation'],
  ['tr28', 'C1', 'روان حرف زدن مثل بومی', 'Fluency, fillers (yani, şey, hani), fast speech', 'native-like discourse']];
const ZH_UNITS = [
  ['zh01', 'A1', 'پین‌یین و چهار لحن', 'Pinyin initials and finals, the four tones + neutral tone, tone changes', 'tones'],
  ['zh02', 'A1', 'سلام، معرفی و تشکر', '你好, 谢谢, 不客气, 对不起, 再见; introducing yourself', '是; 我叫…'],
  ['zh03', 'A1', 'اعداد، پول و قیمت', 'Numbers, money (块/元), prices, bargaining', '多少钱?; 几 vs 多少'],
  ['zh04', 'A1', 'خانواده', 'Family members and relatives', '有/没有; measure words 个/口'],
  ['zh05', 'A1', 'زمان، روزها و تاریخ', 'Time, days, dates', 'time word order'],
  ['zh06', 'A1', 'غذا و رستوران', 'Dishes, ordering, chopsticks etiquette', '要, 想, 喜欢'],
  ['zh07', 'A1', 'خرید', 'Shopping, colours, sizes, WeChat Pay/Alipay', 'adjectives with 很; 太…了'],
  ['zh08', 'A1', 'شهر، آدرس و حمل‌ونقل', 'Directions, taxi, metro, DiDi', '在; 往…走'],
  ['zh09', 'A1', 'کارهای روزانه', 'Daily routine', '了 (completed action)'],
  ['zh10', 'A1', 'حروف و ریشه‌ها', 'How characters are built from radicals; the 50 most useful characters', 'radicals as memory tricks'],
  ['zh11', 'A2', 'کار و محل کار', 'Jobs, office, colleagues', '在 + verb; 会/能/可以'],
  ['zh12', 'A2', 'سلامتی و دکتر', 'Body, illness, hospital', '疼; complement 得'],
  ['zh13', 'A2', 'سفر و هتل', 'Travel, hotel, high-speed train', '过; 比'],
  ['zh14', 'A2', 'فرهنگ چینی و جشن‌ها', 'Spring Festival, red envelopes, face (面子), etiquette', 'cultural expressions'],
  ['zh15', 'A2', 'تلفن و WeChat', 'Phone, messages, internet slang', 'question particles 吗/呢'],
  ['zh16', 'B1', 'تجارت و مذاکره با چینی‌ها', 'Business with Chinese suppliers, samples, MOQ, shipping, Canton Fair', '把 sentences'],
  ['zh17', 'B1', 'واردات، گمرک و حمل', 'Import/export, customs, factory visits', '被 passive; result complements'],
  ['zh18', 'B1', 'تعریف تجربه و داستان', 'Telling stories', 'time clauses'],
  ['zh19', 'B1', 'نظر دادن و بحث', 'Opinions', '虽然…但是; 因为…所以'],
  ['zh20', 'B1', 'آمادگی HSK 3-4', 'Exam strategies and key words', 'HSK structures'],
  ['zh21', 'B2', 'اصطلاحات و چِنگ‌یو', 'Common idioms (成语) and slang', 'four-character idioms'],
  ['zh22', 'B2', 'اخبار و رسانه', 'News, technology, society', 'formal written words'],
  ['zh23', 'B2', 'ایمیل و نامهٔ رسمی', 'Formal emails and documents', 'written register'],
  ['zh24', 'C1', 'زبان تخصصی تجارت و حقوق', 'Contracts, legal and trade language', 'formal structures'],
  ['zh25', 'C1', 'روان حرف زدن مثل بومی', 'Fluency, fillers (那个, 就是), humour', 'native-like discourse']];
const OFFLINE_DIR = { 'ar-OM': 'ar/om', 'de-DE': 'de/de', 'tr-TR': 'tr/tr', 'zh-CN': 'zh/cn' }; // درس‌های آمادهٔ آفلاین برای هر زبان/لهجه
const COURSES = { ar: AR_UNITS, de: DE_UNITS, tr: TR_UNITS, zh: ZH_UNITS };
const curUnits = () => COURSES[tl()] || [];
const curIdx = () => Math.max(0, Math.min(curUnits().length - 1, +((U.cIdx || {})[tl()] ?? (tl() === 'ar' ? U.arIdx : 0) ?? 0) || 0));

/* ───── صفحه‌های دورهٔ عربی (مثل کتاب): فهرست درس‌ها و صفحهٔ هر درس با صدای آفلاین عمانی ───── */
const arPlanGet = async A => { const pid = `${tl()}:${A[0]}:${tlDia()[2]}`; const P0 = (U.customPlans || {})[pid]; if (P0) return P0;
  if (OFFLINE_DIR[tlDia()[2]]) { try { const r = await fetch(`lessons/${OFFLINE_DIR[tlDia()[2]]}/${A[0]}.json`); if (r.ok) { const P = { ...(await r.json()), want: A[2], d: isoDay(), offline: 1 }; (U.customPlans = U.customPlans || {})[pid] = P; saveU(); return P; } } catch { } }
  return null; };
routes.arc = () => {
  if (tl() === 'en') return go('path'); setTop(`دورهٔ ${tlFa()}`, true); const cur = curIdx(); const done = (U.arDone || {});
  view().innerHTML = `<div class="stack"><div class="card stack"><b>${tlInfo().flag} دورهٔ کامل ${esc(tlFa())} — از پایه تا پیشرفته</b><span class="small muted">${faNum(curUnits().length)} درس؛ هر درس: همهٔ واژه‌ها، افعال، جمله‌های کاربردی، اصطلاحات محاوره‌ای، گرامر و مکالمه — با تلفظ به خط فارسی و صدای بومی. معلم زنده هر درس را کامل درس می‌دهد.</span></div>
  ${['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].filter(lv => curUnits().some(a => a[1] === lv)).map(lv => `<div class="sec">سطح ${lv}</div><div class="stack" style="gap:6px">${curUnits().map((a, i) => a[1] !== lv ? '' : `<a class="card row ar-u${i === cur ? ' cur' : ''}" href="#aru/${a[0]}"><span class="pill">${faNum(i + 1)}</span><span class="grow"><b>${esc(a[2])}</b><br><span class="tiny muted">${esc(a[4])}</span></span>${done[a[0]] ? '✓' : i === cur ? '▶' : ''}</a>`).join('')}</div>`).join('')}</div>`;
};
routes.aru = async id => {
  const i = curUnits().findIndex(a => a[0] === id); if (i < 0) return go('arc'); const A = curUnits()[i];
  setTop(A[2], true); const v = view(); v.innerHTML = loading('درس را باز می‌کنم…'); const g0 = routeGen;
  let P = await arPlanGet(A);
  if (!P) { if (needAI(v)) return; v.innerHTML = loading('در حال طراحی کامل این درس (واژه‌ها، افعال، جمله‌ها، اصطلاحات)…'); try { await makeCustomPlan(`درس ${faNum(i + 1)} دورهٔ ${tlInfo().fa} (${A[1]}): ${A[2]} — ${A[3]}. Grammar focus: ${A[4]}`, `${tl()}:${A[0]}:${tlDia()[2]}`); P = await arPlanGet(A); } catch (e) { if (g0 === routeGen) aiErr(e); return; } }
  if (g0 !== routeGen || !P) return;
  const row = x => { const s = String(x); const ar = arCore(s); const rest = s.slice(s.indexOf(ar) + ar.length).replace(/^\s*[=—–-]\s*/, ''); return `<div class="ar-row"><button class="spk" data-ar="${esc(ar)}">🔊</button><span class="ar-t" dir="rtl" lang="ar">${esc(ar)}</span><span class="small">${esc(rest)}</span></div>`; };
  const sec = (t, arr) => arr?.length ? `<div class="card stack"><b>${t}</b>${arr.map(row).join('')}</div>` : '';
  v.innerHTML = `<div class="stack">
  <div class="card stack"><b>درس ${faNum(i + 1)} · سطح ${A[1]} · ${esc(P.title_fa || A[2])}</b><span class="small">${esc(P.goal || '')}</span><span class="small muted">${esc(P.intro || '')}</span>
    <button class="btn wide tlive-btn" id="arlive">🎓 معلم زنده این درس را کامل درس بدهد</button><a class="btn line sm" href="#story/${esc(A[0])}">🎧 داستان صوتی این درس</a><a class="btn line sm" href="#wb/${esc(A[0])}">📘 کتاب تمرین این درس</a><button class="btn line sm" id="ardl">⬇ دانلود صدای آفلاین این درس</button></div>
  ${(P.bank || []).map(g => sec('📚 ' + esc(g.g), g.items)).join('')}
  ${sec('🔤 افعال کاربردی', P.verbs)}${sec('💬 جمله‌های آماده', P.sentences)}${sec('😎 اصطلاحات محاوره‌ای', P.colloquial)}${sec('🎭 مکالمهٔ نمونه', (P.dialogue || []).map(l => String(l).replace(/^\s*[AB]\s*[:：]\s*/, '')))}
  ${P.grammar?.point ? `<div class="card stack"><b>📐 گرامر: ${esc(P.grammar.point)}</b><span class="small">${esc(P.grammar.rule || '')}</span>${(P.grammar.examples || []).map(row).join('')}</div>` : ''}
  ${P.mistakes?.length ? `<div class="card stack"><b>⚠️ اشتباه‌های رایج فارسی‌زبان‌ها</b>${P.mistakes.map(m => `<span class="small">• ${esc(m)}</span>`).join('')}</div>` : ''}
  <div class="row"><button class="btn" id="ardone">✓ این درس را یاد گرفتم</button>${i + 1 < curUnits().length ? `<a class="btn line" href="#aru/${curUnits()[i + 1][0]}">درس بعد ←</a>` : ''}</div></div>`;
  v.onclick = e => { const b = e.target.closest('[data-ar]'); if (b) say(b.dataset.ar, 'en', 'calm', b); };
  $('#arlive').onclick = () => { U.cIdx = U.cIdx || {}; U.cIdx[tl()] = i; saveU(); teachThis({ custom: `${tl()}:${A[0]}:${tlDia()[2]}` }, P.title_fa || A[2]); };
  $('#ardone').onclick = () => { (U.arDone = U.arDone || {})[A[0]] = isoDay(); U.cIdx = U.cIdx || {}; U.cIdx[tl()] = Math.min(curUnits().length - 1, i + 1); addXP(20); saveU(); toast('آفرین! درس بعد باز شد 🎉'); go('arc'); };
  $('#ardl').onclick = async () => { const b = $('#ardl'); const dir = OFFLINE_DIR[tlDia()[2]]; const ix = dir ? await fetch(`audio/${dir}/index.json`).then(r => r.json()).catch(() => null) : null; const L = ix?.[A[0]] || []; if (!L.length) return toast('صدای آفلاین این درس هنوز آماده نیست.');
    const c = await caches.open('zd-media'); let n = 0; for (const h of L) { const u = `audio/${dir}/${h}.mp3`; if (!(await c.match(u))) { try { const r = await fetch(u); if (r.ok) await c.put(u, r); } catch { return toast('اینترنت قطع شد؛ دوباره بزن.'); } } b.textContent = `⬇ ${faNum(++n)}/${faNum(L.length)}`; } b.textContent = '✓ صدای این درس آفلاین ذخیره شد'; };
};
const _pathR = routes.path; routes.path = () => { if (tl() !== 'en') return routes.arc(); return _pathR(); };
