import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {manifestPathArg} from './manifest-path.mjs';

const reject=p=>assert.rejects(manifestPathArg(p),/repository-relative/);

test('manifest path rejects traversal, absolute, non-json and empty inputs',async()=>{
 await reject('../../etc/passwd.json');
 await reject(join(tmpdir(),'x.json'));
 await reject('tools/manifest.txt');
 await reject('');
 await reject(undefined);
});

test('manifest path accepts repository-relative json',async()=>{
 assert.match(await manifestPathArg('tools/development-orchestrator/manifest.example.json'),/manifest\.example\.json$/);
});

test('manifest path rejects a symlink that escapes the repository',async()=>{
 const outside=await mkdtemp(join(tmpdir(),'outside-'));
 await writeFile(join(outside,'m.json'),'{}');
 const link=join(process.cwd(),'tools','development-orchestrator','escape-link.json');
 await symlink(join(outside,'m.json'),link).catch(()=>{});
 try{await reject('tools/development-orchestrator/escape-link.json')}finally{await import('node:fs/promises').then(f=>f.rm(link,{force:true}))}
});
