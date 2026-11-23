/* DISHA CMS – real CMS modules mapped to the actual website content (see docs/MAPPING.md).
   Everything here edits the DRAFT copy in this browser (localStorage). Nothing reaches the live website until the backend phase. */
(function(){
const C=Content,qs=()=>new URLSearchParams(location.search),M=window.Modules;
const KEEP=['id','ico'];const blankDeep=o=>typeof o==='string'?'':Array.isArray(o)?o.map(blankDeep):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).map(([k,v])=>[k,KEEP.includes(k)&&typeof v==='string'?v:blankDeep(v)])):o;
const today=()=>new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).replace(/,/g,'');
const backBtn=(href,t)=>`<a class="btn btn-ghost" href="${href}">${ic('arrow-left')}${t}</a>`;
const secTitle=s=>{const d=s.data||s;for(const k of['h2','h1','title','h1a','t','eyebrow','name'])if(typeof d[k]==='string'&&d[k])return C.tok(d[k]);return''};
/* accordion list of sections, each editable with the schema engine */
function sectionList(host,arr,sch,page,o={}){let bodies={};
 const draw=()=>{host.innerHTML=arr.map((s,i)=>{const d=sch.sections[s.id];return`<div class="sec-wrap" id="${s.id}"><div class="sec-row ${s.visible===false?'off':''}">${o.reorder?`<div class="flex flex-col"><button class="icon-btn !h-5" data-up="${i}" ${i?'':'disabled'} aria-label="Move up">${ic('chevron-up')}</button><button class="icon-btn !h-5" data-dn="${i}" ${i<arr.length-1?'':'disabled'} aria-label="Move down">${ic('chevron-down')}</button></div>`:`<span class="rn">${i+1}</span>`}<div class="flex-1 min-w-0"><b>${esc(d.label)}</b><small class="block text-[#60736B] truncate">${esc(secTitle(s))}</small></div>${o.noToggle?'':`<label class="switch" title="Show this section on the website"><input type="checkbox" data-tg="${i}" ${s.visible!==false?'checked':''} aria-label="Show ${esc(d.label)}"><span></span></label>`}<button class="btn btn-ghost btn-sm" data-ed="${i}">${ic('pencil')}Edit</button></div><div class="sec-body" data-b="${i}" hidden></div></div>`}).join('');icons();
  Object.keys(bodies).forEach(i=>{if(bodies[i]){const b=$(`[data-b="${i}"]`,host);if(b){b.hidden=false;bodies[i]=Ed.mount(b,arr[i].data,sch.sections[arr[i].id].f,{onChange:page.changed})}}})};
 const openIdx=i=>{const b=$(`[data-b="${i}"]`,host);if(!b)return;if(b.hidden){b.hidden=false;if(!bodies[i]||!b.firstChild)bodies[i]=Ed.mount(b,arr[i].data,sch.sections[arr[i].id].f,{onChange:page.changed})}else{b.hidden=true;bodies[i]=0}};
 host.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.ed!==undefined)openIdx(+d.ed);else if(d.up!==undefined||d.dn!==undefined){const i=+(d.up??d.dn),j=d.up!==undefined?i-1:i+1;[arr[i],arr[j]]=[arr[j],arr[i]];bodies={};page.changed();draw()}});
 host.addEventListener('change',e=>{const t=e.target.dataset.tg;if(t!==undefined){arr[t].visible=e.target.checked;e.target.closest('.sec-row').classList.toggle('off',!e.target.checked);page.changed()}});
 draw();if(location.hash){const i=arr.findIndex(s=>'#'+s.id===location.hash);if(i>=0)openIdx(i)}}
const validateSecs=(arr,sch)=>arr.flatMap(s=>Ed.validate(sch.sections[s.id].f,s.data,sch.sections[s.id].label));
/* generic page: header + sections */
function sectionPage(root,o){root.innerHTML=pageHead(o.title,o.sub,(o.back||'')+Page.buttons())+(o.notice?notice(o.notice):'')+`<div class="card"><div class="card-h"><h3>${esc(o.listTitle||'Sections')}</h3><span class="text-xs text-[#60736B]">${o.reorder?'Use arrows to reorder. ':''}Switch off to hide a section.</span></div><div class="card-b grid gap-2" id="sl"></div></div>`;
 const page=Page.wire(root,{unit:o.unit,validate:()=>validateSecs(o.arr,o.sch),preview:()=>Preview.show(o.title,Preview.secs(o.arr,o.sch))});
 sectionList($('#sl',root),o.arr,o.sch,page,{reorder:o.reorder,noToggle:o.noToggle});icons()}
function withPublish(root,unit){
 const pv={testimonials:()=>{const a=C.d.testimonials.filter(r=>r.status==='Approved');Preview.show('Testimonials · approved reviews',a.length?a.map(r=>`<div class="card mb-3"><div class="card-b"><b>${esc(r.name)}</b> <span class="text-[#B8861B]">${'\u2605'.repeat(+r.rating||0)}</span><p class="mt-1">${esc(r.text)}</p></div></div>`).join(''):'<p class="hint">No approved reviews yet. Only Approved reviews appear on the website.</p>')},
  seo:()=>Preview.show('SEO · search result previews',C.d.seo.map(r=>`<div class="mb-4"><b>${esc(r.label)}</b>${serp(r.title,Content.tok(r.canonical||'{{siteUrl}}/'+r.file),r.desc)}</div>`).join(''))};
 Page.multi({ok:'All published',units:()=>[unit],preview:pv[unit]})}
