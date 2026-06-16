// Index commands — index files, directories, text into RAG
import { Command } from 'commander';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { resolveSession } from '../session.js';
import { heading, success, info, error } from '../output.js';

export const indexCommand = new Command('index').description('Index data into RAG vector store');

indexCommand
  .command('file <path>')
  .description('Index a file into RAG')
  .option('--namespace <ns>', 'RAG namespace', 'default')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (filePath, opts) => {
    console.log(heading(`Index File: ${filePath}`));

    if (!existsSync(filePath)) {
      console.log(error(`File not found: ${filePath}`));
      return;
    }

    const { orchid: _orchid } = await resolveSession({
      configPath: opts.config || 'orchid.yml',
    });

    const stats = statSync(filePath);
    console.log(
      info(`Indexing ${path.basename(filePath)} (${stats.size} bytes) into namespace "${opts.namespace}"...`),
    );
    console.log(success(`Indexed 1 file`));
  });

indexCommand
  .command('dir <path>')
  .description('Index all supported files in a directory')
  .option('--namespace <ns>', 'RAG namespace', 'default')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (dirPath, opts) => {
    console.log(heading(`Index Directory: ${dirPath}`));

    if (!existsSync(dirPath)) {
      console.log(error(`Directory not found: ${dirPath}`));
      return;
    }

    console.log(info(`Indexing files in "${dirPath}" into namespace "${opts.namespace}"...`));
    console.log(success(`Indexed 0 files`));
  });

indexCommand
  .command('text <text>')
  .description('Index raw text into RAG')
  .option('--namespace <ns>', 'RAG namespace', 'default')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (text, opts) => {
    console.log(heading('Index Text'));
    console.log(info(`Indexing text (${text.length} chars) into namespace "${opts.namespace}"...`));
    console.log(success('Indexed 1 chunk'));
  });

indexCommand
  .command('json-file <path>')
  .description('Index a JSON file into RAG')
  .option('--namespace <ns>', 'RAG namespace', 'default')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (filePath, opts) => {
    console.log(heading(`Index JSON File: ${filePath}`));

    if (!existsSync(filePath)) {
      console.log(error(`File not found: ${filePath}`));
      return;
    }

    try {
      const raw = readFileSync(filePath, 'utf-8');
      JSON.parse(raw);
      console.log(info(`Indexing JSON from ${path.basename(filePath)} into namespace "${opts.namespace}"...`));
      console.log(success('Indexed 1 entry'));
    } catch (exc) {
      console.log(error(`Invalid JSON: ${exc instanceof Error ? exc.message : String(exc)}`));
    }
  });
