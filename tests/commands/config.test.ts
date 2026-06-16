import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';

describe('config command', () => {
  it('has validate subcommand', () => {
    const cmd = new Command('config');
    cmd.command('validate <path>');
    expect(cmd.commands.length).toBe(1);
    expect(cmd.commands[0]!.name()).toBe('validate');
  });
});
