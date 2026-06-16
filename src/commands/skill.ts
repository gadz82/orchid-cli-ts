// Skill command — generate SKILL.md files
import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

import { heading, success, keyVal } from '../output.js';

export const skillCommand = new Command('skill').description('Generate SKILL.md files for agents');

skillCommand
  .command('generate')
  .description('Generate SKILL.md files from agent config')
  .option('--config <path>', 'Path to agents.yaml')
  .option('--agent <name>', 'Generate for a specific agent')
  .option('--output <dir>', 'Output directory for SKILL.md files', './skills')
  .action(async (opts) => {
    console.log(heading('Skill Generation'));

    const configPath = opts.config || 'agents.yaml';
    if (!existsSync(configPath)) {
      console.log(`Config not found: ${configPath}`);
      return;
    }

    const raw = readFileSync(configPath, 'utf-8');
    const data = parseYaml(raw) as Record<string, unknown> | null;
    if (!data) return;

    const agents = (data['agents'] as Record<string, unknown>) || {};
    const outputDir = opts.output;
    mkdirSync(outputDir, { recursive: true });

    let generated = 0;
    for (const [name, cfg] of Object.entries(agents)) {
      if (opts.agent && name !== opts.agent) continue;

      const desc = (cfg as { description?: string }).description || 'No description';
      const prompt = (cfg as { prompt?: string }).prompt || 'No prompt';
      const skills = (cfg as { skills?: Record<string, unknown> }).skills || {};

      const skillMd = `---
name: ${name}
description: ${desc}
---

# Agent: ${name}

## Description
${desc}

## Prompt
${prompt}

## Skills
${
  Object.keys(skills)
    .map((s) => `- ${s}`)
    .join('\n') || '(none)'
}

## Configuration
- Generated from: ${configPath}
- Date: ${new Date().toISOString()}
`;

      const outPath = path.join(outputDir, `${name}.skill.md`);
      writeFileSync(outPath, skillMd, 'utf-8');
      console.log(success(`Generated: ${outPath}`));
      generated++;
    }

    console.log(keyVal('Skills generated', String(generated)));
  });
