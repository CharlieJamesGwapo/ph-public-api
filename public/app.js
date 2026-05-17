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

// ===================== Resume Builder =====================
(function setupResumeBuilder() {
  const btn = $('#r-go');
  const out = $('#r-output');
  const actions = $('#r-actions');
  if (!btn || !out) return;

  let lastHtml = '';

  function renderResume(text) {
    // Convert plain-text resume to styled HTML
    const lines = text.split('\n').filter(l => l.trim());
    const safe = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let html = '';
    for (const line of lines) {
      const t = line.trim();
      if (/^#\s+/.test(t)) html += `<h1>${safe(t.replace(/^#\s+/, ''))}</h1>`;
      else if (/^##\s+/.test(t)) html += `<h2>${safe(t.replace(/^##\s+/, ''))}</h2>`;
      else if (/^[-*•]\s+/.test(t)) html += `<p>• ${safe(t.replace(/^[-*•]\s+/, ''))}</p>`;
      else html += `<p>${safe(t)}</p>`;
    }
    return html;
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

    if (!name || !exp) { toast('At minimum: name + experience/projects'); return; }

    btn.disabled = true;
    btn.textContent = 'AI polishing... (15-20s)';

    const prompt = `Format this person's information into a polished, ATS-friendly one-page resume using markdown.
Output FORMAT (use these exact section markers):
# ${name}
${title ? title : ''}
[contact line: email · phone · location · links]

## SUMMARY
[2-sentence professional summary highlighting strongest aspects]

## EDUCATION
[education in clean bullet form]

## EXPERIENCE
[Each role as 2-4 bullets using STAR method. Quantify when possible. Rewrite weak bullets to be strong action-oriented.]

## SKILLS
[Grouped skills, comma-separated]

Use bullet points starting with "-" for items. Keep it formal English.

INPUT:
Name: ${name}
Title/Course: ${title}
Email: ${email}, Phone: ${phone}, Location: ${location}
Links: ${links}
Education: ${edu}
Experience/Projects: ${exp}
Skills: ${skills}`;

    const json = await callAI({ question: prompt, mode: 'career' });
    if (json.ok && json.text) {
      out.hidden = false;
      out.className = 'builder-output resume-rendered';
      out.innerHTML = renderResume(json.text);
      lastHtml = out.innerHTML;
      actions.hidden = false;
      actions.style.display = 'grid';
    } else {
      out.hidden = false;
      out.textContent = json.error || 'AI unavailable. Try again.';
    }
    btn.disabled = false;
    btn.textContent = 'Generate resume ✨';
  });

  $('#r-pdf')?.addEventListener('click', () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Resume</title><style>
      body { font-family: Inter, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #0F172A; }
      h1 { font-size: 28px; margin-bottom: 4px; }
      h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #0038A8; margin-top: 20px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #0038A8; }
      p { margin-bottom: 4px; line-height: 1.5; }
      @media print { body { margin: 0; padding: 20px; } }
    </style></head><body>${lastHtml}<script>setTimeout(()=>window.print(),500);<\/script></body></html>`);
  });

  $('#r-word')?.addEventListener('click', () => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Resume</title><style>
      body { font-family: Calibri, sans-serif; }
      h1 { font-size: 22pt; margin-bottom: 4pt; }
      h2 { font-size: 12pt; text-transform: uppercase; color: #0038A8; margin-top: 14pt; margin-bottom: 6pt; padding-bottom: 2pt; border-bottom: 1.5pt solid #0038A8; }
      p { margin-bottom: 4pt; line-height: 1.4; }
    </style></head><body>${lastHtml}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resume.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();

// ===================== Portfolio Builder =====================
(function setupPortfolioBuilder() {
  const btn = $('#p-go');
  const wrap = $('#p-preview-wrap');
  const iframe = $('#p-preview');
  if (!btn || !iframe) return;

  let lastDoc = '';

  const THEMES = {
    ph: { primary: '#0038A8', accent: '#CE1126', highlight: '#FCD116', bg: '#fff', fg: '#0F172A' },
    dark: { primary: '#60A5FA', accent: '#A78BFA', highlight: '#FBBF24', bg: '#0F172A', fg: '#F1F5F9' },
    minimal: { primary: '#000', accent: '#444', highlight: '#000', bg: '#FAFAFA', fg: '#171717' },
    warm: { primary: '#F97316', accent: '#DC2626', highlight: '#FBBF24', bg: '#FFF7ED', fg: '#1C1917' },
  };

  function buildHtml(name, tagline, about, projects, email, links, themeKey) {
    const t = THEMES[themeKey] || THEMES.ph;
    const proj = projects.split('\n').filter(l => l.trim()).map(l => {
      const [n, d] = l.split(':').map(s => (s || '').trim());
      return `<div class="proj"><h3>${n || 'Project'}</h3><p>${d || ''}</p></div>`;
    }).join('');
    const linkArr = links.split(',').map(l => l.trim()).filter(Boolean);
    const linksHtml = linkArr.map(l => `<a href="${l.startsWith('http') ? l : 'https://' + l}" target="_blank">${l.replace(/^https?:\/\//, '')}</a>`).join(' · ');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root { --p: ${t.primary}; --a: ${t.accent}; --h: ${t.highlight}; --bg: ${t.bg}; --fg: ${t.fg}; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, -apple-system, sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; }
  .container { max-width: 900px; margin: 0 auto; padding: 60px 24px; }
  header { padding: 40px 0; border-bottom: 1px solid color-mix(in srgb, var(--fg) 12%, transparent); margin-bottom: 60px; }
  h1 { font-size: 56px; font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(120deg, var(--p), var(--a), var(--h)); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1.1; }
  .tagline { font-size: 19px; color: color-mix(in srgb, var(--fg) 70%, transparent); margin-top: 12px; }
  section { margin-bottom: 60px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--p); margin-bottom: 20px; font-weight: 700; }
  .about { font-size: 18px; line-height: 1.7; }
  .projects { display: grid; gap: 20px; }
  @media (min-width: 640px) { .projects { grid-template-columns: 1fr 1fr; } }
  .proj { padding: 24px; border: 1px solid color-mix(in srgb, var(--fg) 14%, transparent); border-radius: 12px; transition: transform 200ms ease, border-color 200ms ease; }
  .proj:hover { transform: translateY(-2px); border-color: var(--p); }
  .proj h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .proj p { font-size: 14px; color: color-mix(in srgb, var(--fg) 70%, transparent); }
  footer { padding-top: 40px; border-top: 1px solid color-mix(in srgb, var(--fg) 12%, transparent); font-size: 14px; }
  footer a { color: var(--p); margin: 0 4px; }
  .contact { font-size: 16px; }
  .contact a { color: var(--p); font-weight: 600; }
</style></head><body><div class="container">
<header><h1>${name || 'Your Name'}</h1><p class="tagline">${tagline || ''}</p></header>
${about ? `<section><h2>About</h2><div class="about">${about}</div></section>` : ''}
${proj ? `<section><h2>Projects</h2><div class="projects">${proj}</div></section>` : ''}
${email ? `<section><h2>Contact</h2><div class="contact">📧 <a href="mailto:${email}">${email}</a></div></section>` : ''}
<footer>${linksHtml || ''} · Hosted free on Vercel</footer>
</div></body></html>`;
  }

  btn.addEventListener('click', async () => {
    const name = $('#p-name').value.trim();
    const tagline = $('#p-tagline').value.trim();
    let about = $('#p-about').value.trim();
    const projects = $('#p-projects').value.trim();
    const email = $('#p-email').value.trim();
    const links = $('#p-links').value.trim();
    const theme = $('#p-theme').value;

    if (!name) { toast('Add your name first'); return; }

    btn.disabled = true;
    btn.textContent = 'AI polishing About... (10s)';

    // Improve About section with AI
    if (about) {
      const json = await callAI({
        question: `Rewrite this About Me section for a portfolio website. Make it confident, specific, and 2-3 sentences max. Keep my voice. Output only the rewritten paragraph, nothing else.\n\nOriginal: "${about}"`,
        mode: 'career',
      });
      if (json.ok && json.text) about = json.text.replace(/^["']|["']$/g, '').trim();
    }

    const doc = buildHtml(name, tagline, about, projects, email, links, theme);
    lastDoc = doc;
    iframe.srcdoc = doc;
    wrap.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Regenerate ✨';
    toast('Portfolio generated. Scroll down to preview.');
  });

  $('#p-download')?.addEventListener('click', () => {
    const blob = new Blob([lastDoc], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded! Now upload to vercel.com/new');
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

// ===================== Stats counter =====================
(function setupStats() {
  fetch(API_BASE + '/scholarships').then(r => r.json()).then(j => {
    const el = $('[data-stat="scholarships"]');
    const n = j.count ?? (j.data ? j.data.length : 0);
    if (el && n > 0) el.textContent = n;
  }).catch(() => {});
})();
