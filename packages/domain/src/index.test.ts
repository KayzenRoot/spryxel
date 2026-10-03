import { describe, expect, it } from 'vitest';
import { canCreateProject, normalizeProjectName, summarizeReadiness } from './index.js';

describe('readiness summary', () => {
  it('allows explicitly disabled optional adapters', () => {
    expect(summarizeReadiness([{ name: 'redis', state: 'disabled' }])).toBe('ready');
  });

  it('marks a failed configured dependency unavailable', () => {
    expect(summarizeReadiness([{ name: 'postgres', state: 'unavailable' }])).toBe('unavailable');
  });
});

describe('project policy and normalization', () => {
  it('allows creation only for privileged active-tenant roles', () => {
    expect(canCreateProject('OWNER')).toBe(true);
    expect(canCreateProject('ADMIN')).toBe(true);
    expect(canCreateProject('MEMBER')).toBe(false);
  });

  it('normalizes whitespace and Unicode composition consistently', () => {
    expect(normalizeProjectName('  Cafe\u0301   Quest  ')).toBe('Café Quest');
  });
});
