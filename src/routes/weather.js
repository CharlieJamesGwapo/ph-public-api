const express = require('express');
const router = express.Router();

// Built-in PH city coordinates (lat,lon)
const CITY_COORDS = {
  'manila': { lat: 14.5995, lon: 120.9842, name: 'Manila' },
  'quezon-city': { lat: 14.6760, lon: 121.0437, name: 'Quezon City' },
  'cebu-city': { lat: 10.3157, lon: 123.8854, name: 'Cebu City' },
  'davao-city': { lat: 7.1907, lon: 125.4553, name: 'Davao City' },
  'cagayan-de-oro': { lat: 8.4542, lon: 124.6319, name: 'Cagayan de Oro' },
  'iloilo-city': { lat: 10.7202, lon: 122.5621, name: 'Iloilo City' },
  'bacolod': { lat: 10.6770, lon: 122.9509, name: 'Bacolod' },
  'baguio': { lat: 16.4023, lon: 120.5960, name: 'Baguio' },
  'zamboanga-city': { lat: 6.9214, lon: 122.0790, name: 'Zamboanga City' },
  'tacloban': { lat: 11.2400, lon: 125.0028, name: 'Tacloban' },
  'general-santos': { lat: 6.1164, lon: 125.1716, name: 'General Santos' },
  'butuan': { lat: 8.9492, lon: 125.5436, name: 'Butuan' },
  'iligan': { lat: 8.2289, lon: 124.2452, name: 'Iligan' },
  'puerto-princesa': { lat: 9.7392, lon: 118.7353, name: 'Puerto Princesa' },
  'tuguegarao': { lat: 17.6131, lon: 121.7269, name: 'Tuguegarao' },
  'legazpi': { lat: 13.1391, lon: 123.7438, name: 'Legazpi' },
  'naga': { lat: 13.6218, lon: 123.1948, name: 'Naga' },
  'dumaguete': { lat: 9.3068, lon: 123.3054, name: 'Dumaguete' },
  'tagbilaran': { lat: 9.6543, lon: 123.8559, name: 'Tagbilaran' },
  'surigao-city': { lat: 9.7889, lon: 125.4940, name: 'Surigao City' },
};

router.get('/cities', (_req, res) => {
  res.json({
    count: Object.keys(CITY_COORDS).length,
    data: Object.entries(CITY_COORDS).map(([slug, c]) => ({ slug, ...c })),
  });
});

router.get('/:city', async (req, res) => {
  const slug = req.params.city.toLowerCase();
  const place = CITY_COORDS[slug];
  if (!place) return res.status(404).json({ error: 'Unknown city slug', try: '/weather/cities' });

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FManila`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const j = await r.json();
    res.json({
      city: place.name,
      slug,
      coordinates: { lat: place.lat, lon: place.lon },
      current: j.current,
      units: j.current_units,
      timezone: j.timezone,
    });
  } catch (e) {
    res.status(502).json({ error: 'weather fetch failed', detail: e.message });
  }
});

module.exports = router;
