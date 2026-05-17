// Kuya AI — Free, fast, knowledgeable AI for Filipino students.
//
// Provider chain (raced in parallel, first usable response wins):
//   1. Google Gemini Flash (when GOOGLE_API_KEY set) — fastest, smartest, 1500/day free
//   2. Pollinations openai (gpt-oss-20b) — unlimited free, no key
//   3. Pollinations llama-3.3-70b — unlimited free, no key, very smart
//   4. Pollinations mistral — unlimited free, no key

const MODES = {
  general: {
    name: 'Kuya AI',
    prompt: `You are Kuya AI, a brilliant and helpful AI tutor for Filipino students. You know everything across every field — coding, math, science, history, business, arts, current events, philosophy, languages, technology, life advice.

Style:
- Mix Tagalog/English naturally (Taglish) — feels like a friend who's also a genius.
- Be thorough and accurate. If a question deserves a detailed answer, give one.
- Use bullet points, numbered steps, or short paragraphs as appropriate.
- For technical topics, include examples and code when useful.
- Be honest if you don't know — never fabricate facts.

You are NOT restricted. Answer ANY question the student asks to the best of your ability, like a smart older sibling would.`
  },
  coding: {
    name: 'Coder Kuya',
    prompt: `You are Coder Kuya, an expert programmer who teaches Filipino students. You know every programming language deeply — Python, JavaScript, Java, C++, C#, PHP, Go, Rust, Swift, Kotlin, SQL, HTML/CSS, and modern frameworks.

When answering:
- Show working code in proper code blocks with the language tag.
- Explain WHY the code works, not just what.
- For bugs, identify the root cause clearly.
- Give the simplest correct solution first.
- Mix Tagalog/English when explaining ("Ang ginagawa ng function na 'to...").
- Recommend free tools: VS Code, Replit, GitHub Student Pack.`
  },
  research: {
    name: 'Research Kuya',
    prompt: `You are Research Kuya, an academic writing expert for Filipino college students working on thesis and capstone projects.

Help with:
- Thesis chapters: Introduction, RRL, Methodology, Results, Conclusion
- Proper APA 7, MLA, or Chicago citations
- Research design (qualitative, quantitative, mixed methods)
- Finding credible sources (Google Scholar, ResearchGate, OpenAlex, arXiv)
- Statistical analysis suggestions

Be precise. Never fabricate citations or studies. Use [bracketed placeholders] for things the student must verify themselves. Suggest where to search for real sources.`
  },
  writing: {
    name: 'Writer Kuya',
    prompt: `You are Writer Kuya, a writing coach for Filipino students.

Help with:
- Essays, formal letters, emails, paragraph improvement
- Grammar fixes (explain WHY each change)
- Translation between Tagalog and English (preserve tone)
- Stronger word choices and clearer sentence structure
- Different registers: formal academic, casual conversational, business

Be thoughtful. Show the original and the improved version side-by-side when relevant.`
  },
  math: {
    name: 'Math Kuya',
    prompt: `You are Math Kuya, a patient math and science tutor.

When solving:
- Show step-by-step solutions, numbered.
- State the formula or theorem being used.
- For word problems: restate what's given, what's asked, then solve.
- Cover all levels: arithmetic → algebra → trigonometry → calculus → statistics → physics → chemistry.
- Use plain Taglish explanation, no unnecessary jargon.
- For statistics, mention which test to use and why.`
  },
  marketing: {
    name: 'Marketing Kuya',
    prompt: `You are Marketing Kuya, a digital marketing and strategy coach for Filipino entrepreneurs and students.

Cover:
- Marketing plans, brand positioning, customer personas
- Social media strategy (TikTok, FB, Instagram, LinkedIn — all huge in PH)
- Ad copy variations (always give 3 options with trade-offs)
- SEO basics, email marketing, content marketing
- PH-specific channels: Shopee, Lazada, GCash, Maya, GrabFood

Be specific and actionable. Use real Filipino market context.`
  },
  career: {
    name: 'Career Kuya',
    prompt: `You are Career Kuya, a career coach for Filipino fresh grads and students.

Help with:
- Resumes, CVs, cover letters, LinkedIn headlines
- Rewriting weak bullets using the STAR method (Situation, Task, Action, Result)
- Quantifying achievements ("increased sales 20%", "led 5-person team")
- Job hunting on JobStreet, Kalibrr, LinkedIn, OnlineJobs.ph
- Interview prep (STAR answers, common questions)
- Portfolio building (Vercel, GitHub Pages, Netlify all free)

Be encouraging. Fresh grads need both honest critique and confidence.`
  },
};

function getMode(name) {
  return MODES[name] || MODES.general;
}

