/* DISHA CMS – SEO Management: Schema, Robots.txt, XML Sitemap, Analytics & Tracking (UI).
   Wraps the existing "Page SEO" editor (mods.js) as the first tab; nothing in it is changed.
   Data goes through SeoStore / SeoAPI (seo-api.js); rules and validators live in SeoLogic (seo-schema.js). */
(function(){
const L=SeoLogic,S=SeoStore,M=window.Modules,C=Content;
const pageSeo=M['seo-management'];
const TABS=[['pages','Page SEO','file-search'],['schema','Schema','braces'],['robots','Robots.txt','bot'],['sitemap','XML Sitemap','network'],['analytics','Analytics & Tracking','bar-chart-3']];
const TONE={ok:'green',warn:'gold',error:'red',missing:'gold',disabled:'gray'};
const SLABEL={ok:'Valid',warn:'Needs a look',error:'Errors',missing:'Missing',disabled:'Disabled'};
const fmt=d=>{if(!d)return'Never';const x=new Date(d);return isNaN(x)?'Never':x.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})};
const bytes=n=>n<1024?n+' B':(n/1024).toFixed(1)+' KB';
const pill=(t,tone)=>`<span class="badge b-${tone}">${esc(t)}</span>`;
const stat=(i,l,v,c='')=>`<div class="se-stat ${c}"><span>${ic(i)}</span><div><b>${v}</b><small>${l}</small></div></div>`;
const issues=(r,okMsg)=>{const e=r.errors||[],w=r.warnings||[];if(!e.length&&!w.length)return`<div class="sx-msg ok">${ic('check-circle-2')}<div><b>${esc(okMsg||'No problems found.')}</b></div></div>`;
 return e.map(x=>`<div class="sx-msg bad">${ic('x-circle')}<div>${esc(x)}</div></div>`).join('')+w.map(x=>`<div class="sx-msg warn">${ic('alert-triangle')}<div>${esc(x)}</div></div>`).join('')};
const modeNote=()=>SeoAPI.live()?'':notice('<b>Backend not connected.</b> Everything here is saved as a draft and as a published copy in this browser only. Nothing reaches the live website, <code>robots.txt</code>, <code>sitemap.xml</code> or the page code until the backend endpoints in <code>docs/SEO-API.md</code> are connected.');
const siteNote=()=>L.base().placeholder?notice('The real website address is not set yet, so the placeholder <b>'+esc(L.PLACE)+'</b> is used for previews. Add it in <a class="underline font-semibold" href="website-settings.html">Website Settings</a> before publishing.'):'';
const download=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.download=name;document.body.appendChild(a);a.click();a.remove()};
const readFile=(file,max,ok)=>new Promise((res,rej)=>{if(file.size>max)return rej(new Error('The file is larger than '+bytes(max)+'.'));if(!ok.test(file.name))return rej(new Error('Unsupported file type. Choose '+ok.source.replace(/[\\$]/g,'')+'.'));
 const r=new FileReader();r.onerror=()=>rej(new Error('The file could not be read.'));r.onload=()=>{const t=String(r.result);if(/\u0000/.test(t))return rej(new Error('This looks like a binary file, not text.'));res(t)};r.readAsText(file,'utf-8')});
const busy=async(btn,fn)=>{if(btn.classList.contains('is-busy'))return;btn.classList.add('is-busy');btn.disabled=true;try{return await fn()}finally{btn.classList.remove('is-busy');btn.disabled=false}};
const copy=async t=>{try{await navigator.clipboard.writeText(t);Toast.show('Copied to clipboard.')}catch(e){Toast.show('Copy is blocked by the browser. Select the text and press Ctrl+C.','error')}};

/* ===================== tab wrapper + shared toolbar ===================== */
let tabState={tab:'pages'};
const publishAll=async()=>{
 const bad=[];L.pages().forEach(pg=>{const e=S.d.schema.pages[pg.key];if(!e||e.enabled===false)return;const r=L.checkPage(pg,e);if(r.errors)bad.push(pg.name+' ('+r.errors+' error'+(r.errors>1?'s':'')+')')});
 const rb=S.d.robots.content?L.robots.validate(S.d.robots.content,{authorised:S.d.robots.authorised}):null,sm=S.d.sitemap.content?L.sitemap.validate(S.d.sitemap.content):null;
 if(rb&&rb.errors.length)bad.push('robots.txt');if(sm&&sm.errors.length)bad.push('XML sitemap');
 if(bad.length)return Toast.show('Fix the errors first: '+bad.slice(0,4).join(', ')+(bad.length>4?'…':'')+'.','error');
 if(!S.dirty())return Toast.show('Nothing to publish. Everything is up to date.');
 const msg=SeoAPI.live()?'Publish the schema, robots.txt, sitemap and tracking settings to the live website?':'Mark the SEO settings as published? Until the backend is connected this only updates the published copy stored in this browser. <b>The live website, robots.txt and sitemap.xml do not change yet.</b>';
 if(!await confirmBox(msg,{title:'Publish SEO settings?',ok:'Publish'}))return;
 try{const r=await SeoAPI.publish(L.manifest(S,C.p));C.log('Published: SEO tools (schema, robots, sitemap, tracking)','SEO');
  Toast.show(r.local?'Marked as published (stored in this browser). The live website is not changed yet.':'Published to the website.');paintTB()}
 catch(x){Toast.show('Publish failed: '+x.message,'error')}};
const previewAll=()=>{const m=L.manifest(S,C.d),n=Object.values(m.schema).reduce((a,b)=>a+b.length,0);
 Modal.open({title:'Publish preview · what the website would receive',size:'lg',body:`<div class="sx-pv"><div class="sx-kv"><b>Website address</b><span>${esc(m.siteUrl)}${m.placeholderDomain?' (placeholder)':''}</span></div>
 <div class="sx-kv"><b>JSON-LD blocks</b><span>${n} on ${Object.keys(m.schema).length} pages</span></div><div class="sx-kv"><b>robots.txt</b><span>${m.robots.content?bytes(new Blob([m.robots.content]).size):'not created'}</span></div>
 <div class="sx-kv"><b>sitemap.xml</b><span>${m.sitemap.content?bytes(new Blob([m.sitemap.content]).size):'not created'}</span></div><div class="sx-kv"><b>Tracking tags</b><span>${m.tracking.head.length} in head, ${m.tracking.bodyStart.length} after body tag</span></div></div>
 ${L.track.plan(S.d.tracking).warn.map(w=>`<div class="sx-msg warn">${ic('alert-triangle')}<div>${esc(w)}</div></div>`).join('')}
 <p class="hint mt-3">Only public website pages receive these tags. The admin panel and the login page never do.</p>
 <div class="mt-3"><button class="btn btn-ghost btn-sm" id="pvDl">${ic('download')}Download publish manifest (JSON)</button></div>`,onMount:w=>{$('#pvDl',w).onclick=()=>download('disha-seo-manifest.json',JSON.stringify(m,null,2),'application/json')}})};
