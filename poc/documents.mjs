import {createHash,randomUUID} from 'node:crypto';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {join} from 'node:path';

export function inspectUpload(buffer,filename,owner) {
  if(!Buffer.isBuffer(buffer)||buffer.length<4||buffer.length>10*1024*1024)throw new Error('אפשר לצרף קובץ תקין עד 10 מגה־בייט.');
  if(!['self','partner','household','unsure'].includes(owner))throw new Error('בחרי למי שייך המסמך; אפשר גם לסמן שעדיין לא בטוחים.');
  const name=String(filename).split(/[\\/]/).at(-1).replace(/[\x00-\x1f]/g,'').slice(0,160);
  const extension=name.split('.').at(-1).toLowerCase();
  const start=buffer.subarray(0,300).toString('utf8').replace(/^\uFEFF/,'').trimStart();
  if(!['pdf','xlsx','xml'].includes(extension))throw new Error('אפשר לצרף PDF, אקסל מסוג XLSX או XML.');
  if(extension==='pdf'&&!start.startsWith('%PDF-')||extension==='xlsx'&&buffer.readUInt16LE(0)!==0x4b50||extension==='xml'&&!start.startsWith('<'))throw new Error('סוג הקובץ לא תואם לסיומת שלו.');
  return {id:randomUUID(),name,extension,owner,bytes:buffer.length,hash:createHash('sha256').update(buffer).digest('hex'),status:'received-not-analyzed',receivedAt:new Date().toISOString()};
}
export async function saveDocument(store,directory,buffer,filename,owner) {
  const document=inspectUpload(buffer,filename,owner);
  let writtenPath;
  try { return await store.mutate(async state=>{
    state.documents??=[];
    const existing=state.documents.find(d=>d.hash===document.hash);
    if(existing)return {duplicate:true,document:existing};
    if(state.documents.length>=30)throw new Error('אפשר לשמור עד 30 מסמכים בניסוי.');
    await mkdir(directory,{recursive:true});
    const path=join(directory,document.id+'.bin');
    await writeFile(path,buffer,{flag:'wx',mode:0o600});
    writtenPath=path;
    state.documents.push(document);
    return {document};
  }); } catch(error) {if(writtenPath)await unlink(writtenPath).catch(()=>{});throw error;}
}
