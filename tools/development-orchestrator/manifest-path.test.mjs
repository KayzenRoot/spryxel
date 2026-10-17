import {test} from 'node:test';
import assert from 'node:assert/strict';
import {manifestPathArg} from './manifest-path.mjs';

test('manifest path rejects traversal, absolute and non-json inputs', () => {
 assert.throws(() => manifestPathArg('../../etc/passwd.json'), /repository-relative/);
 assert.throws(() => manifestPathArg('C:/Windows/win.json'), /repository-relative/);
 assert.throws(() => manifestPathArg('tools/manifest.txt'), /repository-relative/);
 assert.throws(() => manifestPathArg(''), /repository-relative/);
});

test('manifest path accepts repository-relative json', () => {
 assert.match(manifestPathArg('tools/development-orchestrator/manifest.example.json'), /manifest.example.json$/);
});
