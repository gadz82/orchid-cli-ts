# orchid-cli-ts — AI Context

## What This Package Is

**`@orchid-ai/orchid-cli`** is the Commander.js CLI tool for the Orchid multi-agent AI framework — the 1:1 TypeScript
port of the Python `orchid-cli` package. It runs the full Orchid framework in-process from the terminal — no server, no
Docker required. It imports `@orchid-ai/orchid` as a workspace dependency and mirrors the lifecycle of
`@orchid-ai/orchid-api`.

Default storage: SQLite (`~/.orchid/chats.db`). Optional: PostgreSQL via `@orchid-ai/orchid-storage-postgres`.

## Package Structure

```
orchid-cli-ts/
  src/
    index.ts                     Public barrel export
    main.ts                      Commander entry point
    bootstrap.ts                 Shared startup: load config, build Orchid facade
    session.ts                   resolve_session + session_context
    output.ts                    Terminal formatting helpers
    asyncCommand.ts              Async wrapper for Commander
    cancellation.ts              CancelScope — SIGINT + ESC polling
    auth/
      config.ts, flow.ts, oidc.ts, pkce.ts, tokenStore.ts, middleware.ts
    commands/
      auth.ts, chat.ts, config.ts, generateFlower.ts, index.ts,
      jobs.ts, mcp.ts, runs.ts, schedules.ts, signals.ts
      _chatHelpers.ts, _chatInteractive.ts, _chatSend.ts, _eventsSession.ts
      _flower/ (wizard, templates, questions, validators, scaffolding, aiAssistant, output)
    slashCommands.ts             Extensible slash-command registry
  tests/
  package.json
```

## Architecture Rules

1. **Thin CLI layer** — All business logic lives in `@orchid-ai/orchid`. Commands orchestrate and display.
2. **`Orchid` facade as single entry point** — `bootstrap()` returns the framework's `Orchid` object.
3. **CLI-specific defaults** — SQLite storage, ChromaDB vectors (via `@orchid-ai/orchid-rag-chroma`).
4. **Auth is self-contained** — Full OAuth 2.0 PKCE flow with secure file persistence.
5. **Events run locally** — In-process, against the same backend the YAML configures.
6. **Extensible via plugins** — Commander commands + REPL slash commands via package.json entry points.

## Key Dependencies

| Package             | Role                             |
|---------------------|----------------------------------|
| `@orchid-ai/orchid` | Core framework                   |
| `commander`         | CLI framework (Typer equivalent) |
| `chalk`             | Terminal styling                 |
| `cli-table3`        | Table output                     |
| `ora`               | Spinners                         |
| `undici`            | OAuth HTTP calls                 |
| `proper-lockfile`   | Token file locking               |
| `yaml`              | Config parsing                   |
| `zod`               | Schema validation                |

## Python Reference

This is a 1:1 port of `orchid-cli/`. The authoritative reference is at `orchid-workspace/orchid-cli/`.

## Testing

```bash
cd orchid-cli-ts
npm test
npm run lint
npm run typecheck
```
