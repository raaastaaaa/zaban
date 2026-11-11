/* زبان دوم — محتوای درسی
   هر خط واژه: word|IPA (آمریکایی)|معنی فارسی|ایموجی یا #رنگ|نوع (n,v,adj,adv,prep,phr)|جملهٔ نمونه
   سرفصل‌ها به ترتیب سطوح رایج کتاب‌های عمومی (مقدماتی تا متوسط) چیده شده‌اند؛ محتوا تألیف خود برنامه است. */
const LEVELS = [
{ id:'intro', fa:'مقدماتی', en:'Intro · A1', units:[
{ id:'hello', en:'Hello! Greetings & Introductions', fa:'سلام و آشنایی', icon:'👋', hue:160,
  gram:'فعل to be با I / you (I am…, Are you…?) و سؤال‌های What / Where / How',
  talk:'سلام و احوالپرسی کن، خودت را معرفی کن (اسم، کشور، شغل)، اسمت را هجی کن و خداحافظی کن.',
  words:`hello|həˈloʊ|سلام|👋|phr|Hello! I'm Rasta.
hi|haɪ|سلام (خودمانی)|🙋|phr|Hi, Sara! How are you?|i|با دوست، همکار و آشنا؛ رایج‌ترین سلام روزمره
good morning|ɡʊd ˈmɔːrnɪŋ|صبح بخیر|🌅|phr|Good morning, everyone!|n|تا ظهر؛ در محل کار و جاهای رسمی هم مناسب
good afternoon|ɡʊd ˌæftərˈnuːn|بعدازظهر بخیر|🌤️|phr|Good afternoon. Can I help you?|f|ظهر تا حدود ساعت ۶؛ بیشتر رسمی و کاری
good evening|ɡʊd ˈiːvnɪŋ|عصربخیر / شب بخیر (هنگام دیدار)|🌆|phr|Good evening, sir.|f|از غروب، موقع دیدن کسی؛ رسمی (رستوران، هتل)
good night|ɡʊd ˈnaɪt|شب بخیر (هنگام خداحافظی و خواب)|🌙|phr|Good night! See you tomorrow.|n|فقط موقع خداحافظی یا رفتن به خواب، نه برای سلام
How are you?|haʊ ɑːr juː|حالت چطور است؟|🙂|phr|Hi, Ali! How are you?|n|بعد از سلام؛ جوابش معمولاً کوتاه است
I'm fine, thanks.|aɪm faɪn θæŋks|خوبم، ممنون.|👍|phr|I'm fine, thanks. And you?|n|جواب کتابی؛ نیتیوها بیشتر I'm good می‌گویند
What's your name?|wʌts jʊr neɪm|اسمت چیست؟|❓|phr|Hi! What's your name?|n|برای پرسیدن اسم؛ در جمع رسمی‌تر: May I have your name?
My name is…|maɪ neɪm ɪz|اسم من … است|🪪|phr|My name is Rasta.|n|معرفی خود؛ خودمونی‌تر: I'm …
Nice to meet you.|naɪs tə miːt juː|از آشنایی‌ات خوشحالم.|🤝|phr|Nice to meet you, Maryam.|n|بار اولی که کسی را می‌بینی
Where are you from?|wer ɑːr juː frʌm|اهل کجایی؟|🌍|phr|Where are you from? I'm from Iran.|n|پرسیدن اهل کجا بودن
I'm from…|aɪm frʌm|من اهل … هستم|📍|phr|I'm from Iran, but I live in Canada.|n|گفتن اهل کجا بودن
live|lɪv|زندگی کردن|🏠|v|I live in Tehran.
spell|spel|هجی کردن|🔤|v|How do you spell your name?
please|pliːz|لطفاً|🙏|adv|Please sit down.|n|هر درخواستی؛ نگفتنش بی‌ادبی حساب می‌شود
thank you|ˈθæŋk juː|متشکرم|💐|phr|Thank you very much!|n|همه‌جا؛ خودمونی: Thanks!
You're welcome.|jʊr ˈwelkəm|خواهش می‌کنم (در جواب تشکر)|😊|phr|"Thank you!" "You're welcome."|n|جواب تشکر؛ خودمونی: No problem / Sure
excuse me|ɪkˈskjuːz miː|ببخشید (برای جلب توجه)|✋|phr|Excuse me, where is the bank?|n|برای جلب توجه یا رد شدن از کنار کسی
sorry|ˈsɑːri|متأسفم / ببخشید (عذرخواهی)|😔|adj|Sorry, I'm late.|n|عذرخواهی؛ برای جلب توجه هم گاهی
goodbye|ɡʊdˈbaɪ|خداحافظ|👋|phr|Goodbye! Have a nice day.|f|کمی رسمی و قطعی؛ در روزمره بیشتر Bye
See you later.|siː juː ˈleɪtər|بعداً می‌بینمت.|🫡|phr|Bye, Sara! See you later.|i|خداحافظی دوستانه؛ حتی اگر معلوم نیست کی همدیگر را می‌بینید
Mr.|ˈmɪstər|آقای …|👨‍💼|n|Good morning, Mr. Khan.|f|با فامیلی مرد: Mr. Karimi
Ms.|mɪz|خانم … (رسمی)|👩‍💼|n|This is Ms. Ahmadi, our teacher.|f|با فامیلی زن (بدون اشاره به تأهل)
first name|ˈfɜːrst neɪm|نام (کوچک)|🏷️|n|My first name is Rasta.
last name|ˈlæst neɪm|نام خانوادگی|📛|n|What's your last name?
country|ˈkʌntri|کشور|🗺️|n|Iran is a big country.
job|dʒɑːb|شغل|💼|n|What's your job? I'm a nurse.
hey|heɪ|سلام (خیلی خودمونی؛ با دوست‌ها)|🙌|phr|Hey, Sara! Long time no see.|i|فقط با دوست و هم‌سن‌ها؛ با رئیس یا غریبه نه
Hey there!|heɪ ðer|سلام! (خودمونی و گرم)|😃|phr|Hey there! How's it going?|i|گرم و خودمونی
Hiya!|ˈhaɪjə|سلام (خودمونی، بیشتر بریتانیایی)|🇬🇧|phr|Hiya! You all right?|i|خودمونی، بیشتر بریتانیا
Morning!|ˈmɔːrnɪŋ|صبح بخیر (کوتاه و خودمونی)|☕|phr|Morning! Did you sleep well?|i|کوتاه‌شدهٔ Good morning بین همکارها و دوست‌ها
How's it going?|haʊz ɪt ˈɡoʊɪŋ|چطوری؟ اوضاع چطوره؟ (خودمونی)|🤙|phr|Hey Ali, how's it going?|i|بسیار رایج بین دوست‌ها و همکارها
How are you doing?|haʊ ər jə ˈduːɪŋ|حالت چطوره؟ (دوستانه)|🙂|phr|Hi Maryam, how are you doing?|i|دوستانه؛ جواب: I'm doing well / Good
What's up?|wʌts ˈʌp|چه خبر؟ (خیلی خودمونی؛ جوابش معمولاً Not much)|🤘|phr|Hey, what's up?|s|عامیانه، فقط با دوست؛ جواب: Not much
What's new?|wʌts ˈnuː|چه خبر تازه؟|🆕|phr|Long time no see! What's new?|i|وقتی مدتی همدیگر را ندیده‌اید
How have you been?|haʊ əv jə ˈbɪn|این مدت چطور بودی؟ (برای کسی که مدتی ندیدی)|🫂|phr|Hi! How have you been?|n|برای کسی که مدتی ندیده‌ای
Long time no see!|ˌlɔːŋ taɪm noʊ ˈsiː|چه عجب! خیلی وقته ندیدمت! (خودمونی)|⌛|phr|Reza! Long time no see!|i|خودمونی؛ بعد از مدت طولانی
Good to see you.|ˈɡʊd tə ˈsiː jə|خوشحالم می‌بینمت.|😊|phr|Good to see you again!|n|دیدن آشنا؛ رسمی‌تر: It's good to see you
How's everything?|haʊz ˈevriθɪŋ|همه چیز روبه‌راهه؟|🌈|phr|How's everything at work?|i|پرسیدن احوال کلی
How's your day going?|haʊz jər ˈdeɪ ˈɡoʊɪŋ|روزت چطور داره می‌گذره؟|📆|phr|Hi! How's your day going?|n|همکار، فروشنده، آشنا
How do you do?|haʊ də jə ˈduː|از آشنایی‌تون خوشوقتم (خیلی رسمی؛ سؤال نیست، جوابش هم همینه)|🎩|phr|A: How do you do, Mr. Brown? B: How do you do?|f|بسیار رسمی و قدیمی؛ امروز کم استفاده می‌شود
Pleased to meet you.|ˈpliːzd tə ˈmiːt jə|از آشنایی‌تون خوشوقتم (رسمی)|🤝|phr|Pleased to meet you, Mr. Brown.|f|آشنایی رسمی و کاری
It's a pleasure to meet you.|ɪts ə ˈpleʒər tə ˈmiːt jə|از آشنایی با شما خیلی خوشحالم (رسمی و مؤدبانه)|💐|phr|It's a pleasure to meet you, Dr. Karimi.|f|خیلی مؤدبانه؛ جلسهٔ کاری، مهمان مهم
Nice to meet you too.|ˈnaɪs tə ˈmiːt jə ˈtuː|منم از آشنایی‌ات خوشحالم.|🤝|phr|"Nice to meet you." "Nice to meet you too."|n|جواب Nice to meet you
I'm good, thanks. And you?|aɪm ˈɡʊd θæŋks ən ˈjuː|خوبم، ممنون. تو چطوری؟ (رایج‌ترین جواب)|👍|phr|"How are you?" "I'm good, thanks. And you?"|n|رایج‌ترین جواب واقعی نیتیوها
Pretty good.|ˈprɪti ˈɡʊd|خوبم، بد نیستم (خودمونی)|😌|phr|"How's it going?" "Pretty good."|i|جواب خودمونی
Not bad.|ˌnɑːt ˈbæd|بد نیستم.|👌|phr|"How are you?" "Not bad, thanks."|i|جواب خودمونی
Not much.|ˌnɑːt ˈmʌtʃ|خبری نیست (جواب What's up?)|🤷|phr|"What's up?" "Not much. You?"|i|جواب What's up?
Can't complain.|ˌkænt kəmˈpleɪn|شکایتی ندارم؛ خوبم (خودمونی)|😄|phr|"How are things?" "Can't complain."|i|جواب خودمونی و شوخ
So-so.|ˈsoʊ soʊ|ای، بد نیستم؛ معمولی|😐|phr|"How was your day?" "So-so."|i|وقتی حالت خیلی خوب نیست
I'm doing well.|aɪm ˈduːɪŋ ˈwel|خوبم (کمی رسمی‌تر)|🌟|phr|"How are you doing?" "I'm doing well, thank you."|f|جواب کمی رسمی و مؤدبانه
Excuse me, are you…?|ɪkˈskjuːz mi ɑːr jə|ببخشید، شما … هستید؟|❔|phr|Excuse me, are you Sara?|n|پیدا کردن کسی که قرار داری
This is…|ðɪs ɪz|ایشون … هستن (برای معرفی کسی)|👉|phr|This is my friend, Ali.|n|معرفی کسی به دیگران
Bye!|baɪ|خداحافظ! (خودمونی)|👋|phr|Bye! See you tomorrow.|i|رایج‌ترین خداحافظی روزمره
See you soon.|ˈsiː jə ˈsuːn|به زودی می‌بینمت.|🔜|phr|Thanks for coming. See you soon!|n|وقتی به‌زودی همدیگر را می‌بینید
See you tomorrow.|ˈsiː jə təˈmɑːroʊ|فردا می‌بینمت.|➡️|phr|Good night! See you tomorrow.|n|همکار و همکلاسی
Talk to you later.|ˈtɔːk tə jə ˈleɪtər|بعداً باهات حرف می‌زنم (آخر تماس یا پیام)|📱|phr|I have to go. Talk to you later!|i|آخر تماس تلفنی یا پیام
Take care!|ˌteɪk ˈker|مراقب خودت باش!|❤️|phr|Bye, Maryam. Take care!|i|خداحافظی گرم با دوست و خانواده
Have a nice day!|hæv ə ˈnaɪs ˈdeɪ|روز خوبی داشته باشی!|🌞|phr|Thank you! Have a nice day!|n|فروشنده، مشتری، همکار؛ خیلی رایج
Have a good one!|hæv ə ˈɡʊd wʌn|روز/شب خوبی داشته باشی! (خودمونی، آمریکایی)|✌️|phr|Thanks, man. Have a good one!|s|عامیانهٔ آمریکایی
Catch you later!|ˈkætʃ jə ˈleɪtər|بعداً می‌بینمت! (عامیانه)|🏃|phr|Gotta go. Catch you later!|s|عامیانه، بین جوان‌ها
Nice talking to you.|ˈnaɪs ˈtɔːkɪŋ tə jə|از صحبت باهات خوشحال شدم (آخر گفتگو)|💬|phr|Nice talking to you. Bye!|n|پایان گفتگو با کسی که تازه آشنا شدی
Goodbye for now.|ɡʊdˈbaɪ fər ˈnaʊ|فعلاً خداحافظ.|🙋|phr|That's all for today. Goodbye for now!|n|فعلاً خداحافظ؛ کلاس، تلفن`},
{ id:'things', en:'Things Around Me', fa:'وسایل شخصی و کلاس', icon:'🎒', hue:205,
  gram:'a / an، this / these، اسم جمع، و حروف اضافهٔ مکان (in, on, under, next to)',
  talk:'بگو وسایلت کجاست و بپرس «Where is my…?»؛ چیزهای دور و برت را نام ببر.',
  words:`bag|bæɡ|کیف|👜|n|My bag is on the chair.
book|bʊk|کتاب|📘|n|This is my English book.
notebook|ˈnoʊtbʊk|دفترچه|📓|n|Write the new words in your notebook.
pen|pen|خودکار|🖊️|n|Can I borrow a pen?
pencil|ˈpensəl|مداد|✏️|n|I have a pencil and an eraser.
eraser|ɪˈreɪsər|پاک‌کن|🧽|n|Where's my eraser?
keys|kiːz|کلیدها|🔑|n|Where are my keys?
wallet|ˈwɑːlɪt|کیف پول|👛|n|My wallet is in my bag.
phone|foʊn|گوشی|📱|n|Is this your phone?
glasses|ˈɡlæsɪz|عینک|👓|n|My glasses are on the table.
watch|wɑːtʃ|ساعت مچی|⌚|n|This watch is new.
umbrella|ʌmˈbrelə|چتر|☂️|n|Take an umbrella. It's raining.
desk|desk|میز تحریر|🗄️|n|The laptop is on the desk.
chair|tʃer|صندلی|🪑|n|Your bag is under the chair.
table|ˈteɪbəl|میز|🪵|n|The keys are on the table.
window|ˈwɪndoʊ|پنجره|🪟|n|Please open the window.
door|dɔːr|در|🚪|n|Close the door, please.
in|ɪn|داخلِ|📥|prep|The pen is in the bag.
on|ɑːn|رویِ|⬆️|prep|The book is on the desk.
under|ˈʌndər|زیرِ|⬇️|prep|The cat is under the table.
next to|ˈnekst tə|کنارِ|↔️|prep|The lamp is next to the bed.
this|ðɪs|این (مفرد)|👉|adj|This is my pen.
these|ðiːz|این‌ها (جمع)|👇|adj|These are my keys.
Where is…?|wer ɪz|… کجاست؟|❓|phr|Where is my phone?`},
{ id:'countries', en:'Countries & Languages', fa:'کشورها و ملیت‌ها', icon:'🌍', hue:185,
  gram:'فعل to be در جملهٔ منفی و سؤالی (Are you…? Is she…? I\'m not…) و صفت‌های توصیفی',
  talk:'بگو اهل کجایی، به چه زبانی حرف می‌زنی و دربارهٔ یک دوست بگو اهل کجاست و چه شکلی است.',
  words:`country|ˈkʌntri|کشور|🗺️|n|What country are you from?
city|ˈsɪti|شهر|🏙️|n|Shiraz is a beautiful city.
Iran|ɪˈrɑːn|ایران|🇮🇷|n|I'm from Iran.
Iranian|ɪˈreɪniən|ایرانی|🧕|adj|She's Iranian.
Persian|ˈpɜːrʒən|فارسی (زبان)|🗣️|n|My first language is Persian.
English|ˈɪŋɡlɪʃ|انگلیسی|🇬🇧|n|I'm learning English.
the United States|ðə juˌnaɪtɪd ˈsteɪts|ایالات متحده|🇺🇸|n|He lives in the United States.
American|əˈmerɪkən|آمریکایی|🗽|adj|My teacher is American.
Britain|ˈbrɪtən|بریتانیا|💂|n|London is in Britain.
British|ˈbrɪtɪʃ|بریتانیایی|☕|adj|Is she British?
Canada|ˈkænədə|کانادا|🇨🇦|n|My cousin lives in Canada.
Turkey|ˈtɜːrki|ترکیه|🇹🇷|n|We go to Turkey every summer.
Turkish|ˈtɜːrkɪʃ|ترکی؛ ترک|🧿|adj|I like Turkish coffee.
Germany|ˈdʒɜːrməni|آلمان|🇩🇪|n|Germany is in Europe.
German|ˈdʒɜːrmən|آلمانی|🥨|adj|He speaks German.
Arabic|ˈærəbɪk|عربی (زبان)|📜|n|She speaks Arabic and English.
language|ˈlæŋɡwɪdʒ|زبان|💬|n|How many languages do you speak?
speak|spiːk|صحبت کردن (به زبانی)|🗨️|v|Do you speak English?
from|frʌm|اهلِ؛ از|📍|prep|Where are you from?
tall|tɔːl|قدبلند|🧍|adj|My brother is very tall.
short|ʃɔːrt|کوتاه‌قد؛ کوتاه|🙎|adj|She's short and friendly.
friendly|ˈfrendli|خوش‌برخورد؛ مهربان|🤗|adj|Your friends are very friendly.
beautiful|ˈbjuːtəfəl|زیبا|🌸|adj|Isfahan is a beautiful city.
I'm not…|aɪm nɑːt|من … نیستم|🙅|phr|I'm not from Tehran. I'm from Tabriz.`},
{ id:'clothes', en:'Clothes, Colors & Weather', fa:'لباس، رنگ‌ها و آب‌وهوا', icon:'👕', hue:330,
  gram:'حال استمراری: I\'m wearing…, Are you wearing…? و جای صفت قبل از اسم (a red dress)',
  talk:'بگو امروز چه پوشیده‌ای و چه رنگی است، و هوا چطور است.',
  words:`shirt|ʃɜːrt|پیراهن|👔|n|He's wearing a white shirt.
T-shirt|ˈtiː ʃɜːrt|تی‌شرت|👕|n|I bought a new T-shirt.
pants|pænts|شلوار|👖|n|These pants are too long.
dress|dres|پیراهن زنانه|👗|n|She looks beautiful in that dress.
jacket|ˈdʒækɪt|کت / کاپشن|🧥|n|This jacket is too expensive.
coat|koʊt|پالتو|🧥|n|Wear your coat, it's cold.
shoes|ʃuːz|کفش|👞|n|These shoes are new.
socks|sɑːks|جوراب|🧦|n|My socks are wet.
hat|hæt|کلاه|🎩|n|He always wears a hat.
scarf|skɑːrf|شال‌گردن / روسری|🧣|n|It's windy; take a scarf.
gloves|ɡlʌvz|دستکش|🧤|n|Wear gloves in winter.
glasses|ˈɡlæsɪz|عینک|👓|n|I need glasses to read.
bag|bæɡ|کیف|👜|n|Don't forget your bag.
wear|wer|پوشیدن (به تن داشتن)|👚|v|I wear a uniform at work.
put on|pʊt ɑːn|پوشیدن (عمل پوشیدن)|👕|phr|Put on your jacket.
take off|teɪk ɔːf|درآوردن|👟|phr|Take off your shoes, please.
try on|traɪ ɑːn|پرو کردن|🪞|phr|Can I try on this shirt?
size|saɪz|سایز|🔢|n|What size are you?
comfortable|ˈkʌmftərbəl|راحت|🧸|adj|These shoes are very comfortable.
expensive|ɪkˈspensɪv|گران|💎|adj|This watch is too expensive.
cheap|tʃiːp|ارزان|🪙|adj|It's cheap and good.
color|ˈkʌlər|رنگ|🎨|n|What color is your car?
red|red|قرمز|#d62828|adj|Stop at the red light.
blue|bluː|آبی|#1d4ed8|adj|The sky is blue today.
green|ɡriːn|سبز|#15803d|adj|Green means go.
yellow|ˈjeloʊ|زرد|#eab308|adj|Bananas are yellow.
black|blæk|سیاه|#111111|adj|I like black coffee.
white|waɪt|سفید|#f5f5f5|adj|Snow is white.
brown|braʊn|قهوه‌ای|#7c4a1e|adj|She has brown eyes.
purple|ˈpɜːrpəl|بنفش|#7e22ce|adj|Purple is my favorite color.
pink|pɪŋk|صورتی|#ec4899|adj|She wore a pink dress.
gray|ɡreɪ|خاکستری|#8a8f98|adj|The sky is gray and cloudy.
weather|ˈweðər|آب‌وهوا|🌦️|n|What's the weather like today?
sunny|ˈsʌni|آفتابی|☀️|adj|It's sunny and hot.
rainy|ˈreɪni|بارانی|🌧️|adj|It's rainy, so wear a raincoat.
cold|koʊld|سرد|🥶|adj|It's cold today. Wear a coat.
hot|hɑːt|گرم؛ داغ|🥵|adj|It's very hot in summer.`},
{ id:'time', en:'Time & Daily Activities', fa:'ساعت و کارهای روزانه', icon:'🕐', hue:45,
  gram:'ساعت (It\'s seven o\'clock / half past six) و حال استمراری برای کاری که الان انجام می‌دهی: What are you doing? I\'m cooking.',
  talk:'بگو ساعت چند است، الان چه کار می‌کنی و صبح‌ها معمولاً چه کار می‌کنی.',
  words:`day|deɪ|روز|🌤️|n|Have a nice day!
night|naɪt|شب|🌙|n|Good night, see you tomorrow.
morning|ˈmɔːrnɪŋ|صبح|🌅|n|I drink coffee every morning.
evening|ˈiːvnɪŋ|غروب تا شب / سرِ شب (عصر = late afternoon)|🌆|n|We watch TV in the evening.
weekend|ˈwiːkend|آخر هفته|🎉|n|What do you do on the weekend?
hour|ˈaʊər|ساعت (مدت)|⏳|n|The flight takes two hours.
minute|ˈmɪnɪt|دقیقه|⏱️|n|Wait a minute, please.
today|təˈdeɪ|امروز|🔆|adv|What's the date today?
tomorrow|təˈmɑːroʊ|فردا|➡️|adv|See you tomorrow.
yesterday|ˈjestərdeɪ|دیروز|⬅️|adv|I was very busy yesterday.
o'clock|əˈklɑːk|(ساعت) … تمام|🕗|phr|It's eight o'clock.
half past|hæf pæst|… و نیم|🕣|phr|The class starts at half past nine.
early|ˈɜːrli|زود|🐓|adv|I get up early.
late|leɪt|دیر|⌛|adj|Sorry, I'm late.
always|ˈɔːlweɪz|همیشه|♾️|adv|I always drink tea in the morning.
usually|ˈjuːʒuəli|معمولاً|🔂|adv|I usually walk to work.
sometimes|ˈsʌmtaɪmz|گاهی|🎲|adv|Sometimes I take a taxi.
never|ˈnevər|هرگز|🚫|adv|I never eat fast food.
wake up|weɪk ʌp|بیدار شدن|⏰|phr|I wake up at seven.
get up|ɡet ʌp|از رختخواب بلند شدن|🛏️|phr|I get up at 7:15.
brush your teeth|brʌʃ jɔːr tiːθ|مسواک زدن|🪥|phr|Brush your teeth before bed.
take a shower|teɪk ə ˈʃaʊər|دوش گرفتن|🚿|phr|I take a shower every morning.
get dressed|ɡet drest|لباس پوشیدن|👗|phr|I get dressed quickly.
have breakfast|hæv ˈbrekfəst|صبحانه خوردن|🥐|phr|We have breakfast together.
leave home|liːv hoʊm|از خانه بیرون رفتن|🚪|phr|I leave home at eight.
go to work|ɡoʊ tə wɜːrk|سر کار رفتن|🧑‍💻|phr|I go to work by bus.
start|stɑːrt|شروع کردن / شروع شدن|🏁|v|School starts at 7:30.
finish|ˈfɪnɪʃ|تمام کردن|✅|v|I finish work at five.
go home|ɡoʊ hoʊm|به خانه رفتن|🏠|phr|I go home at six.
cook|kʊk|آشپزی کردن|🥘|v|My father likes to cook.
eat|iːt|خوردن|🍴|v|What do you want to eat?
do the dishes|duː ðə ˈdɪʃɪz|ظرف شستن|🍽️|phr|I do the dishes after dinner.`},
{ id:'family', en:'Family', fa:'خانواده', icon:'👪', hue:12,
  gram:'حال ساده: My sister works downtown. Does he live…? و صفات ملکی (my, your, his, her)',
  talk:'دربارهٔ اعضای خانواده‌ات حرف بزن: اسم، سن، شغل و جایی که زندگی می‌کنند.',
  words:`mother|ˈmʌðər|مادر|👩|n|My mother is a teacher.
father|ˈfɑːðər|پدر|👨|n|My father works in a bank.
parents|ˈperənts|والدین|👨‍👩‍👦|n|My parents are retired.
sister|ˈsɪstər|خواهر|👧|n|I have one older sister.
brother|ˈbrʌðər|برادر|👦|n|My brother plays football.
grandmother|ˈɡrænˌmʌðər|مادربزرگ|👵|n|My grandmother tells great stories.
grandfather|ˈɡrænˌfɑːðər|پدربزرگ|👴|n|My grandfather lives with us.
husband|ˈhʌzbənd|شوهر|🤵|n|Her husband is a doctor.
wife|waɪf|همسر (زن)|👰|n|His wife speaks three languages.
son|sʌn|پسر (فرزند)|🧒|n|Their son is ten years old.
daughter|ˈdɔːtər|دختر (فرزند)|👩‍👧|n|She has two daughters.
baby|ˈbeɪbi|نوزاد|👶|n|The baby is sleeping.
aunt|ænt|عمه / خاله|👩‍🦰|n|My aunt is a nurse.
uncle|ˈʌŋkəl|عمو / دایی|👨‍🦱|n|My uncle has a farm.
cousin|ˈkʌzən|عموزاده / دایی‌زاده / عمه‌زاده / خاله‌زاده|👫|n|My cousin lives in London.
get married|ɡet ˈmerid|ازدواج کردن|💍|phr|They got married last year.
live with|lɪv wɪð|زندگی کردن با|🏡|phr|I live with my parents.
take care of|teɪk ker əv|مراقبت کردن از|🤲|phr|I take care of my little brother.
look like|lʊk laɪk|شبیه … بودن|🪞|phr|You look like your mother.
grow up|ɡroʊ ʌp|بزرگ شدن|🌱|phr|I grew up in Shiraz.`},
{ id:'home', en:'Home', fa:'خانه', icon:'🏠', hue:200,
  gram:'There is / There are و حروف اضافهٔ مکان (in, on, under, next to)',
  talk:'خانه یا آپارتمانت را توصیف کن: چند اتاق دارد و در هر اتاق چه هست.',
  words:`house|haʊs|خانه|🏠|n|We live in a small house.
apartment|əˈpɑːrtmənt|آپارتمان|🏬|n|Our apartment has two bedrooms.
door|dɔːr|در|🚪|n|Please close the door.
window|ˈwɪndoʊ|پنجره|🪟|n|Open the window, it's hot.
floor|flɔːr|کف / طبقه|🧱|n|We live on the third floor.
kitchen|ˈkɪtʃɪn|آشپزخانه|🍳|n|Mom is cooking in the kitchen.
living room|ˈlɪvɪŋ ruːm|اتاق نشیمن|🖼️|n|We watch TV in the living room.
bedroom|ˈbedruːm|اتاق خواب|🛏️|n|My bedroom is upstairs.
bathroom|ˈbæθruːm|حمام و دستشویی|🛁|n|The bathroom is on the left.
table|ˈteɪbəl|میز|🪵|n|Put the plates on the table.
chair|tʃer|صندلی|🪑|n|Sit on this chair.
bed|bed|تخت‌خواب|🛌|n|I go to bed at eleven.
sofa|ˈsoʊfə|کاناپه / مبل|🛋️|n|The cat is on the sofa.
fridge|frɪdʒ|یخچال|🧊|n|Put the milk in the fridge.
air conditioner|ˈer kənˌdɪʃənər|کولر|🌀|n|The air conditioner isn't working.
lamp|læmp|چراغ|💡|n|Turn on the lamp, please.
mirror|ˈmɪrər|آینه|🪞|n|She looked in the mirror.
key|kiː|کلید|🔑|n|I can't find my keys.
neighbor|ˈneɪbər|همسایه|🏘️|n|Our neighbors are very kind.
rent|rent|اجاره کردن / اجاره|🏷️|v|We rent an apartment in Tehran.
clean|kliːn|تمیز کردن|🧹|v|I clean the house on Fridays.`},
{ id:'jobs', en:'Jobs & Workplaces', fa:'شغل‌ها و محل کار', icon:'💼', hue:220,
  gram:'حال ساده برای کار و شغل: She works in a hospital. What do you do?',
  talk:'شغل خودت یا شغلی که دوست داری را توضیح بده: کجا کار می‌کنی و چه می‌کنی.',
  words:`job|dʒɑːb|شغل|💼|n|I'm looking for a new job.
work|wɜːrk|کار کردن|🧑‍💻|v|Where do you work?
company|ˈkʌmpəni|شرکت|🏢|n|She works for a big company.
teacher|ˈtiːtʃər|معلم|🧑‍🏫|n|My teacher is very kind.
doctor|ˈdɑːktər|پزشک|🩺|n|You should see a doctor.
nurse|nɜːrs|پرستار|👩‍⚕️|n|The nurse is very helpful.
engineer|ˌendʒɪˈnɪr|مهندس|👷|n|She is a software engineer.
driver|ˈdraɪvər|راننده|🚘|n|The taxi driver was friendly.
chef|ʃef|آشپز (رستوران)|🧑‍🍳|n|The chef cooks Italian food.
farmer|ˈfɑːrmər|کشاورز|🧑‍🌾|n|The farmer grows wheat.
police officer|pəˈliːs ˌɔːfɪsər|مأمور پلیس|👮|n|Ask the police officer for help.
firefighter|ˈfaɪərˌfaɪtər|آتش‌نشان|🧑‍🚒|n|Firefighters are very brave.
pilot|ˈpaɪlət|خلبان|🧑‍✈️|n|The pilot is flying to Tehran.
lawyer|ˈlɔːjər|وکیل|👨‍⚖️|n|He needs a good lawyer.
accountant|əˈkaʊntənt|حسابدار|🧮|n|My sister is an accountant.
mechanic|məˈkænɪk|مکانیک|🔧|n|The mechanic fixed my car.
shop assistant|ˈʃɑːp əˌsɪstənt|فروشنده|🏪|n|The shop assistant helped me.
earn|ɜːrn|درآمد داشتن|💵|v|She earns a good salary.
retired|rɪˈtaɪərd|بازنشسته|🧓|adj|My father is retired.
unemployed|ˌʌnɪmˈplɔɪd|بیکار|🪫|adj|He's unemployed at the moment.`},
{ id:'food', en:'Food & Drinks', fa:'غذا و نوشیدنی', icon:'🍽️', hue:30,
  gram:'اسم‌های شمارش‌پذیر و ناشمارش (some / any، How many / How much) و I like / I don\'t like',
  talk:'بگو صبحانه، ناهار و شام معمولاً چه می‌خوری و غذای محبوبت چیست.',
  words:`bread|bred|نان|🍞|n|We buy fresh bread every day.
rice|raɪs|برنج|🍚|n|Rice is popular in Iran.
meat|miːt|گوشت|🥩|n|I don't eat red meat.
chicken|ˈtʃɪkɪn|مرغ|🍗|n|Chicken kebab is delicious.
fish|fɪʃ|ماهی|🐟|n|Fish is good for your health.
egg|eɡ|تخم‌مرغ|🥚|n|I eat two eggs for breakfast.
cheese|tʃiːz|پنیر|🧀|n|Can I have cheese on my sandwich?
milk|mɪlk|شیر|🥛|n|Drink a glass of milk.
soup|suːp|سوپ|🍲|n|This soup is too hot.
salad|ˈsæləd|سالاد|🥗|n|I'd like a green salad.
tea|tiː|چای|🍵|n|Would you like a cup of tea?
water|ˈwɔːtər|آب|💧|n|Please drink more water.
breakfast|ˈbrekfəst|صبحانه|🥞|n|Breakfast is ready.
lunch|lʌntʃ|ناهار|🥪|n|Let's have lunch together.
dinner|ˈdɪnər|شام|🍝|n|We have dinner at eight.
hungry|ˈhʌŋɡri|گرسنه|😋|adj|I'm hungry.
thirsty|ˈθɜːrsti|تشنه|🥤|adj|I'm thirsty. Can I have some water?
delicious|dɪˈlɪʃəs|خوشمزه|🤤|adj|This kebab is delicious.
order|ˈɔːrdər|سفارش دادن|🛎️|v|Are you ready to order?
bill|bɪl|صورت‌حساب|💵|n|Can I have the bill, please?
I'd like|aɪd laɪk|… می‌خواهم (مؤدبانه)|🙋|phr|I'd like a coffee, please.
apple|ˈæpəl|سیب|🍎|n|An apple a day keeps the doctor away.
orange|ˈɔːrɪndʒ|پرتقال|🍊|n|I drink orange juice every morning.
banana|bəˈnænə|موز|🍌|n|Monkeys love bananas.
grapes|ɡreɪps|انگور|🍇|n|These grapes are very sweet.
watermelon|ˈwɔːtərˌmelən|هندوانه|🍉|n|Watermelon is perfect for summer.
strawberry|ˈstrɔːˌberi|توت‌فرنگی|🍓|n|She put strawberries on the cake.
lemon|ˈlemən|لیمو|🍋|n|Add some lemon to the tea.
mango|ˈmæŋɡoʊ|انبه|🥭|n|I love mango juice.
dates|deɪts|خرما|🌴|n|Bam is famous for its dates.
vegetables|ˈvedʒtəbəlz|سبزیجات|🥬|n|Eat more vegetables.
tomato|təˈmeɪtoʊ|گوجه‌فرنگی|🍅|n|Cut the tomatoes for the salad.
potato|pəˈteɪtoʊ|سیب‌زمینی|🥔|n|I'd like fried potatoes.`},
{ id:'abilities', en:'Sports & Talents', fa:'ورزش و توانایی‌ها', icon:'🏊', hue:115,
  gram:'can و can\'t برای توانایی: I can swim. Can you cook? Yes, I can. / No, I can\'t.',
  talk:'بگو چه کارهایی بلدی و چه کارهایی بلد نیستی؛ از دیگران بپرس چه استعدادی دارند.',
  words:`can|kæn|می‌توانم؛ بلدم|💪|v|I can swim very well.
can't|kænt|نمی‌توانم؛ بلد نیستم|🚫|v|I can't drive.
swim|swɪm|شنا کردن|🏊|v|Can you swim?
cook|kʊk|آشپزی کردن|🍳|v|My father can cook very well.
sing|sɪŋ|آواز خواندن|🎤|v|She can sing beautifully.
dance|dæns|رقصیدن|💃|v|I can't dance at all.
draw|drɔː|طراحی کردن؛ کشیدن|✏️|v|My son can draw cats.
paint|peɪnt|نقاشی کردن (با رنگ)|🎨|v|She paints in her free time.
play the guitar|pleɪ ðə ɡɪˈtɑːr|گیتار زدن|🎸|phr|Can you play the guitar?
play the piano|pleɪ ðə piˈænoʊ|پیانو زدن|🎹|phr|My sister plays the piano.
play soccer|pleɪ ˈsɑːkər|فوتبال بازی کردن|⚽|phr|We play soccer on Fridays.
play volleyball|pleɪ ˈvɑːlibɔːl|والیبال بازی کردن|🏐|phr|They play volleyball at the park.
ride a bike|raɪd ə baɪk|دوچرخه‌سواری کردن|🚲|phr|My daughter can ride a bike.
run|rʌn|دویدن|🏃|v|I run every morning.
ski|skiː|اسکی کردن|⛷️|v|Can you ski?
fix|fɪks|تعمیر کردن|🔧|v|He can fix cars.
sport|spɔːrt|ورزش|🏅|n|What's your favorite sport?
team|tiːm|تیم|👥|n|Our team is very good.
well|wel|خوب (به‌خوبی)|👍|adv|She speaks English very well.
at all|ət ˈɔːl|اصلاً (در جملهٔ منفی)|❌|phr|I can't sing at all.
talent|ˈtælənt|استعداد|🌟|n|Cooking is my talent.
good at|ˈɡʊd æt|در … خوب بودن|🏆|phr|I'm good at math.`},
{ id:'dates', en:'Dates & Birthdays', fa:'تاریخ‌ها و تولد', icon:'🎂', hue:325,
  gram:'اعداد ترتیبی (first, second…)، ماه‌ها و روزها، و be going to برای برنامه: I\'m going to have a party.',
  talk:'بگو تولدت کی است و برای تولد یا آخر هفته‌ات چه برنامه‌ای داری.',
  words:`birthday|ˈbɜːrθdeɪ|تولد|🎂|n|When's your birthday?
January|ˈdʒænjueri|ژانویه|❄️|n|My birthday is in January.
February|ˈfebrueri|فوریه|💌|n|February is a short month.
March|mɑːrtʃ|مارس|🌱|n|Nowruz is in March.
April|ˈeɪprəl|آوریل|🌷|n|It rains a lot in April.
May|meɪ|مه|🌼|n|Her wedding is in May.
June|dʒuːn|ژوئن|🌞|n|School finishes in June.
July|dʒuˈlaɪ|ژوئیه|🏖️|n|It's very hot in July.
August|ˈɔːɡəst|اوت|🍉|n|We travel in August.
September|sepˈtembər|سپتامبر|🍂|n|Classes start in September.
October|ɑːkˈtoʊbər|اکتبر|🎃|n|My exam is in October.
November|noʊˈvembər|نوامبر|🍁|n|It's November now.
December|dɪˈsembər|دسامبر|🎄|n|December is the last month.
Monday|ˈmʌndeɪ|دوشنبه|1️⃣|n|I have class on Monday.
Saturday|ˈsætərdeɪ|شنبه|🛋️|n|See you on Saturday!
first|fɜːrst|اول|🥇|adj|My birthday is on May first.
second|ˈsekənd|دوم|🥈|adj|It's the second of June.
third|θɜːrd|سوم|🥉|adj|Today is March third.
date|deɪt|تاریخ|📅|n|What's the date today?
party|ˈpɑːrti|مهمانی|🎉|n|I'm going to have a party.
present|ˈprezənt|هدیه|🎁|n|Thank you for the present!
be going to|bi ˈɡoʊɪŋ tə|قصد داشتن؛ می‌خواهم (برنامه)|➡️|phr|We're going to visit my grandmother.
celebrate|ˈseləbreɪt|جشن گرفتن|🥳|v|How do you celebrate your birthday?
Happy birthday!|ˈhæpi ˈbɜːrθdeɪ|تولدت مبارک!|🎈|phr|Happy birthday, Sara!`},
{ id:'body', en:'Body & Health', fa:'بدن و سلامتی', icon:'🧍', hue:20,
  gram:'What\'s the matter? / I have a headache. و جملهٔ امری برای توصیه (Take…, Don\'t…)',
  talk:'ظاهر یک نفر از خانواده یا دوستانت را توصیف کن.',
  words:`face|feɪs|صورت|😊|n|Wash your face every morning.
eye|aɪ|چشم|👁️|n|Close your eyes.
ear|ɪr|گوش|👂|n|I have a pain in my ear.
nose|noʊz|بینی|👃|n|My nose is cold.
mouth|maʊθ|دهان|👄|n|Open your mouth, please.
tooth|tuːθ|دندان (جمع: teeth)|🦷|n|I brush my teeth twice a day.
hair|her|مو|💇|n|She has long black hair.
neck|nek|گردن|🦒|n|My neck is stiff.
shoulder|ˈʃoʊldər|شانه|🤷|n|He has broad shoulders.
back|bæk|کمر / پشت|🧍|n|I have back pain.
arm|ɑːrm|بازو / دست|💪|n|He broke his arm.
hand|hænd|دست (از مچ به پایین)|✋|n|Raise your hand.
finger|ˈfɪŋɡər|انگشت|☝️|n|I cut my finger.
stomach|ˈstʌmək|معده / شکم|🤢|n|My stomach hurts.
leg|leɡ|پا (از ران تا مچ)|🦵|n|My legs are tired.
knee|niː|زانو|🧎|n|I hurt my knee playing football.
foot|fʊt|پا (از مچ به پایین؛ جمع: feet)|🦶|n|I hurt my foot.
heart|hɑːrt|قلب|🫀|n|Your heart beats fast when you run.
hurt|hɜːrt|درد کردن / آسیب زدن|🤕|v|My back hurts.
tall|tɔːl|قدبلند|📏|adj|My brother is very tall.
short|ʃɔːrt|کوتاه‌قد / کوتاه|📐|adj|She is short and slim.`},
{ id:'city', en:'Places & Directions', fa:'مکان‌ها و نشانی دادن', icon:'🏙️', hue:250,
  gram:'پرسیدن و دادن نشانی: Where is…? Go straight, turn left, it\'s next to…',
  talk:'مسیر خانه‌ات تا نزدیک‌ترین داروخانه یا سوپرمارکت را توضیح بده.',
  words:`street|striːt|خیابان|🛣️|n|Cross the street carefully.
hospital|ˈhɑːspɪtəl|بیمارستان|🏥|n|She works at the hospital.
bank|bæŋk|بانک|🏦|n|I need to go to the bank.
hotel|hoʊˈtel|هتل|🏨|n|Our hotel is near the beach.
restaurant|ˈrestərɑːnt|رستوران|🍽️|n|Let's eat at a restaurant tonight.
supermarket|ˈsuːpərˌmɑːrkɪt|سوپرمارکت|🛒|n|I buy food at the supermarket.
mall|mɔːl|مرکز خرید|🛍️|n|Let's meet at the mall.
park|pɑːrk|پارک|🛝|n|We walk in the park every evening.
mosque|mɑːsk|مسجد|🕌|n|The old mosque is beautiful.
museum|mjuˈziːəm|موزه|🏛️|n|The museum is closed on Mondays.
pharmacy|ˈfɑːrməsi|داروخانه|⚕️|n|Is there a pharmacy near here?
post office|ˈpoʊst ˌɔːfɪs|ادارهٔ پست|🏤|n|I sent a letter from the post office.
bridge|brɪdʒ|پل|🌉|n|The bridge crosses the river.
Where is…?|wer ɪz|… کجاست؟|❓|phr|Excuse me, where is the bank?
go straight|ɡoʊ streɪt|مستقیم بروید|⬆️|phr|Go straight for two blocks.
turn left|tɜːrn left|به چپ بپیچید|↩️|phr|Turn left at the traffic lights.
turn right|tɜːrn raɪt|به راست بپیچید|↪️|phr|Turn right after the bank.
next to|ˈnekst tuː|کنارِ|🤝|prep|The bank is next to the hotel.
opposite|ˈɑːpəzɪt|روبه‌روی|↔️|prep|The pharmacy is opposite the mosque.
near|nɪr|نزدیکِ|📍|prep|I live near the sea.
far|fɑːr|دور|🔭|adj|Is it far from here?`},
{ id:'weekend', en:'My Weekend', fa:'آخر هفته‌ام', icon:'🧺', hue:40,
  gram:'گذشتهٔ ساده (افعال باقاعده و بی‌قاعده): I watched…, I went…, Did you…? Yes, I did.',
  talk:'تعریف کن آخر هفتهٔ گذشته چه کار کردی و از دیگران بپرس آخر هفته‌شان چطور بود.',
  words:`weekend|ˈwiːkend|آخر هفته|🗓️|n|How was your weekend?
last weekend|læst ˈwiːkend|آخر هفتهٔ گذشته|⏪|phr|What did you do last weekend?
went|went|رفتم/رفت (گذشتهٔ go)|🚶|v|I went to the park.
watched|wɑːtʃt|تماشا کردم (گذشتهٔ watch)|📺|v|We watched a movie.
stayed home|steɪd hoʊm|خانه ماندم|🏠|phr|I stayed home and relaxed.
visited|ˈvɪzɪtɪd|دیدن کردم از (گذشتهٔ visit)|👵|v|I visited my grandparents.
cleaned|kliːnd|تمیز کردم (گذشتهٔ clean)|🧹|v|I cleaned the house on Saturday.
did|dɪd|انجام دادم (گذشتهٔ do)|✅|v|I did my homework.
had|hæd|داشتم؛ خوردم (گذشتهٔ have)|🍕|v|We had pizza for dinner.
saw|sɔː|دیدم (گذشتهٔ see)|👀|v|I saw my friends.
ate|eɪt|خوردم (گذشتهٔ eat)|🍽️|v|We ate at a nice restaurant.
bought|bɔːt|خریدم (گذشتهٔ buy)|🛍️|v|I bought new shoes.
slept|slept|خوابیدم (گذشتهٔ sleep)|😴|v|I slept late on Friday.
went shopping|went ˈʃɑːpɪŋ|خرید رفتم|🛒|phr|My sister went shopping.
had fun|hæd fʌn|خوش گذراندم|😄|phr|Did you have fun? Yes, I did!
relaxed|rɪˈlækst|استراحت کردم|🧘|v|I relaxed all day.
Did you…?|dɪd juː|آیا … کردی؟|❓|phr|Did you go out last night?
Yes, I did.|jes aɪ dɪd|بله، (کردم).|👍|phr|Did you like the movie? Yes, I did.
No, I didn't.|noʊ aɪ ˈdɪdənt|نه، (نکردم).|👎|phr|Did you work on Saturday? No, I didn't.
yesterday|ˈjestərdeɪ|دیروز|⬅️|adv|I was very busy yesterday.
last night|læst ˈnaɪt|دیشب|🌃|phr|I watched TV last night.
ago|əˈɡoʊ|پیش (… قبل)|⏳|adv|I saw her two days ago.`},
{ id:'lifestory', en:'My Life Story', fa:'داستان زندگی من', icon:'📖', hue:270,
  gram:'گذشتهٔ فعل to be (was / were) و سؤال‌های When / Where با گذشته: Where were you born?',
  talk:'زندگی‌ات را کوتاه تعریف کن: کجا به دنیا آمدی، کجا درس خواندی و چه چیزهای مهمی اتفاق افتاد.',
  words:`born|bɔːrn|به دنیا آمده|👶|adj|I was born in Mashhad.
was|wʌz|بودم/بود (گذشتهٔ am/is)|🕰️|v|I was a shy child.
were|wɜːr|بودیم/بودند/بودی (گذشتهٔ are)|👫|v|Where were you born?
grow up|ˌɡroʊ ˈʌp|بزرگ شدن|🌱|phr|I grew up in a small town.
childhood|ˈtʃaɪldhʊd|کودکی|🧸|n|I had a happy childhood.
school|skuːl|مدرسه|🏫|n|My school was near my house.
university|ˌjuːnɪˈvɜːrsəti|دانشگاه|🎓|n|She went to Tehran University.
study|ˈstʌdi|درس خواندن؛ تحصیل کردن|📚|v|I studied computer science.
graduate|ˈɡrædʒueɪt|فارغ‌التحصیل شدن|👩‍🎓|v|He graduated in 2015.
get married|ɡet ˈmerid|ازدواج کردن|💍|phr|They got married in 2018.
move|muːv|نقل مکان کردن|📦|v|We moved to Shiraz last year.
start|stɑːrt|شروع کردن|▶️|v|I started my first job at 22.
first job|ˈfɜːrst dʒɑːb|اولین شغل|💼|n|My first job was in a bank.
favorite|ˈfeɪvərɪt|مورد علاقه|❤️|adj|My favorite teacher was Mr. Karimi.
teacher|ˈtiːtʃər|معلم|👩‍🏫|n|My teacher was very kind.
classmate|ˈklæsmeɪt|همکلاسی|🧑‍🤝‍🧑|n|She was my classmate.
shy|ʃaɪ|خجالتی|🙈|adj|I was very shy at school.
happy|ˈhæpi|خوشحال|😊|adj|Those were happy days.
When…?|wen|کِی…؟|🗓️|phr|When did you move to Tehran?
in (year)|ɪn|در (سالِ)|📆|prep|I was born in 1995.
age|eɪdʒ|سن|🔢|n|At the age of 18, I started university.
remember|rɪˈmembər|به یاد داشتن|🧠|v|I remember my first day at school.`},
{ id:'phone', en:'Calls & Invitations', fa:'تماس تلفنی و دعوت', icon:'📞', hue:195,
  gram:'would like / want to برای دعوت و پیشنهاد، و ضمیرهای مفعولی (me, him, her, us, them)',
  talk:'تلفنی کسی را بخواه، پیغام بگذار، کسی را به جایی دعوت کن و دعوت را مؤدبانه قبول یا رد کن.',
  words:`call|kɔːl|تلفن زدن|📞|v|Can I call you tonight?
call back|ˌkɔːl ˈbæk|دوباره زنگ زدن|🔁|phr|Can she call me back, please?
Hello, this is…|həˈloʊ ðɪs ɪz|الو، … هستم|☎️|phr|Hello, this is Ali. Is Sara there?
Can I speak to…?|kæn aɪ spiːk tə|می‌توانم با … صحبت کنم؟|🗣️|phr|Can I speak to Mr. Rahimi, please?
Just a minute.|dʒʌst ə ˈmɪnɪt|یک لحظه صبر کنید.|⏱️|phr|Just a minute, please.
message|ˈmesɪdʒ|پیغام؛ پیام|💬|n|Can I take a message?
leave a message|liːv ə ˈmesɪdʒ|پیغام گذاشتن|📝|phr|Can I leave a message for her?
busy|ˈbɪzi|سرش شلوغ است؛ (خط) اشغال|⏳|adj|Sorry, he's busy right now.
invite|ɪnˈvaɪt|دعوت کردن|💌|v|I want to invite you to my party.
Would you like to…?|wʊd ju laɪk tə|دوست داری …؟ (دعوت مؤدبانه)|🙂|phr|Would you like to see a movie?
I'd love to.|aɪd ˈlʌv tə|خیلی دوست دارم؛ با کمال میل|😍|phr|I'd love to. What time?
I'm sorry, I can't.|aɪm ˈsɑːri aɪ kænt|ببخشید، نمی‌توانم.|🙏|phr|I'm sorry, I can't. I have to work.
Let's…|lets|بیا … (پیشنهاد)|👫|phr|Let's go for coffee.
How about…?|haʊ əˈbaʊt|نظرت دربارهٔ … چیست؟|🤔|phr|How about Friday evening?
tonight|təˈnaɪt|امشب|🌙|adv|Are you free tonight?
free|friː|بیکار؛ وقت آزاد|🆓|adj|Are you free on Saturday?
meet|miːt|ملاقات کردن؛ دیدن|🤝|v|Let's meet at seven.
me|miː|مرا؛ به من|🙋|pron|Call me later.
him|hɪm|او را (مرد)|👨|pron|Can you ask him?
her|hɜːr|او را (زن)|👩|pron|I invited her to the party.
us|ʌs|ما را|👥|pron|Do you want to join us?
them|ðem|آن‌ها را|👪|pron|I see them every week.`}
]},
{ id:'l1', fa:'سطح ۱', en:'Level 1 · A2', units:[
{ id:'transport', en:'Transportation', fa:'حمل‌ونقل', icon:'🚗', hue:5,
  gram:'by car / by bus / on foot و سؤال How do you get to…?',
  talk:'بگو هر روز چطور به سر کار یا کلاس می‌روی و چقدر طول می‌کشد.',
  words:`car|kɑːr|ماشین|🚗|n|I go to work by car.
bus|bʌs|اتوبوس|🚌|n|The bus is late again.
taxi|ˈtæksi|تاکسی|🚕|n|Let's take a taxi.
train|treɪn|قطار|🚆|n|The train leaves at eight.
plane|pleɪn|هواپیما|✈️|n|Our plane lands at noon.
ship|ʃɪp|کشتی (دریایی)|🚢|n|The ship crossed the sea.
bicycle|ˈbaɪsɪkəl|دوچرخه|🚲|n|I ride my bicycle to school.
motorcycle|ˈmoʊtərˌsaɪkəl|موتورسیکلت|🏍️|n|He rides a motorcycle.
truck|trʌk|کامیون|🚚|n|The truck is carrying fruit.
subway|ˈsʌbweɪ|مترو|🚇|n|The subway is faster than the bus.
station|ˈsteɪʃən|ایستگاه|🚉|n|Where is the bus station?
ticket|ˈtɪkɪt|بلیت|🎫|n|I bought two tickets.
fare|fer|کرایه|💸|n|How much is the taxi fare?
traffic|ˈtræfɪk|ترافیک|🚦|n|There's a lot of traffic today.
parking|ˈpɑːrkɪŋ|پارکینگ / جای پارک|🅿️|n|Is there parking near here?
driver's license|ˈdraɪvərz ˌlaɪsəns|گواهینامه|🪪|n|I need a new driver’s license.
seat belt|ˈsiːt belt|کمربند ایمنی|🔒|n|Fasten your seat belt.
drive|draɪv|رانندگی کردن|🚘|v|Can you drive?
get on|ɡet ɑːn|سوار شدن (اتوبوس، قطار)|🚏|phr|Get on the bus here.
get off|ɡet ɔːf|پیاده شدن|🛑|phr|Get off at the next stop.
miss|mɪs|از دست دادن (وسیلهٔ نقلیه)|🏃‍♂️|v|Hurry up or we'll miss the train.`},
{ id:'weather', en:'Weather & Nature', fa:'آب‌وهوا و طبیعت', icon:'🌤️', hue:190,
  gram:'It\'s + صفت (It\'s hot) و گذشتهٔ to be: It was rainy yesterday.',
  talk:'آب‌وهوای شهر خودت را توصیف کن و با یک شهر دیگر مقایسه کن.',
  words:`weather|ˈweðər|آب‌وهوا|🌦️|n|What's the weather like today?
sun|sʌn|خورشید|☀️|n|The sun is shining.
sunny|ˈsʌni|آفتابی|🌞|adj|It's sunny and hot.
rain|reɪn|باران|🌧️|n|Take an umbrella; it might rain.
rainy|ˈreɪni|بارانی|☔|adj|It was rainy yesterday.
cloud|klaʊd|ابر|☁️|n|There isn't a cloud in the sky.
cloudy|ˈklaʊdi|ابری|🌥️|adj|It's cloudy this morning.
snow|snoʊ|برف|❄️|n|The children are playing in the snow.
wind|wɪnd|باد|🌬️|n|The wind is very strong today.
storm|stɔːrm|طوفان|⛈️|n|A big storm is coming.
hot|hɑːt|گرم / داغ|🥵|adj|It's very hot in summer.
cold|koʊld|سرد|🥶|adj|It's cold outside.
humid|ˈhjuːmɪd|شرجی / مرطوب|💦|adj|Bandar Abbas is very humid in summer.
temperature|ˈtemprətʃər|دما|🌡️|n|The temperature is 45 degrees.
season|ˈsiːzən|فصل|🍂|n|Spring is the best season in Shiraz.
mountain|ˈmaʊntən|کوه|⛰️|n|We climbed the mountain.
sea|siː|دریا|🌊|n|Let's swim in the sea.
desert|ˈdezərt|بیابان|🏜️|n|The desert is beautiful at night.
river|ˈrɪvər|رودخانه|🏞️|n|There is a river near the village.
tree|triː|درخت|🌳|n|There's a big tree in our garden.
flower|ˈflaʊər|گل|🌷|n|He gave her a flower.`},
{ id:'feelings', en:'Feelings', fa:'احساسات', icon:'😊', hue:50,
  gram:'صفت‌های ‑ed و ‑ing: I\'m bored. / The film is boring.',
  talk:'بگو امروز چه حسی داری و چه چیزهایی تو را خوشحال یا نگران می‌کند.',
  words:`feel|fiːl|احساس کردن|💭|v|How do you feel today?
happy|ˈhæpi|خوشحال|😄|adj|I'm so happy to see you.
sad|sæd|ناراحت|😢|adj|Why are you sad?
angry|ˈæŋɡri|عصبانی|😠|adj|Don't be angry with me.
tired|ˈtaɪərd|خسته|😩|adj|I'm tired after work.
afraid|əˈfreɪd|ترسان؛ (از چیزی) ترسیدن|😨|adj|She is afraid of dogs.
surprised|sərˈpraɪzd|متعجب|😲|adj|I was surprised by the news.
bored|bɔːrd|کسل (حوصله‌سررفته)|🥱|adj|I'm bored; let's go out.
boring|ˈbɔːrɪŋ|خسته‌کننده|😐|adj|The movie was boring.
interesting|ˈɪntrəstɪŋ|جالب|🤔|adj|This book is really interesting.
excited|ɪkˈsaɪtɪd|هیجان‌زده|🤩|adj|The kids are excited about the trip.
worried|ˈwɜːrid|نگران|😟|adj|My mother is worried about me.
nervous|ˈnɜːrvəs|مضطرب|😬|adj|I'm nervous before exams.
proud|praʊd|سربلند / مفتخر|🎖️|adj|We are proud of you.
calm|kɑːm|آرام|😌|adj|Stay calm and listen.
relaxed|rɪˈlækst|آسوده|🛀|adj|I feel relaxed on holiday.
lonely|ˈloʊnli|تنها (احساس تنهایی)|🥺|adj|I feel lonely sometimes.
love|lʌv|عاشق … بودن / خیلی دوست داشتن|❤️|v|I love my family.
hate|heɪt|متنفر بودن|👎|v|I hate waiting.
miss|mɪs|دلتنگِ … بودن|💌|v|I miss my family in Iran.`},
{ id:'school', en:'School & Learning', fa:'تحصیل و یادگیری', icon:'🎓', hue:265,
  gram:'گذشتهٔ ساده: افعال باقاعده (studied) و بی‌قاعده (went, wrote, forgot)',
  talk:'از دوران مدرسه یا دانشگاهت تعریف کن: چه درسی را دوست داشتی و چرا.',
  words:`book|bʊk|کتاب|📚|n|I'm reading a good book.
pen|pen|خودکار|🖊️|n|Can I borrow your pen?
pencil|ˈpensəl|مداد|✏️|n|Write it with a pencil.
notebook|ˈnoʊtbʊk|دفتر|📓|n|Write the new words in your notebook.
dictionary|ˈdɪkʃəˌneri|فرهنگ لغت|📕|n|Look it up in the dictionary.
classroom|ˈklæsruːm|کلاس درس|🏫|n|The classroom is on the second floor.
homework|ˈhoʊmwɜːrk|تکلیف|📝|n|Did you do your homework?
exam|ɪɡˈzæm|امتحان|💯|n|I have an exam tomorrow.
question|ˈkwestʃən|سؤال|❓|n|Can I ask a question?
answer|ˈænsər|جواب|💬|n|I know the answer!
study|ˈstʌdi|درس خواندن|🤓|v|I study English every day.
learn|lɜːrn|یاد گرفتن|🧠|v|We learn something new every day.
teach|tiːtʃ|درس دادن|🧑‍🏫|v|She teaches math.
understand|ˌʌndərˈstænd|فهمیدن|💡|v|I don't understand. Can you repeat?
repeat|rɪˈpiːt|تکرار کردن|🔁|v|Please repeat after me.
remember|rɪˈmembər|به یاد آوردن|🧩|v|I can't remember his name.
forget|fərˈɡet|فراموش کردن|🙈|v|Don't forget your homework.
mean|miːn|معنی دادن|🔤|v|What does this word mean?
spell|spel|هجی کردن|🔡|v|How do you spell your name?
pass|pæs|قبول شدن|✔️|v|I passed the exam!
fail|feɪl|رد شدن|❌|v|He failed the driving test.`},
{ id:'sports', en:'Sports & Exercise', fa:'ورزش', icon:'⚽', hue:120,
  gram:'like / love / hate + فعل ‑ing: I love swimming.',
  talk:'بگو چه ورزشی می‌کنی یا دوست داری، و آخرین مسابقه‌ای که دیدی چطور بود.',
  words:`football|ˈfʊtbɔːl|فوتبال|⚽|n|Football is the most popular sport in Iran.
basketball|ˈbæskɪtbɔːl|بسکتبال|🏀|n|He plays basketball very well.
volleyball|ˈvɑːlibɔːl|والیبال|🏐|n|Iran has a strong volleyball team.
tennis|ˈtenɪs|تنیس|🎾|n|Do you play tennis?
swimming|ˈswɪmɪŋ|شنا|🏊|n|Swimming is great exercise.
running|ˈrʌnɪŋ|دویدن|🏃|n|I go running every morning.
wrestling|ˈreslɪŋ|کشتی (ورزش)|🤼|n|Wrestling is a traditional sport in Iran.
cycling|ˈsaɪklɪŋ|دوچرخه‌سواری|🚴|n|Cycling is good for your heart.
hiking|ˈhaɪkɪŋ|کوه‌پیمایی|🥾|n|We go hiking in the mountains.
gym|dʒɪm|باشگاه ورزشی|🏋️|n|I go to the gym after work.
team|tiːm|تیم|🙌|n|Our team won the game.
player|ˈpleɪər|بازیکن|🏃‍♀️|n|He is a famous player.
coach|koʊtʃ|مربی|📣|n|The coach is very strict.
match|mætʃ|مسابقه|🏟️|n|Did you watch the match last night?
play|pleɪ|بازی کردن|🎮|v|Let's play football.
win|wɪn|بردن|🏆|v|I hope we win tomorrow.
lose|luːz|باختن|😞|v|We lost the game.
score|skɔːr|گل زدن / امتیاز گرفتن|🎯|v|He scored two goals.
exercise|ˈeksərsaɪz|ورزش کردن|🤸|v|I exercise three times a week.
fit|fɪt|روی فرم / سرحال|🏅|adj|She is very fit.`},
{ id:'health', en:'Health', fa:'سلامت', icon:'🩺', hue:355,
  gram:'should / shouldn\'t برای توصیه: You should rest. You shouldn\'t smoke.',
  talk:'آخرین باری که مریض شدی را تعریف کن و به یک دوست بیمار توصیه کن.',
  words:`medicine|ˈmedɪsən|دارو|💊|n|Take this medicine after meals.
headache|ˈhedeɪk|سردرد|🤕|n|I have a terrible headache.
fever|ˈfiːvər|تب|🤒|n|The child has a high fever.
cough|kɔːf|سرفه|😷|n|He has a bad cough.
sore throat|ˌsɔːr ˈθroʊt|گلودرد|🗣️|n|I have a sore throat.
stomachache|ˈstʌməkeɪk|دل‌درد|😖|n|I have a stomachache.
pain|peɪn|درد|😣|n|I have a pain in my back.
allergy|ˈælərdʒi|حساسیت|🤧|n|I have an allergy to nuts.
sick|sɪk|بیمار|🤢|adj|I feel sick today.
healthy|ˈhelθi|سالم|🥦|adj|Fruit keeps you healthy.
feel better|fiːl ˈbetər|حال بهتری داشتن|🙂|phr|I feel better today.
appointment|əˈpɔɪntmənt|نوبت (پزشک)|📋|n|I have an appointment at four.
prescription|prɪˈskrɪpʃən|نسخه|🧾|n|You need a prescription for this medicine.
dentist|ˈdentɪst|دندان‌پزشک|😁|n|I go to the dentist twice a year.
injection|ɪnˈdʒekʃən|آمپول / تزریق|💉|n|The nurse gave me an injection.
ambulance|ˈæmbjələns|آمبولانس|🚑|n|Call an ambulance!
emergency|ɪˈmɜːrdʒənsi|اورژانس / وضعیت اضطراری|🚨|n|In an emergency, call 911 in the US.
insurance|ɪnˈʃʊrəns|بیمه|🛡️|n|Do you have health insurance?
rest|rest|استراحت کردن|🧘|v|You need to rest for a few days.`},
{ id:'travel', en:'Travel', fa:'سفر', icon:'🧳', hue:180,
  gram:'آیندهٔ برنامه‌ریزی‌شده با be going to: I\'m going to visit Isfahan.',
  talk:'برنامهٔ سفر بعدی‌ات را تعریف کن: کجا، با چه، کی و چه کارهایی.',
  words:`trip|trɪp|سفر (کوتاه)|🚙|n|Have a good trip!
passport|ˈpæspɔːrt|گذرنامه|🛂|n|Don't forget your passport.
visa|ˈviːzə|ویزا|📄|n|Do I need a visa for Canada?
suitcase|ˈsuːtkeɪs|چمدان|🧳|n|My suitcase is very heavy.
luggage|ˈlʌɡɪdʒ|بار و چمدان|🎒|n|Where can I collect my luggage?
airport|ˈerpɔːrt|فرودگاه|🛫|n|We arrived at the airport early.
flight|flaɪt|پرواز|🛬|n|Our flight was delayed.
map|mæp|نقشه|🗺️|n|Can you show me on the map?
beach|biːtʃ|ساحل|🏖️|n|Let's go to the beach.
tourist|ˈtʊrɪst|گردشگر|📸|n|Many tourists visit Isfahan.
reservation|ˌrezərˈveɪʃən|رزرو|🏷️|n|I have a reservation for two nights.
souvenir|ˌsuːvəˈnɪr|سوغاتی|🎁|n|I bought a souvenir for my friend.
book|bʊk|رزرو کردن|📲|v|I booked a hotel online.
check in|ˌtʃek ˈɪn|پذیرش گرفتن / چک‌این کردن|🛎️|phr|We can check in after two o'clock.
check out|ˌtʃek ˈaʊt|تحویل اتاق و ترک هتل|🔑|phr|We have to check out by noon.
arrive|əˈraɪv|رسیدن|📍|v|We arrived in Istanbul at night.
delay|dɪˈleɪ|تأخیر|⏰|n|There is a two-hour delay.
round trip|ˌraʊnd ˈtrɪp|رفت‌وبرگشت|🔄|n|A round-trip ticket, please.
exchange money|ɪksˈtʃeɪndʒ ˈmʌni|پول تبدیل کردن|💱|phr|Where can I exchange money?`},
{ id:'work', en:'Work & Office', fa:'کار و محیط کار', icon:'🗂️', hue:235,
  gram:'حال کامل ساده: I have worked here for two years. Have you ever…?',
  talk:'خودت را برای یک مصاحبهٔ کاری معرفی کن: تجربه، مهارت‌ها و هدف‌هایت.',
  words:`office|ˈɔːfɪs|دفتر کار / اداره|🏢|n|I get to the office at eight.
computer|kəmˈpjuːtər|رایانه|💻|n|My computer is very slow.
meeting|ˈmiːtɪŋ|جلسه|🤝|n|We have a meeting at ten.
email|ˈiːmeɪl|ایمیل|📧|n|I'll send you an email.
boss|bɔːs|رئیس|🧑‍💼|n|My boss is on holiday.
colleague|ˈkɑːliːɡ|همکار|👥|n|My colleagues are very friendly.
salary|ˈsæləri|حقوق|💰|n|We get our salary at the end of the month.
report|rɪˈpɔːrt|گزارش|📊|n|Please read this report.
deadline|ˈdedlaɪn|مهلت انجام کار|🚩|n|The deadline is next Friday.
contract|ˈkɑːntrækt|قرارداد|📜|n|Please sign the contract.
customer|ˈkʌstəmər|مشتری|🛍️|n|The customer is always right.
interview|ˈɪntərvjuː|مصاحبه|🎙️|n|I have a job interview tomorrow.
experience|ɪkˈspɪriəns|تجربه|📈|n|I have five years of experience.
skill|skɪl|مهارت|🛠️|n|Communication is an important skill.
resume|ˈrezəmeɪ|رزومه|📄|n|Please send us your resume.
apply for|əˈplaɪ fɔːr|درخواست دادن برای|📨|phr|I applied for a job at the airport.
send|send|فرستادن|📤|v|Can you send me the file?
on time|ɑːn taɪm|سر وقت|⏱️|phr|Please be on time for the meeting.
day off|ˌdeɪ ˈɔːf|روز مرخصی|🌴|n|Can I take a day off tomorrow?
overtime|ˈoʊvərtaɪm|اضافه‌کاری|🌙|n|I work overtime on Thursdays.`},
{ id:'animals', en:'Animals', fa:'حیوانات', icon:'🐾', hue:140,
  gram:'can / can\'t برای توانایی: Birds can fly. Fish can\'t walk.',
  talk:'دربارهٔ حیوان مورد علاقه‌ات بگو: کجا زندگی می‌کند و چه کارهایی می‌تواند بکند.',
  words:`cat|kæt|گربه|🐈|n|My cat sleeps all day.
dog|dɔːɡ|سگ|🐕|n|The dog is barking.
bird|bɜːrd|پرنده|🐦|n|A bird is singing in the tree.
horse|hɔːrs|اسب|🐎|n|He rides a horse.
cow|kaʊ|گاو|🐄|n|Cows give us milk.
sheep|ʃiːp|گوسفند|🐑|n|The sheep are in the field.
goat|ɡoʊt|بز|🐐|n|There are many goats on the farm.
camel|ˈkæməl|شتر|🐫|n|Camels can live in the desert.
lion|ˈlaɪən|شیر (حیوان)|🦁|n|Lions live in Africa.
elephant|ˈelɪfənt|فیل|🐘|n|Elephants have big ears.
monkey|ˈmʌŋki|میمون|🐒|n|The monkey is eating a banana.
rabbit|ˈræbɪt|خرگوش|🐇|n|The rabbit has long ears.
snake|sneɪk|مار|🐍|n|Be careful, there's a snake!
turtle|ˈtɜːrtəl|لاک‌پشت|🐢|n|Sea turtles lay eggs on the beach.
dolphin|ˈdɑːlfɪn|دلفین|🐬|n|You can see dolphins in the Persian Gulf.
pet|pet|حیوان خانگی|🐾|n|Do you have a pet?
wild|waɪld|وحشی|🐺|adj|Lions are wild animals.
feed|fiːd|غذا دادن|🥣|v|Don't feed the animals.
fly|flaɪ|پرواز کردن|🕊️|v|Birds can fly.
swim|swɪm|شنا کردن|🏊|v|Fish can swim.`}
]},
{ id:'l2', fa:'سطح ۲', en:'Level 2 · A2+/B1', units:[
{ id:'shopping', en:'Shopping & Money', fa:'خرید و پول', icon:'💳', hue:150, gram:'صفت تفضیلی و عالی: cheaper, the cheapest, more expensive', talk:'از آخرین خرید مهمت بگو و قیمت‌ها را مقایسه کن.' },
{ id:'eatingout', en:'Eating Out', fa:'غذا خوردن بیرون', icon:'🍜', hue:25, gram:'سفارش مؤدبانه: I\'ll have…, Could I have…?, would like', talk:'در یک رستوران غذا سفارش بده و دربارهٔ طعم‌ها نظر بده.' },
{ id:'freetime', en:'Free Time & Hobbies', fa:'اوقات فراغت', icon:'🎸', hue:280, gram:'گذشتهٔ استمراری: I was watching TV when…', talk:'آخر هفتهٔ گذشته‌ات را با جزئیات تعریف کن.' },
{ id:'tech', en:'Technology', fa:'فناوری', icon:'📱', hue:210, gram:'حال کامل با ever / never / already / yet', talk:'بگو از چه اپ‌ها و دستگاه‌هایی استفاده می‌کنی و چرا.' },
{ id:'housing', en:'Renting & Housing', fa:'اجاره و مسکن', icon:'🔑', hue:35, gram:'too و enough: It\'s too small. It isn\'t big enough.', talk:'با صاحبخانه دربارهٔ یک مشکل خانه حرف بزن.' },
{ id:'banking', en:'Banks & Services', fa:'بانک و خدمات', icon:'🏦', hue:160, gram:'درخواست مؤدبانه: Could you…? Would you mind…ing?', talk:'در بانک برای باز کردن حساب یا انتقال پول درخواست کن.' },
{ id:'people', en:'Personality & Appearance', fa:'شخصیت و ظاهر', icon:'🧑‍🤝‍🧑', hue:310, gram:'صفت و قید: quick / quickly، good / well', talk:'بهترین دوستت را از نظر ظاهر و اخلاق توصیف کن.' },
{ id:'plans', en:'Future Plans', fa:'برنامه‌های آینده', icon:'🎯', hue:15, gram:'will و be going to و حال استمراری برای آینده', talk:'دربارهٔ برنامه‌هایت برای سال آینده حرف بزن.' },
{ id:'past', en:'Life Experiences', fa:'تجربه‌های زندگی', icon:'📸', hue:55, gram:'used to و مقایسهٔ گذشتهٔ ساده با حال کامل', talk:'زندگی‌ات را الان با چند سال پیش مقایسه کن.' },
{ id:'environment', en:'The Environment', fa:'محیط زیست', icon:'🌍', hue:110, gram:'جملهٔ شرطی نوع اول: If it rains, we will stay home.', talk:'دربارهٔ مشکلات محیط زیستی شهرت و راه‌حل‌ها حرف بزن.' }
]},
{ id:'l3', fa:'سطح ۳', en:'Level 3 · B1+', units:[
{ id:'news', en:'News & Media', fa:'اخبار و رسانه', icon:'📰', hue:225, gram:'مجهول: The road was built in 2010.', talk:'یک خبر مهم این هفته را تعریف کن و نظرت را بگو.' },
{ id:'culture', en:'Culture & Customs', fa:'فرهنگ و آداب', icon:'🎎', hue:0, gram:'should / be supposed to / be allowed to', talk:'آداب و رسوم ایران و یک کشور دیگر را مقایسه کن.' },
{ id:'relations', en:'Relationships', fa:'روابط', icon:'🤝', hue:340, gram:'حال کامل استمراری: I have been living here for…', talk:'از دوستی‌ای بگو که برایت مهم است و چطور شروع شد.' },
{ id:'business', en:'Business & Negotiation', fa:'کسب‌وکار و مذاکره', icon:'📈', hue:200, gram:'جملهٔ شرطی نوع دوم: If I had more money, I would…', talk:'یک مذاکرهٔ کاری را شبیه‌سازی کن و پیشنهاد بده.' },
{ id:'complaints', en:'Problems & Complaints', fa:'مشکلات و شکایت', icon:'🛠️', hue:20, gram:'نقل قول غیرمستقیم: He said that…, She asked me if…', talk:'از یک سرویس بد شکایت کن و راه‌حل بخواه.' },
{ id:'careers', en:'Education & Careers', fa:'تحصیل و مسیر شغلی', icon:'🧭', hue:260, gram:'جملهٔ موصولی: who / which / that / where', talk:'مسیر شغلی‌ات تا امروز و هدف پنج سال آینده‌ات را بگو.' },
{ id:'lifestyle', en:'Health & Lifestyle', fa:'سبک زندگی', icon:'🥗', hue:100, gram:'gerund و infinitive: I enjoy cooking. I decided to quit.', talk:'عادت‌های خوب و بدت را بگو و برنامه‌ات برای تغییرشان.' },
{ id:'science', en:'Science & the Future', fa:'علم و آینده', icon:'🔬', hue:185, gram:'افعال وجهی استنباطی: must be, might be, can\'t be', talk:'پیش‌بینی کن زندگی ده سال دیگر چه شکلی خواهد بود.' }
]}
];

