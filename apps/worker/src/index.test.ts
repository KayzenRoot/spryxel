import { describe, expect, it } from 'vitest';
import { workerStatus } from './index.js';

describe('worker boundary', () => {
  it('starts with no product job consumers admitted', () => {
    expect(workerStatus()).toEqual({ state: 'ready', productConsumers: 0 });
  });
});
