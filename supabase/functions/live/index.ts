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
async function edgeTTS(text: string, voice: string, rate = "+0%"): Promise<Uint8Array> {
  const id = crypto.randomUUID().replaceAll("-", "");
  const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${await gec()}&Sec-MS-GEC-Version=${VER}&ConnectionId=${id}`;
  // @ts-ignore Deno supports headers on WebSocket
  const ws = new WebSocket(url, { headers: { "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0" } });
  ws.binaryType = "arraybuffer"; const chunks: Uint8Array[] = [];
  return await new Promise((res, rej) => {
    const to = setTimeout(() => { try { ws.close(); } catch { } rej(new Error("timeout")); }, 30000);
    ws.onopen = () => { const ts = new Date().toString();
      ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
      ws.send(`X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='+0Hz' rate='${rate}' volume='+0%'>${esc(text)}</prosody></voice></speak>`); };
    ws.onmessage = (e) => { if (typeof e.data === "string") { if (e.data.includes("Path:turn.end")) { clearTimeout(to); ws.close(); const n = chunks.reduce((a, c) => a + c.length, 0); const out = new Uint8Array(n); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; } res(out); } return; }
      const b = new Uint8Array(e.data); const hl = (b[0] << 8) | b[1]; chunks.push(b.slice(2 + hl)); };
    ws.onerror = (e) => { clearTimeout(to); rej(new Error("ws error " + ((e as any).message || ""))); };
  });
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
    for (let k = 0; k < 3; k++) { try { const mp3 = await edgeTTS(text, voice, rate); if (mp3.length > 500) return new Response(mp3 as unknown as BodyInit, { headers: { ...cors, "content-type": "audio/mpeg", "cache-control": "public, max-age=31536000" } }); } catch (_) { await new Promise((r) => setTimeout(r, 400 * (k + 1))); } }
    return new Response("tts failed", { status: 502, headers: cors });
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
