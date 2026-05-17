/* PH StudentKit — comprehensive front-end JS (no framework).
   Sections: theme, mobile menu, hero copy, try-it, AI chat with 7 modes,
   AI image gen, idea improver, resume builder, portfolio builder,
   GPA calc, Pomodoro, currency, word counter, citation, trivia,
   stats counter, free-office loader, FAB. */

const API_BASE = window.location.origin;
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function colorizeJson(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
      let cls = 'num';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'key' : 'str';
      else if (/true|false/.test(m)) cls = 'bool';
      else if (/null/.test(m)) cls = 'null';
      return `<span class="${cls}">${m}</span>`;
    });
}

function toast(msg, ms = 2000) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), ms);
}

async function callAI({ question, mode = 'general', history = [] }) {
  const r = await fetch(API_BASE + '/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode, history }),
  });
  return r.json();
}

// ===================== Language picker (i18n) =====================
const I18N = {
  en: {
    'nav.start': 'Start',
    'nav.ai': 'Kuya AI',
    'nav.tools': 'Tools',
    'nav.apis': 'APIs',
    'nav.code': 'Code',
    'nav.office': 'Office',
    'nav.cloud': 'Cloud',
    'nav.courses': 'Courses',
    'hero.pill': 'Live · 5 AI tutors · 13+ APIs · 7+ tools — all free',
    'hero.title1': 'Everything you need,',
    'hero.title2': 'in one free platform.',
    'hero.subtitle': '<strong>PH StudentKit</strong> — free APIs, free AI tutor (Kuya AI), free study tools (GPA, Pomodoro, currency converter), and a legal way to get Microsoft Office. Built for Filipino students working on thesis, capstone, or assignments.',
    'hero.cta1': 'Ask Kuya AI ✨',
    'hero.cta2': 'Try the tools',
    'hero.cta3': 'Quick Start →',
    'stats.apis': 'Free APIs',
    'stats.tools': 'Free tools',
    'stats.scholarships': 'Scholarships',
    'stats.answers': 'Kuya AI answers',
  },
  tl: {
    'nav.start': 'Simula',
    'nav.ai': 'Kuya AI',
    'nav.tools': 'Mga Kagamitan',
    'nav.apis': 'Mga API',
    'nav.code': 'Code',
    'nav.office': 'Office',
    'nav.cloud': 'Cloud',
    'nav.courses': 'Mga Kurso',
    'hero.pill': 'Buhay · 5 AI tutors · 13+ APIs · 7+ kagamitan — libre lahat',
    'hero.title1': 'Lahat ng kailangan mo,',
    'hero.title2': 'sa isang libreng plataporma.',
    'hero.subtitle': '<strong>PH StudentKit</strong> — libreng API, libreng AI tutor (Kuya AI), libreng pang-aaral na kagamitan (GPA, Pomodoro, currency converter), at legal na paraan para makuha ang Microsoft Office. Ginawa para sa mga estudyanteng Pilipino na nagtatrabaho sa thesis, capstone, o mga takdang-aralin.',
    'hero.cta1': 'Tanungin si Kuya AI ✨',
    'hero.cta2': 'Subukan ang mga kagamitan',
    'hero.cta3': 'Magsimula →',
    'stats.apis': 'Libreng API',
    'stats.tools': 'Libreng kagamitan',
    'stats.scholarships': 'Iskolarship',
    'stats.answers': 'Sagot ni Kuya AI',
  },
  ceb: {
    'nav.start': 'Sugod',
    'nav.ai': 'Kuya AI',
    'nav.tools': 'Mga Galamiton',
    'nav.apis': 'Mga API',
    'nav.code': 'Code',
    'nav.office': 'Office',
    'nav.cloud': 'Cloud',
    'nav.courses': 'Mga Kurso',
    'hero.pill': 'Buhi · 5 AI tutors · 13+ APIs · 7+ galamiton — libre tanan',
    'hero.title1': 'Tanan nga imong gikinahanglan,',
    'hero.title2': 'sa usa ka libreng plataporma.',
    'hero.subtitle': '<strong>PH StudentKit</strong> — libreng API, libreng AI tutor (Kuya AI), libreng panghimuong galamiton (GPA, Pomodoro, currency converter), ug legal nga paagi aron makuha ang Microsoft Office. Gihimo para sa mga estudyanteng Pilipino nga nagtrabaho sa ilang thesis, capstone, o mga buluhaton.',
    'hero.cta1': 'Pangutan-a si Kuya AI ✨',
    'hero.cta2': 'Sulayi ang mga galamiton',
    'hero.cta3': 'Magsugod →',
    'stats.apis': 'Libreng API',
    'stats.tools': 'Libreng galamiton',
    'stats.scholarships': 'Iskolarship',
    'stats.answers': 'Tubag ni Kuya AI',
  },
  tag: { // Taglish (mix Tagalog + English naturally)
    'nav.start': 'Start',
    'nav.ai': 'Kuya AI',
    'nav.tools': 'Tools',
    'nav.apis': 'APIs',
    'nav.code': 'Code',
    'nav.office': 'Office',
    'nav.cloud': 'Cloud',
    'nav.courses': 'Courses',
    'hero.pill': 'Live · 5 AI tutors · 13+ APIs · 7+ tools — lahat libre',
    'hero.title1': 'Lahat ng kailangan mo,',
    'hero.title2': 'in one free platform.',
    'hero.subtitle': '<strong>PH StudentKit</strong> — free APIs, free AI tutor (Kuya AI), free study tools (GPA, Pomodoro, currency converter), at legal way para sa MS Office. Para sa mga Filipino students na may thesis, capstone, o assignment.',
    'hero.cta1': 'I-ask si Kuya AI ✨',
    'hero.cta2': 'I-try mga tools',
    'hero.cta3': 'Quick Start →',
    'stats.apis': 'Free APIs',
    'stats.tools': 'Free tools',
    'stats.scholarships': 'Scholarships',
    'stats.answers': 'Sagot ni Kuya AI',
  },
};

const LANG_LABELS = { en: 'EN', tl: 'TL', ceb: 'CEB', tag: 'TAG' };

function applyLang(lang) {
  if (!I18N[lang]) lang = 'en';
  const dict = I18N[lang];
  document.documentElement.setAttribute('lang', lang === 'tl' ? 'fil' : lang === 'ceb' ? 'ceb' : 'en');
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.innerHTML = dict[key];
  });
  const cur = $('#lang-current');
  if (cur) cur.textContent = LANG_LABELS[lang] || 'EN';
  $$('.lang-opt').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  try { localStorage.setItem('lang', lang); } catch {}
}

(function setupLang() {
  const btn = $('#lang-btn');
  const menu = $('#lang-menu');
  if (!btn || !menu) return;

  // Restore saved or detect browser
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch {}
  if (!saved) {
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('fil') || nav.startsWith('tl')) saved = 'tl';
    else if (nav.startsWith('ceb')) saved = 'ceb';
    else saved = 'en';
  }
  applyLang(saved);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  $$('.lang-opt').forEach(opt => opt.addEventListener('click', () => {
    applyLang(opt.dataset.lang);
    menu.hidden = true;
  }));
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) menu.hidden = true;
  });
})();

// ===================== Theme toggle =====================
(function setupTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
  });
})();

// ===================== Mobile menu =====================
(function setupMenu() {
  const btn = $('#menu-btn');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

// ===================== Hero copy =====================
(function setupHeroCopy() {
  const copyBtn = $('#hero-copy'), heroUrl = $('#hero-url');
  if (!copyBtn || !heroUrl) return;
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(heroUrl.value); } catch { heroUrl.select(); document.execCommand('copy'); }
    const label = copyBtn.querySelector('span');
    const original = label.textContent;
    label.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => { label.textContent = original; copyBtn.classList.remove('copied'); }, 1500);
  });
})();

// ===================== Try-it demo =====================
(function setupTry() {
  const sel = $('#try-endpoint'), btn = $('#try-send'), out = $('#try-output');
  if (!sel || !btn || !out) return;
  async function run() {
    const path = sel.value;
    out.innerHTML = `<code class="null">// GET ${path}\n// loading…</code>`;
    const t0 = performance.now();
    try {
      const res = await fetch(API_BASE + path);
      const data = await res.json();
      const ms = Math.round(performance.now() - t0);
      out.innerHTML = `<code><span class="null">// ${res.status} OK · ${ms}ms</span>\n${colorizeJson(data)}</code>`;
    } catch (e) {
      out.innerHTML = `<code class="err">// Error: ${e.message}</code>`;
    }
  }
  btn.addEventListener('click', run);
  sel.addEventListener('change', run);
  run();
  $$('.endpoint-card').forEach(card => {
    const ep = card.dataset.endpoint;
    if (!ep) return;
    card.addEventListener('click', () => {
      const opt = [...sel.options].find(o => o.value === ep);
      if (opt) { sel.value = ep; run(); }
      $('#try').scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

// ===================== AI Chat with modes =====================
(function setupAI() {
  const chat = $('#ai-chat');
  const form = $('#ai-form');
  const input = $('#ai-input');
  const sendBtn = $('#ai-send');
  const chipsEl = $('#ai-chips');
  const intro = $('#ai-intro');
  if (!chat || !form || !input) return;

  let mode = 'general';
  let history = [];

  const CHIPS_BY_MODE = {
    general: [
      ['5 capstone ideas (tourism)', 'Bigyan mo ako ng 5 capstone project ideas using web development para sa tourism management.'],
      ['Thesis vs capstone?', 'Anong difference ng thesis at capstone project?'],
      ['Translate to English', "Translate to formal English: 'Sir, pa-extend po ng deadline namin.'"],
      ['Generate a quiz', 'Generate a 5-question quiz about Philippine history for college students.'],
    ],
    coding: [
      ['Debug a Python error', 'Bakit error to: TypeError: list indices must be integers or slices, not str?'],
      ['Explain JS async/await', 'Explain JavaScript async/await in simple Taglish with example.'],
      ['Build a CRUD app', 'How to build a simple CRUD app in PHP + MySQL? Step by step.'],
      ['Fix my code', 'Review this code and tell me what to improve: function add(a, b) { return a + b }'],
    ],
    research: [
      ['Write a thesis intro', 'Help me write a 1-paragraph intro for thesis about tourism in Misamis Oriental.'],
      ['Methodology section', 'Outline a quantitative research methodology section.'],
      ['Find related literature', 'Suggest 5 good sources for capstone about online enrollment systems sa PH.'],
      ['Format APA citation', 'Format this in APA 7: Smith J, 2023, Tourism in Asia, Routledge.'],
    ],
    writing: [
      ['Improve essay paragraph', 'Improve this paragraph: "Education is important because it makes people smart and helps the country."'],
      ['Translate to Tagalog', 'Translate to formal Tagalog: The internet has changed how we learn.'],
      ['Write formal letter', 'Write a formal letter requesting deadline extension from professor.'],
      ['Fix grammar', 'Fix grammar: "Me and my classmates was going to library to studying for exam."'],
    ],
    math: [
      ['Solve quadratic', 'Solve step by step: x² - 5x + 6 = 0'],
      ['Explain derivatives', 'Explain calculus derivatives in simple Taglish with example.'],
      ['Probability problem', 'A box has 5 red balls and 3 blue. What is P(red)? Show steps.'],
      ['Standard deviation', 'How to compute standard deviation? Show with sample data 10, 12, 15, 18, 20.'],
    ],
    marketing: [
      ['Tiktok strategy', '5 actionable TikTok strategies for a small Cagayan de Oro coffee shop.'],
      ['Write FB ad copy', 'Write 3 FB ad copy variations for a milk tea promo, target college students.'],
      ['Email subject lines', 'Give me 10 high-open-rate email subject lines for a back-to-school promo.'],
      ['Define target persona', 'Help me define target persona for a vegan food delivery in Metro Manila.'],
    ],
    career: [
      ['Improve resume bullet', 'Improve this bullet: "I helped with the school enrollment system."'],
      ['Write LinkedIn headline', 'Write a strong LinkedIn headline for fresh BSCS grad from USTP looking for backend job.'],
      ['Cover letter intro', 'Write a 1-paragraph cover letter intro for a BPO QA Analyst role.'],
      ['Interview question prep', "Prep me for 'Tell me about yourself' as fresh grad applying for software developer."],
    ],
  };

  function renderChips() {
    chipsEl.innerHTML = '';
    (CHIPS_BY_MODE[mode] || []).forEach(([label, q]) => {
      const b = document.createElement('button');
      b.className = 'ai-chip';
      b.dataset.q = q;
      b.textContent = label;
      b.addEventListener('click', () => ask(q));
      chipsEl.appendChild(b);
    });
  }

  function append(role, text, isLoading = false) {
    const msg = document.createElement('div');
    msg.className = `ai-msg ai-msg-${role === 'user' ? 'user' : 'bot'}`;
    msg.innerHTML = `<div class="ai-avatar">${role === 'user' ? 'Me' : 'K'}</div><div class="ai-bubble ${isLoading ? 'loading' : ''}"></div>`;
    msg.querySelector('.ai-bubble').textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
    return msg.querySelector('.ai-bubble');
  }

  async function ask(question) {
    input.value = '';
    append('user', question);
    history.push({ role: 'user', content: question });
    const loadingBubble = append('bot', '', true);
    sendBtn.disabled = true;
    try {
      const json = await callAI({ question, mode, history: history.slice(-6) });
      loadingBubble.classList.remove('loading');
      if (json.ok && json.text) {
        loadingBubble.textContent = json.text;
        history.push({ role: 'assistant', content: json.text });
      } else {
        loadingBubble.textContent = json.error || 'Sorry, may error. Try again.';
        loadingBubble.style.color = 'var(--danger)';
      }
    } catch (e) {
      loadingBubble.classList.remove('loading');
      loadingBubble.textContent = 'Network error. Check your connection and try again.';
      loadingBubble.style.color = 'var(--danger)';
    }
    sendBtn.disabled = false;
    input.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) ask(q);
  });

  // Mode tab switching
  $$('.ai-mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.ai-mode-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      mode = tab.dataset.mode;
      history = [];
      chat.innerHTML = '';
      const greetings = {
        general: ["Hi! I'm Kuya AI 👋", "Ask me anything — Tagalog, English, or Taglish."],
        coding: ["Coder Kuya here 💻", "Paste your code or describe the bug. I'll explain in clear Taglish."],
        research: ["Research Kuya here 📚", "I'll help with thesis/capstone — intro, RRL, methodology. May citations din."],
        writing: ["Writer Kuya here ✍️", "Send me anything to fix — essays, emails, translations. Tagalog↔English OK."],
        math: ["Math Kuya here 🧮", "Show me the problem. I'll solve step-by-step with formulas."],
        marketing: ["Marketing Kuya here 📣", "Need ad copy? Strategy? Brand positioning? Let's grow your business."],
        career: ["Career Kuya here 💼", "Resume, cover letter, LinkedIn — let's make you stand out for hiring."],
      };
      const [title, sub] = greetings[mode] || greetings.general;
      append('bot', '');
      const b = chat.querySelector('.ai-bubble:last-of-type');
      b.innerHTML = `<strong>${title}</strong>\n${sub}`;
      renderChips();
      input.focus();
    });
  });

  renderChips();

  const fab = $('#fab-ai');
  if (fab) fab.addEventListener('click', () => {
    $('#ai').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => input.focus(), 600);
  });
})();

