/* زبان رستا — دورهٔ کامل گرامر (همهٔ زمان‌ها و مباحث تا سطح متوسط) و بانک افعال کاربردی دسته‌بندی‌شده */
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
draw|drew|drawn|کشیدن (طراحی) / نقاشی کردن|سرگرمی|Draw a picture.
dance|danced|danced|رقصیدن|سرگرمی|They danced all night.`;
const regPast = b => /e$/.test(b) ? [b + 'd'] : /[^aeiou]y$/.test(b) ? [b.slice(0, -1) + 'ied'] : [b + 'ed', b + b.slice(-1) + 'ed', b + 'ked'];
const VERBS = VERBS_RAW.split('\n').map(l => { const [v, past, pp, fa, cat, ex] = l.split('|'); const base = v.split(' ')[0], first = s => s.split(/[\s\/(]/)[0];
  const reg = regPast(base).includes(first(past)) && regPast(base).includes(first(pp)); return { v, past, pp, fa, cat, ex, irr: !reg }; });
const VEX_FA = {"be": "من دانشجو هستم.", "have": "من دو تا برادر دارم.", "do": "شغلت چیه؟ (چه کاره‌ای؟)", "make": "یه کیک درست کردم.", "get": "ساعت شش می‌رسم خونه.", "take": "چترت رو بردار.", "give": "کتاب رو بده به من، لطفاً.", "put": "بذارش روی میز.", "try": "دوباره امتحان کن.", "use": "می‌تونم از گوشیت استفاده کنم؟", "find": "گوشیم رو پیدا نمی‌کنم.", "lose": "کیف پولم رو گم کردم.", "keep": "بقیه‌اش مال خودتون (باقی پول رو نگه دارید).", "begin": "کلاس ساعت نه شروع می‌شه.", "finish": "کارم رو تموم کردم.", "open": "پنجره رو باز کن، لطفاً.", "close": "در رو ببند.", "wait": "منتظرم بمون.", "become": "اون دکتر شد.", "break": "گوشیم رو شکستم.", "grow": "من توی تهران بزرگ شدم.", "hold": "دستم رو بگیر.", "let": "بذار کمکت کنم.", "change": "نظرم عوض شد.", "throw": "توپ رو برام پرت کن.", "give up": "تسلیم نشو! (ول نکن!)", "say": "اون سلام کرد.", "tell": "یه داستان برام تعریف کن.", "speak": "انگلیسی بلدی؟ (انگلیسی صحبت می‌کنی؟)", "talk": "بیا درباره‌اش حرف بزنیم.", "ask": "می‌تونم یه سؤال بپرسم؟", "answer": "لطفاً تلفن رو جواب بده.", "call": "بعداً بهت زنگ می‌زنم.", "write": "اسمت رو اینجا بنویس.", "read": "هر روز اخبار رو می‌خونم.", "listen": "لطفاً به حرفم گوش کن.", "send": "یه پیام برام بفرست.", "meet": "از آشناییت خوشحالم.", "help": "می‌تونی کمکم کنی؟", "mean": "منظورت چیه؟", "show": "بلیتت رو نشونم بده.", "explain": "می‌تونی دوباره توضیحش بدی؟", "see": "دیروز دیدمش.", "look": "به این عکس نگاه کن.", "watch": "یه فیلم دیدیم.", "hear": "صدات رو نمی‌شنوم.", "look for": "دنبال کلیدهام می‌گردم.", "think": "فکر می‌کنم حق با توئه.", "know": "جواب رو می‌دونم.", "understand": "متوجه نمی‌شم.", "remember": "اسمت یادمه.", "forget": "کلیدهات یادت نره.", "learn": "دارم انگلیسی یاد می‌گیرم.", "study": "اون پزشکی می‌خونه.", "choose": "یکی رو انتخاب کن.", "decide": "تصمیم گرفتم بمونم.", "find out": "حقیقت رو فهمیدم.", "feel": "احساس خستگی می‌کنم. (خسته‌ام)", "want": "یه قهوه می‌خوام.", "need": "کمک لازم دارم.", "like": "از این آهنگ خوشم میاد.", "love": "خانواده‌ام رو دوست دارم.", "hate": "از منتظر موندن متنفرم.", "hope": "امیدوارم حالت خوب باشه.", "go": "رفتیم کنار دریا.", "come": "بیا اینجا، لطفاً.", "leave": "کیفم رو توی تاکسی جا گذاشتم.", "bring": "پاسپورتت رو بیار.", "drive": "با ماشین رفت سر کار.", "ride": "با دوچرخه رفتم مدرسه.", "run": "هر روز صبح می‌دوه.", "walk": "بیا پیاده بریم خونه.", "sit": "لطفاً بنشینید.", "stand": "لطفاً بلند شید.", "fall": "از پله‌ها افتاد.", "catch": "به اتوبوس رسیدم (اتوبوس رو گرفتم).", "move": "به یه آپارتمان جدید اسباب‌کشی کردیم.", "pick up": "ساعت هفت میام دنبالت.", "eat": "ساعت هشت شام خوردیم.", "drink": "یه کم آب بخور.", "sleep": "خوب خوابیدم.", "wake up": "زود بیدار شدم.", "get up": "ساعت هفت از خواب پا می‌شم.", "wear": "یه لباس قرمز پوشیده بود.", "live": "توی یه آپارتمان کوچیک زندگی می‌کنم.", "cook": "شام درست کردم.", "clean": "اتاقت رو تمیز کن.", "cut": "نون رو ببُر، لطفاً.", "wash": "دست‌هات رو بشور.", "turn on": "چراغ رو روشن کن.", "turn off": "گوشیت رو خاموش کن.", "rent": "یه ماشین اجاره کردیم.", "buy": "کفش نو خریدم.", "sell": "میوهٔ تازه می‌فروشن.", "pay": "می‌تونم با کارت حساب کنم؟", "cost": "قیمتش چنده؟", "spend": "خیلی پول خرج کردم.", "lend": "می‌تونی یه کم پول بهم قرض بدی؟", "borrow": "می‌تونم خودکارت رو قرض بگیرم؟", "order": "یه پیتزا سفارش دادم.", "try on": "می‌تونم این کاپشن رو پرو کنم؟", "travel": "عاشق سفر کردنم.", "fly": "با هواپیما رفتیم دبی.", "arrive": "قطار دیر رسید.", "stay": "توی هتل موندیم.", "book": "یه میز دونفره رزرو کردم.", "check in": "ظهر پذیرش (چک‌این) شدیم.", "work": "توی یه دفتر کار می‌کنم.", "teach": "اون انگلیسی درس می‌ده.", "build": "یه مدرسهٔ جدید ساختن.", "fill in": "این فرم رو پر کنید، لطفاً.", "apply": "برای اون کار درخواست دادم.", "earn": "حقوق خوبی درمیاره.", "play": "بیا فوتبال بازی کنیم.", "sing": "خیلی قشنگ آواز می‌خونه.", "swim": "شنا بلدی؟", "win": "مسابقه رو بردیم.", "draw": "یه نقاشی بکش.", "dance": "تمام شب رقصیدن."};
VERBS.forEach(x => x.exFa = VEX_FA[x.v] || '');
/* موضوع‌های موقعیتی پیش‌فرض (فرودگاه، تاکسی، مرتب کردن خانه…) */
const VTOPIC_RAW = "book a ticket|booked|booked|بلیت رزرو کردن|✈️ فرودگاه و پرواز|I booked a ticket to Istanbul.|یه بلیت برای استانبول رزرو کردم.\npack (a suitcase)|packed|packed|چمدون بستن|✈️ فرودگاه و پرواز|I packed my suitcase last night.|دیشب چمدونم رو بستم.\ncheck in|checked in|checked in|پذیرش پرواز گرفتن (چک‌این کردن)|✈️ فرودگاه و پرواز|We need to check in two hours early.|باید دو ساعت زودتر چک‌این کنیم.\ncheck (a bag)|checked|checked|بار تحویل دادن|✈️ فرودگاه و پرواز|I want to check this bag.|می‌خوام این چمدون رو تحویل بدم (بار کنم).\npay for extra baggage|paid|paid|پول اضافه‌بار دادن|✈️ فرودگاه و پرواز|I had to pay for extra baggage.|مجبور شدم پول اضافه‌بار بدم.\ngo through security|went|gone|از بازرسی امنیتی رد شدن|✈️ فرودگاه و پرواز|We went through security quickly.|سریع از بازرسی رد شدیم.\nboard (the plane)|boarded|boarded|سوار هواپیما شدن|✈️ فرودگاه و پرواز|Passengers are now boarding.|مسافرها الان دارن سوار می‌شن.\nget on (the plane)|got on|got on|سوار شدن (هواپیما، اتوبوس، قطار)|✈️ فرودگاه و پرواز|We got on the plane at nine.|ساعت نه سوار هواپیما شدیم.\ntake off|took off|taken off|بلند شدن هواپیما|✈️ فرودگاه و پرواز|The plane took off on time.|هواپیما سر وقت بلند شد.\nland|landed|landed|فرود اومدن|✈️ فرودگاه و پرواز|We landed in Dubai at midnight.|نصف‌شب توی دبی فرود اومدیم.\nget off (the plane)|got off|got off|پیاده شدن (هواپیما، اتوبوس، قطار)|✈️ فرودگاه و پرواز|Please wait until the seatbelt sign is off before you get off.|لطفاً تا خاموش شدن علامت کمربند صبر کنید، بعد پیاده شید.\npick up (luggage)|picked up|picked up|بار رو تحویل گرفتن|✈️ فرودگاه و پرواز|Where do I pick up my luggage?|بارم رو کجا تحویل بگیرم؟\nmiss (a flight)|missed|missed|از پرواز جا موندن|✈️ فرودگاه و پرواز|Hurry up, or we'll miss our flight!|عجله کن وگرنه از پرواز جا می‌مونیم!\ntake a taxi|took|taken|تاکسی گرفتن|🚕 تاکسی و رفت‌وآمد|Let's take a taxi to the hotel.|بیا تا هتل تاکسی بگیریم.\ncall a taxi|called|called|تاکسی خبر کردن|🚕 تاکسی و رفت‌وآمد|Can you call a taxi for me?|می‌تونی برام یه تاکسی خبر کنی؟\nget in (a taxi/car)|got in|got in|سوار ماشین/تاکسی شدن|🚕 تاکسی و رفت‌وآمد|Get in, I'll drive you home.|سوار شو، می‌رسونمت خونه.\nget out of (a taxi/car)|got out|got out|از ماشین/تاکسی پیاده شدن|🚕 تاکسی و رفت‌وآمد|She got out of the taxi at the corner.|سر نبش از تاکسی پیاده شد.\ndrop off|dropped off|dropped off|رسوندن و پیاده کردن کسی|🚕 تاکسی و رفت‌وآمد|Can you drop me off here?|می‌شه منو همین‌جا پیاده کنی؟\npull over|pulled over|pulled over|کنار زدن (ماشین رو نگه داشتن)|🚕 تاکسی و رفت‌وآمد|Please pull over by the bank.|لطفاً کنار بانک نگه دارید.\ntake (a bus/train)|took|taken|با اتوبوس/قطار رفتن|🚕 تاکسی و رفت‌وآمد|I take the bus to work.|با اتوبوس می‌رم سر کار.\nmiss (the bus)|missed|missed|به اتوبوس نرسیدن|🚕 تاکسی و رفت‌وآمد|I missed the bus this morning.|امروز صبح به اتوبوس نرسیدم.\nmake the bed|made|made|تخت رو مرتب کردن|🧹 مرتب کردن خانه و اتاق|I make my bed every morning.|هر روز صبح تختم رو مرتب می‌کنم.\ntidy up|tidied up|tidied up|مرتب کردن (اتاق، میز)|🧹 مرتب کردن خانه و اتاق|Tidy up your room before dinner.|قبل از شام اتاقت رو مرتب کن.\nput away|put away|put away|سر جاش گذاشتن|🧹 مرتب کردن خانه و اتاق|Put your clothes away, please.|لطفاً لباس‌هات رو بذار سر جاش.\nfold (clothes)|folded|folded|تا کردن (لباس)|🧹 مرتب کردن خانه و اتاق|I folded the laundry.|لباس‌های شسته رو تا کردم.\nhang up (clothes)|hung up|hung up|آویزون کردن (لباس)|🧹 مرتب کردن خانه و اتاق|Hang up your coat.|پالتوت رو آویزون کن.\nvacuum|vacuumed|vacuumed|جاروبرقی کشیدن|🧹 مرتب کردن خانه و اتاق|I vacuumed the living room.|هال رو جاروبرقی کشیدم.\nsweep|swept|swept|جارو کردن|🧹 مرتب کردن خانه و اتاق|Can you sweep the kitchen floor?|می‌تونی کف آشپزخونه رو جارو کنی؟\ndust|dusted|dusted|گردگیری کردن|🧹 مرتب کردن خانه و اتاق|I dust the shelves once a week.|هفته‌ای یه بار قفسه‌ها رو گردگیری می‌کنم.\nmop (the floor)|mopped|mopped|تی کشیدن|🧹 مرتب کردن خانه و اتاق|Don't walk here, I just mopped the floor.|از اینجا رد نشو، تازه تی کشیدم.\ntake out the trash|took out|taken out|آشغال‌ها رو بیرون بردن|🧹 مرتب کردن خانه و اتاق|It's your turn to take out the trash.|نوبت توئه که آشغال‌ها رو ببری بیرون.\ndo the laundry|did|done|لباس شستن|🧹 مرتب کردن خانه و اتاق|I do the laundry on Fridays.|جمعه‌ها لباس می‌شورم.\ndo the dishes|did|done|ظرف شستن|🧹 مرتب کردن خانه و اتاق|I'll do the dishes after dinner.|بعد از شام ظرف‌ها رو می‌شورم.\nthrow away|threw away|thrown away|دور انداختن|🧹 مرتب کردن خانه و اتاق|Throw away the old newspapers.|روزنامه‌های قدیمی رو دور بنداز.\nchop|chopped|chopped|خرد کردن|🍳 آشپزی|Chop the onions finely.|پیازها رو ریز خرد کن.\npeel|peeled|peeled|پوست کندن|🍳 آشپزی|Peel the potatoes.|سیب‌زمینی‌ها رو پوست بکَن.\nboil|boiled|boiled|جوشوندن / آب‌پز کردن|🍳 آشپزی|Boil the water first.|اول آب رو جوش بیار.\nfry|fried|fried|سرخ کردن|🍳 آشپزی|Fry the eggs in a little oil.|تخم‌مرغ‌ها رو با یه کم روغن سرخ کن.\nbake|baked|baked|توی فِر پختن|🍳 آشپزی|My mom baked a cake.|مامانم یه کیک پخت.\nstir|stirred|stirred|هم زدن|🍳 آشپزی|Stir the soup slowly.|سوپ رو آروم هم بزن.\nmix|mixed|mixed|مخلوط کردن|🍳 آشپزی|Mix the flour and the sugar.|آرد و شکر رو مخلوط کن.\nheat up|heated up|heated up|گرم کردن|🍳 آشپزی|I'll heat up the leftovers.|غذای مونده رو گرم می‌کنم.\nset the table|set|set|سفره/میز چیدن|🍳 آشپزی|Can you set the table?|میز رو می‌چینی؟\ntaste|tasted|tasted|مزه کردن / مزه دادن|🍳 آشپزی|Taste this, is it too salty?|اینو مزه کن، زیادی شوره؟\nbook a table|booked|booked|میز رزرو کردن|🍽️ رستوران و کافه|I booked a table for four.|یه میز برای چهار نفر رزرو کردم.\norder|ordered|ordered|سفارش دادن|🍽️ رستوران و کافه|Are you ready to order?|آماده‌اید سفارش بدید؟\nrecommend|recommended|recommended|پیشنهاد دادن|🍽️ رستوران و کافه|What do you recommend?|شما چی پیشنهاد می‌کنید؟\nask for the bill|asked|asked|صورت‌حساب خواستن|🍽️ رستوران و کافه|Let's ask for the bill.|بیا صورت‌حساب رو بخوایم.\nsplit the bill|split|split|دنگی حساب کردن|🍽️ رستوران و کافه|Shall we split the bill?|دنگی حساب کنیم؟\ntip|tipped|tipped|انعام دادن|🍽️ رستوران و کافه|We tipped the waiter.|به گارسون انعام دادیم.\ntake away|took away|taken away|بیرون‌بر گرفتن|🍽️ رستوران و کافه|Is it for here or to take away?|اینجا میل می‌کنید یا بیرون‌بر؟\ncheck in (hotel)|checked in|checked in|پذیرش هتل گرفتن|🏨 هتل|We checked in at three.|ساعت سه پذیرش گرفتیم.\ncheck out|checked out|checked out|تحویل اتاق و رفتن از هتل|🏨 هتل|We have to check out by noon.|باید تا ظهر اتاق رو تحویل بدیم.\nreserve (a room)|reserved|reserved|اتاق رزرو کردن|🏨 هتل|I reserved a double room.|یه اتاق دوتخته رزرو کردم.\nstay (at a hotel)|stayed|stayed|اقامت داشتن|🏨 هتل|We stayed there for three nights.|سه شب اونجا موندیم.\ncomplain|complained|complained|شکایت کردن|🏨 هتل|I complained about the noise.|به‌خاطر سروصدا شکایت کردم.\nmake an appointment|made|made|نوبت گرفتن|🏥 دکتر و درمان|I made an appointment with the dentist.|از دندون‌پزشک نوبت گرفتم.\nfeel sick|felt|felt|حال بد داشتن|🏥 دکتر و درمان|I feel sick today.|امروز حالم خوب نیست.\ntake (medicine)|took|taken|دارو خوردن|🏥 دکتر و درمان|Take this medicine twice a day.|این دارو رو روزی دو بار بخور.\nget better|got better|got (US: gotten) better|خوب شدن (بهتر شدن)|🏥 دکتر و درمان|I hope you get better soon.|امیدوارم زود خوب بشی.\nhurt|hurt|hurt|درد گرفتن / آسیب زدن|🏥 دکتر و درمان|My back hurts.|کمرم درد می‌کنه.\nopen an account|opened|opened|حساب باز کردن|🏦 بانک و پول|I want to open a bank account.|می‌خوام یه حساب بانکی باز کنم.\nwithdraw|withdrew|withdrawn|برداشت کردن (پول)|🏦 بانک و پول|I withdrew some cash.|یه کم پول نقد برداشت کردم.\ntransfer|transferred|transferred|انتقال دادن (پول)|🏦 بانک و پول|I transferred the money yesterday.|دیروز پول رو کارت‌به‌کارت (منتقل) کردم.\nsave (money)|saved|saved|پس‌انداز کردن|🏦 بانک و پول|I'm saving for a new car.|دارم برای یه ماشین جدید پس‌انداز می‌کنم.\ntry on|tried on|tried on|پرو کردن|🛍️ خرید لباس|Can I try this on?|می‌تونم اینو پرو کنم؟\nfit|fit (UK: fitted)|fit (UK: fitted)|اندازه بودن|🛍️ خرید لباس|These jeans don't fit me.|این شلوار جین اندازه‌م نیست.\nreturn|returned|returned|پس دادن (جنس)|🛍️ خرید لباس|I want to return this shirt.|می‌خوام این پیراهن رو پس بدم.\nexchange|exchanged|exchanged|عوض کردن (جنس)|🛍️ خرید لباس|Can I exchange it for a bigger size?|می‌تونم با یه سایز بزرگ‌تر عوضش کنم؟";
const mkVerb = ([v, past, pp, fa, cat, ex, exFa]) => { const base = v.split(' ')[0], first = s => (s || '').split(/[\s\/(]/)[0]; const reg = regPast(base).includes(first(past)) && regPast(base).includes(first(pp)); return { v, past, pp, fa, cat, ex, exFa: exFa || '', irr: !reg }; };
VERBS.push(...VTOPIC_RAW.split('\n').map(l => mkVerb(l.split('|'))));

/* فرق فعل‌های شبیه به هم */
const VDIFF = [
  [['say', 'tell'], 'say یعنی «گفتن» خودِ حرف؛ بعدش مستقیم آدم نمی‌آید: She said hello. اما tell یعنی «به کسی گفتن/تعریف کردن» و بعدش آدم می‌آید: Tell me a story. (نه: Say me)'],
  [['speak', 'talk'], 'speak رسمی‌تر و برای زبان و سخنرانی است: Do you speak English? اما talk خودمونی و برای گپ و گفتگوست: Let\'s talk about it.'],
  [['see', 'look', 'watch'], 'see یعنی دیدنِ بی‌اختیار (I saw him). look یعنی عمداً نگاه کردن و با at می‌آید (Look at this). watch یعنی تماشا کردن چیزی که حرکت دارد (watch TV, watch a movie).'],
  [['hear', 'listen'], 'hear یعنی صدا به گوشت می‌رسد (I can\'t hear you). listen یعنی با دقت گوش دادن و با to می‌آید (Listen to me).'],
  [['make', 'do'], 'make برای ساختن و درست کردن چیزی است (make a cake, make the bed). do برای انجام دادن کار و وظیفه است (do homework, do the dishes).'],
  [['tidy up', 'clean'], 'tidy up یعنی مرتب کردن و سر جا گذاشتن وسایل (اتاق به‌هم‌ریخته). clean یعنی تمیز کردن کثیفی و گرد و خاک. می‌شود اتاقی مرتب باشد ولی تمیز نباشد!'],
  [['sweep', 'vacuum', 'mop (the floor)'], 'sweep با جاروی دستی، vacuum با جاروبرقی، mop با تی و آب.'],
  [['put away', 'throw away'], 'put away یعنی چیزی را سر جایش بگذاری (لباس‌ها توی کمد). throw away یعنی دور بیندازی (آشغال).'],
  [['lend', 'borrow'], 'lend یعنی قرض دادن (من به تو می‌دهم): Can you lend me some money? borrow یعنی قرض گرفتن (من از تو می‌گیرم): Can I borrow your pen?'],
  [['bring', 'take'], 'bring یعنی آوردن به جایی که گوینده هست (Bring your passport here). take یعنی بردن به جای دیگر (Take your umbrella).'],
  [['come', 'go'], 'come یعنی آمدن به سمت گوینده (Come here). go یعنی رفتن به جای دیگر (We went to the beach).'],
  [['get on (the plane)', 'get in (a taxi/car)'], 'get on برای وسیله‌های بزرگ که داخلش راه می‌روی (هواپیما، اتوبوس، قطار). get in برای ماشین و تاکسی که خم می‌شوی و می‌نشینی.'],
  [['get off (the plane)', 'get out of (a taxi/car)'], 'get off برای پیاده شدن از هواپیما، اتوبوس، قطار. get out of برای پیاده شدن از ماشین و تاکسی.'],
  [['take a taxi', 'call a taxi'], 'call a taxi یعنی تاکسی خبر کنی (تلفنی یا با اپ). take a taxi یعنی با تاکسی بروی.'],
  [['check in', 'check out'], 'check in یعنی پذیرش گرفتن موقع رسیدن (هتل/فرودگاه). check out یعنی تسویه و تحویل اتاق موقع رفتن از هتل.'],
  [['book a ticket', 'reserve (a room)'], 'book رایج‌تر و خودمونی‌تر است (book a table, book a flight). reserve کمی رسمی‌تر است ولی همان معنی رزرو را دارد.'],
  [['learn', 'study'], 'learn یعنی یاد گرفتن (نتیجه). study یعنی درس خواندن و مطالعه (فرایند).'],
  [['know', 'understand'], 'know یعنی چیزی را بدانی (I know the answer). understand یعنی متوجه شدن و فهمیدن (I don\'t understand).'],
  [['win', 'earn'], 'win یعنی بردن در مسابقه یا جایزه. earn یعنی درآوردن پول با کار.'],
  [['wear', 'try on'], 'wear یعنی پوشیدن و به تن داشتن. try on یعنی پرو کردن در مغازه برای امتحان.'],
  [['return', 'exchange'], 'return یعنی پس دادن جنس و گرفتن پول. exchange یعنی عوض کردن با جنس دیگر.'],
  [['wake up', 'get up'], 'wake up یعنی بیدار شدن (چشمت باز می‌شود). get up یعنی از رختخواب بلند شدن.'],
  [['fry', 'boil', 'bake'], 'fry با روغن در ماهیتابه، boil در آب جوش، bake در فر.']
];
const vdiffOf = v => VDIFF.filter(([vs]) => vs.includes(v));
const myTopics = () => lsGet('zd:vtopics:' + G.active, {});
const VCATS = [...new Set(VERBS.map(x => x.cat))];
const allVerbs = () => VERBS.concat(Object.entries(myTopics()).flatMap(([t, xs]) => xs.map(x => mkVerb([x.v, x.past, x.pp, x.fa, '⭐ ' + t, x.ex, x.exFa]))));

async function grammarBuild(g) {
  const L = await ai({ heavy: true, max: 7000, temp: 0.3, system: 'You are an expert English grammar teacher for Persian speakers. Explanations in clear, simple Persian; English examples natural and correct; contrast with Persian where it helps.', messages: [{ role: 'user', content: `Complete grammar lesson: "${g.fa}" (level ${g.lvl}). JSON {"intro":"Persian: what it is, in 2-3 sentences","why":"Persian: when you need it in real conversations","form":[{"type":"مثبت|منفی|سؤالی|جواب کوتاه or other label in Persian","pattern":"e.g. Subject + am/is/are + verb-ing","examples":["",""]}],"uses":[{"title":"Persian use title","explain":"Persian","examples":[{"en":"","fa":""}]}],"signals":"time words/signals in English, comma separated, or empty","compare":"Persian: how it differs from similar structures or from Persian","mistakes":[{"wrong":"","right":"","why":"Persian"}],"tip":"Persian memory tip","exercises":[{"type":"blank|fix|translate","q":"","a":"","hint":"Persian"}]} — 3-5 uses, 8 exercises.` }] });
  if (!L?.form?.length) throw new Error('درس کامل ساخته نشد؛ دوباره امتحان کن.'); return L;
}
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
    v.innerHTML = loading('درس گرامر را باز می‌کنم…');
    try { const r = await fetch('lessons/grammar/' + id + '.json'); if (r.ok) { L = await r.json(); G.cache[key] = L; saveG('cache'); } } catch { } // درس آمادهٔ آفلاین
  }
  if (!L) {
    if (needAI(v)) return; v.innerHTML = loading('در حال آماده کردن درس گرامر…');
    try {
      L = await grammarBuild(g);
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
routes.verbs = async (cat = 'همه') => {
  setTop('افعال کاربردی', true); const v = view();
  const O = Object.assign({ dir: 'both', forms: true, ex: false, irr: false }, lsGet('zd:vopt', {})); const saveO = () => lsSet('zd:vopt', O);
  const g0 = routeGen; const P = await (typeof pronLoad === 'function' ? pronLoad() : {}); if (g0 !== routeGen && !/^#verbs/.test(location.hash)) return; const pr = t => { const x = typeof pronOf === 'function' ? pronOf(P, t) : ''; return x ? `<span class="pron">🗣 «${esc(x)}»</span>` : ''; };
  if (cat.startsWith('⭐ ') && !myTopics()[cat.slice(2)]) setTimeout(() => { const q = $('#vtq'); if (q) { q.value = cat.slice(2); $('#vtf').requestSubmit(); } }, 50);
  const AV = allVerbs(); const CATS = [...new Set(AV.map(x => x.cat))];
  const list = AV.filter(x => (cat === 'همه' || x.cat === cat) && (!O.irr || x.irr));
  const f1 = s => s.split(' (')[0];
  const hid = O.dir !== 'both';
  const row = (x, i) => {
    const en = `<b class="en vb-en">${esc(x.v)}</b>`, fa = `<span class="vb-fa">${esc(x.fa)}</span>`;
    const forms = (O.forms ? `<div class="en vb-forms small">${esc(x.v)} → ${esc(f1(x.past))} → ${esc(f1(x.pp))}</div>` : '') + pr(x.v);
    const q = O.dir === 'fa' ? fa : en, ans = O.dir === 'fa' ? en + forms : fa + forms;
    return `<div class="vb${hid ? ' hid' : ''}" data-i="${i}">
      <div class="vb-main"><button class="icon-btn" data-s="${i}" aria-label="تلفظ">${I.spk}</button>
        <div class="grow vb-txt">${hid ? `<div>${q} ${x.irr ? '<span class="pill mark">بی‌قاعده</span>' : ''}</div><div class="vb-ans">${ans}</div><span class="vb-ph">👁 بزن تا ${O.dir === 'fa' ? 'انگلیسی‌اش' : 'معنی‌اش'} را ببینی</span>` : `<div>${en} <span class="muted">—</span> ${fa} ${x.irr ? '<span class="pill mark">بی‌قاعده</span>' : ''}</div>${forms}`}</div>
        <span class="vb-chev">⌄</span></div>
      <div class="vb-more"${O.ex && !hid ? '' : ' hidden'}>
        <div class="row" style="flex-wrap:nowrap"><button class="icon-btn" data-e="${esc(x.ex)}" aria-label="پخش جمله">${I.spk}</button><div class="grow"><div class="en">${esc(x.ex)}</div>${pr(x.ex)}<div class="small vb-exfa">${esc(x.exFa)}</div></div></div>
        ${vdiffOf(x.v).map(([vs, t]) => `<div class="vb-diff"><b>🔀 فرق ${vs.map(y => `<span class="en">${esc(y)}</span>`).join(' / ')}:</b> ${esc(t)}</div>`).join('')}
        <div class="small"><span class="muted">سه شکل:</span> <span class="en">${esc(x.v)} / ${esc(x.past)} / ${esc(x.pp)}</span></div>
        <div class="vb-ai"></div>
        <div class="row" style="gap:6px"><button class="btn ghost sm" data-new="${i}">✨ جملهٔ تازه</button><button class="btn ghost sm" data-lt="${i}">+ لایتنر</button></div></div></div>`;
  };
  setTimeout(() => { const b = $('#vtl'); if (b) b.onclick = () => teachThis({ topic: { title: (cat === 'همه' ? 'افعال کاربردی' : 'افعال ' + cat.replace('⭐ ', '')), items: list.slice(0, 120).map(x => `${x.v} (${x.past} / ${x.pp}) = ${x.fa}${x.ex ? ' — e.g. ' + x.ex : ''}`) } }, cat === 'همه' ? 'افعال کاربردی' : 'افعال ' + cat.replace('⭐ ', '')); }, 0);
  v.innerHTML = `<div class="stack">
  <button class="btn wide tlive-btn" id="vtl">🎓 ${cat === 'همه' ? 'این افعال' : 'افعال «' + esc(cat.replace('⭐ ', '')) + '»'} را معلم زنده یادم بدهد (Gemini یا ChatGPT)</button>
  <a class="card row" href="#vclass" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span style="font-size:26px">🎧</span><div class="grow"><b>کلاس صوتی فعل‌ها</b><div class="small muted">معلم موقعیت‌محور یاد می‌ده: «می‌خوای تختتو مرتب کنی…»</div></div><span>›</span></a>
  <div class="card stack" style="gap:10px">
    <div class="vb-cats">${['همه', ...CATS].map(c => `<button class="pill ${c === cat ? 'acc' : ''}" data-c="${esc(c)}">${esc(c)} <small>${faNum(c === 'همه' ? AV.length : AV.filter(x => x.cat === c).length)}</small></button>`).join('')}</div>
    <form class="row" id="vtf" style="flex-wrap:nowrap;gap:6px"><input class="input grow" id="vtq" placeholder="موضوع خودت را بنویس؛ مثلاً: فرودگاه، مرتب کردن اتاق، باشگاه…" maxlength="60"><button class="btn sm">✨ بساز</button></form>
    ${cat.startsWith('⭐ ') ? `<button class="btn line sm" id="vtdel" style="align-self:flex-start">حذف موضوع «${esc(cat.slice(2))}»</button>` : ''}
    <div class="seg" id="vacc">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.accent === 'UK' ? 'UK' : 'US') === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="seg" id="vdir">${[['both', 'انگلیسی + فارسی'], ['en', 'انگلیسی ← فارسی'], ['fa', 'فارسی ← انگلیسی']].map(([k, t]) => `<button data-v="${k}" class="${O.dir === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="row small" style="gap:14px"><label class="row" style="gap:4px"><input type="checkbox" data-o="forms"${O.forms ? ' checked' : ''}> سه شکل فعل</label><label class="row" style="gap:4px"><input type="checkbox" data-o="ex"${O.ex ? ' checked' : ''}> جمله و ترجمه</label><label class="row" style="gap:4px"><input type="checkbox" id="vpron"${lsGet('zd:showPron', true) ? ' checked' : ''}> 🗣 تلفظ فارسی</label><label class="row" style="gap:4px"><input type="checkbox" data-o="irr"${O.irr ? ' checked' : ''}> فقط بی‌قاعده</label></div>
    ${O.dir !== 'both' ? '<span class="tiny muted">برای دیدن جواب، روی بخش پنهان بزن.</span>' : ''}
  </div>
  <div class="row"><b class="grow">${esc(cat)} · ${faNum(list.length)} فعل</b><button class="btn sm" id="qz">🎯 آزمون</button><button class="btn ghost sm" id="add">+ همه به لایتنر</button></div>
  ${(() => { const ds = VDIFF.filter(([vs]) => vs.some(y => list.some(x => x.v === y))); return ds.length ? `<details class="card"><summary><b>🔀 فرق فعل‌های شبیه به هم (${faNum(ds.length)})</b></summary><div class="stack" style="margin-top:8px">${ds.map(([vs, t]) => `<div class="vb-diff"><b class="en">${vs.map(esc).join(' / ')}</b><div>${esc(t)}</div></div>`).join('')}</div></details>` : ''; })()}
  <div class="vb-list">${list.map(row).join('')}</div><div id="vq"></div></div>`;
  $$('[data-c]', v).forEach(b => b.onclick = () => routes.verbs(b.dataset.c));
  $('#vacc').onclick = e => { const b = e.target.closest('button'); if (!b) return; G.settings.accent = b.dataset.v; saveG('settings'); routes.verbs(cat); };
  $('#vdir').onclick = e => { const b = e.target.closest('button'); if (!b) return; O.dir = b.dataset.v; saveO(); routes.verbs(cat); };
  $('#vpron').onchange = e => { lsSet('zd:showPron', e.target.checked); document.body.classList.toggle('nopron', !e.target.checked); };
  $$('[data-o]', v).forEach(c => c.onchange = () => { O[c.dataset.o] = c.checked; saveO(); routes.verbs(cat); });
  const addLt = xs => { let cu = U.custom.find(x => x.id === 'myverbs'); if (!cu) { cu = { id: 'myverbs', en: 'Useful Verbs', fa: 'افعال کاربردی', icon: '🔁', hue: 150, gram: 'سه شکل فعل: حال، گذشته، اسم مفعول', talk: 'با این افعال دربارهٔ دیروز و تجربه‌هایت حرف بزن.', words: [] }; U.custom.push(cu); }
    xs.forEach(x => { if (!cu.words.some(w => w.w === x.v)) cu.words.push({ w: x.v, ipa: '', fa: `${x.fa} — ${x.past} / ${x.pp}`, img: '🔁', pos: 'v', ex: x.ex, g: x.cat }); const k = 'myverbs:' + x.v; if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; }); saveU(); window.LMAP = null; };
  $('.vb-list', v).onclick = async e => {
    const hv = e.target.closest('.vb.hid:not(.rev)'); if (hv && !e.target.closest('button')) { hv.classList.add('rev'); return; }
    const s1 = e.target.closest('[data-s]'); if (s1) { const x = list[+s1.dataset.s]; for (const t of [x.v, f1(x.past).split(' /')[0], f1(x.pp)]) if (!(await say(t, 'en', 'calm', s1))) break; return; }
    const ex = e.target.closest('[data-e]'); if (ex) return say(ex.dataset.e, 'en', 'calm', ex);
    const lt = e.target.closest('[data-lt]'); if (lt) { addLt([list[+lt.dataset.lt]]); lt.textContent = '✓ در لایتنر'; return toast('به جعبهٔ لایتنر اضافه شد؛ به‌موقع یادآوری می‌شود.'); }
    const nw = e.target.closest('[data-new]'); if (nw) { const x = list[+nw.dataset.new]; const box = nw.closest('.vb').querySelector('.vb-ai'); if (!hasAI() && !firstKeyed()) return toast('برای جملهٔ تازه به هوش مصنوعی نیاز است.'); box.innerHTML = loading('جملهٔ تازه…');
      try { const r = await ai({ max: 500, temp: 0.9, system: 'You write natural everyday English example sentences for Persian learners (A1-A2).', messages: [{ role: 'user', content: `Verb "${x.v}" (${x.past} / ${x.pp}). Write 3 short natural sentences: present, past, and present perfect or future. JSON {"items":[{"en":"","fa":"natural colloquial Persian"}]}` }] });
        box.innerHTML = (r.items || []).map(it => `<div class="row" style="flex-wrap:nowrap"><button class="icon-btn" data-e="${esc(it.en)}">${I.spk}</button><div class="grow"><div class="en">${esc(it.en)}</div><div class="small vb-exfa">${esc(it.fa)}</div></div></div>`).join(''); } catch (err) { box.innerHTML = ''; aiErr(err); } return; }
    const vb = e.target.closest('.vb'); if (vb && !e.target.closest('button,a,input')) { const m = vb.querySelector('.vb-more'); m.hidden = !m.hidden; vb.classList.toggle('open', !m.hidden); }
  };
  $('#vtf').onsubmit = async e => { e.preventDefault(); const t = $('#vtq').value.trim(); if (!t) return; if (!hasAI() && !firstKeyed()) return toast('ساختن موضوع تازه به هوش مصنوعی نیاز دارد.');
    const b = $('#vtf button'); b.disabled = true; b.textContent = 'در حال ساخت…';
    try { const r = await ai({ max: 5000, temp: 0.4, system: 'You are an expert English teacher for Persian speakers. Give the verbs and phrasal verbs native speakers really use.', messages: [{ role: 'user', content: `Topic/situation (Persian): "${t}". List EVERY common verb and verb phrase a native speaker uses for this situation, in a natural real-life order (e.g. for an airport: book a ticket, pack, check in, check a bag, pay for extra baggage, go through security, board, take off, land, get off, pick up luggage, take a taxi…). 15-30 items. JSON {"items":[{"v":"base form (with particle/object hint in parentheses if needed)","past":"","pp":"","fa":"natural Persian meaning","ex":"short natural sentence","exFa":"natural colloquial Persian translation"}]}` }] });
      if (!r.items?.length) throw new Error('چیزی ساخته نشد؛ دوباره امتحان کن.'); const T = myTopics(); T[t] = r.items; lsSet('zd:vtopics:' + G.active, T); toast(`${faNum(r.items.length)} فعل برای «${t}» ساخته شد.`); routes.verbs('⭐ ' + t);
    } catch (err) { b.disabled = false; b.textContent = '✨ بساز'; aiErr(err); } };
  $('#vtdel') && ($('#vtdel').onclick = () => { const T = myTopics(); delete T[cat.slice(2)]; lsSet('zd:vtopics:' + G.active, T); routes.verbs(); });
  $('#add').onclick = () => { addLt(list); toast(`${faNum(list.length)} فعل به جعبهٔ لایتنر اضافه شد.`); };
  $('#qz').onclick = () => { const items = pick(list.filter(x => x.irr).length >= 5 ? list.filter(x => x.irr) : list, 10).map(x => O.dir === 'fa' ? ({ type: 'translate', q: `«${x.fa}» به انگلیسی چه می‌شود؟`, a: x.v, hint: x.ex, full: x.ex }) : ({ type: 'blank', q: `${x.v} (${x.fa}) → گذشته و اسم مفعول را با «/» بنویس`, a: `${f1(x.past).split(' / ')[0]} / ${f1(x.pp)}`, hint: 'مثال: went / gone', full: x.ex })); runEx($('#vq'), items, currentUnit(), false); $('#vq').scrollIntoView({ behavior: 'smooth' }); };
};

/* ───── واژه‌ها بر اساس موضوع (هر موضوعی که خودت بنویسی) ───── */
const myWT = () => lsGet('zd:wtopics:' + G.active, {});
routes.wtopics = async (topic = '') => {
  setTop(topic ? 'واژه‌های «' + topic + '»' : 'واژه‌ها بر اساس موضوع', true); const v = view(); const T = myWT();
  const O = Object.assign({ dir: 'both' }, lsGet('zd:wopt', {}));
  const defs = ['احوالپرسی و آشنایی', 'فرودگاه و پرواز', 'خرید کردن', 'پوشاک و مد', 'ترید و بازار مالی', 'رستوران و غذا', 'هتل و سفر', 'دکتر و بیمارستان', 'محل کار و جلسه', 'خانه و وسایل', 'احساسات', 'آب‌وهوا'];
  if (!topic) {
    v.innerHTML = `<div class="stack"><div class="card stack"><b>🗂️ هر موضوعی بنویس، همهٔ واژه‌ها و عبارت‌هایش را بگیر</b><span class="small muted">مثلاً «فرودگاه»، «ترید کردن»، «پوشاک»، «انواع احوالپرسی». برای هر کدام معنی، رسمی یا عامیانه بودن، اینکه کجا به کار می‌رود، جملهٔ نمونه و ترجمه می‌آید.</span>
      <form class="row" id="wtf" style="flex-wrap:nowrap;gap:6px"><input class="in grow" id="wtq" placeholder="موضوع را بنویس…" maxlength="60"><button class="btn sm">✨ بساز</button></form></div>
      ${Object.keys(T).length ? `<div class="sec">موضوع‌های من</div><div class="vb-cats" style="flex-wrap:wrap">${Object.keys(T).map(k => `<a class="pill acc" href="#wtopics/${encodeURIComponent(k)}">⭐ ${esc(k)} <small>${faNum(T[k].length)}</small></a>`).join('')}</div>` : ''}
      <div class="sec">موضوع‌های پیشنهادی</div><div class="vb-cats" style="flex-wrap:wrap">${defs.map(k => `<a class="pill" href="#wtopics/${encodeURIComponent(k)}">${esc(k)}</a>`).join('')}</div>
      <div class="sec">واژه‌های درس‌ها</div><div class="vb-cats" style="flex-wrap:wrap">${[...ALL_UNITS, ...WS_UNITS].filter(u => unitWords(u).length).map(u => `<a class="pill" href="#unit/${u.id}/words">${esc(u.icon)} ${esc(u.fa)}</a>`).join('')}</div></div>`;
    $('#wtf').onsubmit = e => { e.preventDefault(); const t = $('#wtq').value.trim(); if (t) go('wtopics/' + encodeURIComponent(t)); };
    return;
  }
  let items = T[topic]; let gen0 = routeGen;
  if (!items) {
    if (!hasAI() && !firstKeyed()) { v.innerHTML = '<div class="notice">ساختن موضوع تازه به هوش مصنوعی نیاز دارد.</div>'; return; }
    v.innerHTML = loading(`همهٔ واژه‌ها و عبارت‌های «${topic}» را جمع می‌کنم…`); gen0 = routeGen;
    try { const r = await ai({ heavy: true, max: 7000, temp: 0.4, system: 'You are an expert English teacher for Persian speakers. Give the words and expressions native speakers really use, from formal to slang.', messages: [{ role: 'user', content: `Topic (Persian): "${topic}". Give a COMPLETE vocabulary list for this topic: nouns, verbs, adjectives, common phrases and chunks, from formal to everyday to slang, grouped logically. 30-50 items. JSON {"items":[{"en":"","fa":"natural Persian","group":"short Persian group name","register":"formal|neutral|informal|slang","use":"Persian: exactly when/with whom to use it, and how it differs from similar items","ex":"short natural sentence","exFa":"natural colloquial Persian translation"}]}` }] });
      items = (r.items || []).filter(x => x.en); if (!items.length) throw new Error('چیزی ساخته نشد؛ دوباره امتحان کن.'); T[topic] = items; lsSet('zd:wtopics:' + G.active, T);
    } catch (e) { if (gen0 !== routeGen) return; v.innerHTML = `<div class="card stack"><b>ساخته نشد</b><span class="small muted">${esc(e.message || '')}</span><button class="btn" onclick="routes.wtopics(${JSON.stringify(topic).replace(/"/g, '&quot;')})">دوباره</button></div>`; return aiErr(e); }
  }
  if (gen0 !== routeGen) return;
  const RG = { formal: ['رسمی', 'acc'], neutral: ['خنثی', ''], informal: ['خودمونی', 'ok'], slang: ['عامیانه', 'bad'] };
  const hid = O.dir !== 'both'; const groups = [...new Set(items.map(x => x.group || ''))];
  setTimeout(() => { const b = $('#wtl'); if (b) b.onclick = () => teachThis({ topic: { title: topic, items: items.map(x => `${x.en} = ${x.fa}${x.reg ? ' [' + x.reg + ']' : ''}${x.use ? ' — ' + x.use : ''}`) } }, topic); }, 0);
  v.innerHTML = `<div class="stack"><div class="card stack" style="gap:10px">
    <div class="seg" id="wacc">${[['US', '🇺🇸 آمریکایی'], ['UK', '🇬🇧 بریتانیایی']].map(([k, t]) => `<button data-v="${k}" class="${(G.settings.accent === 'UK' ? 'UK' : 'US') === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="seg" id="wdir">${[['both', 'انگلیسی + فارسی'], ['en', 'انگلیسی ← فارسی'], ['fa', 'فارسی ← انگلیسی']].map(([k, t]) => `<button data-v="${k}" class="${O.dir === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <button class="btn wide tlive-btn" id="wtl">🎓 این موضوع را معلم زنده یادم بدهد (Gemini یا ChatGPT)</button>
    <div class="row" style="gap:6px"><button class="btn sm" id="wlt">+ همه به لایتنر</button><button class="btn ghost sm" id="wre">ساخت دوباره</button><button class="btn line sm" id="wdel">حذف موضوع</button></div></div>
    ${groups.map(gname => `${gname ? `<div class="sec">${esc(gname)}</div>` : ''}<div class="vb-list">${items.map((x, i) => [x, i]).filter(([x]) => (x.group || '') === gname).map(([x, i]) => `<div class="vb${hid ? ' hid' : ''}" data-i="${i}"><div class="vb-main"><button class="icon-btn" data-e="${esc(x.en)}" aria-label="تلفظ">${I.spk}</button><div class="grow vb-txt">
      ${hid ? `<div>${O.dir === 'fa' ? `<span class="vb-fa">${esc(x.fa)}</span>` : `<b class="en vb-en">${esc(x.en)}</b>`}</div><div class="vb-ans">${O.dir === 'fa' ? `<b class="en vb-en">${esc(x.en)}</b>` : `<span class="vb-fa">${esc(x.fa)}</span>`}</div><span class="vb-ph">👁 بزن تا ببینی</span>` : `<div><b class="en vb-en tw">${esc(x.en)}</b> <span class="muted">—</span> <span class="vb-fa">${esc(x.fa)}</span></div>`}
      ${RG[x.register] ? `<span class="pill ${RG[x.register][1]}">${RG[x.register][0]}</span>` : ''}</div><span class="vb-chev">⌄</span></div>
      <div class="vb-more" hidden>${x.use ? `<div class="vb-diff">🧭 ${esc(x.use)}</div>` : ''}${x.ex ? `<div class="row" style="flex-wrap:nowrap"><button class="icon-btn" data-e="${esc(x.ex)}">${I.spk}</button><div class="grow"><div class="en">${esc(x.ex)}</div><div class="small vb-exfa">${esc(x.exFa || '')}</div></div></div>` : ''}<div class="row"><button class="btn ghost sm" data-lt="${i}">+ لایتنر</button><button class="btn ghost sm" data-dict="${esc(x.en)}">📖 دیکشنری</button></div></div></div>`).join('')}</div>`).join('')}</div>`;
  const add = xs => { const id = 'wt:' + topic; let cu = U.custom.find(c => c.id === id); if (!cu) { cu = { id, en: topic, fa: topic, icon: '🗂️', hue: 200, gram: '—', talk: 'دربارهٔ «' + topic + '» با این واژه‌ها حرف بزن.', words: [] }; U.custom.push(cu); }
    xs.forEach(x => { if (!cu.words.some(w => w.w === x.en)) cu.words.push({ w: x.en, ipa: '', fa: x.fa, img: '🗂️', pos: 'phr', ex: x.ex || '' }); const k = id + ':' + x.en; if (!U.srs[k]) U.srs[k] = { box: 0, due: isoDay(), seen: 0, wrong: 0, right: 0 }; }); saveU(); window.LMAP = null; };
  v.onclick = e => {
    const hv = e.target.closest('.vb.hid:not(.rev)'); if (hv && !e.target.closest('button')) { hv.classList.add('rev'); return; }
    const sp = e.target.closest('[data-e]'); if (sp) return say(sp.dataset.e, 'en', 'calm', sp);
    const lt = e.target.closest('[data-lt]'); if (lt) { add([items[+lt.dataset.lt]]); lt.textContent = '✓ در لایتنر'; return toast('به جعبهٔ لایتنر اضافه شد.'); }
    const dc = e.target.closest('[data-dict]'); if (dc) return wordPanel(dc.dataset.dict);
    const b = e.target.closest('.seg button'); if (b) { if (b.closest('#wacc')) { G.settings.accent = b.dataset.v; saveG('settings'); } else { O.dir = b.dataset.v; lsSet('zd:wopt', O); } return routes.wtopics(topic); }
    const vb = e.target.closest('.vb'); if (vb && !e.target.closest('button,a')) { const m = vb.querySelector('.vb-more'); m.hidden = !m.hidden; vb.classList.toggle('open', !m.hidden); }
  };
  $('#wlt').onclick = () => { add(items); toast(`${faNum(items.length)} واژه به جعبهٔ لایتنر اضافه شد.`); };
  $('#wre').onclick = () => { const T2 = myWT(); delete T2[topic]; lsSet('zd:wtopics:' + G.active, T2); routes.wtopics(topic); };
  $('#wdel').onclick = () => { const T2 = myWT(); delete T2[topic]; lsSet('zd:wtopics:' + G.active, T2); go('wtopics'); };
};
