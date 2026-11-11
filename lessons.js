/* آموزش زبان رستا — کلاس درس کامل مثل کتاب: متن، مکالمه، واژه‌ها، گرامر، تمرین و جمع‌بندی.
   هر درس یک بار (توسط مدیر) با هوش مصنوعی ساخته و روی سرور منتشر می‌شود؛ بقیه بدون هوش مصنوعی و آفلاین می‌خوانند. */
const LESSON_V = 1;
async function lessonGet(u, { build = false } = {}) {
  const key = 'lesson:' + u.id; let L;
  try { const r = await fetch('lessons/' + u.id + '.json'); if (r.ok) { L = await r.json(); L.static = true; return L; } } catch { } // درس آماده و همراه برنامه (آفلاین)
  L = await idb.get(key); if (L?.v === LESSON_V) return L;
  try { if (window.sb && sb()) { const { data } = await sb().from('lessons').select('data').eq('id', u.id).maybeSingle(); if (data?.data?.v === LESSON_V) { await idb.set(key, data.data); return data.data; } } } catch { }
  if (!build) return null;
  L = await lessonBuild(u); await idb.set(key, L);
  if (isAdminHere()) { try { await sb().from('lessons').upsert({ id: u.id, data: L, updated_at: new Date().toISOString() }); } catch { } }
  return L;
}
async function lessonBuild(u) {
  const words = unitWords(u).map(w => `${w.w} (${w.fa})`).join(', ');
  const r = await ai({ heavy: true, max: 9000, temp: 0.5, system: 'You are an expert author of English coursebooks for Persian-speaking adults (in the style of a modern communicative coursebook). Accuracy is critical. Persian must be natural, warm and fluent; English must be natural and correct.', messages: [{ role: 'user', content: `Write lesson ${u.n || ''} of a CEFR ${u.cefr || 'A1'} coursebook for Persian speakers.
Topic: "${u.en}" (${u.fa}). Grammar focus: ${u.gram}. Speaking goal: ${u.talk}.
Core vocabulary (use most of it naturally): ${words}.
Structure exactly like a real textbook unit:
1) "warmup": 2-3 Persian sentences introducing the topic + 2 short English discussion questions.
2) "reading": a short text in English at the right level (${(u.cefr || 'A1').startsWith('A1') ? '70-100' : '110-150'} words) about the topic, with its Persian translation.
3) "conversation": a natural dialogue between two named people (8-12 lines), each line with Persian translation; plus 3 useful expressions from it.
4) "grammar": title, a clear Persian explanation (like a teacher, 4-6 sentences), 3-5 rules (each: Persian rule + English pattern), a short form table (rows of affirmative/negative/question examples), 6 example sentences with Persian, and 2 common mistakes Persian speakers make (wrong, right, Persian why).
5) "teacher": the teacher's spoken lesson in warm, fluent, conversational Persian (6-8 short paragraphs), walking through the reading, the conversation and the grammar with English examples, like a real class.
6) "practice": 8 exercises mixing types: "mcq" (question, 3 options, answer index), "gap" (sentence with ___ and the answer), "order" (scrambled words and the correct sentence), "translate" (Persian sentence and natural English answer).
7) "speaking": 4 personal speaking prompts (English + Persian).
8) "summary": 3-4 Persian bullet points of what the learner can now do.
JSON {"title":"","warmup":{"fa":"","questions":[""]},"reading":{"title":"","en":"","fa":""},"conversation":{"setting":"Persian","lines":[{"who":"","en":"","fa":""}],"expressions":[{"en":"","fa":""}]},"grammar":{"title":"","explain":"","rules":[{"fa":"","en":""}],"table":[["","",""]],"examples":[{"en":"","fa":""}],"mistakes":[{"wrong":"","right":"","why":""}]},"teacher":[""],"practice":[{"type":"mcq|gap|order|translate","q":"","options":[""],"a":""}],"speaking":[{"en":"","fa":""}],"summary":[""]}` }] });
  if (!r?.conversation?.lines?.length || !r?.grammar) throw new Error('درس کامل ساخته نشد؛ دوباره امتحان کن.');
  return { ...r, v: LESSON_V, unit: u.id, made: isoDay() };
}

