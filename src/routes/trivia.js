const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'trivia');

function loadAll() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')));
}

router.get('/', (req, res) => {
  let items = loadAll();
  if (req.query.category) {
    items = items.filter(
      (t) => t.category && t.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  res.json({ count: items.length, data: items });
});

router.get('/random', (req, res) => {
  const items = loadAll();
  if (!items.length) return res.status(404).json({ error: 'no trivia' });
  const item = items[Math.floor(Math.random() * items.length)];
  res.json(item);
});

module.exports = router;
