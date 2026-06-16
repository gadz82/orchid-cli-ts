import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync } from 'node:fs';

import { saveToken, loadToken, deleteToken, listTokens, type StoredToken } from '../../src/auth/tokenStore.js';

const testToken: StoredToken = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
  tokenType: 'bearer',
  serverName: 'test-server',
  tenantKey: 'default',
  userId: 'test-user',
};

describe('tokenStore', () => {
  beforeEach(() => {
    // Clear test tokens
    const tokens = listTokens();
    for (const { key } of tokens) {
      deleteToken(key);
    }
  });

  it('saves and loads a token', () => {
    saveToken('test-key', testToken);
    const loaded = loadToken('test-key');
    expect(loaded).toBeTruthy();
    expect(loaded!.accessToken).toBe('test-access-token');
    expect(loaded!.refreshToken).toBe('test-refresh-token');
    expect(loaded!.serverName).toBe('test-server');
  });

  it('returns null for non-existent key', () => {
    const loaded = loadToken('nonexistent');
    expect(loaded).toBeNull();
  });

  it('deletes a token', () => {
    saveToken('to-delete', testToken);
    expect(loadToken('to-delete')).toBeTruthy();

    deleteToken('to-delete');
    expect(loadToken('to-delete')).toBeNull();
  });

  it('deleteToken returns false for missing key', () => {
    expect(deleteToken('missing')).toBe(false);
  });

  it('listTokens lists all saved tokens', () => {
    saveToken('key-1', testToken);
    saveToken('key-2', { ...testToken, serverName: 'other' });

    const tokens = listTokens();
    expect(tokens.length).toBe(2);
    expect(tokens.map((t) => t.key).sort()).toEqual(['key-1', 'key-2']);
  });

  it('overwrites existing token', () => {
    saveToken('key', testToken);
    saveToken('key', { ...testToken, accessToken: 'new-token' });

    const loaded = loadToken('key');
    expect(loaded!.accessToken).toBe('new-token');
  });
});
