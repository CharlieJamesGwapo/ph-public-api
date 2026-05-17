const express = require('express');
const router = express.Router();

let cache = { ts: 0, data: null };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchPHPRates() {
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL_MS) return cache.data;

  const res = await fetch('https://open.er-api.com/v6/latest/PHP');
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const upstream = await res.json();

  const data = {
    base: 'PHP',
    base_name: 'Philippine Peso',
    updated_at: upstream.time_last_update_utc,
    rates: upstream.rates,
  };
  cache = { ts: now, data };
  return data;
}

router.get('/', async (_req, res) => {
  try {
    const data = await fetchPHPRates();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch rates', detail: e.message });
  }
});

router.get('/convert', async (req, res) => {
  const { from = 'PHP', to = 'USD', amount = '1' } = req.query;
  const amt = parseFloat(amount);
  if (Number.isNaN(amt)) return res.status(400).json({ error: 'amount must be a number' });
  try {
    const data = await fetchPHPRates();
    // We only have PHP base; derive others through PHP cross
    const phpToFrom = from === 'PHP' ? 1 : data.rates[from.toUpperCase()];
    const phpToTo = to === 'PHP' ? 1 : data.rates[to.toUpperCase()];
    if (!phpToFrom || !phpToTo) return res.status(400).json({ error: 'unknown currency code' });
    const result = (amt / phpToFrom) * phpToTo;
    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amt,
      result: Number(result.toFixed(4)),
      rate: Number((phpToTo / phpToFrom).toFixed(6)),
      updated_at: data.updated_at,
    });
  } catch (e) {
    res.status(502).json({ error: 'Failed to convert', detail: e.message });
  }
});

module.exports = router;
