/* ───────── موتور صدای یکپارچه (بدون لگ، بدون پرش، بدون نویز) ─────────
   همهٔ صداهای گفتاری برنامه از اینجا پخش می‌شوند:
   • Web Audio به‌جای عوض کردن src یک تگ <audio> (که بین جمله‌ها مکث و «تق» می‌انداخت)
   • هر تکه با فِید ورود/خروج ۸ میلی‌ثانیه‌ای (حذف کلیک و خش ابتدا/انتهای فایل‌های TTS)
   • حذف سکوت‌های اضافهٔ ابتدا و انتهای هر تکه، و کنار هم چیدن بی‌فاصلهٔ تکه‌ها (gapless)
   • صدای سه‌بعدی تمیز: فقط جای صدا (HRTF)، بدون ریورب و پژواک
   • یک لیمیتر نرم روی خروجی تا صدا هیچ‌وقت نترکد */
const AE = (() => {
  let ctx = null, out = null, comp = null; const live = new Set(); const cache = new Map(); let gen = 0;
  function init() {
    if (ctx) return ctx;
    const C = window.AudioContext || window.webkitAudioContext; ctx = new C({ latencyHint: 'playback' });
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -6; comp.knee.value = 6; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
    out = ctx.createGain(); out.gain.value = 1; out.connect(comp); comp.connect(ctx.destination); return ctx;
  }
  const wake = () => { try { init(); if (ctx.state === 'suspended') ctx.resume(); } catch { } };
  document.addEventListener('pointerdown', wake, { capture: true }); document.addEventListener('keydown', wake, { capture: true });
  function trim(buf) { // حذف سکوت ابتدا/انتها (آستانهٔ خیلی پایین)
    const ch = buf.getChannelData(0), n = ch.length, th = 0.004; let a = 0, b = n - 1;
    while (a < n && Math.abs(ch[a]) < th) a++; while (b > a && Math.abs(ch[b]) < th) b--;
    a = Math.max(0, a - Math.round(buf.sampleRate * 0.03)); b = Math.min(n - 1, b + Math.round(buf.sampleRate * 0.06));
    if (a === 0 && b === n - 1 || b - a < buf.sampleRate * 0.05) return buf;
    const nb = ctx.createBuffer(buf.numberOfChannels, b - a + 1, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) nb.copyToChannel(buf.getChannelData(c).subarray(a, b + 1), c); return nb;
  }
  async function decode(src, key) { // src: Blob یا URL
    init(); const k = key || (typeof src === 'string' ? src : null); if (k && cache.has(k)) return cache.get(k);
    const ab = typeof src === 'string' ? await (await fetch(src)).arrayBuffer() : await src.arrayBuffer();
    const buf = trim(await new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)));
    if (k) { cache.set(k, buf); if (cache.size > 120) cache.delete(cache.keys().next().value); } return buf;
  }
  function node(x, z) { // مسیر هر تکه: (اختیاری) جای سه‌بعدی ← خروجی
    const sp = typeof G !== 'undefined' && ['1', '2'].includes(String(G.settings.spatial));
    if (!sp || x == null) return out;
    const p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'linear'; p.refDistance = 1; p.maxDistance = 10; p.rolloffFactor = 0;
    if (p.positionX) { p.positionX.value = x; p.positionY.value = 0; p.positionZ.value = z ?? -1.2; } else p.setPosition(x, 0, z ?? -1.2);
    p.connect(out); return p;
  }
  /* پخش یک بافر در زمان مشخص؛ برمی‌گرداند {end, done} */
  function schedule(buf, at, o = {}) {
    init(); const s = ctx.createBufferSource(); s.buffer = buf; if (o.rate && o.rate !== 1) s.playbackRate.value = o.rate;
    const g = ctx.createGain(); const t0 = Math.max(at ?? ctx.currentTime, ctx.currentTime + 0.02); const dur = buf.duration / (o.rate || 1); const f = 0.008;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(o.vol ?? 1, t0 + f); g.gain.setValueAtTime(o.vol ?? 1, t0 + dur - f); g.gain.linearRampToValueAtTime(0, t0 + dur);
    s.connect(g); g.connect(node(o.x, o.z)); s.start(t0); live.add(s); const myGen = gen;
    const done = new Promise(res => { s.onended = () => { live.delete(s); res(myGen === gen); }; });
    return { start: t0, end: t0 + dur, done };
  }
  async function play(src, o = {}) { // پخش ساده یک فایل/Blob؛ true اگر کامل پخش شد
    wake(); const myGen = gen; let buf; try { buf = await decode(src, o.key); } catch (e) { return null; }
    if (myGen !== gen) return false; const r = schedule(buf, null, o); return r.done;
  }
  function stop() { gen++; for (const s of live) { try { s.stop(); } catch { } } live.clear(); }
  const now = () => (init(), ctx.currentTime);
  return { init, wake, decode, schedule, play, stop, now, get ctx() { return init(); }, get gen() { return gen; } };
})();

