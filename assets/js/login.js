/* Demo-only login. Credentials are checked in the browser and are NOT secure. */
const $=s=>document.querySelector(s);
const show=(id,t)=>{const e=$('#'+id);e.textContent=t||'';e.hidden=!t};
lucide.createIcons();
try{const r=localStorage.getItem('disha:remember');if(r){$('#em').value=r;$('#rm').checked=true}}catch(e){}
$('#eye').onclick=()=>{const p=$('#pw');p.type=p.type==='password'?'text':'password'};
$('#fp').onclick=e=>{e.preventDefault();show('fe','Password reset needs a backend. For this demo use admin@disha.demo / Admin@123.')};
$('#lf').onsubmit=e=>{e.preventDefault();['eme','pwe','fe'].forEach(i=>show(i,''));
 const em=$('#em').value.trim(),pw=$('#pw').value;let ok=true;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){show('eme','Enter a valid email address.');ok=false}
 if(!pw){show('pwe','Enter your password.');ok=false}
 if(!ok)return;
 if(em.toLowerCase()==='admin@disha.demo'&&pw==='Admin@123'){
  sessionStorage.setItem('disha_auth','1');
  try{const rm=$('#rm').checked;rm?localStorage.setItem('disha:remember',em):localStorage.removeItem('disha:remember')}catch(x){}
  location.href='pages/dashboard.html'
 }else show('fe','Email or password is incorrect.')};
