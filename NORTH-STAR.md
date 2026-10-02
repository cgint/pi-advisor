# NORTH-STAR

## Purpose

Advisor gives the executor a deliberate escalation path to ask a stronger model for strategic guidance without handing over execution.

It should help with:

1. **Approach quality.** Get a compact critique or plan before committing to non-trivial changes.
2. **Stuck recovery.** Break loops after repeated test failures, contradictory evidence, or non-converging edits.
3. **Final review.** Surface missing verification before declaring complex work done.

## Design Principles

- **Advisor, not executor.** The advisor does not call tools, edit files, run commands, or write the final answer.
- **Evidence-bound.** Advice must be grounded in transcript or curated context; unsupported claims are risks, not facts.
- **Privacy-aware.** Redaction, allow gates, and transcript opt-out must remain first-class.
- **Low friction.** The tool should be easy to call, but guarded against casual overuse by clear prompt guidance and turn caps.

## Scope

- Registers the `advisor` tool.
- Registers `/advise` and `/advisor-status` commands.
- Supports model fallback chains and lazy env-based configuration.