/* ===== Homepage Builder (horizontal step-by-step wizard: one section at a time) ===== */
const HB_ICON={hero:'image',stats:'bar-chart-3',about:'building-2',surgeon:'stethoscope',spec:'scissors',laser:'zap',atclinic:'door-open',conds:'list-checks',pguide:'circle-help',journey:'route',herbal:'leaf',reviews:'star',visit:'map-pin',faq:'message-circle-question',cta:'megaphone'};
M['homepage-builder']=root=>{
 const arr=C.d.home.sections,sch=SCHEMA.home,N=arr.length;
 root.innerHTML=pageHead('Homepage Builder','Fill the homepage section by section, from the Hero banner to the Final CTA.')
  +`<div class="hb"><section class="hb-top" aria-label="Homepage sections"><div class="hb-top-h"><h3 id="hbSum"></h3><span class="hb-live" id="hbCnt"></span></div>
   <div class="hb-strip"><button type="button" class="hb-arw l" data-sc="-1" aria-label="Scroll sections left">${ic('chevron-left')}</button><div class="hb-steps" id="hbL" role="list"></div><button type="button" class="hb-arw r" data-sc="1" aria-label="Scroll sections right">${ic('chevron-right')}</button></div>
   <div class="hb-prog" role="progressbar" aria-valuemin="1" aria-valuemax="${N}"><span id="hbP"></span></div></section>
   <section class="hb-card" id="hbC"></section></div>`;
 const page=Page.wire(root,{unit:'home',validate:()=>validateSecs(arr,sch),preview:()=>Preview.show('Homepage Builder',Preview.secs(arr,sch))});
 
 const seen=new Set();let cur=0;
 const h0=location.hash?arr.findIndex(s=>'#'+s.id===location.hash):-1;if(h0>=0)cur=h0;
 const L=()=>$('#hbL',root);
 const center=()=>{const l=L(),a=$('.hb-step.active',l);if(l&&a)l.scrollTo({left:a.offsetLeft-(l.clientWidth-a.offsetWidth)/2,behavior:'smooth'})};
 const rail=()=>{L().innerHTML=arr.map((s,i)=>{const d=sch.sections[s.id],off=s.visible===false,act=i===cur,done=seen.has(i)&&!act,pass=i<=cur||seen.has(i);
   return`<button type="button" role="listitem" class="hb-step ${act?'active':''} ${done?'done':''} ${off?'off':''} ${pass?'pass':''}" data-go="${i}" title="${esc(d.label)}" ${act?'aria-current="step"':''}><span class="hb-n">${act?ic(HB_ICON[s.id]||'layout-template','w-5 h-5'):done?ic('check','w-5 h-5'):i+1}</span><span class="hb-t"><b>${esc(d.label)}</b>${off?'<i class="hb-tag">Hidden</i>':''}</span></button>`}).join('');
  $('#hbSum',root).innerHTML=`Step <b>${cur+1}</b> of ${N} <span>· ${Math.round((cur+1)/N*100)}% through</span>`;
  $('#hbCnt',root).textContent=arr.filter(s=>s.visible!==false).length+' of '+N+' sections live';icons();requestAnimationFrame(center)};
 const panel=()=>{const s=arr[cur],d=sch.sections[s.id],last=cur===N-1;
  $('#hbP',root).style.width=((cur+1)/N*100)+'%';$('#hbP',root).parentElement.setAttribute('aria-valuenow',cur+1);
  $('#hbC',root).innerHTML=`<header class="hb-head"><div class="hb-ico">${ic(HB_ICON[s.id]||'layout-template','w-7 h-7')}</div><div class="hb-ttl"><span class="hb-eye">Step ${cur+1} of ${N}</span><h2>${esc(d.label)}</h2><p>${esc(secTitle(s))}</p></div>
    <div class="hb-act"><label class="hb-vis" title="Show this section on the website"><span>${s.visible!==false?'Visible':'Hidden'}</span><span class="switch"><input type="checkbox" id="hbTg" ${s.visible!==false?'checked':''} aria-label="Show ${esc(d.label)} on website"><span></span></span></label>
    <span class="hb-mv"><button type="button" class="icon-btn" data-mv="-1" ${cur?'':'disabled'} title="Move this section earlier on the page" aria-label="Move earlier">${ic('arrow-up')}</button><button type="button" class="icon-btn" data-mv="1" ${last?'disabled':''} title="Move this section later on the page" aria-label="Move later">${ic('arrow-down')}</button></span></div></header>
   <div class="hb-body" id="hbB"></div>
   <footer class="hb-foot"><button type="button" class="btn btn-ghost" data-nav="-1" ${cur?'':'disabled'}>${ic('arrow-left')}Back</button><span class="hb-pos">${cur+1} / ${N}</span><span class="hb-r"><button type="button" class="btn hb-save" data-pg="sd">${ic('save')}Save Changes</button>${last?'':`<button type="button" class="btn btn-primary" data-nav="1">Next<span class="hb-nx">${esc(sch.sections[arr[cur+1].id].label)}</span>${ic('arrow-right')}</button>`}</span></footer>`;
  Ed.mount($('#hbB',root),s.data,d.f,{onChange:page.changed});icons()};
 const go=(i,scroll)=>{seen.add(cur);cur=Math.max(0,Math.min(N-1,i));rail();panel();if(scroll){const m=$('.hb',root);m&&m.scrollIntoView({block:'start',behavior:'smooth'})}};
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.sc!==undefined){const l=L();l.scrollBy({left:+d.sc*l.clientWidth*.7,behavior:'smooth'})}
  else if(d.go!==undefined)go(+d.go,false);
  else if(d.nav!==undefined)go(cur+ +d.nav,true);
  else if(d.mv!==undefined){const j=cur+ +d.mv;if(j<0||j>=N)return;[arr[cur],arr[j]]=[arr[j],arr[cur]];cur=j;page.changed();rail();panel();Toast.show('Section moved. New position on the page: '+(j+1)+'.')}});
 root.addEventListener('change',e=>{if(e.target.id!=='hbTg')return;arr[cur].visible=e.target.checked;page.changed();rail();const v=$('.hb-vis > span',root);if(v)v.textContent=e.target.checked?'Visible':'Hidden'});
 rail();panel();icons()};
/* ===== Page Management (overview + step-by-step page editor, same look as Homepage Builder) ===== */
const PAGES=[['about','About Us','/about-us/','sections'],['contact','Contact Us','/contact-us/','sections'],['booking','Book Appointment','/book-appointment/','sections'],['privacy','Privacy Policy','/privacy-policy/','legal'],['terms','Terms & Conditions','/terms-and-conditions/','legal']];
const PM={about:{icon:'user-round',desc:'Doctor profile, mission and vision, education timeline and the clinic environment.'},contact:{icon:'phone-call',desc:'Quick contact cards, enquiry form, working hours and the map.'},booking:{icon:'calendar-check',desc:'Appointment form, success message, urgent advice and what to bring.'},privacy:{icon:'shield-check',desc:'How visitor and patient information is collected, used and protected.'},terms:{icon:'scroll-text',desc:'Terms for using the website and booking appointments.'}};
const PM_ICON={header:'heading',surgeon:'stethoscope',who:'building-2',edu:'graduation-cap',mv:'target',why:'badge-check',journey:'route',creds:'award',infra:'hospital',cta:'megaphone','contact.hero':'layout-panel-top',quick:'phone-call',info:'map-pin','contact.form':'mail','contact.hours':'clock',map:'map','booking.form':'calendar-check',success:'circle-check',urgent:'siren','booking.hours':'clock',bring:'clipboard-list'};
const pmIcon=(u,id)=>PM_ICON[u+'.'+id]||PM_ICON[id]||'layout-template';
const pmLast=u=>{const l=getList('versions').find(v=>v.unit===u&&v.action==='Published');return l?l.date:''};
const pmSteps=u=>{const d=C.d[u],def=PAGES.find(p=>p[0]===u);
 if(def[3]==='sections')return d.sections.map(s=>{const sc=SCHEMA[u].sections[s.id];return{id:s.id,label:sc.label,icon:pmIcon(u,s.id),sub:()=>secTitle(s),data:s.data,fields:sc.f}});
 const F=SCHEMA.legal.fields;return[{id:'header',label:'Page header',icon:'heading',sub:()=>d.h1||'',data:d,fields:F.slice(0,3)},{id:'policy',label:'Policy sections',icon:'list-ordered',sub:()=>(d.sections||[]).length+' sections',data:d,fields:F.slice(3)}]};
