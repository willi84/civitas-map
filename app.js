import { loadData, getDataOrigin } from './data-source.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const categories={alle:{label:'Alle',icon:'🗺️',color:'#536578'},kommune:{label:'Kommunen',icon:'🏛️',color:'#1976d2'},betrieb:{label:'Kommunale Betriebe',icon:'⚡',color:'#16a085'},oeffentlich:{label:'Öffentliche Einrichtungen',icon:'🎓',color:'#7b4cc0'},dienstleister:{label:'Dienstleister',icon:'🛠️',color:'#e07822'},auftrag:{label:'Öffentliche Aufträge',icon:'📑',color:'#bf3c64'},entwicklung:{label:'Entwicklung',icon:'💻',color:'#5965c8'},projekt:{label:'Kundenprojekte',icon:'🔗',color:'#8d49a8'}};
const map=L.map('map').setView([51.1,10.4],6);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(map);
const pins=L.layerGroup().addTo(map),areas=L.layerGroup().addTo(map);let data=[],category='alle',version='all',statesGeo=null;let selectedMarker=null;const selectedStates=new Set();
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stateAliases={'Baden-Württemberg':'Baden-Württemberg','Bayern':'Bayern','Berlin':'Berlin','Brandenburg':'Brandenburg','Bremen':'Bremen','Hamburg':'Hamburg','Hessen':'Hessen','Mecklenburg-Vorpommern':'Mecklenburg-Vorpommern','Niedersachsen':'Niedersachsen','Nordrhein-Westfalen':'Nordrhein-Westfalen','Rheinland-Pfalz':'Rheinland-Pfalz','Saarland':'Saarland','Sachsen':'Sachsen','Sachsen-Anhalt':'Sachsen-Anhalt','Schleswig-Holstein':'Schleswig-Holstein','Thüringen':'Thüringen'};
const stateNames=Object.keys(stateAliases);
const stateShort={'Baden-Württemberg':'Baden-Württ.','Mecklenburg-Vorpommern':'Meck.-Vorp.','Nordrhein-Westfalen':'NRW','Rheinland-Pfalz':'Rheinl.-Pfalz','Schleswig-Holstein':'Schl.-Holstein','Sachsen-Anhalt':'Sachsen-Anh.','Niedersachsen':'Niedersachsen'};
const stateImages=new Map();
function availableStates(){return new Set(data.filter(d=>!d.mock && d.state && stateNames.includes(d.state)).map(d=>d.state))}
function stateBadge(name){
 if(!name || !stateNames.includes(name))return '';
 const image=stateImages.get(name);
 return `<span class="result-state" title="${esc(name)}">${image?`<img src="${esc(image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">`:'🛡️'}<span>${esc(stateShort[name]||name)}</span></span>`;
}
function renderStateButtons(){
 const root=$('#state-buttons');
 const available=availableStates();
 root.innerHTML=`<button type="button" class="state-button all" data-state="" aria-pressed="${selectedStates.size===0}" title="Alle Bundesländer"><span class="state-placeholder">🗺️</span><small>Alle</small></button>`+stateNames.map(name=>`<button type="button" class="state-button ${available.has(name)?'':'is-empty'}" data-state="${esc(name)}" ${available.has(name)?'':'disabled aria-disabled="true"'} aria-pressed="${selectedStates.has(name)}" title="${esc(name)}${available.has(name)?'':' – keine belegten Daten'}">${stateImages.has(name)?`<img src="${esc(stateImages.get(name))}" alt="Wappen ${esc(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'state-placeholder',textContent:'🛡️'}))">`:'<span class="state-placeholder">🛡️</span>'}<small>${esc(stateShort[name]||name)}</small></button>`).join('');
}
$('#state-buttons').addEventListener('click',e=>{const btn=e.target.closest('[data-state]');if(!btn||btn.disabled)return;const name=btn.dataset.state;if(!name){selectedStates.clear()}else if(selectedStates.has(name)){selectedStates.delete(name)}else{selectedStates.add(name)}renderStateButtons();render()});
// Wikipedia API: lädt die Bildvorschau der Wikipedia-Seite des Bundeslands.
// Keine fest eingebauten, möglicherweise falschen Wappen-Dateinamen.
async function loadStateImages(){
 try{
  const api=new URL('https://de.wikipedia.org/w/api.php');
  api.search=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'pageimages',piprop:'thumbnail',pithumbsize:'90',titles:stateNames.join('|')}).toString();
  const response=await fetch(api);if(!response.ok)throw new Error(`Wikipedia ${response.status}`);
  const json=await response.json();
  for(const page of Object.values(json.query?.pages||{})){if(page.thumbnail?.source&&stateNames.includes(page.title))stateImages.set(page.title,page.thumbnail.source)}
  renderStateButtons();render();
 }catch(error){console.warn('Wikipedia-Vorschaubilder nicht erreichbar',error)}
}
renderStateButtons();loadStateImages();
function render(){const q=$('#search').value.toLocaleLowerCase('de');const matches=data.filter(d=>(selectedStates.size===0||selectedStates.has(d.state))&&(category==='alle'||d.category===category)&&(version==='all'||(version==='v2'?d.coreVersion==='2-development':version==='unknown'?['unknown','unspecified'].includes(d.coreVersion):d.coreVersion===version))&&[d.name,d.city,d.state,...(Array.isArray(d.postalCodes)?d.postalCodes:[]),...(d.roles||[]),d.coreVersion,d.country,d.buyer,d.tedId,d.status,...(d.customerNames||[]),...(d.providerNames||[])].join(' ').toLocaleLowerCase('de').includes(q));const filtered=matches.some(d=>!d.mock)?matches.filter(d=>!d.mock):matches;$('#filters').innerHTML=Object.entries(categories).map(([k,v])=>`<button style="--accent:${v.color}" data-category="${k}" class="${category===k?'active':''}">${v.icon} ${v.label}</button>`).join('');pins.clearLayers();$('#results').replaceChildren();for(const d of filtered){const c=categories[d.category]||categories.alle;const marker=(Number.isFinite(d.lat)&&Number.isFinite(d.lon)?L.circleMarker([d.lat,d.lon],{radius:9,color:'#fff',weight:2,fillColor:d.mock?'#9e9e9e':c.color,fillOpacity:.95}).addTo(pins):null);const logo=d.logo?.url?`<img class="org-logo" src="${esc(d.logo.url)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="logo-fallback" style="display:none">${c.icon}</span>`:`<span class="logo-fallback">${c.icon}</span>`;const refs=d.sheetReferences?.length?d.sheetReferences:(d.sheetReference?[d.sheetReference]:[]);
 const refLinks=refs.map(ref=>ref.url?`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${esc(ref.tab)} · Zeile ${esc(ref.row)} ↗</a>`:`<span title="Tab-ID nicht konfiguriert">${esc(ref.tab)} · Zeile ${esc(ref.row)} (Tab-ID fehlt)</span>`).join(' ');
 const evidenceUrls=[d.source,...(d.sources||[])].filter(Boolean);
 const sourceLinks=[...new Set(evidenceUrls)].map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Quelle ${i+1} ↗</a>`).join(' ');
 const origin=esc(d.dataOrigin||'Lokale JSON-Daten');
 const sheetIcon=`<svg class="sheets-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#188038" d="M5 2h10l5 5v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path fill="#34a853" d="M15 2v5h5z"/><path fill="#fff" d="M7 10h10v9H7zm2 2v2h3v-2zm5 0v2h1v-2zm-5 4v1h3v-1zm5 0v1h1v-1z"/></svg>`;
 const sourceDetails=sourceLinks?`<details class="source-details" onclick="event.stopPropagation()"><summary>🔗 Quelle${evidenceUrls.length>1?'n':''}</summary><div class="source-links">${sourceLinks}</div></details>`:'';
 const sheetDetails=refs.length?`<details class="source-details" onclick="event.stopPropagation()"><summary>${sheetIcon} Sheets <span class="source-count">${refs.length}</span></summary><div class="source-links">${refLinks}</div></details>`:`<details class="source-details" onclick="event.stopPropagation()"><summary>📁 Daten</summary><div class="source-links"><small>${origin}</small></div></details>`;
 const compactSources=sourceDetails+sheetDetails;
 const links=compactSources;
 marker?.bindPopup(`<b>${c.icon} ${esc(d.name)}</b><br>${esc(d.city)} · ${esc(d.state)} ${stateBadge(d.state)}<br>${esc(c.label)} · CORE ${esc(d.coreVersion||'unknown')}<br>${esc((d.roles||[]).join(' · '))}<br>${d.buyer?'Auftraggeber: '+esc(d.buyer)+'<br>':''}${d.customerNames?.length?'Kunden: '+esc(d.customerNames.join(', '))+'<br>':''}${d.providerNames?.length?'Dienstleister: '+esc(d.providerNames.join(', '))+'<br>':''}${d.tedId?'TED: '+esc(d.tedId)+'<br>':''}${d.mock?'⚠️ Mock':d.evidence==='candidate'?'◌ Beteiligungshinweis':'✓ Quellenbelegt'}<br>${links}`);const el=document.createElement('div');el.className='item';el.style.setProperty('--accent',c.color);el.innerHTML=`<div class="result-icon" style="background:${c.color}1a;color:${c.color}">${logo}</div><div class="result-body"><div class="result-top"><strong>${esc(d.name)}</strong><span class="category-tag" style="color:${c.color};background:${c.color}15">${esc(c.label)}</span></div><div class="result-meta">📍 ${esc(d.city||'Ohne Ortsangabe')}${d.state?' · '+esc(d.state):''}${stateBadge(d.state)}</div><div class="result-detail">${esc((d.providerNames||d.roles||[]).slice(0,4).join(' · '))}</div><div class="result-bottom"><span class="pill ${d.mock?'mock':''}">${d.mock?'⚠ Mock':d.evidence==='candidate'?'◌ Hinweis':'✓ Quellenbelegt'}</span>${compactSources}</div></div>`;el.onclick=()=>{if(marker){map.setView([d.lat,d.lon],10);marker.openPopup()}};$('#results').append(el)}$('#stats').textContent=`${filtered.length} Treffer · ${filtered.filter(x=>!x.mock).length} belegt · ${filtered.filter(x=>x.mock).length} Mock`;renderStates(filtered);renderStateButtons()}
