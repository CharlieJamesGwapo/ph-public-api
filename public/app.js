// Lightweight progressive enhancement — no framework needed.

const API_BASE = window.location.origin;

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

// --- Hero copy button ---
const copyBtn = document.getElementById('hero-copy');
const heroUrl = document.getElementById('hero-url');
if (copyBtn && heroUrl) {
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
    } catch (e) {
      heroUrl.select();
      document.execCommand('copy');
    }
  });
}

// --- Try-it interactive demo ---
const trySelect = document.getElementById('try-endpoint');
const tryBtn = document.getElementById('try-send');
const tryOut = document.getElementById('try-output');

async function runTry() {
  const path = trySelect.value;
  tryOut.innerHTML = `<code class="null">// GET ${path}\n// loading…</code>`;
  const t0 = performance.now();
  try {
    const res = await fetch(API_BASE + path);
    const data = await res.json();
    const ms = Math.round(performance.now() - t0);
    tryOut.innerHTML = `<code><span class="null">// ${res.status} OK · ${ms}ms</span>\n${colorizeJson(data)}</code>`;
  } catch (e) {
    tryOut.innerHTML = `<code class="err">// Error: ${e.message}</code>`;
  }
}

if (tryBtn) tryBtn.addEventListener('click', runTry);
if (trySelect) trySelect.addEventListener('change', runTry);

// Auto-run once on page load so users see real output
if (tryBtn) runTry();

// --- Endpoint card click → jump to try-it ---
document.querySelectorAll('.endpoint-card').forEach((card) => {
  card.addEventListener('click', () => {
    const ep = card.dataset.endpoint;
    if (!ep) return;
    const option = Array.from(trySelect.options).find((o) => o.value === ep);
    if (option) trySelect.value = ep;
    document.getElementById('try').scrollIntoView({ behavior: 'smooth' });
    setTimeout(runTry, 400);
  });
  card.style.cursor = 'pointer';
});

// --- Live stats counters ---
async function loadStats() {
  const targets = {
    regions: '/regions',
    holidays: '/holidays',
    schools: '/schools',
    cities: '/cities',
  };
  for (const [key, path] of Object.entries(targets)) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) continue;
      const json = await res.json();
      const n = json.count ?? (Array.isArray(json.data) ? json.data.length : 0);
      const el = document.querySelector(`[data-stat="${key}"]`);
      if (el && n > 0) el.textContent = n;
    } catch (e) {
      /* ignore */
    }
  }
}
loadStats();
