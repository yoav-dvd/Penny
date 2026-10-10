const $ = s => document.querySelector(s);
let state, owner='all', selectedAccount, editing, busy=false;
const labels={person_id:'Account owner',product_type:'Product type',balance_ils:'Balance',balance_fee_percent:'Annual balance fee',deposit_fee_percent:'Fee on contributions',investment_track:'Investment track',last_contribution_date:'Last contribution date'};
const ownerName = id => id === 'person-a' ? 'Person A' : id === 'person-b' ? 'Person B' : 'Ownership unresolved';
const text = (tag,value,className) => { const node=document.createElement(tag); node.textContent=value; if(className)node.className=className; return node; };
const button = (label,fn,className='text-button') => { const node=text('button',label,className); node.onclick=fn; return node; };
const unresolved = a => Object.values(a.fields).filter(f=>!['reported','corrected'].includes(f.status)).length;
function money(value){const [w,f='']=value.split('.');return '₪'+w.replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+f.padEnd(2,'0');}
function amountMinor(value){return money((BigInt(value)/100n).toString()+'.'+(BigInt(value)%100n).toString().padStart(2,'0'));}
function fieldValue(field,data){if(data.value===null)return 'Conflicting reports';if(data.value==='')return 'Not supplied';if(data.value==='UNKNOWN')return 'Unknown';if(data.value==='NA')return 'Not applicable — needs evidence';return field==='balance_ils'?money(data.value):field.endsWith('_percent')?data.value+'%':field==='person_id'?ownerName(data.value):data.value;}
function toast(message,error=false){$('#toast').textContent=message;$('#toast').className=error?'error':'';$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,6500);}
async function api(path,body,raw=false){const response=await fetch(path,{method:'POST',headers:{'X-Penny-Local':'1',...(raw?{'X-Filename':encodeURIComponent(body.name)}:{'Content-Type':'application/json'})},body:raw?body:JSON.stringify(body??{})});const data=await response.json();if(!response.ok)throw Error(data.error);return data;}
async function change(fn,message){if(busy)return;busy=true;$('#save-status').textContent='Saving…';try{const result=await fn();await refresh();toast(result?.duplicate?'This exact file is already imported. No duplicate accounts were added.':message);return true;}catch(error){$('#save-status').textContent='Change not saved';toast(error.message,true);return false;}finally{busy=false;}}
async function refresh(){const response=await fetch('/api/state');if(!response.ok)throw Error('Cannot load the local workspace.');state=await response.json();render();$('#save-status').textContent='✓ Saved locally · revision '+state.revision;}
function page(name){for(const id of ['overview','requests','history'])$('#'+id).hidden=id!==name;document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));}
function render(){
  const visible=state.accounts.filter(a=>owner==='all'||a.fields.person_id.value===owner);
  const dates=new Set(visible.map(a=>a.asOf));
  const totalAllowed=visible.length&&dates.size===1&&visible.every(a=>['reported','corrected'].includes(a.fields.balance_ils.status)&&['reported','corrected'].includes(a.fields.person_id.status));
  let total=0n;if(totalAllowed)for(const a of visible){const [w,f='']=a.fields.balance_ils.value.split('.');total+=BigInt(w)*100n+BigInt(f.padEnd(2,'0'));}
  const stats=[['Received balances',totalAllowed?amountMinor(total.toString()):'Not available',totalAllowed?'As of '+visible[0].asOf+' · received accounts only':!visible.length?'Import a synthetic example to begin':dates.size>1?'Different snapshot dates — not combined':'Resolve balance or ownership evidence'],['Accounts received',String(visible.length),owner==='all'?'Individually owned · viewed together':ownerName(owner)+' · individually owned'],['Fields needing review',String(visible.reduce((n,a)=>n+unresolved(a),0)),'Missing, unknown or conflicting evidence']];
  $('#stats').replaceChildren(...stats.map(([label,value,caption])=>{const n=text('article','','stat');n.append(text('div',label,'label'),text('div',value,'value'),text('div',caption,'caption'));return n;}));
  $('#accounts').replaceChildren();
  if(!visible.length){const n=text('div','','empty');n.append(text('h2','Start with a picture you can check.'),text('p','Load the example or import a workbook using the synthetic template.'));$('#accounts').append(n);}
  for(const a of visible){const row=text('article','','account'),info=text('div',''),balance=text('div',''),status=text('div','');info.append(text('strong',a.provider),text('p',ownerName(a.fields.person_id.value)+' · '+a.accountId),text('p','As of '+a.asOf));balance.append(text('div',fieldValue('balance_ils',a.fields.balance_ils),'amount'),text('p','Balance fee: '+fieldValue('balance_fee_percent',a.fields.balance_fee_percent)));const count=unresolved(a);status.append(text('span',count?count+' field'+(count===1?'':'s')+' to review':'Recorded values','pill'+(count?' attention':'')));row.append(info,balance,status,button('Review →',()=>openAccount(a.id),'secondary'));$('#accounts').append(row);}
  $('#request-count').textContent=state.requests.length;
  $('#request-list').replaceChildren();
  if(!state.requests.length)$('#request-list').append(text('div','No requests yet. Open an account and select “Create evidence request” for a field.','empty'));
  for(const r of state.requests){const n=text('article','','request'),description=text('div','');description.append(text('strong',r.title),text('p',r.status==='requested'?'Marked as requested by you. No confirmation received.':'Ready for you to request. Nothing has been sent.'));n.append(description,button(r.status==='requested'?'Move back to request':'Mark as requested',()=>change(()=>api('/api/request-status',{id:r.id,status:r.status==='requested'?'to-request':'requested'}),'Request status saved.'),'secondary'));$('#request-list').append(n);}
  $('#import-list').replaceChildren(...state.imports.map(d=>text('div',d.filename+' · '+d.rows+' rows · '+d.adapter+' · SHA-256 '+d.hash,'import-record')));
  $('#history-list').replaceChildren(...[...state.history].reverse().map(h=>{const n=text('article','','activity'),body=text('div','');body.append(text('strong',h.type.replaceAll('-',' ')),text('p',h.detail));n.append(body,text('time',new Date(h.at).toLocaleString()));return n;}));
  if(!state.history.length)$('#history-list').append(text('div','Your activity will appear here.','empty'));
  if($('#detail').open)renderDetail();
}
function openAccount(id){selectedAccount=id;renderDetail();$('#detail').showModal();}
function renderDetail(){const a=state.accounts.find(a=>a.id===selectedAccount);if(!a)return;$('#detail-title').textContent=a.provider+' · '+a.accountId;$('#detail-date').textContent='Latest snapshot: '+a.asOf+' · Retained snapshot dates: '+a.dates.join(', ');$('#detail-fields').replaceChildren();for(const [field,data] of Object.entries(a.fields)){
  const row=text('section','','field'),heading=text('div',''),body=text('div','');heading.append(text('strong',labels[field]),text('p',data.status==='corrected'?'User correction — not externally verified':data.status,'pill'+(!['reported','corrected'].includes(data.status)?' attention':'')));body.append(text('div',fieldValue(field,data),'field-value'));
  if(data.correction)body.append(text('p','Reason: '+data.correction.reason));
  if(data.staleCorrection)body.append(text('p','A correction for earlier evidence is retained in history. New evidence needs review.','hint'));
  const sources=text('details','');sources.append(text('summary','Show source cells ('+data.candidates.length+')'));for(const c of data.candidates)sources.append(text('p',c.source+' · Accounts!'+c.cell+' · '+c.asOf+' · Original: '+(c.value||'[blank]')));body.append(sources);
  const actions=text('div','','field-actions');actions.append(button('Record correction',()=>openCorrection(a,field,data)),button('Create evidence request',()=>change(()=>api('/api/request',{accountId:a.id,field}),'Evidence request saved.')));body.append(actions);row.append(heading,body);$('#detail-fields').append(row);
}}
function openCorrection(account,field,data){editing={accountId:account.id,field,fingerprint:data.fingerprint};$('#correction-label').textContent=labels[field]+' · '+account.accountId;$('#new-value').value=['UNKNOWN','NA',null].includes(data.value)?'':data.value;$('#reason').value='';$('#value-hint').textContent=field==='person_id'?'Use person-a or person-b.':field.endsWith('_percent')?'Enter a plain percentage, such as 0.125.':field==='balance_ils'?'Enter an ILS amount, such as 100000.00.':field==='last_contribution_date'?'Use YYYY-MM-DD.':'Enter the known value.';$('#correction').showModal();$('#new-value').focus();}
$('#correction-form').onsubmit=async e=>{e.preventDefault();const ok=await change(()=>api('/api/correct',{...editing,value:$('#new-value').value,reason:$('#reason').value}),'Correction saved with its reason.');if(ok)$('#correction').close();};
$('#close-detail').onclick=()=>$('#detail').close();$('#close-correction').onclick=()=>$('#correction').close();
$('#demo').onclick=()=>change(()=>api('/api/demo'),'Synthetic household loaded.');
$('#import-button').onclick=()=>$('#file').click();$('#file').onchange=async e=>{const file=e.target.files[0];if(file)await change(()=>api('/api/import',file,true),'Workbook imported.');e.target.value='';};
document.querySelectorAll('[data-owner]').forEach(b=>b.onclick=()=>{owner=b.dataset.owner;document.querySelectorAll('[data-owner]').forEach(x=>x.classList.toggle('selected',x===b));render();});
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page));$('#show-requests').onclick=()=>page('requests');
refresh().catch(error=>{toast(error.message,true);$('#save-status').textContent='Workspace unavailable';});
