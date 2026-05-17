const express = require('express');
const cors = require('cors');
const regionsRouter = require('./routes/regions');
const holidaysRouter = require('./routes/holidays');
const citiesRouter = require('./routes/cities');
const schoolsRouter = require('./routes/schools');
const currencyRouter = require('./routes/currency');
const weatherRouter = require('./routes/weather');
const scholarshipsRouter = require('./routes/scholarships');
const triviaRouter = require('./routes/trivia');
const freeOfficeRouter = require('./routes/free-office');
const jeepneyRouter = require('./routes/jeepney');
const barangaysRouter = require('./routes/barangays');
const imageRouter = require('./routes/image');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({
    name: 'Philippines Public Data API',
    version: '0.5.0',
    tagline: 'Free APIs + AI tutor + study tools for Filipino students',
    endpoints: [
      '/regions', '/holidays', '/cities', '/schools',
      '/scholarships', '/currency', '/currency/convert',
      '/weather/cities', '/weather/:city',
      '/trivia', '/trivia/random',
      '/free-office', '/free-office/:slug',
      '/jeepney', '/jeepney/:code',
      '/barangays',
      '/image?prompt=...',
      '/ai (POST {question, history, mode})',
    ],
    ai_modes: ['general', 'coding', 'research', 'writing', 'math'],
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
app.use('/trivia', triviaRouter);
app.use('/free-office', freeOfficeRouter);
app.use('/jeepney', jeepneyRouter);
app.use('/barangays', barangaysRouter);
app.use('/image', imageRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

module.exports = app;
