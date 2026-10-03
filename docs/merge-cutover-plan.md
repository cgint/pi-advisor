# pi-advisor: Merge & Cutover Plan (rev 2 — post-critique)

**Goal:** make this repo the strictly-better superset of (a) the frozen package source (Jul 7) and (b) the live standalone extension (`~/.pi/profiles/minimal/agent/extensions/advisor.ts`, Sep 7), then cut over the live profile to the package.

**Decision (lead + user-agreed):** the live standalone is the *behavioral base*; the repo contributes structure (exports, `/compat` import, tests, packaging, docs). The package's `before_agent_start` system-prompt guidance hook is **excluded** — new, untested behavior, redundant with the (newer) tool description, and AGENTS.md says preserve standalone behavior unless a change is explicitly planned and tested.

## Critique disposition (Marcus, readonly worker, pane w28:p3 — 2026-10-02)

Headline: *sound with issues*. Accepted: F1 (G1 red), F2 (G2 rebaseline), F3 (auth pre-check + 8081-twins absent from profile models.json), F4 (single-restart-window cutover + 2-state rollback + settings.json hand-edit fallback), F5 (GitHub repo 404 → Phase 3 ends at local commit). F6 (over-complexity) partially rejected: implementer delegation kept per explicit user request; lead's own slice minimized.

---

## Phase 0 — DONE (lead, recorded for audit)

- cp standalone → `src/advisor.ts` (Sep-7 behavioral base).
- Re-added `export` to 6 declarations (required by `test/advisor.test.ts`).
- `complete` import switched to `@earendil-works/pi-ai/compat`.

## Phase 0.5 — G1 pre-clearance (DONE by lead, before worker launch)