/* موقعیت‌های نقش‌آفرینی زندگی واقعی */
const SCENARIOS = [
{ id:'taxi', icon:'🚕', fa:'تاکسی', role:'a taxi driver in a big city. The learner needs to go from the hotel to the shopping mall, ask the fare and give directions.' },
{ id:'pharmacy', icon:'💊', fa:'داروخانه', role:'a pharmacist in a city pharmacy. The learner has a cold and a sore throat and needs medicine; ask about symptoms and allergies.' },
{ id:'interview', icon:'🎙️', fa:'مصاحبهٔ کاری', role:'an HR manager interviewing the learner for an office job at an international company. Ask typical interview questions one by one.' },
{ id:'landlord', icon:'🌀', fa:'تماس با صاحبخانه دربارهٔ کولر', role:'the landlord of the learner\'s flat. The learner calls because the air conditioner stopped working in hot weather; be a bit busy and reluctant at first.' },
{ id:'colleague', icon:'👥', fa:'همکار جدید', role:'a friendly new colleague from India meeting the learner on the first day at work; small talk about background, family and weekend.' },
{ id:'bank', icon:'🏦', fa:'باز کردن حساب بانکی', role:'a bank officer. The learner wants to open a bank account and asks about documents and fees.' },
{ id:'supermarket', icon:'🛒', fa:'سوپرمارکت', role:'a shop assistant at a hypermarket. The learner looks for some products, asks prices and about a discount.' },
{ id:'doctor', icon:'🩺', fa:'مطب پزشک', role:'a doctor at a clinic. Ask about the learner\'s symptoms, examine, and give advice.' },
{ id:'carrental', icon:'🚗', fa:'کرایهٔ ماشین', role:'a car rental agent at the airport. Discuss car type, days, price, insurance and driver’s license.' },
{ id:'restaurant', icon:'🍽️', fa:'رستوران', role:'a waiter at a busy seafood restaurant. Take the order, recommend dishes and handle the bill.' },
{ id:'neighbor', icon:'🏘️', fa:'همسایهٔ جدید', role:'a friendly new neighbor who knocks on the door to say hello and invites the learner for coffee.' },
{ id:'phone', icon:'📞', fa:'تماس با پشتیبانی اینترنت', role:'a customer service agent of an internet provider. The learner\'s home internet is slow; troubleshoot and book a technician visit.' }
];

