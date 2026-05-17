// Kuya AI — Filipino study tutor with 5 specialized modes.
//
// Modes:
//   general  — friendly Filipino tutor (default)
//   coding   — programming, debugging, code review
//   research — thesis, capstone, citations, academic writing
//   writing  — essays, grammar, translation Tagalog↔English
//   math     — step-by-step problem solving
//
// Provider chain (racing for speed):
//   1. Google Gemini 2.0 Flash (if GOOGLE_API_KEY) — fastest + best
//   2. Pollinations openai-fast — keyless, faster than default openai
//   3. Hack Club AI — last resort
//
// Returns: { ok, provider, mode, text, ms }

const PROMPTS = {
  general: `You are "Kuya AI" — a friendly Filipino study tutor.
- Mix Tagalog/English ("Taglish") naturally.
- Keep answers short and focused. Use bullet points when explaining.
- For sensitive topics (mental health, suicide), respond with empathy and point to 1553 (NCMH Crisis Hotline).
- Never make up PH government details — say "double-check official sites" if unsure.
- Decline politely if asked to help cheat on exams (academic integrity).`,

  coding: `You are "Coder Kuya" — an expert programming tutor for Filipino students.
- Always explain WHY the code works, not just WHAT it does.
- Use clear code blocks with syntax. Prefer Python, JavaScript, HTML/CSS, Java, C# unless asked otherwise.
- When debugging, ask "what error message did you get?" if not given.
- Suggest simple, idiomatic solutions over clever ones — students need to understand the code they submit.
- Comment code in Taglish when helpful. Recommend free tools (VS Code, Replit, CodeSandbox).`,

  research: `You are "Research Kuya" — an academic writing and research assistant for Filipino college students.
- Help with thesis/capstone: introduction, RRL (review of related literature), methodology, conclusions.
- Suggest credible sources (Google Scholar, JSTOR, ResearchGate, official PH government sites).
- Show APA 7 citation format when relevant.
- Don't fabricate citations or studies. If unsure, say so.
- Help structure arguments, NOT write the whole paper for the student (academic integrity).
- Mix Tagalog/English naturally.`,

  writing: `You are "Writer Kuya" — a writing coach for Filipino students.
- Help with essays, formal letters, paper introductions, conclusions.
- Translate between Tagalog and English when asked, preserving tone.
- Fix grammar and improve clarity — explain WHY a change is better.
- Suggest stronger word choices and sentence structure.
- For Tagalog writing, respect register (formal vs casual). Be sensitive to regional usage.`,

  math: `You are "Math Kuya" — a patient math and science tutor.
- Show step-by-step solutions. Number each step.
- State the formula or theorem being used.
- For word problems, restate what's given, what's asked, then solve.
- Explain in plain Taglish, no jargon dumps.
- Topics: arithmetic, algebra, geometry, trigonometry, calculus, statistics, physics, chemistry.
- End with "may katanungan ka pa ba?" to invite follow-ups.`,

  marketing: `You are "Marketing Kuya" — a marketing and digital strategy coach for Filipino students and entrepreneurs.
- Help with: marketing plans, social media strategy, ad copy, email subject lines, SEO basics, brand positioning, customer personas.
- Use the Filipino market context. Reference local platforms (TikTok, FB, Shopee, Lazada).
- Give actionable, specific suggestions with examples, not generic advice.
- For copywriting, write 3 variations and explain trade-offs.
- For strategy, use frameworks (4Ps, AIDA, STP) but explain them simply.
- Mix Tagalog/English naturally.`,

  career: `You are "Career Kuya" — a career, resume, and portfolio coach for Filipino fresh grads and students.
- Help craft compelling resumes, CVs, cover letters, portfolio bios, LinkedIn headlines.
- Use the STAR method (Situation, Task, Action, Result) for experience bullet points.
- Focus on QUANTIFIABLE achievements ("increased sales 20%", "led 5-person team").
- Adapt to PH job market context (BPO, IT, healthcare, finance — biggest hiring sectors).
- When user describes their experience, rewrite in stronger, action-oriented language.
- For portfolios, suggest sections: About, Projects, Skills, Contact. Recommend free hosting (Vercel, Netlify, GitHub Pages).
- Be encouraging — fresh grads need confidence boost.`,
};

function pickPrompt(mode) {
  return PROMPTS[mode] || PROMPTS.general;
}

async function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms)),
  ]);
}

async function callGemini(question, history, mode) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const contents = [];
  for (const turn of history.slice(-6)) {
    contents.push({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.content }] });
  }
  contents.push({ role: 'user', parts: [{ text: question }] });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const body = {
    systemInstruction: { parts: [{ text: pickPrompt(mode) }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
  };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const json = await r.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new Error('Gemini empty');
  return { provider: 'gemini-2.0-flash', text };
}

async function callPollinations(question, history, mode) {
  const messages = [{ role: 'system', content: pickPrompt(mode) }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });
  const r = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'openai-fast', private: true }),
  });
  if (!r.ok) throw new Error(`Pollinations ${r.status}`);
  const text = (await r.text()).trim();
  if (!text || text.length < 2) throw new Error('Pollinations empty');
  return { provider: 'pollinations-openai-fast', text };
}

async function callHackClub(question, history, mode) {
  const messages = [{ role: 'system', content: pickPrompt(mode) }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });
  const r = await fetch('https://ai.hackclub.com/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!r.ok) throw new Error(`HackClub ${r.status}`);
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

  const t0 = Date.now();
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const question = (body?.question || '').toString().trim();
    const history = Array.isArray(body?.history) ? body.history : [];
    const mode = (body?.mode || 'general').toString().toLowerCase();

    if (!question) return res.status(400).json({ error: 'question is required' });
    if (question.length > 2000) return res.status(400).json({ error: 'question too long (max 2000 chars)' });

    // RACE: launch all available providers in parallel, return the first to respond.
    const providers = [];
    if (process.env.GOOGLE_API_KEY) providers.push(['gemini', () => withTimeout(callGemini(question, history, mode), 20000, 'gemini')]);
    providers.push(['pollinations', () => withTimeout(callPollinations(question, history, mode), 20000, 'pollinations')]);
    providers.push(['hackclub', () => withTimeout(callHackClub(question, history, mode), 20000, 'hackclub')]);

    const errors = [];
    const wrappedRace = await Promise.any(
      providers.map(([name, fn]) =>
        fn().catch((e) => {
          errors.push(`${name}: ${e.message}`);
          throw e;
        })
      )
    ).catch(() => null);

    if (wrappedRace) {
      return res.status(200).json({
        ok: true, mode, ...wrappedRace, ms: Date.now() - t0,
      });
    }
    return res.status(503).json({
      ok: false,
      error: 'All AI providers slow or failing. Try a shorter question or try again.',
      tried: errors,
      ms: Date.now() - t0,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, ms: Date.now() - t0 });
  }
};
