# 🇵🇭 Philippines Public Data API

A free, open-source REST API serving useful public data about the Philippines.

## Endpoints

- `GET /regions` — All 17 regions of the Philippines
- `GET /provinces` — All provinces (optional `?region=` filter)
- `GET /cities` — Cities and municipalities (optional `?province=` filter)
- `GET /holidays` — Public holidays (optional `?year=` filter)
- `GET /schools` — Schools, colleges, universities

## Quick start

```bash
npm install
npm start
# API runs at http://localhost:3000
```

## Data sources

All data sourced from public records (PSGC, official government sites).

## License

MIT — free for any use.

## Maintainer

Charlie James Abejo ([@CharlieJamesGwapo](https://github.com/CharlieJamesGwapo))
