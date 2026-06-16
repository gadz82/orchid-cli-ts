// Token persistence — atomic read/write to ~/.orchid/tokens.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

export interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  serverName: string;
  tenantKey: string;
  userId: string;
}

const TOKENS_DIR = path.join(homedir(), '.orchid');
const TOKENS_FILE = path.join(TOKENS_DIR, 'tokens.json');

function ensureDir(): void {
  if (!existsSync(TOKENS_DIR)) {
    mkdirSync(TOKENS_DIR, { recursive: true, mode: 0o700 });
  }
}

function readTokens(): Record<string, StoredToken> {
  ensureDir();
  if (!existsSync(TOKENS_FILE)) return {};

  try {
    const raw = readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(raw) as Record<string, StoredToken>;
  } catch {
    return {};
  }
}

function writeTokens(tokens: Record<string, StoredToken>): void {
  ensureDir();
  writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

export function saveToken(key: string, token: StoredToken): void {
  const tokens = readTokens();
  tokens[key] = token;
  writeTokens(tokens);
}

export function loadToken(key: string): StoredToken | null {
  const tokens = readTokens();
  return tokens[key] ?? null;
}

export function deleteToken(key: string): boolean {
  const tokens = readTokens();
  if (tokens[key]) {
    delete tokens[key];
    writeTokens(tokens);
    return true;
  }
  return false;
}

export function listTokens(): Array<{ key: string; token: StoredToken }> {
  const tokens = readTokens();
  return Object.entries(tokens).map(([key, token]) => ({ key, token }));
}

export function getTokensFilePath(): string {
  return TOKENS_FILE;
}
