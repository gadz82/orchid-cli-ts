// OAuth flow — PKCE authorization code orchestration
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import {
  generateCodeVerifier,
  generateCodeChallenge,
  buildAuthorizationUrl,
  startCallbackServer,
  exchangeCodeForTokens,
} from './pkce.js';
import { saveToken, type StoredToken } from './tokenStore.js';
import { info, success } from '../output.js';

export interface OAuthProviderConfig {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  scope?: string;
}

export async function runLoginFlow(provider: OAuthProviderConfig, key = 'default'): Promise<StoredToken> {
  const state = randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Start local callback server
  const { server, url: redirectUri, waitForCode } = await startCallbackServer(state);
  const port = (server.address() as { port: number }).port;

  // Build authorization URL
  const authUrl = buildAuthorizationUrl(
    provider.authorizationEndpoint,
    provider.clientId,
    redirectUri,
    codeChallenge,
    state,
    provider.scope,
  );

  // Open browser
  console.log(info(`Opening browser for authentication...`));
  try {
    execSync(`open "${authUrl}"`);
  } catch {
    console.log(info(`Please open this URL in your browser:\n${authUrl}`));
  }

  // Wait for the callback
  console.log(info(`Waiting for authentication callback on port ${port}...`));
  const code = await waitForCode();

  // Exchange code for tokens
  const result = await exchangeCodeForTokens(
    provider.tokenEndpoint,
    provider.clientId,
    code,
    redirectUri,
    codeVerifier,
  );

  // Store tokens
  const stored: StoredToken = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + result.expiresIn,
    tokenType: 'bearer',
    serverName: key,
    tenantKey: 'default',
    userId: 'cli-user',
  };

  saveToken(key, stored);
  console.log(success('Authentication successful!'));
  return stored;
}
