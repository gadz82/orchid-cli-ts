import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';

describe('mcp command', () => {
  it('has status and revoke subcommands', () => {
    const cmd = new Command('mcp');
    cmd.command('status');
    cmd.command('revoke <server-name>');
    expect(cmd.commands.length).toBe(2);
  });
});