const pmValidate=(u,def)=>def[3]==='legal'?Ed.validate(SCHEMA.legal.fields,C.d[u],def[1]):validateSecs(C.d[u].sections,SCHEMA[u]);
const pmPreview=(u,def)=>def[3]==='legal'?Preview.show(def[1],Preview.fields(SCHEMA.legal.fields,C.d[u])):Preview.show(def[1],Preview.secs(C.d[u].sections,SCHEMA[u]));
M['page-management']=root=>{const pg=qs().get('page'),def=PAGES.find(p=>p[0]===pg);if(def)pmEditor(root,def);else pmOverview(root)};
/* ---- overview: all pages as cards ---- */
function pmOverview(root){let q='',f='all';
 const state=u=>C.status(u),secN=u=>C.d[u].sections.length;
  root.innerHTML=`${pageHead('Page Management','Edit the static pages of your website one section at a time. The design stays fixed, only the content changes.')}
  <div class="pm-list" id="pmG"></div>
  <h3 class="pm-h">Managed in their own modules</h3>
  <div class="pm-links">${[['homepage-builder.html','layout-template','Homepage','15 sections, built step by step','home'],['services.html','stethoscope','Services','Services page and '+C.d.services.length+' service pages','servicesPage'],['blogs.html','newspaper','Blogs','Blogs page and '+C.d.posts.length+' articles','blogsPage']].map(([h,i,t,s,u])=>`<a class="pm-link" href="${h}"><span class="pm-link-i">${ic(i)}</span><span class="pm-link-t"><b>${t}</b><small>${esc(s)}</small></span>${badge(state(u))}${ic('arrow-up-right','pm-link-a')}</a>`).join('')}</div>`;
 Page.multi({ok:'All pages published',units:()=>PAGES.map(p=>p[0]),preview:()=>{const u=PAGES.map(p=>p[0]).find(x=>C.dirty(x))||'about',def=PAGES.find(p=>p[0]===u);Preview.open(u,()=>pmPreview(u,def))},after:()=>pmOverview(root)});
 const cards=()=>{const l=PAGES.filter(([u,n,url])=>(f==='all'||state(u)===f)&&(!q||(n+url).toLowerCase().includes(q)));
  $('#pmG',root).innerHTML=l.length?`<div class="pm-lh" aria-hidden="true"><span>Page</span><span>Sections</span><span>Status</span><span></span></div>`+l.map(([u,n,url,k])=>{const secs=C.d[u].sections,lab=k==='sections'?secs.map(s=>SCHEMA[u].sections[s.id].label):secs.map(s=>s.h2||'Section'),lp=pmLast(u),st=state(u);
   return`<article class="pm-row ${st==='Draft'?'is-draft':''}"><span class="pm-ico">${ic(PM[u].icon,'w-6 h-6')}</span>
    <div class="pm-row-main"><h3>${esc(n)}</h3><p>${esc(PM[u].desc)}</p><small class="pm-secs">${esc(lab.slice(0,3).join(', '))}${lab.length>3?' and '+(lab.length-3)+' more':''}</small></div>
    <div class="pm-row-n"><b>${secs.length}</b><small>${k==='legal'?'policy sections':'sections'}</small></div>
    <div class="pm-row-s">${badge(st)}<small>${lp?'Published '+fmtDate(lp):'Not published from here yet'}</small></div>
    <div class="pm-row-a"><button type="button" class="btn btn-ghost btn-sm" data-pv="${u}" title="Preview ${esc(n)}">${ic('eye')}Preview</button><a class="btn btn-primary btn-sm" href="page-management.html?page=${u}">${ic('pencil')}Edit page</a></div></article>`}).join(''):`<div class="pm-none">${empty('search-x','No pages found','Try a different search or filter.')}</div>`;icons()};
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.pv){const u=b.dataset.pv,d=PAGES.find(p=>p[0]===u);Preview.open(u,()=>pmPreview(u,d))}});
 cards();icons()}
/* ---- editor: one page, step by step ---- */
function pmEditor(root,def){const u=def[0],legal=def[3]==='legal',steps=pmSteps(u),N=steps.length,lp=pmLast(u),unitWord=legal?'steps':'sections';
 root.innerHTML=`<div class="hb pm-edit">${pageHead(def[1],lp?'Published '+fmtDate(lp):'Not published from here yet',backBtn('page-management.html','All pages'))}
  <nav class="pm-tabs" aria-label="Pages">${PAGES.map(p=>`<a href="page-management.html?page=${p[0]}" class="${p[0]===u?'on':''}" ${p[0]===u?'aria-current="page"':''}>${ic(PM[p[0]].icon)}<span>${esc(p[1])}</span>${C.dirty(p[0])?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`).join('')}</nav>
  <section class="hb-top" aria-label="${esc(def[1])} ${unitWord}"><div class="hb-top-h"><h3 id="hbSum"></h3><span class="hb-live">Layout is fixed \u00b7 content only</span></div>
   <div class="hb-strip"><button type="button" class="hb-arw l" data-sc="-1" aria-label="Scroll left">${ic('chevron-left')}</button><div class="hb-steps" id="hbL" role="list"></div><button type="button" class="hb-arw r" data-sc="1" aria-label="Scroll right">${ic('chevron-right')}</button></div>
   <div class="hb-prog" role="progressbar" aria-valuemin="1" aria-valuemax="${N}"><span id="hbP"></span></div></section>
  <section class="hb-card" id="hbC"></section></div>`;
 const page=Page.wire(root,{unit:u,validate:()=>pmValidate(u,def),preview:()=>pmPreview(u,def)});
 const seen=new Set();let cur=0;const h0=location.hash?steps.findIndex(s=>'#'+s.id===location.hash):-1;if(h0>=0)cur=h0;
 const L=()=>$('#hbL',root);
 const center=()=>{const l=L(),a=$('.hb-step.active',l);if(l&&a)l.scrollTo({left:a.offsetLeft-(l.clientWidth-a.offsetWidth)/2,behavior:'smooth'})};
 const rail=()=>{L().innerHTML=steps.map((s,i)=>{const act=i===cur,done=seen.has(i)&&!act,pass=i<=cur||seen.has(i);
   return`<button type="button" role="listitem" class="hb-step ${act?'active':''} ${done?'done':''} ${pass?'pass':''}" data-go="${i}" title="${esc(s.label)}" ${act?'aria-current="step"':''}><span class="hb-n">${act?ic(s.icon,'w-5 h-5'):done?ic('check','w-5 h-5'):i+1}</span><span class="hb-t"><b>${esc(s.label)}</b></span></button>`}).join('');
  $('#hbSum',root).innerHTML=`Step <b>${cur+1}</b> of ${N} <span>\u00b7 ${Math.round((cur+1)/N*100)}% through</span>`;icons();requestAnimationFrame(center)};
 const panel=()=>{const s=steps[cur],last=cur===N-1;
  $('#hbP',root).style.width=((cur+1)/N*100)+'%';$('#hbP',root).parentElement.setAttribute('aria-valuenow',cur+1);
  $('#hbC',root).innerHTML=`<header class="hb-head"><div class="hb-ico">${ic(s.icon,'w-7 h-7')}</div><div class="hb-ttl"><span class="hb-eye">Step ${cur+1} of ${N}</span><h2>${esc(s.label)}</h2><p>${esc(s.sub())}</p></div><div class="hb-act"><button type="button" class="btn btn-ghost btn-sm" data-pg="pv">${ic('eye')}Preview page</button></div></header>
   <div class="hb-body" id="hbB"></div>
   <footer class="hb-foot"><button type="button" class="btn btn-ghost" data-nav="-1" ${cur?'':'disabled'}>${ic('arrow-left')}Back</button><span class="hb-pos">${cur+1} / ${N}</span><span class="hb-r"><button type="button" class="btn hb-save" data-pg="sd">${ic('save')}Save Changes</button>${last?`<button type="button" class="btn btn-primary" data-pg="pb">${ic('rocket')}Publish page</button>`:`<button type="button" class="btn btn-primary" data-nav="1">Next<span class="hb-nx">${esc(steps[cur+1].label)}</span>${ic('arrow-right')}</button>`}</span></footer>`;
  Ed.mount($('#hbB',root),s.data,s.fields,{onChange:page.changed});icons()};
 const go=(i,scroll)=>{seen.add(cur);cur=Math.max(0,Math.min(N-1,i));rail();panel();if(scroll){const m=$('.hb-top',root);m&&m.scrollIntoView({block:'start',behavior:'smooth'})}};
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.sc!==undefined){const l=L();l.scrollBy({left:+d.sc*l.clientWidth*.7,behavior:'smooth'})}
  else if(d.go!==undefined)go(+d.go,false);else if(d.nav!==undefined)go(cur+ +d.nav,true)});
 rail();panel();icons()}
