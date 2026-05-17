# 🇵🇭 Philippines Public Data API

A free, open-source REST API serving useful public data about the Philippines.

**Live:** https://ph-public-api.vercel.app

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API metadata |
| GET | `/regions` | All 17 regions (filter: `?island_group=Luzon\|Visayas\|Mindanao`) |
| GET | `/regions/:code` | Single region by code (e.g. `R10`, `NCR`, `BARMM`) |
| GET | `/holidays` | All holidays (filter: `?year=2026`, `?type=regular`) |
| GET | `/cities` | All cities (filter: `?region=R10`, `?province=Cebu`) |
| GET | `/schools` | All schools (filter: `?region=R10`, `?type=State`) |
| GET | `/schools/:code` | Single school by code (e.g. `UP`, `MOSCAT`) |

## Examples

```bash
# All regions in Mindanao
curl https://ph-public-api.vercel.app/regions?island_group=Mindanao

# 2026 regular holidays
curl 'https://ph-public-api.vercel.app/holidays?year=2026&type=regular'

# Schools in Region X (Northern Mindanao)
curl https://ph-public-api.vercel.app/schools?region=R10
```

## Local development

```bash
git clone https://github.com/CharlieJamesGwapo/ph-public-api.git
cd ph-public-api
npm install
npm start
# API runs at http://localhost:3000
```

## Data sources

All data sourced from public records (PSGC, official government sites, CHED).

## Contributing

Found a typo or missing data? PRs welcome. Add a new entry as a `.json` file under the relevant `data/` subdirectory.

## License

MIT — free for any use.

## Maintainer

Charlie James Abejo ([@CharlieJamesGwapo](https://github.com/CharlieJamesGwapo))
