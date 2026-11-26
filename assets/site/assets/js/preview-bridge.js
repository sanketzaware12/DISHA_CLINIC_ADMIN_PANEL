/* Admin-only preview helper (this copy of the site lives inside the CMS; the real website is untouched).
   Receives the draft edits from the admin panel and applies them to the real page so it shows the real design. */
(function(){
var norm=function(s){return String(s||'').replace(/\s+/g,' ').trim()};
var ATTR=['alt','title','aria-label','placeholder','href','data-count','data-suf','value','content','data-lb'];
function q(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function deepest(root,o){var t=norm(o),best=null,all=root.querySelectorAll('*');
 for(var i=0;i<all.length;i++){var e=all[i];if(/^(SCRIPT|STYLE|SVG|PATH)$/i.test(e.tagName))continue;if(norm(e.textContent)!==t)continue;
  var inner=false;for(var j=0;j<e.children.length;j++){if(norm(e.children[j].textContent)===t){inner=true;break}}
  if(!inner){best=e;break}}return best}
function setText(e,n){if(!e.children.length){e.textContent=n;return}var f=false;
 for(var i=0;i<e.childNodes.length;i++){var c=e.childNodes[i];if(c.nodeType===3&&norm(c.nodeValue)&&!f){c.nodeValue=n;f=true}}
 if(!f)e.textContent=n}
function img(root,p){var n=0,els=root.querySelectorAll('[src],[srcset],[style],[data-lb],[href]');
 for(var i=0;i<els.length;i++){var e=els[i];['src','srcset','data-lb','href','style'].forEach(function(a){var v=e.getAttribute(a);if(!v||v.indexOf(p.o)<0)return;
  if(a==='style'){e.setAttribute(a,v.replace(/url\((['"]?)([^)'"]*?)\1\)/g,function(m,qt,u){return u.indexOf(p.o)>=0?'url("'+(p.n.indexOf('data:')===0?p.n:u.replace(p.o,p.n))+'")':m}));n++}
  else{e.setAttribute(a,p.n.indexOf('data:')===0?p.n:v.split(p.o).join(p.n));if(a==='src')e.removeAttribute('srcset');n++}})}return n}
function sub(p){var n=0,w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),t;
 while(t=w.nextNode()){if(t.nodeValue.indexOf(p.o)>=0&&!/^(SCRIPT|STYLE)$/i.test(t.parentNode.tagName)){t.nodeValue=t.nodeValue.split(p.o).join(p.n);n++}}
 var els=document.querySelectorAll('*');for(var i=0;i<els.length;i++){var e=els[i];for(var j=0;j<e.attributes.length;j++){var a=e.attributes[j];if(a.value.indexOf(p.o)>=0){a.value=a.value.split(p.o).join(p.n);n++}}}
 return n}
function exact(root,p){if(p.img)return img(root,p);var n=0,t=norm(p.o),all=root.querySelectorAll('*');
 for(var i=0;i<all.length;i++){var e=all[i];for(var k=0;k<ATTR.length;k++){var v=e.getAttribute(ATTR[k]);if(v!==null&&norm(v)===t&&!(ATTR[k]==='content'&&e.tagName!=='META')){e.setAttribute(ATTR[k],p.n);n++;if(!p.all)return n}}}
 var els=[];for(i=0;i<all.length;i++){var e2=all[i];if(/^(SCRIPT|STYLE|SVG|PATH|TITLE)$/i.test(e2.tagName)||norm(e2.textContent)!==t)continue;
  var inner=false;for(var j=0;j<e2.children.length;j++){if(norm(e2.children[j].textContent)===t){inner=true;break}}if(!inner)els.push(e2)}
 for(i=0;i<els.length;i++){setText(els[i],p.n);n++;if(!p.all)break}
 if(n)return n;
 var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),tn;
 while(tn=w.nextNode()){if(/^(SCRIPT|STYLE)$/i.test(tn.parentNode.tagName))continue;var v2=norm(tn.nodeValue);
  var ld=(tn.nodeValue.match(/^\s*/)||[''])[0],tl=(tn.nodeValue.match(/\s*$/)||[''])[0];if(v2===t){tn.nodeValue=ld+p.n+tl;return 1}if(t.length>12&&v2.indexOf(t)>=0){tn.nodeValue=ld+v2.replace(t,p.n)+tl;return 1}}
 return 0}
function rich(p){var el,d;
 if(p.kind==='sec'){el=q('#'+p.id);if(!el)return 0;var h=el.querySelector('h2');[].slice.call(el.childNodes).forEach(function(c){if(c!==h)c.remove()});d=document.createElement('div');d.innerHTML=p.n;while(d.firstChild)el.appendChild(d.firstChild);return 1}
 if(p.kind==='legal'){var h2=q('h2#'+p.id);if(!h2)return 0;var s=h2.nextSibling;while(s&&!(s.nodeType===1&&s.tagName==='H2')){var nx=s.nextSibling;s.remove();s=nx}d=document.createElement('div');d.innerHTML=p.n;var ref=h2.nextSibling;while(d.firstChild)h2.parentNode.insertBefore(d.firstChild,ref);return 1}
 if(p.kind==='intro'){var pr=q('.bd-prose');if(!pr)return 0;[].slice.call(pr.children).forEach(function(c){if(c.tagName==='P')c.remove()});d=document.createElement('div');d.innerHTML=p.n;while(d.lastChild)pr.insertBefore(d.lastChild,pr.firstChild);return 1}return 0}

/* ---- add / remove list items (tick points, pills, cards, FAQ rows…) ---- */
var STOP=/^(UL|OL|TBODY|THEAD|TABLE|SECTION|BODY|MAIN|DL)$/;
function matches(root,t){var out=[],all=root.querySelectorAll('*');
 for(var i=0;i<all.length;i++){var e=all[i];if(/^(SCRIPT|STYLE|SVG|PATH|TITLE)$/i.test(e.tagName))continue;if(norm(e.textContent)!==t)continue;
  var inner=false;for(var j=0;j<e.children.length;j++){if(norm(e.children[j].textContent)===t){inner=true;break}}if(!inner)out.push(e)}return out}
function follows(a,b){return !a||!!(a.compareDocumentPosition(b)&4)}
function lca(a,b){while(a&&!a.contains(b))a=a.parentNode;return a}
function climb(el,txt){while(el.parentNode&&!STOP.test(el.parentNode.tagName)&&norm(el.parentNode.textContent)===txt)el=el.parentNode;return el}
function locate(root,items){var els=[],cursor=null;
 for(var i=0;i<items.length;i++){var leaves=items[i].filter(function(x){return norm(x)}),box=null,found=[];
  if(!leaves.length)return null;
  var lg=leaves.filter(function(x){return norm(x).length>=3});if(lg.length)leaves=lg;
  for(var k=0;k<leaves.length;k++){var ms=matches(root,norm(leaves[k])),m=null;
   for(var j=0;j<ms.length;j++){if(follows(cursor,ms[j])){m=ms[j];break}}
   if(!m)continue;cursor=m;found.push(leaves[k]);box=box?lca(box,m):m}
  if(!box)return null;
  if(found.length===1)box=climb(box,norm(found[0]));
  else{var allin=function(b){var t=norm(b.textContent);return found.every(function(l){return t.indexOf(norm(l))>=0})};
   while(box.parentNode&&!STOP.test(box.parentNode.tagName)&&!allin(box))box=box.parentNode}
  els.push(box)}
 /* items found at different depths (e.g. a bare label vs. a whole card): bring them to the shallowest level */
 var dep=function(e){var d=0;while(e.parentNode){e=e.parentNode;d++}return d},mn=Math.min.apply(null,els.map(dep));
 els=els.map(function(e){while(dep(e)>mn&&e.parentNode&&!STOP.test(e.parentNode.tagName))e=e.parentNode;return e});
 /* each item must be a sibling of the others: climb them together until they share one parent */
 for(var g=0;g<5;g++){var same=els.every(function(e){return e.parentNode===els[0].parentNode});
  if(same)break;
  var ps=els.map(function(e){return e.parentNode});
  if(ps.some(function(x){return !x||STOP.test(x.tagName)||x===document.body})||new Set(ps).size!==ps.length)return null;
  els=ps}
 for(var n=1;n<els.length;n++)if(els[n].parentNode!==els[0].parentNode||els[n].tagName!==els[0].tagName)return null;
 return els}
function unreveal(c){var all=[c].concat([].slice.call(c.querySelectorAll('*')));
 all.forEach(function(x){if(x.classList){x.classList.remove('reveal','in');x.style&&x.style.removeProperty('--d')}})}
function rep(p,root){var old=p.o,nw=p.n;if(!old.length)return 0;
 var els=locate(root,old);if(!els&&root!==document.body)els=locate(document.body,old);if(!els)return 0;
 var parent=els[0].parentNode,keep=Math.min(els.length,nw.length),i,k,tpl=els[els.length-1].cloneNode(true);
 for(i=els.length-1;i>=nw.length;i--)els[i].remove();
 /* existing items: change only the leaves that differ, inside that one item (no cross-item cascade) */
 for(i=0;i<keep;i++)for(k=0;k<old[i].length;k++){var ov=old[i][k],nv=nw[i][k]==null?'':nw[i][k];if(ov&&ov!==nv)exact(els[i],{o:ov,n:nv})}
 /* new items: clone the last original item, then fill it */
 var tl=old[old.length-1],last=els[keep-1]||null;
 for(i=els.length;i<nw.length;i++){var c=tpl.cloneNode(true);unreveal(c);
  for(k=0;k<tl.length;k++){var nv2=nw[i][k]==null?'':nw[i][k];if(tl[k]&&tl[k]!==nv2)exact(c,{o:tl[k],n:nv2})}
  var num=[].slice.call(c.querySelectorAll('*')).filter(function(x){return !x.children.length&&/^0?\d{1,2}$/.test(norm(x.textContent))})[0];
  if(num){var w=norm(num.textContent).length,v=String(i+1);while(v.length<w)v='0'+v;num.textContent=v}
  if(last&&last.nextSibling)parent.insertBefore(c,last.nextSibling);else parent.appendChild(c);last=c}
 [].slice.call(parent.children).forEach(function(c,i){if(/--i\s*:/.test(c.getAttribute('style')||''))c.style.setProperty('--i',i)});
 /* numbered lists (01, 02, …) */
 return 1}

/* ---- dynamic cards: services, blog articles, patient reviews (built from the CMS records, same markup as the real site) ---- */
function pad(n){return n<10?'0'+n:''+n}
function isAbs(p){return /^(data:|https?:|\/)/.test(p)}
function kids(el,sel){return [].slice.call(el.children).filter(function(c){return c.matches(sel)})}
function setTxt(e,n){if(!e)return;var a=e.querySelector&&e.querySelector(':scope > a');if(e.tagName==='H3'&&a)e=a;setText(e,n)}
function svcFill(c,s,i,pi,pl){
 [].slice.call(c.querySelectorAll('a[href*="services/"]')).forEach(function(a){a.setAttribute('href',s.isNew?'#':pl+'services/'+s.slug+'/index.html')});
 var im=c.querySelector('img');if(im){if(s.img)im.setAttribute('src',isAbs(s.img)?s.img:pi+s.img);im.removeAttribute('srcset');im.setAttribute('alt',s.alt||s.title||'')}
 var no=c.querySelector('.sv-no');if(no)no.textContent=pad(i+1);
 var a=c.querySelector('a.im'),tg=c.querySelector('.sv-tag');
 if(s.badge){if(!tg&&no){tg=document.createElement('span');tg.className='sv-tag';no.after(tg)}if(tg)tg.textContent=s.badge}else if(tg)tg.remove();
 var bd=c.querySelector('.bd');if(bd){setTxt(bd.querySelector('h3'),s.title||'');var pp=bd.querySelector('p');if(pp)setText(pp,s.d||'');var mo=bd.querySelector('a.more');if(mo&&s.more)setText(mo,s.more+' ')}}
function svcCards(list){var main=document.querySelector('main')||document.body,done=0;
 var all=[].slice.call(main.querySelectorAll('article.card')).filter(function(a){var l=kids(a,'a.im')[0];return l&&/services\/[^\/]+\/index\.html/.test(l.getAttribute('href')||'')});
 var groups=[];all.forEach(function(a){var g=groups.filter(function(x){return x.p===a.parentNode})[0];if(!g)groups.push(g={p:a.parentNode,c:[]});g.c.push(a)});
 groups.forEach(function(g){var cs=g.c,tpl=cs[0].cloneNode(true),ti=tpl.querySelector('img'),
   pi=((ti&&ti.getAttribute('src'))||'').replace(/assets\/img\/.*$/,''),pl=kids(tpl,'a.im')[0].getAttribute('href').replace(/services\/.*$/,''),by={};
  cs.forEach(function(c){var m=kids(c,'a.im')[0].getAttribute('href').match(/services\/([^\/]+)\//);if(m)by[m[1]]=c});
  var ref=cs[cs.length-1].nextElementSibling,want=[];
  list.forEach(function(s,i){var c=by[s.slug];if(c)delete by[s.slug];else{c=tpl.cloneNode(true);unreveal(c)}svcFill(c,s,i,pi,pl);want.push(c)});
  for(var k in by)by[k].remove();
  want.forEach(function(c){g.p.insertBefore(c,ref)});done++});
 return done}
function postFill(c,b,pi,pl){
 [].slice.call(c.querySelectorAll('a[href*="blogs/"]')).forEach(function(a){a.setAttribute('href',b.isNew?'#':pl+'blogs/'+b.slug+'/index.html')});
 c.setAttribute('data-cat',b.category||'');
 var im=c.querySelector('img');if(im){if(b.thumb)im.setAttribute('src',isAbs(b.thumb)?b.thumb:pi+b.thumb);im.removeAttribute('srcset');im.setAttribute('alt',b.thumb_alt||b.title||'')}
 var tg=c.querySelector('.bl-tag');if(tg){tg.textContent=b.category||'';tg.className='bl-tag t-'+String(b.category||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
 var meta=c.querySelectorAll('.bl-meta span');if(meta[0])meta[0].textContent=b.date||'';if(meta[1])meta[1].textContent=b.read||'';
 var h=c.querySelector('.bl-bd h3');setTxt(h,b.title||'');var pp=c.querySelector('.bl-bd > p');if(pp)setText(pp,b.excerpt||'');
 var by=c.querySelector('.bl-by');if(by){var bi=by.querySelector('i');if(bi)bi.textContent=b.initial||String(b.author||'A').charAt(0);var bs=by.querySelector('span');if(bs)bs.textContent=b.author||''}
 var mo=c.querySelector('.bl-more');if(mo&&b.btn)setText(mo,b.btn+' ');
 var bd=c.querySelector('.bl-bd'),ey=c.querySelector('.bl-eye');
 if(b.featured){if(!ey&&bd){ey=document.createElement('span');ey.className='bl-eye';bd.insertBefore(ey,bd.firstChild)}if(ey)ey.textContent=b.flabel||'Featured Article'}else if(ey)ey.remove()}
function postCards(list){var grid=document.querySelector('.bl-grid');if(!grid)return 0;
 var cs=kids(grid,'article.bl-card');if(!cs.length)return 0;
 var tpl=cs[cs.length-1].cloneNode(true),ti=tpl.querySelector('img'),pi=((ti&&ti.getAttribute('src'))||'').replace(/assets\/img\/.*$/,''),
   pl=(tpl.querySelector('a[href*="blogs/"]').getAttribute('href')||'').replace(/blogs\/.*$/,''),by={};
 cs.forEach(function(c){var a=c.querySelector('a[href*="blogs/"]'),m=a&&a.getAttribute('href').match(/blogs\/([^\/]+)\//);if(m)by[m[1]]=c});
 var want=[];
 list.forEach(function(b){var c=by[b.slug];if(c)delete by[b.slug];else{c=tpl.cloneNode(true);unreveal(c);var e=c.querySelector('.bl-eye');if(e)e.remove()}postFill(c,b,pi,pl);want.push(c)});
 for(var k in by)by[k].remove();
 var ref=grid.querySelector('.empty')||null;want.forEach(function(c){grid.insertBefore(c,ref&&ref.parentNode===grid?ref:null)});
 /* category chips + counts */
 var bar=document.querySelector('.bl-bar'),chips=bar?[].slice.call(bar.querySelectorAll('.chip')):[];
 if(chips.length){var all=chips[0],ct=(chips[1]||chips[0]).cloneNode(true),cats=[];list.forEach(function(b){if(b.category&&cats.indexOf(b.category)<0)cats.push(b.category)});
  chips.slice(1).forEach(function(c){c.remove()});var anchor=all;
  cats.forEach(function(cat){var c=ct.cloneNode(true);c.classList.remove('on');c.setAttribute('data-f',cat);c.firstChild.nodeValue=cat;var sm=c.querySelector('small');if(sm)sm.textContent=list.filter(function(b){return b.category===cat}).length;anchor.after(c);anchor=c});
  var sa=all.querySelector('small');if(sa)sa.textContent=list.length;
  var run=function(){var on=bar.querySelector('.chip.on'),f=on?on.getAttribute('data-f'):'all';[].forEach.call(grid.querySelectorAll('.bl-card'),function(c){c.classList.toggle('hidden',!(f==='all'||c.getAttribute('data-cat')===f))})};
  [].forEach.call(bar.querySelectorAll('.chip'),function(c){c.onclick=function(){[].forEach.call(bar.querySelectorAll('.chip'),function(x){x.classList.remove('on')});c.classList.add('on');run()}})}
 var sp=document.querySelector('.bl-pills span');if(sp&&/^\d+\s+Articles?$/i.test(norm(sp.textContent)))sp.textContent=list.length+(list.length===1?' Article':' Articles');
 return 1}
function initRv(box){var track=box.querySelector('.rv-track'),cs=[].slice.call(track.children),n=cs.length,prev=box.querySelector('.prev'),next=box.querySelector('.next'),dotsEl=box.querySelector('.rv-dots'),cur=0,dots=[];
 if(dotsEl)dotsEl.innerHTML='';
 function render(){cs.forEach(function(c,i){var o=((i-cur)%n+n)%n;if(o>n/2)o-=n;c.className='card rv '+(o===0?'is-c':o===-1?'is-l':o===1?'is-r':o<0?'is-hl':'is-hr');c.setAttribute('aria-hidden',o===0?'false':'true')});dots.forEach(function(b,i){b.classList.toggle('on',i===cur)})}
 function go(i){cur=((i%n)+n)%n;render()}
 cs.forEach(function(c){c.addEventListener('click',function(){if(c.classList.contains('is-l'))go(cur-1);else if(c.classList.contains('is-r'))go(cur+1)})});
 if(dotsEl)for(var d=0;d<n;d++)(function(d){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show review '+(d+1));b.addEventListener('click',function(){go(d)});dotsEl.appendChild(b);dots.push(b)})(d);
 if(prev)prev.addEventListener('click',function(){go(cur-1)});if(next)next.addEventListener('click',function(){go(cur+1)});
 render();var m=0;cs.forEach(function(c){m=Math.max(m,c.scrollHeight)});box.style.setProperty('--rvh',(m+24)+'px')}
function reviewCards(list){var box=document.querySelector('[data-rv]');if(!box||!list.length)return 0;
 var nb=box.cloneNode(true);box.parentNode.replaceChild(nb,box);box=nb;
 var track=box.querySelector('.rv-track'),tpl=track.children[0].cloneNode(true);track.innerHTML='';
 list.forEach(function(r){var c=tpl.cloneNode(true);unreveal(c);
  var av=c.querySelector('.rv-av');if(av)av.textContent=String(r.name||'?').replace(/[^A-Za-z\u0900-\u097F]/g,'').charAt(0).toUpperCase()||'?';
  var b=c.querySelector('.rv-h b');if(b)b.textContent=r.name||'';var sm=c.querySelector('.rv-h small');if(sm)sm.textContent=r.when||'';
  var st=c.querySelector('.stars'),n=Math.max(0,Math.min(5,+r.rating||0));if(st){st.textContent=new Array(n+1).join('\u2605')+new Array(6-n).join('\u2606');st.setAttribute('aria-label',n+' stars')}
  var pp=c.querySelector('p');if(pp)pp.textContent=r.text||'';var src=c.querySelector('.rv-src');if(src)src.textContent=r.source==='google'?'Posted on Google':'Patient review';
  track.appendChild(c)});
 initRv(box);return 1}

/* ---- Blog article: the whole article page is rebuilt from the draft (title, hero, every section, sidebar, share, author, related, closing CTA) ---- */
function pImg(p){if(!p)return '';return /^(data:|https?:|\/)/.test(p)?p:'../../'+p}
function pTxt(e,t){if(!e)return;[].slice.call(e.childNodes).forEach(function(c){if(c.nodeType===3)c.remove()});e.appendChild(document.createTextNode(t))}
function pEl(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function postPage(a){
 var ICON={},ref=document.querySelectorAll('.bd-band .bd-btn');
 [].forEach.call(ref,function(b){var sv=b.querySelector('svg'),h=b.getAttribute('href')||'';if(!sv)return;var k=/wa\.me/.test(h)?'wa':/contact/.test(h)?'call':'book';ICON[k]=sv.outerHTML});
 var arrow=(document.querySelector('.bd-rel a svg')||{}).outerHTML||'',shareIco=(document.querySelector('.bd-share span svg')||{}).outerHTML||'';
 var wa='https://wa.me/'+String(a.wa||'').replace(/\D/g,''),tel='tel:'+String(a.phone||'').replace(/[^\d+]/g,'');
 function btnKind(l){l=String(l||'').toLowerCase();return /whats/.test(l)?'wa':/call|phone|dial/.test(l)?'tel':/contact|enquir|inquir|message|reach/.test(l)?'contact':'book'}
 function mkBtns(box,labels){if(!box)return;box.innerHTML='';(labels||[]).forEach(function(l,i){if(!String(l).trim())return;var k=btnKind(l),x=document.createElement('a');
  x.className='bd-btn '+(i===0?'gold':'line');x.href=k==='wa'?wa:k==='tel'?tel:k==='contact'?'../../contact-us/index.html':'../../book-appointment/index.html';
  if(k==='wa'){x.target='_blank';x.rel='noopener'}
  x.innerHTML=(k==='wa'?ICON.wa:k==='tel'||k==='contact'?ICON.call:ICON.book)||'';x.appendChild(document.createTextNode(' '+l));box.appendChild(x)});box.style.display=box.children.length?'':'none'}
 function show(e,on){if(e)e.style.display=on?'':'none'}
 /* hero */
 var bcb=q('.bd-bc b');if(bcb)bcb.textContent=a.title||'Untitled article';
 var cat=q('.bd-cat');if(cat){cat.textContent=a.cat||'';show(cat,!!a.cat)}
 var h1=q('.bd-hero h1');if(h1)h1.textContent=a.title||'Untitled article';
 var sb=q('.bd-sub');if(sb){sb.textContent=a.sub||'';show(sb,!!a.sub)}
 var by=q('.bd-by');if(by){var bi=by.querySelector('i');if(bi)bi.textContent=a.author_i||String(a.author||'').charAt(0);pTxt(by,a.author||'');show(by,!!(a.author||a.author_i))}
 var chips=document.querySelectorAll('.bd-meta .bd-chip');if(chips[0]){pTxt(chips[0],a.date||'');show(chips[0],!!a.date)}if(chips[1]){pTxt(chips[1],a.read||'');show(chips[1],!!a.read)}
 /* image + lead */
 var fig=q('.bd-fig'),im=fig&&fig.querySelector('img');if(fig){if(a.hero_img){im.removeAttribute('srcset');im.setAttribute('src',pImg(a.hero_img));im.setAttribute('alt',a.hero_alt||a.title||'');fig.style.display=''}else fig.style.display='none'}
 var ld=q('.bd-lead');if(ld){ld.textContent=a.lead||'';show(ld,!!a.lead)}
 /* intro + sections */
 var pr=q('.bd-prose');if(pr){pr.innerHTML='';var d=document.createElement('div');d.innerHTML=a.intro_html||'';while(d.firstChild)pr.appendChild(d.firstChild);
  (a.sections||[]).forEach(function(s){if(!String(s.h2||'').trim()&&!String(s.html||'').replace(/<[^>]*>/g,'').trim())return;
   var sec=pEl('section','bd-s bd-rv in'+(s.alert?' bd-alert':''));sec.id=s.id;sec.appendChild(pEl('h2','',s.h2||''));var b=document.createElement('div');b.innerHTML=s.html||'';while(b.firstChild)sec.appendChild(b.firstChild);pr.appendChild(sec)})}
 /* service note */
 var nt=q('.bd-note');if(nt){nt.innerHTML='';if(a.note_pre)nt.appendChild(document.createTextNode(a.note_pre+' '));
  if(a.note_link){if(a.note_svc){var l=document.createElement('a');l.href='../../services/'+a.note_svc+'/index.html';l.textContent=a.note_link;nt.appendChild(l)}else nt.appendChild(document.createTextNode(a.note_link))}
  if(a.note_post)nt.appendChild(document.createTextNode(' '+a.note_post));show(nt,!!nt.textContent.trim())}
 /* share */
 var sh=q('.bd-share');if(sh){sh.innerHTML='';var u=encodeURIComponent(a.url||''),lab=pEl('span');lab.innerHTML=shareIco;lab.appendChild(document.createTextNode(' '+(a.share_t||'')));sh.appendChild(lab);
  (a.share||[]).forEach(function(n){var k=String(n).toLowerCase(),h=/whats/.test(k)?'https://wa.me/?text='+u:/face/.test(k)?'https://www.facebook.com/sharer/sharer.php?u='+u:/linked/.test(k)?'https://www.linkedin.com/sharing/share-offsite/?url='+u:/^x$|twitter/.test(k)?'https://twitter.com/intent/tweet?url='+u:/tele/.test(k)?'https://t.me/share/url?url='+u:/mail/.test(k)?'mailto:?body='+u:'#';
   var x=pEl('a','',n);x.href=h;x.target='_blank';x.rel='noopener';sh.appendChild(x)});show(sh,!!((a.share_t||'').trim()||(a.share||[]).length))}
 /* author box */
 var au=q('.bd-author');if(au){var av=au.querySelector('.av'),ab=au.querySelector('b'),as=au.querySelector('small');if(av)av.textContent=a.author_i||String(a.author_name||'').charAt(0);if(ab)ab.textContent=a.author_name||'';if(as)as.textContent=a.author_cred||'';show(au,!!(a.author_name||a.author_cred))}
 /* sidebar: contents */
 var toc=q('.bd-toc');if(toc){var th=toc.querySelector('h3'),nav=toc.querySelector('nav');if(th){th.textContent=a.toc_t||'';show(th,!!a.toc_t)}
  if(nav){var dead=document.createElement('nav');dead.style.display='none';dead.setAttribute('aria-hidden','true');[].slice.call(nav.querySelectorAll('a')).forEach(function(x){dead.appendChild(x)});toc.appendChild(dead);nav.innerHTML='';(a.sections||[]).forEach(function(s){if(!String(s.h2||'').trim())return;var x=pEl('a','',s.h2);x.href='#'+s.id;nav.appendChild(x)});show(toc,nav.children.length>0)
   var links=[].slice.call(nav.querySelectorAll('a')),spy=function(){var y=window.innerHeight*.28,idx=0;links.forEach(function(l,k){var t=document.getElementById(l.getAttribute('href').slice(1));if(t&&t.getBoundingClientRect().top<=y)idx=k});links.forEach(function(l,k){l.classList.toggle('on',k===idx)});var c=links[idx];if(c&&nav.scrollHeight>nav.clientHeight)nav.scrollTop=c.offsetTop-nav.clientHeight/2};
   addEventListener('scroll',spy,{passive:true});spy()}}
 /* sidebar: call-to-action */
 var cta=q('.bd-cta');if(cta){var ch=cta.querySelector('h3'),cp=cta.querySelector('p');if(ch){ch.textContent=a.cta_t||'';show(ch,!!a.cta_t)}if(cp){cp.textContent=a.cta_p||'';show(cp,!!a.cta_p)}mkBtns(cta.querySelector('.bd-btns'),a.cta_btns);show(cta,!!(a.cta_t||a.cta_p||(a.cta_btns||[]).length))}
 /* sidebar: related posts */
 var rel=q('.bd-rel');if(rel){var rh=rel.querySelector('h3');[].slice.call(rel.querySelectorAll('a')).forEach(function(x){x.remove()});if(rh){rh.textContent=a.rel_t||'';show(rh,!!a.rel_t)}
  (a.related||[]).forEach(function(r){var x=document.createElement('a');x.href=r.isNew?'#':'../../blogs/'+r.slug+'/index.html';
   if(r.thumb){var i=document.createElement('img');i.src=pImg(r.thumb);i.alt='';i.width=70;i.height=56;x.appendChild(i)}x.appendChild(pEl('span','',r.title||''));if(arrow)x.insertAdjacentHTML('beforeend',arrow);rel.appendChild(x)});show(rel,!!(a.related||[]).length)}
 /* closing band */
 var bd=q('.bd-band');if(bd){var bh=bd.querySelector('h2'),bp=bd.querySelector('p');if(bh){bh.textContent=a.band_h2||'';show(bh,!!a.band_h2)}if(bp){bp.textContent=a.band_p||'';show(bp,!!a.band_p)}mkBtns(bd.querySelector('.bd-btns'),a.band_btns);show(bd.closest('.bd-band-end'),!!(a.band_h2||a.band_p||(a.band_btns||[]).length))}
 if(a.title)document.title=a.title;
 return 1}
/* ---- Service page: the whole page is rebuilt from the draft (hero, stats, every section, nav, final CTA) using the real service-page markup ---- */
function sE(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function sH(s){return !!String(s==null?'':s).trim()}
function sList(a){return (a||[]).filter(sH)}
function servicePage(a){
 var main=q('main')||document.body,IC={};
 function svgs(sel){return [].slice.call(document.querySelectorAll(sel)).map(function(e){return e.outerHTML})}
 function one(sel){var e=q(sel);return e?e.outerHTML:''}
 IC.tick=one('.sd-tick li svg');IC.cards=svgs('#types .sd-card .sd-ico svg').concat(svgs('#ignored .sd-card .sd-ico svg'));
 IC.cols=svgs('#symptoms .sd-col h3 .sd-ico svg');IC.warn=one('.sd-warn svg');IC.note=one('.sd-note svg');IC.laser=one('#laser .sd-box h3 .sd-ico svg');
 IC.urgent=one('.sd-box.urgent h3 svg');IC.urgentBtn=one('.sd-box.urgent a svg');IC.accent=one('.sd-box.accent h3 svg');IC.accentBtn=one('.sd-box.accent a svg');
 IC.why=svgs('.sd-why li svg');IC.addr=svgs('.sd-addr p svg');IC.vbtn=svgs('.sd-vtxt .sd-btns a svg');IC.more=one('.myth-btn:not(.back) svg');IC.back=one('.myth-btn.back svg');
 var st=a.settings||{},wa='https://wa.me/'+String(st.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(st.waText||''),tel='tel:'+String(st.phone||'').replace(/[^\d+]/g,'');
 function cyc(arr,i){return arr.length?arr[i%arr.length]:''}
 function cardIco(it,i){var base=cyc(IC.cards,i);if(it&&it.ico&&base){var w=document.createElement('div');w.innerHTML=base;var sv=w.firstChild;sv.innerHTML=it.ico;return sv.outerHTML}return base}
 function head(d,left,intro){var h='<span class="eyebrow">'+sE(d.eyebrow)+'</span>';if(!sH(d.eyebrow))h='';
  var t=sH(d.h2)?'<h2>'+sE(d.h2)+'</h2>':'',p=sH(intro)?'<p>'+sE(intro)+'</p>':'';
  return (h||t||p)?'<div class="sd-head'+(left?' left':'')+'">'+h+t+p+'</div>':''}
 function paras(l){return sList(l).map(function(x){return '<p>'+sE(x)+'</p>'}).join('')}
 function tick(l){l=sList(l);return l.length?'<ul class="sd-tick">'+l.map(function(x){return '<li>'+IC.tick+'<span>'+sE(x)+'</span></li>'}).join('')+'</ul>':''}
 function gcls(n){return n<=2?'c2':n===3?'c3':n===4?'c4':n===5?'c5':'c3'}
 function fig(img,alt,cap,cls){if(!sH(img))return '';return '<figure class="sd-fig'+(cls?' '+cls:'')+'"><img src="'+sE(pImg(img))+'" alt="'+sE(alt||'')+'" loading="lazy">'+(sH(cap)?'<figcaption>'+sE(cap)+'</figcaption>':'')+'</figure>'}
 function cards(items,off){items=(items||[]).filter(function(x){return sH(x.t)||sH(x.d)});if(!items.length)return '';
  return '<div class="sd-grid '+gcls(items.length)+'">'+items.map(function(x,i){return '<article class="sd-card"><span class="sd-ico">'+cardIco(x,i+(off||0))+'</span>'+(sH(x.t)?'<h3>'+sE(x.t)+'</h3>':'')+(sH(x.d)?'<p>'+sE(x.d)+'</p>':'')+'</article>'}).join('')+'</div>'}
 var B={
  overview:function(d){var minis=(d.minis||[]).filter(function(x){return sH(x.t)||sH(x.d)}),box=(d.box||[]).filter(function(x){return sH(x.k)||sH(x.d)});
   var left='<div>'+head(d,true)+paras(d.paras)+(minis.length?'<div class="sd-minis">'+minis.map(function(x){return '<div class="sd-mini">'+(sH(x.t)?'<b>'+sE(x.t)+'</b>':'')+(sH(x.d)?'<p>'+sE(x.d)+'</p>':'')+'</div>'}).join('')+'</div>':'')+'</div>';
   var side=box.length?'<aside class="sd-gradebox">'+(sH(d.box_t)?'<h3>'+sE(d.box_t)+'</h3>':'')+'<div class="sd-grades">'+box.map(function(x,i){return '<div class="sd-grade g'+(i%4+1)+'"><span title="'+sE(String(x.k||'').replace(/:\s*$/,''))+'">'+sE(x.n||(i+1))+'</span><p>'+(sH(x.k)?'<b>'+sE(x.k)+'</b> ':'')+sE(x.d)+'</p></div>'}).join('')+'</div></aside>':'';
   if(!sH(d.h2)&&!sH(d.eyebrow)&&!sList(d.paras).length&&!minis.length&&!side)return '';
   return '<div class="sd-two"'+(side?'':' style="grid-template-columns:minmax(0,1fr)"')+'>'+left+side+'</div>'},
  types:function(d){var c=cards(d.items,0);if(!c&&!sH(d.h2))return '';return head(d,false,d.intro)+c},
  symptoms:function(d){var cols=(d.cols||[]).filter(function(c){return sH(c.t)||sList(c.items).length});
   var g=cols.length?'<div class="sd-grid '+(cols.length>=3?'c3':'c2')+'">'+cols.map(function(c,i){return '<div class="sd-col">'+(sH(c.t)?'<h3><span class="sd-ico sm">'+cyc(IC.cols,i)+'</span>'+sE(c.t)+'</h3>':'')+tick(c.items)+'</div>'}).join('')+'</div>':'';
   var w=sH(d.warn)?'<div class="sd-warn">'+IC.warn+'<p>'+sE(d.warn)+'</p></div>':'';if(!g&&!w&&!sH(d.h2))return '';return head(d)+g+w},
  causes:function(d){var chips=sList(d.chips);if(!chips.length&&!sH(d.h2)&&!sList(d.paras).length)return '';
   return '<div class="sd-two"'+(chips.length?'':' style="grid-template-columns:minmax(0,1fr)"')+'><div>'+head(d,true)+paras(d.paras)+'</div>'+(chips.length?'<div class="sd-chips">'+chips.map(function(x){return '<span class="sd-chip">'+sE(x)+'</span>'}).join('')+'</div>':'')+'</div>'},
  diagnosis:function(d){var it=(d.items||[]).filter(function(x){return sH(x.t)||sH(x.d)});if(!it.length&&!sH(d.h2)&&!sH(d.note))return '';
   return head(d,false,d.intro)+(it.length?'<ol class="sd-steps">'+it.map(function(x,i){return '<li><span class="n">'+(i+1)+'</span>'+(sH(x.t)?'<h3>'+sE(x.t)+'</h3>':'')+(sH(x.d)?'<p>'+sE(x.d)+'</p>':'')+'</li>'}).join('')+'</ol>':'')+(sH(d.note)?'<p class="sd-note">'+IC.note+sE(d.note)+'</p>':'')},
  nonsurgical:function(d){var gr=(d.groups||[]).filter(function(g){return sH(g.t)||sList(g.items).length}),f=fig(d.img,d.alt,d.cap);if(!gr.length&&!f&&!sH(d.h2))return '';
   var gh=gr.length?'<div class="sd-groups">'+gr.map(function(g){return '<div class="sd-group">'+(sH(g.t)?'<h3>'+sE(g.t)+'</h3>':'')+tick(g.items)+'</div>'}).join('')+'</div>':'';
   return head(d,false,d.intro)+((gh||f)?'<div class="sd-split"'+(gh&&f?'':' style="grid-template-columns:minmax(0,1fr)"')+'>'+gh+f+'</div>':'')},
  surgery:function(d){var rows=(d.rows||[]).filter(function(r){return (r||[]).some(sH)}),hd=(d.head&&d.head.some(sH)?d.head:['Option','Suited to','Things to know']),f=fig(d.img,d.alt,d.cap,'tall');
   if(!rows.length&&!f&&!sH(d.h2)&&!sH(d.intro))return '';
   var tb=rows.length?'<div class="sd-table surg"><table><thead><tr>'+hd.map(function(h){return '<th>'+sE(h)+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+hd.map(function(h,i){return '<td data-l="'+sE(h)+'">'+sE(r[i])+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>':'';
   return '<div class="sd-surg"'+(f?'':' style="grid-template-columns:minmax(0,1fr)"')+'>'+f+'<div>'+head(d,true,d.intro)+tb+'</div></div>'},
  laser:function(d){var note=sList(d.note);if(!note.length&&!sH(d.h2)&&!sList(d.paras).length)return '';
   return '<div class="sd-laser"'+(note.length?'':' style="grid-template-columns:minmax(0,1fr)"')+'><div>'+head(d,true)+paras(d.paras)+'</div>'+(note.length?'<div class="sd-stack"><div class="sd-box glass">'+(sH(d.note_t)?'<h3><span class="sd-ico sm">'+IC.laser+'</span>'+sE(d.note_t)+'</h3>':'')+tick(note)+'</div></div>':'')+'</div>'},
  journey:function(d){var it=(d.items||[]).filter(function(x){return sH(x.t)||sH(x.d)});if(!it.length&&!sH(d.h2))return '';
   return head(d)+(it.length?'<ol class="sd-journey go">'+it.map(function(x,i){return '<li><span class="dot">'+(i+1)+'</span>'+(sH(x.t)?'<h3>'+sE(x.t)+'</h3>':'')+(sH(x.d)?'<p>'+sE(x.d)+'</p>':'')+'</li>'}).join('')+'</ol>':'')},
  recovery:function(d){var help=sList(d.help),hasU=sH(d.call);if(!help.length&&!hasU&&!sH(d.h2)&&!sH(d.lead)&&!sH(d.img))return '';
   var ban=sH(d.img)?'<figure class="sd-banner"><img src="'+sE(pImg(d.img))+'" alt="'+sE(d.alt||'')+'" loading="lazy"></figure>':'';
   var hb=help.length?'<div class="sd-box">'+(sH(d.help_t)?'<h3>'+sE(d.help_t)+'</h3>':'')+tick(help)+'</div>':'';
   var ub=hasU?'<div class="sd-box urgent">'+(sH(d.call_t)?'<h3>'+IC.urgent+' '+sE(d.call_t)+'</h3>':'')+(sH(d.call)?'<p>'+sE(d.call)+'</p>':'')+(sH(d.call_btn)?'<a class="btn btn-a btn-sm" href="'+sE(tel)+'">'+IC.urgentBtn+' '+sE(d.call_btn)+'</a>':'')+'</div>':'';
   return head(d)+(sH(d.lead)?'<p class="sd-lead">'+sE(d.lead)+'</p>':'')+ban+((hb||ub)?'<div class="sd-grid '+(hb&&ub?'c2':'c2')+' recov">'+hb+ub+'</div>':'')},
  ignored:function(d){var c=cards(d.items,4);if(!c&&!sH(d.h2))return '';return head(d,false,d.intro)+c},
  myths:function(d){var it=(d.items||[]).filter(function(x){return sH(x.m)||sH(x.f)});if(!it.length&&!sH(d.h2))return '';
   return head(d)+(it.length?'<div class="sd-grid '+gcls(it.length)+'"'+(it.length===1?' style="grid-template-columns:minmax(0,520px);justify-content:center"':'')+'>'+it.map(function(x){return '<div class="sd-myth"><div class="in"><div class="fr"><span>Myth</span><b>'+sE(x.m)+'</b><button type="button" class="myth-btn" aria-label="Know more: see the fact"><span>Know more</span>'+IC.more+'</button></div><div class="bk"><span>Fact</span><p>'+sE(x.f)+'</p><button type="button" class="myth-btn back" aria-label="Back to the myth">'+IC.back+'<span>Back</span></button></div></div></div>'}).join('')+'</div>'+(sH(d.hint)?'<p class="sd-hint">'+sE(d.hint)+'</p>':''):'')},
  cost:function(d){var items=sList(d.items),hasB=sH(d.box_t)||sH(d.box);if(!items.length&&!hasB&&!sH(d.h2)&&!sList(d.paras).length)return '';
   var side=hasB?'<aside class="sd-box accent">'+(sH(d.box_t)?'<h3>'+IC.accent+' '+sE(d.box_t)+'</h3>':'')+(sH(d.box)?'<p>'+sE(d.box)+'</p>':'')+(sH(d.box_btn)?'<a class="btn btn-a btn-sm" href="../../book-appointment/index.html">'+IC.accentBtn+' '+sE(d.box_btn)+'</a>':'')+'</aside>':'';
   return '<div class="sd-two"'+(side?'':' style="grid-template-columns:minmax(0,1fr)"')+'><div>'+head(d,true)+paras(d.paras)+tick(items)+'</div>'+side+'</div>'},
  why:function(d){var pts=(d.points||[]).filter(function(x){return sH(x.t)||sH(x.d)}),f=fig(d.img,d.alt,d.cap);if(!pts.length&&!f&&!sH(d.h2))return '';
   return '<div class="sd-split whysp"'+(f?'':' style="grid-template-columns:minmax(0,1fr)"')+'><div>'+head(d,true,d.intro)+(pts.length?'<ul class="sd-why">'+pts.map(function(x,i){return '<li>'+cyc(IC.why,i)+'<div>'+(sH(x.t)?'<b>'+sE(x.t)+'</b>':'')+(sH(x.d)?'<p>'+sE(x.d)+'</p>':'')+'</div></li>'}).join('')+'</ul>':'')+'</div>'+f+'</div>'},
  visit:function(d){if(!sH(d.h2)&&!sH(d.img)&&!sH(d.eyebrow))return '';
   var im=sH(d.img)?'<figure class="sd-vimg"><img src="'+sE(pImg(d.img))+'" alt="'+sE(d.alt||'')+'" loading="lazy">'+(sH(d.cap)?'<figcaption>'+sE(d.cap)+'</figcaption>':'')+'</figure>':'';
   var maps=st.mapsLink||('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(st.address||'')),nm=st.name||'';
   var ad='<div class="sd-addr"><p>'+(IC.addr[0]||'')+'<span>'+(nm?'<b>'+sE(nm)+'</b><br>':'')+sE(String(st.address||'').replace(/,\s*Maharashtra(?=\s*\d)/,''))+'</span></p><div class="two"><p>'+(IC.addr[1]||'')+'<span>'+sE(st.hours||'')+'</span></p><p>'+(IC.addr[2]||'')+'<span><a href="'+sE(tel)+'">'+sE(st.phoneDisplay||st.phone||'')+'</a></span></p></div></div>';
   var bt='<div class="sd-btns"><a class="btn btn-a btn-sm" href="'+sE(maps)+'" target="_blank" rel="noopener">'+(IC.vbtn[0]||'')+' Get Directions</a><a class="btn btn-p btn-sm" href="'+sE(tel)+'">'+(IC.vbtn[1]||'')+' Call Now</a><a class="btn btn-ol btn-sm" href="'+sE(wa)+'" target="_blank" rel="noopener">'+(IC.vbtn[2]||'')+' WhatsApp Chat</a></div>';
   return '<div class="sd-visit-card"'+(im?'':' style="grid-template-columns:minmax(0,1fr)"')+'>'+im+'<div class="sd-vtxt">'+head(d,true)+ad+bt+'</div></div>'},
  faq:function(d){var it=(d.items||[]).filter(function(x){return sH(x.q)||sH(x.a)});if(!it.length&&!sH(d.h2))return '';
   return head(d)+(it.length?'<div class="sd-faq"'+(it.length===1?' style="grid-template-columns:minmax(0,1fr)"':'')+'>'+it.map(function(x){return '<div class="acc"><button class="acc-q" aria-expanded="false">'+sE(x.q)+'<span class="pm"></span></button><div class="acc-a"><div><p>'+sE(x.a)+'</p></div></div></div>'}).join('')+'</div>':'')}
 };
 var BG={overview:'white',types:'blush',symptoms:'white',causes:'dark',diagnosis:'white',nonsurgical:'soft',surgery:'white',laser:'dark',journey:'soft',recovery:'white',ignored:'blush',myths:'soft',cost:'white',why:'dark',visit:'white',faq:'soft'};
 var NAV={overview:'Overview',symptoms:'Symptoms',diagnosis:'Diagnosis',nonsurgical:'Treatment',surgery:'Surgery',recovery:'Recovery',cost:'Cost',faq:'FAQs'};
 var by={};(a.sections||[]).forEach(function(s){by[s.id]=s});
 function sec(id){var s=by[id];return s&&s.visible!==false?s.d||{}:null}
 /* hero */
 var name=a.name||'New service',hd=sec('hero');
 var bc=q('.bc');if(bc){var tn=null;[].slice.call(bc.childNodes).forEach(function(n){if(n.nodeType===3&&n.nodeValue.trim())tn=n});if(tn)tn.nodeValue=name;else bc.appendChild(document.createTextNode(name))}
 if(hd){var he=q('.sd-hero .eyebrow'),h1=q('.sd-hero h1'),sh=q('.sd-hero .sd-short'),sb=q('.sd-hero .sd-by'),f1=q('.sd-float.f1 span'),f2=q('.sd-float.f2 span');
  if(he){he.textContent=hd.eyebrow||'';he.style.display=sH(hd.eyebrow)?'':'none'}
  if(h1)h1.textContent=hd.h1||name;
  if(sh){sh.innerHTML=(sH(hd.short_label)?'<b>'+sE(hd.short_label)+'</b> ':'')+sE(hd.short||'');sh.style.display=(sH(hd.short)||sH(hd.short_label))?'':'none'}
  if(sb){var sp=sb.querySelector('span');if(sp)sp.textContent=hd.byline||'';sb.style.display=sH(hd.byline)?'':'none'}
  if(f1){f1.textContent=hd.float1||'';f1.parentNode.style.display=sH(hd.float1)?'':'none'}
  if(f2){f2.textContent=hd.float2||'';f2.parentNode.style.display=sH(hd.float2)?'':'none'}}
 else{var hs=q('.sd-hero');if(hs)hs.style.display='none'}
 /* stats */
 var sd=sec('stats'),stw=q('.sd-stats');
 if(stw){var tiles=sd?(sd.items||[]).filter(function(x){return sH(x.num)||sH(x.text)}):[];
  stw.innerHTML=tiles.map(function(x){var v=sH(x.num)?(isNaN(+x.num)?String(x.num):(+x.num).toLocaleString('en-IN'))+(x.suf||''):x.text;return '<div class="sd-stat"><b>'+sE(v)+'</b><span>'+sE(x.label||'')+'</span></div>'}).join('');
  stw.style.gridTemplateColumns=tiles.length&&tiles.length<4?'repeat('+tiles.length+',minmax(0,1fr))':'';var sc=stw.closest('.container')||stw;sc.style.display=tiles.length?'':'none'}
 /* sections */
 var cta=q('.sd-final'),olds=[].slice.call(document.querySelectorAll('main > section.sd-sec,body > section.sd-sec')),made=[],navL=[];
 olds.forEach(function(e){e.remove()});
 (a.sections||[]).forEach(function(s){var f=B[s.id];if(!f||s.visible===false)return;var inner=f(s.d||{});if(!inner)return;
  var el=document.createElement('section');el.className='sd-sec sd-'+(BG[s.id]||'white');el.id=s.id;
  el.innerHTML='<span class="sd-orb o1"></span><span class="sd-orb o2"></span><div class="container">'+inner+'</div>';
  if(cta&&cta.parentNode)cta.parentNode.insertBefore(el,cta);else main.appendChild(el);made.push(el);if(NAV[s.id])navL.push(s.id)});
 /* page nav */
 var nv=q('.sd-nav-in'),nav=q('.sd-nav');
 if(nv){nv.innerHTML=navL.map(function(id){return '<a href="#'+id+'">'+NAV[id]+'</a>'}).join('');
  if(nav)nav.style.display=navL.length?'':'none';
  var links=[].slice.call(nv.querySelectorAll('a')),spy=function(){var y=window.innerHeight*.3,idx=-1;links.forEach(function(l,k){var t=document.getElementById(l.getAttribute('href').slice(1));if(t&&t.getBoundingClientRect().top<=y)idx=k});links.forEach(function(l,k){l.classList.toggle('on',k===idx)})};
  addEventListener('scroll',spy,{passive:true});spy()}
 /* behaviours of the rebuilt parts */
 made.forEach(function(el){
  [].slice.call(el.querySelectorAll('.acc-q')).forEach(function(b){b.onclick=function(){var p=b.parentElement,o=p.classList.toggle('open');b.setAttribute('aria-expanded',o)}});
  [].slice.call(el.querySelectorAll('.sd-myth')).forEach(function(m){[].slice.call(m.querySelectorAll('.myth-btn')).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();m.classList.toggle('flip')})})})});
 /* final CTA + disclaimer */
 var cd=sec('cta');if(cta){if(cd){var ch=cta.querySelector('h2'),cp=cta.querySelector('.txt p');if(ch){ch.textContent=cd.h2||'';ch.style.display=sH(cd.h2)?'':'none'}if(cp){cp.textContent=cd.p||'';cp.style.display=sH(cd.p)?'':'none'}}else cta.style.display='none'}
 var md=sec('medical'),me=q('.sd-medical');if(me){if(md&&sH(md.text))me.textContent=md.text;else me.style.display='none'}
 /* contact details follow the draft settings */
 [].slice.call(main.querySelectorAll('a')).forEach(function(l){var h=l.getAttribute('href')||'';if(/^tel:/.test(h))l.setAttribute('href',tel);else if(/wa\.me/.test(h)&&String(st.whatsapp||'').trim())l.setAttribute('href',wa)});
 document.title=name+' | '+(st.name||'');
 return 1}
function hide(h){var el=h.sel&&q(h.sel);if(!el&&h.h2){var hs=document.querySelectorAll('h1,h2');for(var i=0;i<hs.length;i++)if(norm(hs[i].textContent)===norm(h.h2)){el=hs[i].closest('section');break}}if(el){el.style.display='none';return 1}return 0}
function apply(m){var ok=0,miss=[];
 (m.hides||[]).forEach(function(h){hide(h)});
 (m.pairs||[]).forEach(function(p){var r=0;
  if(p.rich)r=rich(p);else if(p.rep){var sc0=p.scope&&q(p.scope);r=rep(p,sc0||document.body)}else if(p.mode==='sub')r=sub(p);else{var sc=p.scope&&q(p.scope),root=sc||document.body;p.all=!sc;r=exact(root,p);if(!r&&root!==document.body)r=exact(document.body,p)}
  r?ok++:miss.push(p.rep?'list change':String(p.o||p.id).slice(0,50))});
 try{if(m.post){postPage(m.post)?ok++:miss.push('article')}}catch(e){miss.push('article')}
 try{if(m.service){servicePage(m.service)?ok++:miss.push('service page')}}catch(e){miss.push('service page')}
 var cd=m.cards||{};
 try{if(cd.services){svcCards(cd.services)?ok++:miss.push('service cards')}}catch(e){miss.push('service cards')}
 try{if(cd.posts){postCards(cd.posts)?ok++:miss.push('blog cards')}}catch(e){miss.push('blog cards')}
 try{if(cd.reviews&&cd.reviews.length){reviewCards(cd.reviews)?ok++:miss.push('review cards')}}catch(e){miss.push('review cards')}
 return{ok:ok,miss:miss}}
addEventListener('message',function(e){var m=e.data;if(m&&m.t==='apply'){var r=apply(m);parent.postMessage({t:'done',ok:r.ok,miss:r.miss},'*')}});
addEventListener('load',function(){setTimeout(function(){parent.postMessage({t:'ready'},'*')},450)});
})();