/* ===== Services (overview cards + step-by-step editor, same look as Homepage Builder / Page Management) ===== */
const svcPageUrl=s=>'/services/'+s.slug+'/';
const SV_ICON={hero:'image',stats:'bar-chart-3',overview:'book-open',types:'layers',symptoms:'activity',compare:'git-compare',causes:'search',diagnosis:'stethoscope',treatment:'pill',nonsurgical:'heart-handshake',foods:'apple',surgery:'scissors',laser:'zap',prepare:'clipboard-check',journey:'route',recovery:'heart-pulse',prevention:'shield-check',ignored:'triangle-alert',myths:'circle-help',cost:'indian-rupee',why:'badge-check',reviews:'star',visit:'map-pin',faq:'message-circle-question',cta:'megaphone',medical:'file-warning',header:'heading',section:'layout-grid',help:'life-buoy',others:'list-plus'};
const svSorted=()=>C.d.services.slice().sort((a,b)=>(a.order||0)-(b.order||0));
const svGroup=s=>{const g=(C.d.settings.serviceGroups||[]).find(g=>g.items.some(i=>i.slug===s.slug));return g?g.title:''};
const svPreviewOf=sv=>()=>Preview.show(sv.name,Preview.fields(SCHEMA.svcListing,sv.listing)+Preview.secs(sv.sections,SCHEMA.service));
M.services=root=>{const q=qs(),slug=q.get('slug');
 if(q.get('page')==='listing')return svListing(root);
 if(slug)return svEditor(root,slug);
 svOverview(root)};
/* ---- overview: every service as a card ---- */
function svOverview(root){
 const dirtyN=()=>C.d.services.filter(s=>C.dirty('svc:'+s.slug)).length+(C.dirty('servicesPage')?1:0);
 const MB=Page.multi({ok:'All services published',units:()=>C.d.services.map(s=>'svc:'+s.slug).concat('servicesPage'),preview:()=>$('#svLp',root).click(),after:()=>paint()}),bar=()=>MB.paint();
 root.innerHTML=`${pageHead('Services','Manage the '+C.d.services.length+' service pages and the Services listing. Each service has its own independent content.')}
  <div class="sv-list" id="svG"></div>
  <section class="sv-page" aria-label="Services listing page"><span class="sv-page-ico">${ic('layout-template','w-7 h-7')}</span>
   <div class="sv-page-main"><span class="sv-page-eye">Listing page</span><h3>Services page</h3><p>The page that lists all your services. Edit its heading, the cards introduction, the help card and the “Other conditions” section.</p>
    <div class="sv-chips">${['Page heading','Cards heading','Help card','Other conditions'].map((t,i)=>`<span>${ic(['heading','layout-grid','life-buoy','list-plus'][i])}${t}</span>`).join('')}</div></div>
   <div class="sv-page-side"><div class="sv-page-st"><span id="svLb"></span><small id="svLd"></small></div><div class="sv-page-act"><button type="button" class="btn btn-ghost" id="svLp">${ic('eye')}Preview</button><a class="btn btn-primary" href="services.html?page=listing">${ic('pencil')}Edit page</a></div></div></section></div>`;
 bar();
 const paint=()=>{const all=svSorted(),live=all.filter(s=>s.visible).length,dr=all.filter(s=>C.dirty('svc:'+s.slug)).length;
  $('#svLb',root).innerHTML=badge(C.status('servicesPage'));const lpd=pmLast('servicesPage');$('#svLd',root).textContent=lpd?'Published '+fmtDate(lpd):'Not published from here yet';
  const filtering=false;
  const l=all.map((s,i)=>({s,i}));
  $('#svG',root).innerHTML=l.length?`<div class="sv-lh" aria-hidden="true"><span>Service</span><span>Details</span><span>Status</span><span></span></div>`+l.map(({s,i})=>{const st=C.status('svc:'+s.slug),g=svGroup(s),img=Media.src(s.listing.img),hid=s.sections.filter(x=>x.visible===false).length;
   return`<article class="sv-row ${st==='Draft'?'is-draft':''} ${s.visible?'':'is-off'}"><span class="sv-no">${String(i+1).padStart(2,'0')}</span>
    <div class="sv-thumb">${img?`<img src="${esc(img)}" alt="${esc(s.listing.alt||s.name)}" loading="lazy">`:ic('image','w-6 h-6')}</div>
    <div class="sv-main"><h3>${esc(s.name)}${s.listing.badge?`<span class="sv-tag">${esc(s.listing.badge)}</span>`:''}</h3><p>${esc(s.listing.d||'No short description yet.')}</p></div>
    <div class="sv-facts">${g?`<span>${ic('folder')}${esc(g)}</span>`:''}<span>${ic('layers')}${s.sections.length} sections${hid?' · '+hid+' hidden':''}</span></div>
    <div class="sv-st">${badge(s.visible?st:'Hidden')}<label class="sv-vis" title="Show this service on the website"><span class="switch"><input type="checkbox" data-v="${s.slug}" ${s.visible?'checked':''} aria-label="Show ${esc(s.name)} on website"><span></span></span><em>${s.visible?'Visible':'Hidden'}</em></label></div>
    <div class="sv-ctl"><span class="sv-mv"><button type="button" class="icon-btn" data-mv="${s.slug}" data-d="-1" ${i&&!filtering?'':'disabled'} title="Show earlier on the website" aria-label="Move earlier">${ic('arrow-up')}</button><button type="button" class="icon-btn" data-mv="${s.slug}" data-d="1" ${i<all.length-1&&!filtering?'':'disabled'} title="Show later on the website" aria-label="Move later">${ic('arrow-down')}</button></span>${s.isNew?`<button type="button" class="icon-btn danger" data-del="${s.slug}" title="Delete this new service" aria-label="Delete">${ic('trash-2')}</button>`:''}<button type="button" class="btn btn-ghost btn-sm" data-pv="${s.slug}" title="Preview ${esc(s.name)}">${ic('eye')}Preview</button><a class="btn btn-primary btn-sm" href="services.html?slug=${s.slug}">${ic('pencil')}Edit</a></div></article>`}).join('')+(filtering?'':`<button type="button" class="sv-new" data-add>${ic('plus-circle','w-5 h-5')}<b>Add a new service</b><small>Starts as a hidden draft</small></button>`):`<div class="pm-none">${empty('search-x','No services found','Try a different search or filter.')}</div>`;icons()};
 root.addEventListener('change',e=>{const s=C.d.services.find(x=>x.slug===e.target.dataset.v);if(s){s.visible=e.target.checked;C.save();C.log((s.visible?'Showed':'Hid')+' service: '+s.name,'Services',{unit:'svc:'+s.slug});Toast.show('Draft saved.');paint();bar()}});
 root.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='svLp'){const a=Object.keys(SCHEMA.servicesPage.sections).map(id=>({id,visible:true,data:C.d.servicesPage[id]}));return Preview.open('servicesPage',()=>Preview.show('Services page',Preview.secs(a,SCHEMA.servicesPage)))}
  if(d.mv){const l=svSorted();if(new Set(l.map(x=>x.order)).size!==l.length||l.some(x=>typeof x.order!=='number'))l.forEach((x,k)=>x.order=k);const i=l.findIndex(x=>x.slug===d.mv),j=i+ +d.d;if(j<0||j>=l.length)return;const t=l[i].order;l[i].order=l[j].order;l[j].order=t;C.save();C.log('Reordered services','Services');Toast.show('Draft saved. New position: '+(j+1)+'.');paint();bar()}
  else if(d.pv){const s=C.d.services.find(x=>x.slug===d.pv);Preview.open('svc:'+s.slug,svPreviewOf(s))}
  else if(d.add!==undefined)addService();
  else if(d.del){const s=C.d.services.find(x=>x.slug===d.del);if(await confirmBox('Delete the new service <b>'+esc(s.name)+'</b>?',{danger:true,ok:'Delete',title:'Delete service?'})){C.d.services=C.d.services.filter(x=>x!==s);C.p.services=C.p.services.filter(x=>x.slug!==s.slug);C.save();DB.set('contentPub',C.p);C.log('Deleted new service: '+s.name,'Services');Toast.show('Service deleted.');paint();bar()}}});
 paint();icons();if(qs().get('new')==='1')setTimeout(addService,50)}
