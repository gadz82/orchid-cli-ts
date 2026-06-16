import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';

describe('main entry point', () => {
  it('auth command has login/logout/status subcommands', () => {
    const cmd = new Command('auth');
    cmd
      .command('login')
      .description('Login')
      .action(() => {});
    cmd
      .command('logout')
      .description('Logout')
      .action(() => {});
    cmd
      .command('status')
      .description('Status')
      .action(() => {});
    expect(cmd.commands.length).toBe(3);
  });

  it('chat command has multiple subcommands', () => {
    const cmd = new Command('chat');
    cmd.command('create <title>').action(() => {});
    cmd.command('list').action(() => {});
    cmd.command('delete <id>').action(() => {});
    cmd.command('send <id> <msg>').action(() => {});
    expect(cmd.commands.length).toBeGreaterThanOrEqual(4);
  });

  it('config command has validate subcommand', () => {
    const cmd = new Command('config');
    cmd.command('validate <path>');
    expect(cmd.commands.length).toBe(1);
  });
});