const paintTB=()=>{const b=$('#stb');if(b)b.innerHTML=S.dirty()?`<span class="badge b-gold">Draft to publish</span>`:`<span class="badge b-green">All published</span>`};
const setTB=()=>{Page.TB(Page.tbHtml(),act=>{if(act==='pv')return previewAll();if(act==='sd'){SeoAPI.saveDraft();paintTB();return Toast.show('Everything is saved as a draft automatically. Use Publish when you are ready.')}publishAll()});paintTB()};
const persist=()=>{S.save();paintTB()};

M['seo-management']=root=>{
 const q=new URLSearchParams(location.search).get('tab');if(TABS.some(t=>t[0]===q))tabState.tab=q;
 root.innerHTML=`<div class="sx"><div class="page-head"><div><h1>SEO Management</h1><p>Search listings, structured data, robots.txt, sitemap and tracking for the whole website.</p></div></div>
  <nav class="sx-tabs" id="sxT" aria-label="SEO sections">${TABS.map(t=>`<button type="button" data-t="${t[0]}">${ic(t[2])}<span>${t[1]}</span></button>`).join('')}</nav><div id="sxB"></div></div>`;
 const body=$('#sxB',root);
 const show=t=>{tabState.tab=t;history.replaceState(null,'',location.pathname+'?tab='+t+(t==='pages'?location.hash:''));
  $$('#sxT button',root).forEach(b=>b.classList.toggle('on',b.dataset.t===t));const host=document.createElement('div');body.replaceChildren(host);
  if(t==='pages'){pageSeo(host);const h=$('.page-head',host);h&&h.remove()}
  else{setTB();({schema:schemaTab,robots:robotsTab,sitemap:sitemapTab,analytics:analyticsTab})[t](host)}icons()};
 $('#sxT',root).addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.t!==tabState.tab)show(b.dataset.t)});show(tabState.tab)};

/* ===================== SCHEMA ===================== */
const ICON={home:'house',svc:'stethoscope',blog:'newspaper'};
/* first use of a page: copy the JSON-LD that is already on the website page, untouched */
const ensure=pg=>{const P=S.d.schema.pages;if(P[pg.key])return P[pg.key];
 P[pg.key]={enabled:true,dateModified:'',blocks:((window.SEO_EXISTING||{})[pg.key]||[]).map(o=>({id:uid(),json:JSON.stringify(o,null,2),enabled:true,source:'existing',mode:'manual'})),updatedAt:null};
 /* the published copy starts from the same untouched import, so merely opening a page never counts as a change */
 if(!S.p.schema.pages[pg.key])S.p.schema.pages[pg.key]=JSON.parse(JSON.stringify(P[pg.key]));return P[pg.key]};
