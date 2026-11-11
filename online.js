/* زبان دوم — بخش آنلاین: حساب با کد تأیید ایمیل، رقابت زنده، صفحهٔ کاربر، انجمن و چت‌روم با معلم ناظر، پنل مدیر */
'use strict';
const SB_URL = 'https://xlubjxbpwwmaddpgswik.supabase.co';
const SB_KEY = 'sb_publishable_MW-qwJWudZu7GVXsY4g8nw_0cqbv7gE'; // کلید عمومی (برای استفاده در برنامهٔ عمومی ساخته شده)
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
const BAD_WORDS = /\b(f+u+c+k|sh[i1]t|b[i1]tch|d[i1]ck|pussy|porn|sex|n[i1]gg|asshole|bastard|slut|whore)\w*|کیر|کس\s?کش|جنده|کون|سکس|لاشی|حرومزاده|گاییدم/i;

let _sb = null, _sbFor = null, OP = null; // OP = پروفایل آنلاین کاربر فعال
function sb() { if (!window.supabase) return null; if (_sb && _sbFor === G.active) return _sb; _sbFor = G.active; _sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, storageKey: 'zd-sb-' + G.active, autoRefreshToken: true } }); OP = null; return _sb; }
async function session() { const c = sb(); if (!c) return null; try { const { data } = await c.auth.getSession(); return data.session; } catch { return null; } }
async function myProfile(force) { if (OP && !force) return OP; const s = await session(); if (!s) return null; const { data } = await sb().from('profiles').select('*').eq('id', s.user.id).maybeSingle(); OP = data || null; return OP; }

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
  const c = sb(); if (!c) { location.hash = 'home'; return; }
  for (let i = 0; i < 20 && !(await session()); i++) await sleep(150);
  history.replaceState(null, '', location.pathname + '#home');
  const s = await session(); if (!s) { toast('ورود کامل نشد؛ لینک منقضی شده بود. دوباره کد بخواه.', 5000); return router(); }
  const p = await myProfile(true); router();
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
  const p = await myProfile(); if (!p || !U) return;
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
  if (!U.online) { box.innerHTML = `<div class="card row" style="flex-wrap:nowrap"><span style="font-size:28px">🌐</span><div class="grow"><b>رقابت با همه</b><div class="small muted">وارد حساب آنلاین شو تا در جدول رقابت همهٔ کاربران باشی و وارد انجمن شوی.</div></div><button class="btn sm" id="lg">ورود</button></div>`; $('#lg').onclick = () => loginSheet(() => routes.home()); return; }
  syncNow();
  try {
    startPresence(); const { data } = await sb().from('progress').select('week_xp,xp,streak,mastered,learned,current_unit,minutes_today,minutes_week,profiles(username,display_name,avatar,photo,last_seen)').order('week_xp', { ascending: false }).limit(10);
    const p = await myProfile();
    const { data: notes } = await sb().from('notices').select('*').order('created_at', { ascending: false }).limit(5);
    const seen = lsGet('zd:noteSeen:' + G.active, 0); const fresh = (notes || []).filter(n => new Date(n.created_at).getTime() > seen);
    box.innerHTML = `${fresh.map(n => `<div class="notice stack"><b>📣 ${esc(n.title)}</b><span class="small">${esc(n.body)}</span></div>`).join('')}${fresh.length ? '<button class="btn line sm" id="nseen">خواندم</button>' : ''}
    <div class="row"><a class="btn ghost sm" href="#dm">💬 پیام‌ها<span id="unr"></span></a><a class="btn ghost sm" href="#rooms">🗣️ انجمن</a></div>
    <div class="sec">🏆 جدول رقابت زنده <small>همهٔ کاربران · امتیاز این هفته</small></div>
    <div class="card stack">${(data || []).map((r, i) => `<a class="row" href="#u/${esc(r.profiles?.username)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap;${r.profiles?.username === p?.username ? 'background:var(--accent-soft);border-radius:10px;padding:4px' : ''}"><span style="width:24px;font-weight:900">${['🥇', '🥈', '🥉'][i] || faNum(i + 1)}</span><span class="avatar">${r.profiles?.photo ? `<img src="${r.profiles.photo}" alt="" style="width:100%;height:100%;object-fit:cover">` : esc(r.profiles?.avatar || '🙂')}</span>${dot(r.profiles?.username)}<span class="grow" style="min-width:0"><b>${esc(r.profiles?.display_name)}</b> <span class="en tiny muted">@${esc(r.profiles?.username)}</span><br><span class="tiny muted">${esc(r.current_unit || '')} · امروز ${faNum(r.minutes_today)} دقیقه · 🔥${faNum(r.streak)} · ${ONLINE.has(r.profiles?.username) ? '<b style="color:var(--ok)">آنلاین</b>' : lastSeenFa(r.profiles?.last_seen)}</span></span><span class="pill acc">${faNum(r.week_xp)}</span></a>`).join('') || '<span class="small muted">هنوز کسی نیست؛ اولین نفر باش!</span>'}</div>`;
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
  v.innerHTML = `<div class="stack"><div class="card stack" style="align-items:center;text-align:center"><span class="avatar" style="width:96px;height:96px;font-size:48px">${p.photo ? `<img src="${p.photo}" alt="" style="width:100%;height:100%;object-fit:cover">` : esc(p.avatar)}</span><b style="font-size:20px">${esc(p.display_name)} ${dot(p.username)}</b><span class="en muted">@${esc(p.username)}</span><span class="small ${ONLINE.has(p.username) ? '' : 'muted'}">${ONLINE.has(p.username) ? '🟢 الان آنلاین است' : 'آخرین بازدید: ' + lastSeenFa(p.last_seen)}</span><a class="btn sm" href="#dm/${esc(p.username)}">💬 پیام دادن</a><span class="pill">${rankOf(g.xp || 0)} · عضو از ${jLabel(p.created_at.slice(0, 10), true)}</span></div>
  <div class="grid2">${[['⭐', 'امتیاز کل', g.xp], ['🔥', 'روز پیاپی', g.streak], ['🎓', 'درس قبول‌شده', g.mastered], ['🧠', 'واژهٔ تثبیت‌شده', g.learned], ['⏱️', 'دقیقه امروز', g.minutes_today], ['📅', 'دقیقه این هفته', g.minutes_week]].map(([ic, l, n]) => `<div class="card" style="text-align:center"><div style="font-size:22px">${ic}</div><b class="num" style="font-size:22px">${faNum(n || 0)}</b><div class="small muted">${l}</div></div>`).join('')}</div>
  <div class="card small">درس فعلی: <b>${esc(g.current_unit || '—')}</b></div></div>`;
};

