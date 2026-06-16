// Auth command — login/logout/status
import { Command } from 'commander';

import { runLoginFlow } from '../auth/flow.js';
import { deleteToken, listTokens } from '../auth/tokenStore.js';
import { keyVal, heading, success, warn } from '../output.js';

export const authCommand = new Command('auth').description('Manage OAuth authentication');

authCommand
  .command('login')
  .description('Start OAuth PKCE login flow')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (_opts) => {
    console.log(heading('OAuth Login'));

    const provider = {
      authorizationEndpoint:
        process.env['OAUTH_AUTHORIZATION_ENDPOINT'] || 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: process.env['OAUTH_TOKEN_ENDPOINT'] || 'https://oauth2.googleapis.com/token',
      clientId: process.env['OAUTH_CLIENT_ID'] || '',
      scope: process.env['OAUTH_SCOPE'] || 'openid profile email',
    };

    if (!provider.clientId) {
      console.log(warn('No OAUTH_CLIENT_ID set — cannot authenticate.'));
      return;
    }

    await runLoginFlow(provider);
  });

authCommand
  .command('logout')
  .description('Clear stored OAuth tokens')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async () => {
    const tokens = listTokens();
    for (const { key } of tokens) {
      deleteToken(key);
    }
    console.log(success('Logged out — tokens cleared'));
  });

authCommand
  .command('status')
  .description('Show current auth status')
  .action(async () => {
    console.log(heading('Auth Status'));

    const tokens = listTokens();
    if (tokens.length === 0) {
      console.log(warn('Not authenticated'));
      return;
    }

    for (const { key, token } of tokens) {
      const now = Math.floor(Date.now() / 1000);
      const expired = token.expiresAt > 0 && token.expiresAt < now;
      console.log(keyVal('Server', key));
      console.log(keyVal('Status', expired ? 'Expired' : 'Active'));
      console.log(keyVal('Expires', new Date(token.expiresAt * 1000).toISOString()));
      console.log();
    }
  });
