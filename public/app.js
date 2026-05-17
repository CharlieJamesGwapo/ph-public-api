/* PH StudentKit — comprehensive front-end JS (no framework).
   Sections: theme, mobile menu, hero copy, try-it, AI chat,
   GPA calc, Pomodoro, currency, word counter, citation, trivia,
   stats counter, free-office loader, FAB. */

const API_BASE = window.location.origin;

// ===================== Utils =====================
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

// ===================== Theme toggle =====================
(function setupTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
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
  const copyBtn = $('#hero-copy');
  const heroUrl = $('#hero-url');
  if (!copyBtn || !heroUrl) return;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(heroUrl.value);
      const label = copyBtn.querySelector('span');
      const original = label.textContent;
      label.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        label.textContent = original;
        copyBtn.classList.remove('copied');
      }, 1500);
    } catch {
      heroUrl.select();
      document.execCommand('copy');
    }
  });
})();

// ===================== Try-it demo =====================
(function setupTry() {
  const sel = $('#try-endpoint');
  const btn = $('#try-send');
  const out = $('#try-output');
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

  // Endpoint cards click → set try-it
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

// ===================== AI Chat =====================
(function setupAI() {
  const chat = $('#ai-chat');
  const form = $('#ai-form');
  const input = $('#ai-input');
  const sendBtn = $('#ai-send');
  if (!chat || !form || !input) return;

  const history = [];

  function append(role, text, isLoading = false) {
    const msg = document.createElement('div');
    msg.className = `ai-msg ai-msg-${role === 'user' ? 'user' : 'bot'}`;
    msg.innerHTML = `
      <div class="ai-avatar">${role === 'user' ? 'Me' : 'K'}</div>
      <div class="ai-bubble ${isLoading ? 'loading' : ''}"></div>
    `;
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
      const r = await fetch(API_BASE + '/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: history.slice(-6) }),
      });
      const json = await r.json();
      loadingBubble.classList.remove('loading');
      if (json.ok && json.text) {
        loadingBubble.textContent = json.text;
        history.push({ role: 'assistant', content: json.text });
      } else {
        loadingBubble.textContent = json.error || 'Sorry, may error sa AI. Try again later.';
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

  $$('.ai-chip').forEach(chip => chip.addEventListener('click', () => ask(chip.dataset.q)));

  // FAB jump to AI
  const fab = $('#fab-ai');
  if (fab) fab.addEventListener('click', () => {
    $('#ai').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => input.focus(), 600);
  });
})();

// ===================== GPA Calculator =====================
(function setupGPA() {
  const rows = $('#gpa-rows');
  const addBtn = $('#gpa-add');
  const resultNum = $('#gpa-result-num');
  const resultLabel = $('#gpa-result-label');
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
    const subjects = $$('.gpa-grid', rows);
    let totalUnits = 0, weighted = 0, count = 0;
    subjects.forEach(s => {
      const units = parseFloat(s.querySelector('.gpa-units').value) || 0;
      const grade = parseFloat(s.querySelector('.gpa-grade').value) || 0;
      if (units > 0 && grade > 0) {
        totalUnits += units;
        weighted += units * grade;
        count++;
      }
    });
    if (totalUnits === 0) {
      resultNum.textContent = '—';
      resultLabel.textContent = 'Add subjects';
      return;
    }
    const gpa = weighted / totalUnits;
    resultNum.textContent = gpa.toFixed(2);
    resultLabel.textContent = `${count} subjects · ${totalUnits} units · ${gradeWord(gpa)}`;
  }

  function bindRow(row) {
    row.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', calc);
      el.addEventListener('change', calc);
    });
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
  const display = $('#pomo-display');
  const state = $('#pomo-state');
  const startBtn = $('#pomo-start');
  const resetBtn = $('#pomo-reset');
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
    if (seconds > 0) {
      seconds--;
      render();
    } else {
      mode = mode === 'FOCUS' ? 'BREAK' : 'FOCUS';
      seconds = mode === 'FOCUS' ? FOCUS : BREAK;
      render();
      try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=').play(); } catch (e) {}
      toast(mode === 'FOCUS' ? '⏱️ Back to focus!' : '☕ Time for a break!', 3000);
    }
  }

  startBtn.addEventListener('click', () => {
    if (running) {
      clearInterval(tick); running = false; startBtn.textContent = 'Start';
    } else {
      tick = setInterval(step, 1000); running = true; startBtn.textContent = 'Pause';
    }
  });
  resetBtn.addEventListener('click', () => {
    clearInterval(tick); running = false; startBtn.textContent = 'Start';
    mode = 'FOCUS'; seconds = FOCUS; render();
  });
  render();
})();

// ===================== Currency Converter =====================
(function setupCurrency() {
  const amountEl = $('#curr-from-amount');
  const fromEl = $('#curr-from');
  const toEl = $('#curr-to');
  const swap = $('#curr-swap');
  const result = $('#curr-result');
  if (!amountEl || !result) return;

  let debounce;
  async function convert() {
    const amt = parseFloat(amountEl.value);
    const from = fromEl.value;
    const to = toEl.value;
    if (!amt || amt <= 0) { result.textContent = '—'; return; }
    result.textContent = 'Converting...';
    try {
      const r = await fetch(`${API_BASE}/currency/convert?from=${from}&to=${to}&amount=${amt}`);
      const j = await r.json();
      if (j.result != null) {
        result.textContent = `${amt.toLocaleString()} ${from} = ${j.result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`;
      } else {
        result.textContent = j.error || 'Failed';
      }
    } catch {
      result.textContent = 'Network error';
    }
  }

  [amountEl, fromEl, toEl].forEach(el => {
    el.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(convert, 400); });
  });
  swap.addEventListener('click', () => {
    const t = fromEl.value; fromEl.value = toEl.value; toEl.value = t;
    convert();
  });
  convert();
})();

// ===================== Word Counter =====================
(function setupWordCount() {
  const input = $('#word-input');
  if (!input) return;
  const words = $('#word-count-words');
  const chars = $('#word-count-chars');
  const read = $('#word-count-read');
  input.addEventListener('input', () => {
    const text = input.value;
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    words.textContent = wc.toLocaleString();
    chars.textContent = text.length.toLocaleString();
    read.textContent = Math.max(1, Math.ceil(wc / 200)) + 'm';
  });
})();

// ===================== Citation Generator (APA 7) =====================
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
    try {
      await navigator.clipboard.writeText(out.textContent);
      toast('Citation copied to clipboard');
    } catch {}
  });
})();

// ===================== Trivia =====================
(function setupTrivia() {
  const display = $('#trivia-display');
  const btn = $('#trivia-next');
  if (!display || !btn) return;
  async function load() {
    display.textContent = 'Loading...';
    try {
      const r = await fetch(API_BASE + '/trivia/random');
      const t = await r.json();
      display.innerHTML = `<strong>${t.category}:</strong> ${t.fact}`;
    } catch {
      display.textContent = 'Failed to load. Try again.';
    }
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
    .catch(() => {
      grid.innerHTML = '<p style="color: var(--fg-muted); text-align: center;">Failed to load. Refresh the page.</p>';
    });
})();

// ===================== Stats counter =====================
(function setupStats() {
  const targets = {
    scholarships: '/scholarships',
  };
  for (const [key, path] of Object.entries(targets)) {
    fetch(API_BASE + path).then(r => r.json()).then(j => {
      const el = $(`[data-stat="${key}"]`);
      const n = j.count ?? (j.data ? j.data.length : 0);
      if (el && n > 0) el.textContent = n;
    }).catch(() => {});
  }
})();
