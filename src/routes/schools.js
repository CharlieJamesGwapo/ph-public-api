const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'schools');

function loadAll() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')));
}

router.get('/', (req, res) => {
  let schools = loadAll();
  if (req.query.region) {
    schools = schools.filter(
      (s) => s.region && s.region.toLowerCase() === req.query.region.toLowerCase()
    );
  }
  if (req.query.type) {
    schools = schools.filter(
      (s) => s.type && s.type.toLowerCase().includes(req.query.type.toLowerCase())
    );
  }
  res.json({ count: schools.length, data: schools });
});

router.get('/:code', (req, res) => {
  const school = loadAll().find(
    (s) => s.code && s.code.toLowerCase() === req.params.code.toLowerCase()
  );
  if (!school) return res.status(404).json({ error: 'School not found' });
  res.json(school);
});

module.exports = router;
