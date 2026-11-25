/* DISHA CMS – content store (draft / published / versions), media, and the schema-driven section editor.
   Storage is localStorage ONLY until the backend phase. Keys: disha:content (draft), disha:contentPub (published snapshot). */
const clone=o=>JSON.parse(JSON.stringify(o));
const getp=(o,p)=>String(p).split('.').reduce((a,k)=>a==null?a:a[k],o);
const setp=(o,p,v)=>{const ks=String(p).split('.');let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null)a[ks[i]]={};a=a[ks[i]]}a[ks[ks.length-1]]=v};
const PHRE=/\[(?:add |Reviewer|Month|Paste|REVIEW|REPLACE)[^\]]*\]|dishaclinic\.example/;
Object.assign(BADGE,{'Unsaved changes':'red','Draft saved':'gold','Backend pending':'gray'});
const Content={d:null,p:null,
 load(){if(this.d)return this;const seed=window.SITE_CONTENT;let d=DB.get('content'),p=DB.get('contentPub');
  const strip=c=>{if(!c||!c.home||!Array.isArray(c.home.sections)||!Array.isArray(c.services))return false;
   c.home.sections=c.home.sections.filter(s=>s.id!=='conds');
   c.services.forEach(sv=>{sv.sections=(sv.sections||[]).filter(s=>!['compare','treatment','foods','prepare','prevention','reviews'].includes(s.id));
    sv.sections.forEach(s=>{if(s.id==='laser'&&s.data){delete s.data.good_t;delete s.data.good}})});
   (c.testimonials||[]).forEach(t=>{delete t.service});c.meta=c.meta||{};c.meta.ver=seed.meta.ver;return true};
  if(d&&p&&(d.meta||{}).ver==='1.0.1'&&(p.meta||{}).ver==='1.0.1'&&strip(d)&&strip(p)){DB.set('content',d);DB.set('contentPub',p)}
  if(!d||!p||(d.meta||{}).ver!==seed.meta.ver){d=clone(seed);p=clone(seed);DB.set('content',d);DB.set('contentPub',p)}
  this.d=d;this.p=p;return this},
 save(){return DB.set('content',this.d)},
 unitGet(c,u){if(u.startsWith('svc:'))return c.services.find(s=>s.slug===u.slice(4));if(u.startsWith('post:'))return c.posts.find(s=>s.slug===u.slice(5));return c[u]},
 unitSet(c,u,v){const k=u.startsWith('svc:')?'services':u.startsWith('post:')?'posts':null;
  if(k){const s=u.split(':')[1],i=c[k].findIndex(x=>x.slug===s);i<0?c[k].push(v):c[k][i]=v}else c[u]=v},
 dirty(u){return JSON.stringify(this.unitGet(this.d,u))!==JSON.stringify(this.unitGet(this.p,u))},
 status(u){return this.dirty(u)?'Draft':'Published'},
 unitLabel(u){const L={home:'Homepage',about:'About Us',contact:'Contact Us',booking:'Book Appointment',privacy:'Privacy Policy',terms:'Terms & Conditions',servicesPage:'Services page',blogsPage:'Blogs page',settings:'Website Settings',doctors:'Doctors',testimonials:'Testimonials',seo:'SEO'};
  if(L[u])return L[u];if(u.startsWith('svc:'))return 'Service: '+(this.unitGet(this.d,u)||{}).name;if(u.startsWith('post:'))return 'Blog: '+(this.unitGet(this.d,u)||{}).title;return u},
 log(desc,module,extra={}){const l=getList('versions');l.unshift({id:uid(),v:(l[0]?.v||0)+1,module,desc,by:(DB.get('profile')||{}).name||'Admin User',date:new Date().toISOString(),status:'Saved',...extra});
  let n=0;l.forEach(x=>{if(x.snap&&++n>12)delete x.snap});DB.set('versions',l.slice(0,80))},
 saveDraft(u){if(u.startsWith('post:'))Content.normPost(this.unitGet(this.d,u));if(!this.save())return false;this.log('Saved draft: '+this.unitLabel(u),this.unitLabel(u),{unit:u,action:'Draft'});return true},
 publish(u){if(u.startsWith('post:'))Content.normPost(this.unitGet(this.d,u));const prev=this.unitGet(this.p,u);this.unitSet(this.p,u,clone(this.unitGet(this.d,u)));if(!DB.set('contentPub',this.p)||!this.save())return false;
  this.log('Published: '+this.unitLabel(u),this.unitLabel(u),{unit:u,action:'Published',snap:prev?JSON.stringify(prev):''});return true},
 restore(v){this.unitSet(this.d,v.unit,JSON.parse(v.snap));this.save();this.log('Restored previous version to draft: '+this.unitLabel(v.unit),this.unitLabel(v.unit),{unit:v.unit,action:'Restored'})},
 export(which){const o=clone(which==='draft'?this.d:this.p);const b=new Blob([JSON.stringify(o,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='disha-content-'+which+'.json';document.body.appendChild(a);a.click();a.remove()},
 tok(s){if(typeof s!=='string'||s.indexOf('{{')<0)return s;const st=this.d.settings;return s.replace(/\{\{(\w+)\}\}/g,(m,k)=>st[k]!=null?st[k]:m)},
 svcName(slug){const s=this.d.services.find(x=>x.slug===slug);return s?s.name:slug},
 placeholders(){const out=[],c=this.d;const walk=(o,l)=>{if(typeof o==='string'){if(PHRE.test(o)&&!out.some(x=>x.where===l&&x.raw===o))out.push({where:l,raw:o,text:o.length>70?o.slice(0,70)+'…':o})}else if(Array.isArray(o))o.forEach(v=>walk(v,l));else if(o&&typeof o==='object')for(const k in o)walk(o[k],l)};
  walk(c.settings,'Website Settings');c.home.sections.forEach(s=>walk(s.data,'Homepage › '+SCHEMA.home.sections[s.id].label));c.about.sections.forEach(s=>walk(s.data,'About Us'));c.contact.sections.forEach(s=>walk(s.data,'Contact Us'));c.booking.sections.forEach(s=>walk(s.data,'Book Appointment'));
  c.services.forEach(sv=>sv.sections.forEach(s=>walk(s.data,'Service: '+sv.name)));c.doctors.forEach(x=>walk(x,'Doctors'));
  (c.settings.social||[]).forEach(s=>{if(s.url==='#')out.push({where:'Website Settings › Social links',text:s.label+' link is "#"'})});
  ['privacy','terms'].forEach(k=>{if(/REVIEW WITH LEGAL/.test(JSON.stringify(c[k])))out.push({where:k==='privacy'?'Privacy Policy':'Terms & Conditions',text:'Marked "[REVIEW WITH LEGAL/CLIENT]"'})});
  c.seo.forEach(x=>{if(PHRE.test(JSON.stringify(x)))out.push({where:'SEO: '+x.label,text:'Canonical / Open Graph URLs use the placeholder domain'})});
  return out}
};
Content.load();
/* Blog clean-up that runs on every load / preview / save: unique anchor ids for sections, default share buttons, author name without the stray initial */
Content.DEFAULT_SHARE=['WhatsApp','Facebook','LinkedIn'];
Content.normPost=function(p){if(!p)return p;
 if(typeof p.author==='string'&&typeof p.author_i==='string'&&p.author_i.length===1&&p.author.charAt(0)===p.author_i&&/^[A-Z][a-z]*\./.test(p.author.slice(1)))p.author=p.author.slice(1);
 if(!Array.isArray(p.share_btns))p.share_btns=Content.DEFAULT_SHARE.slice();
 if(!Array.isArray(p.sections))p.sections=[];
 const used=new Set();p.sections.forEach(s=>{if(s.id&&!used.has(s.id))used.add(s.id);else s.id=''});
 p.sections.forEach((s,i)=>{if(s.id)return;const base=slugify(s.h2)||'section-'+(i+1);let id=base,n=2;while(used.has(id))id=base+'-'+n++;s.id=id;used.add(id)});
 return p};
Content.normAll=function(){[this.d,this.p].forEach(c=>c&&(c.posts||[]).forEach(Content.normPost))};
Content.normAll();
/* ---- adapters so the original dashboard / header search keep working (read-only views of real content) ---- */
(function(){const C=Content;
 SEED.versions=()=>[];SEED.testimonials=()=>[];
 C.view={
  services:()=>C.d.services.map(s=>({id:s.slug,name:s.name,status:s.visible?'Active':'Inactive'})),
  blogs:()=>C.d.posts.map(p=>({id:p.slug,title:p.title,status:p.visible?'Published':'Draft',date:p.date,author:p.author,category:p.category})),
  pages:()=>[['Home','home'],['About Us','about'],['Services','servicesPage'],['Blogs','blogsPage'],['Contact Us','contact'],['Book Appointment','booking'],['Privacy Policy','privacy'],['Terms & Conditions','terms']].map(([n,u])=>({id:u,title:n,status:'Published'}))
   .concat(C.d.services.map(s=>({id:s.slug,title:s.name,status:s.visible?'Published':'Draft'})),C.d.posts.map(p=>({id:p.slug,title:p.title,status:p.visible?'Published':'Draft'}))),
  team:()=>C.d.doctors.map(x=>({id:x.id,name:x.name})),
  testimonials:()=>C.d.testimonials.map(x=>({id:x.id,name:x.name,text:x.text}))};
 C.homeInfo=()=>{const l=getList('versions').find(v=>v.unit==='home'&&v.action==='Published');return{status:C.dirty('home')?'Draft':'Published',updated:l?l.date:''}}})();
/* ---- Image upload helper (no media library module; uploads are stored with the content) ---- */
const Media={
 find(path){return Content.d.media.find(m=>m.path===path)},
 src(p){if(!p)return'';if(/^(data:|https?:)/.test(p))return p;const m=this.find(p);return m&&m.data?m.data:'../assets/site/'+p},
 upload(file,cb){compress(file,1400).then(r=>{const ext=r.type==='PNG'?'png':'jpg',base=slugify(file.name.replace(/\.[^.]+$/,''))||'image',path='assets/img/uploads/'+base+'-'+uid()+'.'+ext;
   Content.d.media.unshift({id:'m'+uid(),path,name:base+'.'+ext,type:r.type,size:Math.max(1,Math.round(r.src.length*.75/1024))+' KB',dim:r.w+'x'+r.h,category:'General',alt:'',data:r.src,uploaded:true});
   if(!Content.save()){Content.d.media.shift();return}cb(path)}).catch(()=>Toast.show('Could not read this image file.','error'))}
};
/* ---- Section editor engine ---- */
const URLOK=v=>!v||/^[\w:/#?&=%.\-{}+@~,;!*()'$]+$/.test(v);
const Ed={
 tidy:h=>sanitize(h).replace(/<p>(\s|&nbsp;|<br>)*<\/p>/g,''),
 TOOLS:[['formatBlock:p','P','Normal paragraph'],['formatBlock:h3','H','Sub-heading'],['bold','<b>B</b>','Bold'],['italic','<i>I</i>','Italic'],['underline','<u>U</u>','Underline'],['insertUnorderedList','\u2022','Bullet list'],['insertOrderedList','1.','Numbered list'],['formatBlock:blockquote','\u275D','Quote'],['createLink','\ud83d\udd17','Add link'],['unlink','\u26D3','Remove link'],['removeFormat','Tx','Clear formatting'],['undo','\u21B6','Undo'],['redo','\u21B7','Redo']],
 /* pasted text keeps only simple formatting (paragraphs, sub-heading, bold, italic, lists, links) */
 clean(html){const d=new DOMParser().parseFromString(html||'','text/html'),OK=/^(P|H3|UL|OL|LI|STRONG|EM|U|A|BR|BLOCKQUOTE)$/,MAP={B:'STRONG',I:'EM',H1:'H3',H2:'H3',H4:'H3',H5:'H3',H6:'H3',DIV:'P'};
  d.querySelectorAll('script,style,iframe,object,embed,meta,link,head,title').forEach(n=>n.remove());
  const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===8){c.remove();return}if(c.nodeType!==1)return;walk(c);const t=MAP[c.tagName]||c.tagName;if(!OK.test(t)){c.replaceWith(...c.childNodes);return}
   const e=d.createElement(t);if(t==='A'){const h=c.getAttribute('href')||'';if(/^(https?:|mailto:|tel:|#|\/)/i.test(h))e.setAttribute('href',h)}while(c.firstChild)e.appendChild(c.firstChild);c.replaceWith(e)})};walk(d.body);return d.body.innerHTML.replace(/<p>(\s|<br>)*<\/p>/g,'')},
 spec(fields,path){const seg=String(path).split('.').filter(s=>!/^\d+$/.test(s));let f=null,fl=fields;for(const s of seg){f=(fl||[]).find(x=>x.k===s);if(!f)return null;fl=f.f}return f},
 blank(fl,last,arr){if(arr)return fl.map(()=>'');const o=last?clone(last):{};fl.forEach(f=>{if(f.y==='note')return;o[f.k]=f.y==='rep'||f.y==='lines'||f.y==='paras'||f.y==='multi'||f.y==='days'?[]:f.y==='tog'?false:''});return o},
 opts(f){if(f.svc)return Content.d.services.map(s=>[s.slug,s.name]);if(f.posts||f.svcs)return null;return(f.opts||[]).map(o=>[o,o||'(default)'])},
 sib(path,k){return path.indexOf('.')<0?k:path.replace(/\.[^.]+$/,'')+'.'+k},
 one(f,root,path,open){const v=getp(root,path),y=f.y,req=f.r?'<span class="text-red-600"> *</span>':'';
  if(y==='note')return`<div class="md:col-span-2 hint !mt-0 flex gap-2 items-start rounded-xl bg-[#F3F9F5] p-3">${ic('info','w-4 h-4 shrink-0 mt-0.5')}<span>${esc(f.t)}</span></div>`;
  const full=['ta','paras','lines','img','rep','rich','tbl','multi','days'].includes(y)||f.full,wrap=i=>`<div class="fld ${full?'md:col-span-2':''}"><label class="lbl">${esc(f.l)}${req}</label>${i}${f.hint&&y!=='lines'?`<p class="hint">${esc(f.hint)}</p>`:''}</div>`,A=`data-p="${esc(path)}" data-y="${y}"`;
  const ph=Ed.isPH(v)?' ph-flag':'';
  if(y==='t'||y==='url')return wrap(`<input class="input${ph}" ${A} value="${esc(v)}" ${f.cats?'list="dl-cats"':''}>${Ed.isPH(v)?'<p class="hint !text-[#9A6B00]">Placeholder – replace with the approved value.</p>':''}`);
  if(y==='ta')return wrap(`<textarea class="input${ph}" rows="${f.rows||3}" ${A}>${esc(v)}</textarea>`);
  if(y==='paras')return wrap(`<textarea class="input${ph}" rows="${Math.max(5,(v||[]).length*3)}" ${A}>${esc((v||[]).join('\n\n'))}</textarea><p class="hint">Separate paragraphs with a blank line.</p>`);
  if(y==='lines')return wrap(`<textarea class="input${ph}" rows="${f.rows||Math.min(10,Math.max(3,(v||[]).length+1))}" ${A}>${esc((v||[]).join('\n'))}</textarea><p class="hint">${esc(f.hint||'One item per line.')}</p>`);
  if(y==='tbl'){const h=getp(root,Ed.sib(path,f.hk))||[];return wrap(`<textarea class="input" rows="${Math.max(5,(v||[]).length+3)}" ${A} data-hk="${f.hk}">${esc([h.join(' | '),...(v||[]).map(r=>r.join(' | '))].join('\n'))}</textarea><p class="hint">First line = column headings. One row per line, cells separated by " | ".</p>`)}
  if(y==='tog')return wrap(`<label class="switch"><input type="checkbox" ${A} ${v?'checked':''}><span></span></label>`);
  if(y==='sel'){const o=Ed.opts(f);return wrap(`<select class="input" ${A}>${o.map(([a,b])=>`<option value="${esc(a)}" ${String(v)===String(a)?'selected':''}>${esc(b)}</option>`).join('')}${v&&!o.some(x=>x[0]===v)?`<option selected value="${esc(v)}">${esc(v)}</option>`:''}</select>`)}
  if(y==='days')return wrap(`<div class="flex flex-wrap gap-3" ${A}>${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d,i)=>`<label class="flex items-center gap-1.5 text-sm"><input type="checkbox" data-day="${i}" ${(v||[]).includes(i)?'checked':''}>${d}</label>`).join('')}</div><p class="hint">Tick days the clinic is closed. Leave all unticked if open daily.</p>`);
  if(y==='multi'){const L=f.posts?Content.d.posts.filter(p=>p.slug!==Ed.self).map(p=>[p.slug,p.title]):Content.d.services.map(s=>[s.slug,s.name]);return wrap(`<div class="grid gap-1.5" ${A}>${L.map(([a,b])=>`<label class="flex items-center gap-2 text-sm"><input type="checkbox" data-val="${esc(a)}" ${(v||[]).includes(a)?'checked':''}>${esc(b)}</label>`).join('')}</div>`)}
  if(y==='img'){const nm=v?String(v).split('/').pop():'';return wrap(`<div class="imgfield ${v?'has':''}" ${A}><div class="imgprev ${v?'filled':''}">${v?`<img src="${esc(Media.src(v))}" alt="Preview"><span class="imgname" title="${esc(v)}">${ic('image','w-3 h-3')}${esc(nm)}</span>`:IMGEMPTY()}</div><div class="imgact"><label class="btn btn-ghost btn-sm cursor-pointer">${ic(v?'refresh-cw':'upload')}${v?'Replace image':'Upload image'}<input type="file" accept="image/*" hidden data-upl="${esc(path)}"></label>${v?`<button type="button" class="btn btn-ghost btn-sm danger" data-clr="${esc(path)}">${ic('trash-2')}Remove</button>`:''}</div></div>`)}
  if(y==='rich')return wrap(`<div class="editor-tb">${Ed.TOOLS.map(([c,l,t])=>`<button type="button" data-cmd="${c}" title="${t}" aria-label="${t}">${l}</button>`).join('')}</div><div class="editor" contenteditable="true" ${A}>${sanitize(v)}</div>`);
  if(y==='rep'){const arr=Array.isArray(v)?v:[];return`<div class="fld md:col-span-2"><label class="lbl">${esc(f.l)} <span class="text-[#60736B] font-normal">(${arr.length})</span></label><div class="rep" data-rep="${esc(path)}">${arr.map((it,i)=>{const p=path+'.'+i,t=f.title?String(getp(it,f.title)||'').slice(0,70):'';
   return`<details class="rep-item" data-k="${esc(p)}" ${open.has(p)||arr.length<=2?'open':''}><summary><span class="rn">${i+1}</span><b>${esc(t||'Item '+(i+1))}</b>${f.fixed?'':`<span class="rep-act"><button type="button" class="icon-btn" data-mv="-1" data-at="${p}" ${i?'':'disabled'} aria-label="Move up">${ic('chevron-up')}</button><button type="button" class="icon-btn" data-mv="1" data-at="${p}" ${i<arr.length-1?'':'disabled'} aria-label="Move down">${ic('chevron-down')}</button><button type="button" class="icon-btn danger" data-del="${p}" aria-label="Delete">${ic('trash-2')}</button></span>`}</summary><div class="grid md:grid-cols-2 gap-3 p-3">${f.arr?f.f.map((s,j)=>Ed.one({...s,k:String(j)},root,p+'.'+j,open)).join(''):f.f.map(s=>Ed.one(s,root,p+'.'+s.k,open)).join('')}</div></details>`}).join('')}${f.fixed?'':`<button type="button" class="btn btn-ghost btn-sm" data-add="${esc(path)}">${ic('plus')}Add item</button>`}</div></div>`}
  return''},
 isPH:v=>typeof v==='string'&&PHRE.test(v),
 mount(el,data,fields,o={}){const open=new Set(),root=data,ch=()=>{o.onChange&&o.onChange()};
  try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
  const render=()=>{el.innerHTML=`<div class="grid md:grid-cols-2 gap-4">${fields.map(f=>Ed.one(f,root,f.k,open)).join('')}</div>`;icons()};
  el.addEventListener('toggle',e=>{const k=e.target.dataset&&e.target.dataset.k;if(k)e.target.open?open.add(k):open.delete(k)},true);
  el.addEventListener('input',e=>{const t=e.target,p=t.dataset.p;if(!p)return;const y=t.dataset.y;let v;
   if(y==='tog')v=t.checked;else if(y==='rich')v=Ed.tidy(t.innerHTML);else if(y==='paras')v=t.value.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);else if(y==='lines')v=t.value.split('\n').map(s=>s.trim()).filter(Boolean);
   else if(y==='tbl'){const ls=t.value.split('\n').filter(s=>s.trim()),cells=l=>l.split('|').map(s=>s.trim());setp(root,Ed.sib(p,t.dataset.hk),ls.length?cells(ls[0]):[]);v=ls.slice(1).map(cells)}
   else if(y==='days'){return}else if(y==='multi'){return}else v=t.value;
   if(t.dataset.day!==undefined||t.dataset.val!==undefined)return;setp(root,p,v);t.classList.remove('err');ch()});
  el.addEventListener('change',e=>{const t=e.target;if(t.dataset.day!==undefined){const b=t.closest('[data-p]'),p=b.dataset.p;setp(root,p,[...b.querySelectorAll('[data-day]')].filter(x=>x.checked).map(x=>+x.dataset.day));ch()}
   else if(t.dataset.val!==undefined){const b=t.closest('[data-p]'),p=b.dataset.p;setp(root,p,[...b.querySelectorAll('[data-val]')].filter(x=>x.checked).map(x=>x.dataset.val));ch()}
   else if(t.dataset.upl){const f=t.files[0];t.value='';f&&Media.upload(f,pa=>{setp(root,t.dataset.upl,pa);ch();render()})}
   });
  el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
   if(b.dataset.cmd){e.preventDefault();let a,c=b.dataset.cmd;if(c.startsWith('formatBlock:')){a='<'+c.split(':')[1]+'>';c='formatBlock'}else if(c==='createLink'){a=prompt('Enter link URL (https://..., mailto:..., tel:... or #section)');if(!a)return;a=a.trim();if(!/^(https?:\/\/|mailto:|tel:|#|\.\.\/|\/)/i.test(a)){Toast.show('Link must start with https://, mailto:, tel: or #','error');return}}const ed0=b.closest('.fld').querySelector('.editor');ed0&&ed0.focus();document.execCommand(c,false,a);const ed=b.closest('.fld').querySelector('.editor');setp(root,ed.dataset.p,Ed.tidy(ed.innerHTML));ch();return}
   if(b.dataset.clr!==undefined){setp(root,b.dataset.clr,'');ch();render();return}
   if(b.dataset.add){const sp=Ed.spec(fields,b.dataset.add),arr=getp(root,b.dataset.add);arr.push(Ed.blank(sp.f,arr[arr.length-1],sp.arr));open.add(b.dataset.add+'.'+(arr.length-1));ch();render();return}
   if(b.dataset.del){const p=b.dataset.del,i=+p.split('.').pop(),pp=p.replace(/\.\d+$/,''),arr=getp(root,pp);confirmBox('Delete this item? You can still discard it by leaving without saving a draft.',{title:'Delete item?',danger:true,ok:'Delete'}).then(ok=>{if(ok){arr.splice(i,1);ch();render()}});return}
   if(b.dataset.mv){const p=b.dataset.at,i=+p.split('.').pop(),pp=p.replace(/\.\d+$/,''),arr=getp(root,pp),j=i+ +b.dataset.mv;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];ch();render()}});
  el.addEventListener('mousedown',e=>{if(e.target.closest('[data-cmd]'))e.preventDefault()});
  el.addEventListener('paste',e=>{const ed=e.target.closest&&e.target.closest('.editor');if(!ed)return;e.preventDefault();const cd=e.clipboardData,h=cd.getData('text/html'),t=cd.getData('text/plain');
   const out=h?Ed.clean(h):t.split(/\n{2,}/).map(x=>x.trim()).filter(Boolean).map(x=>'<p>'+esc(x).replace(/\n/g,'<br>')+'</p>').join('');document.execCommand('insertHTML',false,out);setp(root,ed.dataset.p,Ed.tidy(ed.innerHTML));ch()});
  el.addEventListener('click',e=>{const p=e.target.closest('.imgprev');if(p&&!p.classList.contains('filled')){const i=p.closest('.imgfield').querySelector('input[data-upl]');i&&i.click()}});
  el.addEventListener('dragover',e=>{const p=e.target.closest('.imgprev');if(p){e.preventDefault();p.classList.add('drag')}});
  el.addEventListener('dragleave',e=>{const p=e.target.closest('.imgprev');p&&p.classList.remove('drag')});
  el.addEventListener('drop',e=>{const p=e.target.closest('.imgprev');if(!p)return;e.preventDefault();p.classList.remove('drag');const f=[...e.dataTransfer.files].find(x=>/^image\//.test(x.type)),fl=p.closest('.imgfield');if(!f)return Toast.show('Please drop an image file.','error');Media.upload(f,pa=>{setp(root,fl.dataset.p,pa);ch();render()})});
  render();return{render}},
 /* validation: required, URL, returns list of messages */
 validate(fields,data,label,errs=[],base=''){fields.forEach(f=>{if(f.y==='note')return;const v=getp(data,f.k);
   if(f.y==='rep'&&Array.isArray(v)){v.forEach((it,i)=>f.arr?0:Ed.validate(f.f,it,label,errs,(base?base+' › ':'')+f.l+' #'+(i+1)))}
   else if(f.r&&!(Array.isArray(v)?v.length:String(v==null?'':v).trim()))errs.push(label+': '+(base?base+' › ':'')+f.l+' is required.');
   else if(f.y==='url'&&!URLOK(v))errs.push(label+': '+(base?base+' › ':'')+f.l+' has an invalid link.')});return errs},
 flat(){return SCHEMA}
};
document.head.insertAdjacentHTML('beforeend','<datalist id="dl-cats"></datalist>');
/* ---- generic preview (content only; the final site-styled preview arrives with the website-integration phase) ---- */
const Preview={
 val(f,v){const t=x=>esc(Content.tok(x));switch(f.y){case'img':return v?`<img src="${esc(Media.src(v))}" alt="" class="rounded-xl max-h-40 my-1">`:'<em class="text-[#60736B]">—</em>';
  case'lines':return v&&v.length?'<ul class="list-disc pl-5">'+v.map(x=>`<li>${t(x)}</li>`).join('')+'</ul>':'—';case'paras':return(v||[]).map(x=>`<p>${t(x)}</p>`).join('')||'—';
  case'rich':return`<div class="prose">${sanitize(Content.tok(v))}</div>`;case'tog':return v?'Yes':'No';case'multi':case'days':return esc((v||[]).join(', '))||'—';
  case'tbl':return'';default:return v===''||v==null?'<em class="text-[#60736B]">—</em>':t(v)}},
 fields(fields,data){return fields.filter(f=>f.y!=='note').map(f=>{const v=getp(data,f.k);
  if(f.y==='rep')return`<div class="mb-2"><b class="text-xs uppercase text-[#60736B]">${esc(f.l)}</b>${(v||[]).map((it,i)=>`<div class="pv-card !p-3 my-1.5">${f.arr?it.map(x=>esc(x)).join(' · '):Preview.fields(f.f,it)}</div>`).join('')}</div>`;
  if(f.y==='tbl'){const h=getp(data,f.hk)||[];return`<div class="mb-2"><b class="text-xs uppercase text-[#60736B]">${esc(f.l)}</b><div class="tbl-wrap"><table class="tbl"><thead><tr>${h.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${(v||[]).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`}
  return`<div class="mb-2"><b class="text-xs uppercase text-[#60736B]">${esc(f.l)}</b><div>${Preview.val(f,v)}</div></div>`}).join('')},
 secs(sections,sch){return sections.filter(s=>s.visible!==false).map(s=>`<div class="card mb-3"><div class="card-h"><h3>${esc(sch.sections[s.id].label)}</h3></div><div class="card-b">${Preview.fields(sch.sections[s.id].f,s.data)}</div></div>`).join('')},
 show(title,html){Modal.open({title:'Preview: '+title,size:'xl',body:`<div class="notice">${ic('info')}<div>Content preview with the draft values. Fonts and layout of the real website are applied once the website-integration phase is done.</div></div>${html}`,footer:'<button class="btn btn-ghost" data-close>Close preview</button>'})}
};
/* ---- page chrome: Preview / Save Draft / Publish ---- */
const Page={
 /* Preview / Save Draft / Publish now live in the top header of every page (see TB); nothing is rendered inside the page body. */
 buttons(){return''},
 tbHtml(){return`<span id="stb"></span><button type="button" class="btn btn-ghost btn-sm" data-pg="pv" title="Preview this page">${ic('eye')}<span class="tb-l">Preview</span></button><button type="button" class="btn btn-ghost btn-sm" data-pg="sd" title="Save draft">${ic('save')}<span class="tb-l">Save Draft</span></button><button type="button" class="btn btn-primary btn-sm tb-pub" data-pg="pb" title="Publish">${ic('rocket')}<span class="tb-l">Publish</span></button>`},
 TB(html,run){const old=$('#hbTop');if(old)old.remove();const tb=document.createElement('div');tb.className='tb-pg';tb.id='hbTop';tb.innerHTML=html;const add=$('#ddAdd');add?add.before(tb):$('.topbar').appendChild(tb);tb.addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(b)run(b.dataset.pg)});icons();return tb},
 wire(root,o){let dirty=false;const badgeEl=()=>$('#stb',root)||$('#stb');
  const paint=()=>{const b=badgeEl();if(b)b.innerHTML=badge(dirty?'Unsaved changes':Content.dirty(o.unit)?'Draft saved':'Published')};
  const check=()=>{const errs=o.validate?o.validate():[];if(errs.length){Modal.open({title:'Please fix these first',size:'sm',body:'<ul class="list-disc pl-5 grid gap-1">'+errs.slice(0,12).map(e=>`<li>${esc(e)}</li>`).join('')+'</ul>'+(errs.length>12?`<p class="hint">…and ${errs.length-12} more.</p>`:''),footer:'<button class="btn btn-primary" data-close>OK</button>'});return false}return true};
  const run=async act=>{
   if(act==='pv')return Preview.open(o.unit,o.preview);
   if(!check())return;
   if(act==='sd'){if(Content.saveDraft(o.unit)){dirty=false;paint();Toast.show('Draft saved in this browser. The live website is not changed.')}}
   else if(await confirmBox('Mark <b>'+esc(Content.unitLabel(o.unit))+'</b> as published? Until the backend is connected this only updates the published copy stored in this browser; the real website does not change yet.',{title:'Publish?',ok:'Publish'})){if(Content.publish(o.unit)){dirty=false;paint();Toast.show('Marked as published (stored in this browser).')}}};
  root.addEventListener('click',e=>{const b=e.target.closest('#sd,#pb,#pv,[data-pg]');if(b)run(b.id||b.dataset.pg)});
  addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});Page.TB(Page.tbHtml(),run);paint();
  return{changed(){dirty=true;paint()},paint,run}}
};

/* Same Preview / Save Draft / Publish header for pages that manage several records (Services, Blogs, Page Management, Testimonials, SEO).
   o = { ok:'All published', units:()=>[unit ids], preview:()=>{}, after:()=>{} } */
Page.multi=function(o){
 const paint=()=>{const n=o.units().filter(u=>Content.dirty(u)).length,b=$('#stb');if(b)b.innerHTML=n?`<span class="badge b-gold">${n} draft${n>1?'s':''} to publish</span>`:`<span class="badge b-green">${o.ok}</span>`};
 const run=async act=>{
  if(act==='pv')return o.preview&&o.preview();
  if(act==='sd'){paint();return Toast.show('Everything here is saved as a draft automatically. Use Publish when you are ready.')}
  const us=o.units().filter(u=>Content.dirty(u));
  if(!us.length)return Toast.show('Nothing to publish. Everything is up to date.');
  if(await confirmBox('Mark <b>'+us.length+' item'+(us.length>1?'s':'')+'</b> as published? Until the backend is connected this only updates the published copy stored in this browser; the real website does not change yet.',{title:'Publish changes?',ok:'Publish'})){us.forEach(u=>Content.publish(u));Toast.show('Marked as published (stored in this browser).');paint();o.after&&o.after()}};
 Page.TB(Page.tbHtml(),run);paint();return{paint}};

/* ---- Site-styled preview: the real website page (copy in assets/site) opens in a frame and the draft edits are applied to it ---- */
Preview.FILE={home:'index.html',about:'about-us/index.html',contact:'contact-us/index.html',booking:'book-appointment/index.html',privacy:'privacy-policy/index.html',terms:'terms-and-conditions/index.html',servicesPage:'services/index.html',blogsPage:'blogs/index.html',settings:'index.html',testimonials:'index.html'};
Preview.file=u=>{const B=window.SITE_CONTENT,rec=Content.unitGet(Content.d,u);if(u.startsWith('svc:'))return 'services/'+(rec&&rec.isNew?B.services[0].slug:u.slice(4))+'/index.html';if(u.startsWith('post:'))return 'blogs/'+(rec&&rec.isNew?B.posts[0].slug:u.slice(5))+'/index.html';return Preview.FILE[u]};
Preview.SKIP=['visible','status','order','isNew','slug','id','ico','gold','related','wa_msg','map','embed','listing','link','robots','featured'];
Preview.SUB=['phone','phoneDisplay','whatsapp','email','address','mapsLink'];
Preview.build=function(u){const C=Content,BASE=window.SITE_CONTENT||C.p,d=C.unitGet(C.d,u),p=C.unitGet(BASE,u)||(u.startsWith('svc:')?BASE.services[0]:u.startsWith('post:')?BASE.posts[0]:undefined),sd=C.d.settings,sp=BASE.settings,pairs=[],hides=[],st={added:0,order:false};
 const rs=(x,s)=>typeof x==='string'?x.replace(/\{\{(\w+)\}\}/g,(m,k)=>s[k]!=null?s[k]:m):x,isImg=x=>typeof x==='string'&&/^assets\/img\//.test(x);
 const walk=(a,b,scope,key,obj)=>{
  if(typeof a==='string'&&typeof b==='string'){if(a===b||!b)return;
   if(key==='html'&&obj&&obj.id!==undefined){pairs.push({rich:1,kind:u.startsWith('post:')?'sec':'legal',id:obj.id,n:Content.tok(a)});return}
   if(key==='intro_html'){pairs.push({rich:1,kind:'intro',n:Content.tok(a)});return}
   if(isImg(b)){const m=Media.find(a);pairs.push({o:b,n:m&&m.data?m.data:a,img:1,scope});return}
   const o=rs(b,sp),n=rs(a,sd);if(o!==n)pairs.push({o,n,scope});return}
  if(Array.isArray(a)&&Array.isArray(b)){if(a.length!==b.length){const lv=(o,t,out=[])=>{if(typeof o==='string'){if(!isImg(o))out.push(rs(o,t))}else if(Array.isArray(o))o.forEach(v=>lv(v,t,out));else if(o&&typeof o==='object')for(const k in o)if(!Preview.SKIP.includes(k))lv(o[k],t,out);return out},
   hasHtml=x=>x&&typeof x==='object'&&!Array.isArray(x)&&'html' in x,real=l=>l.some(v=>String(v).trim());
   if(b.length&&!b.some(hasHtml)&&!a.some(hasHtml)&&b.every(x=>real(lv(x,sp)))){const w=lv(b[b.length-1],sp).length;pairs.push({rep:1,scope,o:b.map(x=>lv(x,sp)),n:a.map(x=>lv(x,sd).slice(0,Math.max(w,1)))});return}
   st.added+=Math.abs(a.length-b.length)}
  for(let i=0;i<Math.min(a.length,b.length);i++)walk(a[i],b[i],scope,key,a[i]);return}
  if(a&&b&&typeof a==='object'&&typeof b==='object')for(const k in a){if(k in b&&!Preview.SKIP.includes(k))walk(a[k],b[k],scope,k,a)}};
 /* global values (phone, e-mail, address…) always reflect the draft */
 Preview.SUB.forEach(k=>{if(sd[k]!==sp[k]&&sp[k])pairs.push({o:sp[k],n:sd[k],mode:'sub'})});
 const sch=u==='home'?SCHEMA.home:u==='about'?SCHEMA.about:u==='contact'?SCHEMA.contact:u==='booking'?SCHEMA.booking:u.startsWith('svc:')?SCHEMA.service:u==='servicesPage'?SCHEMA.servicesPage:null;
 if(u==='settings'){['name','short','subtitle','about','hours','callAhead','year'].forEach(k=>walk(sd[k],sp[k],null,k,sd));(sd.social||[]).forEach((x,i)=>walk(x,(sp.social||[])[i]||x,null,'social',x))}
 else if(u.startsWith('post:')&&d){Content.normPost(d)}
 else if(u.startsWith('svc:')&&d&&Array.isArray(d.sections)){/* the service page is rebuilt from the draft (see servicePage in preview-bridge.js), nothing is patched */}
 else if(!p||u==='testimonials'){}
 else if(sch&&Array.isArray(d.sections)){
  if(d.sections.map(s=>s.id).join()!==p.sections.map(s=>s.id).join())st.order=true;
  d.sections.forEach(s=>{const b=p.sections.find(x=>x.id===s.id),def=sch.sections[s.id];if(!b||!def)return;walk(s.data,b.data,def.sel,'',s.data);
   if(s.visible===false&&b.visible!==false)hides.push({sel:def.sel,h2:rs(b.data.h2||b.data.h1||b.data.h1a||'',sp)})});
  ['name','visible'].forEach(()=>{});if(u.startsWith('svc:'))walk(d.name,p.name,null,'name',d)}
 else if(u==='servicesPage'){Object.keys(d).forEach(k=>walk(d[k],p[k],SCHEMA.servicesPage.sections[k].sel,k,d))}
 else walk(d,p,u==='privacy'||u==='terms'?'.prose':null,'',d);
 /* cards built from CMS records: services, blog articles, patient reviews */
 const cards={},imgOf=x=>{const m=x&&Media.find(x);return m&&m.data?m.data:x},tk=x=>Content.tok(x==null?'':x);
 if(u==='home'||u==='servicesPage')cards.services=C.d.services.slice().sort((a,b)=>(a.order||0)-(b.order||0)).filter(s=>s.visible||('svc:'+s.slug===u)).map(s=>({slug:s.slug,isNew:!!s.isNew,title:tk(s.listing.title||s.name),d:tk(s.listing.d),img:imgOf(s.listing.img),alt:tk(s.listing.alt),badge:tk(s.listing.badge),more:tk(s.listing.more)}));
 if(u==='blogsPage')cards.posts=C.d.posts.filter(x=>x.visible).map(x=>({slug:x.slug,isNew:!!x.isNew,category:x.category,featured:!!x.featured,date:tk(x.date),read:tk(x.read),title:tk(x.title),excerpt:tk(x.excerpt),author:tk(x.card_author||x.author),initial:x.author_i,thumb:imgOf(x.thumb),thumb_alt:tk(x.thumb_alt),btn:tk(x.card_btn),flabel:tk(x.featured_label)}));
 if(u==='home'||u==='testimonials'){const mon=x=>{const t=new Date(x);return isNaN(t)?(x||''):t.toLocaleDateString('en-GB',{month:'long',year:'numeric'})};
  cards.reviews=(C.d.testimonials||[]).filter(r=>r.status==='Approved'&&r.home!=='No').sort((a,b)=>(+a.order||999)-(+b.order||999)).map(r=>({name:r.name,rating:r.rating,text:r.text,source:r.source,when:mon(r.date)}))}
 let article=null;
 if(u.startsWith('post:')&&d){const sn=C.d.settings||{},pi=x=>{const m=x&&Media.find(x);return m&&m.data?m.data:(x||'')},site=String(sn.siteUrl||'').replace(/\/+$/,'');
  article={title:tk(d.title),cat:tk(d.category),sub:tk(d.sub),author:tk(d.author),author_i:d.author_i||'',date:tk(d.date),read:tk(d.read),hero_img:pi(d.hero_img),hero_alt:tk(d.hero_alt),lead:tk(d.lead),intro_html:sanitize(tk(d.intro_html||'')),
   sections:(d.sections||[]).map(x=>({id:x.id,h2:tk(x.h2),alert:!!x.alert,html:sanitize(tk(x.html||''))})),
   note_pre:tk(d.note_pre),note_link:tk(d.note_link),note_post:tk(d.note_post),note_svc:d.note_service||'',share_t:tk(d.share_t),share:(d.share_btns||[]).slice(),url:site+'/blogs/'+d.slug+'/',
   author_name:tk(d.author_name),author_cred:tk(d.author_cred),toc_t:tk(d.toc_t),cta_t:tk(d.cta_t),cta_p:tk(d.cta_p),cta_btns:(d.cta_btns||[]).map(tk),
   rel_t:tk(d.rel_t),related:(d.related||[]).map(sl=>C.d.posts.find(x=>x.slug===sl)).filter(Boolean).map(x=>({slug:x.slug,isNew:!!x.isNew,title:tk(x.title),thumb:pi(x.thumb)})),
   band_h2:tk(d.band_h2),band_p:tk(d.band_p),band_btns:(d.band_btns||[]).map(tk),wa:sn.whatsapp||'',phone:sn.phone||''}}
 let service=null;
 if(u.startsWith('svc:')&&d&&Array.isArray(d.sections)){const sn=C.d.settings||{},imgs=['img'],deep=(o,k)=>typeof o==='string'?(imgs.includes(k)?imgOf(o):tk(o)):Array.isArray(o)?o.map(v=>deep(v,k)):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).map(([kk,v])=>[kk,kk==='ico'?v:deep(v,kk)])):o;
  service={name:tk(d.name||''),sections:d.sections.map(x=>({id:x.id,visible:x.visible!==false,d:deep(x.data||{},'')})),settings:{name:sn.name||'',phone:sn.phone||'',phoneDisplay:sn.phoneDisplay||sn.phone||'',whatsapp:sn.whatsapp||'',waText:sn.waText||'',hours:sn.hours||'',address:sn.address||'',mapsLink:sn.mapsLink||''}}}
 return{pairs,hides,st,cards,article,service}};
Preview.open=function(u,fb){const rec=Content.unitGet(Content.d,u),f=Preview.file(u);if(!f||!rec)return fb&&fb();Preview.site(u,f)};
Preview.site=function(u,f){const B=Preview.build(u);let sent=false;
 const onmsg=e=>{const fr=$('#pvf');if(!fr){removeEventListener('message',onmsg);return}if(e.source!==fr.contentWindow)return;const m=e.data||{};
  if(m.t==='ready'&&!sent){sent=true;fr.contentWindow.postMessage({t:'apply',pairs:B.pairs,hides:B.hides,cards:B.cards,post:B.article,service:B.service},'*')}
  else if(m.t==='done'){const x=[];x.push(m.ok+' change(s) applied');if(m.miss.length)x.push(m.miss.length+' edit(s) could not be located on this page');if(B.st.added)x.push(B.st.added+' added/removed item(s) show only after publishing');if(B.st.order)x.push('section order is not previewed');$('#pvs').textContent='Real website page with your draft values · '+x.join(' · ')}};
 addEventListener('message',onmsg);
 Modal.open({title:'Preview: '+Content.unitLabel(u),size:'full',body:`<div class="flex flex-wrap items-center gap-2 mb-3"><button class="btn btn-ghost btn-sm" data-vw="100%">Desktop</button><button class="btn btn-ghost btn-sm" data-vw="390px">Mobile</button><span class="hint !mt-0" id="pvs">Loading the real page…</span></div><iframe id="pvf" title="Website preview" src="../assets/site/${f}" style="width:100%;height:100%;border:1px solid var(--bd);border-radius:12px;background:#fff;display:block;margin:0 auto"></iframe>`,footer:'<button class="btn btn-ghost" data-close>Close preview</button>',
  onMount(w){w.addEventListener('click',e=>{const b=e.target.closest('[data-vw]');if(b)$('#pvf',w).style.width=b.dataset.vw})}})};