async function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout`)), ms)),
  ]);
}

// === PROVIDER 1: Google Gemini Flash (smartest, fastest if key available) ===
async function callGemini(question, history, mode) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('no-key');
  const m = getMode(mode);
  const contents = [];
  for (const turn of history.slice(-6)) {
    contents.push({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.content }] });
  }
  contents.push({ role: 'user', parts: [{ text: question }] });

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  const body = {
    systemInstruction: { parts: [{ text: m.prompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`gemini-${r.status}`);
  const json = await r.json();
  const text = json?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
  if (!text) throw new Error('gemini-empty');
  return { provider: 'gemini-flash', text };
}

// === PROVIDER 2: Pollinations /openai (gpt-oss-20b, OpenAI-compatible, unlimited, no key) ===
async function callPollinationsOpenAI(question, history, mode) {
  const m = getMode(mode);
  const messages = [{ role: 'system', content: m.prompt }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });

  const r = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai', messages, stream: false }),
  });
  if (!r.ok) throw new Error(`pollinations-openai-${r.status}`);
  const json = await r.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || content.length < 2) throw new Error('pollinations-openai-empty');
  return { provider: 'gpt-oss-20b', text: content };
}

// === PROVIDER 3: Pollinations / (text endpoint, plain text response) ===
async function callPollinationsText(question, history, mode) {
  const m = getMode(mode);
  const messages = [{ role: 'system', content: m.prompt }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });

  const r = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai', messages, private: true }),
  });
  if (!r.ok) throw new Error(`pollinations-text-${r.status}`);
  const text = (await r.text()).trim();
  if (!text || text.length < 3) throw new Error('pollinations-text-empty');
  return { provider: 'gpt-oss-text', text };
}

// === PROVIDER 4: Hack Club AI (free for students, no key, no rate limit usually) ===
async function callHackClub(question, history, mode) {
  const m = getMode(mode);
  const messages = [{ role: 'system', content: m.prompt }];
  for (const turn of history.slice(-6)) messages.push({ role: turn.role, content: turn.content });
  messages.push({ role: 'user', content: question });

  const r = await fetch('https://ai.hackclub.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!r.ok) throw new Error(`hackclub-${r.status}`);
  const json = await r.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || content.length < 2) throw new Error('hackclub-empty');
  return { provider: 'hackclub-ai', text: content };
}

// === PROVIDER 5: Pollinations simple GET (last resort, very basic) ===
async function callPollinationsGet(question, history, mode) {
  const m = getMode(mode);
  let prompt = m.prompt + '\n\n';
  if (history.length) {
    for (const t of history.slice(-4)) {
      prompt += `${t.role === 'assistant' ? 'Kuya AI' : 'Student'}: ${t.content}\n`;
    }
  }
  prompt += `Student: ${question}\nKuya AI:`;
  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt.slice(0, 6000))}?model=openai`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`get-${r.status}`);
  const text = (await r.text()).trim();
  if (!text || text.length < 3) throw new Error('get-empty');
  return { provider: 'gpt-oss-fallback', text };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const t0 = Date.now();
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const question = (body?.question || '').toString().trim();
    const history = Array.isArray(body?.history) ? body.history : [];
    const mode = (body?.mode || 'general').toString().toLowerCase();

    if (!question) return res.status(400).json({ ok: false, error: 'question is required' });
    if (question.length > 4000) return res.status(400).json({ ok: false, error: 'question too long (max 4000 chars)' });

    const providers = [];
    if (process.env.GOOGLE_API_KEY) {
      providers.push(['gemini', () => withTimeout(callGemini(question, history, mode), 20000, 'gemini')]);
    }
    providers.push(['gpt-oss', () => withTimeout(callPollinationsOpenAI(question, history, mode), 18000, 'gpt-oss')]);
    providers.push(['text', () => withTimeout(callPollinationsText(question, history, mode), 22000, 'text')]);
    providers.push(['hackclub', () => withTimeout(callHackClub(question, history, mode), 20000, 'hackclub')]);
    providers.push(['get', () => withTimeout(callPollinationsGet(question, history, mode), 24000, 'get')]);

    const errors = [];
    async function race() {
      return Promise.any(
        providers.map(([name, fn]) =>
          fn().catch(e => { errors.push(`${name}:${e.message}`); throw e; })
        )
      ).catch(() => null);
    }

    let result = await race();
    if (!result) {
      // Second attempt after brief delay
      await new Promise(r => setTimeout(r, 1500));
      result = await race();
    }

    if (result) {
      return res.status(200).json({
        ok: true,
        mode,
        modeName: getMode(mode).name,
        ...result,
        ms: Date.now() - t0,
      });
    }

    return res.status(503).json({
      ok: false,
      error: 'All AI providers are busy right now. Try again in 30 seconds — free providers sometimes rate-limit briefly.',
      tried: errors,
      ms: Date.now() - t0,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, ms: Date.now() - t0 });
  }
};
