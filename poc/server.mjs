import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {parseWorkbook} from './workbook.mjs';
import {project,ingest,correct,requestEvidence,setRequestStatus,totals} from './model.mjs';
import {openStore} from './store.mjs';
import {guidedTurn,afterImport,publicMeeting,saveFollowup,calendar,newMeeting} from './meeting.mjs';
import {capabilities,connectedTurn} from './conversation-provider.mjs';
import {saveDocument} from './documents.mjs';

export async function startServer({port=4317,statePath=resolve('.penny-poc/state.json')}={}) {
  const store = await openStore(statePath);
  const server = createServer(async (req,res) => {
    const send = (code,body,type='application/json') => { res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}); res.end(type === 'application/json' ? JSON.stringify(body) : body); };
    try {
      const host = '127.0.0.1:' + server.address().port;
      if (req.headers.host !== host) return send(403,{error:'Use the local 127.0.0.1 address.'});
      if (req.headers.origin && req.headers.origin !== 'http://' + host) return send(403,{error:'Cross-origin requests are not allowed.'});
      const path = new URL(req.url,'http://'+host).pathname;
      if (req.method === 'GET') {
        if (path === '/api/state') { const view = project(store.read()); return send(200,{...view,total:totals(view.accounts)}); }
        if (path === '/api/meeting') {const state=store.read();return send(200,{...publicMeeting(state,capabilities()),documents:state.documents??[]});}
        if (path === '/api/calendar') {res.setHeader('Content-Disposition','attachment; filename="penny-followup.ics"');return send(200,calendar(store.read()),'text/calendar; charset=utf-8');}
        const routes = {'/':['public/index.html','text/html; charset=utf-8'],'/app.js':['public/app.js','text/javascript; charset=utf-8'],'/styles.css':['public/styles.css','text/css; charset=utf-8'],'/template.xlsx':['fixtures/demo.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']};
        if (routes[path]) { const [file,type] = routes[path]; if (path === '/template.xlsx') res.setHeader('Content-Disposition','attachment; filename="penny-synthetic-template.xlsx"'); return send(200,await readFile(new URL(file,import.meta.url)),type); }
        return send(404,{error:'Not found'});
      }
      if (req.method !== 'POST') return send(405,{error:'Method not allowed'});
      if (req.headers['x-penny-local'] !== '1') return send(403,{error:'Local application header required.'});
      const chunks=[]; let size=0;
      for await (const chunk of req) { size+=chunk.length; if (size>10*1024*1024) return send(413,{error:'הקובץ גדול מדי. הגודל המרבי הוא 10 מגה־בייט.'}); chunks.push(chunk); }
      const buffer=Buffer.concat(chunks);
      if(path==='/api/document')return send(200,await saveDocument(store,join(dirname(statePath),'documents'),buffer,decodeURIComponent(req.headers['x-filename']??'document'),req.headers['x-document-owner']));
      if (path === '/api/import' || path === '/api/demo') {
        const document = await parseWorkbook(path === '/api/demo' ? await readFile(new URL('fixtures/demo.xlsx',import.meta.url)) : buffer,path === '/api/demo' ? 'Synthetic demo.xlsx' : decodeURIComponent(req.headers['x-filename'] || 'Workbook.xlsx'));
        return send(200,await store.mutate(state => {const result=ingest(state,document);if(!result.duplicate||path==='/api/demo')afterImport(state);return result;}));
      }
      const actions={'/api/correct':correct,'/api/request':requestEvidence,'/api/request-status':setRequestStatus,'/api/followup':saveFollowup,'/api/new-meeting':newMeeting,'/api/chat':(state,input)=>capabilities().conversation==='openai'?connectedTurn(state,input):guidedTurn(state,input)};
      if (!actions[path]) return send(404,{error:'Not found'});
      let input; try { input=JSON.parse(buffer.toString('utf8')); } catch { return send(400,{error:'Invalid JSON'}); }
      await store.mutate(state => actions[path](state,input));
      send(200,{saved:true});
    } catch (error) {
      const diskError=['EACCES','EPERM','ENOSPC','EIO'].includes(error.code);
      send(diskError?500:400,{error:diskError?'Could not save locally. Your change was not applied.':error.message});
    }
  });
  server.requestTimeout=15000;
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(port,'127.0.0.1',resolve); });
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await startServer();
  console.log('Penny desktop POC: http://127.0.0.1:'+server.address().port);
}
