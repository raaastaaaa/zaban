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

const COURSES = { ar: AR_UNITS };
const curUnits = () => COURSES[tl()] || [];
const curIdx = () => Math.max(0, Math.min(curUnits().length - 1, +((U.cIdx || {})[tl()] ?? (tl() === 'ar' ? U.arIdx : 0) ?? 0) || 0));
