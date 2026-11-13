/* زبان رستا — بخش آنلاین: حساب با کد تأیید ایمیل، رقابت زنده، صفحهٔ کاربر، انجمن و چت‌روم با معلم ناظر، پنل مدیر */
'use strict';
const SB_URL = 'https://zixshmfjdsefmxhpneou.supabase.co';
const SB_KEY = 'sb_publishable_i-aeD5YnhwtFZ3f-3sG3Ww_j64Oflxg'; // کلید عمومی (برای استفاده در برنامهٔ عمومی ساخته شده)
const FORUM_RULES = [
  'اینجا برای تمرین مکالمهٔ انگلیسی است؛ تا جای ممکن انگلیسی بنویس.',
  'حرف رکیک، جنسی، توهین‌آمیز، سیاسیِ تفرقه‌انگیز یا آزار دیگران ممنوع است و پیام پاک می‌شود.',
  'از موضوعی که معلم مشخص کرده خارج نشو؛ معلم کمکت می‌کند به بحث برگردی.',
  'اطلاعات شخصی (شماره، نشانی، رمز) را در انجمن ننویس.',
  'سه اخطار = محرومیت از انجمن.'
];
const ROOMS = [
  { id: 'lobby', ic: '☕', fa: 'گپ عمومی', en: 'Free Talk', topic: 'free everyday small talk' },
  ...[...ALL_UNITS, ...WS_UNITS].map(u => ({ id: u.id, ic: u.icon, fa: u.fa, en: u.en, topic: `${u.en}: ${u.talk || ''} (grammar: ${u.gram})`, level: u.levelFa }))
];
/* انجمن عربی: اتاق‌های جدا با فضای عمانی/خلیجی؛ معلم ناظر عربی */
const AR_ROOMS = [
  { id: 'ar-majlis', ic: '☕', fa: 'مجلس — گپ آزاد', en: 'المجلس', topic: 'free everyday small talk in Gulf/Omani Arabic (greetings, how are you, family, weekend)' },
  { id: 'ar-souq', ic: '🧺', fa: 'سوق — خرید و چانه‌زنی', en: 'السوق', topic: 'shopping and bargaining in the souq / supermarket (prices, sizes, rial & baisa)' },
  { id: 'ar-work', ic: '💼', fa: 'شغل و اداره', en: 'الشغل والدوائر', topic: 'work, office, ministries, residence/visa paperwork in Oman' },
  { id: 'ar-trade', ic: '🚢', fa: 'تجارت، گمرک و مناطق آزاد', en: 'التجارة والجمارك', topic: 'trade, customs clearance, shipping, free zones, negotiation with suppliers' },
  { id: 'ar-travel', ic: '🧭', fa: 'سفر در عمان', en: 'السفر في عُمان', topic: 'travelling in Oman: Muscat, Salalah khareef, wadis, hotels, taxi, directions' },
  { id: 'ar-food', ic: '🍛', fa: 'غذا و رستوران', en: 'الأكل والمطاعم', topic: 'food, Omani dishes, ordering in restaurants and cafés, coffee and dates etiquette' },
  { id: 'ar-health', ic: '🏥', fa: 'دکتر و سلامتی', en: 'الصحة', topic: 'doctor, pharmacy, hospital, describing symptoms, insurance' },
  { id: 'ar-culture', ic: '🕌', fa: 'فرهنگ و مناسبت‌ها', en: 'الثقافة والمناسبات', topic: 'Omani culture, hospitality, Ramadan and Eid, weddings, condolences, what to say on each occasion' },
  { id: 'ar-fusha', ic: '📰', fa: 'فصحی — اخبار و متن رسمی', en: 'الفصحى', topic: 'Modern Standard Arabic: news, formal emails, official letters (contrast with the dialect)' },
  { id: 'ar-dialects', ic: '🗺️', fa: 'لهجه‌ها — همان جمله در هر لهجه', en: 'اللهجات', topic: 'the same sentences in Omani, Emirati, Saudi, Egyptian and Levantine; differences and fun comparisons' } ];
