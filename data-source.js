import { CONFIG } from './config.js';
const dataOrigins=new Map();
export const getDataOrigin=name=>dataOrigins.get(name)||'Lokale JSON-Daten';
export function parseCSV(csv) {
 const rows=[];let row=[],v='',quoted=false;csv=csv.replace(/^\uFEFF/,'');
 for(let i=0;i<csv.length;i++){const c=csv[i];if(c==='"'){if(quoted&&csv[i+1]==='"'){v+='"';i++}else quoted=!quoted}
 else if(c===','&&!quoted){row.push(v);v=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&csv[i+1]==='\n')i++;row.push(v);v='';if(row.some(Boolean))rows.push(row);row=[]}else v+=c}
 row.push(v);if(row.some(Boolean))rows.push(row);const [head=[],...body]=rows;
 return body.map((cells,i)=>({...Object.fromEntries(head.map((h,j)=>[h.trim(),cells[j]??''])),__sheetRow:i+2}));
}
const split=v=>String(v??'').split('|').map(s=>s.trim()).filter(Boolean);
const num=v=>v===''||v==null?undefined:Number(v);
const bool=v=>String(v).toLowerCase()==='true';
function sheetRef(kind,row){
 if(!CONFIG.googleSheetsId?.trim())return undefined;
 const tab=CONFIG.tabs[kind]?.tabName;const line=Number(row.__sheetRow);
 if(!tab||!Number.isInteger(line))return undefined;
 const gid=CONFIG.tabs[kind]?.tabID;
 // Google Sheets benötigt die numerische Blatt-ID für einen zuverlässigen Zeilenlink.
 // Ohne gid kein irreführender Link zu einem möglicherweise falschen Blatt.
 const base=`https://docs.google.com/spreadsheets/d/${encodeURIComponent(CONFIG.googleSheetsId.trim())}/edit`;
 const validGid=gid!==null&&gid!==undefined&&/^\d+$/.test(String(gid));
 const url=validGid?`${base}?gid=${gid}#gid=${gid}&range=${line}:${line}`:null;
 return {tab,row:line,gid:validGid?Number(gid):null,url};
}
const orgCategory={members:'mitglied',providers:'dienstleister',municipalities:'kommune',utilities:'betrieb',others:'oeffentlich',international:'oeffentlich'};
function normalizeOrg(r,kind){return {id:r.id,name:r.name,url:r.website,city:r.city,state:r.state,country:r.country||'DE',postalCodes:split(r.postalCodes),lat:num(r.lat),lon:num(r.lon),coreVersion:r.coreVersion||'unknown',roles:split(r.roles),evidence:r.evidence,source:r.source,notes:r.notes,mock:bool(r.mock),category:orgCategory[kind],sheetReference:sheetRef(kind,r),logo:r.logoUrl?{url:r.logoUrl,source:r.logoSource}:undefined}}
function normalizeProject(r){return {id:r.id,title:r.name,city:r.city,state:r.state,lat:num(r.lat),lon:num(r.lon),coreVersion:r.coreVersion,status:r.status,customerNames:split(r.customerNames),providerNames:split(r.providerNames),sources:split(r.sources).length?split(r.sources):[r.source].filter(Boolean),notes:r.notes,evidence:r.evidence,mock:bool(r.mock),sheetReference:sheetRef('projects',r)}}
function normalizeProcurement(r){return {id:r.id,title:r.name,buyer:r.buyer,city:r.city,state:r.state,postalCodes:split(r.postalCodes),lat:num(r.lat),lon:num(r.lon),version:r.coreVersion,status:r.status,publishedAt:r.publishedAt,deadline:r.deadline,tedId:r.tedId,lot:r.lot,source:r.source,notes:r.notes,evidence:r.evidence,sheetReference:sheetRef('procurements',r)}}
async function tab(kind){const name=CONFIG.tabs[kind]?.tabName;const url=`https://docs.google.com/spreadsheets/d/${encodeURIComponent(CONFIG.googleSheetsId.trim())}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);const body=await response.text();if(/^\s*<(!doctype|html)/i.test(body))throw Error(`${name}: Freigabe fehlt`);return parseCSV(body).filter(x=>Object.values(x).some(v=>String(v).trim()))}
async function local(name){dataOrigins.set(name,`Lokal: data/${name}.json`);const r=await fetch(`./data/${name}.json`);if(!r.ok)throw Error(`${name}: ${r.status}`);return r.json()}
export async function loadData(name){if(!CONFIG.googleSheetsId?.trim())return local(name);
 try{
 dataOrigins.set(name,'Google Sheets');
 if(name==='locations'){
  const kinds=['members','providers','municipalities','utilities','others','international'];
  const all=(await Promise.all(kinds.map(async kind=>(await tab(kind)).map(r=>normalizeOrg(r,kind))))).flat();
  // Identische Organisationen aus Mitglied + Kategorie nur einmal auf der Karte.
  const unique=new Map();for(const x of all){const key=(x.id||`${x.name}|${x.city}`).toLowerCase();if(unique.has(key)){const old=unique.get(key);old.roles=[...new Set([...old.roles,...x.roles, ...(x.category==='mitglied'?['Mitglied']:[])])];if(old.category==='mitglied'&&x.category!=='mitglied')old.category=x.category;old.sheetReferences=[...(old.sheetReferences||[old.sheetReference].filter(Boolean)),x.sheetReference].filter(Boolean);}else {x.sheetReferences=x.sheetReference?[x.sheetReference]:[];unique.set(key,x)}}
  return [...unique.values()].map(x=>({...x,dataOrigin:'Google Sheets'}));
 }
 if(name==='projects')return {records:(await tab('projects')).map(normalizeProject)};
 if(name==='procurements')return {records:(await tab('procurements')).map(normalizeProcurement)};
 if(name==='service-areas')return (await tab('areas')).map(r=>({name:r.name,city:r.city,postalCodes:split(r.postalCodes),status:r.status,note:r.notes,geometry:r.geometry?JSON.parse(r.geometry):null}));
 if(name==='metrics')return Object.fromEntries((await tab('metrics')).map(r=>[r.key, /^-?\d+(\.\d+)?$/.test(r.value)?Number(r.value):r.value]));
 return local(name);
 }catch(e){console.warn('Google Sheets nicht erreichbar; lokaler Fallback',name,e);if(!CONFIG.fallbackToLocal)throw e;return local(name)}
}
