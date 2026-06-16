import { describe, it, expect } from 'vitest';
import { success, error, warn, info, dim, bold, heading, keyVal } from '../src/output.js';
import chalk from 'chalk';

describe('output helpers', () => {
  it('success returns green checkmark', () => {
    const result = success('Done');
    expect(result).toContain('✔');
    expect(result).toContain('Done');
  });

  it('error returns red cross', () => {
    const result = error('Failed');
    expect(result).toContain('✖');
    expect(result).toContain('Failed');
  });

  it('warn returns yellow warning', () => {
    const result = warn('Careful');
    expect(result).toContain('⚠');
    expect(result).toContain('Careful');
  });

  it('info returns blue info icon', () => {
    const result = info('Note');
    expect(result).toContain('ℹ');
    expect(result).toContain('Note');
  });

  it('dim returns dimmed text', () => {
    const result = dim('faded');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('bold returns bold text', () => {
    const result = bold('emphasized');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('heading formats with underline', () => {
    const result = heading('Title');
    expect(result).toContain('Title');
    expect(result).toContain('─');
  });

  it('keyVal formats key: value', () => {
    const result = keyVal('Name', 'Orchid');
    expect(result).toContain('Name');
    expect(result).toContain('Orchid');
  });
});