const roomsNow = () => tl() === 'ar' ? AR_ROOMS : ROOMS;
const BAD_WORDS = { test: t => { const toks = String(t).toLowerCase().split(/[\s.,!?؟،؛:;"'()\[\]{}«»\-_/\\*]+/).filter(Boolean); const en = /^(f+u+c+k\w*|sh[i1]t\w*|b[i1]tch\w*|d[i1]ck|d[i1]cks|pussy|porn\w*|n[i1]gg\w*|asshole\w*|bastards?|sluts?|whores?)$/; const fa = /^(کیر\S*|کسکش\S*|جنده\S*|کون|کونی|سکس\S*|لاشی|حرومزاده\S*|گاییدم|گاییدی)$/; return toks.some(w => en.test(w) || fa.test(w)) || /کس\s+کش/.test(t); } };

let _sb = null, _sbFor = null, OP = null; // OP = پروفایل آنلاین کاربر فعال
function sb() { if (!window.supabase) return null; if (_sb && _sbFor === G.active) return _sb; _sbFor = G.active; _sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, storageKey: 'zd-sb-' + G.active, autoRefreshToken: true } }); OP = null; return _sb; }
async function session() { const c = sb(); if (!c) return null; try { const { data } = await c.auth.getSession(); return data.session; } catch { return null; } }
async function myProfile(force) { if (OP && !force) return OP; const s = await session(); if (!s) return null; const { data } = await sb().from('profiles').select('*').eq('id', s.user.id).maybeSingle(); OP = data || null; if (OP && G.active) { lsSet('zd:admin:' + G.active, !!OP.is_admin); lsSet('zd:unlock:' + G.active, OP.unlock || ''); } return OP; }

/* ───── ورود و ثبت‌نام با کد تأیید ایمیل ───── */
function loginSheet(after) {
  const bg = sheet(`<div class="stack"><b style="font-size:18px">ورود به حساب آنلاین</b><span class="small muted">با حساب آنلاین، پیشرفتت در جدول رقابت همه دیده می‌شود، صفحهٔ اختصاصی و یوزرنیم داری و می‌توانی وارد انجمن شوی.</span>
  <div id="l1" class="stack"><label class="f">ایمیل<input id="em" class="in" dir="ltr" type="email" autocomplete="email" placeholder="you@gmail.com"></label><button class="btn" id="snd">فرستادن کد تأیید</button></div>
  <div id="l2" class="stack" hidden><span class="small">یک ایمیل به <b id="emv" class="en"></b> فرستاده شد (پوشهٔ اسپم را هم ببین). <b>روی لینک «Sign in» داخل ایمیل بزن</b> تا وارد شوی؛ اگر ایمیل کد ۶ رقمی داشت، آن را اینجا بنویس.</span><input id="cd" class="in" dir="ltr" inputmode="numeric" maxlength="8" placeholder="123456" style="font-size:22px;letter-spacing:6px;text-align:center"><button class="btn" id="vf">تأیید</button><button class="btn line sm" id="bk">ایمیل را اشتباه نوشتم</button></div>
  <div id="l3" class="stack" hidden><label class="f">یوزرنیم (فقط حروف انگلیسی کوچک، عدد و _ ؛ ۳ تا ۲۰ حرف)<input id="un" class="in" dir="ltr" maxlength="20" placeholder="rasta_eng"></label><span class="tiny muted" id="unh"></span><button class="btn" id="mk">ساخت صفحهٔ من</button></div></div>`);
  let email = '';
  $('#snd', bg).onclick = async () => {
    email = $('#em', bg).value.trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(email)) return toast('ایمیل درست نیست.');
    const b = $('#snd', bg); b.disabled = true; b.textContent = 'در حال فرستادن…';
    const { error } = await sb().auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
    b.disabled = false; b.textContent = 'فرستادن کد تأیید';
    if (error) return toast(/rate|limit|seconds/i.test(error.message) ? 'تعداد درخواست زیاد بود؛ یک دقیقه بعد دوباره امتحان کن.' : 'خطا: ' + error.message, 5000);
    $('#l1', bg).hidden = true; $('#l2', bg).hidden = false; $('#emv', bg).textContent = email; $('#cd', bg).focus();
  };
  $('#bk', bg).onclick = () => { $('#l2', bg).hidden = true; $('#l1', bg).hidden = false; };
  $('#vf', bg).onclick = async () => {
    const token = $('#cd', bg).value.replace(/\D/g, ''); if (token.length < 6) return toast('کد ۶ رقمی را کامل وارد کن.');
    const { error } = await sb().auth.verifyOtp({ email, token, type: 'email' });
    if (error) return toast('کد درست نیست یا منقضی شده؛ دوباره بفرست.', 4500);
    const p = await myProfile(true); if (p) { done(p); return; }
    $('#l2', bg).hidden = true; $('#l3', bg).hidden = false; $('#un', bg).value = (email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  };
  $('#mk', bg).onclick = async () => {
    const un = $('#un', bg).value.trim().toLowerCase(); if (!/^[a-z0-9_]{3,20}$/.test(un)) return $('#unh', bg).textContent = 'فقط حروف انگلیسی کوچک، عدد و _ ؛ ۳ تا ۲۰ حرف.';
    const s = await session(); const { error } = await sb().from('profiles').insert({ id: s.user.id, username: un, display_name: me().name, avatar: me().avatar, photo: me().photo || null });
    if (error) return $('#unh', bg).textContent = /duplicate|unique/i.test(error.message) ? 'این یوزرنیم گرفته شده؛ یکی دیگر بنویس.' : 'خطا: ' + error.message;
    done(await myProfile(true));
  };
  window._loginSheetEmail = (e) => { $('#em', bg).value = e; $('#snd', bg).click(); };
  const done = p => { U.online = { uid: p.id, username: p.username }; saveU(); bg.remove(); toast('خوش آمدی @' + p.username + ' 🎉'); syncNow(); after && after(p); };
}
async function requireLogin(after) { const p = await myProfile(); if (p) return after(p); loginSheet(after); }

/* برگشت از لینک ایمیل */
async function handleAuthRedirect() {
  if (!G.users.length) addUser('کاربر', '🙂'); else if (!U) loadUser(G.active || G.users[0].id); // قبل از ساخت اتصال، تا نشست در جای درست ذخیره شود
  const recovery = /type=recovery/.test(location.hash);
  const c = sb(); if (!c) { location.hash = 'home'; return; }
  for (let i = 0; i < 20 && !(await session()); i++) await sleep(150);
  if (recovery && (await session())) { history.replaceState(null, '', location.pathname + '#home'); router(); return newPasswordSheet(); }
  history.replaceState(null, '', location.pathname + '#home');
  const s = await session(); if (!s) { toast('ورود کامل نشد؛ لینک منقضی شده بود. دوباره کد بخواه.', 5000); return router(); }
  let p = await myProfile(true);
  if (!p) { const md = s.user.user_metadata || {}; if (/^[a-z0-9_]{3,20}$/.test(md.username || '')) { const { error } = await c.from('profiles').insert({ id: s.user.id, username: md.username, display_name: md.display_name || me().name, avatar: md.avatar || me().avatar }); if (!error) { p = await myProfile(true); me().name = md.display_name || me().name; if (md.avatar) me().avatar = md.avatar; saveG('users'); } } }
  router();
  if (p) { U.online = { uid: p.id, username: p.username }; saveU(); if (['کاربر', ''].includes(me().name)) { me().name = p.display_name; if (p.photo) me().photo = p.photo; if (p.avatar) me().avatar = p.avatar; saveG('users'); router(); } toast('خوش آمدی @' + p.username + ' 🎉'); syncNow(); return; }
  const bg = sheet(`<div class="stack"><b style="font-size:18px">ایمیلت تأیید شد ✓</b><label class="f">یک یوزرنیم انتخاب کن (حروف انگلیسی کوچک، عدد و _ ؛ ۳ تا ۲۰ حرف)<input id="un" class="in" dir="ltr" maxlength="20" value="${esc((s.user.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}"></label><span class="tiny muted" id="unh"></span><button class="btn" id="mk">ساخت صفحهٔ من</button></div>`);
  $('#mk', bg).onclick = async () => { const un = $('#un', bg).value.trim().toLowerCase(); if (!/^[a-z0-9_]{3,20}$/.test(un)) return $('#unh', bg).textContent = 'یوزرنیم معتبر نیست.';
    const { error } = await sb().from('profiles').insert({ id: s.user.id, username: un, display_name: me().name, avatar: me().avatar, photo: me().photo || null });
    if (error) return $('#unh', bg).textContent = /duplicate|unique/i.test(error.message) ? 'این یوزرنیم گرفته شده.' : 'خطا: ' + error.message;
    const np = await myProfile(true); U.online = { uid: np.id, username: np.username }; saveU(); bg.remove(); toast('خوش آمدی @' + np.username + ' 🎉'); syncNow(); router(); };
}

/* ───── همگام‌سازی پیشرفت ───── */
let syncT = 0;
async function syncNow() {
  const p = await myProfile(); if (!p || !U) return; if (window.backupSafe && !(await backupSafe())) return;
  const sum = (n) => { let s = 0; for (let i = 0; i < n; i++) s += U.log[addDays(isoDay(), -i)]?.min || 0; return Math.round(s); };
  const ai30 = aiUseSum(U, 3650);
  const row = { user_id: p.id, xp: U.xp || 0, week_xp: weekXP(U), streak: streakOf(U), mastered: masteredCount(), learned: learnedCount(), current_unit: currentUnit().fa, minutes_total: Math.round(Object.values(U.log).reduce((a, x) => a + (x.min || 0), 0)), minutes_today: sum(1), minutes_week: sum(7), ai_chat: ai30.chat, ai_voice: ai30.voice, level: U.placement?.level || null, updated_at: new Date().toISOString() };
  try { await sb().from('progress').upsert(row, { onConflict: 'user_id' }); await sb().from('profiles').update({ last_seen: new Date().toISOString(), display_name: me().name, avatar: me().avatar, photo: me().photo || null }).eq('id', p.id); } catch { }
}
setInterval(() => { if (U?.online && document.visibilityState === 'visible') syncNow(); }, 90000);
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && U?.online) syncNow(); });

/* ───── رقابت زنده و پیام‌های مدیر روی صفحهٔ اول ───── */
async function homeOnline() {
  const box = $('#online-home'); if (!box) return;
  if (!U.online) { box.innerHTML = `<div class="card row" style="flex-wrap:nowrap"><span style="font-size:28px">🌐</span><div class="grow"><b>رقابت با همه</b><div class="small muted">با یک کلیک وارد مسابقه شو؛ سطح، درس‌ها، واژه‌ها و زمان مطالعهٔ همه را ببین. ایمیل لازم نیست.</div></div><button class="btn sm" id="lg">پیوستن به رقابت</button></div>`; $('#lg').onclick = () => joinCompetition(); return; }
  syncNow();
  try {
    startPresence(); const { data } = await sb().from('progress').select('week_xp,xp,streak,mastered,learned,current_unit,minutes_today,minutes_week,profiles(username,display_name,avatar,photo,last_seen)').order('week_xp', { ascending: false }).limit(10);
    const p = await myProfile();
    const { data: notes } = await sb().from('notices').select('*').order('created_at', { ascending: false }).limit(5);
    const seen = lsGet('zd:noteSeen:' + G.active, 0); const fresh = (notes || []).filter(n => new Date(n.created_at).getTime() > seen);
    box.innerHTML = `${fresh.map(n => `<div class="notice stack"><b>📣 ${esc(n.title)}</b><span class="small">${esc(n.body)}</span></div>`).join('')}${fresh.length ? '<button class="btn line sm" id="nseen">خواندم</button>' : ''}
    <div class="row"><a class="btn ghost sm" href="#dm">💬 پیام‌ها<span id="unr"></span></a><a class="btn ghost sm" href="#rooms">🗣️ انجمن</a></div>
    <div class="sec">🏆 جدول رقابت زنده <small>همهٔ کاربران · امتیاز این هفته</small></div>
    <div class="card stack">${(data || []).map((r, i) => `<a class="row" href="#u/${esc(r.profiles?.username)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap;${r.profiles?.username === p?.username ? 'background:var(--accent-soft);border-radius:10px;padding:4px' : ''}"><span style="width:24px;font-weight:900">${['🥇', '🥈', '🥉'][i] || faNum(i + 1)}</span><span class="avatar">${safeImg(r.profiles?.photo) ? `<img src="${safeImg(r.profiles.photo)}" alt="" style="width:100%;height:100%;object-fit:cover">` : esc(r.profiles?.avatar || '🙂')}</span>${dot(r.profiles?.username)}<span class="grow" style="min-width:0"><b>${esc(r.profiles?.display_name)}</b> <span class="en tiny muted">@${esc(r.profiles?.username)}</span><br><span class="tiny muted">${esc(r.current_unit || '')} · امروز ${faNum(r.minutes_today)} دقیقه · 🔥${faNum(r.streak)} · ${ONLINE.has(r.profiles?.username) ? '<b style="color:var(--ok)">آنلاین</b>' : lastSeenFa(r.profiles?.last_seen)}</span></span><span class="pill acc">${faNum(r.week_xp)}</span></a>`).join('') || '<span class="small muted">هنوز کسی نیست؛ اولین نفر باش!</span>'}</div>`;
    unreadCount().then(n => { if (n && $('#unr')) $('#unr').innerHTML = ` <span class="pill bad">${faNum(n)}</span>`; }).catch(() => { });
    $('#nseen') && ($('#nseen').onclick = () => { lsSet('zd:noteSeen:' + G.active, Date.now()); homeOnline(); });
  } catch { box.innerHTML = '<div class="small muted">اتصال به جدول رقابت برقرار نشد (اگر در ایرانی، VPN را روشن کن).</div>'; }
}

