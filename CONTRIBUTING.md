# Contributing to Relic Signal

Thanks for taking the time to improve Relic Signal. This guide walks through the full process, from setting up the project locally to getting a pull request merged.

## Code of conduct

Be respectful and constructive in issues, discussions, and pull requests. Disagreements about approach are fine; personal attacks, harassment, or dismissiveness are not.

## Ways to contribute

- **Report a bug** — open an [issue](https://github.com/Mersal108/relic-signal/issues/new) using the bug report template.
- **Suggest a feature** — open an issue describing the problem it solves before writing code, especially for anything touching architecture, new dependencies, or new upstream APIs.
- **Fix a bug or implement an approved feature** — see the workflow below.
- **Improve documentation** — README, this file, or inline comments that are genuinely unclear.

## Prerequisites

- Node.js 20 or newer
- npm (ships with Node.js)
- Git

Check your versions:

```bash
node -v
npm -v
git --version
```

## 1. Fork and clone

1. Click **Fork** on [github.com/Mersal108/relic-signal](https://github.com/Mersal108/relic-signal) to create your own copy.
2. Clone your fork (replace `YOUR-USERNAME`):

   ```bash
   git clone https://github.com/YOUR-USERNAME/relic-signal.git
   cd relic-signal
   ```

3. Add the original repository as a remote so you can pull in upstream changes later:

   ```bash
   git remote add upstream https://github.com/Mersal108/relic-signal.git
   ```

## 2. Install dependencies

```bash
npm install
```

This project has no environment variables or API keys to configure — the market, relic, and world-state routes in `app/api` proxy public, unauthenticated upstream APIs.

## 3. Run it locally

```bash
npm run dev
```

Open `http://localhost:3000`. The dev server hot-reloads as you edit files under `app/` and `components/`.

## 4. Create a branch

Always branch from an up-to-date `main`:

```bash
git checkout main
git pull upstream main
git checkout -b type/short-description
```

Use a prefix that describes the change:

- `fix/` — bug fixes (e.g. `fix/vault-filter-not-resetting`)
- `feat/` — new features (e.g. `feat/add-price-history-chart`)
- `docs/` — documentation only (e.g. `docs/expand-contributing-guide`)
- `chore/` — tooling, dependencies, config

## 5. Make your change

Guidelines to follow while editing:

- Keep all external API access inside `app/api/*/route.ts` Route Handlers — never call an upstream API directly from a client component. This keeps caching, error handling, and rate-limit behavior in one place.
- Client components must be explicitly marked with `'use client'` at the top of the file. Keep server components server-only wherever possible.
- Use narrow TypeScript types instead of `any`. If you need a type for upstream API data, define it near where it's consumed (see the types at the top of `components/dashboard.tsx` for the existing pattern).
- Respect upstream caching and rate limits. The market route caches for 60 seconds (`next: { revalidate: 60 }`) to stay well under warframe.market's public limit of 3 requests/second — don't remove or shorten that without a good reason explained in your PR.
- Preserve accessibility: keep `aria-label`s on icon-only buttons/links, don't remove keyboard focus states, and don't break responsive layout at narrow viewports.
- Keep changes scoped. Don't reformat or refactor unrelated code in the same PR — it makes review harder and obscures the actual change.
- Never commit `.env*` files, API keys, account tokens, or build output (`.next/`, `dist/`).

## 6. Verify before opening a PR

Run both of these and make sure they pass:

```bash
npm run lint
npm run build
```

Then manually exercise whatever you changed in the browser (`npm run dev`):

- If you touched a filter, search box, or button — click through every state it can be in.
- If you touched an API route — check the network tab for a successful response and confirm error states still render sensibly if you temporarily force a failure.
- If you touched layout or styling — check both a wide viewport and a narrow (mobile-width) one.

This project currently has no automated test suite, so manual verification in the PR description matters — be specific about what you checked.

## 7. Commit and push

Write commit messages that explain *why*, not just *what*:

```bash
git add path/to/changed/files
git commit -m "Fix vault filter not resetting when search is cleared"
git push origin type/short-description
```

Avoid `git add .` / `git add -A` — stage files explicitly so you don't accidentally commit build artifacts or local config.

## 8. Open the pull request

Open a PR from your branch against `Mersal108/relic-signal:main`. Fill out the PR template completely:

- **Summary** — what changed and why, in plain language.
- **Verification** — check off `npm run lint`, `npm run build`, manual testing, and attach screenshots for any visual change.

Keep the PR focused on a single concern. If review turns up a good idea that's out of scope, open a follow-up issue instead of expanding the PR.

## 9. Review process

- A maintainer will review and may request changes — push additional commits to the same branch to address feedback rather than force-pushing over history, unless asked to squash.
- CI (lint/build) must pass before merge.
- Once approved, a maintainer will merge the PR. You can delete your branch afterward.

## Keeping your fork in sync

Before starting new work, pull the latest `main`:

```bash
git checkout main
git pull upstream main
git push origin main
```

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