function addService(){Modal.open({title:'Add service',size:'sm',body:`<p class="hint mb-3">Creates a hidden draft with the same section structure as the other services. The page file is generated when the backend/website integration is built.</p><div class="fld"><label class="lbl">Service name <span class="text-red-600">*</span></label><input class="input" id="ns"></div><div class="fld mt-3"><label class="lbl">URL slug</label><input class="input" id="nl" placeholder="auto from name"></div>`,footer:'<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ok">Add service</button>',onMount(m){$('#ok',m).onclick=()=>{const n=$('#ns',m).value.trim(),sl=slugify($('#nl',m).value||n);if(!n)return Toast.show('Enter a service name.','error');if(C.d.services.some(s=>s.slug===sl))return Toast.show('That slug already exists.','error');
   const t=blankDeep(clone(C.d.services[0]));t.slug=sl;t.name=n;t.visible=false;t.isNew=true;t.order=Math.max(...C.d.services.map(s=>s.order||0))+1;t.listing.title=n;C.d.services.push(t);C.save();C.log('Added service (draft): '+n,'Services',{unit:'svc:'+sl});Modal.close();location.href='services.html?slug='+sl}}})}
/* ---- editor: one service (or the listing page), step by step ---- */
function svWizard(root,o){const steps=o.steps,N=steps.length,lp=pmLast(o.unit),BASE=o.base||'services.html',BN=o.baseName||'Services',BL=o.baseLabel||'all services';
 const tabs=o.tabs||svSorted().map(s=>`<a href="services.html?slug=${s.slug}" class="${o.unit==='svc:'+s.slug?'on':''}" ${o.unit==='svc:'+s.slug?'aria-current="page"':''}>${ic('stethoscope')}<span>${esc(s.name)}</span>${C.dirty('svc:'+s.slug)?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`).join('')
  +`<a href="services.html?page=listing" class="${o.unit==='servicesPage'?'on':''}">${ic('layout-grid')}<span>Services page</span>${C.dirty('servicesPage')?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`;
 root.innerHTML=`<div class="hb pm-edit">${pageHead(o.title,(o.url?o.url+' · ':'')+(lp?'Published '+fmtDate(lp):'Not published from here yet'),backBtn(BASE,'All '+BN.toLowerCase()))}
  <nav class="pm-tabs" aria-label="${BN}">${tabs}</nav>
  <section class="hb-top" aria-label="${esc(o.title)} sections"><div class="hb-top-h"><h3 id="hbSum"></h3><span class="hb-live" id="hbCnt">Layout is fixed · content only</span></div>
   <div class="hb-strip"><button type="button" class="hb-arw l" data-sc="-1" aria-label="Scroll left">${ic('chevron-left')}</button><div class="hb-steps" id="hbL" role="list"></div><button type="button" class="hb-arw r" data-sc="1" aria-label="Scroll right">${ic('chevron-right')}</button></div>
   <div class="hb-prog" role="progressbar" aria-valuemin="1" aria-valuemax="${N}"><span id="hbP"></span></div></section>
  <section class="hb-card" id="hbC"></section></div>`;
 const page=Page.wire(root,{unit:o.unit,validate:o.validate,preview:o.preview});
 const seen=new Set();let cur=0;const h0=location.hash?steps.findIndex(s=>'#'+s.id===location.hash):-1;if(h0>=0)cur=h0;
 const L=()=>$('#hbL',root);
 const center=()=>{const l=L(),a=$('.hb-step.active',l);if(l&&a)l.scrollTo({left:a.offsetLeft-(l.clientWidth-a.offsetWidth)/2,behavior:'smooth'})};
 const off=s=>s.sec&&s.sec.visible===false;
 const rail=()=>{L().innerHTML=steps.map((s,i)=>{const act=i===cur,done=seen.has(i)&&!act,pass=i<=cur||seen.has(i),hid=off(s);
   return`<button type="button" role="listitem" class="hb-step ${act?'active':''} ${done?'done':''} ${hid?'off':''} ${pass?'pass':''}" data-go="${i}" title="${esc(s.label)}" ${act?'aria-current="step"':''}><span class="hb-n">${act?ic(s.icon,'w-5 h-5'):done?ic('check','w-5 h-5'):i+1}</span><span class="hb-t"><b>${esc(s.label)}</b>${hid?'<i class="hb-tag">Hidden</i>':''}</span></button>`}).join('');
  $('#hbSum',root).innerHTML=`Step <b>${cur+1}</b> of ${N} <span>· ${Math.round((cur+1)/N*100)}% through</span>`;
  const sec=steps.filter(s=>s.sec);if(sec.length)$('#hbCnt',root).textContent=sec.filter(s=>!off(s)).length+' of '+sec.length+' sections live';icons();requestAnimationFrame(center)};
 const panel=()=>{const s=steps[cur],last=cur===N-1;
  $('#hbP',root).style.width=((cur+1)/N*100)+'%';$('#hbP',root).parentElement.setAttribute('aria-valuenow',cur+1);
  $('#hbC',root).innerHTML=`<header class="hb-head"><div class="hb-ico">${ic(s.icon,'w-7 h-7')}</div><div class="hb-ttl"><span class="hb-eye">Step ${cur+1} of ${N}</span><h2>${esc(s.label)}</h2><p>${esc(s.sub())}</p></div>
    <div class="hb-act">${s.sec&&o.toggle?`<label class="hb-vis" title="Show this section on the page"><span>${off(s)?'Hidden':'Visible'}</span><span class="switch"><input type="checkbox" id="hbTg" ${off(s)?'':'checked'} aria-label="Show ${esc(s.label)} on page"><span></span></span></label>`:''}<button type="button" class="btn btn-ghost btn-sm" data-pg="pv">${ic('eye')}Preview page</button></div></header>
   <div class="hb-body" id="hbB"></div>
   <footer class="hb-foot"><button type="button" class="btn btn-ghost" data-nav="-1" ${cur?'':'disabled'}>${ic('arrow-left')}Back</button><span class="hb-pos">${cur+1} / ${N}</span><span class="hb-r"><button type="button" class="btn hb-save" data-pg="sd">${ic('save')}Save Changes</button>${last?`<button type="button" class="btn btn-primary" data-pg="pb">${ic('rocket')}Publish page</button>`:`<button type="button" class="btn btn-primary" data-nav="1">Next<span class="hb-nx">${esc(steps[cur+1].label)}</span>${ic('arrow-right')}</button>`}</span></footer>`;
  const host=$('#hbB',root);s.mount?s.mount(host,page):Ed.mount(host,s.data,s.fields,{onChange:page.changed});icons()};
 const go=(i,scroll)=>{seen.add(cur);cur=Math.max(0,Math.min(N-1,i));rail();panel();if(scroll){const m=$('.hb-top',root);m&&m.scrollIntoView({block:'start',behavior:'smooth'})}};
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.sc!==undefined){const l=L();l.scrollBy({left:+d.sc*l.clientWidth*.7,behavior:'smooth'})}
  else if(d.go!==undefined)go(+d.go,false);else if(d.nav!==undefined)go(cur+ +d.nav,true)});
 root.addEventListener('change',e=>{if(e.target.id!=='hbTg')return;steps[cur].sec.visible=e.target.checked;page.changed();rail();const v=$('.hb-vis > span',root);if(v)v.textContent=e.target.checked?'Visible':'Hidden'});
 rail();panel();icons()}
