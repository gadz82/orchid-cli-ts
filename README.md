# @orchid-ai/orchid-cli

Commander.js CLI tool for the [Orchid](https://github.com/gadz82/orchid) multi-agent AI framework — TypeScript port of `orchid-cli`.

Provides terminal access to all chat operations, configuration validation, RAG indexing, and MCP server authorisation. Runs locally with no server, Docker, or external database required (defaults to SQLite).

## Why use the CLI

- **Embedded workflows** — runs the same Orchid runtime as the API but in-process. Useful for batch jobs, scripted pipelines, and offline environments.
- **Identical config surface** — point at any `orchid.yml` / `agents.yaml` pair and the CLI behaves the way the API does, minus the HTTP layer.
- **Zero-infrastructure RAG** — defaults to ChromaDB (via `@orchid-ai/rag-chroma`) for on-disk vector storage.
- **No infrastructure required** — defaults to SQLite chat storage.
- **Plugin extensible** — register custom subcommands via package.json entry points.

## Installation

```bash
npm install -g @orchid-ai/orchid-cli
```

## Quick Start

```bash
# Validate config:
orchid config validate path/to/agents.yaml

# Authenticate (required for configs with OAuth-protected MCP servers):
orchid auth login -c orchid.yml

# Start an interactive chat session:
orchid chat interactive -c orchid.yml

# Send a single message:
orchid chat send "Hello!" -c path/to/orchid.yml
```

## Common Workflows

```bash
# 1) Try a built-in example with no setup
orchid chat interactive -c examples/basketball/orchid.yml

# 2) Pre-seed RAG with internal documentation
orchid index dir ./docs/internal -n knowledge_base -c orchid.yml --pattern '*.md'

# 3) Drive a non-interactive chat from a shell script
chat_id=$(orchid chat create -c orchid.yml -t "batch-$(date +%s)" --json | jq -r .id)
orchid chat send "$chat_id" "What is LangGraph?" -c orchid.yml
```

## Commands

### Authentication

```bash
# Log in via OAuth (opens browser, exchanges code for tokens)
orchid auth login -c orchid.yml

# Check current auth status (token expiry, tenant, user)
orchid auth status -c orchid.yml

# Clear stored tokens
orchid auth logout -c orchid.yml
```

### Chat Management

```bash
# Create a new chat session
orchid chat create -c orchid.yml -t "My Chat Title"

# List all chat sessions
orchid chat list -c orchid.yml

# Show message history
orchid chat history <chat_id> -c orchid.yml
orchid chat history <chat_id> -c orchid.yml --limit 10

# Rename a chat
orchid chat rename <chat_id> "New Title" -c orchid.yml

# Share a chat (promote RAG data to user scope)
orchid chat share <chat_id> -c orchid.yml

# Delete a chat
orchid chat delete <chat_id> -c orchid.yml
orchid chat delete <chat_id> -c orchid.yml --force
```

### Messaging

```bash
# Send a single message and print the response
orchid chat send <chat_id> "What is LangGraph?" -c orchid.yml

# Override the LLM model
orchid chat send <chat_id> "Explain RAG" -c orchid.yml -m ollama/llama3.2
```

### Interactive Mode

```bash
# Start a new interactive session
orchid chat interactive -c orchid.yml

# Resume an existing chat
orchid chat interactive <chat_id> -c orchid.yml
```

Slash commands available inside interactive mode:

| Command | Purpose |
|---------|---------|
| `/list` | List all chat sessions |
| `/switch <id>` | Switch to another chat |
| `/new [title]` | Create a new chat |
| `/history` | Show last 20 messages |
| `/rename <title>` | Rename current chat |
| `/quit` | Exit interactive mode |

### Configuration

```bash
# Validate an agents.yaml file
orchid config validate path/to/agents.yaml
```

### MCP Server Authorization

```bash
# Show authorization status for every OAuth-enabled MCP server
orchid mcp status -c orchid.yml

# Revoke the stored token for a server
orchid mcp revoke <server-name> -c orchid.yml
```

### RAG Indexing

```bash
# Index a single document (PDF, DOCX, XLSX, CSV, TXT, MD, PNG, JPG)
orchid index file ./docs/faq.pdf -n support -c orchid.yml

# Recursively index all supported files in a directory
orchid index dir ./docs -n knowledge_base -c orchid.yml
orchid index dir ./docs -n knowledge_base --pattern '*.md' -c orchid.yml

# Index a single block of inline text (no chunking)
orchid index text "Support hours are 9-5 EST Mon-Fri." -n support -c orchid.yml
```

## Configuration

The `--config` (`-c`) flag points to an `orchid.yml` file:

```yaml
llm:
  model: ollama/llama3.2
agents:
  config_path: agents.yaml
auth:
  dev_bypass: false
  cli:
    client_id: my-cli-app
    issuer: https://auth.example.com
rag:
  vector_backend: null
storage:
  class: "@orchid-ai/orchid/persistence/sqlite"
  dsn: ~/.orchid/chats.db
```

### Defaults

| Parameter | Default |
|-----------|---------|
| LLM model | `ollama/llama3.2` |
| Vector backend | `chroma` (via @orchid-ai/rag-chroma) |
| Storage class | SQLite (`@orchid-ai/orchid/persistence/sqlite`) |
| Storage DSN | `~/.orchid/chats.db` |
| Token storage | `~/.orchid/tokens.json` (0o600 permissions) |

Chat data stored in SQLite at `~/.orchid/chats.db` by default. OAuth tokens stored at `~/.orchid/tokens.json` with owner-only permissions.

## Development

```bash
cd orchid-cli-ts
npm install
npm test
npm run lint
npm run typecheck
```

## License

MIT
