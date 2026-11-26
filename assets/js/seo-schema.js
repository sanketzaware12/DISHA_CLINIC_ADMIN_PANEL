/* DISHA CMS – SEO logic (no UI): JSON-LD generators + validation, robots.txt, XML sitemap, tracking snippets, publish manifest.
   Everything here is pure data in / data out so it can be tested without the page. */
const SeoLogic=(()=>{
 const PLACE='https://www.dishaclinic.example';          /* the placeholder domain used by the website copy until the real one is set */
 const MON={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
 const cx=c=>c||Content.d;
 const isObj=o=>o&&typeof o==='object'&&!Array.isArray(o);
 const empty=v=>v==null||v===''||(Array.isArray(v)&&!v.length)||(isObj(v)&&!Object.keys(v).length);
 const clean=o=>{if(Array.isArray(o))return o.map(clean).filter(v=>!empty(v));if(isObj(o)){const r={};for(const k in o){const v=clean(o[k]);if(!empty(v)||k==='@context')r[k]=v}return r}return o};

 /* ---------- site address + token resolving ---------- */
 const base=c=>{const u=String(cx(c).settings.siteUrl||'');const ok=/^https?:\/\/[^\s{}]+$/i.test(u);return{url:ok?u.replace(/\/+$/,''):PLACE,placeholder:!ok}};
 const resolve=(s,c)=>{c=cx(c);let t=String(s).replace(/\{\{siteUrl\}\}/g,base(c).url);return t.replace(/\{\{(\w+)\}\}/g,(m,k)=>{const v=c.settings[k];return typeof v==='string'&&v&&v.indexOf('{{')<0?v:m})};
 const val=s=>{s=typeof s==='string'?s.trim():'';return s&&s.indexOf('{{')<0&&s!=='#'&&!/\.example\b/.test(s)?s:''};
 const iso=s=>{s=String(s||'').trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s;const m=s.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})$/);if(!m||!MON[m[2].toLowerCase()])return'';return m[3]+'-'+String(MON[m[2].toLowerCase()]).padStart(2,'0')+'-'+m[1].padStart(2,'0')};
 const abs=p=>{p=String(p||'').trim();if(!p||/^data:/i.test(p))return'';return/^(https?:|\{\{siteUrl\}\})/i.test(p)?p:'{{siteUrl}}/'+p.replace(/^\//,'')};
 const pathOf=f=>'/'+String(f||'').replace(/index\.html$/,'');
 const seoOf=(c,key)=>(cx(c).seo||[]).find(e=>e.key===key)||null;
 const canon=(c,key,path)=>{const e=seoOf(c,key);return e&&e.canonical?e.canonical:'{{siteUrl}}'+path};
 const sec=(sv,id)=>((sv&&sv.sections)||[]).find(s=>s.id===id);
 const typesOf=o=>{const t=o&&o['@type'];return Array.isArray(t)?t.filter(x=>typeof x==='string'):typeof t==='string'?[t]:[]};
 const safe=o=>JSON.stringify(o,null,2).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 const ld=o=>'<script type="application/ld+json">\n'+safe(o)+'\n</script>';

 /* ---------- managed pages: homepage, every service, every blog post ---------- */
 const pages=c=>{c=cx(c);const out=[{key:'home',kind:'home',name:'Homepage',path:'/'}];
  c.services.forEach(s=>out.push({key:'svc:'+s.slug,kind:'svc',name:s.name,path:'/services/'+s.slug+'/',rec:s}));
  c.posts.forEach(p=>out.push({key:'blog:'+p.slug,kind:'blog',name:p.title,path:'/blogs/'+p.slug+'/',rec:p}));return out};
 const others=()=>[['about','About Us','/about-us/'],['services','Services page','/services/'],['blogs','Blogs page','/blogs/'],['contact','Contact Us','/contact-us/'],['booking','Book Appointment','/book-appointment/'],['privacy','Privacy Policy','/privacy-policy/'],['terms','Terms & Conditions','/terms-and-conditions/']];
 const live=(pg,c)=>{c=cx(c);if(pg.kind==='home')return true;const rec=pg.kind==='svc'?c.services.find(s=>'svc:'+s.slug===pg.key):c.posts.find(p=>'blog:'+p.slug===pg.key);return!!rec&&rec.visible!==false&&(rec.status||'Published')==='Published'};
 const RECOMMENDED={home:[['WebSite'],['Organization'],['MedicalClinic','MedicalOrganization','LocalBusiness','Hospital','Physician']],svc:[['Service']],blog:[['BlogPosting','Article','NewsArticle']]};

 /* ---------- generators (only values that exist in the CMS / website; empty values are left out) ---------- */
 const areaOf=()=>{const h=((window.SEO_EXISTING||{}).home||[]).find(b=>typesOf(b).includes('MedicalClinic'));const a=h&&h.areaServed;return Array.isArray(a)?a.join(', '):typeof a==='string'?a:''};
 const orgRef=c=>({'@type':'MedicalClinic',name:cx(c).settings.name,url:'{{siteUrl}}/'});
 const gen={
  home(c){c=cx(c);const s=c.settings,social=(s.social||[]).map(x=>val(x.url)).filter(Boolean);
   return[{label:'Organization',json:clean({'@context':'https://schema.org','@type':'Organization','@id':'{{siteUrl}}/#organization',name:s.name,url:'{{siteUrl}}/',logo:abs(s.logo),description:s.about,telephone:val(s.phone),email:val(s.email),sameAs:social})},
          {label:'WebSite',json:clean({'@context':'https://schema.org','@type':'WebSite','@id':'{{siteUrl}}/#website',name:s.name,url:'{{siteUrl}}/',publisher:{'@id':'{{siteUrl}}/#organization'}})}]},
  svc(c,key,entry){c=cx(c);const slug=key.slice(4),sv=c.services.find(s=>s.slug===slug);if(!sv)return null;const se=seoOf(c,key)||{},hero=(sec(sv,'hero')||{}).data||{},L=sv.listing||{};
   return clean({'@context':'https://schema.org','@type':'Service',name:sv.name,description:se.desc||hero.short||L.d,url:canon(c,key,'/services/'+slug+'/'),serviceType:L.title||sv.name,provider:orgRef(c),image:abs(L.img),areaServed:areaOf()})},
  blog(c,key,entry){c=cx(c);const slug=key.slice(5),p=c.posts.find(x=>x.slug===slug);if(!p)return null;const se=seoOf(c,key)||{},url=canon(c,key,'/blogs/'+slug+'/'),dm=iso(entry&&entry.dateModified);
   return clean({'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.excerpt||se.desc,image:abs(p.hero_img||p.thumb),author:{'@type':'Person',name:p.author_name||p.author},publisher:{'@type':'Organization',name:c.settings.name,logo:{'@type':'ImageObject',url:abs(c.settings.logo)}},datePublished:iso(p.date),dateModified:dm,mainEntityOfPage:{'@type':'WebPage','@id':url},url})},
  breadcrumb(c,pg){const items=[['Home','{{siteUrl}}/']];if(pg.kind==='svc')items.push(['Services','{{siteUrl}}/services/']);if(pg.kind==='blog')items.push(['Blogs','{{siteUrl}}/blogs/']);if(pg.kind!=='home')items.push([pg.name,canon(c,pg.key,pg.path)]);
   return{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((x,i)=>({'@type':'ListItem',position:i+1,name:x[0],item:x[1]}))}},
  faq(c,pg){const sv=pg.kind==='svc'?cx(c).services.find(s=>'svc:'+s.slug===pg.key):null,items=((((sec(sv,'faq')||{}).data)||{}).items)||[];
   return{'@context':'https://schema.org','@type':'FAQPage',mainEntity:items.filter(i=>i.q&&i.a).map(i=>({'@type':'Question',name:i.q,acceptedAnswer:{'@type':'Answer',text:i.a}}))}}
 };
 /* "add what is missing, never change what is there" – used by the non-destructive upgrade */
 const addMissing=(ex,g)=>{let n=0;const walk=(a,b)=>{for(const k in b){if(!(k in a)||empty(a[k])){a[k]=b[k];n++}else if(isObj(a[k])&&isObj(b[k]))walk(a[k],b[k])}};walk(ex,g);return n};
 const template=(kind,pg,c,entry)=>{c=cx(c);
  if(kind==='Organization')return gen.home(c)[0].json;if(kind==='WebSite')return gen.home(c)[1].json;
  if(kind==='Service')return gen.svc(c,pg.key,entry)||{'@context':'https://schema.org','@type':'Service',name:'',provider:orgRef(c)};
  if(kind==='BlogPosting')return gen.blog(c,pg.key,entry)||{'@context':'https://schema.org','@type':'BlogPosting',headline:''};
  if(kind==='BreadcrumbList')return gen.breadcrumb(c,pg);if(kind==='FAQPage')return gen.faq(c,pg);
  return{'@context':'https://schema.org','@type':'Thing',name:''}};
 /* which generator belongs to a block type (blocks made by it can follow the content automatically) */
 const autoFor=(pg,t)=>pg.kind==='svc'&&t==='Service'?'svc':pg.kind==='blog'&&t==='BlogPosting'?'blog':null;

 /* ---------- JSON-LD validation ---------- */
 const REQ={Organization:{e:['name'],w:['url','logo']},MedicalClinic:{e:['name'],w:['url','address','telephone']},MedicalOrganization:{e:['name'],w:['url']},LocalBusiness:{e:['name'],w:['address']},Physician:{e:['name'],w:[]},
  WebSite:{e:['name','url'],w:[]},Service:{e:['name','provider'],w:['description','url','image','areaServed','serviceType']},
  BlogPosting:{e:['headline','author','publisher','datePublished'],w:['description','image','dateModified','mainEntityOfPage']},Article:{e:['headline','author','publisher','datePublished'],w:['description','image','dateModified']},
  FAQPage:{e:['mainEntity'],w:[]},BreadcrumbList:{e:['itemListElement'],w:[]}};
 const URLK=['url','image','logo','sameAs','hasMap','item','mainEntityOfPage'];
 const dateOk=s=>/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/.test(s)&&!isNaN(Date.parse(s.slice(0,10)));
 const validate=(text,ctx={})=>{const c=cx(ctx.c),r={errors:[],warnings:[],types:[],obj:null};let o;
  if(!String(text||'').trim()){r.errors.push('The JSON-LD is empty.');return r}
  try{o=JSON.parse(String(text))}catch(x){r.errors.push('Not valid JSON: '+x.message.replace(/^JSON\.parse: /,''));return r}
  if(!isObj(o)){r.errors.push('A schema block must be one JSON object, not '+(Array.isArray(o)?'a list':'a plain value')+'.');return r}
  r.obj=o;const ctxv=o['@context'],okc=typeof ctxv==='string'&&/^https?:\/\/schema\.org\/?$/.test(ctxv);
  if(!ctxv)r.errors.push('"@context" is missing. Use "https://schema.org".');else if(!okc)r.errors.push('"@context" should be "https://schema.org".');else if(/^http:/.test(ctxv))r.warnings.push('"@context" uses http. Prefer "https://schema.org".');
  const types=typesOf(o);r.types=types;if(!types.length)r.errors.push('"@type" is missing.');
  const graph=Array.isArray(o['@graph'])?o['@graph']:null;
  const need={e:new Set(),w:new Set()};types.forEach(t=>{const q=REQ[t];if(q){q.e.forEach(k=>need.e.add(k));q.w.forEach(k=>need.w.add(k))}});
  if(types.length&&!types.some(t=>REQ[t])&&!graph)r.warnings.push('"'+types.join(', ')+'" is not a type this panel checks, so only the syntax was verified.');
  need.e.forEach(k=>{if(empty(o[k]))r.errors.push('Required property "'+k+'" is missing or empty.')});
  need.w.forEach(k=>{if(empty(o[k])&&!need.e.has(k))r.warnings.push('Recommended property "'+k+'" is missing.')});
  ['author','publisher','provider'].forEach(k=>{if(isObj(o[k])&&empty(o[k].name)&&empty(o[k]['@id']))r.errors.push('"'+k+'" needs a "name".')});
  if(types.includes('FAQPage')&&Array.isArray(o.mainEntity))o.mainEntity.forEach((q,i)=>{if(!isObj(q)||empty(q.name)||!isObj(q.acceptedAnswer)||empty(q.acceptedAnswer.text))r.errors.push('FAQ question '+(i+1)+' needs a "name" and an "acceptedAnswer" with "text".')});
  if(types.includes('BreadcrumbList')&&Array.isArray(o.itemListElement))o.itemListElement.forEach((x,i)=>{if(!isObj(x)||empty(x.name)||typeof x.position!=='number')r.errors.push('Breadcrumb item '+(i+1)+' needs a "name" and a numeric "position".')});
  /* URLs (tokens such as {{siteUrl}} are resolved first) */
  let place=false,tok=new Set();const chk=(k,v)=>{if(typeof v==='string'){const u=resolve(v,c),m=u.match(/\{\{\w+\}\}/);if(m){tok.add(m[0]);return}
    if(!/^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/i.test(u))r.errors.push('"'+k+'" is not a valid absolute URL: '+v);else if(u.indexOf(PLACE)===0)place=true}
   else if(Array.isArray(v))v.forEach(x=>chk(k,x));else if(isObj(v)){['url','@id'].forEach(q=>{if(typeof v[q]==='string'&&(q==='url'||/^(https?:|\{\{siteUrl)/.test(v[q])))chk(k+'.'+q,v[q])})}};
  const walk=x=>{if(Array.isArray(x))return x.forEach(walk);if(!isObj(x))return;for(const k in x){if(URLK.includes(k))chk(k,x[k]);if(isObj(x[k])||Array.isArray(x[k]))walk(x[k])}};walk(o);
  if(place)r.warnings.push('URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.');
  if(tok.size)r.warnings.push('Still contains placeholder value(s) '+[...tok].join(', ')+'. Fill them in Website Settings or remove the property.');
  /* dates */
  ['datePublished','dateModified','foundingDate'].forEach(k=>{if(typeof o[k]==='string'&&o[k]&&!dateOk(o[k]))r.errors.push('"'+k+'" must be an ISO date such as 2026-11-18.')});
  if(o.datePublished&&o.dateModified&&dateOk(String(o.datePublished))&&dateOk(String(o.dateModified))&&o.dateModified<o.datePublished)r.warnings.push('"dateModified" is earlier than "datePublished".');
  if(/<\/?script/i.test(String(text)))r.warnings.push('Text contains "<script". It is escaped safely when published, but check that it is intended.');
  /* the schema must describe what visitors see */
  const pg=ctx.pg;if(pg&&pg.rec){const t=pg.kind==='svc'?pg.rec.name:pg.rec.title,n=o.name||o.headline;
   if((types.includes('Service')||types.includes('BlogPosting'))&&n&&t&&String(n).trim()!==String(t).trim())r.warnings.push('The name in this schema ("'+n+'") differs from the page title ("'+t+'"). Keep schema in step with the visible page.')}
  if(pg&&types.includes('FAQPage')&&pg.kind==='svc'){const cnt=gen.faq(c,pg).mainEntity.length;if(Array.isArray(o.mainEntity)&&cnt&&o.mainEntity.length!==cnt)r.warnings.push('The page shows '+cnt+' FAQs but this schema lists '+o.mainEntity.length+'. Use "Update from content" to match.')}
  return r};
 /* a whole page: block checks + duplicates + missing recommended types */
 const checkPage=(pg,entry,c)=>{c=cx(c);const out={blocks:[],pageErrors:[],pageWarnings:[],missing:[],status:'missing',types:[]};
  const bl=(entry&&entry.blocks)||[];const seen={},sig={};
  bl.forEach(b=>{const r=validate(b.json,{c,pg});out.blocks.push(r);if(b.enabled===false||!r.obj)return;r.types.forEach(t=>{seen[t]=(seen[t]||0)+1;out.types.push(t)});const s=JSON.stringify(r.obj);sig[s]=(sig[s]||0)+1});
  Object.keys(seen).forEach(t=>{if(seen[t]>1)out.pageErrors.push('Duplicate schema: '+seen[t]+' enabled blocks of type '+t+' on this page. Search engines may ignore or misread them.')});
  Object.keys(sig).forEach(s=>{if(sig[s]>1)out.pageErrors.push('Two enabled blocks are identical. Delete or disable one.')});
  (RECOMMENDED[pg.kind]||[]).forEach(opts=>{if(!opts.some(t=>out.types.includes(t)))out.missing.push(opts[0])});
  const errs=out.pageErrors.length+out.blocks.reduce((n,r)=>n+r.errors.length,0),warns=out.pageWarnings.length+out.blocks.reduce((n,r)=>n+r.warnings.length,0);
  out.errors=errs;out.warnings=warns;
  out.status=!bl.length?'missing':entry.enabled===false?'disabled':errs?'error':out.missing.length?'missing':warns?'warn':'ok';return out};

 /* ---------- robots.txt ---------- */
 const robots={
  recommended(c){return'User-agent: *\nAllow: /\n\nSitemap: '+base(c).url+'/sitemap.xml\n'},
  IMPORTANT:['/services','/blogs','/about-us','/contact-us','/book-appointment','/privacy-policy','/terms-and-conditions'],
  ASSETS:['/assets','/css','/js','/img','/images','/static','/fonts'],
  validate(text,o={}){const c=cx(o.c),r={errors:[],warnings:[],groups:[],sitemaps:[]};text=String(text||'');
   if(!text.trim()){r.errors.push('The file is empty. Use "Generate recommended" to start.');return r}
   if(new Blob([text]).size>512000)r.errors.push('The file is larger than 500 KiB. Google ignores anything after that limit.');
   if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text))r.errors.push('The file contains control characters. It must be plain text.');
   let g=null,expectAgent=false;const sev=o.authorised?r.warnings:r.errors,hit=[];
   text.replace(/^\uFEFF/,'').split(/\r?\n/).forEach((raw,i)=>{const ln=raw.replace(/#.*/,'').trim();if(!ln){expectAgent=false;return}
    const m=ln.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);if(!m){r.errors.push('Line '+(i+1)+': not a valid directive ("'+ln.slice(0,40)+'").');return}
    const k=m[1].toLowerCase(),v=m[2].trim();
    if(k==='user-agent'){if(!v)r.errors.push('Line '+(i+1)+': User-agent has no value.');if(!g||!expectAgent){g={agents:[],allow:[],disallow:[]};r.groups.push(g)}g.agents.push(v);expectAgent=true;return}
    expectAgent=false;
    if(k==='sitemap'){if(!/^https?:\/\/[^\s]+$/i.test(v))r.errors.push('Line '+(i+1)+': Sitemap must be a full URL starting with https://.');else r.sitemaps.push(v);return}
    if(k==='allow'||k==='disallow'){if(!g){r.errors.push('Line '+(i+1)+': "'+m[1]+'" appears before any User-agent line.');return}
     if(v&&!/^[\/*]/.test(v)){r.errors.push('Line '+(i+1)+': path "'+v+'" must start with "/" or "*".');return}(k==='allow'?g.allow:g.disallow).push({v,line:i+1});return}
    if(k==='crawl-delay'){r.warnings.push('Line '+(i+1)+': Crawl-delay is ignored by Google.');return}
    if(k==='host'||k==='noindex'){r.warnings.push('Line '+(i+1)+': "'+m[1]+'" is not a supported robots.txt directive.');return}
    r.errors.push('Line '+(i+1)+': unknown directive "'+m[1]+'".')});
   r.groups.forEach(gp=>{const star=gp.agents.some(a=>a==='*'||/googlebot|bingbot/i.test(a));if(!star)return;
    gp.disallow.forEach(d=>{if(!d.v)return;const p=d.v;const allowsRoot=gp.allow.some(a=>a.v==='/');
     if(p==='/'&&!allowsRoot)sev.push('Line '+d.line+': "Disallow: /" blocks the entire website from search engines.');
     else{const q=p.replace(/\*.*$/,'');robots.IMPORTANT.forEach(x=>{if((q.length>1&&x.indexOf(q)===0)||p.indexOf(x)===0)hit.push(['page',x,d.line])});
      robots.ASSETS.forEach(x=>{if(p.indexOf(x)===0||/\.(css|js|png|jpe?g|webp|svg|gif)\b/i.test(p)||/^\/\*/.test(p)&&/\.(css|js)/.test(p))hit.push(['asset',p,d.line])})}})});
   const seen={};hit.forEach(h=>{const k=h[0]+h[2];if(seen[k])return;seen[k]=1;sev.push('Line '+h[2]+': this rule '+(h[0]==='page'?'blocks an important page ('+h[1]+'). Service and blog pages must stay crawlable.':'blocks CSS, JavaScript or image files. Search engines need them to render the pages.'))});
   if(!r.sitemaps.length)r.warnings.push('No Sitemap line. Add "Sitemap: '+base(c).url+'/sitemap.xml".');
   else{const b=base(c);r.sitemaps.forEach(s=>{if(s.indexOf(b.url)!==0)r.warnings.push('Sitemap URL ('+s+') does not start with the website address ('+b.url+').')});if(b.placeholder)r.warnings.push('The website address is not set yet, so the placeholder domain is used. Set it in Website Settings.')}
   if(!r.groups.length&&!r.errors.length)r.errors.push('No User-agent line found.');return r}
 };

 /* ---------- XML sitemap ---------- */
 const xmlEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
 const norm=u=>{try{const x=new URL(u);return(x.origin+x.pathname.replace(/\/+$/,'')+x.search).toLowerCase()}catch(e){return String(u).toLowerCase().replace(/\/+$/,'')}};
 const SMNS='http://www.sitemaps.org/schemas/sitemap/0.9';
 const sitemap={
  /* last time the CMS itself published the page (a real recorded date). Nothing is guessed. */
  lastmod(key,store){store=store.d||store;const unit=key.indexOf('blog:')===0?'post:'+key.slice(5):key==='services'?'servicesPage':key==='blogs'?'blogsPage':key;
   if(key.indexOf('blog:')===0){const e=((store.schema.pages||{})[key]||{}).dateModified,d=iso(e);if(d)return d.slice(0,10)}
   const v=(DB.get('versions')||[]).find(x=>x.unit===unit&&x.action==='Published');return v&&v.date?String(v.date).slice(0,10):''},
  expected(c,store,withLastmod){c=cx(c);const include=[],exclude=[],seen={};
   const add=(key,label,path,type,skip)=>{const e=seoOf(c,key);let loc=resolve(e&&e.canonical?e.canonical:'{{siteUrl}}'+path,c);
    if(skip)return exclude.push({key,label,reason:skip});
    if(e&&/noindex/i.test(e.robots||''))return exclude.push({key,label,reason:'Set to hidden (noindex) in SEO Management'});
    if(!/^https?:\/\/[^\s/]+\.[^\s/]+/i.test(loc))return exclude.push({key,label,reason:'Invalid URL'});
    const n=norm(loc);if(seen[n])return exclude.push({key,label,reason:'Duplicate of another URL'});seen[n]=1;
    include.push({key,label,type,loc,lastmod:withLastmod?sitemap.lastmod(key,store):''})};
   add('home','Homepage','/','Page');others().forEach(o=>add(o[0],o[1],o[2],'Page'));
   c.services.forEach(s=>add('svc:'+s.slug,s.name,'/services/'+s.slug+'/','Service',s.visible===false?'Hidden in Services':(s.status||'Published')!=='Published'?'Draft, not published':''));
   c.posts.forEach(p=>add('blog:'+p.slug,p.title,'/blogs/'+p.slug+'/','Blog',p.visible===false?'Hidden in Blog Management':(p.status||'Published')!=='Published'?'Draft, not published':''));
   return{include,exclude}},
  xml(list){return'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="'+SMNS+'">\n'+list.map(u=>'  <url>\n    <loc>'+xmlEsc(u.loc)+'</loc>\n'+(u.lastmod?'    <lastmod>'+xmlEsc(u.lastmod)+'</lastmod>\n':'')+'  </url>').join('\n')+'\n</urlset>\n'},
  validate(text,o={}){const r={errors:[],warnings:[],urls:[],root:''};text=String(text||'');
   if(!text.trim()){r.errors.push('The sitemap is empty. Use "Generate sitemap" to build it.');return r}
   if(new Blob([text]).size>52428800)r.errors.push('The file is larger than 50 MB.');
   const doc=new DOMParser().parseFromString(text,'application/xml'),pe=doc.querySelector('parsererror');
   if(pe){r.errors.push('Not well-formed XML: '+pe.textContent.replace(/\s+/g,' ').trim().slice(0,160));return r}
   const root=doc.documentElement;r.root=root.localName;
   if(root.localName!=='urlset'&&root.localName!=='sitemapindex'){r.errors.push('The root element must be <urlset> (or <sitemapindex>), not <'+root.localName+'>.');return r}
   if(root.namespaceURI!==SMNS)r.errors.push('Missing the official namespace: xmlns="'+SMNS+'".');
   const kids=[...root.children].filter(n=>n.localName===(root.localName==='urlset'?'url':'sitemap'));
   if(!kids.length)r.errors.push('No <'+(root.localName==='urlset'?'url':'sitemap')+'> entries found.');
   if(kids.length>50000)r.errors.push('More than 50,000 entries. Split into several sitemaps and list them in a sitemap index.');
   const seen={};let place=false;
   kids.forEach((k,i)=>{const loc=(k.getElementsByTagNameNS(SMNS,'loc')[0]||k.getElementsByTagName('loc')[0]),lm=(k.getElementsByTagNameNS(SMNS,'lastmod')[0]||k.getElementsByTagName('lastmod')[0]);
    const u=loc?loc.textContent.trim():'',d=lm?lm.textContent.trim():'';
    if(!u){r.errors.push('Entry '+(i+1)+' has no <loc>.');return}
    if(!/^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/i.test(u)){r.errors.push('Entry '+(i+1)+': invalid URL "'+u.slice(0,80)+'".');return}
    if(u.length>2048)r.errors.push('Entry '+(i+1)+': URL longer than 2048 characters.');
    if(/\/(admin|login|dashboard|pages)\b|login\.html|\/wp-admin/i.test(new URL(u).pathname))r.errors.push('Entry '+(i+1)+': "'+u+'" looks like an admin or login URL. These must not be in the sitemap.');
    const n=norm(u);if(seen[n])r.errors.push('Duplicate URL: '+u);seen[n]=1;
    if(d&&!/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2}))?$/.test(d))r.errors.push('Entry '+(i+1)+': <lastmod> "'+d+'" is not a valid W3C date.');
    if(d&&Date.parse(d.slice(0,10))>Date.now()+864e5)r.warnings.push('Entry '+(i+1)+': <lastmod> is in the future.');
    if(u.indexOf(PLACE)===0)place=true;r.urls.push({loc:u,lastmod:d})});
   if(place)r.warnings.push('URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings, then generate again.');
   return r},
  /* compare a saved sitemap with what the published content says should be there */
  diff(text,exp){const have={};try{const doc=new DOMParser().parseFromString(text,'application/xml');if(!doc.querySelector('parsererror'))[...doc.getElementsByTagName('loc')].forEach(l=>have[norm(l.textContent.trim())]=l.textContent.trim())}catch(e){}
   const want={};exp.include.forEach(u=>want[norm(u.loc)]=u);
   return{missing:exp.include.filter(u=>!have[norm(u.loc)]),extra:Object.keys(have).filter(k=>!want[k]).map(k=>have[k])}}
 };

 /* ---------- tracking ---------- */
 const track={
  RE:{ga:/^G-[A-Z0-9]{6,12}$/,gtm:/^GTM-[A-Z0-9]{4,10}$/,gsc:/^[A-Za-z0-9_-]{20,100}$/,bing:/^[A-Fa-f0-9]{16,64}$/},
  LABEL:{ga:'Google Analytics',gsc:'Google Search Console',bing:'Bing Webmaster Tools',gtm:'Google Tag Manager'},
  /* accepts the bare value OR the snippet Google / Bing shows; only the identifier is kept, any other code in a pasted snippet is discarded */
  extract(k,text){text=String(text||'').trim();if(!text)return'';
   if(k==='ga'){const m=text.match(/G-[A-Z0-9]{6,12}/i);return m?m[0].toUpperCase():text.toUpperCase()}
   if(k==='gtm'){const m=text.match(/GTM-[A-Z0-9]{4,10}/i);return m?m[0].toUpperCase():text.toUpperCase()}
   const m=text.match(/content\s*=\s*["']([^"']+)["']/i);return m?m[1].trim():text},
  valid(k,v){return track.RE[k].test(String(v||''))},
  field:{ga:'id',gtm:'id',gsc:'code',bing:'code'},
  snippets(k,v){const e=xmlEsc;
   if(k==='ga')return{head:'<script async src="https://www.googletagmanager.com/gtag/js?id='+e(v)+'"></script>\n<script>\nwindow.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag(\'js\', new Date());\ngtag(\'config\', \''+e(v)+'\');\n</script>',body:''};
   if(k==='gtm')return{head:'<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':\nnew Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],\nj=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=\n\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);\n})(window,document,\'script\',\'dataLayer\',\''+e(v)+'\');</script>',body:'<noscript><iframe src="https://www.googletagmanager.com/ns.html?id='+e(v)+'"\nheight="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>'};
   if(k==='gsc')return{head:'<meta name="google-site-verification" content="'+e(v)+'">',body:''};
   return{head:'<meta name="msvalidate.01" content="'+e(v)+'">',body:''}},
  status(k,t){const v=t[track.field[k]];if(!v)return{label:'Not Configured',tone:'gray'};
   if(!track.valid(k,v))return{label:'Error',tone:'red'};
   if(!t.enabled)return t.everEnabled?{label:'Disabled',tone:'gray'}:{label:'Configured',tone:'gold'};
   if((k==='gsc'||k==='bing')&&!t.confirmed)return{label:'Verification Pending',tone:'gold'};
   return{label:'Enabled',tone:'green'}},
  /* what would be placed on the public pages: one tag per id, nothing for disabled or invalid entries */
  plan(tr){const head=[],body=[],warn=[],ids={};
   ['gsc','bing','gtm','ga'].forEach(k=>{const t=tr[k],v=t[track.field[k]];if(!t.enabled||!track.valid(k,v))return;const key=k+':'+v;if(ids[key]){warn.push(track.LABEL[k]+' is configured twice. Only one copy is used.');return}ids[key]=1;
    const s=track.snippets(k,v);head.push({id:key,kind:k,html:s.head});if(s.body)body.push({id:key,kind:k,html:s.body})});
   if(tr.ga.enabled&&tr.gtm.enabled&&track.valid('ga',tr.ga.id)&&track.valid('gtm',tr.gtm.id))warn.push('Google Analytics and Google Tag Manager are both on. If GA4 is also set up inside the GTM container, visits will be counted twice. Use one of them.');
   return{head,body,warn}}
 };

 /* ---------- everything the backend needs to publish, built from the PUBLISHED content ---------- */
 const manifest=(store,c)=>{store=store.d||store;c=cx(c);const out={version:1,generatedAt:new Date().toISOString(),siteUrl:base(c).url,placeholderDomain:base(c).placeholder,
   rules:{injectOnly:'public website pages',never:['admin panel','login page'],jsonLd:'serialize with JSON.stringify and escape < > &; never execute user script'},
   tracking:{head:[],bodyStart:[]},robots:{content:store.robots.content||''},sitemap:{content:store.sitemap.content||''},schema:{}};
  const plan=track.plan(store.tracking);out.tracking.head=plan.head.map(x=>({id:x.id,html:x.html}));out.tracking.bodyStart=plan.body.map(x=>({id:x.id,html:x.html}));
  pages(c).forEach(pg=>{const e=store.schema.pages[pg.key];if(!e||e.enabled===false||!live(pg,c))return;const list=[];
   (e.blocks||[]).forEach(b=>{if(b.enabled===false)return;let text=b.json;
    if(b.mode==='auto'){try{const t=typesOf(JSON.parse(text))[0],g=autoFor(pg,t);if(g){const o=gen[g](c,pg.key,e);if(o)text=JSON.stringify(o)}}catch(x){}}
    const r=validate(text,{c,pg});if(r.obj&&!r.errors.length)list.push(ld(JSON.parse(resolve(JSON.stringify(r.obj),c))))});
   if(list.length)out.schema[pg.path]=list});
  return out};

 return{PLACE,base,resolve,val,iso,abs,typesOf,safe,ld,clean,pages,others,live,gen,template,addMissing,autoFor,validate,checkPage,robots,sitemap,track,manifest,seoOf,canon,empty,xmlEsc,RECOMMENDED}
})();
