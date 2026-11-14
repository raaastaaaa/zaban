/* زبان رستا — الفبا از صفر برای آلمانی، ترکی استانبولی و چینی
   هر حرف: شکل، صدا به خط فارسی، یک واژهٔ نمونه با معنی، صدای بومی آفلاین (Microsoft Neural، همان صدای درس‌ها)
   بعد: تمرین شنیداری (بشنو و انتخاب کن) */
const ABC = {
  de: { title: 'الفبای آلمانی از صفر', voice: 'de-DE', intro: 'الفبای آلمانی همان ۲۶ حرف لاتین است، به‌اضافهٔ سه حرف با دو نقطه (Ä، Ö، Ü) و حرف ß. آلمانی تقریباً همان‌طور که نوشته می‌شود خوانده می‌شود؛ پس اگر صدای هر حرف و چند ترکیب مهم را یاد بگیری، هر کلمه‌ای را می‌توانی بخوانی.',
    groups: [
      ['حروف الفبا', [
        ['A a', 'آ', 'Apfel', 'سیب', 'A wie Apfel'], ['B b', 'ب (آخر کلمه: پ)', 'Brot', 'نان', 'B wie Brot'], ['C c', 'تْس یا ک (بیشتر در کلمات خارجی)', 'Café', 'کافه', 'C wie Café'],
        ['D d', 'د (آخر کلمه: ت)', 'Danke', 'ممنون', 'D wie Danke'], ['E e', 'اِ یا اِی کشیده', 'Essen', 'غذا', 'E wie Essen'], ['F f', 'ف', 'Fisch', 'ماهی', 'F wie Fisch'],
        ['G g', 'گ (آخر کلمه: ک)', 'Garten', 'باغ', 'G wie Garten'], ['H h', 'ه (بعد از مصوت خوانده نمی‌شود و مصوت را کشیده می‌کند)', 'Haus', 'خانه', 'H wie Haus'], ['I i', 'ای', 'Insel', 'جزیره', 'I wie Insel'],
        ['J j', 'ی', 'Ja', 'بله', 'J wie Ja'], ['K k', 'ک', 'Kind', 'کودک', 'K wie Kind'], ['L l', 'ل', 'Lampe', 'چراغ', 'L wie Lampe'],
        ['M m', 'م', 'Mutter', 'مادر', 'M wie Mutter'], ['N n', 'ن', 'Nacht', 'شب', 'N wie Nacht'], ['O o', 'اُ یا اُو کشیده', 'Obst', 'میوه', 'O wie Obst'],
        ['P p', 'پ', 'Polizei', 'پلیس', 'P wie Polizei'], ['Q q', 'همیشه با u می‌آید: qu = کْو', 'Quelle', 'چشمه', 'Q wie Quelle'], ['R r', 'ر حلقی، شبیه «غ» نرم', 'Rose', 'گل رز', 'R wie Rose'],
        ['S s', 'قبل از مصوت: ز — جاهای دیگر: س', 'Sonne', 'خورشید', 'S wie Sonne'], ['T t', 'ت', 'Tisch', 'میز', 'T wie Tisch'], ['U u', 'او', 'Uhr', 'ساعت', 'U wie Uhr'],
        ['V v', 'بیشتر ف', 'Vater', 'پدر', 'V wie Vater'], ['W w', 'و (مثل v انگلیسی، با لب و دندان)', 'Wasser', 'آب', 'W wie Wasser'], ['X x', 'کس', 'Taxi', 'تاکسی', 'X wie Taxi'],
        ['Y y', 'مثل ü: «او» با لب غنچه', 'Typ', 'نوع، تیپ', 'Y wie Typ'], ['Z z', 'تْس', 'Zug', 'قطار', 'Z wie Zug']]],
      ['حروف ویژهٔ آلمانی', [
        ['Ä ä', 'اِ (مثل e)', 'Käse', 'پنیر', 'Ä wie Käse'], ['Ö ö', 'لب‌ها را برای «اُ» گرد کن و «اِ» بگو', 'Öl', 'روغن', 'Ö wie Öl'],
        ['Ü ü', 'لب‌ها را برای «او» گرد کن و «ای» بگو', 'Tür', 'در', 'Ü wie Tür'], ['ß', 'س (بعد از مصوت کشیده)', 'Straße', 'خیابان', 'Eszett wie Straße']]],
      ['ترکیب‌های مهم', [
        ['ch', 'بعد از a، o، u: خ', 'Buch', 'کتاب', 'Buch'], ['ch', 'بعد از i، e و بقیه: صدایی نرم بین «ش» و «خ»', 'ich', 'من', 'ich'],
        ['sch', 'ش', 'Schule', 'مدرسه', 'Schule'], ['tsch', 'چ', 'Deutsch', 'آلمانی', 'Deutsch'], ['ei', 'آی', 'Eis', 'بستنی، یخ', 'Eis'],
        ['ie', 'ای کشیده', 'Liebe', 'عشق', 'Liebe'], ['eu / äu', 'اُی', 'Euro', 'یورو', 'Euro'], ['sp', 'اول کلمه: شپ', 'Sport', 'ورزش', 'Sport'],
        ['st', 'اول کلمه: شت', 'Stadt', 'شهر', 'Stadt'], ['pf', 'پف (هر دو با هم)', 'Pferd', 'اسب', 'Pferd']]]] },
  tr: { title: 'الفبای ترکی استانبولی از صفر', voice: 'tr-TR', intro: 'الفبای ترکی ۲۹ حرف دارد و کاملاً آوایی است: هر حرف فقط یک صدا دارد و هر کلمه دقیقاً همان‌طور که نوشته می‌شود خوانده می‌شود. حروف q، w و x در ترکی نیست. شش حرف ویژه را خوب یاد بگیر: Ç، Ğ، I، İ، Ö، Ş، Ü.',
    groups: [
      ['حروف الفبا', [
        ['A a', 'آ', 'Anne', 'مادر', 'A, anne'], ['B b', 'ب', 'Baba', 'پدر', 'B, baba'], ['C c', 'ج', 'Cami', 'مسجد', 'C, cami'],
        ['Ç ç', 'چ', 'Çay', 'چای', 'Ç, çay'], ['D d', 'د', 'Deniz', 'دریا', 'D, deniz'], ['E e', 'اِ', 'Ekmek', 'نان', 'E, ekmek'],
        ['F f', 'ف', 'Fil', 'فیل', 'F, fil'], ['G g', 'گ', 'Gül', 'گل رز', 'G, gül'], ['Ğ ğ', 'خودش خوانده نمی‌شود؛ مصوتِ قبلش را کشیده می‌کند', 'Dağ', 'کوه', 'Yumuşak ge, dağ'],
        ['H h', 'ه', 'Hava', 'هوا', 'H, hava'], ['I ı', 'بی‌نقطه: صدایی کوتاه بین «اِ» و «ای»، با لب‌های باز و صاف', 'Kız', 'دختر', 'I, kız'], ['İ i', 'با نقطه: ای', 'İyi', 'خوب', 'İ, iyi'],
        ['J j', 'ژ', 'Jandarma', 'ژاندارم', 'J, jandarma'], ['K k', 'ک', 'Kitap', 'کتاب', 'K, kitap'], ['L l', 'ل', 'Limon', 'لیمو', 'L, limon'],
        ['M m', 'م', 'Masa', 'میز', 'M, masa'], ['N n', 'ن', 'Nar', 'انار', 'N, nar'], ['O o', 'اُ', 'Okul', 'مدرسه', 'O, okul'],
        ['Ö ö', 'لب‌ها را برای «اُ» گرد کن و «اِ» بگو', 'Göz', 'چشم', 'Ö, göz'], ['P p', 'پ', 'Para', 'پول', 'P, para'], ['R r', 'ر', 'Renk', 'رنگ', 'R, renk'],
        ['S s', 'س', 'Su', 'آب', 'S, su'], ['Ş ş', 'ش', 'Şeker', 'شکر', 'Ş, şeker'], ['T t', 'ت', 'Tuz', 'نمک', 'T, tuz'],
        ['U u', 'او', 'Uçak', 'هواپیما', 'U, uçak'], ['Ü ü', 'لب‌ها را برای «او» گرد کن و «ای» بگو', 'Üzüm', 'انگور', 'Ü, üzüm'], ['V v', 'و', 'Vatan', 'وطن', 'V, vatan'],
        ['Y y', 'ی', 'Yol', 'راه', 'Y, yol'], ['Z z', 'ز', 'Zaman', 'زمان', 'Z, zaman']]]] },
  zh: { title: 'الفبای چینی از صفر: پین‌یین و لحن‌ها', voice: 'zh-CN', intro: 'چینی الفبا ندارد؛ هر نویسه (هانزی) یک هجا است. برای یاد گرفتن تلفظ، از «پین‌یین» استفاده می‌شود: نوشتن صدای هر هجا با حروف لاتین. هر هجا = آغازه (صامت اول) + پایانه (بقیهٔ هجا) + لحن. لحن معنی را عوض می‌کند، پس از همین اول لحن‌ها را با گوش تمرین کن.',
    groups: [
      ['چهار لحن (و لحن خنثی)', [
        ['mā  ˉ', 'لحن ۱: صاف و بلند، مثل نت ثابت', '妈 mā', 'مادر', '妈'], ['má  ˊ', 'لحن ۲: از وسط رو به بالا، مثل وقتی می‌پرسی «ها؟»', '麻 má', 'کنف', '麻'],
        ['mǎ  ˇ', 'لحن ۳: پایین می‌رود و کمی بالا می‌آید', '马 mǎ', 'اسب', '马'], ['mà  ˋ', 'لحن ۴: تند و کوتاه رو به پایین، مثل دستور دادن', '骂 mà', 'سرزنش کردن', '骂'],
        ['ma', 'لحن خنثی: کوتاه و سبک، بدون علامت', '吗 ma', 'نشانهٔ سؤال', '吗']]],
      ['آغازه‌ها (صامت‌ها)', [
        ['b', 'پ نرم بدون بازدم (نه «ب» کامل)', '爸 bà', 'پدر', '爸'], ['p', 'پ با بازدم قوی', '怕 pà', 'ترسیدن', '怕'], ['m', 'م', '妈 mā', 'مادر', '妈'], ['f', 'ف', '飞 fēi', 'پرواز کردن', '飞'],
        ['d', 'ت نرم بدون بازدم', '大 dà', 'بزرگ', '大'], ['t', 'ت با بازدم قوی', '他 tā', 'او (مرد)', '他'], ['n', 'ن', '你 nǐ', 'تو', '你'], ['l', 'ل', '来 lái', 'آمدن', '来'],
        ['g', 'ک نرم بدون بازدم', '哥 gē', 'برادر بزرگ', '哥'], ['k', 'ک با بازدم قوی', '看 kàn', 'نگاه کردن', '看'], ['h', 'خ نرم', '好 hǎo', 'خوب', '好'],
        ['j', 'جْ نرم (نوک زبان پشت دندان‌های پایین)', '家 jiā', 'خانه، خانواده', '家'], ['q', 'چْ با بازدم (مثل j ولی با هوا)', '去 qù', 'رفتن', '去'], ['x', 'شْ نرم و باریک (بین «س» و «ش»)', '小 xiǎo', 'کوچک', '小'],
        ['zh', 'ج با زبانِ برگشته به عقب', '中 zhōng', 'وسط، چین', '中'], ['ch', 'چ با زبان برگشته و بازدم', '吃 chī', 'خوردن', '吃'], ['sh', 'ش با زبان برگشته', '是 shì', 'بودن، است', '是'],
        ['r', 'صدایی بین «ژ» و «ر» با زبان برگشته', '人 rén', 'انسان', '人'], ['z', 'دْز (بدون بازدم)', '在 zài', 'در، بودن (جایی)', '在'], ['c', 'تْس با بازدم قوی', '菜 cài', 'غذا، سبزی', '菜'], ['s', 'س', '三 sān', 'سه', '三']]],
      ['پایانه‌ها (مصوت‌ها)', [
        ['a', 'آ', '八 bā', 'هشت', '八'], ['o', 'اُ (با کمی «و»)', '波 bō', 'موج', '波'], ['e', 'صدایی بین «اُ» و «اِ» از ته گلو', '饿 è', 'گرسنه', '饿'],
        ['i', 'ای', '一 yī', 'یک', '一'], ['u', 'او', '五 wǔ', 'پنج', '五'], ['ü', 'لب‌ها برای «او» گرد و صدای «ای»', '鱼 yú', 'ماهی', '鱼'],
        ['ai', 'آی', '爱 ài', 'عشق، دوست داشتن', '爱'], ['ei', 'اِی', '北 běi', 'شمال', '北'], ['ao', 'آئو', '好 hǎo', 'خوب', '好'], ['ou', 'اُئو', '口 kǒu', 'دهان', '口'],
        ['an', 'آن', '三 sān', 'سه', '三'], ['en', 'اِن (کوتاه)', '门 mén', 'در', '门'], ['ang', 'آنگ (گ خیلی نرم و تودماغی)', '忙 máng', 'مشغول', '忙'], ['eng', 'اِنگ', '冷 lěng', 'سرد', '冷'],
        ['ong', 'اونگ', '中 zhōng', 'وسط', '中'], ['in', 'این', '心 xīn', 'قلب', '心'], ['ing', 'اینگ', '听 tīng', 'گوش دادن', '听'], ['ie', 'یِه', '谢 xiè', 'تشکر', '谢'],
        ['ia', 'یا', '家 jiā', 'خانه', '家'], ['iao', 'یائو', '小 xiǎo', 'کوچک', '小'], ['uo', 'وُ', '我 wǒ', 'من', '我'], ['ui', 'وِی', '水 shuǐ', 'آب', '水'],
        ['un', 'وِن', '春 chūn', 'بهار', '春'], ['üe', 'یوئه (ü + اِ)', '学 xué', 'یاد گرفتن', '学']]]] }
};
const abcItems = k => (ABC[k]?.groups || []).flatMap(g => g[1]);
const abcDone = () => !!(U?.abcDone || {})[tl()];
const abcWord = it => tl() === 'zh' ? it[4] : it[2];
/* صدای آفلاین آماده؛ اگر نبود، همان موتور صدای برنامه */
const ABC_IX = {};
async function abcSay(text, btn) {
  const k = tl(); if (!ABC_IX[k]) ABC_IX[k] = fetch(`audio/abc/${k}/index.json`).then(r => r.json()).then(a => new Set(a)).catch(() => (delete ABC_IX[k], null));
  const ix = await ABC_IX[k]; const h = hashStr(text);
  if (ix?.has(h)) { haltAudio(); const tok = ++speakToken; btn?.classList.add('on'); try { await playUrl(`audio/abc/${k}/${h}.mp3`, tok); } finally { btn?.classList.remove('on'); } return; }
  return say(text, 'en', 'calm', btn);
}
routes.abc = mode => {
  const A = ABC[tl()]; if (!A) return go(tl() === 'en' ? 'home' : 'arc');
  setTop(A.title, true); const v = view();
  if (mode === 'quiz') return abcQuiz(v, A);
  v.innerHTML = `<div class="stack">
    <div class="card stack"><b>🔤 ${esc(A.title)}</b><span class="small">${esc(A.intro)}</span>
      <span class="small muted">روی هر کارت بزن تا صدای بومی‌اش را بشنوی. بعد با «تمرین شنیداری» خودت را بسنج.</span>
      <div class="row"><button class="btn" id="abcAll">▶ پخش همه به ترتیب</button><a class="btn ghost" href="#abc/quiz">🎧 تمرین شنیداری</a></div></div>
    ${A.groups.map(([gt, its], gi) => `<div class="bk-chip">${esc(gt)}</div><div class="abc-grid">${its.map((it, i) => `<button class="abc-card" data-say="${esc(it[4])}" data-k="${gi}-${i}">
      <span class="abc-l" lang="${tl()}">${esc(it[0])}</span><span class="abc-s">${esc(it[1])}</span>
      <span class="abc-w" lang="${tl()}">${esc(it[2])}</span><span class="abc-m">${esc(it[3])}</span></button>`).join('')}</div>`).join('')}
    <button class="btn wide" id="abcDone">${abcDone() ? '✓ الفبا را یاد گرفته‌ای — برو سراغ درس ۱' : '✓ الفبا را یاد گرفتم؛ برویم سراغ درس ۱'}</button></div>`;
  let run = 0;
  v.onclick = async e => { const c = e.target.closest('[data-say]'); if (!c) return; run++; abcSay(c.dataset.say, c); };
  $('#abcAll', v).onclick = async () => { const my = ++run; for (const c of $$('[data-say]', v)) { if (my !== run || !location.hash.startsWith('#abc')) return; c.scrollIntoView({ block: 'center', behavior: 'smooth' }); await abcSay(c.dataset.say, c); await new Promise(r => setTimeout(r, 400)); } };
  $('#abcDone', v).onclick = () => { (U.abcDone = U.abcDone || {})[tl()] = isoDay(); addXP(15); saveU(); const first = curUnits()[0]; go(first ? 'aru/' + first[0] : 'arc'); };
  addEventListener('hashchange', () => { run++; }, { once: true });
};
function abcQuiz(v, A) {
  const all = abcItems(tl()); const pool = [...all].sort(() => Math.random() - 0.5).slice(0, 10); let q = 0, ok = 0;
  const show = () => {
    if (q >= pool.length) { v.innerHTML = `<div class="card stack" style="text-align:center"><b style="font-size:22px">${faNum(ok)} از ${faNum(pool.length)}</b><span>${ok >= 8 ? 'عالی! آماده‌ای برای درس ۱ 🎉' : 'یک بار دیگر کارت‌ها را گوش کن و دوباره امتحان کن.'}</span><div class="row" style="justify-content:center"><a class="btn ghost" href="#abc">کارت‌های الفبا</a><button class="btn" id="again">دوباره</button></div></div>`; $('#again', v).onclick = () => abcQuiz(v, A); if (ok >= 8) { (U.abcDone = U.abcDone || {})[tl()] = U.abcDone[tl()] || isoDay(); saveU(); } return; }
    const it = pool[q]; const opts = [it, ...all.filter(x => abcWord(x) !== abcWord(it)).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
    v.innerHTML = `<div class="stack"><div class="card stack" style="text-align:center"><span class="small muted">سؤال ${faNum(q + 1)} از ${faNum(pool.length)}</span><b>بشنو؛ کدام را شنیدی؟</b><button class="btn" id="hear">🔊 دوباره بشنو</button></div>
      <div class="abc-grid">${opts.map(o => `<button class="abc-card" data-a="${esc(abcWord(o))}"><span class="abc-w" lang="${tl()}" style="font-size:22px">${esc(o[2])}</span></button>`).join('')}</div></div>`;
    const play = () => abcSay(it[4] === it[2] || tl() === 'zh' ? it[4] : it[2]); $('#hear', v).onclick = play; setTimeout(play, 250);
    v.onclick = e => { const b = e.target.closest('[data-a]'); if (!b || v.dataset.lock) return; v.dataset.lock = 1; const right = b.dataset.a === abcWord(it); if (right) ok++;
      b.style.boxShadow = `0 0 0 3px ${right ? 'var(--ok)' : 'var(--bad)'}`; if (!right) $$('[data-a]', v).forEach(x => { if (x.dataset.a === abcWord(it)) x.style.boxShadow = '0 0 0 3px var(--ok)'; });
      setTimeout(() => { delete v.dataset.lock; q++; show(); }, right ? 700 : 1500); };
  };
  show();
}
