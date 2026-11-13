// تابع «live» سرور زبان رستا:
//  ۱) پل کلاس زندهٔ هم‌زمان (WebSocket): مرورگر ⇄ این تابع ⇄ Gemini Live — بدون فیلترشکن
//  ۲) صدای طبیعی رایگان (Microsoft Edge neural voices) برای همهٔ صداهای پویا: POST ?tts=1
// کاربر باید وارد حساب برنامه شده باشد (JWT). کلیدها فقط روی سرورند.
import { createClient } from "npm:@supabase/supabase-js@2";
const KEYS = (Deno.env.get("GEMINI_KEYS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,OPTIONS" };
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
async function userOf(jwt: string) { if (!jwt) return null; const { data, error } = await sb.auth.getUser(jwt); return error ? null : data?.user ?? null; }
// Edge TTS (Microsoft neural voices, free) — callable from a Supabase Edge Function
const TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const VER = "2-143.0.3650.75";
// Sec-MS-GEC v2 (port of edge-tts drm.py) — توکن لازم برای صدای طبیعی Microsoft
const SH_INIT = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19];
const SH_STATE = [0xFD9FBEA2, 0x91243CE7, 0xBE499094, 0xCD2E1E0A, 0x6C006F49, 0x04BD35AB, 0xFEB0A7E4, 0x03EFFBD2];
const SH_SCHED = [0xEB24BF9E, 0x1558691F, 0xA0C09EE2, 0x0CFA32BA, 0xA622EE8C, 0xD1DD9491, 0xC0DD25A0, 0xF9E70AB6, 0xF0C31573, 0x7058CE4E, 0x7188E606, 0x00E5AB33, 0xD258B060, 0x72766564];
const K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2];
const ADJ = 0xC9DC06A7; const KB = K.slice(0, 14).concat([ADJ], K.slice(15));
const S0ADJ = 0x059C0B80, S1ADJ = 0x000B92C0;
const CS = [[0xE82E91B1, 0xB32700D0], [0x44DE24C6, 0x88DFF51D], [0x3BEB65BC, 0x29514038], [0xC89C5933, 0xB328CBDF], [0x8D1EC211, 0xD405B4D5], [0x314EF5D5, 0x26E55F3C], [0xE92491B1, 0x607801C6], [0xF0A5B9D5, 0x82B2C1FB], [0x06064CF3, 0xFA51A3DA], [0xDA79FA60, 0x207CC464], [0xBED20560, 0x3C3C74F3], [0x89F9C9F8, 0xD2D14B61], [0x35FA38C6, 0xBB04A2C1], [0xCB49E3C6, 0xC5626167]];
const CSF = 0x82893933, CSA0 = 0xF2F90B1A, CSA1 = 0x0B1A0000;
const u = (x: number) => x >>> 0; const mul = (a: number, b: number) => Math.imul(a, b) >>> 0;
const rotr = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0;
const rol16 = (x: number) => ((x << 16) | (x >>> 16)) >>> 0;
const s0 = (v: number) => u(rotr(v, 7) ^ rotr(v, 18) ^ (v >>> 3));
const s1 = (v: number) => u(rotr(v, 17) ^ rotr(v, 19) ^ (v >>> 10));
function rounds(st: number[], w: number[], first = 0) {
  let [a, b, c, d, e, f, g, h] = st; const k = first === 14 ? KB : K;
  for (let i = first; i < 64; i++) {
    const t1 = u(h + u(rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + u(g ^ (e & (f ^ g))) + k[i] + w[i]);
    const t2 = u(u(rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + u((a & b) | (c & (a | b))));
    h = g; g = f; f = e; e = u(d + t1); d = c; c = b; b = a; a = u(t1 + t2);
  }
  return [a, b, c, d, e, f, g, h];
}
function expand(w: number[], first = 16) { for (let i = first; i < 64; i++) w.push(u(s1(w[i - 2]) + w[i - 7] + s0(w[i - 15]) + w[i - 16])); }
const be = (d: Uint8Array, o: number, n: number) => { let v = 0; for (let i = 0; i < n; i++) v = v * 256 + d[o + i]; return v >>> 0; };
function shaInit(d: Uint8Array) {
  const w: number[] = new Array(14).fill(0); w.push(be(d, 0, 3)); w.push(be(d, 3, 4));
  for (let i = 16; i < 30; i++) {
    let v = SH_SCHED[i - 16];
    if (i - 2 >= 14) v += i === 16 ? u(s1(w[i - 2]) ^ S1ADJ) : s1(w[i - 2]);
    if (i - 7 >= 14) v += w[i - 7];
    if (i - 15 >= 14) v += i === 29 ? u(s0(w[i - 15]) ^ S0ADJ) : s0(w[i - 15]);
    w.push(u(v));
  }
  w.push(u(s1(w[28]) + w[23] + s0(w[15]) + w[14] + ADJ - K[14]));
  expand(w, 31); const wk = rounds(SH_STATE, w, 14); return SH_INIT.map((x, i) => u(x + wk[i]));
}
function shaDigest(d: Uint8Array) {
  const len = 57 + d.length; const tail = d.slice(7); const padN = ((55 - len) % 64 + 64) % 64;
  const p = new Uint8Array(tail.length + 1 + padN + 8); p.set(tail); p[tail.length] = 0x80;
  const bits = len * 8; const dv = new DataView(p.buffer); dv.setUint32(p.length - 8, Math.floor(bits / 4294967296)); dv.setUint32(p.length - 4, bits >>> 0);
  let st = shaInit(d.slice(0, 7));
  for (let o = 0; o < p.length; o += 64) { const w: number[] = []; for (let i = 0; i < 16; i++) w.push(dv.getUint32(o + i * 4)); expand(w); const wk = rounds(st, w); st = st.map((x, i) => u(x + wk[i])); }
  const out = new Uint8Array(32); const ov = new DataView(out.buffer); st.forEach((x, i) => ov.setUint32(i * 4, x)); return out;
}
function cs64(d: Uint8Array, dg: Uint8Array): [number, number] {
  const dv = new DataView(dg.buffer); const ka = u(dv.getUint32(0, true) | 1), kb = u(dv.getUint32(4, true) | 1);
  const fac = [mul(ka, CSF), mul(kb, CSF)];
  const terms = CS.map(([c], i) => mul(c, fac[i % 2])); const offs = CS.map(([, o]) => o);
  const src = new Uint8Array(1 + d.length); src.set(d, 1); const pad = new Uint8Array(src.length + ((4 - src.length % 4) % 4)); pad.set(src);
  const pv = new DataView(pad.buffer); const words: number[] = []; for (let i = 0; i < pad.length; i += 4) words.push(pv.getUint32(i, true)); if (words.length % 2) words.push(0);
  words.forEach((w, i) => {
    let term = mul(w, i % 2 === 0 ? ka : kb); let off = mul(rol16(w), i % 2 === 0 ? 0xEF0569FB : 0xC31713DB);
    if (i === 0) { term = u(term + mul(CSA0, fac[0])); off = u(off + CSA1); }
    terms.push(term); offs.push(off);
  });
  let sacc = 0, slast = 0, st = 0, acc = 0;
  for (let i = 0; i < terms.length; i += 2) {
    const x = terms[i], y = terms[i + 1];
    let t = rol16(u(offs[i] + x)); let q = mul(t, 0x76F50F34); sacc = sacc + u(mul(rol16(q), 0xC3EFEA97) + q);
    t = rol16(u(offs[i + 1] + y)); q = mul(t, 0x1881CE3C); slast = u(mul(rol16(q), 0x35BD1EC9) + q); sacc = u(sacc + slast);
    st = u(mul(st, ka) + x); st = mul(rol16(st), 0xCF98B111); st = mul(rol16(st), 0x87085B9F); st = mul(rol16(st), 0x12CEB96D); st = mul(rol16(st), 0x257E1D83);
    acc = acc + st;
    let tt = u(mul(st, kb) + y); tt = mul(rol16(tt), 0xA27416F5); tt = mul(rol16(tt), 0xD38396FF); st = mul(rol16(mul(rol16(tt), 0x7C932B89)), 0xBFA49F69);
    acc = u(acc + st);
  }
  return [u(slast ^ st), u(sacc ^ acc)];
}
const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
function gecV2(token: string, unix = Date.now() / 1000) {
  let ticks = unix + 11644473600; ticks -= ticks % 300; ticks *= 1e9 / 100;
  const data = new TextEncoder().encode(ticks.toFixed(0) + token);
  const dg = shaDigest(data); const [a, b] = cs64(data, dg);
  const c = new Uint8Array(8); const cv = new DataView(c.buffer); cv.setUint32(0, a, true); cv.setUint32(4, b, true);
  return `${hex(c)}-${hex(dg)}`;
}
let SKEW = 0; // اختلاف ساعت با سرور مایکروسافت
const gec = () => gecV2(TOKEN, Date.now() / 1000 + SKEW);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// کلاینت WebSocket کوچک با دست‌دادن دستی (چون WebSocket داخلی Deno هدر Origin نمی‌پذیرد)
async function readExact(c: Deno.TlsConn, buf: { b: Uint8Array }, n: number) {
  while (buf.b.length < n) { const t = new Uint8Array(65536); const r = await c.read(t); if (r === null) throw new Error("eof"); const nb = new Uint8Array(buf.b.length + r); nb.set(buf.b); nb.set(t.subarray(0, r), buf.b.length); buf.b = nb; }
  const out = buf.b.slice(0, n); buf.b = buf.b.slice(n); return out;
}
async function sendFrame(c: Deno.TlsConn, op: number, data: Uint8Array) {
  const n = data.length; const head = n < 126 ? [0x80 | op, 0x80 | n] : n < 65536 ? [0x80 | op, 0x80 | 126, n >> 8, n & 255] : [0x80 | op, 0x80 | 127, 0, 0, 0, 0, (n >>> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];
  const mask = crypto.getRandomValues(new Uint8Array(4)); const f = new Uint8Array(head.length + 4 + n); f.set(head); f.set(mask, head.length);
  for (let k = 0; k < n; k++) f[head.length + 4 + k] = data[k] ^ mask[k & 3];
  let w = 0; while (w < f.length) w += await c.write(f.subarray(w));
}
async function edgeTTS(text: string, voice: string, rate = "+0%"): Promise<Uint8Array> {
  const id = crypto.randomUUID().replaceAll("-", "");
  const host = "speech.platform.bing.com";
  const path = `/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${await gec()}&Sec-MS-GEC-Version=${VER}&ConnectionId=${id}`;
  const c = await Deno.connectTls({ hostname: host, port: 443 });
  const timer = setTimeout(() => { try { c.close(); } catch { /* */ } }, 30000);
  try {
    const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    const req = `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\nOrigin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold\r\nCookie: muid=${[...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase()};\r\nAccept-Language: en-US,en;q=0.9\r\nPragma: no-cache\r\nCache-Control: no-cache\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0\r\n\r\n`;
    await c.write(new TextEncoder().encode(req));
    const buf = { b: new Uint8Array(0) }; let hdr = "";
    while (!hdr.includes("\r\n\r\n")) { const ch = await readExact(c, buf, 1); hdr += String.fromCharCode(ch[0]); if (hdr.length > 8000) throw new Error("bad handshake"); }
    if (!/^HTTP\/1\.1 101/.test(hdr)) { const dm = /\r\ndate:\s*([^\r]+)/i.exec(hdr); if (dm) { const sd = Date.parse(dm[1]); if (sd) SKEW += (sd - Date.now()) / 1000; } throw new Error("handshake " + hdr.split("\r\n")[0]); }
    const ts = new Date().toString(); const enc = new TextEncoder();
    await sendFrame(c, 1, enc.encode(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`));
    await sendFrame(c, 1, enc.encode(`X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='+0Hz' rate='${rate}' volume='+0%'>${esc(text)}</prosody></voice></speak>`));
    const chunks: Uint8Array[] = []; let frag: Uint8Array[] = []; let fop = 0;
    for (;;) {
      const h = await readExact(c, buf, 2); const fin = h[0] & 0x80; let op = h[0] & 15; let n = h[1] & 127;
      if (n === 126) { const e = await readExact(c, buf, 2); n = (e[0] << 8) | e[1]; } else if (n === 127) { const e = await readExact(c, buf, 8); n = e[4] * 16777216 + ((e[5] << 16) | (e[6] << 8) | e[7]); }
      const masked = h[1] & 0x80; const mk = masked ? await readExact(c, buf, 4) : null; const pl = await readExact(c, buf, n); if (mk) for (let k = 0; k < n; k++) pl[k] ^= mk[k & 3];
      if (op === 8) throw new Error("closed by server");
      if (op === 9) { await sendFrame(c, 10, pl); continue; }
      if (op === 10) continue;
      if (op !== 0) { fop = op; frag = []; } frag.push(pl); if (!fin) continue;
      const tot = frag.reduce((a, x) => a + x.length, 0); const m = new Uint8Array(tot); let o = 0; for (const x of frag) { m.set(x, o); o += x.length; } op = fop; frag = [];
      if (op === 1) { if (new TextDecoder().decode(m).includes("Path:turn.end")) break; continue; }
      if (op === 2) { const hl = (m[0] << 8) | m[1]; chunks.push(m.slice(2 + hl)); }
    }
    const n = chunks.reduce((a, x) => a + x.length, 0); const out = new Uint8Array(n); let o = 0; for (const x of chunks) { out.set(x, o); o += x.length; } return out;
  } finally { clearTimeout(timer); try { c.close(); } catch { /* */ } }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const u = new URL(req.url);
  const jwt = u.searchParams.get("jwt") ?? (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  // ── صدای طبیعی ──
  if (u.searchParams.get("tts")) {
    if (!(await userOf(jwt))) return new Response("unauthorized", { status: 401, headers: cors });
    const b = await req.json().catch(() => ({}));
    const text = String(b.text ?? "").slice(0, 3000); const voice = String(b.voice ?? "en-US-AvaNeural").replace(/[^A-Za-z0-9-]/g, ""); const rate = /^[+-]\d{1,2}%$/.test(b.rate ?? "") ? b.rate : "+0%";
    if (!text.trim()) return new Response("empty", { status: 400, headers: cors });
    let lastErr = ""; for (let k = 0; k < 3; k++) { try { const mp3 = await edgeTTS(text, voice, rate); if (mp3.length > 500) return new Response(mp3 as unknown as BodyInit, { headers: { ...cors, "content-type": "audio/mpeg", "cache-control": "public, max-age=31536000" } }); } catch (e) { lastErr = String((e as Error)?.message || e); await new Promise((r) => setTimeout(r, 400 * (k + 1))); } }
    return new Response("tts failed: " + lastErr, { status: 502, headers: cors });
  }
  if ((req.headers.get("upgrade") ?? "").toLowerCase() !== "websocket") return new Response("live ok", { headers: cors });
  // ── پل کلاس زنده ──
  if (!(await userOf(jwt))) return new Response("unauthorized", { status: 401, headers: cors });
  if (!KEYS.length) return new Response("no key", { status: 500, headers: cors });
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const { socket, response } = Deno.upgradeWebSocket(req);
  const up = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`);
  up.binaryType = "arraybuffer";
  const queue: (string | ArrayBuffer)[] = []; let done: () => void = () => {};
  // @ts-ignore EdgeRuntime is provided by Supabase
  EdgeRuntime.waitUntil(new Promise<void>((r) => (done = r)));
  up.onopen = () => { for (const m of queue) up.send(m); queue.length = 0; };
  socket.onmessage = (e) => { if (up.readyState === WebSocket.OPEN) up.send(e.data); else queue.push(e.data); };
  up.onmessage = (e) => { if (socket.readyState === WebSocket.OPEN) socket.send(typeof e.data === "string" ? e.data : new TextDecoder().decode(e.data)); };
  up.onclose = (e) => { try { socket.close(1000, String(e.reason || "").slice(0, 120)); } catch { /* */ } done(); };
  up.onerror = () => { try { socket.close(1011, "upstream error"); } catch { /* */ } };
  socket.onclose = () => { try { up.close(); } catch { /* */ } done(); };
  return response;
});
