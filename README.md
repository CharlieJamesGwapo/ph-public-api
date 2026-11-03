# 🇵🇭 Philippines Public Data API

[![Live](https://img.shields.io/website?url=https%3A%2F%2Fph-public-api.vercel.app%2Fapi&label=api&up_message=online)](https://ph-public-api.vercel.app/api)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/CharlieJamesGwapo/ph-public-api?style=social)](https://github.com/CharlieJamesGwapo/ph-public-api)

A free REST API with Philippine data for student projects, capstones and hackathons. **No API key, no sign-up, CORS enabled**, so you can call it straight from the browser.

**Live:** https://ph-public-api.vercel.app · **Endpoint list:** https://ph-public-api.vercel.app/api

```js
const res = await fetch('https://ph-public-api.vercel.app/holidays?year=2026');
const { count, data } = await res.json();
console.log(`${count} holidays`, data[0]); // { date: '2026-01-01', name: "New Year's Day", type: 'regular', ... }
```

## Endpoints

| Endpoint | What you get | Filters |
|---|---|---|
| `GET /regions` | All 17 regions | `?island_group=Luzon\|Visayas\|Mindanao` |
| `GET /regions/:code` | One region (`NCR`, `R10`, `BARMM`) | |
| `GET /holidays` | Regular and special holidays for 2026 and 2027 | `?year=2026`, `?type=regular` |
| `GET /cities` | Cities with province, region, population and income class | `?region=R10`, `?province=Cebu` |
| `GET /barangays` | Sample barangays in 5 big cities (CDO, Manila, Davao, QC, Cebu) | `?city=`, `?region=` |
| `GET /schools` | Universities and colleges | `?region=R10`, `?type=State` |
| `GET /schools/:code` | One school (`UP`, `MOSCAT`) | |
| `GET /scholarships` | CHED, DOST, DSWD, UniFAST and private scholarships with amounts and deadline windows | `?level=`, `?agency=` |
| `GET /scholarships/:code` | One scholarship | |
| `GET /jeepney` | Jeepney routes with start, end and fare | `?city=` |
| `GET /jeepney/:code` | One route | |
| `GET /currency` | PHP exchange rates (from open.er-api.com) | |
| `GET /currency/convert` | Convert between currencies | `?from=USD&to=PHP&amount=10` |
| `GET /weather/cities` | The 20 cities with weather support | |
| `GET /weather/:city` | Current weather (from Open-Meteo) | e.g. `/weather/manila` |
| `GET /trivia` | Philippine trivia facts | `?category=Geography` |
| `GET /trivia/random` | One random fact | |
| `GET /free-office` | Free office and productivity tools for students | `?platform=` |
| `GET /image` | Returns a free AI image URL (Pollinations.ai) | `?prompt=jeepney&width=768&height=768` |

List endpoints return `{ "count": n, "data": [...] }`.

## Examples

```bash
# Regions in Mindanao
curl 'https://ph-public-api.vercel.app/regions?island_group=Mindanao'

# 10 USD in pesos
curl 'https://ph-public-api.vercel.app/currency/convert?from=USD&to=PHP&amount=10'

# State universities in Region X
curl 'https://ph-public-api.vercel.app/schools?region=R10&type=State'
```

```python
import requests

r = requests.get("https://ph-public-api.vercel.app/scholarships", params={"level": "Undergraduate"})
for s in r.json()["data"]:
    print(s["name"], s["amount_php_per_year"])
```

## Project ideas

- **Holiday countdown** widget for your school org's page
- **Scholarship finder** that filters by level and agency
- **Jeepney fare calculator** for your city
- **Weather + trivia** Discord or Messenger bot
- **Region and city dropdowns** for a signup form

Built something with it? Open an issue or PR and add it to a "Built with" list here.

## Data coverage and sources

Data comes from public records (PSGC, official government sites, CHED, DOST). Some datasets are partial on purpose. **Cities, barangays and jeepney routes don't cover the whole country yet.** Check the `count` field, and don't treat this as an official source for anything important.

## Contributing

Adding data is the easiest first contribution:

1. Add or fix a `.json` file under the matching `data/` folder (for example, a missing city or your city's jeepney routes).
2. Run `npm install && npm start`, then check your entry at `http://localhost:3000`.
3. Open a PR and name your source.

## Run locally

```bash
git clone https://github.com/CharlieJamesGwapo/ph-public-api.git
cd ph-public-api
npm install
npm start   # http://localhost:3000
```

## Support

If this saved you time on a project, **star the repo** so other students can find it, or [sponsor the maintainer](https://github.com/sponsors/CharlieJamesGwapo).

## License

MIT. Maintained by Charlie James Abejo ([@CharlieJamesGwapo](https://github.com/CharlieJamesGwapo)).