routes.lesson = async id => {
  const u = unitById(id); if (!u) return go('home'); setTop(`درس ${faNum(u.n || 1)} · ${u.fa}`, true); const v = view();
  v.innerHTML = loading('کلاس درس را آماده می‌کنم…');
  let L; try { L = await lessonGet(u); } catch { }
  if (!L) {
    if (!hasAI() && !firstKeyed()) { v.innerHTML = `<div class="card stack"><b>این درس هنوز آماده نشده</b><span class="small muted">مدیر برنامه به‌زودی همهٔ درس‌ها را آماده می‌کند؛ تا آن موقع واژه‌ها و فلش‌کارت‌های درس را تمرین کن.</span><a class="btn" href="#unit/${u.id}/w">واژه‌های درس</a></div>`; return; }
    v.innerHTML = loading('معلم دارد درس را برایت آماده می‌کند (فقط بار اول، حدود ۳۰ ثانیه)…');
    try { L = await lessonGet(u, { build: true }); } catch (e) { v.innerHTML = `<div class="card stack"><b>درس ساخته نشد</b><span class="small muted">${esc(e.message || '')}</span><button class="btn" onclick="routes.lesson('${u.id}')">دوباره</button></div>`; return aiErr(e); }
  }
  const sp = (t, lang = 'en', emo = 'calm') => `<button class="icon-btn" data-say="${esc(t)}" data-lang="${lang}" data-emo="${emo}" aria-label="پخش">${I.spk}</button>`;
  const tw = s => esc(s).replace(/([A-Za-z][A-Za-z'’-]*)/g, '<span class="tw">$1</span>');
  const sec = (ic, t, body, open = true) => `<details class="card stack lsec"${open ? ' open' : ''}><summary><b>${ic} ${t}</b></summary><div class="stack" style="margin-top:10px">${body}</div></details>`;
  const P = L.practice || [];
  const TP = L.teach ? [...(L.teach.intro || []), ...(L.teach.conversation || []), ...(L.teach.words || []), ...(L.teach.grammar || []), ...(L.teach.outro || [])] : (L.teacher || []); L.teacher = TP;
  const au = (f, t) => L.audio ? `<div class="stack" style="gap:4px"><span class="small"><b>${t}</b></span><audio controls preload="none" src="audio/${u.id}/${f}.m4a" style="width:100%"></audio></div>` : '';
  v.innerHTML = `<div class="stack">
  <div class="card stack" style="background:var(--hero);color:var(--hero-ink)"><span class="small" style="opacity:.8">${esc(u.levelFa)} · سطح ${esc(u.cefr)} · درس ${faNum(u.n || 1)}</span><b style="font-size:21px">${esc(L.title || u.en)}</b><span class="en" style="opacity:.85">${esc(u.en)}</span></div>
  ${L.audio ? `<div class="card stack"><b>🎧 کلاس صوتی کامل (سه‌بعدی؛ با هدفون و چشم بسته)</b><span class="small muted">همهٔ درس از اول تا آخر: معلم، مکالمه، واژه‌ها و گرامر. حتی فقط با گوش دادن، قبل از خواب.</span>${au('full', '')}<a class="btn ghost sm" href="audio/${u.id}/full.m4a" download="rasta-lesson-${u.n}.m4a">⬇ دانلود برای گوش دادن آفلاین</a></div>` : ''}
  ${sec('🌱', 'شروع', `<p style="margin:0;line-height:1.9">${esc(L.warmup?.fa || '')}</p>${(L.warmup?.questions || []).map(q => `<div class="row" style="flex-wrap:nowrap">${sp(q)}<span class="en">${tw(q)}</span></div>`).join('')}`)}
  ${sec('👩‍🏫', `کلاس با ${esc(G.settings.teacher)}`, `${L.audio ? au('conversation', '🎧 درس صوتی مکالمه (معرفی، مکالمه، توضیح خط‌به‌خط)') + au('words', '🎧 درس صوتی واژه‌ها') + au('grammar', '🎧 درس صوتی گرامر') : '<button class="btn" id="teachall">▶ پخش کل درسِ معلم</button>'}${(L.teacher || []).map((p, i) => `<div class="row tp" data-i="${i}" style="flex-wrap:nowrap;align-items:flex-start;padding:6px;border-radius:10px">${sp(p, 'fa', 'warm')}<p style="margin:0;line-height:1.9">${bidi(p.replace(/\[PAUSE\]/g, ' ⏳ '))}</p></div>`).join('')}`)}
  ${sec('📖', 'متن درس', `<div class="row" style="justify-content:space-between"><b class="en">${esc(L.reading?.title || '')}</b>${sp(L.reading?.en || '')}</div><p class="en" style="margin:0;font-size:16px;line-height:1.9">${tw(L.reading?.en || '')}</p><details><summary class="small">ترجمهٔ فارسی</summary><p class="small" style="line-height:1.9">${esc(L.reading?.fa || '')}</p></details>`)}
  ${sec('💬', 'مکالمه', `<b class="en">${esc(L.conversation?.title || '')}</b><span class="small muted">${esc(L.conversation?.setting || '')}</span>${L.audio ? au('dialog', 'پخش مکالمه (سه‌بعدی)') + au('shadow', 'تکرار کن: هر جمله و بعد نوبت تو') : '<button class="btn ghost sm" id="dlgall">▶ پخش کل مکالمه</button>'}${(L.conversation?.lines || []).map((l, i) => `<div class="row cl" data-i="${i}" style="flex-wrap:nowrap;align-items:flex-start;padding:6px;border-radius:10px">${sp(l.en, 'en', 'cheerful')}<div><b class="small">${esc(l.who)}:</b> <span class="en">${tw(l.en)}</span><div class="small muted">${esc(l.fa)}</div></div></div>`).join('')}
    ${(L.conversation?.expressions || []).length ? `<div class="notice soft small stack"><b>عبارت‌های کاربردی</b>${L.conversation.expressions.map(e => `<span><b class="en">${esc(e.en)}</b> — ${esc(e.fa)}</span>`).join('')}</div>` : ''}`)}
  ${(L.phrasebook || []).length ? sec('📒', 'همهٔ عبارت‌ها: رسمی، خنثی، خودمونی، عامیانه', `<div class="row" style="gap:6px" id="pbf">${[['all', 'همه'], ['formal', 'رسمی'], ['neutral', 'خنثی'], ['informal', 'خودمونی'], ['slang', 'عامیانه']].map(([k, t], i) => `<button class="btn sm${i ? ' ghost' : ''}" data-pb="${k}">${t}</button>`).join('')}</div>
    ${L.phrasebook.map(g => `<div class="stack" style="gap:6px"><b class="small" style="color:var(--accent)">${esc(g.group || '')}</b>${(g.items || []).map(x => `<div class="row pbi" data-reg="${esc(x.register || '')}" style="flex-wrap:nowrap;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:6px">${sp(x.en)}<div class="grow"><b class="en">${esc(x.en)}</b> <span class="pill ${({ formal: 'acc', informal: 'ok', slang: 'bad' })[x.register] || ''}">${({ formal: 'رسمی', neutral: 'خنثی', informal: 'خودمونی', slang: 'عامیانه' })[x.register] || ''}</span><div class="small">${esc(x.fa || '')}</div>${x.use ? `<div class="small muted">🧭 ${esc(x.use)}</div>` : ''}${x.ex ? `<div class="small en muted">“${esc(x.ex)}”</div>` : ''}</div></div>`).join('')}</div>`).join('')}`, false) : ''}
  ${sec('🗂️', 'واژه‌های درس', `<span class="small muted">${faNum(unitWords(u).length)} واژه و عبارت با تصویر، تلفظ و مثال.</span><a class="btn ghost" href="#unit/${u.id}/w">دیدن و شنیدن واژه‌ها</a><a class="btn ghost" href="#cards/${u.id}">فلش‌کارت</a>`, false)}
  ${sec('📐', 'گرامر: ' + esc(L.grammar?.title || ''), `<p style="margin:0;line-height:1.9">${bidi(L.grammar?.explain || '')}</p>
    ${(L.grammar?.rules || []).map(r => `<div class="small"><b>•</b> ${bidi(r.fa)} <div class="en" dir="ltr" style="text-align:left;color:var(--accent)">${esc(r.en)}</div></div>`).join('')}
    ${(L.grammar?.table || []).length ? `<div style="overflow-x:auto"><table class="en small" dir="ltr" style="width:100%;border-collapse:collapse">${L.grammar.table.map((row, i) => `<tr>${row.map(c => `<td style="border:1px solid var(--line);padding:6px;${i === 0 ? 'font-weight:700;background:var(--sunk)' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>` : ''}
    ${(L.grammar?.examples || []).map(e => `<div class="row" style="flex-wrap:nowrap">${sp(e.en)}<div><span class="en">${tw(e.en)}</span><div class="small muted">${esc(e.fa)}</div></div></div>`).join('')}
    ${(L.grammar?.mistakes || []).map(m => `<div class="fix small" style="max-width:none">❌ <span class="en">${esc(m.wrong)}</span><br>✅ <span class="en">${esc(m.right)}</span><br>${esc(m.why)}</div>`).join('')}`)}
  ${sec('✍️', 'تمرین', `<div id="prac" class="stack">${P.map((x, i) => `<div class="card stack px" data-i="${i}" style="box-shadow:inset 0 0 0 1px var(--line)"><span class="small muted">${faNum(i + 1)}. ${x.type === 'mcq' ? 'گزینهٔ درست را انتخاب کن' : x.type === 'gap' ? 'جای خالی را پر کن' : x.type === 'order' ? 'کلمه‌ها را مرتب کن و جمله بنویس' : 'به انگلیسی بنویس'}</span><b class="${x.type === 'translate' ? '' : 'en'}">${esc(x.q)}</b>
    ${x.type === 'mcq' ? `<div class="row" style="gap:6px">${(x.options || []).map((o, k) => `<button class="btn ghost sm en" data-o="${k}">${esc(o)}</button>`).join('')}</div>` : `<div class="row" style="flex-wrap:nowrap;gap:6px"><input class="in grow en" dir="ltr" data-in><button class="btn sm" data-chk>بررسی</button></div>`}<div class="small" data-fb></div></div>`).join('')}</div><div class="small muted" id="psc"></div>`)}
  ${sec('🗣️', 'صحبت کن', `${(L.speaking || []).map(s => `<div class="row" style="flex-wrap:nowrap">${sp(s.en)}<div><span class="en">${esc(s.en)}</span><div class="small muted">${esc(s.fa)}</div></div></div>`).join('')}<a class="btn ghost" href="#talk/${u.id}">با معلم درباره‌اش حرف بزن</a>`)}
  ${sec('✅', 'جمع‌بندی', `<ul style="margin:0;padding-inline-start:18px;line-height:2">${(L.summary || []).map(s => `<li>${bidi(s)}</li>`).join('')}</ul><button class="btn" id="ldone">درس را خواندم ✓</button>`)}
  </div>`;
  let right = 0, done = 0; const norm = s => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim();
  const fin = (box, ok, ans) => { if (box.dataset.done) return; box.dataset.done = 1; done++; if (ok) { right++; addXP(3); } $('[data-fb]', box).innerHTML = ok ? '<span style="color:var(--ok)">✅ آفرین!</span>' : `<span style="color:var(--bad)">جواب درست:</span> <b class="en">${esc(ans)}</b>`; $('#psc').textContent = `${faNum(right)} از ${faNum(done)} درست`; if (done === P.length && right / P.length >= 0.7) markStep(u, 'lesson'); };
  v.onclick = async e => {
    const pb = e.target.closest('[data-pb]'); if (pb) { $$('[data-pb]', v).forEach(b => b.classList.toggle('ghost', b !== pb)); $$('.pbi', v).forEach(r => r.hidden = pb.dataset.pb !== 'all' && r.dataset.reg !== pb.dataset.pb); return; }
    const t = e.target.closest('.tw'); if (t) return wordPanel(t.textContent, t.parentElement?.textContent?.slice(0, 200));
    const s = e.target.closest('[data-say]'); if (s) { Spatial.at(s.dataset.lang === 'fa' ? 0 : -0.6, -1); return say(s.dataset.say, s.dataset.lang, s.dataset.emo, s); }
    const o = e.target.closest('[data-o]'); if (o) { const box = o.closest('.px'), x = P[+box.dataset.i]; const ans = Number.isInteger(+x.a) && x.options ? x.options[+x.a] : x.a; const ok = norm(o.textContent) === norm(ans) || +o.dataset.o === +x.a; o.style.boxShadow = `inset 0 0 0 2px var(--${ok ? 'ok' : 'bad'})`; return fin(box, ok, ans); }
    const c = e.target.closest('[data-chk]'); if (c) { const box = c.closest('.px'), x = P[+box.dataset.i]; const val = $('[data-in]', box).value; const ok = norm(val) === norm(x.a) || (x.type !== 'gap' && similarity(val, x.a) >= 85); return fin(box, ok, x.a); }
    if (e.target.id === 'ldone') { markStep(u, 'lesson'); go('unit/' + u.id); }
    if (e.target.id === 'teachall' || e.target.id === 'dlgall') {
      const fa = e.target.id === 'teachall'; const rows = $$(fa ? '.tp' : '.cl', v); const h0 = location.hash;
      for (const r of rows) { $$('.tp,.cl', v).forEach(x => x.style.background = ''); r.style.background = 'var(--accent-soft)'; r.scrollIntoView({ behavior: 'smooth', block: 'center' }); const i = +r.dataset.i; const ok = fa ? await voiceAt(L.teacher[i], 'fa', 'warm', null, 0, -0.8) : await voiceAt(L.conversation.lines[i].en, 'en', 'cheerful', i % 2 ? 'Puck' : 'Kore', i % 2 ? 1.2 : -1.2, -1); if (!ok || location.hash !== h0) break; await wait(300); }
      $$('.tp,.cl', v).forEach(x => x.style.background = '');
    }
  };
};

/* مدیر: ساخت و انتشار همهٔ درس‌ها یکجا */
async function buildAllLessons(box) {
  const all = ALL_UNITS.filter(u => u.baseWords.length || true); let made = 0, skip = 0, fail = 0;
  for (const [i, u] of all.entries()) {
    box.innerHTML = loading(`درس ${faNum(i + 1)} از ${faNum(all.length)}: ${esc(u.fa)} — ساخته‌شده ${faNum(made)}، از قبل آماده ${faNum(skip)}`);
    try { const { data } = await sb().from('lessons').select('id').eq('id', u.id).maybeSingle(); if (data) { skip++; continue; } } catch { }
    try { if (!unitWords(u).length && typeof expandWords === 'function') { try { await expandWords(u); } catch { } } const L = await lessonBuild(u); await idb.set('lesson:' + u.id, L); const { error } = await sb().from('lessons').upsert({ id: u.id, data: L, updated_at: new Date().toISOString() }); if (error) throw error; made++; }
    catch (e) { fail++; if (e.message === 'BUDGET' || e.message === 'NOKEY') break; await wait(3000); }
  }
  box.innerHTML = `<div class="notice soft">${faNum(made)} درس تازه ساخته و منتشر شد، ${faNum(skip)} درس از قبل آماده بود${fail ? `، ${faNum(fail)} درس ساخته نشد (دوباره بزن تا کامل شود)` : ''}. حالا همهٔ کاربران این درس‌ها را بدون هوش مصنوعی و آفلاین می‌خوانند.</div>`;
}

/* ───── کلاس صوتی فعل‌های کاربردی (موقعیت‌محور، سه‌بعدی، آفلاین) ───── */
const VERB_CLASSES = [['morning', '🌅', 'صبح تا بیرون رفتن'], ['chores', '🧹', 'کارهای خونه'], ['kitchen', '🍳', 'آشپزخونه و آشپزی'], ['clothes', '👕', 'لباس و خرید'], ['outside', '🚕', 'بیرون از خونه و رفت‌وآمد'], ['work', '💼', 'کار و درس'], ['body', '🙆', 'بدن و حرکت'], ['feelings', '💬', 'حرف زدن و احساسات'], ['evening', '🌙', 'عصر و شب'], ['weekend', '🎉', 'آخر هفته و تفریح']];
routes.vclass = async id => {
  if (!id) {
    setTop('کلاس صوتی فعل‌ها', true);
    view().innerHTML = `<div class="stack"><div class="card stack"><b>🎧 فعل‌های کاربردی، با صدای معلم</b><span class="small muted">معلم موقعیت رو می‌گه («می‌خوای لباساتو تا کنی…»)، فعل انگلیسی رو چند بار و به شکل‌های مختلف تکرار می‌کنه، باهاش جمله‌های کوتاه می‌سازه و ازت می‌خواد حدس بزنی. با هدفون، صدا سه‌بعدیه.</span></div>
      <div class="tools">${VERB_CLASSES.map(([k, ic, t]) => `<a class="tool" href="#vclass/${k}"><span class="ic">${ic}</span><b>${t}</b><span>کلاس صوتی + فهرست فعل‌ها و مثال‌ها</span></a>`).join('')}</div></div>`;
    return;
  }
  const c = VERB_CLASSES.find(x => x[0] === id); if (!c) return go('vclass'); setTop(c[2], true); const v = view(); v.innerHTML = loading();
  let L = null; try { const r = await fetch('lessons/verbs/' + id + '.json'); if (r.ok) L = await r.json(); } catch { }
  if (!L) { v.innerHTML = `<div class="card stack"><b>این کلاس به‌زودی اضافه می‌شود</b><a class="btn ghost" href="#verbs">فهرست فعل‌ها</a></div>`; return; }
  v.innerHTML = `<div class="stack"><div class="card stack"><b>🎧 ${esc(L.title || c[2])}</b><audio controls preload="none" src="audio/verbs/${id}.m4a" style="width:100%"></audio><a class="btn ghost sm" href="audio/verbs/${id}.m4a" download="rasta-verbs-${id}.m4a">⬇ دانلود برای گوش دادن آفلاین</a></div>
    <div class="card stack">${(L.verbs || []).map(x => `<div class="stack" style="gap:2px;border-bottom:1px solid var(--line);padding-bottom:8px"><div class="row" style="flex-wrap:nowrap"><button class="icon-btn" data-say="${esc(x.en)}">${I.spk}</button><b class="en">${esc(x.en)}</b><span class="muted">— ${esc(x.fa)}</span></div>${(x.ex || []).map(e => `<div class="small" style="padding-inline-start:44px"><span class="en">${esc(e.en)}</span> <span class="muted">${esc(e.fa)}</span></div>`).join('')}</div>`).join('')}
    <button class="btn ghost" id="addv">+ افزودن همهٔ این فعل‌ها به لایتنر</button></div>
    <details class="card"><summary><b>متن کلاس</b></summary><div class="stack" style="margin-top:8px">${[...(L.intro || []), ...(L.teach || []), ...(L.outro || [])].map(p => `<p style="margin:0;line-height:1.9">${bidi(p.replace(/\[PAUSE\]/g, ' ⏳ '))}</p>`).join('')}</div></details></div>`;
  v.onclick = e => { const s = e.target.closest('[data-say]'); if (s) say(s.dataset.say, 'en', 'calm', s); if (e.target.id === 'addv') { (L.verbs || []).forEach(x => addDictWord({ word: x.en, ipa_us: '', senses: [{ fa: x.fa || '—', examples: (x.ex || []).map(e => e.en) }] })); toast('فعل‌ها به لایتنر اضافه شدند.'); } };
};
