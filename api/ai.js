// Kuya AI — Filipino study tutor with 7 specialized modes.
// Reliability strategy: short embedded mode hints (no separate system prompt)
// which Pollinations accepts reliably. Race Gemini (if key) vs Pollinations GET.

const HINTS = {
  general: 'You are Kuya AI — a friendly Filipino tutor. Reply in Taglish, short and clear.',
  coding: 'You are Coder Kuya — a coding tutor. Use clear code blocks. Explain why, not just what.',
  research: 'You are Research Kuya — academic writing helper. Be precise. Don\'t fabricate citations.',
  writing: 'You are Writer Kuya — fix grammar and improve clarity. Translate Tagalog↔English when asked.',
  math: 'You are Math Kuya — show step-by-step solutions, state the formula.',
  marketing: 'You are Marketing Kuya — give actionable PH-context strategies and copy variations.',
  career: 'You are Career Kuya — improve resumes/portfolios with STAR method and quantified bullets.',
};

function hint(mode) { return HINTS[mode] || HINTS.general; }

async function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms)),
  ]);
}

async function callGemini(question, history, mode) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('Gemini: no key');
  const contents = [];
  for (const turn of history.slice(-4)) {
    contents.push({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.content }] });
  }
  contents.push({ role: 'user', parts: [{ text: question }] });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: hint(mode) }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Gemini ${r.status}: ${txt.slice(0, 100)}`);
  }
  const json = await r.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new Error('Gemini empty');
  return { provider: 'gemini-flash', text };
}

async function callPollinationsGet(question, history, mode) {
  // Build combined prompt: short hint + recent context + the question
  let prompt = hint(mode);
  if (history.length) {
    const recent = history.slice(-4).map(h => `${h.role === 'assistant' ? 'You' : 'Student'}: ${h.content}`).join('\n');
    prompt += `\n\nPrevious conversation:\n${recent}`;
  }
  prompt += `\n\nStudent: ${question}\nYou:`;
  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`PollinationsGet ${r.status}`);
  const text = (await r.text()).trim();
  if (!text || text.length < 2) throw new Error('PollinationsGet empty');
  return { provider: 'pollinations-openai', text };
}

async function callPollinationsPost(question, history, mode) {
  const messages = [{ role: 'system', content: hint(mode) }];
  for (const turn of history.slice(-4)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });
  const r = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'openai', private: true }),
  });
  if (!r.ok) throw new Error(`PollinationsPost ${r.status}`);
  const text = (await r.text()).trim();
  if (!text || text.length < 2) throw new Error('PollinationsPost empty');
  return { provider: 'pollinations-post', text };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const t0 = Date.now();
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const question = (body?.question || '').toString().trim();
    const history = Array.isArray(body?.history) ? body.history : [];
    const mode = (body?.mode || 'general').toString().toLowerCase();

    if (!question) return res.status(400).json({ error: 'question is required' });
    if (question.length > 2000) return res.status(400).json({ error: 'question too long (max 2000 chars)' });

    const errors = [];
    const providers = [];
    if (process.env.GOOGLE_API_KEY) providers.push(['gemini', () => withTimeout(callGemini(question, history, mode), 18000, 'gemini')]);
    providers.push(['pollinations-get', () => withTimeout(callPollinationsGet(question, history, mode), 22000, 'pollinations-get')]);
    providers.push(['pollinations-post', () => withTimeout(callPollinationsPost(question, history, mode), 22000, 'pollinations-post')]);

    async function tryAll() {
      return Promise.any(
        providers.map(([name, fn]) =>
          fn().catch((e) => { errors.push(`${name}: ${e.message}`); throw e; })
        )
      ).catch(() => null);
    }

    // First attempt
    let result = await tryAll();
    // One retry after 2s if first attempt failed (Pollinations sometimes rate-limits briefly)
    if (!result) {
      await new Promise(r => setTimeout(r, 2000));
      result = await tryAll();
    }

    if (result) return res.status(200).json({ ok: true, mode, ...result, ms: Date.now() - t0 });
    return res.status(503).json({
      ok: false,
      error: 'AI is busy right now. Try again in 10 seconds — sometimes the free providers rate-limit briefly.',
      tried: errors,
      ms: Date.now() - t0,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, ms: Date.now() - t0 });
  }
};
