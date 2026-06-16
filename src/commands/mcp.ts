// MCP commands — status, revoke
import { Command } from 'commander';
import Table from 'cli-table3';

import { resolveSession } from '../session.js';
import { heading, success, warn } from '../output.js';

export const mcpCommand = new Command('mcp').description('Manage MCP server OAuth tokens');

mcpCommand
  .command('status')
  .description('List MCP servers and OAuth auth status')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (opts) => {
    console.log(heading('MCP Status'));

    const { orchid } = await resolveSession({
      configPath: opts.config || 'orchid.yml',
    });

    // List configured MCP servers from the config
    const config = (orchid as unknown as { config?: { mcpServers?: Array<{ name: string; auth?: { mode: string } }> } })
      .config;
    const servers = config?.mcpServers || [];

    if (servers.length === 0) {
      console.log(warn('No MCP servers configured'));
      return;
    }

    const table = new Table({
      head: ['Server', 'Auth Mode', 'Status'],
      colWidths: [20, 15, 15],
    });

    for (const server of servers) {
      table.push([server.name, server.auth?.mode || 'none', 'Unknown']);
    }

    console.log(table.toString());
  });

mcpCommand
  .command('revoke <server-name>')
  .description('Revoke stored OAuth token for an MCP server')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (serverName, opts) => {
    console.log(heading('MCP Token Revoke'));

    const { orchid } = await resolveSession({
      configPath: opts.config || 'orchid.yml',
    });

    const tokenStore = (
      orchid as unknown as {
        mcpTokenStore?: { deleteToken(tenant: string, user: string, server: string): Promise<boolean> };
      }
    ).mcpTokenStore;
    if (!tokenStore) {
      console.log(warn('MCP token store not available'));
      return;
    }

    const deleted = await tokenStore.deleteToken('default', 'cli-user', serverName);
    if (deleted) {
      console.log(success(`Token for "${serverName}" revoked`));
    } else {
      console.log(warn(`No token found for "${serverName}"`));
    }
  });
