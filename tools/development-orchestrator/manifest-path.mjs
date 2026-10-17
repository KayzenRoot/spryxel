import {realpath} from 'node:fs/promises';
import {resolve,relative,isAbsolute,extname} from 'node:path';
const reject=()=>{throw Error('manifest must be a repository-relative .json file')};
const inside=(root,p)=>{const rel=relative(root,p);return rel!==''&&!rel.startsWith('..')&&!isAbsolute(rel)};
export async function manifestPathArg(arg){
 if(typeof arg!=='string'||!arg||isAbsolute(arg)||extname(arg)!=='.json')reject();
 const root=await realpath(process.cwd());
 if(!inside(root,resolve(root,arg)))reject();
 const target=await realpath(resolve(root,arg));
 if(!inside(root,target))reject();
 return target;
}
