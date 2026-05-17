const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'cities');

function loadAll() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')));
}

router.get('/', (req, res) => {
  let cities = loadAll();
  if (req.query.region) {
    cities = cities.filter(
      (c) => c.region && c.region.toLowerCase() === req.query.region.toLowerCase()
    );
  }
  if (req.query.province) {
    cities = cities.filter(
      (c) => c.province && c.province.toLowerCase().includes(req.query.province.toLowerCase())
    );
  }
  res.json({ count: cities.length, data: cities });
});

module.exports = router;
