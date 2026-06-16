// Plugin discovery for CLI commands
import type { Command } from 'commander';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { info } from './output.js';

export function loadPlugins(program: Command, basePath?: string): void {
  const nodeModules = basePath || path.join(process.cwd(), 'node_modules');
  if (!existsSync(nodeModules)) return;

  try {
    const dirs = readdirSync(nodeModules, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      if (dir.name.startsWith('@')) {
        // Scoped packages — scan subdirectories
        const scopedPath = path.join(nodeModules, dir.name);
        try {
          const subDirs = readdirSync(scopedPath, { withFileTypes: true });
          for (const sub of subDirs) {
            if (!sub.isDirectory()) continue;
            checkPackageForCommands(program, path.join(scopedPath, sub.name));
          }
        } catch {
          // Skip
        }
        continue;
      }
      checkPackageForCommands(program, path.join(nodeModules, dir.name));
    }
  } catch {
    // node_modules not accessible
  }
}

function checkPackageForCommands(_program: Command, pkgDir: string): void {
  const pkgPath = path.join(pkgDir, 'package.json');
  if (!existsSync(pkgPath)) return;

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
      orchid?: { cliCommands?: string; slashCommands?: string };
    };
    if (!pkg.orchid) return;

    if (pkg.orchid.cliCommands) {
      console.log(info(`Loading CLI plugin from ${path.basename(pkgDir)}`));
      // Dynamic import of the plugin's command module
      // import(pkg.orchid.cliCommands).then(...)
    }
  } catch {
    // Skip invalid package.json
  }
}
