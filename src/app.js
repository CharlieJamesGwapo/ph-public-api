const express = require('express');
const cors = require('cors');
const regionsRouter = require('./routes/regions');
const holidaysRouter = require('./routes/holidays');
const citiesRouter = require('./routes/cities');
const schoolsRouter = require('./routes/schools');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({
    name: 'Philippines Public Data API',
    version: '0.2.0',
    endpoints: ['/regions', '/holidays', '/cities', '/schools'],
    docs: 'https://github.com/CharlieJamesGwapo/ph-public-api',
  });
});

app.use('/regions', regionsRouter);
app.use('/holidays', holidaysRouter);
app.use('/cities', citiesRouter);
app.use('/schools', schoolsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

module.exports = app;
