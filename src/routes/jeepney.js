const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const POOL_PATH = path.join(__dirname, '..', '..', 'scripts', 'data-pool.json');

function loadAll() {
  try {
    const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf8'));
    return pool.jeepney_routes || [];
  } catch {
    return [];
  }
}

router.get('/', (req, res) => {
  let items = loadAll();
  if (req.query.city) {
    const c = req.query.city.toLowerCase();
    items = items.filter((it) => it.city && it.city.toLowerCase().includes(c));
  }
  res.json({ count: items.length, data: items });
});

router.get('/:code', (req, res) => {
  const item = loadAll().find((it) => it.code && it.code.toLowerCase() === req.params.code.toLowerCase());
  if (!item) return res.status(404).json({ error: 'Route not found' });
  res.json(item);
});

module.exports = router;
