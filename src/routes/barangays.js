const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const POOL_PATH = path.join(__dirname, '..', '..', 'scripts', 'data-pool.json');

function loadAll() {
  try {
    const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf8'));
    return pool.barangays || [];
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
  if (req.query.region) {
    const r = req.query.region.toLowerCase();
    items = items.filter((it) => it.region && it.region.toLowerCase() === r);
  }
  res.json({ count: items.length, data: items });
});

module.exports = router;
