// Generate-flower command — interactive project scaffolding wizard
import { Command } from 'commander';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

import { heading, success, keyVal, info } from '../output.js';

export const generateFlowerCommand = new Command('generate-flower').description(
  'Interactive project scaffolding wizard',
);

generateFlowerCommand.action(async () => {
  console.log(heading('Orchid Project Generator'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q: string): Promise<string> => new Promise((resolve) => rl.question(`  ${info('?')} ${q}: `, resolve));

  try {
    const projectName = await ask('Project name');
    await ask('Description'); // Capture but not used directly
    const agentCount = parseInt((await ask('Number of agents')) || '2', 10);

    const dir = path.join(process.cwd(), projectName);
    mkdirSync(dir, { recursive: true });

    // Generate base config files
    const orchidYml = `# Orchid configuration
model: ollama/llama3.2
vector_backend: qdrant
storage:
  class: orchid_ai.persistence.sqlite.OrchidSQLiteChatStorage
  dsn: ~/.orchid/chats.db

agents_config: agents.yaml
`;

    const agentsYaml = `version: "1"

defaults:
  llm:
    model: ollama/llama3.2

supervisor:
  assistant_name: Orchid Assistant
  streaming_enabled: true

agents:
${Array.from(
  { length: agentCount },
  (_, i) => `  agent_${i + 1}:
    description: "Agent ${i + 1} description"
    prompt: "You are agent ${i + 1}. Be helpful."
    tools: []
`,
).join('\n')}
`;

    writeFileSync(path.join(dir, 'orchid.yml'), orchidYml);
    writeFileSync(path.join(dir, 'agents.yaml'), agentsYaml);
    writeFileSync(path.join(dir, '.env.example'), 'LITELLM_MODEL=ollama/llama3.2\n');

    console.log(success(`\nProject "${projectName}" created at ${dir}`));
    console.log(keyVal('Agents configured', String(agentCount)));
    console.log(info('\nNext steps:'));
    console.log(`  cd ${projectName}`);
    console.log('  orchid chat interactive --config orchid.yml');
  } finally {
    rl.close();
  }
});
