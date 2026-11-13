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
const VER = "1-143.0.3650.75";
async function gec() { const ticks = BigInt(Math.floor(Date.now() / 1000) + 11644473600) * 10000000n; const t = ticks - (ticks % 3000000000n); const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${t}${TOKEN}`)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase(); }
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
    const req = `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\nOrigin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold\r\nPragma: no-cache\r\nCache-Control: no-cache\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0\r\n\r\n`;
    await c.write(new TextEncoder().encode(req));
    const buf = { b: new Uint8Array(0) }; let hdr = "";
    while (!hdr.includes("\r\n\r\n")) { const ch = await readExact(c, buf, 1); hdr += String.fromCharCode(ch[0]); if (hdr.length > 8000) throw new Error("bad handshake"); }
    if (!/^HTTP\/1\.1 101/.test(hdr)) throw new Error("handshake " + hdr.split("\r\n")[0]);
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
