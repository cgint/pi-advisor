# pi-advisor

## Purpose

`pi-advisor` is a Pi extension package. Keep its repository structure aligned with the other local Pi extension packages (`pi-write-guard`, `pi-discuss-mode`, `pi-tool-intent`).

## Required checks

```bash
npm run precommit
```

This runs typecheck, tests, and npm audit. Keep it green before release or install rollout.

## Structure standard

Mirror the established package skeleton:

- `index.ts` re-exports the extension from `src/`.
- `src/` contains implementation.
- `test/` contains Vitest coverage for deterministic behavior.
- `package.json` uses `pi.extensions: ["./index.ts"]`.
- Runtime Pi packages stay in `peerDependencies`.

## Behavior rule

Preserve the previous standalone `advisor.ts` behavior unless a change is explicitly planned and tested.
