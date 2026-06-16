import { createHash, randomUUID } from 'node:crypto';
import http from 'node:http';
import { request } from 'undici';

export function generateCodeVerifier(): string {
  return randomUUID() + randomUUID();
}

export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

export interface PkceFlowResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export function buildAuthorizationUrl(
  authorizationEndpoint: string,
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state: string,
  scope?: string,
): string {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  if (scope) url.searchParams.set('scope', scope);
  return url.toString();
}

export async function exchangeCodeForTokens(
  tokenEndpoint: string,
  clientId: string,
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<PkceFlowResult> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await request(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = (await response.body.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
}

export async function startCallbackServer(
  expectedState: string,
  port = 0,
): Promise<{ server: http.Server; url: string; waitForCode(): Promise<string> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    const callbackUrl = `http://localhost:${port}/callback`;

    const handler: http.RequestListener = (req) => {
      const urlObj = new URL(req.url || '/', `http://localhost:${port}`);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');

      if (error) {
        req.socket?.write('HTTP/1.1 400 OK\r\n\r\n<h1>Error</h1>');
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (state !== expectedState) return;

      if (code) {
        req.socket?.write('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<h1>Success!</h1>');
        server.close();
        resolve({
          server,
          url: callbackUrl,
          waitForCode: async () => code,
        });
      }
    };

    server.on('request', handler);

    server.listen(port, '127.0.0.1', () => {
      // Server is listening — callback URL will be used
    });

    server.on('error', reject);
  });
}
