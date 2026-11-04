'use strict';
const VOUCHERS=[
{id:'spa',name:'Dzień w SPA',cat:'Relaks',emoji:'💆',g:'#ffafbd,#ffc3a0',values:[150,250,400],desc:'Masaż, sauna i chwila wytchnienia w wybranym salonie SPA.',img:'img/spa.jpg',tiers:{"150": "Masaż relaksacyjny całego ciała (60 min) z aromaterapią.", "250": "Masaż gorącymi kamieniami (90 min) + 2 godziny w strefie saun i jacuzzi.", "400": "Całodniowy pakiet: masaż (90 min), zabieg na twarz, strefa saun i basen, lunch i herbata ziołowa."}},
{id:'kolacja',name:'Kolacja dla dwojga',cat:'Gastronomia',emoji:'🍝',g:'#f6d365,#fda085',values:[200,300,500],desc:'Romantyczna kolacja w jednej z partnerskich restauracji.',img:'img/kolacja.jpg',tiers:{"200": "Trzydaniowe menu dla dwóch osób (przystawka, danie główne, deser) + woda.", "300": "Czterodaniowe menu degustacyjne dla dwojga + butelka wina domowego.", "500": "Siedmiodaniowe menu degustacyjne szefa kuchni z doborem win, stolik przy oknie i powitalny kieliszek prosecco."}},
{id:'skok',name:'Skok ze spadochronem',cat:'Przygoda',emoji:'🪂',g:'#84fab0,#8fd3f4',values:[600,900],desc:'Skok w tandemie z instruktorem – adrenalina gwarantowana.',img:'img/skok.jpg',tiers:{"600": "Skok w tandemie z wysokości 3000 m, ok. 30 s swobodnego spadania, szkolenie przedskokowe i certyfikat.", "900": "Skok w tandemie z wysokości 4000 m (ok. 50 s spadania) + profesjonalny film i zdjęcia z kamery instruktora."}},
{id:'kino',name:'Bilety do kina',cat:'Rozrywka',emoji:'🎬',g:'#a18cd1,#fbc2eb',values:[50,100,150],desc:'Voucher na seanse w sieci kin w całej Polsce.',img:'img/kino.jpg',tiers:{"50": "2 bilety na seans 2D w dowolny dzień tygodnia.", "100": "2 bilety na seans 3D lub IMAX + duży popcorn i 2 napoje.", "150": "2 bilety na seans w sali VIP (fotele rozkładane) + zestaw przekąsek i napojów."}},
{id:'ksiazki',name:'Karta do księgarni',cat:'Kultura',emoji:'📚',g:'#cfd9df,#e2ebf0',values:[50,100,200],desc:'Do wykorzystania na książki, e-booki i audiobooki.',img:'img/ksiazki.jpg',tiers:{"50": "Karta podarunkowa o wartości 50 zł – np. jedna nowość wydawnicza lub dwa e-booki.", "100": "Karta o wartości 100 zł do wykorzystania na książki, e-booki i audiobooki w księgarni stacjonarnej i online.", "200": "Karta o wartości 200 zł + darmowa dostawa zamówień online i 10% rabatu na kolejne zakupy."}},
{id:'gokarty',name:'Jazda gokartami',cat:'Przygoda',emoji:'🏎️',g:'#ff9a9e,#fecfef',values:[120,220],desc:'Wyścig na profesjonalnym torze kartingowym.',img:'img/gokarty.jpg',tiers:{"120": "2 sesje po 10 minut na torze z pomiarem czasu, kask i kominiarka w cenie.", "220": "Grand Prix: trening (10 min), kwalifikacje (8 min) i wyścig (15 min) + wydruk wyników i dyplom."}},
{id:'kawa',name:'Warsztaty baristyczne',cat:'Gastronomia',emoji:'☕',g:'#d4a373,#faedcd',values:[180,280],desc:'Naucz się parzyć kawę jak profesjonalista.',img:'img/kawa.jpg',tiers:{"180": "Warsztaty podstawowe (3 h): espresso, mielenie i dobór ziaren, degustacja 3 kaw.", "280": "Warsztaty rozszerzone (5 h): espresso, spienianie mleka i latte art, metody alternatywne (drip, aeropress) + 250 g kawy na wynos."}},
{id:'joga',name:'Karnet na jogę',cat:'Relaks',emoji:'🧘',g:'#a1c4fd,#c2e9fb',values:[100,250,450],desc:'Zajęcia jogi dla początkujących i zaawansowanych.',img:'img/joga.jpg',tiers:{"100": "Karnet na 4 zajęcia grupowe (60 min) w ciągu miesiąca.", "250": "Karnet na 12 zajęć grupowych + mata do ćwiczeń w prezencie.", "450": "Karnet open na 3 miesiące (nielimitowane zajęcia) + 2 sesje indywidualne z instruktorem."}}];
const KEY='voucherCart',ORDER='voucherLastOrder',USERS='voucherUsers',SESSION='voucherSession';
// DEMO: konta tylko w localStorage przeglądarki, bez backendu. Hasła hashowane SHA-256 (SubtleCrypto) – nadal tylko makieta.
const getUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS))||{}}catch(e){return{}}};
const setUsers=u=>localStorage.setItem(USERS,JSON.stringify(u));
const me=()=>{const e=localStorage.getItem(SESSION);return e?getUsers()[e]||null:null};
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function updateUser(){const u=me(),a=document.getElementById('user-link');if(a){a.textContent=u?'👤 '+u.name:'Zaloguj';a.href=u?'#/konto':'#/logowanie'}}
const $app=document.getElementById('app');
const pln=n=>n.toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2})+' zł';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const find=id=>VOUCHERS.find(v=>v.id===id);
const thumb=(v,cls='thumb')=>`<div class="${cls}" style="background:linear-gradient(135deg,${v.g})"><span class="emo">${v.emoji}</span>${v.img?`<img src="${v.img}" alt="${esc(v.name)}" loading="lazy" onerror="this.remove()">`:''}</div>`;
const tier=(v,x)=>(v.tiers&&v.tiers[x])||'';
function getCart(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
function setCart(c){localStorage.setItem(KEY,JSON.stringify(c));updateBadge()}
function updateBadge(){document.getElementById('cart-count').textContent=getCart().reduce((s,i)=>s+i.qty,0)}
const total=c=>c.reduce((s,i)=>s+i.value*i.qty,0);
let filter='Wszystkie',pf='Wszystkie ceny';
const PR={'Wszystkie ceny':[0,1e9],'Do 100 zł':[0,100],'100–200 zł':[101,200],'200–500 zł':[201,500],'Powyżej 500 zł':[501,1e9]};

function catalog(){
  const cats=['Wszystkie',...new Set(VOUCHERS.map(v=>v.cat))];
  const [lo,hi]=PR[pf];const list=VOUCHERS.filter(v=>(filter==='Wszystkie'||v.cat===filter)&&v.values.some(x=>x>=lo&&x<=hi));
  $app.innerHTML=`<h1>Katalog voucherów</h1>
  <div class="filters">${cats.map(c=>`<button class="chip ${c===filter?'active':''}" data-cat="${c}">${c}</button>`).join('')}</div>
  <div class="filters">${Object.keys(PR).map(c=>`<button class="chip pchip ${c===pf?'active':''}" data-p="${c}">💰 ${c}</button>`).join('')}</div>
  <div class="grid">${list.length?'':'<p>Brak voucherów w tym przedziale.</p>'}${list.map(v=>`<a class="card" href="#/voucher/${v.id}">${thumb(v)}<div class="card-body"><span class="cat">${v.cat}</span><strong>${v.name}</strong><span class="price">od ${pln(Math.min(...v.values))}</span></div></a>`).join('')}</div>`;
  $app.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{if(b.dataset.p)pf=b.dataset.p;else filter=b.dataset.cat;catalog()});
}
function detail(id){
  const v=find(id);if(!v)return notFound();
  let val=v.values[0],qty=1;
  $app.innerHTML=`<a href="#/" class="btn ghost small">← Wróć do katalogu</a><br><br>
  <div class="detail">${thumb(v)}<div><span class="cat">${v.cat}</span><h1>${v.name}</h1><p>${v.desc}</p>
  <p class="cat">Ważny 12 miesięcy · wysyłka e-mailem (PDF)</p>
  <strong>Wybierz wartość</strong><div class="options">${v.values.map((x,i)=>`<button class="opt ${i?'':'active'}" data-v="${x}">${pln(x)}</button>`).join('')}</div>
  <p class="tier" id="tier">${esc(tier(v,val))}</p>
  <strong>Ilość</strong><div class="row"><div class="qty"><button id="m">−</button><span id="q">1</span><button id="p">+</button></div></div>
  <div class="total"><span>Razem</span><span id="sum">${pln(val)}</span></div>
  <button class="btn" id="add">Dodaj do koszyka</button> <span id="msg"></span></div></div>`;
  const upd=()=>{document.getElementById('q').textContent=qty;document.getElementById('sum').textContent=pln(val*qty)};
  $app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{$app.querySelectorAll('.opt').forEach(o=>o.classList.remove('active'));b.classList.add('active');val=+b.dataset.v;document.getElementById('tier').textContent=tier(v,val);upd()});
  document.getElementById('m').onclick=()=>{if(qty>1)qty--;upd()};
  document.getElementById('p').onclick=()=>{if(qty<20)qty++;upd()};
  document.getElementById('add').onclick=()=>{const c=getCart();const e=c.find(i=>i.id===v.id&&i.value===val);e?e.qty+=qty:c.push({id:v.id,value:val,qty});setCart(c);
    document.getElementById('msg').innerHTML=' ✅ Dodano! <a href="#/koszyk" style="color:var(--p);font-weight:600">Przejdź do koszyka</a>'};
}
function cart(){
  const c=getCart();
  if(!c.length){$app.innerHTML=`<h1>Koszyk</h1><div class="panel empty">Twój koszyk jest pusty.<br><br><a class="btn" href="#/">Przeglądaj vouchery</a></div>`;return}
  $app.innerHTML=`<h1>Koszyk</h1><div class="layout"><div class="panel">${c.map((i,k)=>{const v=find(i.id);return v?`<div class="cart-item">${thumb(v)}<div class="info"><strong>${v.name}</strong><div class="cat">Wartość: ${pln(i.value)}</div><div class="tier small">${esc(tier(v,i.value))}</div></div>
  <div class="qty"><button data-k="${k}" data-d="-1">−</button><span>${i.qty}</span><button data-k="${k}" data-d="1">+</button></div>
  <strong style="min-width:90px;text-align:right">${pln(i.value*i.qty)}</strong><button class="btn ghost small" data-rm="${k}">Usuń</button></div>`:''}).join('')}</div>
  <div class="panel"><h3>Podsumowanie</h3><div class="total"><span>Do zapłaty</span><span>${pln(total(c))}</span></div><a class="btn" style="display:block;text-align:center" href="#/platnosc">Przejdź do płatności</a></div></div>`;
  $app.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const c=getCart(),i=c[b.dataset.k];i.qty+= +b.dataset.d;if(i.qty<1)c.splice(b.dataset.k,1);setCart(c);cart()});
  $app.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const c=getCart();c.splice(b.dataset.rm,1);setCart(c);cart()});
}
function payment(){
  const c=getCart();if(!c.length){location.hash='#/koszyk';return}
  let method='karta';
  $app.innerHTML=`<h1>Płatność</h1><div class="layout"><form class="panel" id="f" novalidate>
  <div class="note">⚠️ DEMO – formularz jest wyłącznie makietą. Nie wpisuj prawdziwych danych karty; nic nie jest wysyłane ani obciążane.</div>
  <div class="two"><div><label>Imię i nazwisko</label><input name="name" value="${esc(me()?.name||'')}" required placeholder="Jan Kowalski"></div>
  <div><label>E-mail (tu wyślemy vouchery)</label><input name="email" type="email" value="${esc(me()?.email||'')}" required placeholder="jan@przyklad.pl"></div></div>
  <label>Metoda płatności</label><div class="methods"><div class="method active" data-m="karta">💳 Karta</div><div class="method" data-m="blik">📱 BLIK</div></div>
  <div id="karta"><label>Numer karty (demo)</label><input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19">
  <div class="two"><div><label>Data ważności</label><input name="exp" placeholder="MM/RR" maxlength="5"></div><div><label>CVC</label><input name="cvc" placeholder="123" maxlength="4" inputmode="numeric"></div></div></div>
  <div id="blik" hidden><label>Kod BLIK (demo, 6 cyfr)</label><input name="blik" inputmode="numeric" maxlength="6" placeholder="123456"></div>
  <div id="err" class="error"></div><br><button class="btn" style="width:100%">Zapłać ${pln(total(c))} (demo)</button></form>
  <div class="panel"><h3>Twoje zamówienie</h3>${c.map(i=>`<div class="row" style="justify-content:space-between"><span>${find(i.id).name} × ${i.qty}</span><span>${pln(i.value*i.qty)}</span></div>`).join('')}
  <div class="total"><span>Razem</span><span>${pln(total(c))}</span></div></div></div>`;
  $app.querySelectorAll('.method').forEach(m=>m.onclick=()=>{method=m.dataset.m;$app.querySelectorAll('.method').forEach(x=>x.classList.toggle('active',x===m));
    document.getElementById('karta').hidden=method!=='karta';document.getElementById('blik').hidden=method!=='blik'});
  document.getElementById('f').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const err=[];
    if(!d.name.trim())err.push('Podaj imię i nazwisko.');
    if(!/^\S+@\S+\.\S+$/.test(d.email))err.push('Podaj poprawny e-mail.');
    if(method==='karta'){if(d.card.replace(/\D/g,'').length<12)err.push('Numer karty jest za krótki.');if(!/^\d\d\/\d\d$/.test(d.exp))err.push('Data w formacie MM/RR.');if(!/^\d{3,4}$/.test(d.cvc))err.push('CVC: 3–4 cyfry.')}
    else if(!/^\d{6}$/.test(d.blik))err.push('Kod BLIK musi mieć 6 cyfr.');
    if(err.length){document.getElementById('err').innerHTML=err.join('<br>');return}
    const order={no:'VS-'+Date.now().toString(36).toUpperCase(),name:d.name,email:d.email,method,items:c,total:total(c),date:new Date().toLocaleString('pl-PL')};
    localStorage.setItem(ORDER,JSON.stringify(order));const u=me();if(u){const us=getUsers();(us[u.email].orders=us[u.email].orders||[]).unshift(order);setUsers(us)}setCart([]);location.hash='#/sukces'};
}
function success(){
  let o;try{o=JSON.parse(localStorage.getItem(ORDER))}catch(e){}
  if(!o){location.hash='#/';return}
  $app.innerHTML=`<div class="panel success"><div class="big">🎉</div><h1>Dziękujemy za zamówienie!</h1>
  <p>Numer zamówienia: <strong>${o.no}</strong></p><p class="cat">${o.date} · ${o.method==='blik'?'BLIK':'Karta'} (demo)</p>
  <p>Vouchery wyślemy na adres <strong>${esc(o.email)}</strong> (symulacja).</p>
  <div style="text-align:left">${o.items.map(i=>`<div class="row" style="justify-content:space-between"><span>${find(i.id).name} (${pln(i.value)}) × ${i.qty}</span><span>${pln(i.value*i.qty)}</span></div>`).join('')}
  <div class="total"><span>Zapłacono</span><span>${pln(o.total)}</span></div></div><a class="btn" href="#/">Wróć do katalogu</a></div>`;
}
const DEMO='<div class="note">⚠️ DEMO – konta są przechowywane wyłącznie lokalnie w tej przeglądarce (localStorage). Brak serwera; nie używaj prawdziwego hasła.</div>';
function login(){
  if(me()){location.hash='#/konto';return}
  $app.innerHTML=`<h1>Logowanie</h1><form class="panel narrow" id="f" novalidate>${DEMO}
  <label>E-mail</label><input name="email" type="email" required><label>Hasło</label><input name="pass" type="password" required>
  <div id="err" class="error"></div><br><button class="btn" style="width:100%">Zaloguj się</button>
  <p>Nie masz konta? <a href="#/rejestracja" style="color:var(--p)">Zarejestruj się</a></p></form>`;
  document.getElementById('f').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const em=d.email.trim().toLowerCase();
    const u=getUsers()[em];if(!u||u.hash!==await sha256(u.salt+d.pass)){document.getElementById('err').textContent='Nieprawidłowy e-mail lub hasło.';return}
    localStorage.setItem(SESSION,em);updateUser();location.hash='#/konto'};
}
function register(){
  $app.innerHTML=`<h1>Rejestracja</h1><form class="panel narrow" id="f" novalidate>${DEMO}
  <label>Imię</label><input name="name" required><label>E-mail</label><input name="email" type="email" required>
  <label>Hasło (min. 8 znaków, litera i cyfra)</label><input name="pass" type="password" required><label>Powtórz hasło</label><input name="pass2" type="password" required>
  <div id="err" class="error"></div><br><button class="btn" style="width:100%">Załóż konto</button>
  <p>Masz już konto? <a href="#/logowanie" style="color:var(--p)">Zaloguj się</a></p></form>`;
  document.getElementById('f').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const em=d.email.trim().toLowerCase();const err=[];const us=getUsers();
    if(d.name.trim().length<2)err.push('Podaj imię (min. 2 znaki).');
    if(!/^\S+@\S+\.\S+$/.test(em))err.push('Podaj poprawny e-mail.');else if(us[em])err.push('Konto z tym e-mailem już istnieje.');
    if(d.pass.length<8||!/[a-zA-Z]/.test(d.pass)||!/\d/.test(d.pass))err.push('Hasło: min. 8 znaków, w tym litera i cyfra.');
    if(d.pass!==d.pass2)err.push('Hasła nie są identyczne.');
    if(err.length){document.getElementById('err').innerHTML=err.join('<br>');return}
    const salt=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');
    us[em]={name:d.name.trim(),email:em,salt,hash:await sha256(salt+d.pass),orders:[]};setUsers(us);localStorage.setItem(SESSION,em);updateUser();location.hash='#/konto'};
}
function account(){
  const u=me();if(!u){location.hash='#/logowanie';return}
  const o=u.orders||[];
  $app.innerHTML=`<h1>Moje konto</h1><div class="panel">${DEMO}<p><strong>Imię:</strong> ${esc(u.name)}<br><strong>E-mail:</strong> ${esc(u.email)}</p>
  <h3>Historia zamówień</h3>${o.length?o.map(x=>`<div class="order"><div class="row" style="justify-content:space-between"><strong>${x.no}</strong><span class="cat">${x.date}</span></div>
  ${x.items.map(i=>`<div>${esc(find(i.id)?.name||i.id)} (${pln(i.value)}) × ${i.qty}</div>`).join('')}<div class="total"><span>Razem</span><span>${pln(x.total)}</span></div></div>`).join(''):'<p class="cat">Brak zamówień.</p>'}
  <button class="btn ghost" id="out">Wyloguj się</button></div>`;
  document.getElementById('out').onclick=()=>{localStorage.removeItem(SESSION);updateUser();location.hash='#/'};
}
function notFound(){$app.innerHTML=`<div class="panel empty">Nie znaleziono strony. <a href="#/" style="color:var(--p)">Wróć</a></div>`}
function router(){
  const p=(location.hash||'#/').slice(2).split('/');window.scrollTo(0,0);
  ({'':catalog,voucher:()=>detail(p[1]),koszyk:cart,platnosc:payment,sukces:success,logowanie:login,rejestracja:register,konto:account}[p[0]]||notFound)();updateBadge();updateUser();
}
window.addEventListener('hashchange',router);router();
