#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { authCommand } from './commands/auth.js';
import { chatCommand } from './commands/chat.js';
import { configCommand } from './commands/config.js';
import { generateFlowerCommand } from './commands/generateFlower.js';
import { indexCommand } from './commands/index.js';
import { jobsCommand } from './commands/jobs.js';
import { mcpCommand } from './commands/mcp.js';
import { runsCommand } from './commands/runs.js';
import { schedulesCommand } from './commands/schedules.js';
import { signalsCommand } from './commands/signals.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };

// ORCHID-MEM: 01a1a0c1-ddeb-7ad9-a3b1-d1a2ad58de18 — TypeScript CLI command root
const program = new Command();

program.name('orchid').description('Orchid AI — multi-agent framework CLI').version(pkg.version);

program.addCommand(authCommand);
program.addCommand(chatCommand);
program.addCommand(configCommand);
program.addCommand(generateFlowerCommand);
program.addCommand(indexCommand);
program.addCommand(jobsCommand);
program.addCommand(mcpCommand);
program.addCommand(runsCommand);
program.addCommand(schedulesCommand);
program.addCommand(signalsCommand);

program.parse();
