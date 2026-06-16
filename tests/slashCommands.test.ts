import { describe, it, expect } from 'vitest';
import { registerSlashCommand, getSlashCommand, listSlashCommands } from '../src/slashCommands.js';

describe('slashCommands', () => {
  it('has built-in commands registered', () => {
    const commands = listSlashCommands();
    expect(commands.length).toBeGreaterThanOrEqual(6);
  });

  it('getSlashCommand retrieves built-in commands', () => {
    const help = getSlashCommand('help');
    expect(help).toBeTruthy();
    expect(help!.name).toBe('help');
    expect(help!.description).toBeTruthy();
  });

  it('registerSlashCommand adds custom commands', () => {
    const before = listSlashCommands().length;
    registerSlashCommand({
      name: 'test-cmd',
      description: 'A test command',
      handler: () => 'test result',
    });
    const after = listSlashCommands().length;
    expect(after).toBe(before + 1);

    const cmd = getSlashCommand('test-cmd');
    expect(cmd).toBeTruthy();
    expect(cmd!.handler('')).toBe('test result');
  });

  it('returns undefined for unknown command', () => {
    expect(getSlashCommand('nonexistent')).toBeUndefined();
  });

  it('help command returns all commands', () => {
    const help = getSlashCommand('help');
    const result = help!.handler('') as string;
    expect(result).toContain('/help');
    expect(result).toContain('/exit');
    expect(result).toContain('/clear');
  });

  it('model command returns model env var or default', () => {
    const model = getSlashCommand('model');
    const result = model!.handler('') as string;
    expect(result).toContain('Model:');
  });

  it('clear and exit commands exist', () => {
    expect(getSlashCommand('clear')).toBeTruthy();
    expect(getSlashCommand('exit')).toBeTruthy();
    expect(getSlashCommand('quit')).toBeTruthy();
  });
});
