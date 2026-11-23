/* DISHA CMS – shell (sidebar, header), UI helpers (toast, modal, forms) */
const NAV=[{sec:'MAIN MENU'},
 ['dashboard','Dashboard','layout-dashboard'],['homepage-builder','Homepage Builder','layout-template'],['page-management','Page Management','file-text'],['services','Services','stethoscope'],['blogs','Blog Management','newspaper'],['testimonials','Testimonials','message-square-quote'],
 {sec:'WEBSITE CONFIGURATION'},['website-settings','Website Settings','settings'],['seo-management','SEO Management','search-check'],
 {sec:'ACCOUNT'},['my-profile','My Profile','user-round'],['logout','Logout','log-out']];
const Toast={show(msg,type='ok'){let w=$('.toasts');if(!w){w=document.createElement('div');w.className='toasts';w.setAttribute('aria-live','polite');document.body.appendChild(w)}const t=document.createElement('div');t.className='toast '+(type==='error'?'error':'');t.innerHTML=ic(type==='error'?'alert-circle':'check-circle-2')+'<span>'+esc(msg)+'</span>';w.appendChild(t);icons();setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),250)},3200)}};
const Modal={el:null,open(o){this.close();const w=document.createElement('div');w.className='modal-back'+(o.size==='full'?' full':'');w.innerHTML=`<div class="modal ${o.size||''}" role="dialog" aria-modal="true"><div class="modal-h"><h3>${esc(o.title)}</h3><button class="icon-btn" data-close aria-label="Close">${ic('x')}</button></div><div class="modal-b">${o.body}</div>${o.footer?`<div class="modal-f">${o.footer}</div>`:''}</div>`;document.body.appendChild(w);w.addEventListener('mousedown',e=>{if(e.target===w)Modal.close()});$$('[data-close]',w).forEach(b=>b.onclick=()=>Modal.close());this.el=w;this.onClose=o.onClose;document.body.classList.add('no-scroll');icons();requestAnimationFrame(()=>w.classList.add('show'));o.onMount&&o.onMount(w);return w},close(){if(!this.el)return;const e=this.el,cb=this.onClose;this.el=null;this.onClose=null;e.remove();document.body.classList.remove('no-scroll');cb&&cb()}};
document.addEventListener('keydown',e=>{if(e.key==='Escape')Modal.close()});
function confirmBox(msg,o={}){return new Promise(res=>{let done=false;const m=Modal.open({title:o.title||'Please confirm',size:'sm',body:`<p>${msg}</p>`,footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn ${o.danger?'btn-danger':'btn-primary'}" data-yes>${o.ok||'Confirm'}</button>`,onClose:()=>{if(!done)res(false)}});$('[data-yes]',m).onclick=()=>{done=true;Modal.close();res(true)}})}
function sanitize(h){const d=new DOMParser().parseFromString(h||'','text/html');$$('script,iframe,object,embed,style,link,meta',d).forEach(n=>n.remove());$$('*',d).forEach(n=>[...n.attributes].forEach(a=>{if(/^on/i.test(a.name)||/javascript:/i.test(a.value))n.removeAttribute(a.name)}));return d.body.innerHTML}
function compress(file,max=800){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const i=new Image();i.onerror=rej;i.onload=()=>{const k=Math.min(1,max/Math.max(i.width||max,i.height||max)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(i.width*k));c.height=Math.max(1,Math.round(i.height*k));c.getContext('2d').drawImage(i,0,0,c.width,c.height);const t=file.type==='image/png'?'image/png':'image/jpeg';res({src:c.toDataURL(t,.82),w:c.width,h:c.height,type:t.split('/')[1].toUpperCase().replace('JPEG','JPG')})};i.src=r.result};r.readAsDataURL(file)})}
const BADGE={Active:'green',Published:'green',Visible:'green',Approved:'green',Confirmed:'green',Completed:'green',Replied:'green',Index:'green',Allow:'green',Saved:'green',Pending:'gold',Draft:'gold',New:'gold',Inactive:'gray',Hidden:'gray',Noindex:'gray',Cancelled:'red'};
const badge=s=>`<span class="badge b-${BADGE[s]||'gray'}">${esc(s)}</span>`;
const initials=n=>String(n||'?').replace(/\(.*?\)/g,'').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const thumb=(src,name)=>`<div class="thumb">${src?`<img src="${src}" alt="">`:esc(initials(name))}</div>`;
const pageHead=(t,s,a='')=>`<div class="page-head"><div><h1>${esc(t)}</h1><p>${esc(s||'')}</p></div><div class="flex flex-wrap gap-2">${a}</div></div>`;
const notice=t=>`<div class="notice">${ic('info')}<div>${t}</div></div>`;
const empty=(i,t,s,btn='')=>`<div class="empty">${ic(i)}<h4>${esc(t)}</h4><p>${esc(s)}</p>${btn}</div>`;
/* Forms */
const IMGEMPTY=()=>`${ic('image-plus')}<b>Click to upload or drag &amp; drop</b><small>JPG, PNG or WebP \u00b7 optimised automatically</small>`;
const Form={
 field(f,v){const req=f.required?'<span class="text-red-600"> *</span>':'',full=['textarea','editor','image','list'].includes(f.type)||f.full;let i='';
  const t=f.type||'text';
  if(t==='textarea')i=`<textarea class="input" rows="${f.rows||3}" name="${f.name}">${esc(v)}</textarea>`;
  else if(t==='list')i=`<textarea class="input" rows="4" name="${f.name}">${esc((v||[]).join('\n'))}</textarea><p class="hint">${esc(f.hint||'One item per line')}</p>`;
  else if(t==='select')i=`<select class="input" name="${f.name}">${(f.options||[]).map(o=>{const[a,b]=Array.isArray(o)?o:[o,o];return`<option value="${esc(a)}" ${String(v)===String(a)?'selected':''}>${esc(b)}</option>`}).join('')}</select>`;
  else if(t==='image')i=`<div class="imgfield ${v?'has':''}" data-img="${f.name}"><div class="imgprev ${v?'filled':''}">${v?`<img src="${esc(v)}" alt="Preview">`:IMGEMPTY()}</div><div class="imgact"><label class="btn btn-ghost btn-sm cursor-pointer">${ic(v?'refresh-cw':'upload')}<span class="ut">${v?'Replace image':'Upload image'}</span><input type="file" accept="image/*" hidden></label><button type="button" class="btn btn-ghost btn-sm danger" data-clear ${v?'':'hidden'}>${ic('trash-2')}Remove</button></div><input type="hidden" name="${f.name}" value="${esc(v)}"></div>`;
  else if(t==='editor')i=`<div class="editor-tb"><button type="button" data-cmd="bold" title="Bold">B</button><button type="button" data-cmd="italic" title="Italic"><i>I</i></button><button type="button" data-cmd="formatBlock:h2" title="Heading">H</button><button type="button" data-cmd="insertUnorderedList" title="List">\u2022</button><button type="button" data-cmd="createLink" title="Link">\ud83d\udd17</button></div><div class="editor" contenteditable="true" data-editor="${f.name}">${sanitize(v)}</div>`;
  else if(t==='toggle')i=`<label class="switch"><input type="checkbox" name="${f.name}" ${v?'checked':''}><span></span></label>`;
  else if(t==='color')i=`<input class="colorin" type="color" name="${f.name}" value="${esc(v||'#000000')}">`;
  else i=`<input class="input" type="${t}" name="${f.name}" value="${esc(v)}" ${f.ph?`placeholder="${esc(f.ph)}"`:''} ${t==='number'?'min="0" step="any"':''}>`;
  return`<div class="fld ${full?'md:col-span-2':''}"><label class="lbl">${esc(f.label)}${req}</label>${i}${f.hint&&t!=='list'?`<p class="hint">${esc(f.hint)}</p>`:''}</div>`},
 render(fields,vals){return`<form class="grid md:grid-cols-2 gap-4" novalidate>${fields.map(f=>Form.field(f,vals[f.name]??(f.type==='list'?[]:''))).join('')}</form>`},
 bind(form){form.addEventListener('submit',e=>e.preventDefault());$$('[data-img]',form).forEach(b=>{const inp=$('input[type=file]',b),hid=$('input[type=hidden]',b),pv=$('.imgprev',b),clr=$('[data-clear]',b),ut=$('.ut',b);
   const paint=src=>{b.classList.toggle('has',!!src);pv.classList.toggle('filled',!!src);pv.innerHTML=src?`<img src="${src}" alt="Preview">`:IMGEMPTY();clr.hidden=!src;ut.textContent=src?'Replace image':'Upload image';const ui=ut.parentElement.querySelector('svg,i');if(ui){const n=document.createElement('i');n.setAttribute('data-lucide',src?'refresh-cw':'upload');ui.replaceWith(n)}icons()};
   const take=async f=>{if(!f||!/^image\//.test(f.type))return Toast.show('Please choose an image file.','error');try{const r=await compress(f);hid.value=r.src;hid.dataset.meta=JSON.stringify({type:r.type,w:r.w,h:r.h,name:f.name});paint(r.src);hid.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){Toast.show('Could not read this image file.','error')}};
   inp.onchange=()=>{take(inp.files[0]);inp.value=''};clr.onclick=()=>{hid.value='';paint('');hid.dispatchEvent(new Event('input',{bubbles:true}))};
   pv.onclick=()=>{if(!hid.value)inp.click()};
   pv.ondragover=e=>{e.preventDefault();pv.classList.add('drag')};pv.ondragleave=()=>pv.classList.remove('drag');pv.ondrop=e=>{e.preventDefault();pv.classList.remove('drag');take(e.dataTransfer.files[0])}});
  $$('[data-cmd]',form).forEach(b=>b.onmousedown=e=>{e.preventDefault();let[c,a]=b.dataset.cmd.split(':');if(c==='createLink'){a=prompt('Enter link URL (https://...)');if(!a||!/^https?:\/\//i.test(a))return}document.execCommand(c,false,a)});
  form.addEventListener('input',e=>{e.target.classList.remove('err');const m=e.target.parentElement.querySelector('.err-msg');m&&m.remove()})},
 read(form,fields){const o={};fields.forEach(f=>{const t=f.type||'text';if(t==='editor')o[f.name]=sanitize($(`[data-editor="${f.name}"]`,form).innerHTML);else{const el=form.elements[f.name];if(!el)return;if(t==='toggle')o[f.name]=el.checked;else if(t==='list')o[f.name]=el.value.split('\n').map(s=>s.trim()).filter(Boolean);else if(t==='number')o[f.name]=el.value===''?'':Number(el.value);else o[f.name]=typeof el.value==='string'?el.value.trim():el.value}});return o},
 validate(form,fields){let ok=true;$$('.err-msg',form).forEach(e=>e.remove());$$('.err',form).forEach(e=>e.classList.remove('err'));fields.forEach(f=>{const el=form.elements[f.name]||(f.type==='editor'?{value:''}:null);if(!el)return;const v=(el.value||'').trim();let m='';
  if(f.required&&f.type!=='editor'&&f.type!=='image'&&!v)m=f.label+' is required.';
  else if(f.required&&f.type==='editor'&&!$(`[data-editor="${f.name}"]`,form).textContent.trim())m=f.label+' is required.';
  else if(v&&f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))m='Enter a valid email address.';
  else if(v&&f.type==='url'&&!/^https?:\/\/\S+$/i.test(v))m='Enter a full URL starting with https://';
  else if(v&&f.type==='number'&&Number(v)<0)m='Value cannot be negative.';
  else if(v&&f.name==='slug'&&!/^[a-z0-9-]+$/.test(v))m='Use lowercase letters, numbers and hyphens only.';
  if(m){ok=false;const t=f.type==='editor'?$(`[data-editor="${f.name}"]`,form):el;t.classList.add('err');const p=document.createElement('p');p.className='err-msg';p.textContent=m;t.parentElement.appendChild(p)}});
  if(!ok){const e=$('.err',form);e&&e.focus&&e.focus()}return ok}
};
/* Shell */
const Shell={
 init(){const page=document.body.dataset.page;
  if(sessionStorage.getItem('disha_auth')!=='1'){location.replace('../login.html');return false}
  if(DB.get('sb')==='1')document.body.classList.add('sb-collapsed');
  const nav=NAV.map(n=>n.sec?`<div class="nav-sec"><span>${n.sec}</span></div>`:n[0]==='logout'?`<button class="nav-item" data-logout data-tip="${n[1]}">${ic(n[2])}<span class="nav-label">${n[1]}</span></button>`:`<a class="nav-item ${n[0]===page?'active':''}" href="${n[0]}.html" data-tip="${n[1]}" ${n[0]===page?'aria-current="page"':''}>${ic(n[2])}<span class="nav-label">${n[1]}</span></a>`).join('');
  $('#app').innerHTML=`<aside class="sidebar" id="sidebar" aria-label="Main navigation"><div class="sb-brand"><div class="sb-logo"><img src="../assets/images/logo/emblem.png" alt="DISHA Clinic logo"></div><div class="sb-title">DISHA CMS</div><span class="sb-badge">v1.0</span></div><nav class="sb-nav">${nav}</nav></aside><button class="edge-toggle" id="edge" aria-label="Collapse or expand sidebar">${ic('chevron-left')}</button><div class="sb-scrim" id="scrim"></div><div class="nav-tip" id="tip"></div>
  <div class="main"><header class="topbar">
   <div class="gsearch"><div class="search"><i data-lucide="search"></i><input class="input" id="gs" placeholder="Search services, blogs, pages\u2026" autocomplete="off" aria-label="Global search"></div><div class="sres" id="sres"></div></div>
   <div class="flex-1"></div>
   <div class="dd" id="ddAdd"><button class="btn btn-primary" data-dd>${ic('plus')}<span class="hidden sm:inline">Add New</span></button><div class="dd-menu">${[['Service','services','stethoscope'],['Blog','blogs','newspaper'],['Testimonial','testimonials','message-square-quote']].map(a=>`<a class="dd-item" href="${a[1]}.html?new=1">${ic(a[2])}${a[0]}</a>`).join('')}</div></div>
   <div class="dd" id="ddUser"><button class="flex items-center gap-2 pl-2" data-dd aria-label="Account menu"><span class="avatar" id="av"></span><span class="hidden md:block text-left leading-tight"><b class="block text-sm" id="avn"></b><small class="text-[#60736B]">Administrator</small></span>${ic('chevron-down','w-4 h-4')}</button><div class="dd-menu"><a class="dd-item" href="my-profile.html">${ic('user-round')}My Profile</a><div class="dd-sep"></div><button class="dd-item" data-logout>${ic('log-out')}Logout</button></div></div>
  </header><main class="content" id="main"></main></div>`;
  Shell.paintProfile();Shell.events();icons();return true},
 paintProfile(){const p=DB.get('profile',SEED.profile());$('#av').innerHTML=p.image?`<img src="${esc(p.image)}" alt="">`:esc(initials(p.name));$('#avn').textContent=p.name},
 events(){const b=document.body;
  $('#edge').onclick=()=>{if(innerWidth<1024){b.classList.toggle('sb-open');return}b.classList.toggle('sb-collapsed');DB.set('sb',b.classList.contains('sb-collapsed')?'1':'0')};
  $('#scrim').onclick=()=>b.classList.remove('sb-open');
  const tip=$('#tip');$$('.nav-item').forEach(a=>{a.onmouseenter=()=>{if(!b.classList.contains('sb-collapsed')||innerWidth<1024)return;const r=a.getBoundingClientRect();tip.textContent=a.dataset.tip;tip.style.left=r.right+10+'px';tip.style.top=r.top+r.height/2-14+'px';tip.classList.add('show')};a.onmouseleave=()=>tip.classList.remove('show')});
  document.addEventListener('click',e=>{const t=e.target.closest('[data-dd]');$$('.dd.open').forEach(d=>{if(!t||d!==t.closest('.dd'))d.classList.remove('open')});if(t)t.closest('.dd').classList.toggle('open');if(!e.target.closest('.gsearch'))$('#sres').classList.remove('open');if(e.target.closest('[data-logout]'))Shell.logout()});
  const gs=$('#gs'),sr=$('#sres');const sets=[['services','Service','services.html','name'],['blogs','Blog','blogs.html','title'],['testimonials','Testimonial','testimonials.html','name'],['pages','Page','page-management.html','title']];
  gs.oninput=()=>{const q=gs.value.trim().toLowerCase();if(!q){sr.classList.remove('open');return}let h=NAV.filter(n=>!n.sec&&n[1].toLowerCase().includes(q)&&n[0]!=='logout').map(n=>`<a href="${n[0]}.html"><span>${esc(n[1])}</span><small>Go to module</small></a>`);sets.forEach(s=>getList(s[0]).filter(r=>String(r[s[3]]).toLowerCase().includes(q)).slice(0,4).forEach(r=>h.push(`<a href="${s[2]}${s[2].includes('?')?'':'?'}q=${encodeURIComponent(r[s[3]])}"><span>${esc(r[s[3]])}</span><small>${s[1]}</small></a>`)));sr.innerHTML=h.length?h.slice(0,12).join(''):'<div class="p-4 text-sm text-[#60736B]">No results found. Try another keyword.</div>';sr.classList.add('open')};gs.onfocus=gs.oninput},
 async logout(){if(await confirmBox('You will be signed out of the DISHA CMS and returned to the login page.',{title:'Log out?',ok:'Logout'})){sessionStorage.removeItem('disha_auth');location.href='../login.html'}}
};
/* bootstrap */
document.addEventListener('DOMContentLoaded',()=>{if(!document.body.dataset.page)return;if(!Shell.init())return;const m=$('#main'),fn=window.Modules&&Modules[document.body.dataset.page];m.innerHTML='<div class="card"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';setTimeout(()=>{fn?fn(m):m.innerHTML=empty('alert-circle','Module not found','This page has no module script.');icons();if(location.hash){const t=$(location.hash);t&&t.scrollIntoView()}},180)});

/* ---- Admin panel theme mode (Light / Dark / System). Set from Theme & Appearance, applied on every admin page.
   Demo implementation: the existing shell is styled with fixed colours, so Dark mode inverts the page surfaces with
   Tailwind filter utilities (sidebar stays as-is). A production build should switch to CSS variables / Tailwind `dark:`.
   Stored in localStorage key "disha:adminTheme" ({mode}). This never touches the public website theme. ---- */
const AdminTheme={
 INV:'invert(1)_hue-rotate(180deg)',
 classes(){const f='[filter:invert(1)_hue-rotate(180deg)]';return['dark',...['.topbar','.content','.edge-toggle','.modal'].map(s=>`[&_${s}]:${f}`),`[&_.content_img]:${f}`,`[&_.topbar_img]:${f}`,'[&>body]:![background-image:none]','[&>body]:!bg-[#06100B]']},
 saved(){const m=(DB.get('adminTheme')||{}).mode;return['light','dark','system'].includes(m)?m:'light'},
 resolve(m){return m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m},
 apply(m){const on=this.resolve(m)==='dark',h=document.documentElement;this.classes().forEach(c=>h.classList.toggle(c,on));h.style.colorScheme=on?'dark':'light';this.current=m},
 init(){this.apply(this.saved());matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(this.current==='system')this.apply('system')})}
};
AdminTheme.init();