const blockLabel=b=>{try{return L.typesOf(JSON.parse(b.json)).join(' + ')||'Schema'}catch(e){return'Invalid JSON'}};
const SRC={existing:['Existing on website','gray'],generated:['Follows content','green'],custom:['Custom','gold']};
function schemaTab(root){
 const st={view:'overview',key:'home',q:'',f:'all',sel:null,edit:null,dirty:false};
 const allPages=()=>L.pages();const entry=pg=>ensure(pg);
 const info=pg=>{const e=entry(pg);return{e,r:L.checkPage(pg,e)}};
 const render=()=>{
  const P=allPages().map(pg=>({pg,...info(pg)})),ok=P.filter(x=>x.r.status==='ok'||x.r.status==='warn'),miss=P.filter(x=>x.r.status==='missing'),err=P.reduce((n,x)=>n+x.r.errors,0);
  root.innerHTML=`${modeNote()}${siteNote()}<div class="se-stats">${stat('layers','Managed pages',P.length)}${stat('badge-check','With valid schema',ok.length+'/'+P.length,'ok')}${stat('file-warning','Missing recommended schema',miss.length,miss.length?'warn':'ok')}${stat('bug','Validation errors',err,err?'warn':'ok')}</div>
  <div class="sx-sub"><div class="se-seg" id="scV">${[['overview','Overview','layout-grid'],['home','Homepage','house'],['svc','Service pages','stethoscope'],['blog','Blog posts','newspaper']].map(v=>`<button type="button" data-v="${v[0]}" class="${st.view===v[0]?'on':''}">${ic(v[2])}${v[1]}</button>`).join('')}</div></div><div id="scM"></div>`;
  (st.view==='overview'?overview:editor)($('#scM',root),P);icons()};
 /* ---- overview ---- */
 const overview=(host,P)=>{const rows=P.filter(x=>(st.f==='all'||(st.f==='miss'?x.r.status==='missing':st.f==='err'?x.r.errors>0:x.pg.kind===st.f))&&(!st.q||(x.pg.name+x.pg.path).toLowerCase().includes(st.q.toLowerCase())));
  host.innerHTML=`<section class="hb-card sx-card"><div class="sx-bar"><div class="search"><i data-lucide="search"></i><input class="input" id="scQ" placeholder="Search by page name…" value="${esc(st.q)}" autocomplete="off" aria-label="Search pages"></div>
   <div class="se-chips">${[['all','All'],['home','Homepage'],['svc','Services'],['blog','Blogs'],['miss','Missing schema'],['err','Has errors']].map(c=>`<button type="button" data-f="${c[0]}" class="${st.f===c[0]?'on':''}">${c[1]}</button>`).join('')}</div>
   <div class="sx-acts"><button class="btn btn-ghost btn-sm" data-a="validate">${ic('shield-check')}Validate all</button><button class="btn btn-primary btn-sm" data-a="complete">${ic('wand-sparkles')}Complete missing schema</button></div></div>
   <div class="tbl-wrap"><table class="tbl sx-tbl"><thead><tr><th>Page</th><th>Type</th><th>Schema on page</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${esc(x.pg.name)}</b><small class="sx-path">${esc(x.pg.path)}</small></td><td>${x.pg.kind==='home'?'Homepage':x.pg.kind==='svc'?'Service':'Blog'}</td>
   <td>${[...new Set(x.r.types)].map(t=>`<i class="sx-chip">${esc(t)}</i>`).join('')||'<span class="hint">None</span>'}${x.r.missing.length?`<div class="sx-need">Needs: ${esc(x.r.missing.join(', '))}</div>`:''}</td>
   <td>${pill(SLABEL[x.r.status],TONE[x.r.status])}${x.r.errors||x.r.warnings?`<small class="sx-path">${x.r.errors?x.r.errors+' error'+(x.r.errors>1?'s':''):''}${x.r.errors&&x.r.warnings?', ':''}${x.r.warnings?x.r.warnings+' note'+(x.r.warnings>1?'s':''):''}</small>`:''}${L.live(x.pg)?'':'<small class="sx-path">Draft: not output</small>'}</td>
   <td class="text-right"><button class="btn btn-ghost btn-sm" data-open="${esc(x.pg.key)}">${ic('pencil')}Open</button></td></tr>`).join('')||`<tr><td colspan="5"><div class="se-none">${ic('search-x')}<b>No pages found</b><small>Try another search or filter.</small></div></td></tr>`}</tbody></table></div>
   <div class="sx-foot">${ic('info')}<span>${L.others().length} other pages (About, Contact, listings, legal) carry only a BreadcrumbList. They are listed in <code>docs/SEO-AUDIT.md</code> and need no change.</span></div></section>`};
 /* ---- editor for homepage / services / blogs ---- */
 const editor=(host,P)=>{const kind=st.view,list=P.filter(x=>x.pg.kind===kind);if(!list.some(x=>x.pg.key===st.key))st.key=list[0].pg.key;
  const cur=list.find(x=>x.pg.key===st.key),{pg,e,r}=cur;if(!e.blocks.some(b=>b.id===st.sel))st.sel=(e.blocks[0]||{}).id||null;
  const b=e.blocks.find(x=>x.id===st.sel),text=st.edit!=null&&st.edit.id===st.sel?st.edit.text:(b?b.json:'');
  const vr=b?L.validate(text,{pg}):null,single=kind==='home';
  const isLive=L.live(pg);
  host.innerHTML=`<div class="${single?'':'se-grid'}">${single?'':`<aside class="hb-card se-side"><div class="se-tools"><div class="search"><i data-lucide="search"></i><input class="input" id="scQ" placeholder="Search pages…" value="${esc(st.q)}" autocomplete="off" aria-label="Search pages"></div></div><div class="se-list">${list.filter(x=>!st.q||x.pg.name.toLowerCase().includes(st.q.toLowerCase())).map(x=>`<button type="button" class="se-it ${x.pg.key===st.key?'on':''}" data-pick="${esc(x.pg.key)}"><span class="se-dot ${x.r.status==='ok'?'':x.r.status==='error'||x.r.status==='missing'&&!x.r.types.length?'bad':'warn'}"></span><span class="se-nm"><b>${esc(x.pg.name)}</b><small>${esc(x.pg.path)}</small></span>${x.e.enabled===false?'<i class="se-tag">Off</i>':''}</button>`).join('')}</div></aside>`}
  <section class="hb-card se-main"><header class="hb-head se-head"><div class="hb-ico">${ic(ICON[kind],'w-6 h-6')}</div><div class="hb-ttl"><span class="hb-eye">${kind==='home'?'Homepage':kind==='svc'?'Service page':'Blog post'}</span><h2>${esc(pg.name)}</h2><p>${esc(pg.path)}</p></div>
   <div class="sx-pg">${pill(SLABEL[r.status],TONE[r.status])}<label class="sx-sw" title="Turn all schema on this page on or off"><span class="switch"><input type="checkbox" id="pgOn" ${e.enabled!==false?'checked':''}><span></span></span><small>Schema on</small></label></div></header>
   <div class="se-body sx-body">
   ${isLive?'':`<div class="sx-msg warn">${ic('eye-off')}<div>This ${kind==='svc'?'service':'post'} is not published, so its schema is <b>not</b> sent to the live website until it is published.</div></div>`}
   ${r.pageErrors.map(x=>`<div class="sx-msg bad">${ic('x-circle')}<div>${esc(x)}</div></div>`).join('')}${r.missing.length?`<div class="sx-msg warn">${ic('file-warning')}<div>Recommended but missing: <b>${esc(r.missing.join(', '))}</b>. Use <b>Add schema</b> or <b>Complete missing</b> below.</div></div>`:''}
   ${kind==='blog'?`<div class="se-f"><div class="fld"><label class="lbl" for="dmod">Last updated date</label><input class="input" type="date" id="dmod" value="${esc(L.iso(e.dateModified).slice(0,10))}"><p class="hint">Used for <code>dateModified</code> and the sitemap. Leave empty if the article was never changed: nothing is invented.</p></div></div>`:''}
   <div class="sx-blocks">${e.blocks.map(x=>{const rr=L.validate(x.json,{pg}),sr=SRC[x.mode==='auto'?'generated':x.source]||SRC.custom;
     return`<div class="sx-blk ${x.id===st.sel?'on':''} ${rr.errors.length?'bad':''}" data-sel="${x.id}"><div class="sx-bt"><b>${esc(blockLabel(x))}</b><span>${pill(sr[0],sr[1])}${rr.errors.length?pill(rr.errors.length+' error'+(rr.errors.length>1?'s':''),'red'):rr.warnings.length?pill(rr.warnings.length+' note'+(rr.warnings.length>1?'s':''),'gold'):pill('Valid','green')}</span></div>
      <div class="sx-ba"><label class="sx-sw" title="Enable or disable this block"><span class="switch"><input type="checkbox" data-bon="${x.id}" ${x.enabled!==false?'checked':''}><span></span></span></label><button class="btn btn-ghost btn-sm" data-edit="${x.id}">${ic('pencil')}Edit</button><button class="btn btn-ghost btn-sm" data-del="${x.id}" title="Delete this block">${ic('trash-2')}</button></div></div>`}).join('')||`<div class="se-none">${ic('braces')}<b>No schema on this page yet</b><small>Add one below, or generate it from the page content.</small></div>`}</div>
   <div class="sx-add"><select class="input" id="addK" aria-label="Schema type to add">${(kind==='home'?['Organization','WebSite','BreadcrumbList']:kind==='svc'?['Service','FAQPage','BreadcrumbList']:['BlogPosting','BreadcrumbList']).concat(['Custom JSON']).map(t=>`<option>${t}</option>`).join('')}</select><button class="btn btn-ghost btn-sm" data-a="add">${ic('plus')}Add schema</button>${r.missing.length||kind!=='home'?`<button class="btn btn-ghost btn-sm" data-a="complete1">${ic('wand-sparkles')}Complete missing</button>`:''}</div>
   ${b?`<div class="sx-ed"><div class="sx-edh"><b>JSON-LD · ${esc(blockLabel(b))}</b><span class="sx-edb">${st.edit&&st.edit.id===b.id&&st.edit.text!==b.json?pill('Unsaved changes','gold'):''}</span></div>
    <textarea class="se-code" id="code" spellcheck="false" wrap="off" aria-label="JSON-LD code">${esc(text)}</textarea><div id="vOut" class="sx-v">${issues(vr,'Valid JSON-LD. This checks structure only. It does not guarantee Google rich result eligibility.')}</div>
    <div class="sx-edf"><button class="btn btn-ghost btn-sm" data-a="format">${ic('align-left')}Format</button><button class="btn btn-ghost btn-sm" data-a="validate1">${ic('shield-check')}Validate</button>${L.autoFor(pg,L.typesOf(vr.obj||{})[0])?`<button class="btn btn-ghost btn-sm" data-a="regen">${ic('refresh-cw')}Update from content</button>`:''}${(window.SEO_EXISTING||{})[pg.key]?`<button class="btn btn-ghost btn-sm" data-a="reset">${ic('rotate-ccw')}Reset to existing</button>`:''}<button class="btn btn-ghost btn-sm" data-a="copy">${ic('copy')}Copy</button><span class="sx-sp"></span><button class="btn btn-primary btn-sm" data-a="save">${ic('save')}Save changes</button></div>
    <details class="se-adv"><summary>${ic('code')}Live output preview<span>${isLive&&e.enabled!==false&&b.enabled!==false?'what the page receives':'not output right now'}</span></summary><pre class="sx-pre">${vr.obj?esc(L.ld(JSON.parse(L.resolve(JSON.stringify(vr.obj)))) ):'Fix the JSON to see the output.'}</pre></details></div>`:''}
   </div></section></div>`};
 /* ---- actions ---- */
 const curPg=()=>allPages().find(p=>p.key===st.key),curE=()=>entry(curPg());
 const stash=()=>{const t=$('#code',root);if(t&&st.sel)st.edit={id:st.sel,text:t.value}};
 const guard=async()=>{if(st.edit&&st.edit.id&&curE().blocks.some(b=>b.id===st.edit.id&&b.json!==st.edit.text)){if(!await confirmBox('You have unsaved changes in the code editor. Discard them?',{title:'Unsaved changes',ok:'Discard',danger:true}))return false}st.edit=null;return true};
 const commit=(b,text,source)=>{b.json=text;if(source){b.source=source;b.mode=source==='generated'?'auto':'manual'}S.touch(curE());persist();SeoAPI.saveDraft();st.edit=null};
 const addBlock=(pg,e,json,source,mode)=>{const b={id:uid(),json:JSON.stringify(json,null,2),enabled:true,source,mode};e.blocks.push(b);st.sel=b.id;return b};
 root.addEventListener('input',x=>{const t=x.target;
  if(t.id==='scQ'){st.q=t.value;render();const i=$('#scQ',root);i&&(i.focus(),i.setSelectionRange(t.value.length,t.value.length));return}
  if(t.id==='code'){st.edit={id:st.sel,text:t.value};clearTimeout(st.vt);st.vt=setTimeout(()=>{const v=$('#vOut',root);if(v){v.innerHTML=issues(L.validate(t.value,{pg:curPg()}),'Valid JSON-LD. This checks structure only. It does not guarantee Google rich result eligibility.')}icons()},250);return}});
 root.addEventListener('change',async x=>{const t=x.target;const pg=curPg&&st.view!=='overview'?curPg():null;
  if(t.id==='pgOn'){const e=curE();e.enabled=t.checked;S.touch(e);persist();Toast.show(t.checked?'Schema turned on for this page.':'Schema turned off for this page. It will not be sent to the website.');render()}
  else if(t.dataset.bon){const e=curE(),b=e.blocks.find(y=>y.id===t.dataset.bon);b.enabled=t.checked;S.touch(e);persist();Toast.show(t.checked?'Block enabled.':'Block disabled. It will not be sent to the website.');render()}
  else if(t.id==='dmod'){const e=curE();e.dateModified=t.value;S.touch(e);const b=e.blocks.find(y=>y.mode==='auto'&&L.typesOf(JSON.parse(y.json||'{}'))[0]==='BlogPosting');if(b){const o=L.gen.blog(null,st.key,e);if(o)b.json=JSON.stringify(o,null,2)}persist();Toast.show(t.value?'Last updated date saved.':'Last updated date cleared.');render()}});
 root.addEventListener('click',async x=>{const b=x.target.closest('button,[data-sel]');if(!b)return;const d=b.dataset;
  if(d.v){if(!await guard())return;st.view=d.v;st.sel=null;render();return}
  if(d.f){st.f=d.f;render();return}
  if(d.open){st.view=allPages().find(p=>p.key===d.open).kind;st.key=d.open;st.sel=null;st.edit=null;render();return}
  if(d.pick){if(!await guard())return;st.key=d.pick;st.sel=null;render();return}
  if(d.edit||d.sel){if(x.target.closest('.sx-ba')&&!d.edit)return;const id=d.edit||d.sel;if(id!==st.sel){if(!await guard())return;st.sel=id;render()}return}
  if(d.del){const e=curE(),bl=e.blocks.find(y=>y.id===d.del);if(!await confirmBox('Delete the <b>'+esc(blockLabel(bl))+'</b> block from this page? You can bring the original back with “Reset to existing”.',{title:'Delete schema?',ok:'Delete',danger:true}))return;
   e.blocks=e.blocks.filter(y=>y.id!==d.del);st.sel=null;st.edit=null;S.touch(e);persist();Toast.show('Schema block deleted.');render();return}
  const a=d.a;if(!a)return;const pg=st.view!=='overview'?curPg():null;
  if(a==='validate'){const P=allPages().map(p=>({p,r:L.checkPage(p,entry(p))})),n=P.reduce((s,y)=>s+y.r.errors,0);Toast.show(n?n+' error'+(n>1?'s':'')+' found on '+P.filter(y=>y.r.errors).length+' page(s). Filter “Has errors” to see them.':'No validation errors on any page.',n?'error':'ok');st.f=n?'err':st.f;render();return}
  if(a==='complete'){await busy(b,async()=>{let adds=0,pagesTouched=0;allPages().forEach(p=>{const n=completeOne(p);if(n)pagesTouched++,adds+=n});persist();Toast.show(adds?'Added '+adds+' missing item'+(adds>1?'s':'')+' on '+pagesTouched+' page'+(pagesTouched>1?'s':'')+'. Existing values were not changed.':'Nothing is missing. Existing schema was left as it is.');render()});return}
  if(!pg)return;const e=curE();
  if(a==='complete1'){const n=completeOne(pg);persist();Toast.show(n?'Added '+n+' missing item'+(n>1?'s':'')+'. Existing values were not changed.':'Nothing is missing on this page.');render();return}
  if(a==='add'){if(!await guard())return;const k=$('#addK',root).value;
   if(k!=='Custom JSON'&&e.blocks.some(y=>{try{return L.typesOf(JSON.parse(y.json)).includes(k)&&y.enabled!==false}catch(x){return false}}))return Toast.show('This page already has an enabled '+k+' block. Edit it, or disable it first, to avoid duplicate schema.','error');
   const o=L.template(k==='Custom JSON'?'':k,pg,null,e);addBlock(pg,e,o,k==='Custom JSON'?'custom':(L.autoFor(pg,k)?'generated':'custom'),L.autoFor(pg,k)?'auto':'manual');S.touch(e);persist();Toast.show(k+' block added. Review it, then Save changes.');render();return}
  if(a==='format'){const t=$('#code',root);try{t.value=JSON.stringify(JSON.parse(t.value),null,2);stash();Toast.show('Formatted.')}catch(x){Toast.show('Cannot format: '+x.message,'error')}return}
  if(a==='validate1'){stash();const r=L.validate($('#code',root).value,{pg});$('#vOut',root).innerHTML=issues(r,'Valid JSON-LD. This checks structure only. It does not guarantee Google rich result eligibility.');icons();Toast.show(r.errors.length?'Validation found '+r.errors.length+' error'+(r.errors.length>1?'s':'')+'.':'Validation passed.',r.errors.length?'error':'ok');return}
  if(a==='copy'){copy($('#code',root).value);return}
  if(a==='save'){const bl=e.blocks.find(y=>y.id===st.sel),t=$('#code',root).value,r=L.validate(t,{pg});if(r.errors.length){$('#vOut',root).innerHTML=issues(r);icons();return Toast.show('Fix the errors before saving.','error')}
   await busy(b,async()=>{const same=t===bl.json;commit(bl,JSON.stringify(r.obj,null,2),same?null:'custom');Toast.show(same?'No changes to save.':'Schema saved as a draft.');render()});return}
  if(a==='regen'){const bl=e.blocks.find(y=>y.id===st.sel);let o;try{o=JSON.parse($('#code',root).value)}catch(x){return Toast.show('Fix the JSON first.','error')}
   const t=L.typesOf(o)[0],g=L.gen[L.autoFor(pg,t)];const n=g(null,pg.key,e);if(!n)return Toast.show('The page was not found in the content.','error');
   if(!await confirmBox('Rebuild this block from the current page content? Extra properties you added (for example keywords) are kept.',{title:'Update from content',ok:'Update'}))return;
   const merged={...o,...n};const keep=Object.keys(o).filter(k=>!(k in n));keep.forEach(k=>merged[k]=o[k]);commit(bl,JSON.stringify(merged,null,2),'generated');Toast.show('Schema now matches the page content.');render();return}
  if(a==='reset'){const ex=(window.SEO_EXISTING||{})[pg.key]||[];if(!await confirmBox('Replace everything on this page with the schema that is on the website now? Your edits and added blocks for this page will be removed.',{title:'Reset to existing schema',ok:'Reset',danger:true}))return;
   e.blocks=ex.map(o=>({id:uid(),json:JSON.stringify(o,null,2),enabled:true,source:'existing',mode:'manual'}));e.enabled=true;st.sel=null;st.edit=null;S.touch(e);persist();Toast.show('Reset to the schema that is on the website.');render();return}});
 /* add-only upgrade: new blocks where a recommended type is missing, new properties inside existing blocks, existing values untouched */
 const completeOne=pg=>{const e=entry(pg);let n=0;const have=t=>e.blocks.some(b=>{try{return L.typesOf(JSON.parse(b.json)).includes(t)}catch(x){return false}});
  if(pg.kind==='home'){L.gen.home(null).forEach(g=>{if(!have(g.label)){e.blocks.push({id:uid(),json:JSON.stringify(g.json,null,2),enabled:true,source:'generated',mode:'manual'});n++}})}
  else if(pg.kind==='svc'){const g=L.gen.svc(null,pg.key,e);if(g){const bl=e.blocks.find(b=>{try{return L.typesOf(JSON.parse(b.json)).includes('Service')}catch(x){return false}});
    if(!bl){e.blocks.push({id:uid(),json:JSON.stringify(g,null,2),enabled:true,source:'generated',mode:'auto'});n++}else{try{const o=JSON.parse(bl.json),k=L.addMissing(o,g);if(k){bl.json=JSON.stringify(o,null,2);n+=k}}catch(x){}}}}
  else{const g=L.gen.blog(null,pg.key,e);if(g){const bl=e.blocks.find(b=>{try{return L.typesOf(JSON.parse(b.json)).includes('BlogPosting')}catch(x){return false}});
    if(!bl){e.blocks.push({id:uid(),json:JSON.stringify(g,null,2),enabled:true,source:'generated',mode:'auto'});n++}else{try{const o=JSON.parse(bl.json);if(typeof o.mainEntityOfPage==='string')delete g.mainEntityOfPage;const k=L.addMissing(o,g);if(k){bl.json=JSON.stringify(o,null,2);n+=k}}catch(x){}}}}
  if(n)S.touch(e);return n};
 render()}

/* ===================== ROBOTS.TXT ===================== */
function robotsTab(host){
 const R=S.d.robots;let text=R.content,live=null;
 const val=()=>L.robots.validate(text,{authorised:R.authorised});
 const saved=()=>text===R.content,pubSame=()=>R.content===S.p.robots.content;
 const stCard=()=>{const has=!!R.content,b=L.base();const s=!has?['Not created','gray']:SeoAPI.live()?(pubSame()?['Published','green']:['Saved, not published','gold']):(pubSame()?['Published in this browser only','gold']:['Draft saved','gold']);
  return`<div class="sx-side-card"><div class="sx-kv"><b>File status</b><span>${pill(s[0],s[1])}</span></div><div class="sx-kv"><b>Last updated</b><span>${esc(fmt(R.updatedAt))}</span></div><div class="sx-kv"><b>Source</b><span>${{none:'—',generated:'Generated',edited:'Edited here',uploaded:'Uploaded file'}[R.source]||'—'}</span></div><div class="sx-kv"><b>Size</b><span>${has?bytes(new Blob([R.content]).size):'—'}</span></div>
  <div class="sx-kv"><b>Live address</b><span class="sx-url">${esc(b.url)}/robots.txt</span></div><div class="sx-kv"><b>Live availability</b><span>${live==null?'Not checked':live.ok?pill('Answers (HTTP '+live.status+')','green'):pill(live.local?'Needs backend':'Not reachable','gray')}</span></div>
  <button class="btn btn-ghost btn-sm w-full" data-a="probe">${ic('radar')}Check live URL</button></div>`};
 const authBox=r=>R.authorised||r.errors.concat(r.warnings).some(m=>/blocks/.test(m))?`<label class="sx-auth"><input type="checkbox" id="rtAuth" ${R.authorised?'checked':''}><span><b>I authorise these blocking rules.</b> Tick only if you really want to block the pages or files listed above.</span></label>`:'';
 const draw=()=>{const r=val();host.innerHTML=`${modeNote()}${siteNote()}<div class="sx-two"><section class="hb-card sx-card"><header class="hb-head se-head"><div class="hb-ico">${ic('bot','w-6 h-6')}</div><div class="hb-ttl"><span class="hb-eye">Crawler rules</span><h2>robots.txt</h2><p>Tells search engines which parts of the website they may crawl.</p></div></header>
  <div class="sx-pad"><textarea class="se-code sx-tall" id="rt" spellcheck="false" wrap="off" aria-label="robots.txt content" placeholder="No robots.txt yet. Use Generate recommended, or upload a file.">${esc(text)}</textarea>
  <div id="rtV" class="sx-v">${text.trim()?issues(r,'robots.txt is valid.'):''}</div>
  <div id="rtA">${authBox(r)}</div>
  <div class="sx-edf"><button class="btn btn-ghost btn-sm" data-a="gen">${ic('wand-sparkles')}Generate recommended</button><label class="btn btn-ghost btn-sm cursor-pointer">${ic('upload')}${R.content?'Replace with file':'Upload file'}<input type="file" id="rtUp" accept=".txt,text/plain" hidden></label><button class="btn btn-ghost btn-sm" data-a="dl" ${R.content?'':'disabled'}>${ic('download')}Download</button><button class="btn btn-ghost btn-sm" data-a="val">${ic('shield-check')}Validate</button><button class="btn btn-ghost btn-sm" data-a="prev">${ic('eye')}Preview</button><span class="sx-sp"></span><button class="btn btn-primary btn-sm" data-a="save" ${saved()?'disabled':''}>${ic('save')}Save changes</button></div></div></section>
  <aside class="sx-aside">${stCard()}<div class="sx-side-card sx-tips"><h4>${ic('lightbulb')}Good to know</h4><p>The default file allows everything and points to the sitemap. Add <code>Disallow</code> rules only for pages that must stay out of search.</p><p>CSS, JavaScript, images, service pages and blog pages are protected: rules that block them need your authorisation.</p><p>Saving here does not create the file on the server. The backend writes it to <code>/robots.txt</code> when you publish.</p></div></aside></div>`;icons()};
 host.addEventListener('input',e=>{if(e.target.id!=='rt')return;text=e.target.value;clearTimeout(host._t);host._t=setTimeout(()=>{const r=val();$('#rtV',host).innerHTML=text.trim()?issues(r,'robots.txt is valid.'):'';$('#rtA',host).innerHTML=authBox(r);const sv=$('[data-a=save]',host);sv&&(sv.disabled=saved());icons()},250)});
 host.addEventListener('change',async e=>{const t=e.target;
  if(t.id==='rtAuth'){R.authorised=t.checked;persist();draw();return}
  if(t.id==='rtUp'){const f=t.files[0];t.value='';if(!f)return;
   try{const n=await readFile(f,512000,/\.txt$/i);if(R.content&&!await confirmBox('Replace the current robots.txt with <b>'+esc(f.name)+'</b>?',{title:'Replace file',ok:'Replace'}))return;text=n;const r=val();R.content=text;R.source='uploaded';R.fileName='robots.txt';S.touch(R);persist();SeoAPI.saveDraft();Toast.show(r.errors.length?'Uploaded, but the file has '+r.errors.length+' error(s). Review them before publishing.':'robots.txt uploaded and saved as a draft.',r.errors.length?'error':'ok');draw()}catch(x){Toast.show(x.message,'error')}}});
 host.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||!b.dataset.a)return;const a=b.dataset.a;
  if(a==='gen'){if(text.trim()&&!await confirmBox('Replace the text in the editor with the recommended file?',{title:'Generate recommended',ok:'Replace'}))return;text=L.robots.recommended();draw();Toast.show('Recommended file generated. Review it, then Save changes.')}
  else if(a==='dl'){download('robots.txt',R.content);Toast.show('robots.txt downloaded.')}
  else if(a==='val'){const r=val();$('#rtV',host).innerHTML=issues(r,'robots.txt is valid.');$('#rtA',host).innerHTML=authBox(r);icons();Toast.show(r.errors.length?r.errors.length+' error(s) found.':'robots.txt is valid.',r.errors.length?'error':'ok')}
  else if(a==='prev'){const r=val();Modal.open({title:'robots.txt preview',size:'lg',body:`<pre class="sx-pre">${esc(text||'(empty)')}</pre><h4 class="mt-3 mb-2">How crawlers read it</h4>${r.groups.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Applies to</th><th>Allow</th><th>Disallow</th></tr></thead><tbody>${r.groups.map(g=>`<tr><td>${esc(g.agents.join(', '))}</td><td>${g.allow.map(x=>'<code>'+esc(x.v||'(none)')+'</code>').join(' ')||'—'}</td><td>${g.disallow.map(x=>'<code>'+esc(x.v||'(none)')+'</code>').join(' ')||'—'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="hint">No rules found.</p>'}${r.sitemaps.length?`<p class="hint mt-2">Sitemap: ${r.sitemaps.map(esc).join(', ')}</p>`:''}`})}
  else if(a==='probe'){await busy(b,async()=>{live=await SeoAPI.probe(L.base().url+'/robots.txt');draw();Toast.show(live.local?'Live checks need the backend. Nothing was contacted.':live.ok?'The live URL answers.':'The live URL did not answer.',live.ok?'ok':'error')})}
  else if(a==='save'){const r=val();if(r.errors.length){$('#rtV',host).innerHTML=issues(r);icons();return Toast.show('Fix the errors before saving.','error')}
   await busy(b,async()=>{R.content=text;if(R.source==='none'||R.source==='generated')R.source=text===L.robots.recommended()?'generated':'edited';else R.source='edited';S.touch(R);persist();await SeoAPI.saveDraft();Toast.show('robots.txt saved as a draft.');draw()})}});
 draw()}

