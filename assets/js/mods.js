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
 const pv={testimonials:()=>{const a=C.d.testimonials.filter(r=>r.status==='Approved');Preview.show('Testimonials · approved reviews',a.length?a.map(r=>`<div class="card mb-3"><div class="card-b"><b>${esc(r.name)}</b> <span class="text-[#B8861B]">${'\u2605'.repeat(+r.rating||0)}</span>${r.source==='google'?' <span class="badge b-gray">Google</span>':''}<p class="mt-1">${esc(r.text)}</p></div></div>`).join(''):'<p class="hint">No approved reviews yet. Only Approved reviews appear on the website.</p>')},
  seo:()=>Preview.show('SEO · search result previews',C.d.seo.map(r=>`<div class="mb-4"><b>${esc(r.label)}</b>${serp(r.title,Content.tok(r.canonical||'{{siteUrl}}/'+r.file),r.desc)}</div>`).join(''))};
 return Page.multi({ok:'All published',units:()=>[unit],preview:pv[unit]})}
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
 const tabs=o.tabs!=null?o.tabs:svSorted().map(s=>`<a href="services.html?slug=${s.slug}" class="${o.unit==='svc:'+s.slug?'on':''}" ${o.unit==='svc:'+s.slug?'aria-current="page"':''}>${ic('stethoscope')}<span>${esc(s.name)}</span>${C.dirty('svc:'+s.slug)?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`).join('')
  +`<a href="services.html?page=listing" class="${o.unit==='servicesPage'?'on':''}">${ic('layout-grid')}<span>Services page</span>${C.dirty('servicesPage')?'<i class="pm-dot" title="Has draft changes"></i>':''}</a>`;
 root.innerHTML=`<div class="hb pm-edit">${pageHead(o.title,o.subtitle||((o.url?o.url+' · ':'')+(lp?'Published '+fmtDate(lp):'Not published from here yet')),o.noBack?'':backBtn(BASE,'All '+BN.toLowerCase()))}${o.top||''}
  ${o.tabs===''?'':`<nav class="pm-tabs" aria-label="${BN}">${tabs}</nav>`}
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
   return`<button type="button" role="listitem" class="hb-step ${act?'active':''} ${done?'done':''} ${hid?'off':''} ${pass?'pass':''}" data-go="${i}" title="${esc(s.label)}" ${act?'aria-current="step"':''}><span class="hb-n">${act?ic(s.icon,'w-5 h-5'):done?ic('check','w-5 h-5'):i+1}</span><span class="hb-t"><b>${esc(s.label)}</b>${hid?'<i class="hb-tag">Hidden</i>':''}${s.fill&&s.fill()?`<i class="hb-tag fill">${s.fill()} to fill</i>`:''}</span></button>`}).join('');
  $('#hbSum',root).innerHTML=`Step <b>${cur+1}</b> of ${N} <span>· ${Math.round((cur+1)/N*100)}% through</span>`;
  const sec=steps.filter(s=>s.sec);if(sec.length)$('#hbCnt',root).textContent=sec.filter(s=>!off(s)).length+' of '+sec.length+' sections live';const fl=steps.filter(s=>s.fill);if(fl.length){const n=fl.reduce((t,s)=>t+s.fill(),0);$('#hbCnt',root).textContent=n?n+' value'+(n>1?'s':'')+' still to fill':'All values filled'}icons();requestAnimationFrame(center)};
 const panel=()=>{const s=steps[cur],last=cur===N-1;
  $('#hbP',root).style.width=((cur+1)/N*100)+'%';$('#hbP',root).parentElement.setAttribute('aria-valuenow',cur+1);
  $('#hbC',root).innerHTML=`<header class="hb-head"><div class="hb-ico">${ic(s.icon,'w-7 h-7')}</div><div class="hb-ttl"><span class="hb-eye">Step ${cur+1} of ${N}</span><h2>${esc(s.label)}</h2><p>${esc(s.sub())}</p></div>
    <div class="hb-act">${s.sec&&o.toggle?`<label class="hb-vis" title="Show this section on the page"><span>${off(s)?'Hidden':'Visible'}</span><span class="switch"><input type="checkbox" id="hbTg" ${off(s)?'':'checked'} aria-label="Show ${esc(s.label)} on page"><span></span></span></label>`:''}<button type="button" class="btn btn-ghost btn-sm" data-pg="pv">${ic('eye')}${o.pvLabel||'Preview page'}</button></div></header>
   <div class="hb-body" id="hbB"></div>
   <footer class="hb-foot"><button type="button" class="btn btn-ghost" data-nav="-1" ${cur?'':'disabled'}>${ic('arrow-left')}Back</button><span class="hb-pos">${cur+1} / ${N}</span><span class="hb-r"><button type="button" class="btn hb-save" data-pg="sd">${ic('save')}Save Changes</button>${last?`<button type="button" class="btn btn-primary" data-pg="pb">${ic('rocket')}${o.pubLabel||'Publish page'}</button>`:`<button type="button" class="btn btn-primary" data-nav="1">Next<span class="hb-nx">${esc(steps[cur+1].label)}</span>${ic('arrow-right')}</button>`}</span></footer>`;
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
/* ===== Testimonials: Google reviews sync + you decide what the website shows ===== */
const tmG=()=>C.d.googleReviews||(C.d.googleReviews={placeId:'',apiKey:'',endpoint:'',token:'',lastSync:'',rating:0,total:0,mapsUrl:''});
const tmStars=n=>'\u2605'.repeat(Math.max(0,Math.min(5,Math.round(n))))+'\u2606'.repeat(5-Math.max(0,Math.min(5,Math.round(n))));
const tmAgo=d=>{if(!d)return'';const t=new Date(d);if(isNaN(t))return String(d);const days=Math.floor((Date.now()-t)/864e5);if(days<1)return'Today';if(days<2)return'Yesterday';if(days<31)return days+' days ago';const m=Math.floor(days/30.4);if(m<12)return m+' month'+(m>1?'s':'')+' ago';const y=Math.floor(m/12);return y+' year'+(y>1?'s':'')+' ago'};
const tmInit=n=>(String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('')||'?').toUpperCase();
const tmLinks=id=>id?{all:'https://search.google.com/local/reviews?placeid='+encodeURIComponent(id),write:'https://search.google.com/local/writereview?placeid='+encodeURIComponent(id)}:null;
/* Accepts what our sync function returns, or a raw Google Places API (New) place response */
function tmNormalize(raw){const src=(raw&&raw.place)||raw||{},list=Array.isArray(src.reviews)?src.reviews:[];
 const reviews=list.map(r=>{const a=r.authorAttribution||{},text=(r.text&&r.text.text)||(typeof r.text==='string'?r.text:'')||(r.originalText&&r.originalText.text)||'',stamp=String(r.publishTime||r.date||'');
  return{id:String(r.id||r.name||((a.displayName||r.author||'')+'|'+stamp)),author:a.displayName||r.author||'Google user',photo:a.photoUri||r.photo||'',url:a.uri||r.url||'',rating:Math.round(+r.rating||0),text:String(text).trim(),date:stamp.slice(0,10)}}).filter(r=>r.rating>=1&&r.rating<=5);
 return{rating:+src.rating||0,total:+(src.total||src.userRatingCount)||0,mapsUrl:src.googleMapsUri||src.mapsUrl||'',reviews}}
/* New reviews arrive as Pending (never shown automatically). Reviews you already decided on keep your decision. */
function tmApply(raw){const n=tmNormalize(raw),g=tmG();let added=0,updated=0,skipped=0;
 n.reviews.forEach(x=>{if(!x.text){skipped++;return}const ex=C.d.testimonials.find(r=>r.gid&&r.gid===x.id);
  if(ex){Object.assign(ex,{name:x.author,text:x.text,rating:x.rating,date:x.date||ex.date,photo:x.photo||ex.photo,url:x.url||ex.url});updated++}
  else{C.d.testimonials.unshift({id:'g'+uid(),gid:x.id,source:'google',name:x.author,text:x.text,rating:x.rating,date:x.date||dayAgo(0),photo:x.photo,url:x.url,image:'',status:'Pending',home:'No',service:'All pages',order:''});added++}});
 g.lastSync=new Date().toISOString();if(n.rating)g.rating=n.rating;if(n.total)g.total=n.total;if(n.mapsUrl)g.mapsUrl=n.mapsUrl;
 C.save();C.log('Google reviews synced: '+added+' new, '+updated+' updated','Testimonials',{unit:'testimonials'});return{added,updated,skipped,count:n.reviews.length}}
const tmReady=g=>!!(g.endpoint||(g.apiKey&&g.placeId));
async function tmGoogle(url,opt,what){let res;
 try{res=await fetch(url,opt)}catch(e){throw new Error('Could not reach '+what+'. If your browser blocked the request, use the server sync function or the Import button instead.')}
 let body=null;try{body=await res.json()}catch(e){}
 if(!res.ok){const msg=body&&body.error&&body.error.message;throw new Error('Google said: '+(msg||('error '+res.status))+(res.status===403?' (check that Places API (New) is enabled, billing is on and the key is not restricted away from it)':''))}
 return body}
async function tmFetch(){const g=tmG();
 if(g.endpoint){let res;try{res=await fetch(g.endpoint,{headers:g.token?{'X-Sync-Token':g.token}:{},cache:'no-store'})}catch(e){throw new Error('Could not reach the sync URL. Check the address, and that the sync function allows this admin site (CORS).')}
  if(res.status===401||res.status===403)throw new Error('The sync function refused the request. Check the sync token.');
  if(!res.ok)throw new Error('The sync function answered with an error ('+res.status+').');
  return tmApply(await res.json())}
 const body=await tmGoogle('https://places.googleapis.com/v1/places/'+encodeURIComponent(g.placeId)+'?languageCode=en',{headers:{'X-Goog-Api-Key':g.apiKey,'X-Goog-FieldMask':'id,displayName,rating,userRatingCount,googleMapsUri,reviews'}},'Google');
 return tmApply(body)}
const tmFind=(key,q)=>tmGoogle('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress'},body:JSON.stringify({textQuery:q,languageCode:'en'})},'Google').then(b=>(b&&b.places)||[]);
M.testimonials=root=>{
 const st={q:'',f:'all',src:'all'},MB=withPublish(root,'testimonials'),bar=()=>MB.paint(),gname=()=>(C.d.settings&&C.d.settings.name)||'DISHA Clinic';
 root.innerHTML=pageHead('Testimonials','Reviews from your Google listing. You decide which ones appear on the website.',`<button type="button" class="btn btn-ghost" id="tmAdd">${ic('plus')}Add manual testimonial</button>`)
  +notice('The website currently shows <b>placeholder review cards</b> on the homepage and all 7 service pages. Reviews you set to <b>Show</b> here replace them once you press Publish.')+`<section class="tm-g" id="tmG" aria-label="Google reviews connection"></section><div id="tmNew"></div>
  <div class="pm-tools"><div class="search"><i data-lucide="search"></i><input class="input" id="tmQ" placeholder="Search reviews…" aria-label="Search reviews"></div>
   <select class="input bl-sel" id="tmSrc" aria-label="Filter by source"><option value="all">All sources</option><option value="google">Google</option><option value="manual">Manual</option></select>
   <div class="pm-seg" id="tmSeg" role="group" aria-label="Filter by status"></div></div><div class="tm-list" id="tmL"></div>`;
 const save=(msg,toast)=>{C.save();if(msg)C.log(msg,'Testimonials',{unit:'testimonials'});if(toast)Toast.show(toast);draw();bar()};
 const find=id=>C.d.testimonials.find(r=>r.id===id);
 function draw(){const all=C.d.testimonials,g=tmG(),L=tmLinks(g.placeId),conn=tmReady(g),pend=all.filter(r=>r.status==='Pending').length;
  $('#tmG',root).innerHTML=`<div class="tm-g-l"><span class="tm-glogo" aria-hidden="true">G</span><div><h3>Google Reviews</h3><p>${esc(gname())}</p><div class="tm-chips"><span class="tm-chip ${conn?'ok':''}">${conn?'Connected':'Not connected yet'}</span><span class="tm-chip">${g.lastSync?'Last synced '+esc(tmAgo(g.lastSync)):'Never synced'}</span></div></div></div>
   <div class="tm-g-m">${g.rating?`<b>${g.rating.toFixed(1)}</b><span class="tm-stars" aria-label="${g.rating.toFixed(1)} out of 5">${tmStars(g.rating)}</span><small>${g.total?g.total+' reviews on Google':'Google rating'}</small>`:`<small>Your Google rating appears here after the first sync.</small>`}</div>
   <div class="tm-g-r"><button type="button" class="btn btn-primary" id="tmSync">${ic('refresh-cw')}Sync now</button><button type="button" class="btn btn-ghost" id="tmImp" title="Paste reviews you copied from the Google API">${ic('clipboard-paste')}Import</button><button type="button" class="btn btn-ghost" id="tmSet">${ic('settings-2')}Settings</button>${L?`<a class="btn btn-ghost" href="${L.all}" target="_blank" rel="noopener">${ic('external-link')}View on Google</a>`:''}</div>`;
  $('#tmNew',root).innerHTML=pend?`<div class="tm-new" role="status"><span class="tm-new-i">${ic('sparkles','w-5 h-5')}</span><div><b>${pend} new review${pend>1?'s':''} from Google need${pend>1?'':'s'} your decision</b><small>Nothing is shown on the website until you choose Show.</small></div><div class="tm-new-a"><button type="button" class="btn btn-ghost btn-sm" data-bulk="Hidden">Hide all</button><button type="button" class="btn btn-primary btn-sm" data-bulk="Approved">Show all</button></div></div>`:'';
  const cnt={all:all.length,Approved:all.filter(r=>r.status==='Approved').length,Hidden:all.filter(r=>r.status==='Hidden').length,Pending:pend};
  $('#tmSeg',root).innerHTML=[['all','All'],['Approved','Showing'],['Hidden','Hidden'],['Pending','New']].map(([k,l])=>`<button type="button" data-f="${k}" class="${st.f===k?'on':''}">${l}<i>${cnt[k]}</i></button>`).join('');
  const q=st.q.trim().toLowerCase(),rows=all.filter(r=>(st.f==='all'||r.status===st.f)&&(st.src==='all'||(r.source||'manual')===st.src)&&(!q||(r.name+' '+r.text).toLowerCase().includes(q))).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const svcOpts=['All pages',...C.d.services.map(s=>s.name)];
  $('#tmL',root).innerHTML=!all.length?`<div class="tm-empty"><span class="tm-empty-i">${ic('message-square-quote','w-7 h-7')}</span><h3>No reviews yet</h3><p>Bring in your Google reviews in three steps, then choose what the website shows.</p><ol><li><b>Connect</b> Add your Place ID and sync URL in Settings.</li><li><b>Sync</b> Click Sync now to fetch the latest Google reviews.</li><li><b>Choose</b> Press Show or Hide on each review, then Publish.</li></ol><div class="tm-empty-a"><button type="button" class="btn btn-primary" id="tmSet2">${ic('settings-2')}Open Settings</button><button type="button" class="btn btn-ghost" id="tmAdd2">${ic('plus')}Add manual testimonial</button></div></div>`
  :rows.length?rows.map(r=>{const goog=r.source==='google',on=r.status==='Approved',img=r.photo;
   return`<article class="tm-row s-${(r.status||'Pending').toLowerCase()}" data-id="${r.id}">
   <div class="tm-av">${img?`<img src="${esc(img)}" alt="" referrerpolicy="no-referrer" loading="lazy">`:esc(tmInit(r.name))}</div>
   <div class="tm-main"><div class="tm-top"><b>${esc(r.name)}</b><span class="tm-stars" aria-label="${r.rating} out of 5">${tmStars(r.rating)}</span><span class="tm-src ${goog?'g':''}">${goog?'<i>G</i>Google':'Manual'}</span>${r.status==='Pending'?'<span class="sv-tag">New</span>':''}<small>${esc(tmAgo(r.date))}</small></div>
    <p class="tm-text">${esc(r.text)}</p>
    <div class="tm-opt ${on?'':'off'}"><label class="tm-sw"><span class="switch"><input type="checkbox" data-home="${r.id}" ${r.home==='Yes'?'checked':''} ${on?'':'disabled'} aria-label="Feature on homepage"><span></span></span>Homepage</label>
     <label class="tm-sel">Service page<select class="input" data-svc="${r.id}" ${on?'':'disabled'}>${svcOpts.map(o=>`<option ${o===(r.service||'All pages')?'selected':''}>${esc(o)}</option>`).join('')}</select></label>
     <label class="tm-sel tm-ord">Order<input class="input" type="number" min="0" data-ord="${r.id}" value="${esc(r.order===''||r.order==null?'':r.order)}" ${on?'':'disabled'} placeholder="auto"></label></div></div>
   <div class="tm-ctl"><div class="tm-vis" role="group" aria-label="Website visibility"><button type="button" data-set="Approved" data-id="${r.id}" class="${on?'on-show':''}">${ic('eye')}Show</button><button type="button" data-set="Hidden" data-id="${r.id}" class="${r.status==='Hidden'?'on-hide':''}">${ic('eye-off')}Hide</button></div>
    <div class="tm-mini">${goog?`${r.url?`<a class="icon-btn" href="${esc(r.url)}" target="_blank" rel="noopener" title="Open reviewer on Google" aria-label="Open on Google">${ic('external-link')}</a>`:''}<span class="tm-lock" title="Google reviews can't be edited, only shown or hidden">${ic('lock')}</span>`:`<button type="button" class="icon-btn" data-edit="${r.id}" title="Edit" aria-label="Edit">${ic('pencil')}</button><button type="button" class="icon-btn danger" data-del="${r.id}" title="Delete" aria-label="Delete">${ic('trash-2')}</button>`}</div></div></article>`}).join('')
  :`<div class="pm-none">${empty('search-x','No reviews found','Try a different search or filter.')}</div>`;icons()}
 /* ---- settings / import / manual ---- */
 const openSettings=()=>{const g=tmG();Modal.open({title:'Google reviews settings',size:'md',body:`<p class="hint mb-3">Paste your Google API key, press <b>Find my clinic</b>, pick your listing, save. Then use <b>Sync now</b>.</p>
  <div class="fld"><label class="lbl">Google API key</label><input class="input" id="gk" type="password" autocomplete="off" value="${esc(g.apiKey)}" placeholder="AIza…"><div class="hint">Create it in Google Cloud with <b>Places API (New)</b> enabled and restrict it to that API only. In this mode the key is stored in this browser, so use it only on a private admin computer.</div></div>
  <div class="fld mt-3"><label class="lbl">Search your clinic on Google</label><div class="flex gap-2"><input class="input" id="gq" value="${esc(gname()+' Pune')}"><button type="button" class="btn btn-ghost" id="gf">${ic('search')}Find my clinic</button></div><div id="gr" class="grid gap-2 mt-2"></div></div>
  <div class="fld mt-3"><label class="lbl">Google Place ID</label><input class="input" id="gp" value="${esc(g.placeId)}" placeholder="Filled automatically when you pick your clinic"></div>
  <details class="mt-4 tm-adv"${g.endpoint?' open':''}><summary>Advanced: use a server sync function instead (safer for production)</summary>
   <div class="fld mt-3"><label class="lbl">Sync URL</label><input class="input" id="ge" value="${esc(g.endpoint)}" placeholder="https://your-sync-function.example.com/reviews"><div class="hint">If set, this is used instead of the API key above. See <code>backend/google-reviews-sync</code>.</div></div>
   <div class="fld mt-3"><label class="lbl">Sync token <span class="hint" style="display:inline">(optional)</span></label><input class="input" id="gt" type="password" autocomplete="off" value="${esc(g.token)}"></div></details>`,
  footer:'<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ok">Save settings</button>',onMount(m){
   $('#gf',m).onclick=async()=>{const key=$('#gk',m).value.trim(),q=$('#gq',m).value.trim(),box=$('#gr',m);if(!key)return Toast.show('Paste your Google API key first.','error');if(!q)return Toast.show('Type your clinic name.','error');
    box.innerHTML='<p class="hint">Searching…</p>';try{const list=await tmFind(key,q);box.innerHTML=list.length?list.slice(0,5).map(p=>`<button type="button" class="tm-pick" data-pid="${esc(p.id)}"><b>${esc((p.displayName&&p.displayName.text)||'Place')}</b><small>${esc(p.formattedAddress||'')}</small></button>`).join(''):'<p class="hint">No place found. Try adding the area, for example “DISHA Clinic Kharadi Pune”.</p>'}catch(e){box.innerHTML='';Toast.show(e.message,'error')}};
   $('#gr',m).onclick=e=>{const b=e.target.closest('.tm-pick');if(!b)return;$('#gp',m).value=b.dataset.pid;[...$('#gr',m).children].forEach(x=>x.classList.toggle('on',x===b));Toast.show('Clinic selected. Press Save settings.')};
   $('#ok',m).onclick=()=>{const u=$('#ge',m).value.trim();if(u&&!/^https:\/\/|^http:\/\/localhost/.test(u))return Toast.show('The sync URL must start with https://','error');Object.assign(g,{apiKey:$('#gk',m).value.trim(),placeId:$('#gp',m).value.trim(),endpoint:u,token:$('#gt',m).value.trim()});C.save();Modal.close();Toast.show('Google settings saved.');draw()}}})};
 const openImport=()=>Modal.open({title:'Import Google reviews',size:'md',body:`<p class="hint mb-3">Paste the JSON from your sync function, or the raw response of the Google Places API (New) “place details” call. New reviews are added as <b>New</b> and stay hidden until you choose Show.</p><textarea class="input" id="ij" rows="10" placeholder='{"rating":4.9,"userRatingCount":124,"reviews":[…]}' style="font-family:ui-monospace,monospace;font-size:12.5px"></textarea>`,
  footer:'<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ok">Import</button>',onMount(m){$('#ok',m).onclick=()=>{let j;try{j=JSON.parse($('#ij',m).value)}catch(e){return Toast.show('That is not valid JSON.','error')}
   const n=tmNormalize(j);if(!n.reviews.length)return Toast.show('No reviews found in that JSON.','error');const r=tmApply(j);Modal.close();Toast.show(r.added+' new, '+r.updated+' updated'+(r.skipped?', '+r.skipped+' rating-only skipped':'')+'.');draw();bar()}}});
 const openManual=rec=>{const e=!!rec,r=rec||{name:'',rating:5,date:dayAgo(0),text:'',status:'Pending'};Modal.open({title:e?'Edit testimonial':'Add manual testimonial',size:'md',body:`<p class="hint mb-3">Use this only for genuine reviews you have the patient's consent to publish.</p>
  <div class="fld"><label class="lbl">Patient display name <span class="text-red-600">*</span></label><input class="input" id="mn" value="${esc(r.name)}"></div>
  <div class="grid grid-cols-3 gap-3 mt-3"><div class="fld"><label class="lbl">Rating</label><select class="input" id="mr">${[5,4,3,2,1].map(n=>`<option ${n===+r.rating?'selected':''}>${n}</option>`).join('')}</select></div><div class="fld"><label class="lbl">Review date</label><input class="input" type="date" id="md" value="${esc(r.date)}"></div><div class="fld"><label class="lbl">Status</label><select class="input" id="ms">${[['Approved','Show'],['Hidden','Hide'],['Pending','New']].map(([v,l])=>`<option value="${v}" ${v===r.status?'selected':''}>${l}</option>`).join('')}</select></div></div>
  <div class="fld mt-3"><label class="lbl">Review text <span class="text-red-600">*</span></label><textarea class="input" id="mt" rows="5">${esc(r.text)}</textarea></div>`,
  footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ok">${e?'Save changes':'Add testimonial'}</button>`,onMount(m){$('#ok',m).onclick=()=>{const name=$('#mn',m).value.trim(),text=$('#mt',m).value.trim();if(!name||!text)return Toast.show('Enter the name and the review text.','error');
   const v={name,text,rating:+$('#mr',m).value,date:$('#md',m).value||dayAgo(0),status:$('#ms',m).value};
   if(e)Object.assign(rec,v);else C.d.testimonials.unshift({id:'m'+uid(),source:'manual',image:'',photo:'',url:'',home:'No',service:'All pages',order:'',...v});
   Modal.close();save((e?'Edited':'Added')+' testimonial: '+name,e?'Testimonial updated.':'Testimonial added.')}}})};
 /* ---- events ---- */
 root.addEventListener('input',e=>{if(e.target.id==='tmQ'){st.q=e.target.value;draw()}});
 root.addEventListener('error',e=>{const i=e.target;if(i.tagName==='IMG'&&i.closest('.tm-av')){const row=i.closest('.tm-row'),r=find(row&&row.dataset.id);i.parentNode.textContent=tmInit(r&&r.name)}},true);
 root.addEventListener('change',e=>{const t=e.target;
  if(t.id==='tmSrc'){st.src=t.value;return draw()}
  const id=t.dataset.home||t.dataset.svc||t.dataset.ord,r=id&&find(id);if(!r)return;
  if(t.dataset.home)r.home=t.checked?'Yes':'No';else if(t.dataset.svc)r.service=t.value;else r.order=t.value===''?'':Math.max(0,+t.value||0);
  save('Updated testimonial options: '+r.name,'Draft saved.')});
 root.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;const d=t.dataset;
  if(t.id==='tmAdd'||t.id==='tmAdd2')return openManual();
  if(t.id==='tmSet'||t.id==='tmSet2')return openSettings();
  if(t.id==='tmImp')return openImport();
  if(t.id==='tmSync'){const g=tmG();if(!tmReady(g)){Toast.show('Add your Google API key and Place ID in Settings first.','error');return openSettings()}
   t.disabled=true;t.classList.add('is-busy');try{const r=await tmFetch();Toast.show(r.added?r.added+' new review'+(r.added>1?'s':'')+' fetched from Google.':'Up to date. No new reviews.');draw();bar()}catch(err){Toast.show(err.message,'error');t.disabled=false;t.classList.remove('is-busy')}return}
  if(d.f){st.f=d.f;return draw()}
  if(d.bulk){const list=C.d.testimonials.filter(r=>r.status==='Pending');if(await confirmBox((d.bulk==='Approved'?'Show':'Hide')+' all <b>'+list.length+'</b> new review'+(list.length>1?'s':'')+(d.bulk==='Approved'?' on the website? You can still hide any of them later.':'?'),{title:(d.bulk==='Approved'?'Show':'Hide')+' all new reviews?',ok:d.bulk==='Approved'?'Show all':'Hide all'})){list.forEach(r=>r.status=d.bulk);save('Bulk '+(d.bulk==='Approved'?'showed':'hid')+' '+list.length+' reviews',list.length+' review'+(list.length>1?'s':'')+(d.bulk==='Approved'?' set to show.':' hidden.'))}return}
  const r=find(d.id||d.edit||d.del);if(!r)return;
  if(d.set){if(r.status===d.set)return;r.status=d.set;if(d.set!=='Approved')r.home='No';save((d.set==='Approved'?'Showed':'Hid')+' review: '+r.name,d.set==='Approved'?'Review will show on the website after you publish.':'Review hidden.')}
  else if(d.edit)openManual(r);
  else if(d.del&&await confirmBox('Delete the testimonial from <b>'+esc(r.name)+'</b>?',{danger:true,ok:'Delete',title:'Delete testimonial?'})){C.d.testimonials=C.d.testimonials.filter(x=>x!==r);save('Deleted testimonial: '+r.name,'Testimonial deleted.')}});
 draw();bar();icons()};
