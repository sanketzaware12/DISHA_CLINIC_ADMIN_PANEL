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
function hide(h){var el=h.sel&&q(h.sel);if(!el&&h.h2){var hs=document.querySelectorAll('h1,h2');for(var i=0;i<hs.length;i++)if(norm(hs[i].textContent)===norm(h.h2)){el=hs[i].closest('section');break}}if(el){el.style.display='none';return 1}return 0}
function apply(m){var ok=0,miss=[];
 (m.hides||[]).forEach(function(h){hide(h)});
 (m.pairs||[]).forEach(function(p){var r=0;
  if(p.rich)r=rich(p);else if(p.mode==='sub')r=sub(p);else{var sc=p.scope&&q(p.scope),root=sc||document.body;p.all=!sc;r=exact(root,p);if(!r&&root!==document.body)r=exact(document.body,p)}
  r?ok++:miss.push(String(p.o||p.id).slice(0,50))});
 return{ok:ok,miss:miss}}
addEventListener('message',function(e){var m=e.data;if(m&&m.t==='apply'){var r=apply(m);parent.postMessage({t:'done',ok:r.ok,miss:r.miss},'*')}});
addEventListener('load',function(){setTimeout(function(){parent.postMessage({t:'ready'},'*')},450)});
})();
