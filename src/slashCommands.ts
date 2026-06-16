// Slash command registry for interactive REPL
export interface SlashCommand {
  name: string;
  description: string;
  handler: (args: string) => Promise<string | void> | string | void;
}

const registry = new Map<string, SlashCommand>();

export function registerSlashCommand(cmd: SlashCommand): void {
  registry.set(cmd.name, cmd);
}

export function getSlashCommand(name: string): SlashCommand | undefined {
  return registry.get(name);
}

export function listSlashCommands(): SlashCommand[] {
  return Array.from(registry.values());
}

// Built-in slash commands
registerSlashCommand({
  name: 'help',
  description: 'Show available commands',
  handler: () => {
    const commands = listSlashCommands();
    return commands.map((c) => `  /${c.name.padEnd(12)} — ${c.description}`).join('\n');
  },
});

registerSlashCommand({
  name: 'exit',
  description: 'Exit the REPL',
  handler: () => 'Goodbye!',
});

registerSlashCommand({
  name: 'quit',
  description: 'Exit the REPL',
  handler: () => 'Goodbye!',
});

registerSlashCommand({
  name: 'clear',
  description: 'Clear the screen',
  handler: () => {
    console.clear();
  },
});

registerSlashCommand({
  name: 'history',
  description: 'Show message history',
  handler: () => 'Message history not available in this session',
});

registerSlashCommand({
  name: 'model',
  description: 'Show current model',
  handler: () => {
    return `Model: ${process.env['LITELLM_MODEL'] || 'ollama/llama3.2'}`;
  },
});

registerSlashCommand({
  name: 'verbose',
  description: 'Toggle verbose output',
  handler: () => 'Verbose mode not implemented',
});
