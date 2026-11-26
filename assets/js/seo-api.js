/* DISHA CMS – SEO tools: configuration store + API layer.
   Development mode  (SEO_API.mode = 'local'):  draft + published copy are kept in this browser only (keys disha:seoTools / disha:seoToolsPub).
   Production mode   (SEO_API.mode = 'remote'): every call goes to the endpoints below; see docs/SEO-API.md for request / response shapes.
   Nothing in 'local' mode reaches the live website. The UI reads SeoAPI.live() to say so honestly. */
window.SEO_API={
 mode:'local',                       /* change to 'remote' when the backend exists */
 base:'/api/seo',                    /* backend root, same origin, cookie / bearer auth handled by the backend */
 endpoints:{
  load:    {method:'GET',  path:'/config'},              /* -> {draft, published, files:{robots:{live,updatedAt}, sitemap:{live,updatedAt}}} */
  saveDraft:{method:'PUT', path:'/config/draft'},        /* body: draft config -> {ok, updatedAt} */
  publish: {method:'POST', path:'/config/publish'},      /* body: {manifest} -> {ok, publishedAt, written:{robots,sitemap,schema,tracking}} */
  robots:  {method:'PUT',  path:'/files/robots.txt'},    /* body: {content} -> {ok, url, updatedAt}  (writes /robots.txt on the live site) */
  sitemap: {method:'PUT',  path:'/files/sitemap.xml'},   /* body: {content} -> {ok, url, updatedAt}  (writes /sitemap.xml on the live site) */
  probe:   {method:'POST', path:'/files/probe'}          /* body: {url} -> {ok, status}  (server checks that the live URL answers) */
 }
};
const SeoStore={
 defaults(){return{v:1,
  schema:{pages:{}},
  robots:{content:'',fileName:'robots.txt',source:'none',updatedAt:null,authorised:false},
  sitemap:{content:'',fileName:'sitemap.xml',source:'none',updatedAt:null,opts:{lastmod:true}},
  tracking:{
   ga:{enabled:false,id:'',updatedAt:null},
   gsc:{enabled:false,code:'',confirmed:false,updatedAt:null},
   bing:{enabled:false,code:'',confirmed:false,updatedAt:null},
   gtm:{enabled:false,id:'',updatedAt:null}}}},
 d:null,p:null,
 /* deep-merge saved data over defaults so older saves keep working when fields are added */
 merge(def,sv){if(sv==null||typeof sv!=='object'||Array.isArray(def))return sv==null?def:sv;const o={...def};for(const k in sv)o[k]=(k in def&&def[k]&&typeof def[k]==='object'&&!Array.isArray(def[k]))?SeoStore.merge(def[k],sv[k]):sv[k];return o},
 load(){if(this.d)return this;this.d=this.merge(this.defaults(),DB.get('seoTools')||{});const p=DB.get('seoToolsPub');this.p=p?this.merge(this.defaults(),p):this.defaults();return this},
 save(){return DB.set('seoTools',this.d)},
 dirty(){return JSON.stringify(this.d)!==JSON.stringify(this.p)},
 touch(o){o.updatedAt=new Date().toISOString();return o}
};
const SeoAPI={
 live(){return SEO_API.mode==='remote'},
 async call(name,body){const e=SEO_API.endpoints[name];
  const r=await fetch(SEO_API.base+e.path,{method:e.method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  if(!r.ok)throw new Error('The server answered '+r.status+' for '+e.path);return r.json()},
 /* every method resolves {ok, local, message}; callers show message and never claim more than "local" allows */
 async saveDraft(){SeoStore.save();if(!this.live())return{ok:true,local:true};const r=await this.call('saveDraft',SeoStore.d);return{ok:!!r.ok,local:false}},
 async publish(manifest){const ok=DB.set('seoToolsPub',SeoStore.d);if(!ok)throw new Error('Browser storage is full or blocked.');SeoStore.p=JSON.parse(JSON.stringify(SeoStore.d));
  if(!this.live())return{ok:true,local:true};const r=await this.call('publish',{manifest});return{ok:!!r.ok,local:false,written:r.written||{}}},
 async putFile(kind,content){if(!this.live())return{ok:true,local:true};const r=await this.call(kind,{content});return{ok:!!r.ok,local:false,url:r.url}},
 async probe(url){if(!this.live())return{ok:false,local:true};try{const r=await this.call('probe',{url});return{ok:!!r.ok,local:false,status:r.status}}catch(x){return{ok:false,local:false,error:x.message}}}
};
SeoStore.load();
