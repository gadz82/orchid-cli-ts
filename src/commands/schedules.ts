// Schedules commands — list, show, disable, enable
import { Command } from 'commander';

import { heading, info, success } from '../output.js';

export const schedulesCommand = new Command('schedules').description('Manage Pollen+Bloom schedules');

schedulesCommand
  .command('list')
  .description('List schedules')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async () => {
    console.log(heading('Schedules'));
    console.log(info('No schedules configured'));
  });

schedulesCommand
  .command('show <id>')
  .description('Show schedule details')
  .action(async (id) => {
    console.log(heading(`Schedule: ${id}`));
    console.log(info('Schedule details not available'));
  });

schedulesCommand
  .command('disable <id>')
  .description('Disable a schedule')
  .action(async (id) => {
    console.log(success(`Schedule ${id} disabled`));
  });

schedulesCommand
  .command('enable <id>')
  .description('Enable a schedule')
  .action(async (id) => {
    console.log(success(`Schedule ${id} enabled`));
  });
