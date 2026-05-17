// AI Study Tutor — uses free providers with graceful fallback.
//
// Provider priority:
//   1. Google Gemini (free tier, set GOOGLE_API_KEY env var) — primary
//   2. Hack Club AI (free for hackers, no key) — fallback
//
// To enable Gemini (recommended):
//   Get a free key at https://aistudio.google.com/app/apikey
//   Add as GOOGLE_API_KEY in Vercel env vars.

const SYSTEM_PROMPT = `You are "Kuya AI" — a friendly Filipino study tutor for students from the Philippines.
You help with homework, capstone/thesis ideas, exam prep, programming, and study strategies.

Rules:
- Be encouraging, patient, and use simple language.
- When relevant, mix Tagalog/English ("Taglish") — feels natural to PH students.
- Give short, focused answers. Use bullet points or numbered steps when explaining.
- If math or code, show clear examples.
- For sensitive topics (mental health, abuse, suicide), respond with empathy and point to 1553 (NCMH Crisis Hotline) or 02-7-989-USAP.
- Never make up Philippine government program details — say "double-check on the official website" if unsure.
- Decline politely if asked to do something harmful, dishonest, or against academic integrity.`;

async function callGemini(question, history) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;

  const contents = [];
  for (const turn of history.slice(-6)) {
    contents.push({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.content }] });
  }
  contents.push({ role: 'user', parts: [{ text: question }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Gemini ${r.status}: ${txt.slice(0, 200)}`);
  }
  const json = await r.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return { provider: 'gemini-2.0-flash', text };
}

async function callHackClub(question, history) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });

  const r = await fetch('https://ai.hackclub.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`HackClub ${r.status}: ${txt.slice(0, 200)}`);
  }
  const json = await r.json();
  const text = json?.choices?.[0]?.message?.content || '';
  return { provider: 'hackclub-ai', text };
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const question = (body?.question || '').toString().trim();
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!question) return res.status(400).json({ error: 'question is required' });
    if (question.length > 2000) return res.status(400).json({ error: 'question too long (max 2000 chars)' });

    const errors = [];
    for (const fn of [callGemini, callHackClub]) {
      try {
        const result = await fn(question, history);
        if (result) {
          return res.status(200).json({ ok: true, ...result });
        }
      } catch (e) {
        errors.push(`${fn.name}: ${e.message}`);
      }
    }
    return res.status(503).json({
      ok: false,
      error: 'No AI provider available right now',
      hint: 'Set GOOGLE_API_KEY in Vercel env vars (free at aistudio.google.com)',
      tried: errors,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
