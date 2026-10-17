import { describe, expect, it } from 'vitest';
import { workerStatus } from './index.js';

describe('worker boundary', () => {
  it('starts with only the admitted bounded integrity consumer', () => {
    expect(workerStatus()).toEqual({ state: 'ready', productConsumers: 1 });
  });
});
