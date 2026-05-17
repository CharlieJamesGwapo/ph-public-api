const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'holidays');

function loadAllHolidays() {
  const years = fs.readdirSync(DATA_DIR);
  const holidays = [];
  for (const year of years) {
    const yearDir = path.join(DATA_DIR, year);
    if (!fs.statSync(yearDir).isDirectory()) continue;
    for (const f of fs.readdirSync(yearDir)) {
      if (f.endsWith('.json')) {
        holidays.push(JSON.parse(fs.readFileSync(path.join(yearDir, f), 'utf8')));
      }
    }
  }
  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

router.get('/', (req, res) => {
  let holidays = loadAllHolidays();
  if (req.query.year) {
    holidays = holidays.filter((h) => String(h.year) === String(req.query.year));
  }
  if (req.query.type) {
    holidays = holidays.filter((h) => h.type === req.query.type);
  }
  res.json({ count: holidays.length, data: holidays });
});

module.exports = router;
