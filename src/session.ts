// Session management — resolve auth context for CLI commands
import type { OrchidAuthContext } from '@orchid-ai/orchid/core';

import type { Orchid } from '@orchid-ai/orchid';
import { bootstrap, type BootstrapOptions } from './bootstrap.js';
import { warn } from './output.js';

export interface SessionResult {
  orchid: Orchid;
  auth: OrchidAuthContext | null;
}

export async function resolveSession(opts: BootstrapOptions): Promise<SessionResult> {
  const { orchid } = await bootstrap(opts);

  // Try to get auth context from stored tokens
  let auth: OrchidAuthContext | null = null;
  try {
    const { getAuthContext } = await import('./auth/middleware.js');
    auth = await getAuthContext(orchid);
  } catch {
    // No auth configured — use dev defaults
    console.log(warn('No auth configured — using anonymous mode'));
  }

  return { orchid, auth };
}
