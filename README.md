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
