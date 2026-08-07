# Relic Signal

An open-source Warframe relic intelligence dashboard combining live PC crossplay market orders with current Origin System world state.

## Features

- Search and filter the complete relic archive by name, reward, era, and vault status.
- Compare refinement-specific drop chances.
- View live top buy and lowest sell orders from Warframe.market.
- Calculate expected platinum value using current sell floors.
- Track fissures, Cetus, Cambion Drift, Arbitrations, and the Void Trader.
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

Open `http://localhost:3000`.

## Project structure

```text
app/
  api/market/[slug]/route.ts  Live market proxy
  api/relics/route.ts         Cached relic feed
  api/world/route.ts          Cached world-state feed
  layout.tsx                  Metadata and optimized fonts
  page.tsx                    Home route
components/
  dashboard.tsx               Interactive dashboard
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

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change.

## Data and attribution

Market data is supplied by [Warframe.market](https://docs.warframe.market/docs/intro/). Relic and world-state data is supplied by [WFCD/warframe-status](https://github.com/WFCD/warframe-status).

Relic Signal is an unofficial fan project and is not affiliated with or endorsed by Digital Extremes. Warframe and related names are trademarks of Digital Extremes.

## License

[MIT](LICENSE)
