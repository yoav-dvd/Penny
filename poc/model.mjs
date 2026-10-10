import {createHash, randomUUID} from 'node:crypto';
import {HEADERS, validateValue, minorUnits} from './workbook.mjs';
export const FIELDS = HEADERS.slice(6);
export const emptyState = () => ({version:1,imports:[],corrections:[],requests:[],history:[],revision:0});
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const event = (state,type,detail) => { state.history.push({id:randomUUID(),at:new Date().toISOString(),type,detail}); state.revision++; };
export function ingest(state, document) {
  if (state.imports.some(d => d.hash === document.hash && d.adapter === document.adapter)) return {duplicate:true};
  if (state.imports.length >= 30) throw new Error('This POC is limited to 30 imports.');
  state.imports.push({...document,importedAt:new Date().toISOString()});
  event(state,'import',document.filename + ': ' + document.accounts.length + ' rows');
  return {duplicate:false};
}
function status(value) { return value === '' ? 'missing' : value === 'UNKNOWN' ? 'unknown' : value === 'NA' ? 'disputed' : 'reported'; }
export function project(state) {
  const groups = new Map();
  for (const document of state.imports) for (const account of document.accounts) {
    const id = account.provider_name + '\u0000' + account.account_id;
    if (!groups.has(id)) groups.set(id,[]);
    groups.get(id).push({account,document});
  }
  const accounts = [];
  for (const [identity, records] of groups) {
    const id = hash(identity).slice(0,24);
    const dates = [...new Set(records.map(r => r.account.as_of))].sort();
    const asOf = dates.at(-1), current = records.filter(r => r.account.as_of === asOf);
    const fields = {};
    for (const field of ['person_id','product_type',...FIELDS]) {
      // Ownership disagreement across dates must be resolved explicitly.
      const relevant = field === 'person_id' ? records : current;
      const candidates = relevant.map(({account,document}) => ({value:account[field],source:document.filename,hash:document.hash,asOf:account.as_of,cell:String.fromCharCode(65+HEADERS.indexOf(field))+account.row}));
      const fingerprint = hash(candidates);
      const correction = state.corrections.findLast(c => c.accountId === id && c.field === field && c.fingerprint === fingerprint);
      const values = [...new Set(candidates.map(c => c.value))];
      const value = correction ? correction.value : values.length === 1 ? values[0] : null;
      fields[field] = {value,status:correction ? 'corrected' : values.length > 1 ? 'conflict' : status(value),candidates,fingerprint,correction,
        staleCorrection:state.corrections.some(c => c.accountId === id && c.field === field && c.fingerprint !== fingerprint)};
    }
    accounts.push({id,accountId:records[0].account.account_id,provider:records[0].account.provider_name,asOf,dates,fields});
  }
  return {version:state.version,revision:state.revision,accounts,requests:state.requests,history:state.history,imports:state.imports.map(({accounts,...d}) => ({...d,rows:accounts.length}))};
}
export function correct(state, input) {
  const {accountId,field,value,reason,fingerprint} = input;
  if (!['person_id','product_type',...FIELDS].includes(field)) throw new Error('Unsupported correction field.');
  if (typeof reason !== 'string' || !reason.trim() || reason.length > 500) throw new Error('A reason is required (up to 500 characters).');
  if (typeof value !== 'string' || value.length > 500) throw new Error('Invalid correction value.');
  if (field === 'person_id' && !['person-a','person-b'].includes(value)) throw new Error('Choose one of the two owners.');
  if (field === 'product_type' && !value.trim()) throw new Error('Product type is required.');
  validateValue(field,value);
  if (['','UNKNOWN','NA'].includes(value)) throw new Error('A correction must supply a known value. Unknown values stay unresolved.');
  const account = project(state).accounts.find(a => a.id === accountId);
  if (!account || account.fields[field].fingerprint !== fingerprint) throw new Error('Source evidence changed. Refresh before correcting.');
  if (state.corrections.length >= 1000) throw new Error('Correction limit reached.');
  state.corrections.push({id:randomUUID(),at:new Date().toISOString(),accountId,field,value,reason:reason.trim(),fingerprint,actor:'Local demo user',previous:account.fields[field].value});
  event(state,'correction',account.accountId + ' · ' + field + ' · ' + reason.trim());
}
export function requestEvidence(state, {accountId,field}) {
  const account = project(state).accounts.find(a => a.id === accountId);
  if (!account || !Object.hasOwn(account.fields,field)) throw new Error('Unknown account or field.');
  if (state.requests.some(r => r.accountId === accountId && r.field === field)) return;
  state.requests.push({id:randomUUID(),accountId,field,title:'Confirm ' + field.replaceAll('_',' ') + ' for ' + account.accountId,status:'to-request',createdAt:new Date().toISOString()});
  event(state,'request-created',account.accountId + ' · ' + field);
}
export function setRequestStatus(state,{id,status}) {
  const request = state.requests.find(r => r.id === id);
  if (!request || !['to-request','requested'].includes(status)) throw new Error('Invalid request status.');
  if (request.status === status) return;
  request.status = status;
  event(state,'request-status',request.title + ' → ' + status);
}
export function totals(accounts) {
  if (!accounts.length) return {available:false,reason:'No accounts received'};
  if (new Set(accounts.map(a => a.asOf)).size !== 1) return {available:false,reason:'Snapshot dates differ'};
  if (accounts.some(a => !['reported','corrected'].includes(a.fields.balance_ils.status) || !['reported','corrected'].includes(a.fields.person_id.status))) return {available:false,reason:'Resolve balance or ownership evidence'};
  return {available:true,minorUnits:accounts.reduce((n,a) => n+BigInt(minorUnits(a.fields.balance_ils.value)),0n).toString(),asOf:accounts[0].asOf};
}