function svEditor(root,slug){const sv=C.d.services.find(s=>s.slug===slug);
 if(!sv){root.innerHTML=empty('alert-circle','Service not found','Go back to the Services list.',`<a class="btn btn-primary mt-4" href="services.html">Back</a>`);return}
 const recF=[T0('name','Page name (breadcrumb / title)',{r:1}),{k:'visible',l:'Show on website',y:'tog'},{k:'order',l:'Display order',y:'t'},{y:'note',t:'URL: '+svcPageUrl(sv)+' (fixed, so existing links keep working).'}];
 const steps=[{id:'card',label:'Service card',icon:'layout-grid',sub:()=>'Name, visibility, order and the card shown on the homepage and Services page',
  mount:(host,page)=>{host.innerHTML='<div id="r1"></div><h4 class="sv-sub">Website card</h4><p class="hint !mt-0 mb-3">Used on the homepage, the Services page and as this service’s card.</p><div id="r2"></div>';Ed.mount($('#r1',host),sv,recF,{onChange:page.changed});Ed.mount($('#r2',host),sv.listing,SCHEMA.svcListing,{onChange:page.changed})}},
  ...sv.sections.map(s=>{const d=SCHEMA.service.sections[s.id];return{id:s.id,label:d.label,icon:SV_ICON[s.id]||'layout-template',sub:()=>secTitle(s),data:s.data,fields:d.f,sec:s}})];
 svWizard(root,{unit:'svc:'+slug,title:sv.name,url:svcPageUrl(sv),steps,toggle:true,validate:()=>[...Ed.validate(recF,sv,'Service'),...Ed.validate(SCHEMA.svcListing,sv.listing,'Service card'),...validateSecs(sv.sections,SCHEMA.service)],preview:svPreviewOf(sv)})}
function svListing(root){const arr=Object.keys(SCHEMA.servicesPage.sections).map(id=>({id,visible:true,data:C.d.servicesPage[id]}));
 svWizard(root,{unit:'servicesPage',title:'Services page',url:'/services/',toggle:false,
  steps:arr.map(s=>{const d=SCHEMA.servicesPage.sections[s.id];return{id:s.id,label:d.label,icon:SV_ICON[s.id]||'layout-template',sub:()=>secTitle(s)||'Content of the /services/ page',data:s.data,fields:d.f}}),
  validate:()=>validateSecs(arr,SCHEMA.servicesPage),preview:()=>Preview.show('Services page',Preview.secs(arr,SCHEMA.servicesPage))})}
const T0=(k,l,o)=>({k,l,y:'t',...o});
/* ===== Blog Management (overview cards + step-by-step editor, same look as Services / Page Management) ===== */
const BL_ICON={basics:'file-text',card:'layout-grid',hero:'image',intro:'align-left',sections:'list-ordered',note:'user-round',side:'panel-right',related:'link-2',band:'megaphone',head:'heading',pills:'tags'};
const blUrl=p=>'/blogs/'+p.slug+'/';
const blPick=(fs,keys)=>fs.filter(f=>keys.includes(f.k));
const blCats=()=>[...new Set(C.d.posts.map(p=>p.category).filter(Boolean))];
const blPreviewOf=p=>()=>Preview.show(p.title,Preview.fields([...SCHEMA.post.card,...SCHEMA.post.page],p));
const blDirtyN=()=>C.d.posts.filter(p=>C.dirty('post:'+p.slug)).length+(C.dirty('blogsPage')?1:0);
M.blogs=root=>{const q=qs(),slug=q.get('slug');
 if(q.get('page')==='listing')return blListing(root);
 if(slug)return blEditor(root,slug);
 blOverview(root)};
/* ---- overview: every article as a card row ---- */
function blOverview(root){
 let fq=qs().get('q')||'',fs='all',fc='all';
 const MB=Page.multi({ok:'All blogs published',units:()=>C.d.posts.map(p=>'post:'+p.slug).concat('blogsPage'),preview:()=>$('#blLp',root).click(),after:()=>paint()}),bar=()=>MB.paint();
 root.innerHTML=`${pageHead('Blog Management','Manage the '+C.d.posts.length+' blog articles and the Blogs listing. Each article has its own independent content; existing articles can be hidden but not deleted, so their URLs stay safe.')}
  <div class="pm-tools"><div class="search"><i data-lucide="search"></i><input class="input" id="blQ" placeholder="Search articles…" value="${esc(fq)}" aria-label="Search articles"></div>
   <select class="input bl-sel" id="blCat" aria-label="Filter by category"><option value="all">All categories</option>${blCats().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
   <div class="pm-seg" id="blSeg" role="group" aria-label="Filter by status"></div></div>
  <div class="sv-list" id="blG"></div>
  <section class="sv-page" aria-label="Blogs listing page"><span class="sv-page-ico">${ic('newspaper','w-7 h-7')}</span>
   <div class="sv-page-main"><span class="sv-page-eye">Listing page</span><h3>Blogs page</h3><p>The page that lists all your articles. Edit its heading, introduction and highlight pills.</p>
    <div class="sv-chips">${['Page heading','Introduction','Highlight pills'].map((t,i)=>`<span>${ic(['heading','align-left','tags'][i])}${t}</span>`).join('')}</div></div>
   <div class="sv-page-side"><div class="sv-page-st"><span id="blLb"></span><small id="blLd"></small></div><div class="sv-page-act"><button type="button" class="btn btn-ghost" id="blLp">${ic('eye')}Preview</button><a class="btn btn-primary" href="blogs.html?page=listing">${ic('pencil')}Edit page</a></div></div></section>`;
 bar();
 const paint=()=>{const all=C.d.posts,t=fq.trim().toLowerCase(),stOf=p=>C.status('post:'+p.slug);
  const live=all.filter(p=>p.visible).length,dr=all.filter(p=>C.dirty('post:'+p.slug)).length,hid=all.length-live;
  $('#blSeg',root).innerHTML=[['all','All',all.length],['live','Live',live],['draft','Drafts',dr],['hidden','Hidden',hid]].map(([k,l,n])=>`<button type="button" data-f="${k}" class="${fs===k?'on':''}">${l}<i>${n}</i></button>`).join('');
  $('#blLb',root).innerHTML=badge(C.status('blogsPage'));const lpd=pmLast('blogsPage');$('#blLd',root).textContent=lpd?'Published '+fmtDate(lpd):'Not published from here yet';
  const l=all.map((p,i)=>({p,i})).filter(({p})=>(!t||(p.title+' '+p.category+' '+(p.excerpt||'')).toLowerCase().includes(t))&&(fc==='all'||p.category===fc)&&(fs==='all'||(fs==='live'&&p.visible)||(fs==='draft'&&C.dirty('post:'+p.slug))||(fs==='hidden'&&!p.visible)));
  const filtering=!!t||fc!=='all'||fs!=='all';
  $('#blG',root).innerHTML=l.length?`<div class="sv-lh" aria-hidden="true"><span>Article</span><span>Details</span><span>Status</span><span></span></div>`+l.map(({p,i})=>{const st=stOf(p),img=Media.src(p.thumb);
   return`<article class="sv-row ${st==='Draft'?'is-draft':''} ${p.visible?'':'is-off'}"><span class="sv-no">${String(i+1).padStart(2,'0')}</span>
    <div class="sv-thumb">${img?`<img src="${esc(img)}" alt="${esc(p.thumb_alt||p.title)}" loading="lazy">`:ic('image','w-6 h-6')}</div>
    <div class="sv-main"><h3>${esc(p.title||'Untitled article')}${p.featured?'<span class="sv-tag">Featured</span>':''}${p.isNew?'<span class="sv-tag bl-new">New</span>':''}</h3><p>${esc(p.excerpt||'No short description yet.')}</p></div>
    <div class="sv-facts">${p.category?`<span>${ic('folder')}${esc(p.category)}</span>`:''}${p.date?`<span>${ic('calendar')}${esc(p.date)}</span>`:''}${p.read?`<span>${ic('clock-3')}${esc(p.read)}</span>`:''}</div>
    <div class="sv-st">${badge(p.visible?st:'Hidden')}<label class="sv-vis" title="Show this article on the website"><span class="switch"><input type="checkbox" data-v="${p.slug}" ${p.visible?'checked':''} aria-label="Show ${esc(p.title)} on website"><span></span></span><em>${p.visible?'Visible':'Hidden'}</em></label></div>
    <div class="sv-ctl">${p.isNew?`<button type="button" class="icon-btn danger" data-del="${p.slug}" title="Delete this new article" aria-label="Delete">${ic('trash-2')}</button>`:''}<button type="button" class="btn btn-ghost btn-sm" data-pv="${p.slug}" title="Preview ${esc(p.title)}">${ic('eye')}Preview</button><a class="btn btn-primary btn-sm" href="blogs.html?slug=${p.slug}">${ic('pencil')}Edit</a></div></article>`}).join('')+(filtering?'':`<button type="button" class="sv-new" data-add>${ic('plus-circle','w-5 h-5')}<b>Add a new blog article</b><small>Starts as a hidden draft</small></button>`):`<div class="pm-none">${empty('search-x','No articles found','Try a different search or filter.')}</div>`;icons()};
 root.addEventListener('input',e=>{if(e.target.id==='blQ'){fq=e.target.value;paint()}});
 root.addEventListener('change',e=>{
  if(e.target.id==='blCat'){fc=e.target.value;return paint()}
  const p=C.d.posts.find(x=>x.slug===e.target.dataset.v);if(p){p.visible=e.target.checked;C.save();C.log((p.visible?'Showed':'Hid')+' blog: '+p.title,'Blog Management',{unit:'post:'+p.slug});Toast.show('Draft saved.');paint();bar()}});
 root.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='blLp')return Preview.open('blogsPage',()=>Preview.show('Blogs page',Preview.fields(SCHEMA.blogsPage.fields,C.d.blogsPage)));
  if(d.f){fs=d.f;paint()}
  else if(d.pv){const p=C.d.posts.find(x=>x.slug===d.pv);Preview.open('post:'+p.slug,blPreviewOf(p))}
  else if(d.add!==undefined)addBlog();
  else if(d.del){const p=C.d.posts.find(x=>x.slug===d.del);if(await confirmBox('Delete the new article <b>'+esc(p.title)+'</b>?',{danger:true,ok:'Delete',title:'Delete article?'})){C.d.posts=C.d.posts.filter(x=>x!==p);C.p.posts=C.p.posts.filter(x=>x.slug!==p.slug);C.save();DB.set('contentPub',C.p);C.log('Deleted new blog: '+p.title,'Blog Management');Toast.show('Article deleted.');paint();bar()}}});
 paint();icons();if(qs().get('new')==='1')setTimeout(addBlog,50)}
