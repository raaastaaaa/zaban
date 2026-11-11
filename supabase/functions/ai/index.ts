// آموزش زبان رستا — سرور واسط هوش مصنوعی (Supabase Edge Function)
// کلیدهای Gemini فقط اینجا (در Secrets) می‌مانند؛ کاربر هیچ کلیدی نمی‌بیند.
// Secrets: GEMINI_KEYS = "key1,key2"  (یک یا چند کلید)، DAILY_USD = "1.5" (سقف روزانهٔ هر کاربر)
import { createClient } from "jsr:@supabase/supabase-js@2";

const KEYS = (Deno.env.get("GEMINI_KEYS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const DAILY = Number(Deno.env.get("DAILY_USD") ?? "1.5");
const BANK_DAYS = 30;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "content-type": "application/json" } });
const ALLOWED = /^(gemini|gemma)[\w.\-]*$/;
const PATHS = new Set(["generateContent"]);

function priceOf(model: string, u: Record<string, number> = {}) {
  const inp = u.promptTokenCount ?? 0, out = (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0);
  if (/tts/.test(model)) return (inp * 0.5 + out * 9) / 1e6;
  if (/pro/.test(model)) return (inp * 1.25 + out * 10) / 1e6;
  if (/lite/.test(model)) return (inp * 0.25 + out * 1.5) / 1e6;
  return (inp * 0.3 + out * 2.5) / 1e6;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!KEYS.length) return json({ error: "no server key" }, 503);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user } } = await admin.auth.getUser(jwt);
  if (!user) return json({ error: "login" }, 401);

  let body: { models?: string[]; path?: string; payload?: unknown };
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const models = (body.models ?? []).filter((m) => typeof m === "string" && ALLOWED.test(m)).slice(0, 6);
  const path = body.path ?? "generateContent";
  if (!models.length || !PATHS.has(path) || JSON.stringify(body.payload ?? {}).length > 600_000) return json({ error: "bad request" }, 400);

  // سقف روزانه با ذخیرهٔ باقی‌مانده تا ۳۰ روز؛ مدیر نامحدود
  const { data: prof } = await admin.from("profiles").select("is_admin, banned").eq("id", user.id).maybeSingle();
  if (prof?.banned) return json({ error: "banned" }, 403);
  const today = new Date().toISOString().slice(0, 10);
  if (!prof?.is_admin) {
    const since = new Date(Date.now() - BANK_DAYS * 864e5).toISOString().slice(0, 10);
    const { data: rows } = await admin.from("ai_usage").select("day, usd").eq("user_id", user.id).gte("day", since);
    const first = (rows ?? []).reduce((a, r) => (r.day < a ? r.day : a), today);
    const days = Math.min(BANK_DAYS, Math.round((Date.parse(today) - Date.parse(first)) / 864e5) + 1);
    const spent = (rows ?? []).reduce((a, r) => a + Number(r.usd), 0);
    if (spent >= DAILY * days) return json({ error: "BUDGET" }, 402);
  }

  let last = "";
  for (const m of models) {
    for (const key of KEYS) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:${path}`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body.payload) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        const usd = priceOf(m, d.usageMetadata);
        await admin.rpc("add_ai_usage", { uid: user.id, d: today, amount: usd });
        return json(d);
      }
      last = d?.error?.message ?? String(r.status);
      if (![429, 500, 503, 404].includes(r.status)) return json({ error: last }, r.status);
    }
  }
  return json({ error: last || "busy" }, 503);
});
