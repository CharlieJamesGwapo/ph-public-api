// Kuya AI — Filipino study tutor.
//
// Provider chain (tries in order, picks first that succeeds):
//   1. Google Gemini (free tier, set GOOGLE_API_KEY env var) — best quality
//   2. Pollinations.ai (no key needed) — fallback
//   3. Hack Club AI (no key) — last resort
//
// To enable Gemini (recommended):
//   Get a free key at https://aistudio.google.com/app/apikey
//   In Vercel: Settings > Environment Variables > add GOOGLE_API_KEY

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
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 120)}`);
  const json = await r.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new Error('Gemini empty response');
  return { provider: 'gemini-2.0-flash', text };
}

async function callPollinations(question, history) {
  // POST OpenAI-compatible format
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });
  const r = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'openai', private: true }),
  });
  if (!r.ok) throw new Error(`Pollinations ${r.status}: ${(await r.text()).slice(0, 120)}`);
  const text = (await r.text()).trim();
  if (!text) throw new Error('Pollinations empty');
  return { provider: 'pollinations.ai', text };
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
  if (!r.ok) throw new Error(`HackClub ${r.status}: ${(await r.text()).slice(0, 120)}`);
  const json = await r.json();
  const text = json?.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('HackClub empty');
  return { provider: 'hackclub-ai', text };
}

module.exports = async (req, res) => {
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
    for (const fn of [callGemini, callPollinations, callHackClub]) {
      try {
        const result = await fn(question, history);
        if (result) return res.status(200).json({ ok: true, ...result });
      } catch (e) {
        errors.push(`${fn.name}: ${e.message}`);
      }
    }
    return res.status(503).json({
      ok: false,
      error: 'All AI providers failed. Try again in a moment.',
      tried: errors,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
