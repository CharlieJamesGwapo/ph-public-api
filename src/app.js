const express = require('express');
const cors = require('cors');
const regionsRouter = require('./routes/regions');
const holidaysRouter = require('./routes/holidays');
const citiesRouter = require('./routes/cities');
const schoolsRouter = require('./routes/schools');
const currencyRouter = require('./routes/currency');
const weatherRouter = require('./routes/weather');
const scholarshipsRouter = require('./routes/scholarships');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({
    name: 'Philippines Public Data API',
    version: '0.3.0',
    tagline: 'Free, open-source data + AI tutor for Filipino students',
    endpoints: [
      '/regions',
      '/holidays',
      '/cities',
      '/schools',
      '/scholarships',
      '/currency',
      '/currency/convert?from=PHP&to=USD&amount=100',
      '/weather/cities',
      '/weather/:city',
      '/ai (POST {question, history})',
    ],
    docs: 'https://github.com/CharlieJamesGwapo/ph-public-api',
  });
});

app.use('/regions', regionsRouter);
app.use('/holidays', holidaysRouter);
app.use('/cities', citiesRouter);
app.use('/schools', schoolsRouter);
app.use('/scholarships', scholarshipsRouter);
app.use('/currency', currencyRouter);
app.use('/weather', weatherRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

module.exports = app;
