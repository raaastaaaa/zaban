// پل کلاس زندهٔ هم‌زمان: مرورگر (بدون فیلترشکن) ⇄ این تابع ⇄ Gemini Live
// کلید گوگل فقط روی سرور است؛ کاربر باید وارد حساب برنامه شده باشد (JWT در آدرس).
import { createClient } from "npm:@supabase/supabase-js@2";
const KEYS = (Deno.env.get("GEMINI_KEYS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if ((req.headers.get("upgrade") ?? "").toLowerCase() !== "websocket") return new Response("live bridge ok", { headers: cors });
  const u = new URL(req.url);
  const jwt = u.searchParams.get("jwt") ?? "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await sb.auth.getUser(jwt);
  if (error || !data?.user) return new Response("unauthorized", { status: 401, headers: cors });
  if (!KEYS.length) return new Response("no key", { status: 500, headers: cors });
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const { socket, response } = Deno.upgradeWebSocket(req);
  const up = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`);
  up.binaryType = "arraybuffer";
  const queue: (string | ArrayBuffer)[] = [];
  let done: () => void = () => {};
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
