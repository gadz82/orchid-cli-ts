// CLI-specific config overrides and defaults
import { existsSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

export const DEFAULT_STORAGE_CLASS = 'sqlite';
export const DEFAULT_STORAGE_DSN = '~/.orchid/chats.db';
export const DEFAULT_VECTOR_BACKEND = 'chroma';
export const DEFAULT_CHROMA_PATH = '~/.orchid/chroma';
export const DEFAULT_MODEL = 'ollama/llama3.2';

export function applyCliConfig(configPath: string): void {
  if (!configPath || !existsSync(configPath)) return;

  try {
    const raw = readFileSync(configPath, 'utf-8');
    const data = parseYaml(raw) as Record<string, unknown> | null;
    if (!data || typeof data !== 'object') return;

    // Apply CLI defaults for storage and vector backend
    const cliDefaults: Record<string, string> = {
      CHAT_STORAGE_CLASS: 'orchid_ai.persistence.sqlite.OrchidSQLiteChatStorage',
      CHAT_DB_DSN: '~/.orchid/chats.db',
      VECTOR_BACKEND: 'qdrant',
    };

    for (const [key, value] of Object.entries(cliDefaults)) {
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }

    // If cli_rag: section exists, use it instead of rag: section for CLI
    const cliRag = data['cli_rag'];
    if (cliRag && typeof cliRag === 'object' && !Array.isArray(cliRag)) {
      for (const [key, value] of Object.entries(cliRag)) {
        const envVar = `CLI_RAG_${key.toUpperCase()}`;
        if (!(envVar in process.env)) {
          process.env[envVar] = String(value);
        }
      }
    }
  } catch {
    // Non-fatal — CLI can still work with defaults
  }
}
