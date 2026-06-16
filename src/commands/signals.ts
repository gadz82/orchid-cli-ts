// Signals commands — emit, list, show
import { Command } from 'commander';

import { heading, success, info } from '../output.js';

export const signalsCommand = new Command('signals').description('Manage Pollen+Bloom signals');

signalsCommand
  .command('emit <topic> <payload>')
  .description('Emit a signal')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async (topic, payload, _opts) => {
    console.log(heading('Emit Signal'));
    console.log(info(`Topic: ${topic}`));
    console.log(info(`Payload: ${payload}`));
    console.log(success('Signal emitted'));
  });

signalsCommand
  .command('list')
  .description('List signals')
  .option('--config <path>', 'Path to orchid.yml')
  .action(async () => {
    console.log(heading('Signals'));
    console.log(info('No signals found'));
  });

signalsCommand
  .command('show <id>')
  .description('Show signal details')
  .action(async (id) => {
    console.log(heading(`Signal: ${id}`));
    console.log(info('Signal details not available'));
  });
