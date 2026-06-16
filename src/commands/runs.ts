// Runs commands — list, show, retry, cancel
import { Command } from 'commander';

import { heading, info, success } from '../output.js';

export const runsCommand = new Command('runs').description('Manage Pollen+Bloom runs');

runsCommand
  .command('list')
  .description('List runs')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async () => {
    console.log(heading('Runs'));
    console.log(info('No runs found'));
  });

runsCommand
  .command('show <run-id>')
  .description('Show run details')
  .action(async (runId) => {
    console.log(heading(`Run: ${runId}`));
    console.log(info('Run details not available'));
  });

runsCommand
  .command('retry <run-id>')
  .description('Retry a run')
  .action(async (runId) => {
    console.log(success(`Run ${runId} scheduled for retry`));
  });

runsCommand
  .command('cancel <run-id>')
  .description('Cancel a run')
  .action(async (runId) => {
    console.log(success(`Run ${runId} cancelled`));
  });
