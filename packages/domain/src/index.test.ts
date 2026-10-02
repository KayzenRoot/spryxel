import { describe, expect, it } from 'vitest';
import { summarizeReadiness } from './index.js';

describe('readiness summary', () => {
  it('allows explicitly disabled optional adapters', () => {
    expect(summarizeReadiness([{ name: 'redis', state: 'disabled' }])).toBe('ready');
  });

  it('marks a failed configured dependency unavailable', () => {
    expect(summarizeReadiness([{ name: 'postgres', state: 'unavailable' }])).toBe('unavailable');
  });
});
