const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'regions');

function loadAllRegions() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')));
}

router.get('/', (req, res) => {
  let regions = loadAllRegions();
  if (req.query.island_group) {
    regions = regions.filter(
      (r) => r.island_group.toLowerCase() === req.query.island_group.toLowerCase()
    );
  }
  res.json({ count: regions.length, data: regions });
});

router.get('/:code', (req, res) => {
  const region = loadAllRegions().find(
    (r) => r.code.toLowerCase() === req.params.code.toLowerCase()
  );
  if (!region) return res.status(404).json({ error: 'Region not found' });
  res.json(region);
});

module.exports = router;
