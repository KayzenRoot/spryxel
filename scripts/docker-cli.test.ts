import { describe, expect, it, vi } from 'vitest';
import { resolveDockerCliPath } from './docker-cli.js';

describe('Docker CLI path selection', () => {
  it('accepts an existing absolute override and never resolves it through PATH', () => {
    const fileExists = vi.fn((path: string) => path === '/opt/docker/bin/docker');
    expect(
      resolveDockerCliPath(
        { DOCKER_CLI: '/opt/docker/bin/docker', PATH: '/tmp/untrusted' },
        'linux',
        fileExists,
      ),
    ).toBe('/opt/docker/bin/docker');
    expect(fileExists).toHaveBeenCalledExactlyOnceWith('/opt/docker/bin/docker');
  });

  it('rejects a command-name override instead of searching PATH', () => {
    const fileExists = vi.fn(() => true);
    expect(() =>
      resolveDockerCliPath({ DOCKER_CLI: 'docker', PATH: '/tmp/untrusted' }, 'linux', fileExists),
    ).toThrow('DOCKER_CLI must be an absolute path');
    expect(fileExists).not.toHaveBeenCalled();
  });

  it('selects only supported absolute Windows install locations', () => {
    const expected =
      'C:\\Users\\developer\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe';
    const fileExists = vi.fn((path: string) => path === expected);
    expect(
      resolveDockerCliPath(
        {
          ProgramFiles: 'C:\\Program Files',
          LOCALAPPDATA: 'C:\\Users\\developer\\AppData\\Local',
          PATH: 'C:\\untrusted\\bin',
        },
        'win32',
        fileExists,
      ),
    ).toBe(expected);
    expect(fileExists).toHaveBeenCalledTimes(2);
    expect(fileExists.mock.calls.flat()).not.toContain('C:\\untrusted\\bin');
  });

  it('fails clearly when no fixed Docker CLI path exists', () => {
    expect(() => resolveDockerCliPath({}, 'linux', () => false)).toThrow(
      'Docker CLI was not found in supported fixed locations',
    );
  });
});
