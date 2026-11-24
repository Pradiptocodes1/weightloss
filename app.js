const $=s=>document.querySelector(s),DAY=864e5,START=new Date(2026,10,24),pad=n=>String(n).padStart(2,'0');
const K=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,P=k=>new Date(k+'T00:00');
const fmt=k=>P(k).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const TG={water:2250,burnt:300,food:1450,b:200,l:425,t:225,d:525},MEALS={b:' Breakfast',l:' Lunch',t:' Tiffin / Snack',d:' Dinner'};
const Q=["I have six months. I do NOT need to rush this. ","I don't need to be perfect. I need to be consistent. ","One imperfect meal doesn't ruin my progress.","A burger is food. It is not a moral failure.","The pattern matters, not one day.","Protein + strength training protect my muscle. ","I can eat junk food and still lose weight.","I am not starting over every Monday.","Boring things, repeated, become results. ","I'm keeping the promise I made to myself. ","Walk, lift, sleep, repeat. You've got this!"];
let D=JSON.parse(localStorage.getItem('reset')||'null')||{weight:58.5,days:{},wk:{}},V={tab:'m'},db,tm,cs='save',ready=false;
document.body.dataset.t=localStorage.getItem('theme')||'dark';
if(window.firebase&&typeof FIREBASE_CONFIG!=='undefined'&&!FIREBASE_CONFIG.apiKey.startsWith('PASTE')){try{firebase.initializeApp(FIREBASE_CONFIG);db=firebase.firestore().collection('tracker').doc('me');
db.get().then(s=>{if(s.exists&&!localStorage.getItem('dirty')){D=s.data();D.days=D.days||{};D.wk=D.wk||{};localStorage.setItem('reset',JSON.stringify(D));render()}else save();cs='on';sync();render()}).catch(e=>{console.error('Firebase load:',e);cs='err';sync();render();toast('Cloud: '+(e.code||e.message),0)})}catch(e){}}
function save(){localStorage.setItem('reset',JSON.stringify(D));localStorage.setItem('dirty','1');cs='save';sync();clearTimeout(tm);if(!navigator.onLine)toast(' Offline — saved on this phone only',1);
tm=setTimeout(()=>db&&db.set(JSON.parse(JSON.stringify(D))).then(()=>{localStorage.removeItem('dirty');cs='on';sync();toast(' Saved to cloud',1)}).catch(e=>{console.error('Firebase save:',e);cs='err';sync();toast('Cloud: '+(e.code||e.message),0)}),700)}
function net(){sync();const n=$('#net');n.textContent=' No internet — saving on this phone only, will sync when back online';n.classList.toggle('show',!navigator.onLine)}
addEventListener('offline',()=>{net();render()});addEventListener('online',()=>{net();if(localStorage.getItem('dirty'))save();else{cs='on';sync()}render()});
const blank=()=>({steps:0,water:0,burnt:0,food:{b:[],l:[],t:[],d:[]},ex:[]}),dd=k=>D.days[k]||(D.days[k]=blank());
const wkN=k=>Math.min(25,Math.max(0,Math.floor((P(k)-START)/DAY/7))),stepT=k=>5000+wkN(k)*200,burnT=k=>250+wkN(k)*10,foodT=k=>1500-wkN(k)*4,mealT=(m,k)=>Math.round(TG[m]*foodT(k)/1450);
const burnt=d=>d.burnt+d.ex.reduce((a,e)=>a+e.c,0),eat=d=>Object.values(d.food).flat().reduce((a,i)=>a+i.c,0),sc=(v,t)=>v>=t?2:v>=t/2?1:0;
const pts=k=>{const d=D.days[k];return d?Math.min(10,sc(d.steps,stepT(k))+sc(d.water,TG.water)+sc(burnt(d),burnT(k))+sc(eat(d),foodT(k)*.85)+Math.min(2,d.ex.length)):0};
const mood=p=>p>=8?"GREAT day! Proud of you ":p>=6?"Good day! Keep glowing ":p>=4?"Lovely effort — steps & water count! ":"Every bit counts. Keep going ";
const bar=p=>`<div class="bar"><i class="${p>=1?'shine':''}" style="width:${Math.min(p,1)*100}%;background:hsl(${Math.min(p,1)*120} 80% 50%)"></i></div>`;
function toast(m,quiet){const t=$('#toast');t.textContent=String(m).trim();t.classList.add('show');clearTimeout(t.h);t.h=setTimeout(()=>t.classList.remove('show'),quiet?1500:3000)}
const nav=o=>{Object.assign(V,o);Object.keys(L).forEach(k=>delete L[k]);render();enter();scrollTo(0,0)},back=()=>{if(V.page)V.page=null;else if(V.day)V.day=null;else{V.month=null;V.week=null}Object.keys(L).forEach(k=>delete L[k]);render();enter();scrollTo(0,0)};
const theme=()=>{const t=document.body.dataset.t=document.body.dataset.t==='dark'?'light':'dark';localStorage.setItem('theme',t)};
const hdr=t=>`<div class="top"><button class="ghost" onclick="back()">←</button><h2>${t}</h2></div>`;
function render(){const a=$('#app');V.page==='calc'?calc(a):V.day?dayView(a):V.week!=null?weekView(a):V.month?monthView(a):home(a);fill();count()}
function home(a){const now=new Date(),td=K(now),n=Math.max(0,Math.floor((now-START)/DAY)),mk=td.slice(0,7);let tot=0,exp=0,mt=0;
for(const[k,d]of Object.entries(D.days)){tot+=d.steps;if(k.startsWith(mk))mt+=d.steps}
for(let i=0;i<=n;i++)exp+=stepT(K(new Date(2026,10,24+i)));const r=tot/exp;
const ms=[...Array(7)].map((_,i)=>new Date(2026,10+i,1));
a.innerHTML=`<p class="q">${Q[n%Q.length]}</p>
<div class="stats"><div><span>Steps</span><b class="cnt" data-v="${tot}" style="color:hsl(${Math.min(r,1)*120} 65% 58%)">0</b><small>${mt.toLocaleString()} this month</small></div><div><span>Weight kg</span><b class="cnt" data-v="${D.weight}" data-d="1">0</b><small>goal 50.5</small></div></div>
<div class="tabs"><button class="${V.tab==='m'?'':'ghost'}" onclick="V.tab='m';render()">Months</button><button class="${V.tab==='w'?'':'ghost'}" onclick="V.tab='w';render()">Weeks</button></div>
<div class="grid" style="margin-top:12px">${V.tab==='m'?ms.map(d=>{const key=`${d.getFullYear()}-${pad(d.getMonth()+1)}`,ks=Object.keys(D.days).filter(k=>k.startsWith(key)),s=ks.reduce((x,k)=>x+D.days[k].steps,0);
return`<div class="pane" onclick="nav({month:'${key}'})"><h3>${d.toLocaleString('en',{month:'long'})} ${d.getFullYear()}</h3><p class="sm"> ${s.toLocaleString()}<br>${ks.length} days logged</p></div>`}).join(''):
[...Array(26)].map((_,i)=>{const s=new Date(2026,10,24+7*i),e=new Date(2026,10,30+7*i),f=x=>x.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
return`<div class="pane" onclick="nav({week:${i}})"><h3>Week ${i+1}</h3><p class="sm">${f(s)} – ${f(e)}</p></div>`}).join('')}</div>`}
function monthView(a){const[y,m]=V.month.split('-').map(Number),n=new Date(y,m,0).getDate(),td=K(new Date()),off=(new Date(y,m-1,1).getDay()+6)%7,
ks=[...Array(n)].map((_,i)=>`${V.month}-${pad(i+1)}`),ds=ks.map(k=>D.days[k]),tot=ds.reduce((s,d)=>s+(d?d.steps:0),0),lg=ds.filter(Boolean).length,av=lg?ks.reduce((s,k)=>s+pts(k),0)/lg:0,
pv=new Date(y,m-2,1),nx=new Date(y,m,1),mk=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`,ok=d=>d>=new Date(2026,10,1)&&d<=new Date(2027,4,1),fk=v=>v>=1000?(v/1000).toFixed(1)+'k':v;
a.innerHTML=`<div class="top"><button class="ghost" onclick="back()">←</button><h2>${new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'})}</h2><button class="ghost" ${ok(pv)?'':'disabled'} onclick="nav({month:'${mk(pv)}'})">‹</button><button class="ghost" ${ok(nx)?'':'disabled'} onclick="nav({month:'${mk(nx)}'})">›</button></div>
<div class="stats" style="grid-template-columns:repeat(3,1fr)"><div><span>Steps</span><b class="cnt" data-v="${tot}" style="font-size:1.6rem">0</b></div><div><span>Avg score</span><b class="cnt" data-v="${av.toFixed(1)}" data-d="1" style="font-size:1.6rem">0</b></div><div><span>Days</span><b class="cnt" data-v="${lg}" style="font-size:1.6rem">0</b></div></div>
<div class="cp"><div class="cal">${['M','T','W','T','F','S','S'].map(x=>`<div class="dw">${x}</div>`).join('')}${'<div></div>'.repeat(off)}${ks.map((k,i)=>{const d=D.days[k],p=pts(k);
return`<div class="day${k===td?' today':''}${k>td?' fut':''}${p>=8?' shine':''}" style="--i:${i}" onclick="nav({day:'${k}'})"><b>${i+1}</b><em>${d&&d.steps?fk(d.steps):'–'}</em>${d?`<span class="rg" style="--p:${p};--c:hsl(${p*12} 80% 55%)" data-s="${p}"></span>`:'<span class="rg" style="visibility:hidden"></span>'}</div>`}).join('')}</div></div>`}
function dayView(a){const k=V.day,d=dd(k),st=stepT(k),bt=burnt(d),e=eat(d),p=pts(k);
const meal=m=>`<div class="card"><h3>${MEALS[m]}</h3><p class="sm">Target ~${mealT(m,V.day)} kcal · eaten ${d.food[m].reduce((s,i)=>s+i.c,0)}</p>${d.food[m].map((i,x)=>`<div class="item"><span>${i.n} · ${i.c} kcal</span><span onclick="delF('${m}',${x})">×</span></div>`).join('')}
<div class="row"><input id="n${m}" placeholder="Food item" style="flex:2"><input id="c${m}" type="number" inputmode="numeric" placeholder="kcal"></div><button onclick="addF('${m}')">+ Add item</button></div>`;
a.innerHTML=hdr('Tracker for '+fmt(k))+`<div class="card score"><b class="${p>=8?'shine':''}">${p}</b>/10<p>${mood(p)}</p><div class="row"><button onclick="copyP('d')"> ChatGPT prompt</button><button onclick="pdf('d')"> PDF</button></div></div>
<div class="card"><h3> Steps</h3><p class="sm">Target: ${st.toLocaleString()} steps · ${d.steps.toLocaleString()} done</p>${bar(d.steps/st)}<input type="number" inputmode="numeric" placeholder="Total steps today" value="${d.steps||''}" onchange="setV('steps',this.value,${st})"></div>
<div class="card"><h3> Water</h3><p class="sm">Target: ${TG.water} ml · ${d.water} ml done</p><div class="glass"><div class="water${d.water?'':' empty'}" style="height:${Math.min(d.water/TG.water,1)*100}%"></div></div>
<div class="row"><button class="ghost" onclick="setV('water',${d.water}+250)">+250</button><button class="ghost" onclick="setV('water',${d.water}+500)">+500</button><button class="ghost" onclick="setV('water',${d.water}-250)">−250</button></div><input type="number" inputmode="numeric" placeholder="Total ml" value="${d.water||''}" onchange="setV('water',this.value)"></div>
<div class="card"><h3> Calories burnt</h3><p class="sm">Target: ${burnT(V.day)} kcal · ${bt} so far (exercise kcal included)</p>${bar(bt/burnT(V.day))}<input type="number" inputmode="numeric" placeholder="Other calories burnt" value="${d.burnt||''}" onchange="setV('burnt',this.value)"></div>
<div class="card"><h3> Food total</h3><p class="sm">${e} / ${foodT(V.day)} kcal</p>${bar(e/foodT(V.day))}<button class="ghost" onclick="nav({page:'calc'})"> Calculate calories (Gemini)</button></div>
${['b','l','t','d'].map(meal).join('')}
<div class="card"><h3> Exercises <small>(optional, bonus points)</small></h3>${d.ex.map((x,i)=>`<div class="item"><span>${x.n} · ${x.s} · ${x.c} kcal</span><span onclick="delE(${i})">×</span></div>`).join('')}
<input id="en" placeholder="Exercise"><div class="row"><input id="es" placeholder="Sets e.g. 3x12"><input id="ec" type="number" inputmode="numeric" placeholder="kcal"></div><button onclick="addE()">+ Add exercise</button></div>`}
function check(o,n,tg,u,ic){if(o<tg&&n>=tg)toast(` GOAL MET! +2 points `);else if(o<tg/2&&n>=tg/2)toast(`${ic} Halfway! +1 point — keep pushing! `);else if(u&&Math.floor(n/u)>Math.floor(o/u))toast(`${ic} ${Math.floor(n/u)*u} reached! You're glowing  Keep going!`)}
function setV(f,v,t){const d=dd(V.day),g=()=>f==='burnt'?burnt(d):d[f],o=g();d[f]=Math.max(0,+v||0);save();render();
const c={steps:[t,1000,''],water:[TG.water,500,''],burnt:[burnT(V.day),0,'']}[f];check(o,g(),c[0],c[1],c[2])}
function addF(m){const n=$('#n'+m).value.trim(),c=+$('#c'+m).value,d=dd(V.day),o=eat(d);if(!n||!c)return toast('Enter food and kcal',1);d.food[m].push({n,c});save();render();check(o,eat(d),foodT(V.day),0,'')}
const delF=(m,i)=>{dd(V.day).food[m].splice(i,1);save();render()};
function addE(){const n=$('#en').value.trim(),d=dd(V.day),o=burnt(d);if(!n)return;d.ex.push({n,s:$('#es').value||'-',c:+$('#ec').value||0});save();render();toast(' Exercise added — bonus point!');check(o,burnt(d),burnT(V.day),0,'')}
const delE=i=>{dd(V.day).ex.splice(i,1);save();render()};
function calc(a){const k=localStorage.getItem('gkey')||'';a.innerHTML=hdr('Calorie calculator')+`<div class="card"><h3> Gemini key</h3><p class="sm">Stored only on this device.</p><input id="gk" type="password" placeholder="Paste Gemini API key" value="${k}"><div class="row"><button onclick="localStorage.setItem('gkey',$('#gk').value.trim());toast('Key saved',1)">Save / Modify</button><button class="ghost" onclick="localStorage.removeItem('gkey');$('#gk').value='';toast('Key removed',1)">Remove</button></div></div>
<div class="card"><textarea id="fq" rows="4" placeholder="e.g. 1 cup rice, 2 eggs, curd 100g"></textarea><button onclick="ask()">Calculate</button><pre id="res"></pre><button class="ghost" onclick="copyCal()"> Copy calories</button></div>`}
async function ask(){const key=localStorage.getItem('gkey');if(!key)return toast('Save your Gemini key first');$('#res').textContent='Calculating…';
try{const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:`Estimate calories (Indian portions) for: ${$('#fq').value}\nList each item with kcal, and end with exactly: TOTAL: <number> kcal`}]}]})});
const j=await r.json();$('#res').textContent=j.candidates?.[0]?.content?.parts?.[0]?.text||JSON.stringify(j.error||j)}catch(e){$('#res').textContent='Error: '+e.message}}
function copyCal(){const m=$('#res').textContent.match(/TOTAL:\s*([\d,]+)/i);if(!m)return toast('Calculate first',1);navigator.clipboard.writeText(m[1].replace(/,/g,''));toast(`Copied ${m[1]} kcal — go back and paste `)}
const wkDays=i=>[...Array(7)].map((_,j)=>K(new Date(2026,10,24+7*i+j)));
function weekView(a){const i=V.week,ks=wkDays(i),ds=ks.map(k=>D.days[k]||blank()),st=ds.map(d=>d.steps),lg=st.filter(x=>x).length||1,avg=Math.round(st.reduce((x,y)=>x+y,0)/lg),
mx=Math.max(...st,stepT(ks[0])),E=ds.reduce((s,d)=>s+eat(d),0),B=ds.reduce((s,d)=>s+burnt(d),0),pc=E+B?E/(E+B)*100:50,
pl=st.map((v,j)=>`${j*50+10},${95-v/mx*85}`).join(' ');
a.innerHTML=hdr(`Week ${i+1}`)+`<div class="card"><h3> Daily steps</h3><div class="bars">${st.map((v,j)=>`<div style="height:${v/mx*100}%">${v?Math.round(v/100)/10+'k':''}</div>`).join('')}</div><p class="sm" style="display:flex;justify-content:space-around">${ks.map(k=>P(k).toLocaleDateString('en',{weekday:'narrow'})).join(' ')}</p>
<svg viewBox="0 0 320 100" style="width:100%"><polyline points="${pl}" fill="none" stroke="#ff6bb0" stroke-width="3"/></svg></div>
<div class="card"><h3> Eaten vs burnt</h3><div class="donut" style="background:conic-gradient(var(--r) 0 ${pc}%,var(--g) 0)"></div><p class="sm" style="text-align:center"> eaten ${E} kcal ·  burnt ${B} kcal</p></div>
<div class="card"><h3>Metrics</h3><p>Avg steps/day: <b>${avg.toLocaleString()}</b><br>Avg score: <b>${(ds.reduce((s,_,j)=>s+pts(ks[j]),0)/7).toFixed(1)}/10</b><br>Avg calories eaten: <b>${Math.round(E/lg)}</b><br>Avg water: <b>${Math.round(ds.reduce((s,d)=>s+d.water,0)/lg)} ml</b><br>Workout days: <b>${ds.filter(d=>d.ex.length).length}</b></p>
<p class="sm">Weight this week (kg)</p><input type="number" step="0.1" inputmode="decimal" placeholder="Current weight" value="${D.wk[i]||''}" onchange="D.wk[${i}]=+this.value;D.weight=+this.value||D.weight;save();render()"></div>
<div class="row"><button onclick="copyP('w')"> ChatGPT prompt</button><button onclick="pdf('w')"> PDF</button></div>`}
function txt(t){if(t==='d'){const k=V.day,d=dd(k);return` DAILY CHECK-IN — ${fmt(k)}\nScore: ${pts(k)}/10\nSteps: ${d.steps} (target ${stepT(k)})\nWater: ${d.water} ml (target ${TG.water})\nCalories eaten: ${eat(d)} (target ~${foodT(V.day)})\nCalories burnt: ${burnt(d)} (target ${burnT(V.day)})\n`+Object.keys(MEALS).map(m=>`${MEALS[m].replace(/^\S+ /,'')}: ${d.food[m].map(i=>`${i.n} (${i.c})`).join(', ')||'-'}`).join('\n')+`\nExercises: ${d.ex.map(x=>`${x.n} ${x.s} ${x.c}kcal`).join('; ')||'-'}\nCurrent weight: ${D.weight} kg\n\nPlease review my day and suggest what to improve tomorrow.`}
const i=V.week,ks=wkDays(i),ds=ks.map(k=>D.days[k]||blank()),lg=ds.filter(d=>d.steps).length||1;
return` WEEKLY REVIEW\nWeek: ${i+1} (${fmt(ks[0])} – ${fmt(ks[6])})\nStarting weight: ${D.wk[i-1]||58.5} kg\nEnding weight: ${D.wk[i]||D.weight} kg\nWaist: ____\nAverage steps: ${Math.round(ds.reduce((s,d)=>s+d.steps,0)/lg)}\nStrength workouts completed: ${ds.filter(d=>d.ex.length).length} / 3\nAverage calories: ${Math.round(ds.reduce((s,d)=>s+eat(d),0)/lg)}\nAverage water: ${Math.round(ds.reduce((s,d)=>s+d.water,0)/lg)} ml\nProtein consistency: ____\n\nDaily:\n`+ks.map((k,j)=>`${fmt(k)}: ${ds[j].steps} steps, ${eat(ds[j])} kcal in, ${burnt(ds[j])} kcal out, ${ds[j].water} ml, score ${pts(k)}/10`).join('\n')+`\n\nWhat went well? ____\nWhat was difficult? ____\nBiggest craving? ____\nJunk-food meals: ____\nEnergy: ____\nHunger: ____\nWhat I want help with next week: ____`}
const copyP=t=>{navigator.clipboard.writeText(txt(t));toast('Copied! Paste it into ChatGPT ')};
function pdf(t){const p=new window.jspdf.jsPDF();p.setFontSize(10);p.text(p.splitTextToSize(txt(t).replace(/[^\x00-\x7F]/g,''),180),12,15);p.save(t==='d'?`day-${V.day}.pdf`:`week-${V.week+1}.pdf`)}
render();
function sync(){const e=$('#sync');if(!e)return;const s=!db?'none':!navigator.onLine?'off':cs,m={on:'Cloud sync on',off:'Offline',save:'Syncing',err:'Cloud error',none:'Cloud sync off'};e.className='sync '+s;e.querySelector('span').textContent=m[s]}
function enter(){const e=$('#app');[...e.children].forEach((c,i)=>c.style.setProperty('--i',i));e.classList.add('enter');setTimeout(()=>e.classList.remove('enter'),1200)}
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card,.pane');if(!c||e.pointerType==='touch')return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(800px) rotateY(${x*7}deg) rotateX(${-y*7}deg) translateZ(4px)`});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.card,.pane');if(c)c.style.transform=''});
const L={};
function count(){if(!ready)return;document.querySelectorAll('.cnt').forEach((e,i)=>{const v=+e.dataset.v,d=+e.dataset.d||0,f=L[i]||0,t0=performance.now(),o={minimumFractionDigits:d,maximumFractionDigits:d};L[i]=v;if(f===v){e.textContent=v.toLocaleString(undefined,o);return}
const s=n=>{const p=Math.min((n-t0)/1200,1),x=1-Math.pow(1-p,4);e.textContent=(f+(v-f)*x).toLocaleString(undefined,o);p<1&&requestAnimationFrame(s)};requestAnimationFrame(s)})}
function fill(){document.querySelectorAll('.bar i,.water').forEach(e=>{const p=e.classList.contains('water')?'height':'width',v=e.style[p];e.style[p]='0%';requestAnimationFrame(()=>requestAnimationFrame(()=>e.style[p]=v))})}
const LM=['Syncing data with Firebase','Fetching data from cloud','Optimizing homepage'],W=3000+Math.random()*2000;
[1,2].forEach(i=>setTimeout(()=>{const t=$('#lt');t.style.opacity=0;setTimeout(()=>{t.textContent=LM[i];t.style.opacity=1},250)},W*i/3));
setTimeout(()=>{ready=true;$('#load').classList.add('off');render();enter()},W);
net();