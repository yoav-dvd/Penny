import yauzl from 'yauzl';
import {XMLParser, XMLValidator} from 'fast-xml-parser';
import {createHash} from 'node:crypto';

export const HEADERS = ['household_id','person_id','account_id','provider_name','product_type','as_of','balance_ils','balance_fee_percent','deposit_fee_percent','investment_track','last_contribution_date'];
const list = x => x == null ? [] : Array.isArray(x) ? x : [x];
const fail = message => { throw new Error(message); };
export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function validateValue(field, value) {
  if (typeof value !== 'string' || value.length > 500) fail('Values must be text of at most 500 characters.');
  if (['','UNKNOWN','NA'].includes(value)) return;
  if (field === 'balance_ils' && !/^\d{1,14}(\.\d{1,2})?$/.test(value)) fail('Balance must be a non-negative amount with at most two decimal places.');
  if (field.endsWith('_percent') && (!/^\d{1,3}(\.\d{1,6})?$/.test(value) || Number(value) > 100)) fail('Fees must be a plain percentage between 0 and 100, without a % sign.');
  if (field === 'last_contribution_date' && !validDate(value)) fail('Contribution date must be a valid YYYY-MM-DD date.');
}
export function minorUnits(value) {
  const [whole, fraction = ''] = value.split('.');
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2,'0'))).toString();
}
export async function unzip(buffer) {
  if (buffer.length > 5 * 1024 * 1024) fail('Workbook exceeds the 5 MB limit.');
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, {lazyEntries:true, validateEntrySizes:true, strictFileNames:true}, (err, zip) => {
      if (err) return reject(new Error('This is not a readable XLSX workbook.'));
      let bytes = 0, count = 0, done = false;
      const entries = new Map();
      const stop = message => { if (!done) { done = true; zip.close(); reject(new Error(message)); } };
      zip.on('error', () => stop('The workbook archive is invalid.'));
      zip.on('end', () => { if (!done) { done = true; resolve(entries); } });
      zip.on('entry', entry => {
        const name = entry.fileName;
        if (++count > 1000 || entry.uncompressedSize > 25*1024*1024 || bytes + entry.uncompressedSize > 25*1024*1024) return stop('Workbook exceeds archive safety limits.');
        if (entry.generalPurposeBitFlag & 1) return stop('Encrypted workbooks are not supported.');
        if (entries.has(name) || name.includes('..') || name.includes('\\') || name.startsWith('/')) return stop('Unsafe or duplicate archive path.');
        if (/vbaProject|externalLinks|\.zip$|\.xlsm$|\.xlsx$/i.test(name)) return stop('Macros, external links and nested archives are not supported.');
        if (name.endsWith('/')) { zip.readEntry(); return; }
        zip.openReadStream(entry, (error, stream) => {
          if (error) return stop('Cannot read workbook entry.');
          const chunks = [];
          stream.on('error', () => stop('Cannot read workbook entry.'));
          stream.on('data', chunk => { bytes += chunk.length; if (bytes > 25*1024*1024) { stream.destroy(); stop('Workbook exceeds expanded size limit.'); } else chunks.push(chunk); });
          stream.on('end', () => { if (!done) { entries.set(name, Buffer.concat(chunks).toString('utf8')); zip.readEntry(); } });
        });
      });
      zip.readEntry();
    });
  });
}
const parser = new XMLParser({ignoreAttributes:false, parseTagValue:false, parseAttributeValue:false, trimValues:false, isArray: name => ['row','c','si','Relationship','sheet'].includes(name)});
function xml(text) {
  if (!text || /<!DOCTYPE|<!ENTITY/i.test(text) || XMLValidator.validate(text) !== true) fail('Invalid or unsupported workbook XML.');
  return parser.parse(text);
}
export async function parseWorkbook(buffer, filename = 'Workbook.xlsx') {
  const entries = await unzip(buffer);
  // Validate every XML part, including relationship parts not needed for parsing.
  for (const [name, text] of entries) if (/\.(xml|rels)$/.test(name)) {
    const parsed = xml(text);
    if (list(parsed.Relationships?.Relationship).some(r => r['@_TargetMode'] === 'External')) fail('External workbook relationships are not supported.');
  }
  if (/macroEnabled/i.test(entries.get('[Content_Types].xml') || '')) fail('Macro-enabled workbooks are not supported.');
  const sheets = list(xml(entries.get('xl/workbook.xml')).workbook?.sheets?.sheet);
  if (sheets.length !== 1 || sheets[0]['@_name'] !== 'Accounts') fail('Use the template: exactly one sheet named Accounts is required.');
  const rels = list(xml(entries.get('xl/_rels/workbook.xml.rels')).Relationships?.Relationship);
  const target = rels.find(r => r['@_Id'] === sheets[0]['@_r:id'])?.['@_Target'];
  if (!target || !/^\/?(?:xl\/)?worksheets\/[\w.-]+\.xml$/.test(target)) fail('Unsupported worksheet location.');
  const path = target.startsWith('/') ? target.slice(1) : target.startsWith('xl/') ? target : 'xl/' + target;
  const sheet = xml(entries.get(path)).worksheet;
  if (!sheet || sheet.mergeCells) fail('Merged cells are not supported.');
  const shared = entries.has('xl/sharedStrings.xml') ? list(xml(entries.get('xl/sharedStrings.xml')).sst?.si) : [];
  function textValue(item) {
    if (typeof item?.t === 'string') return item.t;
    if (typeof item?.t?.['#text'] === 'string') return item.t['#text'];
    if (item?.t === '') return '';
    if (item?.t && typeof item.t === 'object' && Object.keys(item.t).every(key => key.startsWith('@_'))) return '';
    fail('Rich text is not supported. Use plain text cells.');
  }
  const rows = list(sheet.sheetData?.row), cells = new Map();
  if (rows.length < 2 || rows.length > 101) fail('Provide between 1 and 100 accounts.');
  rows.forEach((row, index) => {
    if (row['@_r'] !== String(index + 1)) fail('Rows must be consecutive, starting at row 1.');
    for (const cell of list(row.c)) {
      const ref = cell['@_r'];
      if (!new RegExp('^[A-K]' + (index + 1) + '$').test(ref) || cells.has(ref)) fail('Unexpected or duplicate cell location.');
      if (Object.hasOwn(cell,'f')) fail('Formulas are not supported. Paste values as text.');
      let value = '';
      if (cell['@_t'] === 'inlineStr') value = textValue(cell.is);
      else if (cell['@_t'] === 's') {
        if (!/^\d+$/.test(cell.v) || !shared[Number(cell.v)]) fail('Invalid shared string.');
        value = textValue(shared[Number(cell.v)]);
      } else if (cell.v !== undefined && cell.v !== '') fail('All values must be text, including dates and numbers. Use the template.');
      if (value.length > 500) fail('A cell exceeds 500 characters.');
      cells.set(ref,value);
    }
  });
  HEADERS.forEach((h,i) => { if (cells.get(String.fromCharCode(65+i)+'1') !== h) fail('Workbook headers do not match the template.'); });
  const accounts = rows.slice(1).map((_,i) => {
    const n = i+2;
    const account = Object.fromEntries(HEADERS.map((h,c) => [h,cells.get(String.fromCharCode(65+c)+n) ?? '']));
    if (account.household_id !== 'hh-synthetic') fail('This POC accepts only the synthetic household ID hh-synthetic.');
    if (!['person-a','person-b'].includes(account.person_id)) fail('Owner must be person-a or person-b.');
    for (const h of ['account_id','provider_name','product_type']) if (!account[h].trim() || ['UNKNOWN','NA'].includes(account[h])) fail(h + ' is required.');
    if (!validDate(account.as_of)) fail('Each account needs a valid YYYY-MM-DD as_of date.');
    for (const h of HEADERS.slice(6)) validateValue(h, account[h]);
    return {...account,row:n};
  });
  return {hash:createHash('sha256').update(buffer).digest('hex'),filename:filename.slice(0,160),adapter:'accounts-v1',accounts};
}