/* ===== SEO Management (page list + live-preview editor) ===== */
M['seo-management']=root=>{
 const arr=C.d.seo,N=arr.length,KEEPD='your-domain.com';
 const grp=e=>/^svc:/.test(e.key)?'Services':/^blog:/.test(e.key)?'Blogs':'Pages';
 const GI={Pages:'file-text',Services:'stethoscope',Blogs:'newspaper'};
 const nameOf=e=>{const s=e.key.slice(e.key.indexOf(':')+1);if(/^svc:/.test(e.key))return C.svcName(s);if(/^blog:/.test(e.key)){const p=(C.d.posts||[]).find(x=>x.slug===s);return p?p.title:s}return e.label};
 const pathOf=e=>'/'+String(e.file||'').replace(/index\.html$/,'');
 const ln=s=>String(s||'').length;
 const tS=e=>{const n=ln(e.title);return!n?'bad':n<30||n>60?'warn':'ok'},dS=e=>{const n=ln(e.desc);return!n?'bad':n<70||n>160?'warn':'ok'};
 const stat=e=>tS(e)==='bad'||dS(e)==='bad'?'bad':tS(e)==='warn'||dS(e)==='warn'?'warn':'ok';
 const noidx=e=>/noindex/i.test(e.robots||'');
 const safe=s=>{try{return decodeURIComponent(s)}catch(x){return s}};
 const st={q:'',f:'all',tab:'search',key:safe((location.hash||'').slice(1))};
 if(!arr.some(e=>e.key===st.key))st.key=arr[0].key;
 const cur=()=>arr.find(e=>e.key===st.key);
 const show=u=>String(Content.tok(u)||'').replace(/\{\{siteUrl\}\}/g,KEEPD);
 const crumb=u=>show(u).replace(/^https?:\/\//,'').replace(/index\.html$/,'').replace(/\/$/,'').split('/').join(' › ');
 const host=u=>show(u).replace(/^https?:\/\//,'').split('/')[0];
 const cut=(s,n)=>s.length>n?s.slice(0,n-1).trimEnd()+'…':s;
 const ogSrc=v=>{if(!v)return'';const m=String(v).match(/assets\/img\/[^?#]+/);if(m)return Media.src(m[0]);return/^(data:|https?:)/.test(v)?v:''};
 const lens=(n,lo,hi)=>{const s=!n?'bad':n<lo||n>hi?'warn':'ok',pct=Math.min(100,Math.round(n/hi*100)),msg=!n?'Missing':n>hi?(n-hi)+' over the limit, may be cut off in search':n<lo?'A bit short, aim for '+lo+'–'+hi:'Good length';
  return`<div class="se-m ${s}"><i style="width:${pct}%"></i></div><div class="se-lt ${s}"><span>${msg}</span><b>${n}/${hi}</b></div>`};
 const serp=e=>`<div class="se-serp"><div class="se-su"><span class="se-fav">${esc((nameOf(e)||'D')[0])}</span><div><b>${esc(C.d.settings.name||'DISHA Clinic')}</b><small>${esc(crumb(e.canonical||'{{siteUrl}}/'+e.file))}</small></div></div><h4>${esc(cut(e.title||'Meta title will appear here',60))}</h4><p>${esc(cut(e.desc||'Meta description will appear here. Write 70–160 characters about what visitors will find on this page.',160))}</p></div>`;
 const og=e=>{const src=ogSrc(e.ogImage);return`<div class="se-og"><div class="se-ogi">${src?`<img src="${esc(src)}" alt="">`:`<span>${ic('image')}No image</span>`}</div><div class="se-ogt"><small>${esc(host(e.ogUrl||e.canonical||'{{siteUrl}}/'))}</small><b>${esc(cut(e.ogTitle||e.title||'Share title',70))}</b><p>${esc(cut(e.ogDesc||e.desc||'Share description',130))}</p></div></div>`};
 const fld=(l,c,h='',cls='')=>`<div class="fld ${cls}"><label class="lbl">${l}</label>${c}${h?`<p class="hint">${h}</p>`:''}</div>`;
 const searchTab=e=>`<div id="seSerp">${serp(e)}</div><div class="se-f">
  ${fld('Meta title',`<input class="input" data-f="title" value="${esc(e.title)}" maxlength="120" autocomplete="off"><div id="lenT">${lens(ln(e.title),30,60)}</div>`)}
  ${fld('Meta description',`<textarea class="input" rows="4" data-f="desc" maxlength="300">${esc(e.desc)}</textarea><div id="lenD">${lens(ln(e.desc),70,160)}</div>`)}
  ${fld('Search engine visibility',`<div class="se-vis"><button type="button" data-robots="index" class="${noidx(e)?'':'on'}">${ic('eye')}<span><b>Visible</b><small>Shown in Google results</small></span></button><button type="button" data-robots="noindex" class="${noidx(e)?'on':''}">${ic('eye-off')}<span><b>Hidden</b><small>Not shown in Google</small></span></button></div>`,'','se-full')}
  <details class="se-adv se-full"><summary>${ic('sliders-horizontal')}Advanced<span>Canonical URL</span></summary>${fld('Canonical URL',`<input class="input" data-f="canonical" value="${esc(e.canonical)}" autocomplete="off">`,'The page address search engines should treat as the main one. Page URLs themselves are fixed so existing links keep working.')}</details></div>`;
 const socialTab=e=>`<div id="seSoc">${og(e)}</div><div class="se-f">
  ${fld('Share title',`<input class="input" data-f="ogTitle" value="${esc(e.ogTitle)}" maxlength="120" autocomplete="off">`)}
  ${fld('Share description',`<textarea class="input" rows="4" data-f="ogDesc" maxlength="300">${esc(e.ogDesc)}</textarea>`)}
  ${fld('Share image',`<div class="se-img"><div class="se-thumb" id="seImg">${ogSrc(e.ogImage)?`<img src="${esc(ogSrc(e.ogImage))}" alt="">`:ic('image-plus')}</div><div class="se-imgc"><input class="input" data-f="ogImage" value="${esc(e.ogImage)}" placeholder="Image address" autocomplete="off"><div class="se-ia"><label class="btn btn-ghost btn-sm cursor-pointer">${ic('upload')}Upload image<input type="file" accept="image/*" hidden id="seUp"></label><button type="button" class="btn btn-ghost btn-sm" data-act="imgclr">${ic('trash-2')}Remove</button><button type="button" class="btn btn-ghost btn-sm" data-act="copy">${ic('copy')}Copy from search listing</button></div></div></div>`,'Shown when the page is shared on WhatsApp, Facebook or LinkedIn. Best size: 1200 × 630 px.','se-full')}
  <details class="se-adv se-full"><summary>${ic('sliders-horizontal')}Advanced<span>Share URL</span></summary>${fld('Share URL',`<input class="input" data-f="ogUrl" value="${esc(e.ogUrl)}" autocomplete="off">`)}</details></div>`;
 const grpHtml=()=>{const q=st.q.trim().toLowerCase();
  const rows=arr.filter(e=>(st.f==='all'||(st.f==='attn'?stat(e)!=='ok':grp(e)===st.f))&&(!q||(nameOf(e)+' '+e.file).toLowerCase().includes(q)));
  if(!rows.length)return`<div class="se-none">${ic('search-x')}<b>No pages found</b><small>Try another search or filter.</small></div>`;
  return['Pages','Services','Blogs'].map(g=>{const r=rows.filter(e=>grp(e)===g);return r.length?`<div class="se-gh">${g}<span>${r.length}</span></div>`+r.map(e=>`<button type="button" class="se-it ${e.key===st.key?'on':''}" data-k="${esc(e.key)}"><span class="se-dot ${stat(e)}" title="${{ok:'Looks good',warn:'Needs a look',bad:'Missing details'}[stat(e)]}"></span><span class="se-nm"><b>${esc(nameOf(e))}</b><small>${esc(pathOf(e))}</small></span>${noidx(e)?'<i class="se-tag">Hidden</i>':''}</button>`).join(''):''}).join('')};
 const drawList=()=>{$('#seL',root).innerHTML=grpHtml();
  const n=f=>f==='all'?N:f==='attn'?arr.filter(e=>stat(e)!=='ok').length:arr.filter(e=>grp(e)===f).length;
  $('#seC',root).innerHTML=[['all','All'],['attn','Needs attention'],['Pages','Pages'],['Services','Services'],['Blogs','Blogs']].map(([k,l])=>`<button type="button" data-chip="${k}" class="${st.f===k?'on':''}">${l}<span>${n(k)}</span></button>`).join('');
  const ok=t=>arr.filter(e=>t(e)==='ok').length;
  $('#seS',root).innerHTML=[['file-search','Pages',N,''],['heading','Titles in range',ok(tS)+'/'+N,'ok'],['align-left','Descriptions in range',ok(dS)+'/'+N,'ok'],['alert-triangle','Need attention',arr.filter(e=>stat(e)!=='ok').length,arr.some(e=>stat(e)!=='ok')?'warn':'ok']].map(([i,l,v,c])=>`<div class="se-stat ${c}"><span>${ic(i)}</span><div><b>${v}</b><small>${l}</small></div></div>`).join('');icons()};
 const main=()=>{const e=cur(),g=grp(e),i=arr.indexOf(e),nx=arr[i+1],pv=arr[i-1];
  $('#seM',root).innerHTML=`<header class="hb-head se-head"><div class="hb-ico">${ic(GI[g],'w-6 h-6')}</div><div class="hb-ttl"><span class="hb-eye">${g}</span><h2>${esc(nameOf(e))}</h2><p>${esc(pathOf(e))}</p></div><div class="se-seg"><button type="button" data-tab="search" class="${st.tab==='search'?'on':''}">${ic('search')}Search listing</button><button type="button" data-tab="social" class="${st.tab==='social'?'on':''}">${ic('share-2')}Social sharing</button></div></header>
  <div class="se-body" id="seB">${st.tab==='search'?searchTab(e):socialTab(e)}</div>
  <footer class="hb-foot se-foot"><button type="button" class="btn btn-ghost" data-nav="-1" ${pv?'':'disabled'}>${ic('arrow-left')}Previous page</button><span class="hb-pos">${i+1} / ${N}</span><button type="button" class="btn btn-primary" data-nav="1" ${nx?'':'disabled'}>Next page${ic('arrow-right')}</button></footer>`;icons()};
 root.innerHTML=`<div class="se">${pageHead('SEO Management','Search result and social sharing details of all '+N+' website pages. Changes are kept as a draft until you publish.')}${/\{\{siteUrl\}\}/.test(JSON.stringify(C.d.seo[0]))&&!/^https?:/.test(C.d.settings.siteUrl||'')?notice('The real website address is not set yet, so previews show <b>'+KEEPD+'</b>. Add it in <a class="underline font-semibold" href="website-settings.html">Website Settings</a>.'):''}
  <div class="se-stats" id="seS"></div>
  <div class="se-grid"><aside class="hb-card se-side"><div class="se-tools"><div class="search"><i data-lucide="search"></i><input class="input" id="seQ" placeholder="Search pages…" aria-label="Search pages" autocomplete="off"></div><div class="se-chips" id="seC"></div></div><div class="se-list" id="seL"></div></aside><section class="hb-card se-main" id="seM"></section></div></div>`;
 const pub=withPublish(root,'seo');let tm;
 const save=()=>{clearTimeout(tm);tm=setTimeout(()=>{C.save();pub.paint()},250)};
 const live=f=>{const e=cur();
  if(st.tab==='search'){$('#seSerp',root).innerHTML=serp(e);if(f==='title')$('#lenT',root).innerHTML=lens(ln(e.title),30,60);if(f==='desc')$('#lenD',root).innerHTML=lens(ln(e.desc),70,160)}
  else{$('#seSoc',root).innerHTML=og(e);if(f==='ogImage'){const s=ogSrc(e.ogImage);$('#seImg',root).innerHTML=s?`<img src="${esc(s)}" alt="">`:ic('image-plus');icons()}}
  drawList()};
 root.addEventListener('input',x=>{const t=x.target;if(t.id==='seQ'){st.q=t.value;$('#seL',root).innerHTML=grpHtml();icons();return}const f=t.dataset.f;if(!f)return;cur()[f]=t.value;live(f);save()});
 const go=k=>{st.key=k;history.replaceState(null,'',location.pathname+location.search+'#'+encodeURIComponent(k));drawList();main();const l=$('.se-it.on',root);l&&l.scrollIntoView({block:'nearest'})};
 root.addEventListener('click',x=>{const b=x.target.closest('button');if(!b||b.disabled)return;const d=b.dataset,e=cur();
  if(d.k)go(d.k);
  else if(d.chip){st.f=d.chip;drawList()}
  else if(d.tab){st.tab=d.tab;main()}
  else if(d.nav){const n=arr[arr.indexOf(e)+ +d.nav];if(n){go(n.key);const m=$('.se-head',root);m&&m.scrollIntoView({block:'nearest'})}}
  else if(d.robots){e.robots=d.robots==='noindex'?'noindex,nofollow':'index,follow';$$('[data-robots]',root).forEach(y=>y.classList.toggle('on',y.dataset.robots===d.robots));drawList();save();Toast.show(d.robots==='noindex'?'This page will be hidden from search engines after publishing.':'This page will be visible to search engines.')}
  else if(d.act==='imgclr'){e.ogImage='';main();drawList();save()}
  else if(d.act==='copy'){e.ogTitle=e.title;e.ogDesc=e.desc;main();save();Toast.show('Share title and description copied from the search listing.')}});
 root.addEventListener('change',x=>{if(x.target.id!=='seUp')return;const f=x.target.files[0];x.target.value='';f&&Media.upload(f,p=>{cur().ogImage='{{siteUrl}}/'+p;main();drawList();save()})});
 drawList();main();icons()};
/* ===== Website Settings ===== */
/* ===== Website Settings (clinic card + step-by-step editor, same look as the other modules) ===== */
const WS_ICON={id:'building-2',ct:'phone-call',hr:'clock-3',so:'share-2',nv:'menu',sd:'image'};
const WS_PH=/\{\{[^}]+\}\}|\.example\b|\[(?:add|paste|reviewer)/i;
M['website-settings']=root=>{const st=C.d.settings,G=SCHEMA.settings;
 const isPh=v=>typeof v==='string'&&WS_PH.test(v);
 const fillN=g=>g.f.filter(f=>f.k&&isPh(st[f.k])).length;
 const lp=pmLast('settings');
 const steps=G.map(g=>({id:g.id,label:g.label,icon:WS_ICON[g.id]||'settings',data:st,fields:g.f,fill:()=>fillN(g),
  sub:{id:()=>'Clinic name, logo, tagline and website address',ct:()=>'Phone, WhatsApp, e-mail, address and map',hr:()=>st.hours||'Opening hours, appointment slots and closed days',so:()=>'Links to your social media profiles',nv:()=>'Header service groups and footer links',sd:()=>'Image shown when a page is shared on social media'}[g.id]||(()=>'')}));
 svWizard(root,{unit:'settings',title:'Website Settings',subtitle:'Global values used across the website. Phone, WhatsApp, e-mail, address and map link appear everywhere they are needed. '+(lp?'Published '+fmtDate(lp):'Not published from here yet'),
  noBack:true,tabs:'',toggle:false,pvLabel:'Preview values',pubLabel:'Publish settings',steps,
  validate:()=>Ed.validate(G.flatMap(g=>g.f),st,'Settings'),preview:()=>Preview.show('Website Settings',Preview.fields(G.flatMap(g=>g.f),st))});
 icons()};
/* ===== hidden modules ===== */
M.products=root=>{root.innerHTML=pageHead('Products','')+`<div class="card"><div class="card-b">${empty('package','Products are managed in the Homepage Builder','The website has exactly two herbal products on the homepage. They are edited inside Homepage Builder → Herbal Products. No separate product pages exist.',`<a class="btn btn-primary mt-4" href="homepage-builder.html#herbal">Open Herbal Products</a>`)}</div></div>`;icons()};
M['theme-appearance']=root=>{root.innerHTML=pageHead('Theme & Appearance','')+`<div class="card"><div class="card-b">${empty('palette','Theme editing is switched off','The public website design is locked: colours, fonts and layout stay exactly as designed. Only content is managed from this CMS.',`<a class="btn btn-primary mt-4" href="dashboard.html">Back to dashboard</a>`)}</div></div>`;icons()};
/* ===== Dashboard: real data + notices ===== */
const dash=M.dashboard;M.dashboard=root=>{dash(root);const ph=C.placeholders().length;$('.db',root).insertAdjacentHTML('afterbegin',notice(`<b>Content is stored in this browser until the backend is built.</b> ${ph?`${ph} placeholder value(s) (e.g. e-mail, social links, reviews) still need approved content — see <a class="underline font-semibold" href="website-settings.html">Website Settings</a>.`:''}`));icons()};
})();
