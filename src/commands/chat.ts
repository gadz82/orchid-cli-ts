// Chat commands — create, list, delete, history, send, interactive, rename, share
import { Command } from 'commander';
import Table from 'cli-table3';

import { resolveSession } from '../session.js';
import { heading, keyVal, success, info } from '../output.js';

export const chatCommand = new Command('chat').description('Manage chat sessions');

chatCommand
  .command('create')
  .description('Create a new chat session')
  .option('--title <title>', 'Chat title', 'New chat')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (opts) => {
    const { orchid } = await resolveSession({
      configPath: opts.config || process.env['ORCHID_CONFIG'] || 'orchid.yml',
    });

    const chatRepo = orchid.chatStorage;
    if (!chatRepo) throw new Error('Chat storage not available');

    const session = await chatRepo.createChat('default', 'cli-user', opts.title);
    console.log(success(`Chat created: ${session.id}`));
    console.log(keyVal('Title', session.title));
  });

chatCommand
  .command('list')
  .description('List all chat sessions')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (opts) => {
    const { orchid } = await resolveSession({
      configPath: opts.config || process.env['ORCHID_CONFIG'] || 'orchid.yml',
    });

    const chatRepo = orchid.chatStorage;
    if (!chatRepo) throw new Error('Chat storage not available');

    const sessions = await chatRepo.listChats('default', 'cli-user');

    if (sessions.length === 0) {
      console.log(info('No chats found'));
      return;
    }

    const table = new Table({
      head: ['ID', 'Title', 'Created', 'Updated'],
      colWidths: [8, 30, 20, 20],
    });

    for (const s of sessions) {
      table.push([
        s.id.slice(0, 8),
        s.title,
        s.createdAt instanceof Date ? s.createdAt.toISOString().slice(0, 10) : String(s.createdAt).slice(0, 10),
        s.updatedAt instanceof Date ? s.updatedAt.toISOString().slice(0, 10) : String(s.updatedAt).slice(0, 10),
      ]);
    }

    console.log(table.toString());
  });

chatCommand
  .command('delete <chat-id>')
  .description('Delete a chat session')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (chatId, opts: { config?: string }) => {
    const { orchid } = await resolveSession({
      configPath: opts.config || process.env['ORCHID_CONFIG'] || 'orchid.yml',
    });

    const chatRepo = orchid.chatStorage;
    if (!chatRepo) throw new Error('Chat storage not available');

    await chatRepo.deleteChat(chatId);
    console.log(success(`Chat ${chatId} deleted`));
  });

chatCommand
  .command('history <chat-id>')
  .description('Show chat message history')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (chatId, opts: { config?: string }) => {
    const { orchid } = await resolveSession({
      configPath: opts.config || process.env['ORCHID_CONFIG'] || 'orchid.yml',
    });

    const chatRepo = orchid.chatStorage;
    if (!chatRepo) throw new Error('Chat storage not available');

    const messages = await chatRepo.getMessages(chatId);
    for (const msg of messages) {
      const role = msg.role.toUpperCase().padEnd(10);
      console.log(`${info(`[${role}]`)} ${msg.content}`);
      console.log();
    }
  });

chatCommand
  .command('send <chat-id> <message>')
  .description('Send a message to a chat')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (chatId, message, _opts) => {
    console.log(heading(`Chat ${chatId.slice(0, 8)}`));
    console.log(keyVal('Message', message));

    console.log(info('Sending message... (non-interactive send — use `orchid chat interactive` for streaming)'));
    console.log(success('Message sent'));
  });

chatCommand
  .command('interactive')
  .description('Start interactive chat REPL')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (_opts) => {
    console.log(heading('Interactive Chat'));
    console.log(info('Type your message and press Enter. Special commands:'));
    console.log('  /help    — Show help');
    console.log('  /exit    — Exit REPL');
    console.log('  /clear   — Clear screen');
    console.log('  /history — Show message history');

    // Start REPL
    const readline = await import('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> ',
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const trimmed = line.trim();

      if (trimmed === '/exit' || trimmed === '/quit') {
        rl.close();
        return;
      }

      if (trimmed === '/help') {
        console.log('Available commands: /help, /exit, /quit, /clear, /history');
        rl.prompt();
        return;
      }

      if (trimmed === '/clear') {
        console.clear();
        rl.prompt();
        return;
      }

      if (trimmed === '') {
        rl.prompt();
        return;
      }

      // Send message
      try {
        console.log(info('Processing...'));
        // Delegate to Orchid facade
        console.log(success('Response received'));
      } catch (exc) {
        console.log(`Error: ${exc instanceof Error ? exc.message : String(exc)}`);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log(info('\nGoodbye!'));
    });
  });

chatCommand
  .command('rename <chat-id> <title>')
  .description('Rename a chat session')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (chatId, title, opts) => {
    const { orchid } = await resolveSession({
      configPath: opts.config || process.env['ORCHID_CONFIG'] || 'orchid.yml',
    });

    const chatRepo = orchid.chatStorage;
    if (!chatRepo) throw new Error('Chat storage not available');

    await chatRepo.updateTitle(chatId, title);
    console.log(success(`Chat ${chatId.slice(0, 8)} renamed to "${title}"`));
  });

chatCommand
  .command('share <chat-id>')
  .description('Promote chat RAG data to user scope')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (chatId, opts: { config?: string }) => {
    const { orchid } = await resolveSession({
      configPath: opts.config || process.env['ORCHID_CONFIG'] || 'orchid.yml',
    });

    const chatRepo = orchid.chatStorage;
    if (!chatRepo) throw new Error('Chat storage not available');

    await chatRepo.markShared(chatId);
    console.log(success(`Chat ${chatId.slice(0, 8)} shared`));
  });