// ===================== AI Image Generator =====================
(function setupImageGen() {
  const form = $('#img-form');
  const promptEl = $('#img-prompt');
  const out = $('#img-output');
  if (!form || !promptEl || !out) return;

  function generate(prompt) {
    if (!prompt) return;
    const seed = Date.now();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&seed=${seed}&nologo=true`;
    out.innerHTML = `
      <div class="img-output-card">
        <img src="${url}" alt="${prompt}" loading="lazy" />
        <div class="img-meta">
          <span>"${prompt}"</span>
          <a href="${url}" target="_blank" rel="noopener" download="ai-image.jpg">Download →</a>
        </div>
      </div>`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    generate(promptEl.value.trim());
  });

  $$('.img-chip').forEach(chip => chip.addEventListener('click', () => {
    promptEl.value = chip.dataset.p;
    generate(chip.dataset.p);
  }));
})();

// ===================== Idea Improver =====================
(function setupIdeaBuilder() {
  const input = $('#idea-input');
  const btn = $('#idea-go');
  const out = $('#idea-output');
  if (!input || !btn || !out) return;
  btn.addEventListener('click', async () => {
    const idea = input.value.trim();
    if (!idea) { toast('Type your idea first'); return; }
    btn.disabled = true;
    btn.textContent = 'Improving... (10-15s)';
    out.hidden = false;
    out.textContent = 'Thinking...';
    const json = await callAI({
      question: `Here's my idea: "${idea}"\n\nGive me: (1) a sharper version of this idea in 1 sentence, (2) 3 specific improvements, (3) main risks or what could go wrong, (4) 3 immediate next steps I can do this week. Use clear Taglish.`,
      mode: 'general',
    });
    out.textContent = json.ok ? json.text : (json.error || 'AI unavailable.');
    btn.disabled = false;
    btn.textContent = 'Improve my idea ✨';
  });
})();

