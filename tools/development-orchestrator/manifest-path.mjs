import {resolve,relative,isAbsolute,extname} from 'node:path';
export function manifestPathArg(arg){
 const root=process.cwd();
 const target=resolve(root,arg);
 const rel=relative(root,target);
 if(!arg||rel.startsWith('..')||isAbsolute(rel)||extname(target)!=='.json')throw Error('manifest must be a repository-relative .json file');
 return target;
}