/* ───── جایگزینی پخش قدیمی با موتور جدید ───── */
const _haltAudio0 = haltAudio;
haltAudio = function () { try { AE.stop(); } catch { } _haltAudio0(); };
let AE_POS = null; // جای صدای بعدی (برای سه‌بعدی)
playUrl = function (url, tok) { return (async () => { if (tok !== speakToken) return; const p = AE_POS; const r = await AE.play(url, { key: url, x: p?.[0], z: p?.[1] }); if (r === null) { await new Promise(res => { const done = () => { if (blobRes === done) blobRes = null; res(); }; blobRes = done; player.src = url; player.onended = player.onerror = done; player.play().catch(done); }); } })(); };
playBlob = function (blob, tok) { return (async () => { if (tok !== speakToken) return; const p = AE_POS; const r = await AE.play(blob, { x: p?.[0], z: p?.[1] }); if (r === null) { const url = URL.createObjectURL(blob); await new Promise(res => { const done = () => { if (blobRes === done) blobRes = null; URL.revokeObjectURL(url); res(); }; blobRes = done; player.src = url; player.onended = player.onerror = done; player.play().catch(done); }); } })(); };
/* Spatial قدیمی (با ریورب پرنویز) فقط جای صدا را برای موتور جدید ثبت می‌کند */
try { Spatial.at = (x = 0, z = -1.2) => { AE_POS = [x, z]; }; Spatial.prep = () => AE.wake(); Spatial.route = () => { }; } catch { }

/* ───── گفتگوی چندنفره در یک فایل پیوسته (Gemini TTS چندگوینده) ─────
   lines: [{who, t}] ؛ voices: {name: geminiVoice} (حداکثر ۲ گوینده) → Blob (WAV) */
