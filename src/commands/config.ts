// Config commands — validate YAML config
import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

import { heading, success, keyVal, error } from '../output.js';

export const configCommand = new Command('config').description('Validate and inspect config files');

configCommand
  .command('validate <path>')
  .description('Validate an orchid.yml or agents.yaml config file')
  .action(async (filePath: string) => {
    console.log(heading(`Config Validation: ${filePath}`));

    if (!existsSync(filePath)) {
      console.log(error(`File not found: ${filePath}`));
      process.exit(1);
    }

    try {
      const raw = readFileSync(filePath, 'utf-8');
      const data = parseYaml(raw) as Record<string, unknown> | null;

      if (!data || typeof data !== 'object') {
        console.log(error('Invalid YAML — expected an object/mapping'));
        process.exit(1);
      }

      const agents = (data['agents'] as Record<string, unknown>) || {};
      const agentCount = Object.keys(agents).length;

      console.log(keyVal('File', filePath));
      console.log(keyVal('Version', String(data['version'] || '1')));
      console.log(keyVal('Agents', String(agentCount)));

      if (agentCount > 0) {
        console.log(heading('Agents'));
        for (const [name, cfg] of Object.entries(agents)) {
          const desc = (cfg as { description?: string }).description || '(no description)';
          console.log(`  ${success(name)} — ${desc}`);
        }
      }

      if (data['supervisor']) {
        const sup = data['supervisor'] as { assistant_name?: string };
        console.log(keyVal('Supervisor', sup.assistant_name || 'default'));
      }

      console.log(success('\nConfig is valid'));
    } catch (exc) {
      console.log(error(`Config parse error: ${exc instanceof Error ? exc.message : String(exc)}`));
      process.exit(1);
    }
  });
