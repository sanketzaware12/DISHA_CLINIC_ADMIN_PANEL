const fs=require('fs');
global.window=global;
const seed=JSON.parse(fs.readFileSync('content/disha-content-seed.json','utf8'));
global.Content={d:seed,p:seed};
global.DB={get:()=>[],set:()=>true};
eval(fs.readFileSync('assets/js/seo-existing.js','utf8').replace('window.SEO_EXISTING=','global.SEO_EXISTING='));
const code=fs.readFileSync('assets/js/seo-schema.js','utf8')+';global.L=SeoLogic;';
eval(code);
const L=global.L;
let bad=0;const t=(n,c)=>{console.log((c?'PASS ':'FAIL ')+n);if(!c)bad++};
// existing pages
const store={schema:{pages:{}}};
for(const pg of L.pages()){
  const blocks=(SEO_EXISTING[pg.key]||[]).map((o,i)=>({id:'b'+i,json:JSON.stringify(o,null,2),enabled:true,source:'existing',mode:'manual'}));
  const r=L.checkPage(pg,{enabled:true,blocks});
  console.log(pg.key.padEnd(58),r.status.padEnd(8),'err',r.errors,'warn',r.warnings,'missing',r.missing.join());
}
// generators
const h=L.gen.home();t('home gens 2 blocks',h.length===2);console.log(JSON.stringify(h[0].json));
const s=L.gen.svc(null,'svc:hernia-repair-surgery');console.log(JSON.stringify(s));
const b=L.gen.blog(null,'blog:hernia-symptoms-types-and-when-surgery-is-needed',{dateModified:'2026-11-20'});console.log(JSON.stringify(b));
t('svc valid',L.validate(JSON.stringify(s),{}).errors.length===0);
t('blog valid',L.validate(JSON.stringify(b),{}).errors.length===0);
t('bad json caught',L.validate('{a',{}).errors.length===1);
t('missing context',L.validate('{"@type":"Service","name":"x","provider":{"name":"y"}}',{}).errors.some(e=>/@context/.test(e)));
t('bad url',L.validate('{"@context":"https://schema.org","@type":"WebSite","name":"x","url":"htp:/nope"}',{}).errors.some(e=>/absolute URL/.test(e)));
t('bad date',L.validate('{"@context":"https://schema.org","@type":"BlogPosting","headline":"x","author":{"name":"a"},"publisher":{"name":"p"},"datePublished":"18 Nov 2026"}',{}).errors.some(e=>/ISO/.test(e)));
// duplicates
const dup=L.checkPage(L.pages()[0],{enabled:true,blocks:[{json:JSON.stringify(h[1].json),enabled:true},{json:JSON.stringify(h[1].json),enabled:true}]});
t('duplicate detected',dup.pageErrors.length>=1);
// robots
const R=L.robots;
t('recommended valid',R.validate(R.recommended()).errors.length===0);
t('disallow / blocked',R.validate('User-agent: *\nDisallow: /\n').errors.length>0);
t('disallow / authorised -> warn',R.validate('User-agent: *\nDisallow: /\n',{authorised:true}).errors.length===0);
t('blocks services',R.validate('User-agent: *\nDisallow: /services/\nSitemap: https://a.com/sitemap.xml').errors.some(e=>/important page/.test(e)));
t('blocks assets',R.validate('User-agent: *\nDisallow: /assets/\n').errors.some(e=>/CSS/.test(e)));
t('wildcard pdf ok',R.validate('User-agent: *\nDisallow: /*.pdf$\nSitemap: https://a.com/s.xml').errors.length===0);
t('rule before agent',R.validate('Disallow: /x\n').errors.length>0);
t('junk line',R.validate('User-agent: *\nhello\n').errors.length>0);
t('relative sitemap',R.validate('User-agent: *\nAllow: /\nSitemap: /sitemap.xml').errors.length>0);
// sitemap expected
const ex=L.sitemap.expected(null,{schema:{pages:{}}},true);console.log('include',ex.include.length,'exclude',ex.exclude.length);
t('21 urls',ex.include.length===21);
console.log(L.sitemap.xml(ex.include.slice(0,2)));
// tracking
const T=L.track;
t('ga ok',T.valid('ga','G-ABC123XYZ9'));t('ga bad',!T.valid('ga','UA-123'));
t('extract ga from snippet',T.extract('ga','<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9"></script><script>evil()</script>')==='G-ABC123XYZ9');
t('extract gsc',T.extract('gsc','<meta name="google-site-verification" content="abcDEF_123-abcDEF_123-abcDEF">')==='abcDEF_123-abcDEF_123-abcDEF');
t('gtm bad rejected',!T.valid('gtm','GTM-"><script>'));
const tr={ga:{enabled:true,id:'G-ABC123XYZ9'},gtm:{enabled:true,id:'GTM-ABCD12'},gsc:{enabled:false,code:''},bing:{enabled:false,code:''}};
const pl=T.plan(tr);t('plan head 2 + body 1',pl.head.length===2&&pl.body.length===1);t('double count warning',pl.warn.length===1);
console.log(T.status('gsc',{enabled:true,code:'abcDEF_123-abcDEF_123-abcDEF',confirmed:false}).label, T.status('ga',{enabled:false,id:''}).label, T.status('ga',{enabled:true,id:'bad'}).label);
console.log(bad?'FAILURES: '+bad:'ALL PASSED');
