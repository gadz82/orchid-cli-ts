// Auth middleware — resolve OrchidAuthContext from stored tokens
import { OrchidAuthContext } from '@orchid-ai/orchid/core';
import type { Orchid } from '@orchid-ai/orchid';

import { loadToken, type StoredToken } from './tokenStore.js';

export async function getAuthContext(_orchid: Orchid): Promise<OrchidAuthContext | null> {
  // Try to load stored tokens
  const tokens = loadToken('default');
  if (!tokens) return null;

  // Check expiry
  if (tokens.expiresAt > 0 && tokens.expiresAt < Date.now() / 1000) {
    // Token expired — try refresh
    if (tokens.refreshToken) {
      try {
        const refreshed = await refreshToken(tokens);
        if (refreshed) {
          return buildContextFromToken(refreshed);
        }
      } catch {
        // Refresh failed — clear token
      }
    }
    return null;
  }

  return buildContextFromToken(tokens);
}

function buildContextFromToken(token: StoredToken): OrchidAuthContext {
  return new OrchidAuthContext({
    accessToken: token.accessToken,
    tenantKey: token.tenantKey || 'default',
    userId: token.userId || 'cli-user',
    expiresAt: token.expiresAt,
  });
}

async function refreshToken(_token: StoredToken): Promise<StoredToken | null> {
  return null; // Stub — implement based on OAuth server discovery
}