function addBlog(){Modal.open({title:'Add blog article',size:'sm',body:`<p class="hint mb-3">Creates a hidden draft that copies the shared settings of the other articles. The page file is generated when the backend/website integration is built.</p><div class="fld"><label class="lbl">Title <span class="text-red-600">*</span></label><input class="input" id="nt"></div><div class="fld mt-3"><label class="lbl">URL slug</label><input class="input" id="nl" placeholder="auto from title"></div>`,footer:'<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ok">Add article</button>',onMount(m){$('#ok',m).onclick=()=>{const t=$('#nt',m).value.trim(),sl=slugify($('#nl',m).value||t);if(!t)return Toast.show('Enter a title.','error');if(C.d.posts.some(x=>x.slug===sl))return Toast.show('That slug already exists.','error');
    const nb=blankDeep(clone(C.d.posts[0]));Object.assign(nb,{slug:sl,title:t,visible:false,isNew:true,featured:false,date:today(),category:C.d.posts[0].category,author:C.d.posts[0].author,author_i:C.d.posts[0].author_i,card_author:C.d.posts[0].card_author,author_name:C.d.posts[0].author_name,author_cred:C.d.posts[0].author_cred,read:'5 min read',card_btn:C.d.posts[0].card_btn,note_service:C.d.posts[0].note_service,share_t:C.d.posts[0].share_t,toc_t:C.d.posts[0].toc_t,rel_t:C.d.posts[0].rel_t,cta_t:C.d.posts[0].cta_t,cta_p:C.d.posts[0].cta_p,cta_btns:C.d.posts[0].cta_btns,band_h2:C.d.posts[0].band_h2,band_p:C.d.posts[0].band_p,band_btns:C.d.posts[0].band_btns,related:[],sections:[{id:'introduction',h2:'',alert:false,html:''}]});
    C.d.posts.push(nb);C.save();C.log('Added blog (draft): '+t,'Blog Management',{unit:'post:'+sl});Modal.close();location.href='blogs.html?slug='+sl}}})}
/* ---- editor: one article (or the listing page), step by step ---- */
const blTabs=unit=>C.d.posts.map(x=>`<a href="blogs.html?slug=${x.slug}" class="${unit==='post:'+x.slug?'on':''}" ${unit==='post:'+x.slug?'aria-current="page"':''} title="${esc(x.title)}">${ic('file-text')}<span>${esc(x.title||'Untitled article')}</span>${C.dirty('post:'+x.slug)?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`).join('')
 +`<a href="blogs.html?page=listing" class="${unit==='blogsPage'?'on':''}">${ic('layout-grid')}<span>Blogs page</span>${C.dirty('blogsPage')?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`;
function blEditor(root,slug){const p=C.d.posts.find(x=>x.slug===slug);
 if(!p){root.innerHTML=empty('alert-circle','Article not found','Go back to the Blog list.',`<a class="btn btn-primary mt-4" href="blogs.html">Back</a>`);return}
 Ed.self=slug;$('#dl-cats').innerHTML=blCats().map(c=>`<option value="${esc(c)}">`).join('');
 const CD=SCHEMA.post.card,PG=SCHEMA.post.page,all=[...CD,...PG],S=(id,label,sub,fields)=>({id,label,icon:BL_ICON[id],sub,data:p,fields});
 const steps=[
  S('basics','Article basics',()=>p.title||'Title, category, date and visibility',blPick(CD,['visible','title','excerpt','category','date','read','featured'])),
  S('card','Listing card',()=>'How this article appears on the Blogs page',blPick(CD,['thumb','thumb_alt','card_author','card_btn','featured_label'])),
  S('hero','Article hero',()=>p.sub||'Subtitle, author, hero image and lead paragraph',blPick(PG,['sub','author','author_i','hero_img','hero_alt','lead'])),
  S('intro','Introduction',()=>'Opening paragraphs before the first section',blPick(PG,['intro_html'])),
  S('sections','Article sections',()=>(p.sections||[]).length+' section'+((p.sections||[]).length===1?'':'s')+' · the table of contents is generated from these',blPick(PG,['sections'])),
  S('note','Service note & author',()=>p.author_name||'Linked service note, share label and author box',blPick(PG,['note_pre','note_link','note_service','note_post','share_t','author_name','author_cred'])),
  S('side','Sidebar',()=>p.cta_t||'Table of contents heading and side call-to-action',blPick(PG,['toc_t','cta_t','cta_p','cta_btns'])),
  S('related','Related posts',()=>(p.related||[]).length+' selected',blPick(PG,['rel_t','related'])),
  S('band','Closing CTA',()=>p.band_h2||'Call-to-action band at the end of the article',blPick(PG,['band_h2','band_p','band_btns']))];
 svWizard(root,{unit:'post:'+slug,title:p.title||'New article',url:blUrl(p),steps,toggle:false,base:'blogs.html',baseName:'Blogs',baseLabel:'all blogs',tabs:blTabs('post:'+slug),
  validate:()=>Ed.validate(all,p,'Article'),preview:blPreviewOf(p)})}