async function ttsDialog(lines, voices, opts = {}) {
  const names = Object.keys(voices).slice(0, 2); const L = opts.lang || 'English';
  const text = lines.map(l => `${names.includes(l.who) ? l.who : names[0]}: ${l.t}`).join('\n');
  const style = `TTS the following ${L} conversation between ${names.join(' and ')}. Natural, warm, expressive radio-host delivery, ${opts.speed === 'slow' ? 'speaking slowly and very clearly for language learners' : opts.speed === 'native' ? 'at natural native speed' : 'at a calm, clear, learner-friendly pace'}; short natural pauses between turns.`;
  const key = 'dlg:' + hashStr(style + text + JSON.stringify(voices));
  const hit = await idb.get(key).catch(() => null); if (hit) return hit;
  const d = await gemFetch(['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'], 'generateContent', { contents: [{ parts: [{ text: `${style}\n\n${text}` }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { multiSpeakerVoiceConfig: { speakerVoiceConfigs: names.map(n => ({ speaker: n, voiceConfig: { prebuiltVoiceConfig: { voiceName: voices[n] } } })) } } } }, gemKey());
  const part = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData); if (!part) throw new Error('tts');
  const m = /rate=(\d+)/.exec(part.inlineData.mimeType || ''); const blob = pcmToWav(part.inlineData.data, m ? +m[1] : 24000);
  idb.set(key, blob).catch(() => { }); return blob;
}

/* ───── صدای طبیعی رایگان (Microsoft neural) از راه سرور برنامه — بدون سهمیه، یکنواخت ───── */
const EDGE_VOICES = { 'en-US': ['en-US-AvaNeural', 'en-US-AndrewNeural'], 'en-GB': ['en-GB-SoniaNeural', 'en-GB-RyanNeural'], 'fa-IR': ['fa-IR-DilaraNeural', 'fa-IR-FaridNeural'], 'ar-OM': ['ar-OM-AyshaNeural', 'ar-OM-AbdullahNeural'], 'ar-SA': ['ar-SA-ZariyahNeural', 'ar-SA-HamedNeural'], 'ar-EG': ['ar-EG-SalmaNeural', 'ar-EG-ShakirNeural'], 'ar-SY': ['ar-SY-AmanyNeural', 'ar-SY-LaithNeural'], 'ar-IQ': ['ar-IQ-RanaNeural', 'ar-IQ-BasselNeural'], 'de-DE': ['de-DE-KatjaNeural', 'de-DE-ConradNeural'], 'de-AT': ['de-AT-IngridNeural', 'de-AT-JonasNeural'], 'de-CH': ['de-CH-LeniNeural', 'de-CH-JanNeural'], 'tr-TR': ['tr-TR-EmelNeural', 'tr-TR-AhmetNeural'], 'zh-CN': ['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural'], 'zh-TW': ['zh-TW-HsiaoChenNeural', 'zh-TW-YunJheNeural'], 'zh-HK': ['zh-HK-HiuMaanNeural', 'zh-HK-WanLungNeural'] };
const edgeVoice = (loc, male) => (EDGE_VOICES[loc] || EDGE_VOICES['en-US'])[male ? 1 : 0];
const targetLoc = () => tl() === 'en' ? (G.settings.accent === 'UK' ? 'en-GB' : 'en-US') : tlDia()[2];
let EDGE_DOWN = 0;
async function edgeTTS(text, voice, rate) {
  const key = 'edge:' + hashStr(voice + '|' + (rate || '') + '|' + text); const hit = await idb.get(key).catch(() => null); if (hit) return hit;
  if (Date.now() < EDGE_DOWN) throw new Error('edge-down');
  const c = typeof sb === 'function' ? sb() : null; const t = c && (await c.auth.getSession()).data.session?.access_token; if (!t) throw new Error('NOLOGIN');
  const r = await fetch(`${SB_URL}/functions/v1/live?tts=1&jwt=${encodeURIComponent(t)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, voice, rate }) });
  if (!r.ok) { if (r.status === 404) EDGE_DOWN = Date.now() + 10 * 60000; throw new Error('edge ' + r.status); }
  const blob = await r.blob(); idb.set(key, blob).catch(() => { }); return blob;
}
/* اگر صدای Gemini (سهمیهٔ روزانه) تمام شد، به‌جای صدای رباتیِ مرورگر از صدای طبیعی Microsoft استفاده شود */
const _cloudTTS0 = cloudTTS0;
cloudTTS0 = async function (engine, text, lang, emotion) {
  try { return await _cloudTTS0(engine, text, lang, emotion); }
  catch (e) { const loc = lang === 'fa' ? 'fa-IR' : lang === 'en' ? targetLoc() : (tlDia()[2] || 'en-US'); try { return await edgeTTS(text, edgeVoice(loc, /Charon|Puck|Fenrir|Orus/.test(G.settings.geminiVoice))); } catch { throw e; } } };
