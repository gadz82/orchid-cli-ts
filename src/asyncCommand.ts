// Async command wrapper for Commander.js
// Commander supports async action handlers directly, but we provide a helper
// that catches errors and displays them nicely.
import type { Command } from 'commander';
import { error } from './output.js';

export function asyncCommand(fn: (...args: unknown[]) => Promise<void>) {
  return async (...args: unknown[]): Promise<void> => {
    try {
      await fn(...args);
    } catch (exc) {
      const msg = exc instanceof Error ? exc.message : String(exc);
      console.error(error(`Command failed: ${msg}`));
      process.exit(1);
    }
  };
}

export function wrapCommand(cmd: Command): Command {
  const origAction = cmd.action.bind(cmd);
  cmd.action = function (fn: (...args: unknown[]) => unknown | Promise<unknown>) {
    const wrapped = asyncCommand(async (...args: unknown[]) => {
      const result = fn(...args);
      if (result instanceof Promise) await result;
    });
    return origAction(wrapped as (...args: unknown[]) => Promise<void>);
  } as unknown as Command['action'];
  return cmd;
}