Marcus verified `precommit` was red in two ways; lead independently confirmed and fixed:
1. **tsc TS2339 (auth narrowing):** the Sep-7 code's `authOk` shadow boolean defeated TS union narrowing (`auth.apiKey`/`auth.headers`/`auth.error` flagged). Fixed by capturing into typed locals (`resolvedApiKey`, `resolvedHeaders`) inside the `auth.ok` branch; the `no-api-key-needed` bypass and all error paths are behavior-identical. (The live standalone still contains the tsc-invalid form — it transpiles fine at runtime; the package source is the corrected superset.)
2. **vitest 1/9:** default-chain assertion expected `gemini-3.5-flash`; source default is `3.6`. Updated exactly one assertion (test line 66); the other six 3.5 strings are deliberate fixtures and stay.
3. **npm audit (pre-existing, environmental):** transitive `undici@8.9.0` advisories cleared by adding `overrides.undici=7.16.0` (same pin the user's profile uses). Remaining: **`@vitest/mocker` moderate advisory, range 2.1.0–4.1.10, no fixed release exists** → audit gate is unfixable at current versions. This is documented, not worked around.

**G1 redefined:** `tsc --noEmit` + `npm run test` green. `npm audit` reported but expected-red (no patched @vitest/mocker).

## Phase 1 — Doc/source polish (worker: Lena, editable, cwd = repo root)

1. `src/advisor.ts`: header comment only. Replace the "Drop this file into `.pi/extensions/advisor.ts` …" block with package install guidance (`pi install …`). No other source changes.
2. `README.md`:
   - `PI_ADVISOR_MODEL=gemini-3.5-flash` → `gemini-3.6-flash` (single occurrence, README.md:40).
   - Delete the Behavior bullet "Adds advisor-use guidance to the system prompt."
   - Env list already verified 1:1 against `env(...)` calls (Marcus) — no change expected.
3. `NORTH-STAR.md`: remove "Injects advisor-use guidance into the system prompt." from Scope.
4. `.gitignore`: add `agent/`. **DONE by lead** (verified by Marcus).

**Non-goals (hard scope):** no behavioral change to `src/advisor.ts`; no edits to `test/`, `package.json`, `index.ts`.

## Phase 2 — Verification gates (worker runs, lead re-runs)

- **G1:** `npx tsc --noEmit && npm run test` green (audit excluded, see 0.5). Never bend a test to pass.
- **G2 (parity, re-baselined — named-hunk list):** `diff ~/.pi/profiles/minimal/agent/extensions/advisor.ts src/advisor.ts` must show *only* these hunks and nothing else:
  1. header comment block (Phase 1.1),
  2. import lines: split + `/compat` + `ProviderHeaders`,
  3. six `export ` keywords,
  4. the Phase 0.5 auth-narrowing block (`resolvedApiKey`/`resolvedHeaders` restructure).
- **G3:** no `before_agent_start` or `ADVISOR_GUIDANCE_TEXT` anywhere in `src/`, `test/`, `index.ts`.

## Phase 3 — Git (worker)

- `git init -b main`, `git add -A`, commit: `Merge live standalone advisor behavior into package source; restore exports and /compat import`.
- **No push:** Marcus verified `git ls-remote https://github.com/cgint/pi-advisor` → 404 (repo does not exist). Worker ends by handing the lead the exact `git remote add origin … && git push -u origin main` commands; upstream repo creation is a **user action**.

## Phase 4 — Live cutover — DONE (2026-10-02, executed by user, verified by lead)

User deleted all loose `advi*.ts` files (`~/.pi/agent`, `~/.pi/profiles/minimal`, `~/.pi/profiles/partner` — source of truth lives in `~/.local/bin/data-dir-agents/manual/pi-agent/extensions/`) and ran `pi install https://github.com/cgint/pi-advisor` in all three scopes (pim/pi/pipa). No coexistence window needed. Lead-verified: all three `settings.json` carry `"https://github.com/cgint/pi-advisor"`; all three clones at `5733316`; no loose advisor files remain; install-time npm audit clean (0 vulns).

Residual (by design, user decision): runtime verification = restart Pi in each scope, `/advisor-status` shows 3.6 default chain, one live advisor call. Expected: 8081-twins hop fails (not in models.json), falls through to google/gemini-3.6-flash.

Pre-check (before the window): confirm `google/gemini-3.6-flash` is authed in the active profile (`pi auth check --provider google` or models registry). Note: `8081-twins` is **not** in the profile's models.json (Marcus verified: providers are llamacpp-twins, lms-twins, cpp-twins, llamacpp-twins-8085/8086) — the built-in chain's first hop will fail and fall through to google. Pass criterion if only the local hop is configured: "chain degrades gracefully with correct attempt lines".

Single-restart-window ordering (Marcus F4):
1. Backup: `cp ~/.pi/profiles/minimal/agent/extensions/advisor.ts ~/advisor-backup-$(date +%Y%m%d).ts`
2. Install the package **with the loose file still present** (`pi install /Users/cgint/dev-external/pi-advisor`); restart once and observe: does Pi load both (double registration), error loudly, or dedupe? Either outcome is data; record it.
3. Only then delete the loose file; restart again.
4. Verify: `advisor` tool description = Sep-7 wording (or exactly one registration, no collision artifacts); `/advisor-status` default chain matches pre-cutover output byte-for-byte (3.6 entries); one live advisor call succeeds (or degrades per the pre-check note).
5. Where the declaration landed: verify `~/.pi/profiles/minimal/agent/settings.json` (active profile, 9-entry packages array per Marcus) vs `~/.pi/agent/settings.json`. `pi install` local-path mechanics remain unverified — observation, not assumption.

Rollback (two well-defined states):
- **Install failed / bad coexistence:** remove the settings.json packages entry (or `pi remove`); loose file untouched. Hand-editing `packages[]` is the named fallback (pi remove semantics for local paths UNDETERMINED).
- **Cutover verified but wrong:** restore loose file + remove the declaration.

## Stop rules (all phases)

- G2 parity diff shows a hunk outside the named list.
- precommit (tsc/vitest) failure not traceable to the merge.
- Any step touching `~/.pi/` without explicit user approval (Phase 4 boundary).

## Delegation

Identity chain: **Vera (lead) → Marcus (critic, readonly, closed) → Lena (implementer, editable)**.
- Marcus: plan critique — delivered, accepted.
- Lena: Phases 1–3; report to `agent/report.md` (scratch, gitignored); never touches `~/.pi/`.
- Lead re-runs G1–G3 independently before acceptance. Cutover (Phase 4) stays with lead + user.