/* ───── صفحهٔ اختصاصی هر کاربر ───── */
routes.u = async (username) => {
  setTop('@' + username, true); const v = view(); v.innerHTML = loading();
  if (!(await session())) { v.innerHTML = '<div class="card stack"><b>برای دیدن صفحهٔ کاربران وارد حساب آنلاین شو.</b><button class="btn" id="lg">ورود</button></div>'; $('#lg').onclick = () => loginSheet(() => routes.u(username)); return; }
  const { data: p } = await sb().from('profiles').select('*, progress(*)').eq('username', username).maybeSingle();
  if (!p) { v.innerHTML = '<div class="card">کاربری با این یوزرنیم پیدا نشد.</div>'; return; }
  const g = Array.isArray(p.progress) ? p.progress[0] : p.progress || {};
  v.innerHTML = `<div class="stack"><div class="card stack" style="align-items:center;text-align:center"><span class="avatar" style="width:96px;height:96px;font-size:48px">${safeImg(p.photo) ? `<img src="${safeImg(p.photo)}" alt="" style="width:100%;height:100%;object-fit:cover">` : esc(p.avatar)}</span><b style="font-size:20px">${esc(p.display_name)} ${dot(p.username)}</b><span class="en muted">@${esc(p.username)}</span><span class="small ${ONLINE.has(p.username) ? '' : 'muted'}">${ONLINE.has(p.username) ? '🟢 الان آنلاین است' : 'آخرین بازدید: ' + lastSeenFa(p.last_seen)}</span><a class="btn sm" href="#dm/${esc(p.username)}">💬 پیام دادن</a><span class="pill">${rankOf(g.xp || 0)} · عضو از ${jLabel(p.created_at.slice(0, 10), true)}</span></div>
  <div class="grid2">${[['⭐', 'امتیاز کل', g.xp], ['🔥', 'روز پیاپی', g.streak], ['🎓', 'درس قبول‌شده', g.mastered], ['🧠', 'واژهٔ تثبیت‌شده', g.learned], ['⏱️', 'دقیقه امروز', g.minutes_today], ['📅', 'دقیقه این هفته', g.minutes_week]].map(([ic, l, n]) => `<div class="card" style="text-align:center"><div style="font-size:22px">${ic}</div><b class="num" style="font-size:22px">${faNum(n || 0)}</b><div class="small muted">${l}</div></div>`).join('')}</div>
  <div class="card small">درس فعلی: <b>${esc(g.current_unit || '—')}</b></div></div>`;
};

