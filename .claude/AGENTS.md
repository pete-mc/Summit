<!-- @format -->

# Multi-Agent Coordination Protocol

## Subagent Policy

Only spawn subagents for tasks that are genuinely isolatable and are complex tasks.
Do NOT spawn subagents for: single-file edits, quick lookups, short explanations, or anything completable in <5 tool calls.
DO spawn subagents for: multi-file refactors, codebase exploration across >10 files, tasks that can run in parallel, anything estimated at >10 tool calls, or before any commit/PR (use code-reviewer+haiku).

## Agent Model Assignment (explicit, not inherited)

Delegate work to specialized subagents using specific models and effort tiers to conserve tokens.

Always pass the model parameter explicitly when invoking agents:

| Agent           | Model            | Use for                                                                                    |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| Plan            | fable, then opus | Architecture, system exploration, planning, complex exploration                            |
| general-purpose | sonnet           | Mechanical edits, multi-step implementation, applying boilerplate, following instructions. |
| fast-search     | haiku            | File lookups, grep, directory search, fast terminal tests.                                 |
| Explore         | haiku            | Read-only codebase exploration                                                             |
| code-reviewer   | haiku            | Code review                                                                                |

If no specialist agent fits, use general-purpose+sonnet as the default.

Never rely on model inheritance — always pass model explicitly.
