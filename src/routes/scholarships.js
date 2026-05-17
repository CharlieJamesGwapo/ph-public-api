const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'scholarships');

function loadAll() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')));
}

router.get('/', (req, res) => {
  let items = loadAll();
  if (req.query.level) {
    items = items.filter(
      (s) => s.level && s.level.toLowerCase().includes(req.query.level.toLowerCase())
    );
  }
  if (req.query.agency) {
    items = items.filter(
      (s) => s.agency && s.agency.toLowerCase().includes(req.query.agency.toLowerCase())
    );
  }
  res.json({ count: items.length, data: items });
});

router.get('/:code', (req, res) => {
  const item = loadAll().find(
    (s) => s.code && s.code.toLowerCase() === req.params.code.toLowerCase()
  );
  if (!item) return res.status(404).json({ error: 'Scholarship not found' });
  res.json(item);
});

module.exports = router;