// ===================== Resume Builder (4 templates) =====================
(function setupResumeBuilder() {
  const btn = $('#r-go');
  const wrap = $('#r-preview-wrap');
  const iframe = $('#r-preview');
  const actions = $('#r-actions');
  if (!btn || !iframe) return;

  let template = 'modern';
  let lastFullDoc = '';

  // Template picker
  $$('[data-rtpl]').forEach(opt => opt.addEventListener('click', () => {
    $$('[data-rtpl]').forEach(o => { o.classList.remove('active'); o.setAttribute('aria-checked', 'false'); });
    opt.classList.add('active');
    opt.setAttribute('aria-checked', 'true');
    template = opt.dataset.rtpl;
  }));

  function parseMarkdown(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const safe = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    let html = '';
    let inList = false;
    for (const line of lines) {
      const t = line.trim();
      if (/^#\s+/.test(t)) { if (inList) { html += '</ul>'; inList = false; } html += `<h1>${safe(t.replace(/^#\s+/, ''))}</h1>`; }
      else if (/^##\s+/.test(t)) { if (inList) { html += '</ul>'; inList = false; } html += `<h2>${safe(t.replace(/^##\s+/, ''))}</h2>`; }
      else if (/^[-*•]\s+/.test(t)) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${safe(t.replace(/^[-*•]\s+/, ''))}</li>`; }
      else { if (inList) { html += '</ul>'; inList = false; } html += `<p>${safe(t)}</p>`; }
    }
    if (inList) html += '</ul>';
    return html;
  }

  function buildResumeDoc(template, contentHtml) {
    const styles = {
      modern: `
        body { font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #0F172A; line-height: 1.55; }
        h1 { font-size: 32px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.02em; }
        h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #0038A8; margin-top: 24px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid #0038A8; font-weight: 700; }
        p { margin-bottom: 6px; }
        ul { margin-left: 20px; margin-bottom: 8px; }
        li { margin-bottom: 4px; }
      `,
      classic: `
        body { font-family: 'Georgia', 'Times New Roman', serif; max-width: 760px; margin: 40px auto; padding: 40px; color: #1a1a1a; line-height: 1.55; }
        h1 { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 4px; letter-spacing: 0.02em; }
        h1 + p { text-align: center; color: #555; font-size: 13px; margin-bottom: 24px; }
        h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 24px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #000; font-weight: 700; }
        p { margin-bottom: 6px; font-size: 14px; }
        ul { margin-left: 24px; margin-bottom: 8px; }
        li { margin-bottom: 4px; font-size: 14px; }
      `,
      creative: `
        body { font-family: 'Inter', sans-serif; max-width: 900px; margin: 40px auto; padding: 0; color: #0F172A; line-height: 1.55; display: grid; grid-template-columns: 240px 1fr; min-height: 90vh; background: #fff; }
        .side { background: linear-gradient(180deg, #1e293b, #0f172a); color: #f1f5f9; padding: 40px 24px; }
        .main { padding: 40px; }
        h1 { font-size: 26px; font-weight: 800; margin-bottom: 4px; color: #fff; }
        h1 + p { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
        h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #fcd116; margin-top: 24px; margin-bottom: 10px; font-weight: 700; }
        .main h2 { color: #0038A8; border-bottom: 2px solid #0038A8; padding-bottom: 4px; }
        p { margin-bottom: 6px; font-size: 14px; }
        .side p { color: #cbd5e1; font-size: 13px; }
        ul { margin-left: 20px; margin-bottom: 8px; }
        li { margin-bottom: 4px; font-size: 14px; }
      `,
      minimal: `
        body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #0F172A; line-height: 1.45; }
        h1 { font-size: 24px; font-weight: 600; margin-bottom: 2px; }
        h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #525252; margin-top: 20px; margin-bottom: 8px; font-weight: 600; }
        p { margin-bottom: 4px; font-size: 13px; }
        ul { margin-left: 18px; margin-bottom: 6px; }
        li { margin-bottom: 3px; font-size: 13px; }
      `,
    };

    if (template === 'creative') {
      // Split content into side+main heuristic: first h1+p go to side, contact goes to side, rest in main
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><style>${styles[template]}@media print{body{margin:0;padding:0;}}@media (max-width:640px){body{grid-template-columns:1fr!important;}.side{padding:24px;}.main{padding:24px;}}</style></head><body><div class="side">${contentHtml.split('</h2>').slice(0, 2).join('</h2>')}</div><div class="main">${contentHtml.split('</h2>').slice(2).join('</h2>')}</div></body></html>`;
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Georgia&display=swap" rel="stylesheet"><style>${styles[template]}@media print{body{margin:0;padding:24px;}}</style></head><body>${contentHtml}</body></html>`;
  }

  btn.addEventListener('click', async () => {
    const name = $('#r-name').value.trim() || 'Your Name';
    const title = $('#r-title').value.trim();
    const email = $('#r-email').value.trim();
    const phone = $('#r-phone').value.trim();
    const location = $('#r-location').value.trim();
    const links = $('#r-links').value.trim();
    const edu = $('#r-edu').value.trim();
    const exp = $('#r-exp').value.trim();
    const skills = $('#r-skills').value.trim();

    if (!exp && !edu) { toast('Add education or experience first'); return; }

    btn.disabled = true;
    btn.textContent = 'AI polishing... (10-20s)';

    const contactLine = [email, phone, location, links].filter(Boolean).join(' · ');
    const prompt = `Format this person into a polished one-page resume using markdown.

USE EXACTLY this format (these section markers):
# ${name}
${title}
${contactLine}

## SUMMARY
[2-sentence professional summary]

## EDUCATION
- [education in clean bullets]

## EXPERIENCE
- [Each role as 2-4 strong action-oriented bullets, STAR method, quantify when possible]

## SKILLS
[Grouped skills, comma-separated]

INPUT:
Education: ${edu}
Experience/Projects: ${exp}
Skills: ${skills}`;

    const json = await callAI({ question: prompt, mode: 'career' });
    if (json.ok && json.text) {
      const contentHtml = parseMarkdown(json.text);
      lastFullDoc = buildResumeDoc(template, contentHtml);
      iframe.srcdoc = lastFullDoc;
      wrap.hidden = false;
      actions.hidden = false;
      actions.style.display = 'grid';
      toast('Resume generated! Preview below.');
    } else {
      toast('AI unavailable. Try again.');
    }
    btn.disabled = false;
    btn.textContent = 'Generate resume ✨';
  });

  $('#r-pdf')?.addEventListener('click', () => {
    const w = window.open('', '_blank');
    w.document.write(lastFullDoc.replace('</body>', '<script>setTimeout(()=>window.print(),500);<\/script></body>'));
  });

  $('#r-word')?.addEventListener('click', () => {
    const blob = new Blob([lastFullDoc], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resume.doc';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded resume.doc');
  });
})();

// ===================== Portfolio Builder (4 templates incl. dark-glow) =====================
(function setupPortfolioBuilder() {
  const btn = $('#p-go');
  const wrap = $('#p-preview-wrap');
  const iframe = $('#p-preview');
  if (!btn || !iframe) return;

  let tpl = 'dark-glow';
  let lastDoc = '';

  $$('[data-tpl]').forEach(opt => opt.addEventListener('click', () => {
    $$('[data-tpl]').forEach(o => { o.classList.remove('active'); o.setAttribute('aria-checked', 'false'); });
    opt.classList.add('active');
    opt.setAttribute('aria-checked', 'true');
    tpl = opt.dataset.tpl;
  }));

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function parseProjects(text) {
    return text.split('\n').filter(l => l.trim()).map(l => {
      const parts = l.split(':').map(s => (s || '').trim());
      return { name: parts[0] || 'Project', desc: parts[1] || '', tech: parts[2] || '' };
    });
  }
  function normalizeLinks(links) {
    return links.split(',').map(l => l.trim()).filter(Boolean).map(l => ({
      url: l.startsWith('http') ? l : 'https://' + l,
      label: l.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    }));
  }
  function iconForLink(label) {
    const l = label.toLowerCase();
    if (l.includes('github')) return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.39.97.01 1.95.13 2.86.39 2.19-1.48 3.15-1.17 3.15-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .31.21.67.8.55 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z"/></svg>';
    if (l.includes('linkedin')) return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>';
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>';
  }

  function buildDarkGlow(d) {
    const projHtml = d.projects.map(p => `<div class="proj"><div class="proj-glow"></div><h3>${escapeHtml(p.name)}</h3>${p.desc ? `<p>${escapeHtml(p.desc)}</p>` : ''}${p.tech ? `<div class="proj-tech">${escapeHtml(p.tech)}</div>` : ''}</div>`).join('');
    const skillsHtml = d.skills.length ? d.skills.map(s => `<span class="skill-pill">${escapeHtml(s)}</span>`).join('') : '';
    const linksHtml = d.links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener" title="${escapeHtml(l.label)}">${iconForLink(l.label)}</a>`).join('');
    const contactHtml = [
      d.phone ? `<div class="cb">📞 ${escapeHtml(d.phone)}</div>` : '',
      d.email ? `<div class="cb">✉ <a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></div>` : '',
      d.location ? `<div class="cb">📍 ${escapeHtml(d.location)}</div>` : '',
    ].join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(d.name)} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root { --bg: #050816; --fg: #f1f5f9; --muted: #94a3b8; --p1: #06b6d4; --p2: #8b5cf6; --p3: #ec4899; --accent: #fbbf24; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; overflow-x: hidden; }
body::before { content: ''; position: fixed; inset: 0; background:
  radial-gradient(circle at 20% 30%, rgba(139,92,246,0.15), transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(6,182,212,0.12), transparent 50%),
  radial-gradient(circle at 50% 80%, rgba(236,72,153,0.10), transparent 50%); z-index: -1; pointer-events: none; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
header.top { padding: 24px 0; display: flex; justify-content: space-between; align-items: center; }
.brand { font-weight: 800; font-size: 20px; background: linear-gradient(120deg, var(--p1), var(--p2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.nav { display: flex; gap: 8px; }
.nav a { padding: 8px 16px; border-radius: 999px; color: var(--muted); font-weight: 500; font-size: 14px; transition: all 200ms ease; }
.nav a:hover { color: var(--fg); background: rgba(255,255,255,0.05); }
.nav a.active { background: linear-gradient(135deg, var(--p2), var(--p3)); color: white; }
@media (max-width: 768px) { .nav { display: none; } }
.hero { padding: 60px 0 80px; display: grid; grid-template-columns: 1fr; gap: 60px; align-items: center; }
@media (min-width: 900px) { .hero { grid-template-columns: 1fr auto; gap: 80px; } }
.status { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 999px; background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.30); color: #4ade80; font-size: 14px; font-weight: 500; margin-bottom: 24px; }
.status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 12px #4ade80; }
h1 { font-size: clamp(40px, 6vw, 64px); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 16px; }
h1 .grad { background: linear-gradient(120deg, var(--p1), var(--p2), var(--p3)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.role { font-size: clamp(20px, 2.5vw, 28px); font-weight: 600; color: var(--p1); margin-bottom: 24px; }
.about { font-size: 16px; color: var(--muted); margin-bottom: 32px; max-width: 540px; line-height: 1.7; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; max-width: 540px; }
.stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; backdrop-filter: blur(10px); }
.stat-num { font-size: 28px; font-weight: 800; color: var(--p1); background: linear-gradient(135deg, var(--p1), var(--p2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
.ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; text-decoration: none; transition: all 200ms ease; }
.btn-primary { background: linear-gradient(135deg, var(--p2), var(--p3)); color: white; box-shadow: 0 0 30px rgba(139,92,246,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(139,92,246,0.6); }
.btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: var(--fg); }
.btn-secondary:hover { background: rgba(255,255,255,0.10); }
.contact-row { display: flex; flex-wrap: wrap; gap: 24px; font-size: 14px; color: var(--muted); }
.cb a { color: var(--p1); }
.photo-wrap { position: relative; width: 280px; height: 280px; justify-self: center; }
@media (min-width: 1024px) { .photo-wrap { width: 360px; height: 360px; } }
.photo-wrap::before { content: ''; position: absolute; inset: -8px; border-radius: 50%; background: linear-gradient(135deg, var(--p1), var(--p2), var(--p3)); opacity: 0.6; filter: blur(20px); z-index: 0; animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.photo { position: relative; width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 4px solid rgba(255,255,255,0.1); z-index: 1; background: linear-gradient(135deg, var(--p2), var(--p3)); display: flex; align-items: center; justify-content: center; font-size: 80px; font-weight: 800; color: white; }
.photo img { width: 100%; height: 100%; object-fit: cover; }
.socials { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 2; }
.socials a { width: 44px; height: 44px; border-radius: 50%; background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: var(--fg); backdrop-filter: blur(10px); transition: all 200ms ease; }
.socials a:hover { background: var(--p2); transform: translateY(-2px); }
section.s { padding: 60px 0; }
section.s h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--p1); margin-bottom: 8px; font-weight: 700; }
section.s .h2-big { font-size: clamp(28px, 4vw, 40px); font-weight: 800; margin-bottom: 32px; letter-spacing: -0.02em; }
.projects { display: grid; gap: 20px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .projects { grid-template-columns: 1fr 1fr; } }
.proj { position: relative; padding: 28px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(10px); transition: all 200ms ease; overflow: hidden; }
.proj:hover { transform: translateY(-4px); border-color: var(--p2); }
.proj-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 50%); opacity: 0; transition: opacity 300ms ease; }
.proj:hover .proj-glow { opacity: 1; }
.proj h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--fg); position: relative; }
.proj p { color: var(--muted); font-size: 14px; line-height: 1.6; position: relative; }
.proj-tech { margin-top: 12px; font-family: monospace; font-size: 12px; color: var(--p1); position: relative; }
.skills { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-pill { padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); border-radius: 999px; font-size: 13px; font-weight: 500; color: var(--fg); transition: all 200ms ease; }
.skill-pill:hover { background: var(--p2); border-color: var(--p2); }
footer { padding: 40px 0; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; color: var(--muted); font-size: 13px; }
</style></head><body>
<div class="container">
<header class="top">
  <div class="brand">${escapeHtml(d.name.split(' ').map(s => s[0]).join(''))} ${escapeHtml(d.name.split(' ').slice(-1)[0])}</div>
  <nav class="nav">
    <a href="#home" class="active">Home</a>
    <a href="#about">About</a>
    ${d.projects.length ? '<a href="#projects">Projects</a>' : ''}
    ${d.skills.length ? '<a href="#skills">Skills</a>' : ''}
    <a href="#contact">Contact</a>
  </nav>
</header>

<section class="hero" id="home">
  <div>
    ${d.status ? `<div class="status">${escapeHtml(d.status)}</div>` : ''}
    <h1>Hi, I'm <span class="grad">${escapeHtml(d.name)}</span></h1>
    <div class="role">${escapeHtml(d.role)}</div>
    ${d.about ? `<p class="about">${escapeHtml(d.about)}</p>` : ''}
    ${d.stats.length ? `<div class="stats">${d.stats.map(s => `<div class="stat"><div class="stat-num">${escapeHtml(s.num)}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`).join('')}</div>` : ''}
    <div class="ctas">
      ${d.email ? `<a href="mailto:${escapeHtml(d.email)}" class="btn btn-primary">✉ Hire Me</a>` : ''}
      ${d.projects.length ? `<a href="#projects" class="btn btn-secondary">📁 View Projects</a>` : ''}
    </div>
    <div class="contact-row">${contactHtml}</div>
  </div>
  <div class="photo-wrap">
    <div class="photo">${d.photo ? `<img src="${escapeHtml(d.photo)}" alt="${escapeHtml(d.name)}" />` : escapeHtml(d.name.split(' ').map(s => s[0]).join('').slice(0, 2))}</div>
    ${linksHtml ? `<div class="socials">${linksHtml}</div>` : ''}
  </div>
</section>

${d.about ? `<section class="s" id="about"><div class="container"><h2>About</h2><h3 class="h2-big">A bit about me</h3><p style="font-size:17px;color:var(--muted);max-width:720px;line-height:1.8;">${escapeHtml(d.about)}</p></div></section>` : ''}

${d.projects.length ? `<section class="s" id="projects"><h2>Portfolio</h2><h3 class="h2-big">Recent projects</h3><div class="projects">${projHtml}</div></section>` : ''}

${d.skills.length ? `<section class="s" id="skills"><h2>Skills</h2><h3 class="h2-big">What I work with</h3><div class="skills">${skillsHtml}</div></section>` : ''}

<section class="s" id="contact"><h2>Get in touch</h2><h3 class="h2-big">Let's build something together</h3>
<div class="contact-row">${contactHtml}</div>
${d.email ? `<div style="margin-top:24px;"><a href="mailto:${escapeHtml(d.email)}" class="btn btn-primary">✉ Send an email</a></div>` : ''}
</section>

<footer>© ${new Date().getFullYear()} ${escapeHtml(d.name)} · Hosted free on Vercel · Built with PH StudentKit</footer>
</div></body></html>`;
  }

  function buildPhPride(d) {
    const projHtml = d.projects.map(p => `<div class="proj"><h3>${escapeHtml(p.name)}</h3>${p.desc ? `<p>${escapeHtml(p.desc)}</p>` : ''}${p.tech ? `<div class="tech">${escapeHtml(p.tech)}</div>` : ''}</div>`).join('');
    const linksHtml = d.links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank">${escapeHtml(l.label)}</a>`).join(' · ');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(d.name)} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #fff; color: #0f172a; line-height: 1.6; }
.container { max-width: 900px; margin: 0 auto; padding: 24px; }
.stripes { display: flex; height: 6px; margin-bottom: 40px; }
.stripes div { flex: 1; }
.s1 { background: #0038A8; } .s2 { background: #CE1126; } .s3 { background: #FCD116; }
header { padding: 40px 0; }
h1 { font-size: clamp(36px, 6vw, 56px); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; }
h1 .grad { background: linear-gradient(120deg, #0038A8, #CE1126, #FCD116); -webkit-background-clip: text; color: transparent; }
.role { font-size: 20px; color: #475569; margin-top: 12px; }
section { margin-bottom: 48px; }
h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #0038A8; margin-bottom: 16px; font-weight: 700; padding-bottom: 6px; border-bottom: 3px solid #0038A8; display: inline-block; }
.about { font-size: 17px; color: #475569; line-height: 1.7; max-width: 700px; }
.projects { display: grid; gap: 16px; }
@media (min-width: 640px) { .projects { grid-template-columns: 1fr 1fr; } }
.proj { padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #CE1126; }
.proj:nth-child(3n+1) { border-left-color: #0038A8; }
.proj:nth-child(3n+2) { border-left-color: #CE1126; }
.proj:nth-child(3n+3) { border-left-color: #FCD116; }
.proj h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.proj p { font-size: 14px; color: #475569; }
.tech { margin-top: 8px; font-family: monospace; font-size: 12px; color: #0038A8; }
footer { padding: 32px 0; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
footer a { color: #0038A8; font-weight: 600; }
</style></head><body>
<div class="stripes"><div class="s1"></div><div class="s2"></div><div class="s3"></div></div>
<div class="container">
<header><h1>Hi, I'm <span class="grad">${escapeHtml(d.name)}</span></h1><p class="role">${escapeHtml(d.role)}</p></header>
${d.about ? `<section><h2>About</h2><p class="about">${escapeHtml(d.about)}</p></section>` : ''}
${d.projects.length ? `<section><h2>Projects</h2><div class="projects">${projHtml}</div></section>` : ''}
${d.skills.length ? `<section><h2>Skills</h2><p>${d.skills.map(escapeHtml).join(' · ')}</p></section>` : ''}
${d.email ? `<section><h2>Contact</h2><p>📧 <a href="mailto:${escapeHtml(d.email)}" style="color:#0038A8;font-weight:600;">${escapeHtml(d.email)}</a></p></section>` : ''}
<footer>${linksHtml || ''} · © ${new Date().getFullYear()} ${escapeHtml(d.name)}</footer>
</div></body></html>`;
  }

  function buildMinimal(d) {
    const projHtml = d.projects.map(p => `<div class="proj"><h3>${escapeHtml(p.name)}</h3>${p.desc ? `<p>${escapeHtml(p.desc)}</p>` : ''}</div>`).join('');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(d.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #FAFAFA; color: #171717; line-height: 1.7; }
.container { max-width: 680px; margin: 0 auto; padding: 80px 24px; }
h1 { font-size: clamp(32px, 5vw, 44px); font-weight: 700; margin-bottom: 4px; }
.role { color: #525252; margin-bottom: 32px; font-size: 16px; }
.about { font-size: 17px; margin-bottom: 48px; max-width: 600px; }
section { margin-bottom: 48px; }
h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #525252; margin-bottom: 16px; font-weight: 600; }
.proj { padding: 16px 0; border-bottom: 1px solid #e5e5e5; }
.proj h3 { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
.proj p { font-size: 14px; color: #525252; }
.contact a { color: #171717; font-weight: 500; border-bottom: 1px solid #171717; }
</style></head><body><div class="container">
<h1>${escapeHtml(d.name)}</h1>
<p class="role">${escapeHtml(d.role)}</p>
${d.about ? `<p class="about">${escapeHtml(d.about)}</p>` : ''}
${d.projects.length ? `<section><h2>Work</h2>${projHtml}</section>` : ''}
${d.skills.length ? `<section><h2>Skills</h2><p>${d.skills.map(escapeHtml).join(', ')}</p></section>` : ''}
${d.email ? `<section class="contact"><h2>Contact</h2><p><a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></p></section>` : ''}
</div></body></html>`;
  }

  function buildSunset(d) {
    const projHtml = d.projects.map(p => `<div class="proj"><h3>${escapeHtml(p.name)}</h3>${p.desc ? `<p>${escapeHtml(p.desc)}</p>` : ''}</div>`).join('');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(d.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; min-height: 100vh; background: linear-gradient(135deg, #FFF7ED 0%, #FED7AA 40%, #FCA5A5 100%); color: #1c1917; line-height: 1.6; }
.container { max-width: 900px; margin: 0 auto; padding: 60px 24px; }
header { padding: 40px 0; }
h1 { font-size: clamp(40px, 6vw, 60px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.role { font-size: 22px; color: #9a3412; margin-top: 12px; font-weight: 600; }
section { margin-bottom: 40px; }
h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #9a3412; margin-bottom: 16px; font-weight: 700; }
.about { font-size: 17px; color: #44403c; max-width: 700px; }
.projects { display: grid; gap: 16px; }
@media (min-width: 640px) { .projects { grid-template-columns: 1fr 1fr; } }
.proj { padding: 24px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.8); border-radius: 16px; }
.proj h3 { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.proj p { font-size: 14px; color: #57534e; }
.contact a { color: #DC2626; font-weight: 600; }
</style></head><body><div class="container">
<header><h1>Hi, I'm ${escapeHtml(d.name)}</h1><p class="role">${escapeHtml(d.role)}</p></header>
${d.about ? `<section><h2>About</h2><p class="about">${escapeHtml(d.about)}</p></section>` : ''}
${d.projects.length ? `<section><h2>Projects</h2><div class="projects">${projHtml}</div></section>` : ''}
${d.skills.length ? `<section><h2>Skills</h2><p>${d.skills.map(escapeHtml).join(' · ')}</p></section>` : ''}
${d.email ? `<section class="contact"><h2>Contact</h2><p>📧 <a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></p></section>` : ''}
</div></body></html>`;
  }

  btn.addEventListener('click', async () => {
    const data = {
      name: $('#p-name').value.trim() || 'Your Name',
      role: $('#p-role').value.trim() || 'Your Role',
      status: $('#p-status').value.trim(),
      about: $('#p-about').value.trim(),
      stats: [
        { num: $('#p-stat1').value.trim(), label: $('#p-stat1l').value.trim() },
        { num: $('#p-stat2').value.trim(), label: $('#p-stat2l').value.trim() },
        { num: $('#p-stat3').value.trim(), label: $('#p-stat3l').value.trim() },
      ].filter(s => s.num && s.label),
      projects: parseProjects($('#p-projects').value),
      skills: $('#p-skills').value.split(',').map(s => s.trim()).filter(Boolean),
      email: $('#p-email').value.trim(),
      phone: $('#p-phone').value.trim(),
      location: $('#p-location').value.trim(),
      links: normalizeLinks($('#p-links').value),
      photo: $('#p-photo').value.trim(),
    };

    if (!data.name) { toast('Add your name first'); return; }

    btn.disabled = true;
    btn.textContent = 'AI polishing About... (10s)';

    // Improve About section
    if (data.about) {
      const json = await callAI({
        question: `Rewrite this About Me for a portfolio. Make it confident, specific, 2-3 sentences. Keep author's voice. Output ONLY the rewritten paragraph (no quotes, no preamble, no markdown).\n\nOriginal: ${data.about}`,
        mode: 'career',
      });
      if (json.ok && json.text) data.about = json.text.replace(/^["'\s]+|["'\s]+$/g, '').replace(/^Here.*?:\s*/i, '').trim();
    }

    const builders = { 'dark-glow': buildDarkGlow, 'ph-pride': buildPhPride, 'minimal': buildMinimal, 'sunset': buildSunset };
    lastDoc = (builders[tpl] || buildDarkGlow)(data);
    iframe.srcdoc = lastDoc;
    wrap.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Regenerate ✨';
    toast('Portfolio generated! Preview below.');
  });

  $('#p-download')?.addEventListener('click', () => {
    const blob = new Blob([lastDoc], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded! Upload to vercel.com/new');
  });
})();

// ===================== GPA Calculator =====================
(function setupGPA() {
  const rows = $('#gpa-rows'), addBtn = $('#gpa-add'), resultNum = $('#gpa-result-num'), resultLabel = $('#gpa-result-label');
  if (!rows || !addBtn) return;
  function gradeWord(g) {
    if (g <= 1.10) return 'Excellent';
    if (g <= 1.50) return 'Very Good';
    if (g <= 2.00) return 'Good';
    if (g <= 2.50) return 'Satisfactory';
    if (g <= 3.00) return 'Passing';
    return 'Failed';
  }
  function calc() {
    let totalUnits = 0, weighted = 0, count = 0;
    $$('.gpa-grid', rows).forEach(s => {
      const units = parseFloat(s.querySelector('.gpa-units').value) || 0;
      const grade = parseFloat(s.querySelector('.gpa-grade').value) || 0;
      if (units > 0 && grade > 0) { totalUnits += units; weighted += units * grade; count++; }
    });
    if (totalUnits === 0) { resultNum.textContent = '—'; resultLabel.textContent = 'Add subjects'; return; }
    const gpa = weighted / totalUnits;
    resultNum.textContent = gpa.toFixed(2);
    resultLabel.textContent = `${count} subjects · ${totalUnits} units · ${gradeWord(gpa)}`;
  }
  function bindRow(row) {
    row.querySelectorAll('input, select').forEach(el => { el.addEventListener('input', calc); el.addEventListener('change', calc); });
  }
  $$('.gpa-grid', rows).forEach(bindRow);
  addBtn.addEventListener('click', () => {
    const tpl = $('.gpa-grid', rows).cloneNode(true);
    tpl.querySelector('.gpa-subject').value = '';
    rows.appendChild(tpl);
    bindRow(tpl);
    calc();
  });
  calc();
})();

// ===================== Pomodoro =====================
(function setupPomo() {
  const display = $('#pomo-display'), state = $('#pomo-state'), startBtn = $('#pomo-start'), resetBtn = $('#pomo-reset');
  if (!display || !startBtn) return;
  const FOCUS = 25 * 60, BREAK = 5 * 60;
  let seconds = FOCUS, mode = 'FOCUS', running = false, tick;
  function render() {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
    state.textContent = mode;
  }
  function step() {
    if (seconds > 0) { seconds--; render(); }
    else {
      mode = mode === 'FOCUS' ? 'BREAK' : 'FOCUS';
      seconds = mode === 'FOCUS' ? FOCUS : BREAK;
      render();
      toast(mode === 'FOCUS' ? '⏱️ Back to focus!' : '☕ Take a 5-min break!', 3000);
    }
  }
  startBtn.addEventListener('click', () => {
    if (running) { clearInterval(tick); running = false; startBtn.textContent = 'Start'; }
    else { tick = setInterval(step, 1000); running = true; startBtn.textContent = 'Pause'; }
  });
  resetBtn.addEventListener('click', () => {
    clearInterval(tick); running = false; startBtn.textContent = 'Start';
    mode = 'FOCUS'; seconds = FOCUS; render();
  });
  render();
})();

// ===================== Currency Converter =====================
(function setupCurrency() {
  const amountEl = $('#curr-from-amount'), fromEl = $('#curr-from'), toEl = $('#curr-to'), swap = $('#curr-swap'), result = $('#curr-result');
  if (!amountEl || !result) return;
  let debounce;
  async function convert() {
    const amt = parseFloat(amountEl.value), from = fromEl.value, to = toEl.value;
    if (!amt || amt <= 0) { result.textContent = '—'; return; }
    result.textContent = 'Converting...';
    try {
      const r = await fetch(`${API_BASE}/currency/convert?from=${from}&to=${to}&amount=${amt}`);
      const j = await r.json();
      result.textContent = j.result != null
        ? `${amt.toLocaleString()} ${from} = ${j.result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`
        : (j.error || 'Failed');
    } catch { result.textContent = 'Network error'; }
  }
  [amountEl, fromEl, toEl].forEach(el => el.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(convert, 400); }));
  swap.addEventListener('click', () => { const t = fromEl.value; fromEl.value = toEl.value; toEl.value = t; convert(); });
  convert();
})();

// ===================== Word Counter =====================
(function setupWordCount() {
  const input = $('#word-input');
  if (!input) return;
  const words = $('#word-count-words'), chars = $('#word-count-chars'), read = $('#word-count-read');
  input.addEventListener('input', () => {
    const text = input.value;
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    words.textContent = wc.toLocaleString();
    chars.textContent = text.length.toLocaleString();
    read.textContent = Math.max(1, Math.ceil(wc / 200)) + 'm';
  });
})();

// ===================== Citation Generator =====================
(function setupCitation() {
  const out = $('#cite-output');
  const inputs = ['#cite-authors', '#cite-year', '#cite-title', '#cite-source'].map(s => $(s));
  if (!out || inputs.some(i => !i)) return;
  function build() {
    const [a, y, t, s] = inputs.map(i => i.value.trim());
    if (!a && !t) { out.textContent = 'Your APA citation will appear here.'; return; }
    const author = a || 'Author';
    const year = y ? ` (${y}).` : ' (n.d.).';
    const title = t ? ` ${t}.` : '';
    const source = s ? ` ${s}.` : '';
    out.innerHTML = `${author}.${year}<em>${title}</em>${source}`;
  }
  inputs.forEach(i => i.addEventListener('input', build));
  $('#cite-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(out.textContent); toast('Citation copied'); } catch {}
  });
})();

// ===================== Trivia =====================
(function setupTrivia() {
  const display = $('#trivia-display'), btn = $('#trivia-next');
  if (!display || !btn) return;
  async function load() {
    display.textContent = 'Loading...';
    try {
      const r = await fetch(API_BASE + '/trivia/random');
      const t = await r.json();
      display.innerHTML = `<strong>${t.category}:</strong> ${t.fact}`;
    } catch { display.textContent = 'Failed. Try again.'; }
  }
  btn.addEventListener('click', load);
  load();
})();

// ===================== Free Office cards =====================
(function setupOffice() {
  const grid = $('#office-grid');
  if (!grid) return;
  fetch(API_BASE + '/free-office')
    .then(r => r.json())
    .then(j => {
      grid.innerHTML = '';
      j.data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'office-card' + (item.slug === 'microsoft-365-education' ? ' featured' : '');
        card.innerHTML = `
          <h3>${item.name}</h3>
          <p class="office-tag">${item.tagline}</p>
          <dl class="office-meta">
            <dt>Cost:</dt><dd>${item.cost}</dd>
            <dt>Platforms:</dt><dd>${item.platforms.join(', ')}</dd>
            <dt>Includes:</dt><dd>${item.includes.slice(0, 4).join(', ')}${item.includes.length > 4 ? '…' : ''}</dd>
          </dl>
          <ol class="office-steps">${item.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          <a class="btn btn-primary" href="${item.url}" target="_blank" rel="noopener">Get it →</a>
        `;
        grid.appendChild(card);
      });
    })
    .catch(() => { grid.innerHTML = '<p style="color: var(--fg-muted); text-align: center;">Failed to load.</p>'; });
})();

// ===================== Excel Mastery =====================
(function setupExcel() {
  const tabs = $$('.excel-tab');
  const panels = $$('.excel-panel');
  if (!tabs.length) return;

  function activateTab(tabName) {
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(x => x.classList.remove('active'));
    const target = tabs.find(t => t.dataset.extab === tabName);
    target?.classList.add('active');
    $(`.excel-panel[data-expanel="${tabName}"]`)?.classList.add('active');
  }

  tabs.forEach(t => t.addEventListener('click', () => activateTab(t.dataset.extab)));

  // Roadmap quadrant links jump to specific tabs
  $$('.quad-link[data-jumpto]').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    activateTab(a.dataset.jumpto);
    $('.excel-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // === FORMULAS DATA ===
  const FORMULAS = [
    { name: 'SUM', cat: 'math', desc: 'Add up a range of numbers', syntax: 'SUM(range)', ex: '=SUM(A1:A10) → adds A1 through A10' },
    { name: 'AVERAGE', cat: 'math', desc: 'Get the arithmetic mean', syntax: 'AVERAGE(range)', ex: '=AVERAGE(B2:B100) → mean of grades' },
    { name: 'COUNT', cat: 'math', desc: 'Count cells with numbers only', syntax: 'COUNT(range)', ex: '=COUNT(A1:A50) → counts numeric cells' },
    { name: 'COUNTA', cat: 'math', desc: 'Count non-empty cells (any type)', syntax: 'COUNTA(range)', ex: '=COUNTA(A1:A50) → counts non-blank' },
    { name: 'COUNTIF', cat: 'stat', desc: 'Count cells meeting a condition', syntax: 'COUNTIF(range, criteria)', ex: '=COUNTIF(C2:C100,">75") → count grades over 75' },
    { name: 'SUMIF', cat: 'stat', desc: 'Sum cells meeting a condition', syntax: 'SUMIF(range, criteria, [sum_range])', ex: '=SUMIF(B:B,"Food",C:C) → total Food expenses' },
    { name: 'SUMIFS', cat: 'stat', desc: 'Sum with MULTIPLE conditions', syntax: 'SUMIFS(sum_range, criteria_range1, criteria1, ...)', ex: '=SUMIFS(C:C,B:B,"Food",A:A,">=2026-01-01")' },
    { name: 'COUNTIFS', cat: 'stat', desc: 'Count with multiple conditions', syntax: 'COUNTIFS(range1, crit1, range2, crit2, ...)', ex: '=COUNTIFS(A:A,"Male",B:B,">21")' },
    { name: 'AVERAGEIF', cat: 'stat', desc: 'Average cells meeting condition', syntax: 'AVERAGEIF(range, criteria, [avg_range])', ex: '=AVERAGEIF(B2:B100,"Female",C2:C100)' },
    { name: 'IF', cat: 'logical', desc: 'Conditional logic — return one value if true, another if false', syntax: 'IF(condition, value_if_true, value_if_false)', ex: '=IF(B2>=75,"PASS","FAIL")' },
    { name: 'IFS', cat: 'logical', desc: 'Multiple conditions (replaces nested IF)', syntax: 'IFS(cond1, val1, cond2, val2, ...)', ex: '=IFS(B2>=90,"A",B2>=80,"B",B2>=75,"C",TRUE,"F")' },
    { name: 'AND', cat: 'logical', desc: 'Returns TRUE if ALL conditions true', syntax: 'AND(cond1, cond2, ...)', ex: '=IF(AND(B2>=75,C2>=75),"PASS","FAIL")' },
    { name: 'OR', cat: 'logical', desc: 'Returns TRUE if ANY condition true', syntax: 'OR(cond1, cond2, ...)', ex: '=IF(OR(B2="Manager",B2="VP"),"Admin","User")' },
    { name: 'IFERROR', cat: 'logical', desc: 'Catch errors and show fallback value', syntax: 'IFERROR(formula, value_if_error)', ex: '=IFERROR(A1/B1, 0) → returns 0 instead of #DIV/0!' },
    { name: 'VLOOKUP', cat: 'lookup', desc: '⭐ Find a value in the leftmost column, return value from another column', syntax: 'VLOOKUP(value, table, col_num, [exact])', ex: '=VLOOKUP("Maria",A:C,3,FALSE) → find Maria, return col 3' },
    { name: 'HLOOKUP', cat: 'lookup', desc: 'Horizontal version of VLOOKUP', syntax: 'HLOOKUP(value, table, row_num, [exact])', ex: '=HLOOKUP(2026, A1:E5, 3, FALSE)' },
    { name: 'XLOOKUP', cat: 'lookup', desc: '⭐ Modern replacement for VLOOKUP. Looks in any direction.', syntax: 'XLOOKUP(lookup, lookup_arr, return_arr, [if_not_found])', ex: '=XLOOKUP("Maria",A:A,C:C,"Not found")' },
    { name: 'INDEX', cat: 'lookup', desc: 'Return value at given row+col position', syntax: 'INDEX(array, row_num, [col_num])', ex: '=INDEX(A1:C10, 5, 2) → cell at row 5, col 2' },
    { name: 'MATCH', cat: 'lookup', desc: 'Find position of value in a list', syntax: 'MATCH(value, lookup_array, [match_type])', ex: '=MATCH("Maria",A:A,0) → row number where Maria is' },
    { name: 'INDEX+MATCH', cat: 'lookup', desc: 'Power combo — more flexible than VLOOKUP', syntax: 'INDEX(return_col, MATCH(lookup_value, lookup_col, 0))', ex: '=INDEX(C:C, MATCH("Maria", A:A, 0))' },
    { name: 'CONCAT / CONCATENATE', cat: 'text', desc: 'Join text values together', syntax: 'CONCAT(text1, text2, ...)', ex: '=CONCAT(A2," ",B2) → "Maria Santos"' },
    { name: 'TEXTJOIN', cat: 'text', desc: 'Join with separator, skip empty cells', syntax: 'TEXTJOIN(separator, ignore_empty, text1, ...)', ex: '=TEXTJOIN(", ",TRUE,A2:A10)' },
    { name: 'LEFT / RIGHT / MID', cat: 'text', desc: 'Extract characters from text', syntax: 'LEFT(text, num) · RIGHT(text, num) · MID(text, start, num)', ex: '=LEFT(A1, 3) · =MID(A1, 2, 5)' },
    { name: 'LEN', cat: 'text', desc: 'Get length of text', syntax: 'LEN(text)', ex: '=LEN(A1) → character count' },
    { name: 'TRIM', cat: 'text', desc: 'Remove extra spaces', syntax: 'TRIM(text)', ex: '=TRIM(A1) → cleans " Maria   Santos "' },
    { name: 'UPPER / LOWER / PROPER', cat: 'text', desc: 'Change text case', syntax: 'UPPER(text) · LOWER(text) · PROPER(text)', ex: '=PROPER("maria santos") → "Maria Santos"' },
    { name: 'SUBSTITUTE', cat: 'text', desc: 'Find and replace text', syntax: 'SUBSTITUTE(text, old, new, [instance])', ex: '=SUBSTITUTE(A1, "Inc.", "Incorporated")' },
    { name: 'TODAY / NOW', cat: 'date', desc: 'Current date / date+time', syntax: 'TODAY() · NOW()', ex: '=TODAY() → 2026-05-17' },
    { name: 'YEAR / MONTH / DAY', cat: 'date', desc: 'Extract date parts', syntax: 'YEAR(date) · MONTH(date) · DAY(date)', ex: '=YEAR(A1) → 2026' },
    { name: 'DATEDIF', cat: 'date', desc: 'Calculate difference between 2 dates', syntax: 'DATEDIF(start, end, "Y"|"M"|"D")', ex: '=DATEDIF(A1, TODAY(), "Y") → age in years' },
    { name: 'WEEKDAY', cat: 'date', desc: 'Day of week (1=Sun..7=Sat by default)', syntax: 'WEEKDAY(date, [type])', ex: '=WEEKDAY(A1, 2) → 1=Mon..7=Sun' },
    { name: 'EOMONTH', cat: 'date', desc: 'Last day of month X months away', syntax: 'EOMONTH(start, months)', ex: '=EOMONTH(TODAY(), 0) → last day of this month' },
    { name: 'ROUND / ROUNDUP / ROUNDDOWN', cat: 'math', desc: 'Round numbers', syntax: 'ROUND(num, digits)', ex: '=ROUND(3.14159, 2) → 3.14' },
    { name: 'MIN / MAX', cat: 'math', desc: 'Smallest / largest value in range', syntax: 'MIN(range) · MAX(range)', ex: '=MAX(B2:B100) → highest grade' },
    { name: 'RANK', cat: 'stat', desc: 'Rank a value among others', syntax: 'RANK(num, range, [ascending])', ex: '=RANK(B2, B$2:B$100, 0) → rank by grade desc' },
    { name: 'SUMPRODUCT', cat: 'math', desc: 'Multiply arrays, sum results — powerful', syntax: 'SUMPRODUCT(array1, array2, ...)', ex: '=SUMPRODUCT(B2:B6,C2:C6) → weighted total' },
    { name: 'UNIQUE', cat: 'lookup', desc: 'Get unique values from a list (newer Excel)', syntax: 'UNIQUE(range)', ex: '=UNIQUE(A2:A100) → distinct names only' },
    { name: 'FILTER', cat: 'lookup', desc: 'Filter data dynamically (newer Excel)', syntax: 'FILTER(array, condition, [if_empty])', ex: '=FILTER(A2:C100, B2:B100>75)' },
    { name: 'SORT', cat: 'lookup', desc: 'Sort dynamically (newer Excel)', syntax: 'SORT(array, [col], [order])', ex: '=SORT(A2:C100, 3, -1) → sort by col 3 desc' },
  ];

  function renderFormulas(filter = '') {
    const container = $('#excel-formulas');
    if (!container) return;
    const q = filter.toLowerCase();
    const filtered = FORMULAS.filter(f =>
      !q || f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || f.cat.includes(q)
    );
    if (!filtered.length) {
      container.innerHTML = `<p style="text-align:center;color:var(--fg-muted);padding:var(--s5);">No formulas match "${filter}". Try: SUM, IF, LOOKUP, TEXT, DATE</p>`;
      return;
    }
    container.innerHTML = filtered.map(f => `
      <div class="formula-card">
        <div class="formula-name">${f.name}</div>
        <span class="formula-cat cat-${f.cat}">${f.cat}</span>
        <div class="formula-desc">${f.desc}</div>
        <div class="formula-syntax">${f.syntax}</div>
        <div class="formula-example">${f.ex}</div>
      </div>
    `).join('');
  }
  renderFormulas();
  $('#excel-formula-search')?.addEventListener('input', (e) => renderFormulas(e.target.value));

  // === SHORTCUTS DATA ===
  const SHORTCUTS = {
    win: [
      { group: '📋 Essential', items: [
        ['Copy', ['Ctrl', 'C']], ['Paste', ['Ctrl', 'V']], ['Cut', ['Ctrl', 'X']],
        ['Undo', ['Ctrl', 'Z']], ['Redo', ['Ctrl', 'Y']], ['Save', ['Ctrl', 'S']],
        ['Find', ['Ctrl', 'F']], ['Replace', ['Ctrl', 'H']], ['Print', ['Ctrl', 'P']],
        ['Select All', ['Ctrl', 'A']],
      ]},
      { group: '✏️ Editing', items: [
        ['Edit cell (in place)', ['F2']], ['New line in cell', ['Alt', 'Enter']],
        ['Fill down', ['Ctrl', 'D']], ['Fill right', ['Ctrl', 'R']],
        ['AutoSum', ['Alt', '=']], ['Insert today\'s date', ['Ctrl', ';']],
        ['Insert current time', ['Ctrl', 'Shift', ':']],
      ]},
      { group: '🧭 Navigation', items: [
        ['Go to cell', ['Ctrl', 'G']], ['Last filled cell (down)', ['Ctrl', '↓']],
        ['Last filled cell (right)', ['Ctrl', '→']], ['Beginning of row', ['Home']],
        ['Cell A1', ['Ctrl', 'Home']], ['Last used cell', ['Ctrl', 'End']],
        ['Next sheet', ['Ctrl', 'PgDn']], ['Previous sheet', ['Ctrl', 'PgUp']],
      ]},
      { group: '🎯 Selection', items: [
        ['Extend selection', ['Shift', '+ arrows']],
        ['Select column', ['Ctrl', 'Space']], ['Select row', ['Shift', 'Space']],
        ['Select to last filled', ['Ctrl', 'Shift', '↓']], ['Select all data', ['Ctrl', 'A']],
      ]},
      { group: '💲 Formatting', items: [
        ['Bold', ['Ctrl', 'B']], ['Italic', ['Ctrl', 'I']], ['Underline', ['Ctrl', 'U']],
        ['Format as currency', ['Ctrl', 'Shift', '$']], ['Format as %', ['Ctrl', 'Shift', '%']],
        ['Format as date', ['Ctrl', 'Shift', '#']], ['Format as number', ['Ctrl', 'Shift', '!']],
        ['Open Format Cells', ['Ctrl', '1']],
      ]},
      { group: '🧮 Formulas', items: [
        ['Toggle absolute ref ($)', ['F4']], ['Show formulas vs values', ['Ctrl', '`']],
        ['Insert function', ['Shift', 'F3']], ['Evaluate part of formula', ['F9']],
      ]},
      { group: '➕ Rows & Columns', items: [
        ['Insert row/col', ['Ctrl', 'Shift', '+']], ['Delete row/col', ['Ctrl', '-']],
        ['Hide column', ['Ctrl', '0']], ['Hide row', ['Ctrl', '9']],
        ['Filter on/off', ['Ctrl', 'Shift', 'L']],
      ]},
    ],
    mac: [
      { group: '📋 Essential', items: [
        ['Copy', ['⌘', 'C']], ['Paste', ['⌘', 'V']], ['Cut', ['⌘', 'X']],
        ['Undo', ['⌘', 'Z']], ['Redo', ['⌘', 'Y']], ['Save', ['⌘', 'S']],
        ['Find', ['⌘', 'F']], ['Replace', ['⌃', 'H']], ['Print', ['⌘', 'P']],
        ['Select All', ['⌘', 'A']],
      ]},
      { group: '✏️ Editing', items: [
        ['Edit cell (in place)', ['⌃', 'U']], ['New line in cell', ['⌃', '⌥', 'Return']],
        ['Fill down', ['⌃', 'D']], ['Fill right', ['⌃', 'R']],
        ['AutoSum', ['⌘', 'Shift', 'T']], ['Insert today', ['⌃', ';']],
      ]},
      { group: '🧭 Navigation', items: [
        ['Go to cell', ['⌃', 'G']], ['Last filled cell (down)', ['⌘', '↓']],
        ['Cell A1', ['⌃', 'Home']], ['Last used cell', ['⌃', 'End']],
        ['Next sheet', ['⌥', '→']], ['Previous sheet', ['⌥', '←']],
      ]},
      { group: '🎯 Selection', items: [
        ['Extend selection', ['Shift', '+ arrows']],
        ['Select column', ['⌃', 'Space']], ['Select row', ['Shift', 'Space']],
        ['Select to last filled', ['⌘', 'Shift', '↓']],
      ]},
      { group: '💲 Formatting', items: [
        ['Bold', ['⌘', 'B']], ['Italic', ['⌘', 'I']], ['Underline', ['⌘', 'U']],
        ['Currency', ['⌃', 'Shift', '$']], ['Percent', ['⌃', 'Shift', '%']],
        ['Format Cells', ['⌘', '1']],
      ]},
      { group: '🧮 Formulas', items: [
        ['Absolute ref ($)', ['⌘', 'T']], ['Show formulas vs values', ['⌃', '`']],
        ['Insert function', ['Shift', 'F3']], ['Evaluate formula part', ['F9']],
      ]},
    ],
  };

  function renderShortcuts(os = 'win') {
    const container = $('#excel-shortcuts');
    if (!container) return;
    container.innerHTML = SHORTCUTS[os].map(group => `
      <div class="shortcut-group">
        <h4>${group.group}</h4>
        ${group.items.map(([label, keys]) => `
          <div class="shortcut-row">
            <span>${label}</span>
            <div class="shortcut-keys">${keys.map(k => `<kbd>${k}</kbd>`).join('<span style="color:var(--fg-muted);font-size:11px;">+</span>')}</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }
  renderShortcuts('win');
  $$('.excel-sub-tab').forEach(t => t.addEventListener('click', () => {
    $$('.excel-sub-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderShortcuts(t.dataset.os);
  }));

  // === DOWNLOAD TEMPLATES (CSV files Excel opens directly) ===
  function downloadCSV(name, content) {
    const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`Downloaded ${name}. Open in Excel.`);
  }

  $('#excel-template-gpa')?.addEventListener('click', (e) => {
    e.preventDefault();
    downloadCSV('gpa-tracker.csv',
`Subject,Units,Grade,Weighted Points
Calculus 1,3,1.50,=B2*C2
Programming 1,4,1.25,=B3*C3
Physics 1,4,1.75,=B4*C4
Filipino 1,3,2.00,=B5*C5
PE 1,2,1.00,=B6*C6
,,,
Total Units:,=SUM(B2:B6),,
Total Weighted:,,,=SUM(D2:D6)
GPA:,,,=D9/B8
,,,
Note:,GPA = SUMPRODUCT(Units * Grade) / SUM(Units),,
,Lower is better in PH grading (1.00 = highest 99-100; 5.00 = failed),,
`);
  });

  $('#excel-template-budget')?.addEventListener('click', (e) => {
    e.preventDefault();
    downloadCSV('budget-tracker.csv',
`Date,Category,Description,Amount (PHP)
2026-05-01,Food,Lunch at canteen,85
2026-05-01,Transport,Jeepney fare,13
2026-05-02,School,Photocopy,45
2026-05-02,Food,Snacks,55
2026-05-03,Internet,Load,100
2026-05-03,Food,Dinner,120
,,,
,,,
SUMMARY,,,
Total Spent:,,,=SUM(D2:D7)
Food Total:,,,=SUMIF(B:B,"Food",D:D)
Transport Total:,,,=SUMIF(B:B,"Transport",D:D)
School Total:,,,=SUMIF(B:B,"School",D:D)
Internet Total:,,,=SUMIF(B:B,"Internet",D:D)
,,,
Avg per Day:,,,=AVERAGE(D2:D7)
`);
  });

  $('#excel-template-survey')?.addEventListener('click', (e) => {
    e.preventDefault();
    downloadCSV('survey-likert-template.csv',
`Respondent #,Q1: System is easy to use,Q2: System is fast,Q3: Design is good,Q4: I will recommend,Q5: Solved my problem
1,5,4,5,5,4
2,4,5,4,4,5
3,5,5,5,5,5
4,3,4,3,4,4
5,4,4,4,5,4
6,5,5,4,5,5
7,4,3,4,4,3
8,5,4,5,4,5
9,4,5,4,5,4
10,5,5,5,5,5
,,,,,
Mean,=AVERAGE(B2:B11),=AVERAGE(C2:C11),=AVERAGE(D2:D11),=AVERAGE(E2:E11),=AVERAGE(F2:F11)
,,,,,
Interpretation:,4.21-5.00 = Strongly Agree,,,,
,3.41-4.20 = Agree,,,,
,2.61-3.40 = Neutral,,,,
,1.81-2.60 = Disagree,,,,
,1.00-1.80 = Strongly Disagree,,,,
`);
  });

  // === CHEATSHEET DOWNLOAD ===
  $('#excel-cheatsheet-dl')?.addEventListener('click', () => {
    const top30 = FORMULAS.slice(0, 30).map(f => `<tr><td><strong>${f.name}</strong></td><td>${f.desc}</td><td><code>${f.ex}</code></td></tr>`).join('');
    const winShortcuts = SHORTCUTS.win.flatMap(g => g.items).map(([l, k]) => `<tr><td>${l}</td><td><strong>${k.join(' + ')}</strong></td></tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Excel Cheatsheet - PH StudentKit</title>
<style>
  @page { margin: 12mm; }
  body { font-family: -apple-system, sans-serif; font-size: 10pt; line-height: 1.4; max-width: 900px; margin: 0 auto; padding: 20px; color: #0F172A; }
  h1 { color: #185C37; font-size: 24pt; margin-bottom: 4pt; }
  h2 { color: #185C37; font-size: 13pt; margin-top: 14pt; border-bottom: 2pt solid #185C37; padding-bottom: 2pt; }
  .sub { color: #475569; font-size: 10pt; margin-bottom: 14pt; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  th { background: #185C37; color: white; text-align: left; padding: 4pt 8pt; }
  td { padding: 3pt 8pt; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  code { font-family: 'Menlo', monospace; font-size: 8.5pt; background: #f1f5f9; padding: 1pt 3pt; border-radius: 2pt; }
  .footer { margin-top: 20pt; padding-top: 8pt; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #64748b; text-align: center; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; }
  @media print { body { padding: 0; } }
</style></head><body>
  <h1>📊 Excel Cheatsheet</h1>
  <div class="sub">PH StudentKit · Top 30 Formulas + Top Shortcuts · by Charlie James Abejo</div>
  <h2>🧮 Top 30 Formulas</h2>
  <table><tr><th>Formula</th><th>What it does</th><th>Example</th></tr>${top30}</table>
  <h2>⌨️ Windows Shortcuts (top 40)</h2>
  <div class="two-col">
    <table><tr><th>Action</th><th>Keys</th></tr>${winShortcuts.slice(0, winShortcuts.length / 2)}</table>
    <table><tr><th>Action</th><th>Keys</th></tr>${winShortcuts.slice(winShortcuts.length / 2)}</table>
  </div>
  <div class="footer">Generated by PH StudentKit · https://ph-public-api.vercel.app · capstonee2@gmail.com · MIT License · Print this to PDF</div>
  <script>setTimeout(()=>window.print(),500);<\/script>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  });
})();

// ===================== Arduino Mastery tabs =====================
(function setupArduino() {
  const tabs = $$('.ard-tab');
  const panels = $$('.ard-panel');
  if (!tabs.length) return;
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(`.ard-panel[data-apanel="${t.dataset.atab}"]`)?.classList.add('active');
  }));
})();

// ===================== Word Mastery tabs =====================
(function setupWord() {
  const tabs = $$('.word-tab');
  const panels = $$('.word-panel');
  if (!tabs.length) return;
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(`.word-panel[data-wpanel="${t.dataset.wtab}"]`)?.classList.add('active');
  }));

  const WORD_SHORTCUTS = [
    { group: '📋 Essential', items: [
      ['Copy', ['Ctrl', 'C']], ['Paste', ['Ctrl', 'V']], ['Cut', ['Ctrl', 'X']],
      ['Undo', ['Ctrl', 'Z']], ['Redo', ['Ctrl', 'Y']], ['Save', ['Ctrl', 'S']],
      ['Save As', ['F12']], ['Print', ['Ctrl', 'P']], ['Select All', ['Ctrl', 'A']],
    ]},
    { group: '📝 Formatting', items: [
      ['Bold', ['Ctrl', 'B']], ['Italic', ['Ctrl', 'I']], ['Underline', ['Ctrl', 'U']],
      ['Increase font', ['Ctrl', 'Shift', '>']], ['Decrease font', ['Ctrl', 'Shift', '<']],
      ['Subscript', ['Ctrl', '=']], ['Superscript', ['Ctrl', 'Shift', '=']],
      ['Clear formatting', ['Ctrl', 'Space']],
      ['Change case', ['Shift', 'F3']],
    ]},
    { group: '↔️ Alignment', items: [
      ['Left align', ['Ctrl', 'L']], ['Center', ['Ctrl', 'E']],
      ['Right align', ['Ctrl', 'R']], ['Justify', ['Ctrl', 'J']],
      ['Increase indent', ['Ctrl', 'M']], ['Decrease indent', ['Ctrl', 'Shift', 'M']],
      ['Single space', ['Ctrl', '1']], ['Double space', ['Ctrl', '2']],
      ['1.5 space', ['Ctrl', '5']],
    ]},
    { group: '🎨 Styles', items: [
      ['Heading 1', ['Ctrl', 'Alt', '1']],
      ['Heading 2', ['Ctrl', 'Alt', '2']],
      ['Heading 3', ['Ctrl', 'Alt', '3']],
      ['Normal style', ['Ctrl', 'Shift', 'N']],
      ['Apply List Bullet', ['Ctrl', 'Shift', 'L']],
    ]},
    { group: '🧭 Navigation', items: [
      ['Go to page', ['Ctrl', 'G']], ['Find', ['Ctrl', 'F']], ['Replace', ['Ctrl', 'H']],
      ['Page Up/Down', ['Page Up/Down']],
      ['Top of document', ['Ctrl', 'Home']], ['End of document', ['Ctrl', 'End']],
      ['Start of line', ['Home']], ['End of line', ['End']],
    ]},
    { group: '📄 Page & Insert', items: [
      ['Page Break', ['Ctrl', 'Enter']],
      ['Column Break', ['Ctrl', 'Shift', 'Enter']],
      ['Footnote', ['Ctrl', 'Alt', 'F']],
      ['Endnote', ['Ctrl', 'Alt', 'D']],
      ['Hyperlink', ['Ctrl', 'K']],
      ['Comment', ['Ctrl', 'Alt', 'M']],
    ]},
    { group: '✂️ Selection', items: [
      ['Select word', ['Ctrl', 'Shift', '←/→']],
      ['Select line', ['Shift', 'End']],
      ['Select paragraph', ['Ctrl', 'Shift', '↓']],
      ['Select to top', ['Ctrl', 'Shift', 'Home']],
    ]},
  ];

  function renderWordShortcuts() {
    const c = $('#word-shortcuts');
    if (!c) return;
    c.innerHTML = WORD_SHORTCUTS.map(g => `
      <div class="shortcut-group">
        <h4>${g.group}</h4>
        ${g.items.map(([l, k]) => `<div class="shortcut-row"><span>${l}</span><div class="shortcut-keys">${k.map(x => `<kbd>${x}</kbd>`).join('<span style="color:var(--fg-muted);font-size:11px;">+</span>')}</div></div>`).join('')}
      </div>
    `).join('');
  }
  renderWordShortcuts();
})();

// ===================== PowerPoint Mastery tabs =====================
(function setupPpt() {
  const tabs = $$('.ppt-tab');
  const panels = $$('.ppt-panel');
  if (!tabs.length) return;
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(`.ppt-panel[data-ppanel="${t.dataset.ptab}"]`)?.classList.add('active');
  }));

  const PPT_SHORTCUTS = [
    { group: '📋 Essential', items: [
      ['Copy', ['Ctrl', 'C']], ['Paste', ['Ctrl', 'V']], ['Undo', ['Ctrl', 'Z']],
      ['Save', ['Ctrl', 'S']], ['Print', ['Ctrl', 'P']],
    ]},
    { group: '🎬 Slideshow', items: [
      ['Start from beginning', ['F5']],
      ['Start from current slide', ['Shift', 'F5']],
      ['End slideshow', ['Esc']],
      ['Next slide', ['→ / Space / N']],
      ['Previous slide', ['← / P']],
      ['Go to slide #', ['Type # then Enter']],
      ['Black screen', ['B']], ['White screen', ['W']],
      ['Pointer/Pen', ['Ctrl', 'P']],
      ['Erase pen marks', ['E']],
    ]},
    { group: '🆕 Insert', items: [
      ['New slide', ['Ctrl', 'M']],
      ['Duplicate slide', ['Ctrl', 'D']],
      ['Insert hyperlink', ['Ctrl', 'K']],
      ['Group objects', ['Ctrl', 'G']],
      ['Ungroup', ['Ctrl', 'Shift', 'G']],
    ]},
    { group: '📝 Text', items: [
      ['Bold', ['Ctrl', 'B']], ['Italic', ['Ctrl', 'I']], ['Underline', ['Ctrl', 'U']],
      ['Center', ['Ctrl', 'E']], ['Left align', ['Ctrl', 'L']], ['Right align', ['Ctrl', 'R']],
      ['Promote bullet (less indent)', ['Shift', 'Tab']],
      ['Demote bullet (more indent)', ['Tab']],
    ]},
    { group: '🎨 Object', items: [
      ['Move object', ['Arrow keys']],
      ['Nudge by 1px', ['Ctrl', 'Arrow']],
      ['Rotate 15°', ['Alt', '←/→']],
      ['Bring to front', ['Ctrl', 'Shift', ']']],
      ['Send to back', ['Ctrl', 'Shift', '[']],
      ['Distribute evenly', ['Alt', 'H', 'G', 'A']],
    ]},
    { group: '🧭 Navigation', items: [
      ['Outline view', ['Alt', 'V', 'O']],
      ['Slide Sorter', ['Alt', 'V', 'D']],
      ['Normal view', ['Alt', 'V', 'N']],
      ['Notes view', ['Alt', 'V', 'P']],
      ['Zoom in/out', ['Ctrl', '+/-']],
    ]},
  ];

  function renderPptShortcuts() {
    const c = $('#ppt-shortcuts');
    if (!c) return;
    c.innerHTML = PPT_SHORTCUTS.map(g => `
      <div class="shortcut-group">
        <h4>${g.group}</h4>
        ${g.items.map(([l, k]) => `<div class="shortcut-row"><span>${l}</span><div class="shortcut-keys">${k.map(x => `<kbd>${x}</kbd>`).join('<span style="color:var(--fg-muted);font-size:11px;">+</span>')}</div></div>`).join('')}
      </div>
    `).join('');
  }
  renderPptShortcuts();
})();

// ===================== Universal Search =====================
(function setupSearch() {
  const trigger = $('#search-trigger');
  const modal = $('#search-modal');
  const backdrop = $('#search-backdrop');
  const close = $('#search-close');
  const input = $('#search-input');
  const results = $('#search-results');
  if (!trigger || !modal) return;

  let index = null;

  function buildIndex() {
    if (index) return index;
    index = [];
    // Index all api-cards and lang-cards
    $$('.api-card').forEach(card => {
      const section = card.closest('section');
      const sectionTitle = section?.querySelector('.section-title')?.textContent.trim() || '';
      index.push({
        title: card.querySelector('.api-card-name')?.textContent || '',
        desc: card.querySelector('.api-card-desc')?.textContent || '',
        tag: card.querySelector('.api-card-tag')?.textContent || '',
        section: sectionTitle,
        url: card.href || '#' + (section?.id || ''),
        kind: 'resource',
      });
    });
    $$('.lang-card').forEach(card => {
      const section = card.closest('section');
      const sectionTitle = section?.querySelector('.section-title')?.textContent.trim() || '';
      const links = [...card.querySelectorAll('.lang-links a')].map(a => a.textContent).join(', ');
      index.push({
        title: card.querySelector('h3')?.textContent || '',
        desc: (card.querySelector('p')?.textContent || '') + ' · ' + links,
        section: sectionTitle,
        url: '#' + (section?.id || ''),
        kind: 'course',
      });
    });
    $$('.endpoint-card').forEach(card => {
      index.push({
        title: card.querySelector('.path')?.textContent || '',
        desc: card.querySelector('.endpoint-desc')?.textContent || '',
        section: 'API Endpoints',
        url: '#endpoints',
        kind: 'api',
      });
    });
    // Sections themselves
    $$('section[id]').forEach(s => {
      const title = s.querySelector('.section-title')?.textContent.trim();
      const desc = s.querySelector('.section-subtitle')?.textContent.trim();
      if (title) index.push({ title, desc: desc || '', section: 'Section', url: '#' + s.id, kind: 'section' });
    });
    return index;
  }

  function highlight(text, q) {
    const safe = text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    if (!q) return safe;
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return safe.replace(re, '<mark>$1</mark>');
  }

  function search(q) {
    buildIndex();
    if (!q.trim()) {
      results.innerHTML = '<p class="search-hint">Type to search across all 250+ resources on this site. Try: <em>"python"</em>, <em>"scholarship"</em>, <em>"thesis"</em>, <em>"figma"</em>.</p>';
      return;
    }
    const query = q.toLowerCase();
    const matches = index.filter(item => {
      const blob = (item.title + ' ' + item.desc + ' ' + (item.tag || '') + ' ' + item.section).toLowerCase();
      return blob.includes(query);
    }).slice(0, 30);

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">No matches for "<strong>${q}</strong>". Try different keywords.</div>`;
      return;
    }
    const grouped = {};
    matches.forEach(m => {
      const key = m.section || 'Other';
      (grouped[key] = grouped[key] || []).push(m);
    });
    results.innerHTML = Object.entries(grouped).map(([section, items]) => `
      <div class="search-group">
        <div class="search-group-head">${section}</div>
        ${items.map(item => `
          <a class="search-result" href="${item.url}" target="${item.url.startsWith('http') ? '_blank' : '_self'}" rel="noopener">
            <div class="search-result-title">${highlight(item.title, q)}</div>
            ${item.desc ? `<div class="search-result-desc">${highlight(item.desc.slice(0, 140), q)}</div>` : ''}
          </a>
        `).join('')}
      </div>
    `).join('');
  }

  function open() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 50);
  }
  function closeFn() {
    modal.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    search('');
  }

  trigger.addEventListener('click', open);
  close.addEventListener('click', closeFn);
  backdrop.addEventListener('click', closeFn);
  input.addEventListener('input', () => search(input.value));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      modal.hidden ? open() : closeFn();
    }
    if (e.key === 'Escape' && !modal.hidden) closeFn();
  });

  // Click result → close modal if same-page
  results.addEventListener('click', (e) => {
    const link = e.target.closest('.search-result');
    if (link && !link.href.startsWith('http')) {
      setTimeout(closeFn, 100);
    }
  });
})();

// ===================== AI Letter Generator =====================
(function setupLetter() {
  const btn = $('#lett-go');
  const out = $('#lett-output');
  const actions = $('#lett-actions');
  if (!btn || !out) return;

  btn.addEventListener('click', async () => {
    const type = $('#lett-type').value;
    const from = $('#lett-from').value.trim() || 'Your Name';
    const to = $('#lett-to').value.trim() || 'Recipient';
    const position = $('#lett-position').value.trim();
    const context = $('#lett-context').value.trim();
    const tone = $('#lett-tone').value;

    if (!context) { toast('Add context/reason'); return; }

    btn.disabled = true;
    btn.textContent = 'Drafting... (10-15s)';
    out.hidden = false;
    out.textContent = 'AI is drafting your letter...';

    const typeMap = {
      cover: 'cover letter for a job application',
      application: 'application letter for an OJT/internship position',
      scholarship: 'scholarship application letter to the scholarship committee',
      recommendation: 'polite request letter asking a professor for a letter of recommendation',
      extension: 'deadline extension request letter to a professor',
      leave: 'leave of absence letter to an employer or school administrator',
      thank: 'thank you letter after a job interview',
      excuse: 'excuse letter for absence to a professor or employer',
      resignation: 'resignation letter to an employer',
    };

    const prompt = `Draft a ${tone} ${typeMap[type]} in proper formal English business format.

Details:
- From: ${from}
- To: ${to}
${position ? '- Position/Subject: ' + position : ''}
- Context: ${context}

Format requirements:
1. Include current date placeholder [Date]
2. Recipient address placeholder if appropriate
3. Proper salutation (Dear ${to})
4. 3-4 short paragraphs in the body
5. Professional closing (Sincerely, Respectfully, etc.)
6. Signature line with name

Output ONLY the letter content. No preamble or explanation. Use line breaks between paragraphs.`;

    const json = await callAI({ question: prompt, mode: 'writing' });
    if (json.ok && json.text) {
      // Format with line breaks for readability
      out.innerHTML = json.text.split('\n').map(line =>
        line.trim() ? `<p style="margin-bottom: 8px;">${line.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</p>` : '<br>'
      ).join('');
      actions.hidden = false;
      actions.style.display = 'grid';
      toast('Letter ready! Editable above.');
    } else {
      out.textContent = json.error || 'AI busy. Try again.';
    }
    btn.disabled = false;
    btn.textContent = 'Draft letter ✨';
  });

  $('#lett-copy')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(out.innerText); toast('Copied!'); } catch {}
  });
  $('#lett-word')?.addEventListener('click', () => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Letter</title><style>body{font-family:'Times New Roman',serif;line-height:1.6;max-width:800px;margin:40px auto;padding:40px;font-size:12pt;}p{margin-bottom:8pt;}</style></head><body>${out.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'letter.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();

// ===================== Code Playground =====================
(function setupPlayground() {
  const tabs = $$('.pg-tab');
  const editors = $$('.pg-editor');
  const preview = $('#pg-preview');
  const runBtn = $('#pg-run');
  const resetBtn = $('#pg-reset');
  if (!tabs.length || !preview) return;

  const STORAGE_KEY = 'pg-code-v1';
  const DEFAULTS = {
    html: editors.find(e => e.dataset.pgEdit === 'html').value,
    css: editors.find(e => e.dataset.pgEdit === 'css').value,
    js: editors.find(e => e.dataset.pgEdit === 'js').value,
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved) editors.forEach(e => { if (saved[e.dataset.pgEdit]) e.value = saved[e.dataset.pgEdit]; });
    } catch {}
  }
  function save() {
    const data = {};
    editors.forEach(e => { data[e.dataset.pgEdit] = e.value; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }
  function run() {
    const data = {};
    editors.forEach(e => { data[e.dataset.pgEdit] = e.value; });
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${data.css || ''}</style></head><body>${data.html || ''}<script>try{${data.js || ''}}catch(e){document.body.insertAdjacentHTML('beforeend','<pre style=\\'color:red;padding:8px;font-family:monospace\\'>JS error: '+e.message+'</pre>')}<\/script></body></html>`;
    preview.srcdoc = doc;
    save();
  }

  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    editors.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    editors.find(e => e.dataset.pgEdit === t.dataset.pg).classList.add('active');
  }));
  editors.forEach(e => e.addEventListener('input', () => { clearTimeout(setupPlayground._t); setupPlayground._t = setTimeout(save, 500); }));
  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset code to default?')) return;
    editors.forEach(e => { e.value = DEFAULTS[e.dataset.pgEdit]; });
    save();
    run();
  });

  load();
  run();
})();

// ===================== AI Capstone Project Generator =====================
(function setupCapstone() {
  const btn = $('#cap-go');
  const out = $('#cap-output');
  const actions = $('#cap-actions');
  if (!btn || !out) return;

  let lastText = '';

  btn.addEventListener('click', async () => {
    const course = $('#cap-course').value;
    const domain = $('#cap-domain').value.trim();
    const users = $('#cap-users').value.trim();
    const tech = $('#cap-tech').value;
    const notes = $('#cap-notes').value.trim();

    if (!domain) { toast('Add a problem domain'); return; }

    btn.disabled = true;
    btn.textContent = 'Generating... (15-25s)';
    out.hidden = false;
    out.textContent = 'AI is drafting your proposal...';

    const prompt = `Generate a complete capstone/thesis proposal for a Filipino college student.

Student details:
- Course: ${course}
- Problem domain: ${domain}
- Target users: ${users || 'general PH users'}
- Tech preference: ${tech}
${notes ? '- Additional notes: ' + notes : ''}

Output the proposal with these EXACT sections (use markdown):

## 📌 Proposed Title
[A specific, compelling thesis title with location/context]

## 📝 Background
[2-paragraph background, Philippine context]

## ❓ Statement of the Problem
[Main problem in 1 sentence, then 3-4 specific sub-problems as numbered list]

## 🎯 Objectives
[1 general objective + 4 specific objectives, action verbs]

## 🌟 Significance of the Study
[3-4 stakeholders and how they benefit, bullet form]

## 🔬 Scope and Delimitation
[What it includes, what it excludes]

## ⚙️ Methodology
[Research design + system development methodology if applicable. Be specific.]

## 📅 12-Week Schedule
[Week-by-week breakdown table format]

## 📚 Suggested References (Topics to Search)
[5 specific search queries for Google Scholar]

Keep it formal, specific to Philippine context, and use Taglish only in informal notes if any.`;

    const json = await callAI({ question: prompt, mode: 'research' });
    if (json.ok && json.text) {
      lastText = json.text;
      out.innerHTML = json.text.split('\n').map(line => {
        if (/^##\s/.test(line)) return `<h3 style="font-size:15px;font-weight:700;color:var(--ph-blue);margin-top:18px;margin-bottom:8px;">${line.replace(/^##\s/, '')}</h3>`;
        if (/^###\s/.test(line)) return `<h4 style="font-size:13px;font-weight:600;margin-top:12px;">${line.replace(/^###\s/, '')}</h4>`;
        if (/^[-*]\s/.test(line)) return `<li>${line.replace(/^[-*]\s/, '')}</li>`;
        if (/^\d+\.\s/.test(line)) return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
        if (!line.trim()) return '<br>';
        return `<p>${line}</p>`;
      }).join('');
      actions.hidden = false;
      actions.style.display = 'grid';
      toast('Proposal generated!');
    } else {
      out.textContent = json.error || 'AI is busy. Try again in 10 seconds.';
    }
    btn.disabled = false;
    btn.textContent = 'Generate proposal ✨';
  });

  $('#cap-copy')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(lastText); toast('Copied!'); } catch {}
  });
  $('#cap-word')?.addEventListener('click', () => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Capstone Proposal</title><style>body{font-family:Calibri,sans-serif;line-height:1.6;max-width:800px;margin:40px auto;padding:40px;}h1,h2,h3{color:#0038A8;}h2{font-size:18pt;border-bottom:2pt solid #0038A8;padding-bottom:4pt;}</style></head><body>${out.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'capstone-proposal.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();

// ===================== AI Thesis Section Writer =====================
(function setupThesis() {
  const btn = $('#thes-go');
  const out = $('#thes-output');
  const actions = $('#thes-actions');
  if (!btn || !out) return;

  const SECTION_KEY = 'thesis-section-cache-v1';
  const cache = JSON.parse(localStorage.getItem(SECTION_KEY) || '{}');

  // Restore last edits
  $('#thes-section').addEventListener('change', () => {
    const s = $('#thes-section').value;
    if (cache[s]) { out.innerHTML = cache[s]; out.hidden = false; actions.hidden = false; actions.style.display = 'grid'; }
  });

  out.addEventListener('input', () => {
    const s = $('#thes-section').value;
    cache[s] = out.innerHTML;
    try { localStorage.setItem(SECTION_KEY, JSON.stringify(cache)); } catch {}
  });

  btn.addEventListener('click', async () => {
    const section = $('#thes-section').value;
    const title = $('#thes-title').value.trim();
    const context = $('#thes-context').value.trim();
    const style = $('#thes-style').value;

    if (!context) { toast('Add brief context'); return; }

    btn.disabled = true;
    btn.textContent = 'Drafting... (15s)';
    out.hidden = false;
    out.textContent = 'AI is writing...';

    const sectionGuide = {
      introduction: 'Draft a Chapter 1 Introduction (300 words). Hook + context + problem importance + what the study will do.',
      background: 'Write the Background of the Study section (250 words). Establish global → national → local context.',
      problem: 'Write a Statement of the Problem with 1 main question + 3-4 sub-questions, plus a 2-sentence rationale.',
      objectives: 'Draft 1 general objective + 4-5 specific objectives, using strong action verbs (analyze, design, develop, evaluate, determine).',
      significance: 'Write Significance of the Study, list 3-4 stakeholder groups + specific benefits for each.',
      scope: 'Write Scope and Delimitation: what is included, what is excluded, time/place/respondent limits.',
      rrl: 'Draft a Review of Related Literature outline with 4-5 thematic sections. Suggest 3-5 source search queries for each.',
      methodology: `Draft a ${style} research methodology section: design, respondents, sampling, instruments, data collection procedure, statistical/thematic treatment.`,
      instruments: 'Draft a Research Instruments section: type of instrument, structure, scoring (e.g. Likert scale), validation process.',
      'data-analysis': `Draft Data Analysis Plan for ${style} approach. Include specific stat tools (frequency, weighted mean, t-test, ANOVA, etc.) or coding methods.`,
      'results-template': 'Draft an outline + sample placeholder text for Chapter 4 (Results & Discussion). Include 2-3 sample table/figure captions.',
      conclusion: 'Draft Chapter 5 Conclusion + Recommendations. 3-4 conclusion points tied to objectives + 4-5 recommendations.',
      abstract: 'Draft a 250-word Abstract: background, purpose, methods, key findings (placeholders OK), conclusion. 4 keywords at end.',
    };

    const prompt = `You are helping a Filipino college student with their ${style} thesis titled: "${title || 'Untitled'}"

Context: ${context}

Task: ${sectionGuide[section] || 'Draft this thesis section.'}

Output in markdown. Use clear academic English. Don't fabricate data or specific statistics. Use [bracketed placeholders] for things the student must fill in themselves.`;

    const json = await callAI({ question: prompt, mode: 'research' });
    if (json.ok && json.text) {
      const html = json.text.split('\n').map(line => {
        if (/^##\s/.test(line)) return `<h3 style="font-size:15px;font-weight:700;color:var(--ph-blue);margin-top:18px;margin-bottom:8px;">${line.replace(/^##\s/, '')}</h3>`;
        if (/^###\s/.test(line)) return `<h4 style="font-size:13px;font-weight:600;margin-top:12px;">${line.replace(/^###\s/, '')}</h4>`;
        if (/^[-*]\s/.test(line)) return `<li>${line.replace(/^[-*]\s/, '')}</li>`;
        if (/^\d+\.\s/.test(line)) return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
        if (!line.trim()) return '<br>';
        return `<p>${line}</p>`;
      }).join('');
      out.innerHTML = html;
      cache[section] = html;
      try { localStorage.setItem(SECTION_KEY, JSON.stringify(cache)); } catch {}
      actions.hidden = false;
      actions.style.display = 'grid';
      toast('Section drafted! Edit directly above.');
    } else {
      out.textContent = json.error || 'AI busy. Try again.';
    }
    btn.disabled = false;
    btn.textContent = 'Draft this section ✨';
  });

  $('#thes-copy')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(out.innerText); toast('Copied!'); } catch {}
  });
  $('#thes-word')?.addEventListener('click', () => {
    const section = $('#thes-section').selectedOptions[0].text;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${section}</title><style>body{font-family:Calibri,sans-serif;line-height:1.6;max-width:800px;margin:40px auto;padding:40px;}h3{color:#0038A8;}</style></head><body><h2>${section}</h2>${out.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = section.toLowerCase().replace(/[^a-z]+/g, '-') + '.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();

// ===================== 12-Week Capstone Tracker =====================
(function setupTracker() {
  const container = $('#tracker-weeks');
  const fill = $('#tracker-fill');
  const doneEl = $('#tracker-done');
  const totalEl = $('#tracker-total');
  const pctEl = $('#tracker-percent');
  const resetBtn = $('#tracker-reset');
  if (!container) return;

  const STORAGE = 'tracker-progress-v1';
  const WEEKS = [
    ['Week 1 — Topic & Pre-Proposal', [
      'Brainstorm 3 topic ideas with team',
      'Check existing literature (avoid duplicates)',
      'Pick a single topic and write a 1-paragraph pitch',
      'Get adviser feedback on pitch',
    ]],
    ['Week 2 — Proposal Draft', [
      'Write Statement of the Problem',
      'Write Objectives (general + specific)',
      'Draft Scope and Delimitation',
      'Schedule proposal defense',
    ]],
    ['Week 3 — Proposal Defense', [
      'Create defense slides (max 15)',
      'Practice defense 3 times',
      'Defend proposal',
      'Apply panel revisions',
    ]],
    ['Week 4-5 — RRL', [
      'Search 15+ academic sources',
      'Group sources by theme',
      'Write thematic RRL (~10 pages)',
      'Adviser review of RRL',
    ]],
    ['Week 6 — Methodology', [
      'Finalize research design (qualitative/quantitative)',
      'Build research instrument (survey/interview guide)',
      'Validate instrument with experts',
      'Get ethics clearance if needed',
    ]],
    ['Week 7-8 — Data Collection / Development', [
      'Collect data OR start system development',
      'Track issues / version control',
      'Document progress weekly',
      'Weekly adviser sync',
    ]],
    ['Week 9 — Analysis / Testing', [
      'Run data analysis (stats / coding)',
      'OR conduct user acceptance testing',
      'Document findings + create tables/figures',
      'Adviser review of results',
    ]],
    ['Week 10 — Chapter 4 & 5', [
      'Write Chapter 4 (Results & Discussion)',
      'Write Chapter 5 (Conclusion & Recommendations)',
      'Write Abstract',
      'Full manuscript review',
    ]],
    ['Week 11 — Pre-Defense Prep', [
      'Finalize manuscript with proper formatting',
      'Create defense slides (under 20)',
      'Practice defense Q&A',
      'Mock defense with adviser',
    ]],
    ['Week 12 — Defense & Revisions', [
      'Final defense',
      'Apply panel revisions',
      'Get adviser + dean signatures',
      'Submit final bound copy',
    ]],
  ];

  let state = {};
  try { state = JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch {}

  let totalTasks = 0;
  WEEKS.forEach(([_, tasks]) => totalTasks += tasks.length);

  function render() {
    container.innerHTML = '';
    let done = 0;
    WEEKS.forEach(([title, tasks], wi) => {
      const week = document.createElement('div');
      week.className = 'tracker-week';
      week.innerHTML = `<div class="tracker-week-head">${title}</div>`;
      tasks.forEach((task, ti) => {
        const key = `w${wi}t${ti}`;
        const checked = state[key];
        if (checked) done++;
        const taskEl = document.createElement('div');
        taskEl.className = 'tracker-task' + (checked ? ' done' : '');
        taskEl.innerHTML = `<input type="checkbox" id="${key}" ${checked ? 'checked' : ''} /><label for="${key}">${task}</label>`;
        taskEl.querySelector('input').addEventListener('change', (e) => {
          state[key] = e.target.checked;
          try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch {}
          render();
        });
        week.appendChild(taskEl);
      });
      container.appendChild(week);
    });
    totalEl.textContent = totalTasks;
    doneEl.textContent = done;
    const pct = Math.round((done / totalTasks) * 100);
    pctEl.textContent = pct;
    fill.style.width = pct + '%';
  }

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all progress?')) return;
    state = {};
    try { localStorage.removeItem(STORAGE); } catch {}
    render();
  });

  render();
})();

// ===================== Year + footer share + dynamic touches =====================
(function setupDynamic() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Footer share trigger
  const fs = document.getElementById('footer-share');
  if (fs) fs.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('fab-share')?.click();
  });
})();

// ===================== Share button =====================
(function setupShare() {
  const btn = $('#fab-share');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const url = 'https://ph-public-api.vercel.app';
    const data = {
      title: 'PH StudentKit — Free APIs + AI tutor for Filipino students',
      text: 'Lahat-libre platform para sa mga estudyanteng Pilipino. AI tutor, study tools, free Office, programming resources, scholarships, free APIs.',
      url,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        toast('Link copied! Share with classmates.');
      }
    } catch (e) { /* user cancelled */ }
  });
})();

// ===================== Stats counter =====================
(function setupStats() {
  fetch(API_BASE + '/scholarships').then(r => r.json()).then(j => {
    const el = $('[data-stat="scholarships"]');
    const n = j.count ?? (j.data ? j.data.length : 0);
    if (el && n > 0) el.textContent = n;
  }).catch(() => {});
})();
