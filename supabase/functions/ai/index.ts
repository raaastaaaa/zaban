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
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")?.default, { auth: { persistSession: false } });
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
  // ───── پشتیبان‌ها وقتی سهمیهٔ همهٔ کلیدهای Gemini پر شد ─────
  const p = body.payload as any; const isAudio = p?.generationConfig?.responseModalities?.includes("AUDIO");
  try {
    if (isAudio) { const d = await azureTTS(p); if (d) { await admin.rpc("add_ai_usage", { uid: user.id, d: today, amount: 0.0005 }); return json(d); } }
    else { const d = await chatFallback(p); if (d) { await admin.rpc("add_ai_usage", { uid: user.id, d: today, amount: 0.0002 }); return json(d); } }
  } catch (e) { last = String(e); }
  return json({ error: last || "busy" }, 503);
});

// متن: Groq و OpenRouter (سازگار با OpenAI)؛ پاسخ به شکل پاسخ Gemini برگردانده می‌شود
async function chatFallback(p: any) {
  if ((p.contents ?? []).some((c: any) => (c.parts ?? []).some((x: any) => x.inlineData))) return null; // عکس/صدا فقط با Gemini
  const msgs: { role: string; content: string }[] = [];
  const sys = (p.systemInstruction?.parts ?? []).map((x: any) => x.text ?? "").join("\n");
  if (sys) msgs.push({ role: "system", content: sys + "\nAlways write Persian (Farsi) fluently and naturally when Persian is needed." });
  for (const c of p.contents ?? []) msgs.push({ role: c.role === "model" ? "assistant" : "user", content: (c.parts ?? []).map((x: any) => x.text ?? "").join("\n") });
  const wantJson = p.generationConfig?.responseMimeType === "application/json";
  const providers = [
    { key: Deno.env.get("GROQ_KEY"), url: "https://api.groq.com/openai/v1/chat/completions", model: Deno.env.get("GROQ_MODEL") ?? "llama-3.3-70b-versatile" },
    { key: Deno.env.get("OPENROUTER_KEY"), url: "https://openrouter.ai/api/v1/chat/completions", model: Deno.env.get("OPENROUTER_MODEL") ?? "meta-llama/llama-3.3-70b-instruct:free" },
  ].filter((x) => x.key);
  for (const pr of providers) {
    const r = await fetch(pr.url, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + pr.key }, body: JSON.stringify({ model: pr.model, messages: msgs, temperature: p.generationConfig?.temperature ?? 0.8, max_tokens: Math.min(p.generationConfig?.maxOutputTokens ?? 1400, 8000), ...(wantJson ? { response_format: { type: "json_object" } } : {}) }) });
    if (!r.ok) continue; const d = await r.json(); const t = d.choices?.[0]?.message?.content; if (!t) continue;
    return { candidates: [{ content: { role: "model", parts: [{ text: t }] } }], usageMetadata: {}, fallback: pr.url };
  }
  return null;
}

// صدا: Microsoft Azure Speech (صدای فارسی «دلارا»/«فرید» و انگلیسی آمریکایی/بریتانیایی)
async function azureTTS(p: any) {
  const key = Deno.env.get("AZURE_SPEECH_KEY"), region = Deno.env.get("AZURE_SPEECH_REGION"); if (!key || !region) return null;
  const raw: string = (p.contents?.[0]?.parts ?? []).map((x: any) => x.text ?? "").join("\n");
  const i = raw.indexOf(":\n"); const style = i > -1 ? raw.slice(0, i) : ""; const text = (i > -1 ? raw.slice(i + 2) : raw).trim(); if (!text) return null;
  const fa = /[\u0600-\u06FF]/.test(text); const uk = /British/.test(style);
  const voice = fa ? (Deno.env.get("AZURE_FA_VOICE") ?? "fa-IR-DilaraNeural") : uk ? "en-GB-SoniaNeural" : "en-US-JennyNeural";
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ssml = `<speak version="1.0" xml:lang="${fa ? "fa-IR" : uk ? "en-GB" : "en-US"}"><voice name="${voice}">${esc(text)}</voice></speak>`;
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, { method: "POST", headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm", "User-Agent": "rasta-english" }, body: ssml });
  if (!r.ok) return null;
  const b = new Uint8Array(await r.arrayBuffer()); let bin = ""; for (let k = 0; k < b.length; k += 0x8000) bin += String.fromCharCode(...b.subarray(k, k + 0x8000));
  return { candidates: [{ content: { role: "model", parts: [{ inlineData: { mimeType: "audio/wav", data: btoa(bin) } }] } }], usageMetadata: {}, fallback: "azure" };
}
