# pi-advisor

Pi extension that adds an `advisor` tool plus `/advise` and `/advisor-status` commands.

The advisor is a stronger model used for strategic guidance. It sees the current Pi transcript by default, returns compact advice, and does not execute tools or change files.

## Installation

```bash
pi install https://github.com/cgint/pi-advisor
```

Or during local development:

```bash
pi install /Users/cgint/dev-external/pi-advisor
```

## Usage

### Tool

The extension registers an `advisor` tool for the agent. Use it for complex planning, stuck states, approach changes, or final review.

### Commands

```text
/advise <question>       # Ask the advisor manually and steer the session with its advice
/advisor-status          # Show active advisor config and call counters
```

## Configuration

Environment is read lazily; edit variables and run `/reload` to apply.

```bash
PI_ADVISOR_MODE=off                         # disable extension
PI_ADVISOR_MODELS="provider/model:effort#provider2/model2:effort2"
PI_ADVISOR_PROVIDER=google                  # legacy single-model fallback
PI_ADVISOR_MODEL=gemini-3.6-flash
PI_ADVISOR_REQUIRE_ALLOW=1                  # require explicit privacy allow
PI_ADVISOR_ALLOWED=1
PI_ADVISOR_MAX_PER_TURN=10
PI_ADVISOR_MAX_WORDS=600
PI_ADVISOR_REASONING_EFFORT=medium
PI_ADVISOR_REDACT=1
PI_ADVISOR_CACHE=short                      # none | short | long
```

When `PI_ADVISOR_MODELS` is unset, the built-in default chain is used.

## Behavior

- Sends transcript context unless `include_transcript: false` is passed with non-empty curated `context`.
- Redacts common API keys, bearer tokens, and private keys by default.
- Counts fallback-chain attempts as one advisor call.

## Related work and attribution

The core idea — sending the live session transcript to a stronger, read-only
"advisor" model for strategic guidance — is an established pattern, not an
original of this project. The initial implementation of this extension
(first `advisor.ts`, May 2026) was **adapted from an earlier public Pi
advisor implementation**; we can no longer recall or verify which repository
it came from, and the code has since been substantially reworked. Until the
source can be identified, the closest public projects we could find are
listed below:

- The closest contemporaneous Pi-ecosystem projects (released weeks before
  the initial implementation of this package):
  - [npm `pi-advisor`](https://www.npmjs.com/package/pi-advisor) ("Claude-style advisor tool for strategic guidance", created 2026-04)
  - [juicesharp/rpiv-advisor](https://github.com/juicesharp/rpiv-advisor) (2026-04, advisor tool + `/advisor` command extracted from rpiv-pi)
- Broader pattern prior art:
  - Anthropic's native Claude Code [`/advisor` tool](https://code.claude.com/docs/en/advisor) and ["The advisor strategy"](https://claude.com/blog/the-advisor-strategy)
  - [Amp Oracle](https://ampcode.com/news/oracle) (read-only second-model consultation, 2025)
  - [Aider architect mode](https://aider.chat/2024/09/26/architect.html) (strong model plans, cheap model edits, 2024)

If you are the original author of the work this was based on — or know who
it is — please [open an issue](https://github.com/cgint/pi-advisor/issues)
and we will add proper attribution here.

## Development

```bash
npm install
npm run precommit
```

The package structure mirrors the other local Pi extension packages:

```text
index.ts
src/
test/
README.md
LICENSE
AGENTS.md
NORTH-STAR.md
package.json
tsconfig.json
vitest.config.ts
```
