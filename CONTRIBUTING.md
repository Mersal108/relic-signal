# Contributing

Thanks for helping improve Relic Signal.

## Before opening a pull request

1. Search existing issues and pull requests to avoid duplicated work.
2. Open an issue first for substantial features or architectural changes.
3. Keep changes focused and avoid unrelated formatting rewrites.
4. Never commit API keys, account data, build output, or environment files.

## Development workflow

```bash
npm install
npm run dev
```

Create a branch from `main`, make the change, then run:

```bash
npm run lint
npm run build
```

Pull requests should explain the problem, chosen solution, user impact, and verification performed. Include screenshots for visual changes.

## Code guidelines

- Keep external API access in `app/api` Route Handlers.
- Keep browser interactivity in explicitly marked client components.
- Add narrow TypeScript types instead of using `any`.
- Preserve accessible names, keyboard behavior, responsive layouts, and reduced-motion compatibility.
- Respect upstream API caching and rate limits.

By contributing, you agree that your work will be licensed under the MIT License.