function renderStates(filtered){areas.clearLayers();if(!statesGeo||!$('#states').checked)return;const hits=new Set(filtered.filter(x=>!x.mock).map(x=>x.state));L.geoJSON(statesGeo,{style:f=>{const name=f.properties.name||f.properties.NAME_1||f.properties.NAME||'';const hit=hits.has(name);return {color:hit?'#1976d2':'#aebdca',weight:hit?2:0.7,fillColor:hit?'#81b6e9':'#f2f5f8',fillOpacity:hit?.3:.07}},onEachFeature:(f,l)=>{const n=f.properties.name||f.properties.NAME_1||f.properties.NAME||'';l.bindTooltip(`${n}: ${filtered.filter(d=>!d.mock&&d.state===n).length} Einträge`)}}).addTo(areas);areas.bringToBack()}
$('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;render()}});$('#search').addEventListener('input',render);$('#version').addEventListener('change',e=>{version=e.target.value;render()});$('#states').addEventListener('change',render);
async function init(){data=await loadData('locations');const locOrigin=getDataOrigin('locations');data.forEach(d=>d.dataOrigin=locOrigin);await loadProcurements();await loadProjects();render();try{const m=await loadData('metrics');const n=new Set(data.filter(x=>!x.mock&&x.category==='kommune').map(x=>x.city)).size,pct=100*n/m.municipalitiesGermany;$('#coverage').innerHTML=`<strong>🏛️ ${n} / ${m.municipalitiesGermany.toLocaleString('de-DE')} Kommunen · ${pct.toLocaleString('de-DE',{maximumFractionDigits:3})}% öffentlich belegt</strong><div style="height:9px;background:#c9ded6;border-radius:12px;margin:8px 0"><div style="height:100%;min-width:3px;width:${pct}%;background:#1976d2;border-radius:12px"></div></div><small>Untergrenze, keine vollständige Nutzungsquote · <a href="${esc(m.source)}" target="_blank">Quelle ↗</a></small>`}catch(e){console.warn(e)}
try{const r=await fetch('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json');if(r.ok){statesGeo=await r.json();render()}}catch(e){console.warn('Bundesland-Geometrie offline nicht verfügbar',e)}
try{const a=await loadData('service-areas');$('#areasnote').textContent=`⚡ ${a.length} Stadtwerke-Gebiete vorbereitet; keine bestätigten PLZ-Polygone vorhanden. Flächen werden erst nach Import valider GeoJSON-Geometrien angezeigt.`;for(const x of a){if(x.geometry)L.geoJSON(x.geometry,{style:{color:'#16a085',fillColor:'#16a085',fillOpacity:.25}}).addTo(areas)}}catch(e){console.warn(e)}
loadGitlab()}
async function loadGitlab(){const root=$('#gitlab');const projects=[{id:10355,name:'CORE v2',url:'https://gitlab.opencode.de/civitas-connect/civitas-core-v2/civitas-core-platform'},{id:2834,name:'CORE v1',url:'https://gitlab.opencode.de/civitas-connect/civitas-core'}];root.innerHTML='<b>💻 GitLab-Projekte</b><br>';for(const p of projects){try{const r=await fetch(`https://gitlab.opencode.de/api/v4/projects/${p.id}/issues?state=opened&per_page=1`);if(!r.ok)throw Error(String(r.status));const count=r.headers.get('x-total');root.innerHTML+=`<div><a href="${p.url}/-/issues" target="_blank">${p.name} ↗</a>: ${count??'mind. 1'} offene Issues (Live-API)</div>`}catch{root.innerHTML+=`<div><a href="${p.url}/-/issues" target="_blank">${p.name} ↗</a>: API derzeit nicht erreichbar</div>`}}root.innerHTML+='<small>Issues ohne bestätigten Organisationsbezug werden nicht willkürlich auf der Karte verortet.</small>'}
init().catch(e=>{$('#stats').textContent='Daten konnten nicht geladen werden';console.error(e)});

async function loadProcurements(){
  try{
    const doc=await loadData('procurements');
    const cityCoords={Altenholz:[54.4,10.13],Regensburg:[49.014,12.101]};
    const records=doc.records.map(p=>{
      const coords=cityCoords[p.city];
      return {id:p.id,name:p.title,category:'auftrag',city:p.city,state:p.state,
        lat:Number.isFinite(p.lat)?p.lat:coords?.[0],lon:Number.isFinite(p.lon)?p.lon:coords?.[1],postalCodes:p.postalCodes||[],
        roles:['Vergabeverfahren',p.status==='open'?'Ausschreibung offen':'Bekanntmachung'],
        coreVersion:p.version||'unknown',buyer:p.buyer,tedId:p.tedId,status:p.status,
        source:p.source,mock:false,country:'DE',sheetReference:p.sheetReference,
        dataOrigin:getDataOrigin('procurements')};
    });
    data.push(...records);
  }catch(err){console.warn('Vergabedaten nicht verfügbar',err)}
}

async function loadProjects(){
 try{const doc=await loadData('projects');
 const rows=doc.records.map(p=>({id:p.id,name:p.title,category:'projekt',city:p.city,state:p.state,lat:p.lat,lon:p.lon,coreVersion:p.coreVersion,roles:[p.status,p.notes],customerNames:p.customerNames,providerNames:p.providerNames,source:p.sources?.[0],mock:!!p.mock,country:'DE',sheetReference:p.sheetReference,dataOrigin:getDataOrigin('projects')}));
 data.push(...rows);document.querySelector('#projectsnote').textContent=`🔗 ${rows.length} recherchierte Projektbeziehungen; Auftraggeber und Dienstleister in der Suche enthalten. Quellen in data/projects.json.`;
 }catch(e){document.querySelector('#projectsnote').textContent='Projektbeziehungen nicht verfügbar';console.warn(e)}
}