/* ───── انجمن و چت‌روم با معلم ناظر ───── */
routes.rooms = async (id) => {
  if (!id) {
    setTop('انجمن', true); const v = view();
    v.innerHTML = `<div class="stack"><div class="today"><b style="font-size:18px">🗣️ انجمن «زبان دوم»</b><span class="muted">با بقیهٔ زبان‌آموزها انگلیسی گپ بزن. ${esc(G.settings.teacher)}، معلم ناظر، موضوع و نقش می‌دهد و اشتباه‌ها را همان لحظه درست می‌کند.</span></div>
    <input id="rq" class="in" placeholder="جستجوی موضوع…"><div class="tools" id="rl">${ROOMS.map(r => `<a class="tool" data-q="${esc(r.fa + ' ' + r.en)}" href="#rooms/${r.id}"><span class="ic">${r.ic}</span><b>${esc(r.fa)}</b><span class="en">${esc(r.en)}</span>${r.level ? `<span>${esc(r.level)}</span>` : ''}</a>`).join('')}</div>
    <details class="card"><summary>قوانین انجمن</summary><ul class="list small">${FORUM_RULES.map(r => `<li>${esc(r)}</li>`).join('')}</ul></details></div>`;
    $('#rq').oninput = e => { const q = e.target.value.trim().toLowerCase(); $$('#rl .tool').forEach(a => a.hidden = q && !a.dataset.q.toLowerCase().includes(q)); };
    return;
  }
  const room = ROOMS.find(r => r.id === id) || ROOMS[0]; const topic = room.topic;
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
  const send = async (text) => {
    text = text.trim(); if (!text) return; $('#tx').value = '';
    if (BAD_WORDS.test(text)) return warn('این پیام کلمهٔ نامناسب داشت و فرستاده نشد.');
    let mod = { action: 'ok' };
    if (hasAI() || firstKeyed()) { try { mod = await ai({ temp: 0.2, system: `You are ${G.settings.teacher}, the warm moderator-teacher of an English-practice chat room for Persian speakers. Room topic: ${topic}.`, messages: [{ role: 'user', content: `Recent chat:\n${recent()}\n\nNew message from @${p.username}: "${text}"\nDecide: "block" if sexual, vulgar, insulting, harassing, hateful or sharing personal contact data; "offtopic" if clearly unrelated to the room topic or current scenario; otherwise "ok". Also correct the English (grammar, word choice, naturalness). JSON {"action":"ok|offtopic|block","reason":"Persian, short","fixes":[{"wrong":"","right":"","why":"Persian"}],"better":"most natural way to say it, or empty if already natural","note":"short warm Persian teacher comment to this learner (praise, correction, or bringing them back to the topic with a question in English); empty if nothing useful"}` }] }); } catch { } }
    if (mod.action === 'block') { await sb().from('profiles').update({ warnings: (p.warnings || 0) + 1 }).eq('id', p.id); p.warnings = (p.warnings || 0) + 1; return warn(mod.reason || 'این پیام با قوانین انجمن سازگار نبود.'); }
    const { error } = await post(text); if (error) return toast('فرستاده نشد: ' + error.message);
    addXP(4); saveU();
    if (mod.note || mod.fixes?.length || mod.action === 'offtopic') await post(mod.note || (mod.action === 'offtopic' ? 'Let\'s get back to our topic 😊' : 'Nice try!'), 'teacher', { to: p.username, fixes: mod.fixes || [], better: mod.better || '' });
  };
  const warn = (why) => { const bg = sheet(`<div class="stack"><div class="big-ic">⚠️</div><b>پیامت فرستاده نشد</b><div class="small">${esc(why)}</div><div class="notice small">این انجمن برای تمرین مکالمهٔ انگلیسی در فضایی امن و محترمانه ساخته شده. قوانین:<ul class="list">${FORUM_RULES.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div><span class="small muted">اخطار ${faNum(p.warnings || 0)} از ۳</span><button class="btn" onclick="this.closest('.sheet-bg').remove()">متوجه شدم</button></div>`); };
  $('#snd').onclick = () => send($('#tx').value); $('#tx').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send($('#tx').value); } };
  $('#mic').append(micButton(t => send(t)));
  $('#sc').onclick = async () => {
    if (needAI($('#msgs'))) return; const names = Object.keys(ch.presenceState());
    try { const r = await ai({ temp: 0.9, system: `You are ${G.settings.teacher}, a lively English teacher running a group role-play in a chat room.`, messages: [{ role: 'user', content: `Room topic: ${topic}. Online learners: ${names.map(n => '@' + n).join(', ') || '@' + p.username}. Create a short realistic everyday scenario about this topic and give each learner a role and a first task. Write in English with a short Persian explanation. JSON {"text":"scenario + roles (one line per learner) + who starts"}` }] });
      await post(r.text, 'teacher', { scenario: true });
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
  const totalMin = users.reduce((s, u) => s + (g(u).minutes_total || 0), 0); const totalAI = users.reduce((s, u) => s + (g(u).ai_chat || 0), 0);
  v.innerHTML = `<div class="stack"><div class="grid2">${[['👥', 'کل کاربران', users.length], ['🟢', 'الان آنلاین', ONLINE.size], ['☀️', 'فعال امروز', activeToday], ['📅', 'فعال این هفته', week], ['⏱️', 'کل دقیقهٔ مطالعه', totalMin], ['🤖', 'درخواست‌های هوش مصنوعی', totalAI], ['⚠️', 'کاربران با اخطار', users.filter(u => u.warnings).length]].map(([ic, l, n]) => `<div class="card" style="text-align:center"><div style="font-size:22px">${ic}</div><b class="num" style="font-size:24px">${faNum(n)}</b><div class="small muted">${l}</div></div>`).join('')}</div>
  <div class="card stack"><b>📣 پیام به کاربران</b><select id="to" class="in"><option value="">همهٔ کاربران</option>${users.map(u => `<option value="${u.id}">${esc(u.display_name)} @${esc(u.username)}</option>`).join('')}</select><input id="tt" class="in" placeholder="عنوان"><textarea id="bd" class="in" placeholder="متن پیام"></textarea><button class="btn" id="sn">فرستادن</button></div>
  <div class="sec">کاربران <small>${faNum(users.length)} نفر</small></div>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:640px"><thead><tr style="text-align:right;color:var(--muted)"><th>کاربر</th><th>درس فعلی</th><th>امروز</th><th>هفته</th><th>کل</th><th>قبول</th><th>🔥</th><th>AI</th><th>آخرین حضور</th><th></th></tr></thead><tbody>
  ${users.map(u => { const x = g(u); return `<tr style="border-top:1px solid var(--line)"><td><a href="#u/${esc(u.username)}">${esc(u.display_name)}</a><br><span class="en tiny muted">@${esc(u.username)}</span>${u.warnings ? ` <span class="pill bad">${faNum(u.warnings)} اخطار</span>` : ''}</td><td>${esc(x.current_unit || '—')}</td><td class="num">${faNum(x.minutes_today || 0)}′</td><td class="num">${faNum(x.minutes_week || 0)}′</td><td class="num">${faNum(x.minutes_total || 0)}′</td><td class="num">${faNum(x.mastered || 0)}</td><td class="num">${faNum(x.streak || 0)}</td><td class="num">${faNum(x.ai_chat || 0)}</td><td>${dot(u.username)} ${ONLINE.has(u.username) ? 'آنلاین' : lastSeenFa(u.last_seen)}<br><a class="tiny" href="#dm/${esc(u.username)}">پیام</a></td><td>${u.is_admin ? '<span class="pill acc">مدیر</span>' : `<button class="btn line sm" data-ban="${u.id}" data-b="${u.banned ? 0 : 1}">${u.banned ? 'رفع محرومیت' : 'محروم از انجمن'}</button>`}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  $('#sn').onclick = async () => { const title = $('#tt').value.trim(), body = $('#bd').value.trim(); if (!title || !body) return toast('عنوان و متن را بنویس.'); const { error } = await sb().from('notices').insert({ to_user: $('#to').value || null, title, body }); toast(error ? 'خطا: ' + error.message : 'پیام فرستاده شد ✓'); if (!error) { $('#tt').value = ''; $('#bd').value = ''; } };
  $$('[data-ban]').forEach(b => b.onclick = async () => { await sb().from('profiles').update({ banned: b.dataset.b === '1' }).eq('id', b.dataset.ban); routes.admin(); });
};

/* ───── کارت حساب در صفحهٔ «من» ───── */
async function meOnline() {
  const box = $('#online-me'); if (!box) return; const p = await myProfile();
  if (!p) { box.innerHTML = `<div class="card stack"><b>🌐 حساب آنلاین</b><span class="small muted">با ایمیل و کد تأیید وارد شو تا یوزرنیم و صفحهٔ اختصاصی داشته باشی، در رقابت همه باشی و وارد انجمن شوی.</span><button class="btn" id="lg">ورود / ثبت‌نام با ایمیل</button></div>`; $('#lg').onclick = () => loginSheet(() => routes.me()); return; }
  box.innerHTML = `<div class="card stack"><div class="row"><b class="grow">🌐 حساب آنلاین: <span class="en">@${esc(p.username)}</span></b>${p.is_admin ? '<a class="btn sm" href="#admin">پنل مدیر</a>' : ''}</div><div class="row"><a class="btn ghost sm" href="#u/${esc(p.username)}">صفحهٔ من</a><a class="btn ghost sm" href="#rooms">انجمن</a><a class="btn ghost sm" href="#dm">پیام‌ها</a><button class="btn line sm" id="lo">خروج از حساب</button></div></div>`;
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
    const row = (u, extra = '') => `<a class="card row" style="text-decoration:none;color:inherit;flex-wrap:nowrap" href="#dm/${esc(u.username)}"><span class="avatar" style="position:relative">${u.photo ? `<img src="${u.photo}" alt="">` : esc(u.avatar || '🙂')}</span>${dot(u.username)}<span class="grow" style="min-width:0"><b>${esc(u.display_name)}</b>${u.is_admin ? ' <span class="pill acc">مدیر</span>' : ''} <span class="en tiny muted">@${esc(u.username)}</span><br><span class="tiny muted">${ONLINE.has(u.username) ? 'آنلاین' : 'آخرین بازدید: ' + lastSeenFa(u.last_seen)}</span>${extra}</span></a>`;
    v.innerHTML = `<div class="stack">${ids.length ? '<div class="sec">گفتگوهای من</div>' + ids.map(id => { const u = (ps || []).find(x => x.id === id); if (!u) return ''; const last = data.find(m => m.from_user === id || m.to_user === id); const unread = data.filter(m => m.from_user === id && !m.read).length; return row(u, `<br><span class="small">${esc(last.body.slice(0, 60))}</span>${unread ? ` <span class="pill bad">${faNum(unread)} تازه</span>` : ''}`); }).join('') : ''}
    <div class="sec">همهٔ زبان‌آموزها <small>برای شروع گفتگو بزن</small></div><input id="fq" class="in" placeholder="جستجوی نام یا یوزرنیم…"><div class="stack" id="ev">${(everyone || []).filter(u => u.id !== me_.id).map(u => `<div data-q="${esc(u.display_name + ' ' + u.username)}">${row(u)}</div>`).join('')}</div></div>`;
    $('#fq').oninput = e => { const q = e.target.value.trim().toLowerCase(); $$('#ev [data-q]').forEach(d => d.hidden = q && !d.dataset.q.toLowerCase().includes(q)); };
    return;
  }
  const { data: other } = await sb().from('profiles').select('*').eq('username', username).maybeSingle(); if (!other) { setTop('پیام', true); v.innerHTML = '<div class="card">کاربر پیدا نشد.</div>'; return; }
  setTop(other.display_name, true);
  v.innerHTML = `<div class="convo"><a class="card row" href="#u/${esc(other.username)}" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="avatar">${other.photo ? `<img src="${other.photo}" alt="">` : esc(other.avatar)}</span>${dot(other.username)}<span class="grow"><b>${esc(other.display_name)}</b> <span class="en tiny muted">@${esc(other.username)}</span><br><span class="tiny muted" id="ls">${ONLINE.has(other.username) ? 'آنلاین' : 'آخرین بازدید: ' + lastSeenFa(other.last_seen)}</span></span></a>
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
