// Jobs commands — list, runs
import { Command } from 'commander';

import { heading, info } from '../output.js';

export const jobsCommand = new Command('jobs').description('Manage Pollen+Bloom jobs');

jobsCommand
  .command('list')
  .description('List jobs/triggers')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async () => {
    console.log(heading('Jobs'));
    console.log(info('No jobs configured'));
  });

jobsCommand
  .command('runs <job-id>')
  .description('List runs for a job')
  .action(async (jobId) => {
    console.log(heading(`Job Runs: ${jobId}`));
    console.log(info('No runs found'));
  });
