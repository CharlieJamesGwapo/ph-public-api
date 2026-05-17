const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'free-office');

function loadAll() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')));
}

router.get('/', (req, res) => {
  let items = loadAll();
  if (req.query.platform) {
    const p = req.query.platform.toLowerCase();
    items = items.filter((it) => it.platforms.some((pl) => pl.toLowerCase().includes(p)));
  }
  res.json({ count: items.length, data: items });
});

router.get('/:slug', (req, res) => {
  const item = loadAll().find((it) => it.slug === req.params.slug.toLowerCase());
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

module.exports = router;
