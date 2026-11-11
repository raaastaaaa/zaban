/* زبان رستا — جعبهٔ لایتنر، هایلایت خودکار واژه‌ها در متن‌ها، پنل دیکشنری پایین صفحه، پشتیبان ابری خودکار */
'use strict';

/* ───── جعبهٔ لایتنر ───── */
function leitnerStats() {
  const all = Object.entries(U.srs); const t = isoDay();
  return { today: all.filter(([, s]) => s.due <= t).length, fresh: all.filter(([, s]) => !s.seen).length, learned: all.filter(([, s]) => s.box >= 5).length, total: all.length,
    week: all.filter(([, s]) => s.due > t && s.due <= addDays(t, 7)).length, boxes: BOX_DAYS.map((_, b) => all.filter(([, s]) => s.box === b).length) };
}
routes.leitner = () => {
  setTop('جعبهٔ لایتنر', true); const st = leitnerStats();
  const decks = {}; Object.keys(U.srs).forEach(k => { const id = k.split(':')[0]; decks[id] = (decks[id] || 0) + 1; });
  const tile = (n, l, col, h) => `<a class="card" href="${h}" style="text-decoration:none;color:inherit;border-inline-start:6px solid ${col};display:flex;flex-direction:column;gap:2px"><b class="num" style="font-size:26px">${faNum(n)}</b><span class="small muted">${l}</span></a>`;
  view().innerHTML = `<div class="stack">
  <div class="grid2">${tile(st.today, 'کارت‌های امروز (مرور)', 'var(--accent)', '#cards/due')}${tile(st.fresh, 'کارت‌های تازه', 'var(--bad)', '#cards/due')}${tile(st.learned, 'کارت‌های آموخته‌شده', 'var(--ok)', '#leitner')}${tile(st.total, 'همهٔ کارت‌ها', 'var(--muted)', '#leitner')}</div>
  <a class="btn wide" href="#cards/due">▶ مرور کارت‌های امروز (${faNum(st.today)})</a>
  <div class="card stack"><b>خانه‌های جعبه</b><div style="display:flex;align-items:flex-end;gap:6px;height:110px">${st.boxes.map((n, b) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><span class="tiny num">${faNum(n)}</span><div style="width:100%;border-radius:6px 6px 0 0;background:${b >= 5 ? 'var(--ok)' : b >= 2 ? 'var(--accent)' : 'var(--bad)'};height:${Math.max(4, n / Math.max(1, ...st.boxes) * 80)}px"></div><span class="tiny muted">${b ? faNum(BOX_DAYS[b]) + 'ر' : 'تازه'}</span></div>`).join('')}</div><span class="tiny muted">هر بار که واژه‌ای را درست به یاد بیاوری یک خانه جلو می‌رود و فاصلهٔ مرورش بیشتر می‌شود (۱، ۳، ۷، ۱۴، ۳۰، ۶۰، ۱۲۰ روز)؛ اگر فراموش کنی، برمی‌گردد اول.</span><span class="small">این هفته ${faNum(st.week)} کارت دیگر موعد مرور دارند.</span></div>
  <div class="card stack"><b>+ افزودن کارت دستی</b><div class="grid2"><input id="nw" class="in" dir="ltr" placeholder="واژه یا عبارت انگلیسی"><input id="nf" class="in" placeholder="معنی فارسی (اختیاری؛ خالی بگذاری خودکار پر می‌شود)"></div><button class="btn ghost" id="ad">افزودن به جعبه</button></div>
  <div class="sec">دسته‌ها</div><div class="stack">${Object.entries(decks).sort((a, b) => b[1] - a[1]).map(([id, n]) => { const u = unitById(id); const due = Object.entries(U.srs).filter(([k, s]) => k.startsWith(id + ':') && s.due <= isoDay()).length; return `<a class="card row" style="text-decoration:none;color:inherit;flex-wrap:nowrap" href="#cards/${esc(id)}"><span style="font-size:24px">${esc(u?.icon || '📦')}</span><span class="grow"><b>${esc(u?.fa || id)}</b><br><span class="small muted">${faNum(n)} کارت${due ? ` · ${faNum(due)} امروز` : ''}</span></span><span class="muted">›</span></a>`; }).join('') || '<div class="card small muted">هنوز کارتی نداری؛ از درس‌ها، کتاب‌ها یا دیکشنری واژه اضافه کن.</div>'}</div></div>`;
  $('#ad').onclick = async () => {
    const w = $('#nw').value.trim(); if (!w) return; let fa = $('#nf').value.trim(); let ipa = '';
    if (!fa && (hasAI() || firstKeyed())) { try { const r = await ai({ max: 300, temp: 0.2, system: 'English-Persian dictionary.', messages: [{ role: 'user', content: `"${w}" JSON {"fa":"Persian meaning","ipa":"","ex":"short example"}` }] }); fa = r.fa; ipa = r.ipa; } catch { } }
    addDictWord({ word: w, ipa_us: ipa, senses: [{ fa: fa || '—', examples: [] }] }); toast('به جعبهٔ لایتنر اضافه شد.'); routes.leitner();
  };
};

/* ───── هایلایت خودکار واژه‌های لایتنر در متن کتاب‌ها و داستان‌ها ───── */
let LMAP = null, LMAPv = '';
function leitnerMap() {
  const v = Object.keys(U.srs).length + ':' + Object.values(U.srs).reduce((a, s) => a + s.box, 0); if (LMAP && LMAPv === v) return LMAP;
  LMAP = new Map(); for (const [k, s] of Object.entries(U.srs)) { const w = k.split(':').slice(1).join(':').toLowerCase(); if (w && !w.includes(' ')) LMAP.set(w, s.box <= 1 ? 'new' : s.box < 5 ? 'rev' : 'ok'); } LMAPv = v; return LMAP;
}
function highlightLeitner(root) {
  const m = leitnerMap(); if (!m.size) return;
  $$('.tw', root).forEach(el => { const w = el.textContent.toLowerCase().replace(/[’']s$/, ''); const st = m.get(w) || m.get(w.replace(/(es|s|ed|ing)$/, '')); if (st && st !== 'ok') { el.style.color = st === 'new' ? 'var(--bad)' : 'var(--accent)'; el.style.fontWeight = '600'; el.title = st === 'new' ? 'کارت تازه در لایتنر' : 'کارت در حال مرور'; } });
}
new MutationObserver(() => { if (/^#read\//.test(location.hash) && U) highlightLeitner(view()); }).observe(document.getElementById('view'), { childList: true });

/* ───── پنل دیکشنری پایین صفحه (برای هر واژهٔ متن) ───── */
async function wordPanel(word, ctx) {
  const lw = word.toLowerCase().replace(/[’']s$/, ''); stopSpeak();
  const bg = sheet(`<div class="stack"><div class="row" style="flex-wrap:nowrap"><b class="en grow" style="font-size:24px">${esc(word)}</b><a class="btn ghost sm" href="#dict/${encodeURIComponent(lw)}" onclick="this.closest('.sheet-bg').remove()">مدخل کامل</a></div>
  <div class="row"><button class="btn ghost sm" id="us">🇺🇸 <span class="en" id="ipaus">US</span></button><button class="btn ghost sm" id="uk">🇬🇧 <span class="en" id="ipauk">UK</span></button></div>
  <div class="tabs"><button class="on" data-t="fa">انگلیسی به فارسی</button><button data-t="en">انگلیسی به انگلیسی</button></div><div id="wb">${loading('معنی…')}</div>
  <div class="grid2"><button class="btn" id="lt">+ جعبهٔ لایتنر</button><a class="btn line" target="_blank" rel="noopener" href="https://www.ldoceonline.com/dictionary/${encodeURIComponent(lw)}">لانگمن ↗</a></div></div>`);
  const acc = a => { const k = G.settings.accent; G.settings.accent = a; say(lw, 'en', 'calm').finally(() => G.settings.accent = k); };
  $('#us', bg).onclick = () => acc('US'); $('#uk', bg).onclick = () => acc('UK'); acc(G.settings.accent);
  let e = await idb.get('dict:' + lw); let tab = 'fa';
  const show = () => { if (!e) return; $('#ipaus', bg).textContent = '/' + (e.ipa_us || '') + '/'; $('#ipauk', bg).textContent = '/' + (e.ipa_uk || '') + '/';
    $('#wb', bg).innerHTML = (e.senses || []).slice(0, 6).map((s, i) => `<div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="pill">${esc(s.pos || '')}</span> ${tab === 'fa' ? `<b>${esc(s.fa)}</b>` : `<span class="en">${esc(s.def)}</span>`}${s.examples?.[0] ? `<div class="en muted">${esc(s.examples[0].en)}</div>` : ''}</div>`).join(''); };
  $$('.tabs button', bg).forEach(b => b.onclick = () => { $$('.tabs button', bg).forEach(x => x.classList.toggle('on', x === b)); tab = b.dataset.t; show(); });
  if (e) show(); else {
    const local = ALL_UNITS.concat(WS_UNITS).flatMap(u => unitWords(u)).find(w => w.w.toLowerCase() === lw);
    if (!hasAI() && !firstKeyed()) { $('#wb', bg).innerHTML = local ? `<b>${esc(local.fa)}</b>` : '<span class="small muted">برای معنی واژه‌های تازه، کلید هوش مصنوعی لازم است.</span>'; }
    else try { e = await ai({ max: 1500, temp: 0.2, system: 'Accurate learner dictionary for Persian speakers.', messages: [{ role: 'user', content: `Word "${lw}"${ctx ? ` as used in: "${ctx}"` : ''}. JSON {"word":"base form","ipa_us":"","ipa_uk":"","senses":[{"pos":"","posKey":"n|v|adj|adv|phr|prep","def":"simple English definition","fa":"Persian","examples":[{"en":"","fa":""}]}]} — up to 4 senses, the sense used in the context first.` }] }); if (e?.word) { await idb.set('dict:' + lw, e); show(); } } catch (err) { aiErr(err); }
  }
  $('#lt', bg).onclick = () => { if (e) addDictWord(e); else addDictWord({ word: lw, senses: [{ fa: '—' }] }); LMAP = null; toast('به جعبهٔ لایتنر اضافه شد (قرمز = کارت تازه).'); bg.remove(); if (/^#read\//.test(location.hash)) highlightLeitner(view()); };
}

/* ───── پشتیبان ابری خودکار ───── */
async function cloudBackup(silent) {
  const p = window.myProfile && await myProfile(); if (!p) { if (!silent) toast('برای پشتیبان ابری، وارد حساب آنلاین شو.'); return false; }
  const stories = await idb.get('stories:' + G.active);
  const data = { v: 1, at: new Date().toISOString(), user: me(), u: U, extra: G.extra, stories: (stories || []).slice(0, 10) };
  const { error } = await sb().from('backups').upsert({ user_id: p.id, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) { if (!silent) toast(/backups/.test(error.message) ? 'پشتیبان ابری هنوز فعال نشده (مدیر باید supabase-setup-2.sql را اجرا کند).' : 'خطا: ' + error.message, 5000); return false; }
  lsSet('zd:lastBackup:' + G.active, Date.now()); if (!silent) toast('پشتیبان ابری ذخیره شد ☁️'); return true;
}
async function cloudRestore() {
  const p = await myProfile(); if (!p) return toast('اول وارد حساب آنلاین شو.');
  const { data, error } = await sb().from('backups').select('data,updated_at').eq('user_id', p.id).maybeSingle();
  if (error || !data) return toast('پشتیبانی روی سرور پیدا نشد.');
  const d = data.data; U = Object.assign(blankUser(), d.u, { online: U.online }); saveU(); Object.assign(G.extra, d.extra || {}); saveG('extra'); if (d.stories) await idb.set('stories:' + G.active, d.stories);
  if (d.user) { Object.assign(me(), { name: d.user.name, avatar: d.user.avatar, photo: d.user.photo }); saveG('users'); }
  lsSet('zd:bkOk:' + G.active, true); toast('همهٔ پیشرفتت از سرور برگشت ✓'); router();
}
/* هرگز نسخهٔ خالی‌تر این دستگاه را روی نسخهٔ پرتر سرور ننویس */
async function backupSafe() {
  const ok = 'zd:bkOk:' + G.active; if (lsGet(ok, false)) return true;
  try { const p = await myProfile(); if (!p) return false; const { data } = await sb().from('backups').select('data').eq('user_id', p.id).maybeSingle();
    const srv = data?.data?.u; if (!srv) { lsSet(ok, true); return true; }
    const size = x => (x?.xp || 0) + Object.keys(x?.srs || {}).length; if (size(U) >= size(srv)) { lsSet(ok, true); return true; }
    if (!lsGet('zd:bkAsk:' + G.active, false)) { lsSet('zd:bkAsk:' + G.active, true); toast('روی سرور پیشرفت بیشتری از این دستگاه داری؛ از «من ← پشتیبان ابری ← برگرداندن» برش گردان.', 7000); }
    return false; } catch { return false; }
}
setInterval(async () => { if (U?.online && lsGet('zd:autoBackup:' + G.active, true) && await backupSafe() && Date.now() - lsGet('zd:lastBackup:' + G.active, 0) > 30 * 60000 && document.visibilityState === 'visible') cloudBackup(true); }, 120000);