/* ===================== XML SITEMAP ===================== */
function sitemapTab(host){
 const SM=S.d.sitemap;let text=SM.content,gen=null;
 const val=()=>L.sitemap.validate(text);
 const exp=()=>L.sitemap.expected(C.p,S,SM.opts.lastmod);
 const draw=()=>{const r=text.trim()?val():null,ex=exp(),df=r&&!r.errors.length?L.sitemap.diff(text,ex):null,has=!!SM.content,pubSame=SM.content===S.p.sitemap.content;
  const s=!has?['Not generated','gray']:SeoAPI.live()?(pubSame?['Published','green']:['Saved, not published','gold']):(pubSame?['Published in this browser only','gold']:['Draft saved','gold']);
  host.innerHTML=`${modeNote()}${siteNote()}<div class="se-stats">${stat('link','URLs in sitemap',r?r.urls.length:0)}${stat('file-check','Published pages expected',ex.include.length,'ok')}${stat('file-x','Left out',ex.exclude.length,ex.exclude.length?'warn':'ok')}${stat('git-compare','Out of step with content',df?df.missing.length+df.extra.length:'—',df&&(df.missing.length||df.extra.length)?'warn':'ok')}</div>
  <div class="sx-two"><section class="hb-card sx-card"><header class="hb-head se-head"><div class="hb-ico">${ic('network','w-6 h-6')}</div><div class="hb-ttl"><span class="hb-eye">For search engines</span><h2>sitemap.xml</h2><p>Lists every published page so search engines can find it.</p></div></header>
  <div class="sx-pad"><div class="sx-opt"><label class="sx-sw"><span class="switch"><input type="checkbox" id="smLm" ${SM.opts.lastmod?'checked':''}><span></span></span><small>Add <code>lastmod</code> only where the CMS recorded a real publish or update date</small></label></div>
  <textarea class="se-code sx-tall" id="sm" spellcheck="false" wrap="off" aria-label="sitemap.xml content" placeholder="No sitemap yet. Use Generate sitemap, or upload a file.">${esc(text)}</textarea><div id="smV" class="sx-v">${r?issues(r,'The sitemap is well-formed and follows the sitemap protocol.'):''}</div>
  ${df&&(df.missing.length||df.extra.length)?`<div class="sx-msg warn">${ic('git-compare')}<div><b>The saved sitemap does not match the published content.</b>${df.missing.length?'<br>Missing: '+df.missing.slice(0,4).map(u=>esc(u.label)).join(', ')+(df.missing.length>4?' +'+(df.missing.length-4)+' more':''):''}${df.extra.length?'<br>Not expected (draft, hidden or removed): '+df.extra.slice(0,3).map(esc).join(', ')+(df.extra.length>3?' +'+(df.extra.length-3)+' more':''):''}<br>Use <b>Generate sitemap</b> to bring it back in step.</div></div>`:''}
  <div class="sx-edf"><button class="btn btn-primary btn-sm" data-a="gen">${ic('wand-sparkles')}Generate sitemap</button><label class="btn btn-ghost btn-sm cursor-pointer">${ic('upload')}${SM.content?'Replace with file':'Upload file'}<input type="file" id="smUp" accept=".xml,text/xml,application/xml" hidden></label><button class="btn btn-ghost btn-sm" data-a="dl" ${SM.content?'':'disabled'}>${ic('download')}Download</button><button class="btn btn-ghost btn-sm" data-a="val">${ic('shield-check')}Validate</button><button class="btn btn-ghost btn-sm" data-a="prev">${ic('eye')}Preview</button><span class="sx-sp"></span><button class="btn btn-ghost btn-sm" data-a="save" ${text===SM.content?'disabled':''}>${ic('save')}Save changes</button></div></div></section>
  <aside class="sx-aside"><div class="sx-side-card"><div class="sx-kv"><b>File status</b><span>${pill(s[0],s[1])}</span></div><div class="sx-kv"><b>Last updated</b><span>${esc(fmt(SM.updatedAt))}</span></div><div class="sx-kv"><b>Source</b><span>${{none:'—',generated:'Generated',edited:'Edited here',uploaded:'Uploaded file'}[SM.source]||'—'}</span></div><div class="sx-kv"><b>Size</b><span>${has?bytes(new Blob([SM.content]).size):'—'}</span></div><div class="sx-kv"><b>Live address</b><span class="sx-url">${esc(L.base().url)}/sitemap.xml</span></div></div>
  <div class="sx-side-card"><h4>${ic('list-checks')}Who is in the sitemap</h4><ul class="sx-list">${ex.include.slice(0,0).map(()=>'').join('')}<li><b>${ex.include.filter(u=>u.type==='Page').length}</b> website pages</li><li><b>${ex.include.filter(u=>u.type==='Service').length}</b> published services</li><li><b>${ex.include.filter(u=>u.type==='Blog').length}</b> published blog posts</li></ul>
  ${ex.exclude.length?`<h4 class="mt-3">${ic('eye-off')}Left out</h4><ul class="sx-list">${ex.exclude.map(x=>`<li><b>${esc(x.label)}</b><small>${esc(x.reason)}</small></li>`).join('')}</ul>`:'<p class="hint mt-2">Nothing is left out. Drafts, hidden pages and “noindex” pages would be listed here.</p>'}<p class="hint mt-3">The admin panel and login page are never included.</p></div></aside></div>`;icons()};
 host.addEventListener('input',e=>{if(e.target.id!=='sm')return;text=e.target.value;clearTimeout(host._t);host._t=setTimeout(()=>{$('#smV',host).innerHTML=text.trim()?issues(val(),'The sitemap is well-formed and follows the sitemap protocol.'):'';const sv=$('[data-a=save]',host);sv&&(sv.disabled=text===SM.content);icons()},300)});
 host.addEventListener('change',async e=>{const t=e.target;
  if(t.id==='smLm'){SM.opts.lastmod=t.checked;persist();draw();return}
  if(t.id==='smUp'){const f=t.files[0];t.value='';if(!f)return;
   try{const n=await readFile(f,52428800,/\.xml$/i);if(SM.content&&!await confirmBox('Replace the current sitemap with <b>'+esc(f.name)+'</b>?',{title:'Replace file',ok:'Replace'}))return;const prev=text;text=n;const r=val();
    if(r.errors.length){text=prev;draw();return Toast.show('The file was not used: '+r.errors[0],'error')}
    SM.content=text;SM.source='uploaded';S.touch(SM);persist();SeoAPI.saveDraft();Toast.show('Sitemap uploaded and saved as a draft.');draw()}catch(x){Toast.show(x.message,'error')}}});
 host.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||!b.dataset.a)return;const a=b.dataset.a;
  if(a==='gen'){const ex=exp();if(!ex.include.length)return Toast.show('There are no published pages to list.','error');if(text.trim()&&text!==SM.content&&!await confirmBox('Replace the text in the editor with a freshly generated sitemap?',{title:'Generate sitemap',ok:'Replace'}))return;
   text=L.sitemap.xml(ex.include);SM.content=text;SM.source='generated';S.touch(SM);persist();SeoAPI.saveDraft();Toast.show('Sitemap generated with '+ex.include.length+' URLs and saved as a draft.');draw()}
  else if(a==='dl'){download('sitemap.xml',SM.content,'application/xml');Toast.show('sitemap.xml downloaded.')}
  else if(a==='val'){const r=val();$('#smV',host).innerHTML=issues(r,'The sitemap is well-formed and follows the sitemap protocol.');icons();Toast.show(r.errors.length?r.errors.length+' error(s) found.':'Sitemap is valid.',r.errors.length?'error':'ok')}
  else if(a==='prev'){const r=text.trim()?val():{urls:[],errors:['empty'],warnings:[]};Modal.open({title:'Sitemap preview',size:'lg',body:`<div class="sx-tabs2"><b>${r.urls.length} URL${r.urls.length===1?'':'s'}</b></div>${r.urls.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>URL</th><th>Last modified</th></tr></thead><tbody>${r.urls.map(u=>`<tr><td class="sx-url">${esc(u.loc)}</td><td>${esc(u.lastmod||'—')}</td></tr>`).join('')}</tbody></table></div>`:''}<h4 class="mt-3 mb-2">XML</h4><pre class="sx-pre">${esc(text||'(empty)')}</pre>`})}
  else if(a==='save'){const r=val();if(r.errors.length){$('#smV',host).innerHTML=issues(r);icons();return Toast.show('Fix the errors before saving.','error')}
   await busy(b,async()=>{SM.content=text;SM.source='edited';S.touch(SM);persist();await SeoAPI.saveDraft();Toast.show('Sitemap saved as a draft.');draw()})}});
 draw()}

/* ===================== ANALYTICS & TRACKING ===================== */
const CARDS={
 ga:{icon:'activity',desc:'Counts visits with Google Analytics 4. Paste the Measurement ID, or the whole code snippet: only the ID is used.',label:'Measurement ID',ph:'G-XXXXXXXXXX',hint:'Format G-XXXXXXXXXX',pasteLabel:'Or paste the tracking code (optional)'},
 gsc:{icon:'search-check',desc:'Proves site ownership to Google with the HTML meta tag method. Paste the code or the whole meta tag.',label:'Verification code',ph:'Value from the meta tag content',hint:'The long code inside content="…"',pasteLabel:''},
 bing:{icon:'globe',desc:'Proves site ownership to Bing with the msvalidate.01 meta tag. Paste the code or the whole meta tag.',label:'Verification code',ph:'Value from the meta tag content',hint:'Letters and numbers from Bing Webmaster Tools',pasteLabel:''},
 gtm:{icon:'layers-3',desc:'Loads Google Tag Manager. Enter the Container ID: the standard head script and body noscript are built for you.',label:'Container ID',ph:'GTM-XXXXXXX',hint:'Format GTM-XXXXXXX',pasteLabel:'Or paste the GTM snippet (optional)'}};
function analyticsTab(host){
 const T=S.d.tracking,ed={};
 const card=k=>{const t=T[k],c=CARDS[k],f=L.track.field[k],v=t[f],st=L.track.status(k,t),editing=!!ed[k],cfgd=L.track.valid(k,v),sn=cfgd?L.track.snippets(k,v):null,ver=(k==='gsc'||k==='bing');
  return`<section class="hb-card sx-an" data-k="${k}"><header class="sx-anh"><div class="hb-ico">${ic(c.icon,'w-5 h-5')}</div><div class="sx-ant"><h3>${L.track.LABEL[k]}</h3><p>${c.desc}</p></div><div class="sx-ans">${pill(st.label,st.tone)}</div></header>
  <div class="sx-anb"><div class="fld"><label class="lbl" for="f-${k}">${c.label}</label><input class="input" id="f-${k}" data-k="${k}" data-f="${f}" value="${esc(editing?ed[k][f]:v)}" placeholder="${esc(c.ph)}" autocomplete="off" spellcheck="false" ${editing?'':'disabled'}><p class="hint">${c.hint}</p></div>
  ${c.pasteLabel&&editing?`<div class="fld"><label class="lbl" for="p-${k}">${c.pasteLabel}</label><textarea class="input se-code sx-mini" id="p-${k}" data-k="${k}" data-paste="1" rows="3" spellcheck="false" placeholder="Paste here. Only the ID is read; any other code is ignored."></textarea></div>`:''}
  ${ver?`<label class="sx-auth"><input type="checkbox" data-k="${k}" data-conf="1" ${(editing?ed[k].confirmed:t.confirmed)?'checked':''} ${editing?'':'disabled'}><span><b>Verified in ${k==='gsc'?'Search Console':'Bing Webmaster Tools'}.</b> Tick only after the tool itself shows the site as verified.</span></label>`:''}
  <div class="sx-err" id="e-${k}"></div>
  ${sn?`<details class="se-adv"><summary>${ic('code')}Tag that will be placed on public pages<span>${sn.body?'head + body':'head'}</span></summary><pre class="sx-pre">${esc(sn.head)}${sn.body?'\n\n<!-- right after the opening <body> tag -->\n'+esc(sn.body):''}</pre></details>`:''}</div>
  <footer class="sx-anf"><label class="sx-sw" title="Turn this integration on or off"><span class="switch"><input type="checkbox" data-k="${k}" data-on="1" ${(editing?ed[k].enabled:t.enabled)?'checked':''} ${editing?'':'disabled'}><span></span></span><small>${(editing?ed[k].enabled:t.enabled)?'On':'Off'}</small></label><span class="sx-upd">Updated: ${esc(fmt(t.updatedAt))}</span><span class="sx-sp"></span>
  ${editing?`<button class="btn btn-ghost btn-sm" data-act="cancel" data-k="${k}">Cancel</button><button class="btn btn-primary btn-sm" data-act="save" data-k="${k}">${ic('save')}Save</button>`:`<button class="btn btn-ghost btn-sm" data-act="edit" data-k="${k}">${ic('pencil')}Edit</button>${t[f]?`<button class="btn btn-ghost btn-sm" data-act="clear" data-k="${k}" title="Remove this configuration">${ic('trash-2')}</button>`:''}`}</footer></section>`};
 const draw=()=>{const pl=L.track.plan(T);
  host.innerHTML=`${modeNote()}${notice('Codes come from the client later. Nothing is pre-filled, and a card shows <b>Enabled</b> only when a valid code is saved and the switch is on. Tags go on public website pages only, never on the admin panel or login page.')}
  <div class="sx-grid">${['ga','gsc','bing','gtm'].map(card).join('')}</div>
  <section class="hb-card sx-card sx-plan"><header class="hb-head se-head"><div class="hb-ico">${ic('route','w-6 h-6')}</div><div class="hb-ttl"><span class="hb-eye">Injection plan</span><h2>What the website will load</h2><p>One tag per ID. Disabled or invalid entries are left out.</p></div></header><div class="sx-pad">
  ${pl.warn.map(w=>`<div class="sx-msg warn">${ic('alert-triangle')}<div>${esc(w)}</div></div>`).join('')}
  <div class="sx-cols"><div><h4>${ic('arrow-up-from-line')}Inside &lt;head&gt;</h4>${pl.head.length?pl.head.map(h=>`<div class="sx-tag"><b>${esc(L.track.LABEL[h.kind])}</b><small>${esc(h.id)}</small></div>`).join(''):'<p class="hint">Nothing yet.</p>'}</div>
  <div><h4>${ic('arrow-down-to-line')}Right after &lt;body&gt;</h4>${pl.body.length?pl.body.map(h=>`<div class="sx-tag"><b>${esc(L.track.LABEL[h.kind])} (noscript)</b><small>${esc(h.id)}</small></div>`).join(''):'<p class="hint">Nothing yet.</p>'}</div></div>
  <div class="sx-edf"><button class="btn btn-ghost btn-sm" data-act="manifest">${ic('download')}Download publish manifest (JSON)</button></div></div></section>`;icons()};
 host.addEventListener('input',e=>{const t=e.target,k=t.dataset.k;if(!k||!ed[k])return;
  if(t.dataset.paste){const id=L.track.extract(k,t.value);ed[k][L.track.field[k]]=id;$('#f-'+k,host).value=id;return}
  if(t.dataset.f)ed[k][t.dataset.f]=t.value});
 host.addEventListener('change',e=>{const t=e.target,k=t.dataset.k;if(!k||!ed[k])return;if(t.dataset.on){ed[k].enabled=t.checked;t.closest('.sx-sw').querySelector('small').textContent=t.checked?'On':'Off'}if(t.dataset.conf)ed[k].confirmed=t.checked});
 host.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act,k=b.dataset.k;if(!a)return;
  if(a==='manifest'){download('disha-seo-manifest.json',JSON.stringify(L.manifest(S,C.d),null,2),'application/json');return Toast.show('Manifest downloaded. This is a draft view; it is not live.')}
  const t=T[k];
  if(a==='edit'){ed[k]={...t};draw();$('#f-'+k,host).focus()}
  else if(a==='cancel'){delete ed[k];draw()}
  else if(a==='clear'){if(!await confirmBox('Remove the saved '+L.track.LABEL[k]+' configuration? The code will stop being added to the website after the next publish.',{title:'Remove configuration',ok:'Remove',danger:true}))return;
   const f=L.track.field[k];t[f]='';t.enabled=false;t.confirmed=false;t.everEnabled=false;S.touch(t);persist();SeoAPI.saveDraft();Toast.show(L.track.LABEL[k]+' configuration removed.');draw()}
  else if(a==='save'){const n=ed[k],f=L.track.field[k],v=L.track.extract(k,n[f]),er=$('#e-'+k,host);
   if(n.enabled&&!v){er.innerHTML=`<div class="sx-msg bad">${ic('x-circle')}<div>Enter the code before turning this integration on.</div></div>`;icons();return Toast.show('Enter the code first.','error')}
   if(v&&!L.track.valid(k,v)){er.innerHTML=`<div class="sx-msg bad">${ic('x-circle')}<div>${esc(CARDS[k].label)} is not in the expected format. ${esc(CARDS[k].hint)}.</div></div>`;icons();return Toast.show('That code is not in the expected format.','error')}
   await busy(b,async()=>{t[f]=v;t.enabled=!!n.enabled&&!!v;if(k==='gsc'||k==='bing')t.confirmed=!!n.confirmed&&!!v;if(t.enabled)t.everEnabled=true;S.touch(t);persist();await SeoAPI.saveDraft();delete ed[k];Toast.show(L.track.LABEL[k]+' saved as a draft.');draw()})}});
 draw()}
})();