/* مسیر «واژگان موضوعی» — هم‌تراز با سرفصل‌های رایج کتاب‌های واژگان (پایه و متوسط).
   لغات هر سرفصل با یک دکمه توسط هوش مصنوعی ساخته می‌شود؛ محتوا تألیف خود برنامه است. */
const WORD_TRACK = [
{ id:'wsb', fa:'واژگان موضوعی · پایه', en:'Word Skills · Basic', units:[
['ws-numbers','Numbers & Quantities','اعداد و مقادیر','🔢','اعداد، کسرها، درصد و some/many/a lot of'],
['ws-time','Telling the Time & Dates','ساعت و تاریخ','🕰️','گفتن ساعت و تاریخ؛ at/on/in'],
['ws-countries','Countries & Nationalities','کشورها و ملیت‌ها','🌍','نام کشور، ملیت و زبان'],
['ws-personal','Personal Information','اطلاعات شخصی','🪪','پر کردن فرم: نام، نشانی، تاریخ تولد، وضعیت تأهل'],
['ws-describe','Describing People','توصیف افراد','🧑','ظاهر و سن؛ قد، وزن، مو، چشم'],
['ws-accessories','Clothes & Accessories','لباس و لوازم','👜','جنس و طرح لباس؛ wear/carry'],
['ws-cooking','Cooking & Recipes','آشپزی و دستور غذا','🍳','افعال آشپزی: boil, fry, chop, mix'],
['ws-shops','Shops & Shopping','مغازه‌ها و خرید','🏬','نام مغازه‌ها، قیمت، پرداخت، تخفیف'],
['ws-household','Things in the House','وسایل خانه','🧺','وسایل آشپزخانه، حمام و کارهای خانه'],
['ws-freetime','Free Time','اوقات فراغت','🎲','سرگرمی‌ها؛ go/play/do + فعالیت'],
['ws-holidays','Holidays','تعطیلات','🏝️','انواع سفر و اقامت'],
['ws-placestown','Places in Town','مکان‌های شهر','🏙️','ساختمان‌ها و خدمات شهری'],
['ws-phone','Phone & Internet','تلفن و اینترنت','📱','تماس، پیام، اپ، رمز، اتصال'],
['ws-verbs','Common Verbs: get, have, make, do, take','افعال پرکاربرد','🔁','کاربردهای اصلی get, have, make, do, take'],
['ws-opposites','Common Adjectives & Opposites','صفت‌های پرکاربرد و متضادها','↔️','big/small, cheap/expensive و…'],
['ws-prepositions','Prepositions of Place & Time','حروف اضافهٔ مکان و زمان','📍','in, on, at, under, between, during'],
['ws-linking','Linking Words','کلمات ربط','🔗','and, but, because, so, then, also']
].map(([id,en,fa,icon,gram],i)=>({id,en,fa,icon,hue:(i*37)%360,gram:'تمرکز واژگانی: '+gram,talk:'با واژه‌های «'+fa+'» دربارهٔ زندگی خودت چند جمله بگو.'}))},
{ id:'wsi', fa:'واژگان موضوعی · متوسط', en:'Word Skills · Intermediate', units:[
['ws-phrasal','Everyday Phrasal Verbs','افعال چندبخشی روزمره','🧩','get up, look for, turn off, find out…'],
['ws-collocations','Collocations: make, do, take, have','همنشین‌ها','🤝','make a decision, do homework, take a break'],
['ws-wordform','Word Formation','ساخت واژه','🏗️','پیشوند و پسوند: un-, re-, -ful, -less, -ment'],
['ws-personality','Personality','شخصیت','🎭','صفت‌های اخلاقی مثبت و منفی'],
['ws-relationships','Relationships','روابط','💞','دوستی، آشنایی، اختلاف، آشتی'],
['ws-money','Money','پول','💰','قرض، پس‌انداز، قسط، هزینه‌ها'],
['ws-homeproblems','Problems at Home','مشکلات خانه','🔧','خرابی، تعمیر، نشتی، قطعی برق'],
['ws-travelproblems','Travel Problems','مشکلات سفر','🧳','تأخیر، گم شدن بار، لغو پرواز'],
['ws-media','Media & News','رسانه و اخبار','📰','انواع رسانه و خبر'],
['ws-technology','Technology','فناوری','💻','دستگاه‌ها، نرم‌افزار، مشکلات فنی'],
['ws-environment','The Environment','محیط زیست','🌱','آلودگی، بازیافت، انرژی'],
['ws-business','Business & Meetings','کسب‌وکار و جلسه','📊','جلسه، پیشنهاد، توافق، مهلت'],
['ws-complaints','Complaints & Customer Service','شکایت و خدمات مشتری','🛎️','بازپرداخت، تعویض، خسارت'],
['ws-health','Health & Medicine','سلامت و درمان','💊','علائم، درمان، دارو، بیمه'],
['ws-opinions','Opinions & Agreeing','نظر دادن و موافقت','💬','In my opinion, I agree, I see your point'],
['ws-idioms','Common Idioms','اصطلاحات رایج','🎈','اصطلاحات پرکاربرد روزمره'],
['ws-formal','Formal & Informal English','انگلیسی رسمی و خودمانی','👔','معادل‌های رسمی و غیررسمی'],
['ws-discourse','Discourse Markers','نشانه‌های گفتمان','🗣️','actually, anyway, by the way, however']
].map(([id,en,fa,icon,gram],i)=>({id,en,fa,icon,hue:(i*41+20)%360,gram:'تمرکز واژگانی: '+gram,talk:'با واژه‌های «'+fa+'» دربارهٔ تجربه‌های خودت صحبت کن.'}))}
];