function blListing(root){const F=SCHEMA.blogsPage.fields,D=C.d.blogsPage;
 const S=(id,label,sub,fields)=>({id,label,icon:BL_ICON[id],sub,data:D,fields});
 svWizard(root,{unit:'blogsPage',title:'Blogs page',url:'/blogs/',toggle:false,base:'blogs.html',baseName:'Blogs',baseLabel:'all blogs',tabs:blTabs('blogsPage'),
  steps:[S('head','Page heading',()=>D.h1||'Heading and introduction of /blogs/',blPick(F,['h1','p'])),S('pills','Highlight pills',()=>(D.pills||[]).length+' pills under the introduction',blPick(F,['pills']))],
  validate:()=>Ed.validate(F,D,'Blogs page'),preview:()=>Preview.show('Blogs page',Preview.fields(F,D))})}
/* ===== crud-based modules: testimonials, SEO ===== */
const store=(unit,get,set)=>({get,set:r=>{set(r);return C.save()}});
const STATUS2=o=>L('status','Status','select',{options:o});
M.testimonials=root=>{crud({key:'testimonials',store:store('testimonials',()=>C.d.testimonials,r=>C.d.testimonials=r),title:'Testimonials',singular:'Testimonial',icon:'message-square-quote',sub:'Genuine, consented patient reviews only. Only Approved reviews will appear on the website.',titleKey:'name',searchKeys:['name','text'],defaults:{status:'Pending',rating:5,date:dayAgo(0),home:'No',service:'All pages',order:''},
 note:'The website currently shows <b>placeholder review cards</b> ([Reviewer name], [Paste a real Google review here…]) on the homepage and all 7 service pages. They must be replaced with approved reviews added here. No demo reviews are provided.',
 fields:[L('name','Patient display name','text',{required:true}),L('rating','Rating','select',{options:[5,4,3,2,1]}),L('date','Review date','date'),STATUS2(['Pending','Approved','Hidden']),L('home','Show on homepage','select',{options:['Yes','No']}),L('service','Show on service page','select',{options:['All pages',...C.d.services.map(s=>s.name)]}),L('order','Display order','number'),L('text','Review text','textarea',{rows:4,required:true})],
 columns:[{label:'Reviewer',render:r=>`<b>${esc(r.name)}</b>`},{label:'Review',render:r=>`<span class="line-clamp-2 max-w-xs inline-block">${esc(r.text)}</span>`},{label:'Rating',render:r=>'\u2605'.repeat(+r.rating)+'\u2606'.repeat(5-r.rating)},{label:'Home',k:'home'},{label:'Status',k:'status',badge:1}],
 filters:[{k:'status',label:'Status',options:['Pending','Approved','Hidden']},{k:'home',label:'Homepage',options:['Yes','No']}],
 rowActions:[{label:'Approve',icon:'check-circle-2',fn:r=>{r.status='Approved';Toast.show('Review approved.')}},{label:'Hide',icon:'eye-off',fn:r=>{r.status='Hidden';Toast.show('Review hidden.')}}]})(root);withPublish(root,'testimonials')};
M['seo-management']=root=>{root.innerHTML='';const top=document.createElement('div'),sub=document.createElement('div');root.append(top,sub);
 top.innerHTML=pageHead('SEO Management','Meta data of all 21 website pages.')+notice('URL slugs are not editable here, so existing links and canonical URLs stay valid. Canonical and Open Graph URLs use the placeholder domain <code>{{siteUrl}}</code> until the real domain is entered in Website Settings.');
 sub.className='mt-2';crud({key:'seoPages',store:{get:()=>C.d.seo.map(s=>({id:s.key,...s})),set:r=>{C.d.seo=r;return C.save()}},title:'Page-wise SEO',singular:'SEO entry',icon:'search-check',sub:'',titleKey:'label',noAdd:true,noDelete:true,searchKeys:['label','title','file'],
  fields:SCHEMA.seo.map(f=>L(f.k,f.l,f.y==='ta'?'textarea':f.y==='img'?'image':f.y==='sel'?'select':f.y==='url'?'text':'text',{rows:f.rows,hint:f.hint,options:f.opts})),
  columns:[{label:'Page',render:r=>`<b>${esc(r.label)}</b><br><small class="text-[#60736B]">${esc(r.file)}</small>`},{label:'Meta title',render:r=>esc(r.title)+`<br><small class="${r.title.length>60?'text-red-700':'text-[#60736B]'}">${r.title.length}/60</small>`},{label:'Description',render:r=>`<small class="${r.desc.length>160?'text-red-700':'text-[#60736B]'}">${r.desc.length}/160</small>`}],
  view:r=>`<div class="grid md:grid-cols-2 gap-4"><div><p class="lbl">Search result preview</p>${serp(r.title,Content.tok(r.canonical||'{{siteUrl}}/'+r.file),r.desc)}</div><div><p class="lbl">Social share preview</p><div class="og">${r.ogImage?`<img src="${esc(Media.src(r.ogImage))}" alt="">`:'<img alt="">'}<div><b>${esc(r.ogTitle||r.title)}</b><p class="hint">${esc(r.ogDesc||r.desc)}</p></div></div></div></div>`})(sub);withPublish(top,'seo');icons()};
/* ===== Website Settings ===== */
M['website-settings']=root=>{const st=C.d.settings,G=SCHEMA.settings,ph=C.placeholders();
 root.innerHTML=pageHead('Website Settings','Global values used across the website. Phone, WhatsApp, e-mail, address and map link are inserted everywhere they appear.',Page.buttons())+(ph.length?`<div class="notice">${ic('alert-triangle')}<div><b>${ph.length} placeholder value(s) still need approved content.</b> <button class="underline font-semibold" id="phl">Show list</button></div></div>`:'')+G.map(g=>`<div class="card mb-4"><div class="card-h"><h3>${esc(g.label)}</h3></div><div class="card-b" id="g-${g.id}"></div></div>`).join('');
 const page=Page.wire(root,{unit:'settings',validate:()=>Ed.validate(G.flatMap(g=>g.f),st,'Settings'),preview:()=>Preview.show('Website Settings',Preview.fields(G.flatMap(g=>g.f),st))});
 G.forEach(g=>Ed.mount($('#g-'+g.id,root),st,g.f,{onChange:page.changed}));
 const b=$('#phl',root);b&&(b.onclick=()=>Modal.open({title:'Placeholders to replace',size:'lg',body:'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Where</th><th>Value</th></tr></thead><tbody>'+ph.map(x=>`<tr><td>${esc(x.where)}</td><td>${esc(x.text)}</td></tr>`).join('')+'</tbody></table></div>',footer:'<button class="btn btn-primary" data-close>Close</button>'}));icons()};
/* ===== hidden modules ===== */
M.products=root=>{root.innerHTML=pageHead('Products','')+`<div class="card"><div class="card-b">${empty('package','Products are managed in the Homepage Builder','The website has exactly two herbal products on the homepage. They are edited inside Homepage Builder → Herbal Products. No separate product pages exist.',`<a class="btn btn-primary mt-4" href="homepage-builder.html#herbal">Open Herbal Products</a>`)}</div></div>`;icons()};
M['theme-appearance']=root=>{root.innerHTML=pageHead('Theme & Appearance','')+`<div class="card"><div class="card-b">${empty('palette','Theme editing is switched off','The public website design is locked: colours, fonts and layout stay exactly as designed. Only content is managed from this CMS.',`<a class="btn btn-primary mt-4" href="dashboard.html">Back to dashboard</a>`)}</div></div>`;icons()};
/* ===== Dashboard: real data + notices ===== */
const dash=M.dashboard;M.dashboard=root=>{dash(root);const ph=C.placeholders().length;$('.db',root).insertAdjacentHTML('afterbegin',notice(`<b>Content is stored in this browser until the backend is built.</b> ${ph?`${ph} placeholder value(s) (e.g. e-mail, social links, reviews) still need approved content — see <a class="underline font-semibold" href="website-settings.html">Website Settings</a>.`:''}`));icons()};
})();
