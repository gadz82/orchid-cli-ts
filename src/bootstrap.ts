// Shared startup — load config, build Orchid facade
import { existsSync } from 'node:fs';

import { Orchid } from '@orchid-ai/orchid';

import { applyCliConfig, DEFAULT_MODEL } from './config.js';
import { success } from './output.js';

export interface BootstrapOptions {
  configPath: string;
  model?: string;
}

export interface BootstrapResult {
  orchid: Orchid;
  configPath: string;
}

export async function bootstrap(opts: BootstrapOptions): Promise<BootstrapResult> {
  const { configPath, model } = opts;

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  // Apply CLI-specific config overrides
  applyCliConfig(configPath);

  // Build the Orchid facade
  const orchid = await Orchid.fromConfigPath(configPath, {
    model: model || process.env['LITELLM_MODEL'] || DEFAULT_MODEL,
  });

  // Warm unauthenticated MCP capability caches
  try {
    const warm = (orchid as unknown as { warmUnauthenticatedCapabilities?(): Promise<void> })
      .warmUnauthenticatedCapabilities;
    if (warm) await warm.bind(orchid)();
  } catch {
    // Swallow
  }

  console.log(success('Orchid CLI ready'));
  return { orchid, configPath };
}
