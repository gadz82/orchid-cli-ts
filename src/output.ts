// Terminal formatting helpers
import chalk from 'chalk';

export function error(msg: string): string {
  return chalk.red(`✖ ${msg}`);
}

export function warn(msg: string): string {
  return chalk.yellow(`⚠ ${msg}`);
}

export function success(msg: string): string {
  return chalk.green(`✔ ${msg}`);
}

export function info(msg: string): string {
  return chalk.blue(`ℹ ${msg}`);
}

export function dim(msg: string): string {
  return chalk.dim(msg);
}

export function bold(msg: string): string {
  return chalk.bold(msg);
}

export function heading(title: string): string {
  return chalk.bold.cyan(`\n${title}\n${'─'.repeat(title.length)}`);
}

export function value(val: string): string {
  return chalk.white(val);
}

export function keyVal(key: string, val: string): string {
  return `${chalk.dim(`${key}:`)} ${value(val)}`;
}
