import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {emptyState} from './model.mjs';
export async function openStore(path) {
  let state;
  try { state = JSON.parse(await readFile(path,'utf8')); if (state.version !== 1 || !Array.isArray(state.imports)) throw new Error('Unsupported saved state.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; state = emptyState(); }
  let queue = Promise.resolve();
  return {
    read: () => structuredClone(state),
    mutate(fn) {
      const operation = queue.then(async () => {
        const next = structuredClone(state), result = await fn(next);
        if (JSON.stringify(next) !== JSON.stringify(state)) {
          await mkdir(dirname(path),{recursive:true});
          await writeFile(path+'.tmp',JSON.stringify(next,null,2),{mode:0o600});
          await rename(path+'.tmp',path);
          state = next;
        }
        return result;
      });
      queue = operation.catch(() => {});
      return operation;
    }
  };
}
