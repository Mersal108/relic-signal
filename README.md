# Relic Signal

[![CI](https://github.com/Mersal108/relic-signal/actions/workflows/ci.yml/badge.svg)](https://github.com/Mersal108/relic-signal/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

An open-source Warframe relic intelligence dashboard combining live PC crossplay market orders with current Origin System world state.

**Live app:** https://relic-signal-dodolintu108s-projects.vercel.app

## Features

- Search and filter the complete relic archive by name, reward, era, and vault status.
- Compare refinement-specific drop chances.
- View live top buy and lowest sell orders from Warframe.market.
- Calculate expected platinum value using current sell floors.
- Track fissures, Cetus, Cambion Drift, Arbitrations, and the Void Trader — polled every 60 seconds to stay current.
- Responsive interface with no account or API keys required.

## Stack

- Next.js App Router and React
- TypeScript
- Server-side Route Handlers for upstream API isolation and caching
- Warframe.market v2 API, WFCD WarframeStatus, and the versioned `warframe-items` dataset

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/Mersal108/relic-signal.git
cd relic-signal
npm install
npm run dev
```

Open `http://localhost:3000`. No environment variables or API keys are required — every upstream API used is public.

## Project structure

```text
app/
  api/market/[slug]/route.ts  Live market proxy (60s cache, respects warframe.market's 3 req/s limit)
  api/relics/route.ts         Cached relic feed (6h cache — relic data changes rarely)
  api/world/route.ts          Cached world-state feed (60s cache)
  layout.tsx                  Metadata and optimized fonts
  page.tsx                    Home route
components/
  dashboard.tsx               Interactive dashboard (search, filters, live polling)
src/
  styles.css                  Visual system and responsive layout
```

## Commands

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # run production build
npm run lint     # code-quality checks
```

## How data stays live

- Relic and reward data comes from the versioned `warframe-items` npm package and is cached for 6 hours server-side, since it only changes on game updates.
- World state (fissures, cycles, Void Trader, etc.) is polled client-side every 60 seconds, matching the server route's cache window.
- Market quotes for the selected relic's rewards are likewise polled every 60 seconds while a relic is selected.

All three routes are Next.js Route Handlers (`app/api/*`), so upstream requests are deduplicated and cached at the edge — multiple visitors don't multiply requests to the underlying APIs.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, from forking to opening a PR. Every push and pull request runs through [CI](.github/workflows/ci.yml) (lint + build).

## Data and attribution

Market data is supplied by [Warframe.market](https://docs.warframe.market/docs/intro/). Relic and world-state data is supplied by [WFCD/warframe-status](https://github.com/WFCD/warframe-status).

Relic Signal is an unofficial fan project and is not affiliated with or endorsed by Digital Extremes. Warframe and related names are trademarks of Digital Extremes.

## License

[MIT](LICENSE)
