const express = require('express');
const cors = require('cors');
const regionsRouter = require('./routes/regions');
const holidaysRouter = require('./routes/holidays');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Philippines Public Data API',
    version: '0.1.0',
    endpoints: ['/regions', '/holidays', '/provinces', '/cities', '/schools'],
    docs: 'https://github.com/CharlieJamesGwapo/ph-public-api',
  });
});

app.use('/regions', regionsRouter);
app.use('/holidays', holidaysRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PH Public Data API listening on http://localhost:${PORT}`);
});
