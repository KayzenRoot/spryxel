import { existsSync } from 'node:fs';
import { isAbsolute, win32 } from 'node:path';

type RuntimeEnvironment = NodeJS.ProcessEnv;
type FileExists = (path: string) => boolean;

export function resolveDockerCliPath(
  env: RuntimeEnvironment = process.env,
  runtimePlatform: NodeJS.Platform = process.platform,
  fileExists: FileExists = existsSync,
): string {
  const isAbsoluteForPlatform =
    runtimePlatform === 'win32'
      ? (path: string) => win32.isAbsolute(path)
      : (path: string) => isAbsolute(path);
  const override = env.DOCKER_CLI;
  if (override) {
    if (!isAbsoluteForPlatform(override)) {
      throw new Error('DOCKER_CLI must be an absolute path');
    }
    if (!fileExists(override)) throw new Error('Docker CLI was not found at DOCKER_CLI');
    return override;
  }

  let candidates: string[];
  if (runtimePlatform === 'win32') {
    candidates = [
      win32.join(
        env.ProgramFiles ?? 'C:\\Program Files',
        'Docker',
        'Docker',
        'resources',
        'bin',
        'docker.exe',
      ),
      ...(env.LOCALAPPDATA
        ? [
            win32.join(
              env.LOCALAPPDATA,
              'Programs',
              'DockerDesktop',
              'resources',
              'bin',
              'docker.exe',
            ),
          ]
        : []),
    ];
  } else if (runtimePlatform === 'darwin') {
    candidates = [
      '/Applications/Docker.app/Contents/Resources/bin/docker',
      '/usr/local/bin/docker',
      '/opt/homebrew/bin/docker',
    ];
  } else {
    candidates = ['/usr/bin/docker', '/usr/local/bin/docker'];
  }

  const executable = candidates.find((candidate) => fileExists(candidate));
  if (!executable) {
    throw new Error(
      'Docker CLI was not found in supported fixed locations; set DOCKER_CLI to its absolute path',
    );
  }
  return executable;
}