/* ───── انجمن و چت‌روم با معلم ناظر ───── */
routes.rooms = async (id) => {
  if (!id) {
    setTop(tl() === 'ar' ? 'انجمن عربی' : 'انجمن', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">${tl() === 'ar' ? '🕌 انجمن عربی «زبان رستا» — المجلس' : '🗣️ انجمن «زبان رستا»'}</b><span class="muted">با بقیهٔ زبان‌آموزها ${tl() === 'ar' ? 'عربی (' + esc(tlDia()[1]) + ')' : 'انگلیسی'} گپ بزن. ${esc(G.settings.teacher)}، معلم ناظر، موضوع و نقش می‌دهد و اشتباه‌ها را همان لحظه درست می‌کند.</span></div>
    <input id="rq" class="in" placeholder="جستجوی موضوع…"><div class="tools" id="rl">${roomsNow().map(r => `<a class="tool" data-q="${esc(r.fa + ' ' + r.en)}" href="#rooms/${r.id}"><span class="ic">${r.ic}</span><b>${esc(r.fa)}</b><span class="en">${esc(r.en)}</span>${r.level ? `<span>${esc(r.level)}</span>` : ''}</a>`).join('')}</div>
    <details class="card"><summary>قوانین انجمن</summary><ul class="list small">${FORUM_RULES.map(r => `<li>${esc(r)}</li>`).join('')}</ul></details></div>`;
    $('#rq').oninput = e => { const q = e.target.value.trim().toLowerCase(); $$('#rl .tool').forEach(a => a.hidden = q && !a.dataset.q.toLowerCase().includes(q)); };
    return;
  }
  const room = roomsNow().find(r => r.id === id) || roomsNow()[0]; const topic = room.topic + (tl() === 'ar' ? ` — LANGUAGE OF THE ROOM: ${tlDia()[0]} (Arabic script; Persian-script pronunciation for new words)` : '');
  setTop(room.fa, true); const v = view();
  const p = await myProfile(); if (!p) { v.innerHTML = '<div class="card stack"><b>برای ورود به انجمن، اول وارد حساب آنلاین شو.</b><button class="btn" id="lg">ورود با ایمیل</button></div>'; $('#lg').onclick = () => loginSheet(() => routes.rooms(id)); return; }
  if (p.banned) { v.innerHTML = '<div class="card">به‌خاطر رعایت نکردن قوانین، دسترسی‌ات به انجمن بسته شده است.</div>'; return; }
  v.innerHTML = `<div class="convo"><div class="row small"><span class="pill acc" id="on">۰ نفر آنلاین</span><span class="grow"></span><button class="btn ghost sm" id="sc">🎭 سناریوی تازه از معلم</button></div><div class="msgs" id="msgs">${loading()}</div><div class="composer"><textarea id="tx" rows="1" placeholder="به انگلیسی بنویس…"></textarea><span id="mic"></span><button class="icon-btn on" id="snd">${I.send}</button></div></div>`;
  const msgs = $('#msgs');
  const render = m => {
    if (m.deleted) return `<div class="small muted" style="text-align:center" data-id="${m.id}">پیامی از @${esc(m.username)} حذف شد.</div>`;
    const mine = m.user_id === p.id && m.kind === 'user';
    if (m.kind === 'teacher') return `<div class="msg ai" data-id="${m.id}" style="border-right:4px solid var(--mark)"><b>👩‍🏫 ${esc(G.settings.teacher)}</b>${m.meta?.to ? ` <span class="tiny muted">به @${esc(m.meta.to)}</span>` : ''}<div dir="auto">${esc(m.body)}</div>${(m.meta?.fixes || []).map(f => `<div class="small"><s class="en">${esc(f.wrong)}</s> ← <b class="en">${esc(f.right)}</b> <span class="muted">${esc(f.why || '')}</span></div>`).join('')}${m.meta?.better ? `<div class="small">بهتر: <b class="en">${esc(m.meta.better)}</b></div>` : ''}</div>`;
    if (m.kind === 'system') return `<div class="notice small" data-id="${m.id}">${esc(m.body)}</div>`;
    return `<div class="msg ${mine ? 'me' : 'ai'}" data-id="${m.id}" dir="auto">${mine ? '' : `<a class="tiny" href="#u/${esc(m.username)}" style="color:inherit;opacity:.7">${esc(m.display_name)} @${esc(m.username)}</a><br>`}${esc(m.body)}${p.is_admin && !mine ? ` <button class="pill bad" data-del="${m.id}">حذف</button>` : ''}</div>`;
  };
  const bindDel = () => $$('[data-del]', msgs).forEach(b => b.onclick = async () => { await sb().from('messages').update({ deleted: true }).eq('id', b.dataset.del); });
  const { data: hist } = await sb().from('messages').select('*').eq('room', room.id).order('created_at', { ascending: false }).limit(60);
  const list = (hist || []).reverse(); msgs.innerHTML = list.map(render).join('') || '<div class="small muted" style="text-align:center">هنوز پیامی نیست؛ اولین سلام را تو بگو!</div>'; bindDel(); msgs.lastElementChild?.scrollIntoView();
  const ch = sb().channel('room:' + room.id, { config: { presence: { key: p.username } } })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${room.id}` }, ({ new: m }) => { list.push(m); msgs.insertAdjacentHTML('beforeend', render(m)); bindDel(); msgs.lastElementChild?.scrollIntoView({ behavior: 'smooth' }); if (m.kind === 'teacher' && m.meta?.to === p.username && G.settings.autoSpeak) say(m.body, 'fa', 'encouraging'); })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room=eq.${room.id}` }, ({ new: m }) => { const el = $(`[data-id="${m.id}"]`, msgs); if (el) el.outerHTML = render(m); })
    .on('presence', { event: 'sync' }, () => { const st = ch.presenceState(); $('#on') && ($('#on').textContent = `${faNum(Object.keys(st).length)} نفر آنلاین`); })
    .subscribe(s => { if (s === 'SUBSCRIBED') ch.track({ name: p.display_name }); });
  const leave = () => { sb().removeChannel(ch); removeEventListener('hashchange', leave); }; addEventListener('hashchange', leave);
  const post = (body, kind = 'user', meta = null) => sb().from('messages').insert({ room: room.id, user_id: p.id, username: p.username, display_name: p.display_name, kind, body, meta });
  const recent = () => list.slice(-10).map(m => `${m.kind === 'teacher' ? 'TEACHER' : '@' + m.username}: ${m.body}`).join('\n');
  const send = async (text, spoken) => {
    text = text.trim(); if (!text) return; $('#tx').value = '';
    if (BAD_WORDS.test(text)) { const { data: w } = await sb().rpc('add_warning'); p.warnings = w ?? (p.warnings || 0) + 1; return warn('این پیام کلمهٔ نامناسب داشت و فرستاده نشد.'); }
    let mod = { action: 'ok' };
    if (hasAI() || firstKeyed()) { try { mod = await ai({ temp: 0.2, system: `You are ${G.settings.teacher}, the warm moderator-teacher of an English-practice chat room for Persian speakers. Room topic: ${topic}.`, messages: [{ role: 'user', content: `Recent chat:\n${recent()}\n\nNew message from @${p.username}: "${text}"\nDecide: "block" if sexual, vulgar, insulting, harassing, hateful or sharing personal contact data; "offtopic" if clearly unrelated to the room topic or current scenario; otherwise "ok". Also correct the English — but ONLY real mistakes, like a fair native teacher:
- NEVER "correct" correct, natural English. Contractions and informal chat style are CORRECT and often MORE natural (I'm = I am, don't, gonna in casual chat, short answers like "Yeah, sure!"). Never make a sentence more formal or longer just for style.
- ${spoken ? 'This message was SPOKEN and turned into text by speech recognition. Ignore everything that is a transcription artifact: capital letters, punctuation, apostrophes, spelling of names, numbers, homophones, words that came out in Persian script (e.g. «ایران» = "Iran"), missing or repeated small words caused by the recognizer. Judge only what the learner clearly SAID. If unsure whether it is the learner\'s mistake or the recognizer\'s, do NOT correct it.' : 'Do not correct capitalization or punctuation in a casual chat unless it changes the meaning.'}
- Each fix must be a REAL error (wrong grammar, wrong word, wrong meaning); "right" must be clearly better, not just different. If the message is fine, return "fixes": [] and a short warm praise. JSON {"action":"ok|offtopic|block","reason":"Persian, short","fixes":[{"wrong":"","right":"","why":"Persian"}],"better":"most natural way to say it, or empty if already natural","note":"short warm teacher comment to this learner WRITTEN IN PERSIAN (praise, explain the correction in Persian, or bring them back to the topic — any English practice question goes after the Persian, with its Persian translation in parentheses); empty if nothing useful"}` }] }); } catch { } }
    if (mod.action === 'block') { const { data: w } = await sb().rpc('add_warning'); p.warnings = w ?? (p.warnings || 0) + 1; return warn(mod.reason || 'این پیام با قوانین انجمن سازگار نبود.'); }
    const nz = x => String(x || '').toLowerCase().replace(/[’']/g, "'").replace(/\bi'm\b/g, 'i am').replace(/\b(\w+)n't\b/g, '$1 not').replace(/\b(\w+)'re\b/g, '$1 are').replace(/\b(\w+)'s\b/g, '$1 is').replace(/\b(\w+)'ll\b/g, '$1 will').replace(/\b(\w+)'ve\b/g, '$1 have').replace(/\b(\w+)'d\b/g, '$1 would').replace(/[^a-z0-9\u0600-\u06ff ]+/g, ' ').replace(/ایران/g, 'iran').replace(/\s+/g, ' ').trim();
    mod.fixes = (mod.fixes || []).filter(f => f && f.wrong && f.right && nz(f.wrong) !== nz(f.right) && !(nz(f.wrong).replace(/ /g, '') === nz(f.right).replace(/ /g, '')));
    if (mod.better && nz(mod.better) === nz(text)) mod.better = '';
    const { error } = await post(text); if (error) return toast('فرستاده نشد: ' + error.message);
    addXP(4); saveU();
    if (mod.note || mod.fixes?.length || mod.action === 'offtopic') await post(mod.note || (mod.action === 'offtopic' ? 'Let\'s get back to our topic 😊' : 'Nice try!'), 'teacher', { to: p.username, fixes: mod.fixes || [], better: mod.better || '' });
  };
  const warn = (why) => { const bg = sheet(`<div class="stack"><div class="big-ic">⚠️</div><b>پیامت فرستاده نشد</b><div class="small">${esc(why)}</div><div class="notice small">این انجمن برای تمرین مکالمهٔ انگلیسی در فضایی امن و محترمانه ساخته شده. قوانین:<ul class="list">${FORUM_RULES.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div><span class="small muted">اخطار ${faNum(p.warnings || 0)} از ۳</span><button class="btn" onclick="this.closest('.sheet-bg').remove()">متوجه شدم</button></div>`); };
  $('#snd').onclick = () => send($('#tx').value); $('#tx').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send($('#tx').value); } };
  $('#mic').append(micButton(t => send(t, true)));
  $('#sc').onclick = async () => {
    if (needAI($('#msgs'))) return; const names = Object.keys(ch.presenceState());
    try { const r = await ai({ temp: 0.9, system: `You are ${G.settings.teacher}, a lively English teacher running a group role-play in a chat room.`, messages: [{ role: 'user', content: `Room topic: ${topic}. Online learners: ${names.map(n => '@' + n).join(', ') || '@' + p.username}. Create a short realistic everyday scenario about this topic and give each learner a role and a first task. Write in English with a short Persian explanation. JSON {"text":"scenario + roles (one line per learner) + who starts"}` }] });
      await post(r.text, 'teacher', { scenario: 'true' });
    } catch (e) { aiErr(e); }
  };
};

/* ───── پنل مدیر ───── */
routes.admin = async () => {
  setTop('پنل مدیر', true); const v = view(); v.innerHTML = loading();
  const p = await myProfile(true); if (!p?.is_admin) { v.innerHTML = '<div class="card">این صفحه فقط برای مدیر است.</div>'; return; }
  const { data: rows } = await sb().from('profiles').select('*, progress(*)').order('last_seen', { ascending: false }).limit(500);
  const users = rows || []; const today = isoDay(); const g = u => (Array.isArray(u.progress) ? u.progress[0] : u.progress) || {};
  startPresence(); const activeToday = users.filter(u => isoDay(new Date(u.last_seen)) === today).length; const week = users.filter(u => Date.now() - new Date(u.last_seen) < 7 * DAY).length;
  const since = addDays(today, -29); const { data: usage } = await sb().from('ai_usage').select('user_id, day, usd, calls').gte('day', since);
  const U30 = {}, UT = {}; (usage || []).forEach(r => { U30[r.user_id] = (U30[r.user_id] || 0) + Number(r.usd); if (r.day === today) UT[r.user_id] = { usd: Number(r.usd), calls: r.calls }; });
  const allUsd = Object.values(U30).reduce((a, b) => a + b, 0);
  const totalMin = users.reduce((s, u) => s + (g(u).minutes_total || 0), 0); const totalAI = users.reduce((s, u) => s + (g(u).ai_chat || 0), 0);
  v.innerHTML = `<div class="stack"><div class="card stack"><b>📚 درس‌های آماده برای همه</b><span class="small muted">هر درس یک بار با هوش مصنوعیِ خودت ساخته و روی سرور منتشر می‌شود؛ بعد همهٔ کاربران بدون هوش مصنوعی و آفلاین می‌خوانند.</span><button class="btn" id="bal">ساخت و انتشار همهٔ درس‌ها</button><div id="balo"></div></div><div class="grid2">${[['👥', 'کل کاربران', users.length], ['🟢', 'الان آنلاین', ONLINE.size], ['☀️', 'فعال امروز', activeToday], ['📅', 'فعال این هفته', week], ['⏱️', 'کل دقیقهٔ مطالعه', totalMin], ['🤖', 'درخواست‌های هوش مصنوعی', totalAI], ['⚠️', 'کاربران با اخطار', users.filter(u => u.warnings).length]].map(([ic, l, n]) => `<div class="card" style="text-align:center"><div style="font-size:22px">${ic}</div><b class="num" style="font-size:24px">${faNum(n)}</b><div class="small muted">${l}</div></div>`).join('')}</div>
  <div class="card stack" id="afb"></div>
  <div class="card stack"><b>📣 پیام به کاربران</b><select id="to" class="in"><option value="">همهٔ کاربران</option>${users.map(u => `<option value="${u.id}">${esc(u.display_name)} @${esc(u.username)}</option>`).join('')}</select><input id="tt" class="in" placeholder="عنوان"><textarea id="bd" class="in" placeholder="متن پیام"></textarea><button class="btn" id="sn">فرستادن</button></div>
  <div class="card stack"><b>🤖 کنترل هوش مصنوعی کاربران</b><span class="small muted">هزینهٔ ۳۰ روز اخیر همه: <b>${allUsd.toFixed(2)} دلار</b>. سقف پیش‌فرض هر نفر روزی ۱٫۵ دلار است (باقی‌ماندهٔ هر روز تا ۳۰ روز ذخیره می‌شود). برای هر نفر می‌توانی سقف جدا بگذاری یا هوش مصنوعی‌اش را ببندی.</span>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px"><thead><tr style="text-align:right;color:var(--muted)"><th>کاربر</th><th>امروز</th><th>۳۰ روز</th><th>سقف روزانه (دلار)</th><th>هوش مصنوعی</th><th>قفل درس‌ها</th><th></th></tr></thead><tbody>
  ${users.map(u => `<tr style="border-top:1px solid var(--line)" data-ai="${u.id}"><td>${esc(u.display_name)} <span class="en tiny muted">@${esc(u.username)}</span>${u.is_admin ? ' <span class="pill ok">مدیر</span>' : ''}</td><td class="num">${UT[u.id] ? '$' + UT[u.id].usd.toFixed(3) + ' · ' + faNum(UT[u.id].calls) + ' بار' : '—'}</td><td class="num">$${(U30[u.id] || 0).toFixed(2)}</td><td><input class="in" style="width:90px;padding:6px" dir="ltr" type="number" min="0" step="0.1" placeholder="1.5" value="${u.ai_daily ?? ''}" data-lim></td><td><label class="row small" style="gap:4px;flex-wrap:nowrap"><input type="checkbox" data-on ${u.ai_off ? '' : 'checked'}> روشن</label></td><td><select class="in" style="padding:6px;width:120px" data-unl>${[['', 'عادی (به ترتیب)'], ['intro', 'باز تا مقدماتی'], ['l1', 'باز تا سطح ۱'], ['l2', 'باز تا سطح ۲'], ['l3', 'باز تا سطح ۳'], ['all', 'همه باز']].map(([k, t]) => `<option value="${k}"${(u.unlock || '') === k ? ' selected' : ''}>${t}</option>`).join('')}</select></td><td><button class="btn sm" data-save>ذخیره</button></td></tr>`).join('')}</tbody></table></div></div>
  <div class="sec">کاربران <small>${faNum(users.length)} نفر</small></div>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:640px"><thead><tr style="text-align:right;color:var(--muted)"><th>کاربر</th><th>درس فعلی</th><th>امروز</th><th>هفته</th><th>کل</th><th>پیشرفت</th><th>🔥</th><th>AI</th><th>آخرین حضور</th><th></th></tr></thead><tbody>
  ${users.map(u => { const x = g(u); return `<tr style="border-top:1px solid var(--line)"><td><a href="#u/${esc(u.username)}">${esc(u.display_name)}</a><br><span class="en tiny muted">@${esc(u.username)}</span>${u.warnings ? ` <span class="pill bad">${faNum(u.warnings)} اخطار</span>` : ''}</td><td>${esc(x.current_unit || '—')}</td><td class="num">${faNum(x.minutes_today || 0)}′</td><td class="num">${faNum(x.minutes_week || 0)}′</td><td class="num">${faNum(x.minutes_total || 0)}′</td><td style="min-width:110px"><div class="small">${faNum(x.mastered || 0)} از ${faNum(ALL_UNITS.length)} درس</div><div class="pbar"><i style="width:${Math.round((x.mastered || 0) / ALL_UNITS.length * 100)}%;background:var(--accent)"></i></div></td><td class="num">${faNum(x.streak || 0)}</td><td class="num">${faNum(x.ai_chat || 0)}</td><td>${dot(u.username)} ${ONLINE.has(u.username) ? 'آنلاین' : lastSeenFa(u.last_seen)}<br><a class="tiny" href="#dm/${esc(u.username)}">پیام</a></td><td>${u.is_admin ? '<span class="pill acc">مدیر</span>' : `<button class="btn line sm" data-ban="${u.id}" data-b="${u.banned ? 0 : 1}">${u.banned ? 'رفع محرومیت' : 'محروم از انجمن'}</button>`}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  $('#sn').onclick = async () => { const title = $('#tt').value.trim(), body = $('#bd').value.trim(); if (!title || !body) return toast('عنوان و متن را بنویس.'); const { error } = await sb().from('notices').insert({ to_user: $('#to').value || null, title, body }); toast(error ? 'خطا: ' + error.message : 'پیام فرستاده شد ✓'); if (!error) { $('#tt').value = ''; $('#bd').value = ''; } };
  $$('[data-save]').forEach(b => b.onclick = async () => { const tr = b.closest('[data-ai]'); const lim = tr.querySelector('[data-lim]').value.trim(); const { error } = await sb().rpc('set_ai_access', { uid: tr.dataset.ai, daily: lim === '' ? null : Number(lim), off: !tr.querySelector('[data-on]').checked }); const { error: e2 } = await sb().rpc('set_unlock', { uid: tr.dataset.ai, lvl: tr.querySelector('[data-unl]').value }); toast(error || e2 ? 'خطا: ' + (error || e2).message : 'تنظیمات این کاربر ذخیره شد ✓'); if (!e2 && (await myProfile())?.id === tr.dataset.ai) { await myProfile(true); toast('قفل درس‌های خودت به‌روز شد ✓'); } });
  $$('[data-ban]').forEach(b => b.onclick = async () => { await sb().from('profiles').update({ banned: b.dataset.b === '1' }).eq('id', b.dataset.ban); routes.admin(); });
  $('#bal') && ($('#bal').onclick = () => { if (needAI($('#balo'))) return; buildAllLessons($('#balo')); });
  adminFeedback($('#afb'));
};

/* ───── کارت حساب در صفحهٔ «من» ───── */
async function meOnline() {
  const box = $('#online-me'); if (!box) return; const p = await myProfile();
  if (!p) { box.innerHTML = `<div class="card stack"><b>🌐 حساب آنلاین</b><span class="small muted">با ایمیل و کد تأیید وارد شو تا یوزرنیم و صفحهٔ اختصاصی داشته باشی، در رقابت همه باشی و وارد انجمن شوی.</span><button class="btn" id="lg">ورود / ثبت‌نام با ایمیل</button></div>`; $('#lg', box).onclick = () => loginSheet(() => routes.me()); return; }
  box.innerHTML = `<div class="card stack"><div class="row"><b class="grow">🌐 حساب آنلاین: <span class="en">@${esc(p.username)}</span></b>${p.is_admin ? '<a class="btn sm" href="#admin">پنل مدیر</a>' : ''}</div><div class="row"><a class="btn ghost sm" href="#u/${esc(p.username)}">صفحهٔ من</a><a class="btn ghost sm" href="#rooms">انجمن</a><a class="btn ghost sm" href="#dm">پیام‌ها</a><button class="btn ghost sm" id="pwb">🔑 رمز عبور</button><button class="btn line sm" id="lo">خروج از حساب</button></div></div>`;
  box.insertAdjacentHTML('beforeend', `<div class="card stack"><b>☁️ پشتیبان ابری</b><span class="small muted">همهٔ پیشرفت، جعبهٔ لایتنر، کتاب‌ها و حافظهٔ معلم روی سرور ذخیره می‌شود تا روی هر گوشی یا کامپیوتری با همین حساب برگردد. آخرین پشتیبان: ${lsGet('zd:lastBackup:' + G.active, 0) ? lastSeenFa(lsGet('zd:lastBackup:' + G.active, 0)) : 'هنوز نه'}</span><label class="row small"><input type="checkbox" id="ab"${lsGet('zd:autoBackup:' + G.active, true) ? ' checked' : ''}> پشتیبان‌گیری خودکار (هر ۳۰ دقیقه)</label><div class="row"><button class="btn ghost sm" id="bk1">ذخیرهٔ الان</button><button class="btn ghost sm" id="rs1">بازگرداندن از سرور</button></div><div id="rsc"></div></div>`);
  $('#ab').onchange = e => lsSet('zd:autoBackup:' + G.active, e.target.checked); $('#bk1').onclick = () => cloudBackup(false);
  $('#rs1').onclick = () => { $('#rsc').innerHTML = '<div class="notice row small"><span class="grow">پیشرفت فعلی این دستگاه با نسخهٔ سرور جایگزین می‌شود. مطمئنی؟</span><button class="btn sm" id="rsy">بله</button></div>'; $('#rsy').onclick = cloudRestore; };
  $('#pwb') && ($('#pwb').onclick = newPasswordSheet);
  $('#lo').onclick = async () => { await sb().auth.signOut(); OP = null; delete U.online; saveU(); routes.me(); };
}

/* ───── حضور آنلاین (چراغ سبز) و آخرین بازدید ───── */
let presenceCh = null; const ONLINE = new Set();
async function startPresence() {
  const p = await myProfile(); if (!p || presenceCh) return;
  presenceCh = sb().channel('presence:all', { config: { presence: { key: p.username } } })
    .on('presence', { event: 'sync' }, () => { ONLINE.clear(); Object.keys(presenceCh.presenceState()).forEach(k => ONLINE.add(k)); $$('[data-dot]').forEach(el => el.classList.toggle('live', ONLINE.has(el.dataset.dot))); })
    .subscribe(s => { if (s === 'SUBSCRIBED') presenceCh.track({ at: Date.now() }); });
}
function lastSeenFa(ts) {
  const m = Math.round((Date.now() - new Date(ts)) / 60000);
  if (m < 2) return 'همین الان'; if (m < 60) return `${faNum(m)} دقیقه پیش`; const h = Math.round(m / 60); if (h < 24) return `${faNum(h)} ساعت پیش`;
  const d = Math.round(h / 24); return d < 30 ? `${faNum(d)} روز پیش` : jLabel(isoDay(new Date(ts)), true);
}
const dot = (username) => `<span class="dot${ONLINE.has(username) ? ' live' : ''}" data-dot="${esc(username)}" title="آنلاین"></span>`;
setInterval(() => { if (U?.online) startPresence(); }, 5000);

/* ───── پیام خصوصی ───── */
routes.dm = async (username) => {
  const me_ = await myProfile(); const v = view();
  if (!me_) { setTop('پیام‌ها', true); v.innerHTML = '<div class="card stack"><b>برای پیام دادن وارد حساب آنلاین شو.</b><button class="btn" id="lg">ورود</button></div>'; $('#lg').onclick = () => loginSheet(() => routes.dm(username)); return; }
  if (!username) { // صندوق پیام
    setTop('پیام‌ها', true); v.innerHTML = loading();
    const { data, error } = await sb().from('dms').select('*').or(`from_user.eq.${me_.id},to_user.eq.${me_.id}`).order('created_at', { ascending: false }).limit(300);
    if (error) { v.innerHTML = `<div class="notice">پیام خصوصی هنوز فعال نشده؛ مدیر باید فایل supabase-setup-2.sql را اجرا کند.</div>`; return; }
    const ids = [...new Set((data || []).map(m => m.from_user === me_.id ? m.to_user : m.from_user))];
    const { data: ps } = ids.length ? await sb().from('profiles').select('id,username,display_name,avatar,photo,last_seen').in('id', ids) : { data: [] };
    const { data: everyone } = await sb().from('profiles').select('id,username,display_name,avatar,photo,last_seen,is_admin').order('last_seen', { ascending: false }).limit(200);
    const row = (u, extra = '') => `<a class="card row" style="text-decoration:none;color:inherit;flex-wrap:nowrap" href="#dm/${esc(u.username)}"><span class="avatar" style="position:relative">${safeImg(u.photo) ? `<img src="${safeImg(u.photo)}" alt="">` : esc(u.avatar || '🙂')}</span>${dot(u.username)}<span class="grow" style="min-width:0"><b>${esc(u.display_name)}</b>${u.is_admin ? ' <span class="pill acc">مدیر</span>' : ''} <span class="en tiny muted">@${esc(u.username)}</span><br><span class="tiny muted">${ONLINE.has(u.username) ? 'آنلاین' : 'آخرین بازدید: ' + lastSeenFa(u.last_seen)}</span>${extra}</span></a>`;
    v.innerHTML = `<div class="stack">${ids.length ? '<div class="sec">گفتگوهای من</div>' + ids.map(id => { const u = (ps || []).find(x => x.id === id); if (!u) return ''; const last = data.find(m => m.from_user === id || m.to_user === id); const unread = data.filter(m => m.from_user === id && !m.read).length; return row(u, `<br><span class="small">${esc(last.body.slice(0, 60))}</span>${unread ? ` <span class="pill bad">${faNum(unread)} تازه</span>` : ''}`); }).join('') : ''}
    <div class="sec">همهٔ زبان‌آموزها <small>برای شروع گفتگو بزن</small></div><input id="fq" class="in" placeholder="جستجوی نام یا یوزرنیم…"><div class="stack" id="ev">${(everyone || []).filter(u => u.id !== me_.id).map(u => `<div data-q="${esc(u.display_name + ' ' + u.username)}">${row(u)}</div>`).join('')}</div></div>`;
    $('#fq').oninput = e => { const q = e.target.value.trim().toLowerCase(); $$('#ev [data-q]').forEach(d => d.hidden = q && !d.dataset.q.toLowerCase().includes(q)); };
    return;
  }
  const { data: other } = await sb().from('profiles').select('*').eq('username', username).maybeSingle(); if (!other) { setTop('پیام', true); v.innerHTML = '<div class="card">کاربر پیدا نشد.</div>'; return; }
  setTop(other.display_name, true);
  v.innerHTML = `<div class="convo"><a class="card row" href="#u/${esc(other.username)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="avatar">${safeImg(other.photo) ? `<img src="${safeImg(other.photo)}" alt="">` : esc(other.avatar)}</span>${dot(other.username)}<span class="grow"><b>${esc(other.display_name)}</b> <span class="en tiny muted">@${esc(other.username)}</span><br><span class="tiny muted" id="ls">${ONLINE.has(other.username) ? 'آنلاین' : 'آخرین بازدید: ' + lastSeenFa(other.last_seen)}</span></span></a>
  <div class="notice soft small">پیام‌ها خصوصی‌اند. سعی کن انگلیسی بنویسی؛ دکمهٔ ✨ متنت را قبل از فرستادن اصلاح می‌کند.</div><div class="msgs" id="msgs">${loading()}</div>
  <div class="composer"><textarea id="tx" rows="1" placeholder="پیام…"></textarea><button class="icon-btn" id="fix" title="اصلاح انگلیسی">✨</button><button class="icon-btn on" id="snd">${I.send}</button></div></div>`;
  const msgs = $('#msgs'); const pair = `and(from_user.eq.${me_.id},to_user.eq.${other.id}),and(from_user.eq.${other.id},to_user.eq.${me_.id})`;
  const render = m => `<div class="msg ${m.from_user === me_.id ? 'me' : 'ai'}" dir="auto">${esc(m.body)}<div class="tiny" style="opacity:.6">${new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}${m.from_user === me_.id && m.read ? ' ✓✓' : ''}</div></div>`;
  const { data, error } = await sb().from('dms').select('*').or(pair).order('created_at').limit(300);
  if (error) { msgs.innerHTML = `<div class="notice">پیام خصوصی هنوز فعال نشده؛ مدیر باید فایل supabase-setup-2.sql را اجرا کند.</div>`; return; }
  msgs.innerHTML = (data || []).map(render).join('') || '<div class="small muted" style="text-align:center">اولین پیام را بفرست 👋</div>'; msgs.lastElementChild?.scrollIntoView();
  sb().from('dms').update({ read: true }).eq('to_user', me_.id).eq('from_user', other.id).eq('read', false).then(() => { });
  const ch = sb().channel('dm:' + me_.id + ':' + other.id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dms', filter: `to_user=eq.${me_.id}` }, ({ new: m }) => { if (m.from_user !== other.id) return; msgs.insertAdjacentHTML('beforeend', render(m)); msgs.lastElementChild?.scrollIntoView({ behavior: 'smooth' }); sb().from('dms').update({ read: true }).eq('id', m.id).then(() => { }); }).subscribe();
  const leave = () => { sb().removeChannel(ch); removeEventListener('hashchange', leave); }; addEventListener('hashchange', leave);
  const send = async () => { const body = $('#tx').value.trim(); if (!body) return; if (BAD_WORDS.test(body)) return toast('این پیام کلمهٔ نامناسب دارد.'); $('#tx').value = '';
    const { data: m, error } = await sb().from('dms').insert({ from_user: me_.id, to_user: other.id, body }).select().single(); if (error) return toast('فرستاده نشد: ' + error.message); msgs.insertAdjacentHTML('beforeend', render(m)); msgs.lastElementChild?.scrollIntoView({ behavior: 'smooth' }); addXP(2); saveU(); };
  $('#snd').onclick = send; $('#tx').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  $('#fix').onclick = async () => { const t = $('#tx').value.trim(); if (!t) return; if (needAI(msgs)) return; try { const r = await ai({ temp: 0.2, system: 'English writing helper for Persian speakers.', messages: [{ role: 'user', content: `Make this chat message natural English (keep meaning, casual tone). If it is Persian, translate it. JSON {"text":"","note":"short Persian note on what changed"}\n${t}` }] }); $('#tx').value = r.text; if (r.note) toast(r.note, 4500); } catch (e) { aiErr(e); } };
};
async function unreadCount() { const p = await myProfile(); if (!p) return 0; const { count } = await sb().from('dms').select('id', { count: 'exact', head: true }).eq('to_user', p.id).eq('read', false); return count || 0; }


/* ───── ثبت‌نام و ورود با نام کاربری و رمز ───── */
const authErrFa = m => /already registered|already exists/i.test(m) ? 'با این ایمیل قبلاً حساب ساخته شده؛ از برگهٔ «ورود» وارد شو.' : /rate|seconds|limit/i.test(m) ? 'درخواست زیاد بود؛ یک دقیقه بعد دوباره امتحان کن.' : /invalid login|credentials/i.test(m) ? 'نام کاربری یا رمز درست نیست.' : /not confirmed/i.test(m) ? 'ایمیلت هنوز تأیید نشده؛ روی لینک داخل ایمیل بزن (پوشهٔ اسپم را هم ببین).' : /password/i.test(m) ? 'رمز قابل قبول نیست؛ رمز قوی‌تر (حداقل ۸ حرف) بنویس.' : 'خطا: ' + m;
async function authSignUp({ name, un, email, pw, avatar }) {
  if (!window.supabase) { toast('اتصال آنلاین در دسترس نیست.'); return; }
  const tmp = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  try { const { data, error } = await tmp.rpc('username_free', { uname: un }); if (!error && data === false) return 'taken'; } catch { }
  if (U && !U.online && G.active) { Object.assign(me(), { name, avatar }); saveG('users'); } else addUser(name, avatar); $('nav.bottom').hidden = false;
  const { data, error } = await sb().auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + location.pathname, data: { username: un, display_name: name, avatar } } });
  if (error) { toast(authErrFa(error.message), 6000); go('guide'); router(); return; }
  if (data.session) { await sb().from('profiles').insert({ id: data.user.id, username: un, display_name: name, avatar }); const p = await myProfile(true); if (p) { U.online = { uid: p.id, username: p.username }; saveU(); syncNow(); } go('guide'); router(); toast('حسابت ساخته شد @' + un + ' 🎉'); return; }
  go('guide'); router();
  setTimeout(() => sheet(`<div class="stack"><b style="font-size:18px">📧 ایمیلت را تأیید کن</b><span>یک ایمیل به <b class="en">${esc(email)}</b> فرستادیم. روی لینک داخلش بزن تا حسابت با نام کاربری <b class="en">@${esc(un)}</b> فعال شود (پوشهٔ اسپم را هم ببین).</span><span class="small muted">بعد از زدن روی لینک، برنامه خودش باز می‌شود و وارد حسابت می‌شوی. اگر برنامه را بستی، با نام کاربری و رمزت وارد شو.</span><button class="btn" onclick="this.closest('.sheet-bg').remove()">باشه</button></div>`), 400);
}
async function authSignIn(id, pw) {
  if (!window.supabase) return toast('اتصال آنلاین در دسترس نیست.');
  const tmp = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  let email = id.toLowerCase();
  if (!email.includes('@')) {
    const { data, error } = await tmp.rpc('login_email', { uname: email, pw });
    if (error) return toast(/function|not find|schema/i.test(error.message) ? 'ورود با نام کاربری هنوز فعال نشده (مدیر باید فایل SQL دوم را اجرا کند)؛ فعلاً با ایمیلت وارد شو.' : authErrFa(error.message), 6000);
    if (!data) return toast('نام کاربری یا رمز درست نیست.'); email = data;
  }
  const { data, error } = await tmp.auth.signInWithPassword({ email, password: pw });
  if (error) return toast(authErrFa(error.message), 6000);
  const { data: prof } = await tmp.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  const md = data.user.user_metadata || {};
  const nm = prof?.display_name || md.display_name || 'کاربر', av = prof?.avatar || md.avatar || '🙂';
  const same = G.users.find(x => userData(x.id).online?.uid === data.user.id); const reuse = !same && U && !U.online && G.active;
  if (same) loadUser(same.id); else if (reuse) { Object.assign(me(), { name: nm, avatar: av }); saveG('users'); } else addUser(nm, av);
  if (prof?.photo) { me().photo = safeImg(prof.photo); saveG('users'); }
  await sb().auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  let p = await myProfile(true);
  if (!p && /^[a-z0-9_]{3,20}$/.test(md.username || '')) { await sb().from('profiles').insert({ id: data.user.id, username: md.username, display_name: md.display_name || me().name, avatar: md.avatar || '🙂' }); p = await myProfile(true); }
  $('nav.bottom').hidden = false; go('home');
  if (p) {
    U.online = { uid: p.id, username: p.username }; saveU();
    const { data: bk } = await sb().from('backups').select('updated_at').eq('user_id', p.id).maybeSingle();
    if (bk && window.cloudRestore) { await cloudRestore(); } else { lsSet('zd:bkOk:' + G.active, true); router(); }
    toast('خوش برگشتی @' + p.username + ' 🎉'); syncNow();
  } else { router(); loginSheet(); }
}
async function forgotPassword(id) {
  const email = id && id.includes('@') ? id : prompt('ایمیل حسابت را بنویس:'); if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;
  const tmp = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  const { error } = await tmp.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: location.origin + location.pathname });
  toast(error ? authErrFa(error.message) : 'لینک تغییر رمز به ایمیلت فرستاده شد.', 6000);
}
function newPasswordSheet() {
  const bg = sheet(`<div class="stack"><b style="font-size:18px">رمز تازه</b><label class="f">رمز عبور تازه (حداقل ۸ حرف)<input id="np" class="in" dir="ltr" type="password" autocomplete="new-password"></label><button class="btn" id="sv">ذخیره</button></div>`);
  $('#sv', bg).onclick = async () => { const pw = $('#np', bg).value; if (pw.length < 8) return toast('حداقل ۸ حرف.'); const { error } = await sb().auth.updateUser({ password: pw }); if (error) return toast(authErrFa(error.message)); bg.remove(); toast('رمزت عوض شد ✓'); };
}

/* ───── پیوستن به رقابت با یک کلیک (بدون ایمیل؛ ورود ناشناس Supabase) ───── */
async function joinCompetition() {
  const c = sb(); if (!c) return toast('اتصال آنلاین در دسترس نیست.');
  const bg = sheet(`<div class="stack"><b style="font-size:18px">🏆 پیوستن به رقابت</b><span class="small muted">یک نام کاربری انتخاب کن؛ همین! بقیه پیشرفت تو را در جدول می‌بینند (سطح، درس‌ها، واژه‌ها، زمان مطالعه).</span>
    <label class="f">نام کاربری (حروف انگلیسی کوچک، عدد و _)<input id="un" class="in" dir="ltr" maxlength="20" value="${esc((me().name || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}" placeholder="rasta_eng"></label><span class="tiny muted" id="unh"></span>
    <button class="btn" id="jn">ورود به مسابقه</button><span class="tiny muted">بعداً اگر خواستی، از «من» برای حسابت ایمیل و رمز بگذار تا روی گوشی دیگر هم برگردد.</span></div>`);
  $('#jn', bg).onclick = async () => {
    const un = $('#un', bg).value.trim().toLowerCase(); if (!/^[a-z0-9_]{3,20}$/.test(un)) return $('#unh', bg).textContent = 'فقط حروف انگلیسی کوچک، عدد و _ ؛ ۳ تا ۲۰ حرف.';
    const b = $('#jn', bg); b.disabled = true; b.textContent = 'لحظه‌ای صبر کن…';
    try {
      let s = await session();
      if (!s) { const { error } = await c.auth.signInAnonymously({ options: { data: { username: un, display_name: me().name } } }); if (error) throw error; s = await session(); }
      const { error } = await c.from('profiles').insert({ id: s.user.id, username: un, display_name: me().name, avatar: me().avatar, photo: me().photo || null });
      if (error && !/duplicate key.*pkey/i.test(error.message)) { b.disabled = false; b.textContent = 'ورود به مسابقه'; return $('#unh', bg).textContent = /duplicate|unique/i.test(error.message) ? 'این نام کاربری گرفته شده؛ یکی دیگر بنویس.' : 'خطا: ' + error.message; }
      const p = await myProfile(true); U.online = { uid: p.id, username: p.username, anon: true }; saveU(); bg.remove(); toast('به مسابقه خوش آمدی @' + p.username + ' 🏆'); syncNow(); routes.home();
    } catch (e) {
      b.disabled = false; b.textContent = 'ورود به مسابقه';
      if (/anonymous/i.test(e.message || '')) { bg.remove(); toast('پیوستن بدون ایمیل هنوز روی سرور روشن نشده؛ فعلاً با ایمیل وارد شو.', 6000); loginSheet(() => routes.home()); }
      else toast(authErrFa(e.message || ''), 6000);
    }
  };
}

/* ───── انتقادات و پیشنهادات (متن یا صدا) ───── */
routes.feedback = (k0) => {
  setTop('انتقادات و پیشنهادات', true); const v = view();
  v.innerHTML = `<div class="stack"><div class="card stack"><b>💡 ایده، درخواست یا انتقادت را بگو</b><span class="small muted">با صدا ضبط کن یا بنویس؛ مستقیم به دست مدیر برنامه می‌رسد.</span>
    <div class="seg" id="fk">${[['idea', '💡 پیشنهاد برای این اپ'], ['startup', '🚀 ایدهٔ استارتاپ'], ['bug', '🐞 ایراد'], ['request', '🙋 درخواست'], ['other', '💬 سایر']].map(([k, t], i) => `<button data-v="${k}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div>
    <div class="row" style="flex-wrap:nowrap;align-items:stretch"><textarea id="fb" class="in grow" rows="5" placeholder="بنویس یا دکمهٔ 🎙 را بزن و بگو…"></textarea></div>
    <div class="row"><button class="btn ghost" id="frec">🎙 ضبط صدا</button><span id="fst" class="small muted"></span></div><div id="fau"></div>
    <button class="btn" id="fsend">فرستادن</button></div><div id="fmine"></div></div>`;
  let kind = 'idea', audio = null, rec = null, chunks = [], sr = null;
  if (k0 === 'startup') { kind = 'startup'; $$('#fk button').forEach(x => x.classList.toggle('on', x.dataset.v === 'startup')); $('#fb').placeholder = 'ایده‌ات را بگو: چه مشکلی را حل می‌کند، برای چه کسانی، و چرا الان؟ من می‌خوانم و اگر جذاب بود با هم جلو می‌بریم.'; }
  $('#fk').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#fk button').forEach(x => x.classList.toggle('on', x === b)); kind = b.dataset.v; };
  $('#frec').onclick = async () => {
    if (rec) { rec.stop(); try { sr?.stop(); } catch { } return; }
    let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return toast('اجازهٔ میکروفون داده نشده.'); }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(m => window.MediaRecorder?.isTypeSupported?.(m)) || '';
    rec = new MediaRecorder(st, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : undefined); chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = () => { st.getTracks().forEach(t => t.stop()); const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' }); rec = null; $('#frec').textContent = '🎙 ضبط دوباره'; $('#fst').textContent = '';
      const r = new FileReader(); r.onload = () => { audio = r.result; $('#fau').innerHTML = `<audio controls src="${audio}" style="width:100%"></audio><button class="btn line sm" id="fdel">حذف صدا</button>`; $('#fdel').onclick = () => { audio = null; $('#fau').innerHTML = ''; }; }; r.readAsDataURL(blob); };
    rec.start(); $('#frec').textContent = '⏹ پایان ضبط'; $('#fst').textContent = '● در حال ضبط (حداکثر ۲ دقیقه)'; setTimeout(() => rec?.state === 'recording' && rec.stop(), 120000);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (SR) { sr = new SR(); sr.lang = 'fa-IR'; sr.continuous = false; sr.interimResults = false; sr.onresult = e => { const t = e.results[e.results.length - 1]; if (t.isFinal) { const cur = $('#fb').value.trim(); $('#fb').value = cleanRepeats((cur ? cur + ' ' : '') + t[0].transcript); } }; sr.onend = () => { if (rec?.state === 'recording') try { sr.start(); } catch { } }; try { sr.start(); } catch { } }
  };
  $('#fsend').onclick = async () => {
    const body = cleanRepeats($('#fb').value.trim()); if (!body && !audio) return toast('چیزی ننوشتی و ضبط نکردی.'); if (audio && audio.length > 1_500_000) return toast('صدا خیلی طولانی است؛ کوتاه‌تر ضبط کن.');
    const p = await myProfile(); if (!p) return toast('برای فرستادن، وارد حساب شو.');
    const { error } = await sb().from('feedback').insert({ username: p.username, display_name: p.display_name, kind, body, audio });
    if (error) return toast('فرستاده نشد: ' + error.message); toast('ممنون! پیامت به مدیر رسید 🙏'); $('#fb').value = ''; audio = null; $('#fau').innerHTML = ''; mine();
  };
  const mine = async () => { const p = await myProfile(); if (!p) return; const { data } = await sb().from('feedback').select('id,kind,body,created_at,seen').eq('user_id', p.id).order('created_at', { ascending: false }).limit(20);
    $('#fmine').innerHTML = (data || []).length ? `<div class="sec">پیام‌های قبلی من</div>${data.map(f => `<div class="card small">${esc(f.body || '🎙 پیام صوتی')}<div class="tiny muted">${jLabel(isoDay(new Date(f.created_at)))} ${f.seen ? '· ✓ دیده شد' : ''}</div></div>`).join('')}` : ''; };
  mine();
};
async function adminFeedback(box) {
  const { data, error } = await sb().from('feedback').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) { box.innerHTML = `<span class="small muted">جدول انتقادات هنوز ساخته نشده.</span>`; return; }
  const K = { idea: '💡', bug: '🐞', request: '🙋', other: '💬' };
  box.innerHTML = `<b>💡 انتقادات و پیشنهادات (${faNum((data || []).filter(f => !f.seen).length)} تازه)</b>${(data || []).map(f => `<div class="card stack small" style="${f.seen ? 'opacity:.7' : 'box-shadow:0 0 0 2px var(--accent)'}"><div class="row"><b class="grow">${K[f.kind] || '💬'} ${esc(f.display_name || '')} <span class="en tiny muted">@${esc(f.username || '')}</span></b><span class="tiny muted">${jLabel(isoDay(new Date(f.created_at)), true)}</span></div>${f.body ? `<div>${esc(f.body)}</div>` : ''}${f.audio ? `<audio controls preload="none" src="${f.audio}" style="width:100%"></audio>` : ''}<div class="row">${f.seen ? '' : `<button class="btn sm" data-fs="${f.id}">✓ دیدم</button>`}<button class="btn line sm" data-fd="${f.id}">حذف</button></div></div>`).join('') || '<span class="small muted">هنوز پیامی نیامده.</span>'}`;
  $$('[data-fs]', box).forEach(b => b.onclick = async () => { await sb().from('feedback').update({ seen: true }).eq('id', b.dataset.fs); adminFeedback(box); });
  $$('[data-fd]', box).forEach(b => b.onclick = async () => { await sb().from('feedback').delete().eq('id', b.dataset.fd); adminFeedback(box); });
}

/* ───── دربارهٔ ما ───── */
routes.about = () => {
  setTop('دربارهٔ ما', true); const v = view();
  v.innerHTML = `<div class="stack">
  <div class="card stack about-hero"><img src="logo.svg" alt="" style="width:84px;height:84px;border-radius:22px"><b style="font-size:20px">زبان رستا</b><span class="small">یادگیری زبان مثل یک کلاس خصوصیِ گرم — با معلمی که فارسی توضیح می‌دهد، هر چه بخواهی یادت می‌دهد و هیچ‌وقت خسته نمی‌شود.</span></div>
  <div class="card stack"><b>👋 من رستا هستم</b>
    <span class="small" style="line-height:2">طراح این اپلیکیشن و چند استارتاپ دیگر. سال‌هاست در حوزهٔ پژوهش و راهبرد کار می‌کنم و همیشه دنبال این بوده‌ام که فناوری را به ابزاری ساده و در دسترس برای زندگی واقعی آدم‌ها تبدیل کنم. «زبان رستا» از یک نیاز شخصی شروع شد: می‌خواستم زبان را آن‌طور یاد بگیرم که یک معلم خصوصی دلسوز درس می‌دهد — با توضیح فارسی، تلفظ به خط خودمان، مثال‌های واقعی، و بدون اینکه حتی یک کلمه از قلم بیفتد. بعد فکر کردم چرا این امکان برای همه نباشد؟</span>
    <span class="small" style="line-height:2">این برنامه هر روز بهتر می‌شود، و بخش بزرگی از این بهتر شدن از نظرها و ایده‌های شما می‌آید.</span></div>
  <div class="card stack"><b>🚀 ایده‌ای برای یک استارتاپ داری؟</b><span class="small">اگر ایده‌ای در سر داری — هر حوزه‌ای — یا دنبال هم‌تیمی هستی، برایم بنویس یا با صدا بگو. همهٔ پیام‌ها را خودم می‌خوانم.</span><a class="btn" href="#feedback/startup">🚀 ایده‌ام را می‌گویم</a></div>
  <div class="card stack"><b>💡 نظری برای بهتر شدن این اپ داری؟</b><span class="small">پیشنهاد، درخواست یا ایراد — با صدا یا متن.</span><a class="btn line" href="#feedback">💡 نظرم را می‌گویم</a></div>
  <div class="card stack small muted"><b>درباره‌ٔ فناوری</b><span>معلم زنده و محتوا با هوش مصنوعی ساخته می‌شود؛ طرح درس‌ها، سیاست تدریس و دوره‌ها طراحی اختصاصی این برنامه است. متن‌های کتاب‌های صوتی بازنویسی ساده‌شدهٔ آثار آزاد یا داستان‌های اختصاصی‌اند.</span><span>نسخهٔ ${esc((typeof SW_VER !== 'undefined' && SW_VER) || '')} · ساخته‌شده با ❤️ برای فارسی‌زبان‌ها</span></div></div>`;
};
