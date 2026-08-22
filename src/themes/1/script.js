
/* ═══════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════ */
const dot = document.getElementById('curDot');
const ring = document.getElementById('curRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
(function animRing(){
  rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('button,a,.track,.mood-pill,.vibe-card,.qdot,.theme-swatch,.sticky-note,.pomo-btn')
  .forEach(el => {
    el.addEventListener('mouseenter', ()=>ring.classList.add('expand'));
    el.addEventListener('mouseleave', ()=>ring.classList.remove('expand'));
  });

/* ═══════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════ */
window.addEventListener('scroll', ()=>{
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  document.getElementById('scrollBar').style.width = pct + '%';
});

/* ═══════════════════════════════════════
   TRACKS & PLAYER
═══════════════════════════════════════ */
const tracks = [
  {name:'Rainy Window Study',    artist:"Anshu's Mix · Mellow",   dur:222},
  {name:'Midnight Chai Session', artist:'Lo-Fi Chill Beats',       dur:251},
  {name:'Golden Hour Notebook',  artist:'Warm Afternoon Vibes',    dur:238},
  {name:'Cityscape Daydream',    artist:'Jazz-Hop · Smooth',       dur:302},
  {name:'Ivory Keys at 2am',     artist:'Piano Lofi · Deep Focus', dur:269},
  {name:'Monsoon Study Session', artist:'Rain + Beats · Cozy',     dur:373},
];
let curTrack=0, playing=false, elapsed=0, pTimer=null;
const fmt = s => Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

function updatePlayer(){
  const t=tracks[curTrack];
  document.getElementById('playerTitle').textContent  = t.name;
  document.getElementById('playerArtist').textContent = t.artist;
  document.getElementById('durTime').textContent  = fmt(t.dur);
  document.getElementById('currTime').textContent = fmt(elapsed);
  document.getElementById('progressFill').style.width = (elapsed/t.dur*100)+'%';
}
function togglePlay(){
  playing=!playing;
  document.getElementById('playBtn').innerHTML = playing ? '&#9646;&#9646;' : '&#9654;';
  document.getElementById('playerArt').classList.toggle('playing',playing);
  if(playing){ pTimer=setInterval(()=>{ elapsed++; if(elapsed>=tracks[curTrack].dur){nextTrack();return;} updatePlayer(); },1000); }
  else clearInterval(pTimer);
}
function selectTrack(el,idx){
  document.querySelectorAll('.track').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); curTrack=idx; elapsed=0; updatePlayer();
  document.querySelectorAll('.track-num').forEach((n,i)=>{n.textContent=i===idx?'\u266A':(i+1);});
  if(!playing) togglePlay();
}
function nextTrack(){
  curTrack=(curTrack+1)%tracks.length; elapsed=0;
  document.querySelectorAll('.track').forEach((t,i)=>t.classList.toggle('active',i===curTrack));
  document.querySelectorAll('.track-num').forEach((n,i)=>{n.textContent=i===curTrack?'\u266A':(i+1);});
  updatePlayer();
}
function prevTrack(){
  if(elapsed>5){elapsed=0;updatePlayer();return;}
  curTrack=(curTrack-1+tracks.length)%tracks.length; elapsed=0;
  document.querySelectorAll('.track').forEach((t,i)=>t.classList.toggle('active',i===curTrack));
  document.querySelectorAll('.track-num').forEach((n,i)=>{n.textContent=i===curTrack?'\u266A':(i+1);});
  updatePlayer();
}
function seekTo(e){ elapsed=Math.floor(e.offsetX/e.currentTarget.offsetWidth*tracks[curTrack].dur); updatePlayer(); }
updatePlayer();

/* ═══════════════════════════════════════
   DAY / NIGHT
═══════════════════════════════════════ */
let isNight=false;
const dayNotes  = ['press ? to see keyboard shortcuts','the cat is judging your posture','golden hour hits different in focus mode'];
const nightNotes= ['the lamp is the only sun now','2am thoughts hit different','the city sleeps. you do not.'];
const moodByHour=['deep night — the best ideas live here','1am and it all makes sense now','2am and the city is finally quiet','3am courage — use it wisely','4am — the sky is thinking about morning','almost dawn — almost there','sunrise — fresh page, fresh start','morning chai — the ritual begins','8am — the desk claims you','9am — the good stuff starts now','10am — golden window light hours','11am — the playlist knows the mood','noon — peak clarity window','1pm — plant check, breathe, continue','2pm — the universe wants you to nap','3pm — second chai, second wind','4pm — golden hour is loading','5pm — the light hits the rooftops just right','6pm — headphones on, city off','7pm — evening session begins','8pm — the deep focus hours','9pm — the notebook gets honest','10pm — late but not too late','11pm — the lamp earns its keep'];

function toggleDayNight(){
  isNight=!isNight;
  document.body.classList.toggle('night',isNight);
  document.getElementById('dnThumb').innerHTML = isNight ? '&#9790;' : '&#9728;';
  document.getElementById('dnLabel').textContent = isNight ? 'NIGHT' : 'DAY';
  document.getElementById('heroEyebrow').textContent = isNight ? 'midnight mode · the lamp takes over' : 'always studying, always vibing';
  showToast(isNight ? 'Night mode on — the lamp takes over' : 'Day mode on — golden hour restored');
  updateNote();
  if(isNight) spawnFF();
}
if(new Date().getHours()>=19||new Date().getHours()<6) setTimeout(()=>{toggleDayNight();showToast('Night detected — switching automatically');},900);

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function showToast(msg){
  const el=document.getElementById('toastEl');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2800);
}

/* ═══════════════════════════════════════
   STARS
═══════════════════════════════════════ */
const sc=document.getElementById('starCanvas'),sctx=sc.getContext('2d');
const stars=Array.from({length:110},()=>({x:Math.random(),y:Math.random()*.65,r:Math.random()*1.4+.3,ph:Math.random()*Math.PI*2,sp:.008+Math.random()*.018}));
(function drawS(){
  sc.width=sc.offsetWidth; sc.height=sc.offsetHeight;
  sctx.clearRect(0,0,sc.width,sc.height);
  stars.forEach(s=>{
    s.ph+=s.sp;
    const a=isNight?(0.4+0.6*Math.abs(Math.sin(s.ph))):0;
    sctx.beginPath(); sctx.arc(s.x*sc.width,s.y*sc.height,s.r,0,Math.PI*2);
    sctx.fillStyle=`rgba(255,252,220,${a})`; sctx.fill();
  });
  requestAnimationFrame(drawS);
})();

/* ═══════════════════════════════════════
   FIREFLIES
═══════════════════════════════════════ */
let ffDone=false;
function spawnFF(){
  if(ffDone) return; ffDone=true;
  const w=document.getElementById('ffWrap');
  for(let i=0;i<16;i++){
    const f=document.createElement('div'); f.className='ff';
    const dx=(Math.random()-.5)*130,dy=(Math.random()-.5)*110;
    f.style.cssText=`left:${5+Math.random()*85}%;top:${8+Math.random()*60}%;--fdx:${dx}px;--fdy:${dy}px;animation-duration:${3+Math.random()*4}s;animation-delay:${Math.random()*3}s;`;
    w.appendChild(f);
  }
}

/* ═══════════════════════════════════════
   STICKY NOTE
═══════════════════════════════════════ */
function updateNote(){ const arr=isNight?nightNotes:dayNotes; document.getElementById('noteText').textContent=arr[Math.floor(Math.random()*arr.length)]; }
function dismissNote(){ const n=document.getElementById('stickyNote'); n.style.opacity='0'; setTimeout(()=>n.style.display='none',400); }

/* ═══════════════════════════════════════
   ANALOG CLOCK
═══════════════════════════════════════ */
function updateClock(){
  const now=new Date(),h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
  document.getElementById('hHour').style.transform=`translateX(-50%) rotate(${(h%12)*30+m*.5}deg)`;
  document.getElementById('hMin').style.transform =`translateX(-50%) rotate(${m*6+s*.1}deg)`;
  document.getElementById('hSec').style.transform =`translateX(-50%) rotate(${s*6}deg)`;
  const pad=n=>String(n).padStart(2,'0');
  document.getElementById('clockTime').textContent=`${pad(h)}:${pad(m)}:${pad(s)}`;
  document.getElementById('clockMood').textContent=moodByHour[h];
  document.getElementById('clockSub').textContent=(h>=22||h<6)?'Late night session. The lamp knows. The cat knows. Now you know.':'A good time to be exactly here, doing exactly this.';
}
setInterval(updateClock,1000); updateClock();

/* ═══════════════════════════════════════
   QUOTES
═══════════════════════════════════════ */
const quotes=[
  {text:'The best study session starts with a song you did not choose, and ends with a page you did not expect to fill.',author:'— from the desk of Anshu'},
  {text:'Some nights the city is background music. Some nights it is the whole song.',author:'— window thoughts, 11pm'},
  {text:'The cat does not worry about tomorrow. The cat is very wise.',author:'— observed, repeatedly'},
  {text:'A pen on paper is the slowest kind of thinking. Also the most honest.',author:'— notebook, page 34'},
  {text:'The lamp does not ask if you are productive enough. The lamp just shines.',author:'— late night realisation'},
  {text:'Focus is not the absence of distraction. It is choosing this moment, this page, this song, again.',author:'— from the desk of Anshu'},
];
let cq=0;
function renderDots(){
  document.getElementById('quoteDots').innerHTML=quotes.map((_,i)=>`<div class="qdot ${i===cq?'on':''}" onclick="goQuote(${i})"></div>`).join('');
}
function goQuote(i){
  cq=i; const el=document.getElementById('quoteText'); el.style.opacity='0';
  setTimeout(()=>{el.textContent=quotes[i].text; document.getElementById('quoteAuthor').textContent=quotes[i].author; el.style.opacity='1';},350);
  renderDots();
}
setInterval(()=>goQuote((cq+1)%quotes.length),6000); renderDots();

/* ═══════════════════════════════════════
   POMODORO + STREAKS + FOCUS SCORE
═══════════════════════════════════════ */
const POMO_FOCUS=25*60, POMO_BREAK=5*60;
let pomoRunning=false, pomoMode='focus', pomoLeft=POMO_FOCUS, pomoTimer=null;
let sessions=0, streak=0, totalFocusSec=0;

// Load from sessionStorage
try { sessions=parseInt(sessionStorage.getItem('pomo_sessions')||'0'); streak=parseInt(sessionStorage.getItem('pomo_streak')||'0'); totalFocusSec=parseInt(sessionStorage.getItem('pomo_total')||'0'); } catch(e){}

function pomoRender(){
  const circ=2*Math.PI*88; const pct=pomoLeft/(pomoMode==='focus'?POMO_FOCUS:POMO_BREAK);
  document.getElementById('pomoArc').style.strokeDashoffset = circ*(1-pct);
  document.getElementById('pomoTime').textContent=fmt(pomoLeft);
  document.getElementById('pomoMode').textContent=pomoMode==='focus'?'FOCUS':'BREAK';
  document.getElementById('pomoBtnStart').textContent=pomoRunning?'Pause':'Start';
  document.getElementById('pomoSessions').textContent=sessions;
  document.getElementById('pomoStreak').textContent=streak;
  const score=Math.min(sessions,8); const pct2=score/8*100;
  document.getElementById('focusBarFill').style.width=pct2+'%';
  document.getElementById('focusScoreLabel').textContent=`${score} / 8 sessions for full score`;
  const mins=Math.floor(totalFocusSec/60);
  document.getElementById('totalFocusStat').textContent=mins<60?`${mins}m`:Math.floor(mins/60)+'h '+Math.floor(mins%60)+'m';
  renderStreakDots();
}
function renderStreakDots(){
  const c=document.getElementById('streakDots');
  c.innerHTML=Array.from({length:7},(_,i)=>`<div class="streak-dot${i<streak?' done':''}"></div>`).join('');
}
function pomoToggle(){
  pomoRunning=!pomoRunning;
  if(pomoRunning){
    pomoTimer=setInterval(()=>{
      pomoLeft--; totalFocusSec+=(pomoMode==='focus'?1:0);
      if(pomoLeft<=0){ pomoComplete(); } else pomoRender();
    },1000);
  } else { clearInterval(pomoTimer); }
  pomoRender();
}
function pomoReset(){ clearInterval(pomoTimer); pomoRunning=false; pomoLeft=pomoMode==='focus'?POMO_FOCUS:POMO_BREAK; pomoRender(); }
function switchMode(){ clearInterval(pomoTimer); pomoRunning=false; pomoMode=pomoMode==='focus'?'break':'focus'; pomoLeft=pomoMode==='focus'?POMO_FOCUS:POMO_BREAK; pomoRender(); }
function pomoComplete(){
  clearInterval(pomoTimer); pomoRunning=false;
  if(pomoMode==='focus'){ sessions++; streak=Math.min(streak+1,7); try{sessionStorage.setItem('pomo_sessions',sessions);sessionStorage.setItem('pomo_streak',streak);sessionStorage.setItem('pomo_total',totalFocusSec);}catch(e){} showToast('Session complete! Take a break.'); pomoMode='break'; pomoLeft=POMO_BREAK; }
  else { showToast('Break over — back to focus!'); pomoMode='focus'; pomoLeft=POMO_FOCUS; }
  pomoRender();
}
pomoRender();

/* ═══════════════════════════════════════
   AMBIENT MIXER (Web Audio API)
═══════════════════════════════════════ */
let audioCtx=null;
const mixNodes={};

function getCtx(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }

function makeNoise(type){
  const ctx=getCtx(), buf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
  const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true;
  const gain=ctx.createGain(); gain.gain.value=0;
  if(type==='rain'){ const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1200; f.Q.value=0.5; src.connect(f); f.connect(gain); }
  else if(type==='vinyl'){ const f=ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=4000; src.connect(f); f.connect(gain); }
  else if(type==='cafe'){ const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=400; f.Q.value=0.3; src.connect(f); f.connect(gain); }
  else if(type==='fan'){ const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=200; src.connect(f); f.connect(gain); }
  else if(type==='city'){ const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=600; f.Q.value=0.4; src.connect(f); f.connect(gain); }
  else if(type==='thunder'){
    const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=80;
    src.connect(f); f.connect(gain);
  }
  else { src.connect(gain); }
  gain.connect(ctx.destination); src.start();
  return gain;
}

const mixState={};
function setMix(t,v){ if(mixNodes[t]) mixNodes[t].gain.value=parseFloat(v)*0.4; }
function toggleMix(t){
  mixState[t]=!mixState[t];
  const btn=document.querySelector(`#mc-${t} .mixer-toggle`);
  const card=document.getElementById(`mc-${t}`);
  if(mixState[t]){
    if(!mixNodes[t]) mixNodes[t]=makeNoise(t);
    const vol=document.querySelector(`#mc-${t} .mixer-vol`);
    mixNodes[t].gain.value=(parseFloat(vol.value)||0.5)*0.4;
    btn.textContent='on'; btn.classList.add('on'); card.classList.add('active');
  } else {
    if(mixNodes[t]) mixNodes[t].gain.value=0;
    btn.textContent='off'; btn.classList.remove('on'); card.classList.remove('active');
  }
}

/* ═══════════════════════════════════════
   THEME PICKER
═══════════════════════════════════════ */
function setTheme(t){
  document.body.className=document.body.className.replace(/theme-\w+/g,'').trim();
  if(t!=='default') document.body.classList.add('theme-'+t);
  if(isNight) document.body.classList.add('night');
  document.querySelectorAll('.theme-swatch').forEach(s=>s.classList.remove('active'));
  event.target.classList.add('active');
  showToast('Theme: '+t.charAt(0).toUpperCase()+t.slice(1));
}

/* ═══════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════ */
let shortcutsVisible=false;
function toggleShortcuts(){ shortcutsVisible=!shortcutsVisible; document.getElementById('shortcutsPanel').classList.toggle('show',shortcutsVisible); }

let konamiSeq=[],konamiCode=[38,38,40,40,37,39,37,39,66,65];
document.addEventListener('keydown', e=>{
  konamiSeq.push(e.keyCode); konamiSeq=konamiSeq.slice(-10);
  if(konamiSeq.join()==konamiCode.join()) { showToast('You found the easter egg. The cat saw everything.'); document.body.style.animation='hueShift 2s ease both'; setTimeout(()=>document.body.style.animation='',2000); }
  const tag=document.activeElement.tagName.toLowerCase();
  if(tag==='input'||tag==='textarea') return;
  if(e.key==='n'||e.key==='N') toggleDayNight();
  if(e.key===' '){ e.preventDefault(); togglePlay(); }
  if(e.key==='f'||e.key==='F') enterFocus();
  if(e.key==='.')  nextTrack();
  if(e.key===',')  prevTrack();
  if(e.key==='?')  toggleShortcuts();
  if(e.key==='Escape') exitFocus();
});

/* ═══════════════════════════════════════
   FOCUS MODE
═══════════════════════════════════════ */
let focusActive=false;
function enterFocus(){
  focusActive=true;
  document.getElementById('focusOverlay').classList.add('active');
  if(!playing) togglePlay();
  showToast('Focus mode — press Esc to exit');
  updateFocusClock();
}
function exitFocus(){ focusActive=false; document.getElementById('focusOverlay').classList.remove('active'); }
function updateFocusClock(){
  if(!focusActive) return;
  const now=new Date(),h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
  document.getElementById('focusClock').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  document.getElementById('focusLabel').textContent=moodByHour[h];
  setTimeout(updateFocusClock,1000);
}

/* hue shift animation for easter egg */
const style=document.createElement('style');
style.textContent='@keyframes hueShift{0%{filter:none}50%{filter:hue-rotate(180deg) saturate(2)}100%{filter:none}}';
document.head.appendChild(style);


/* ═══════════════════════════════════════
   PARTICLE BURST on click
═══════════════════════════════════════ */
document.addEventListener('click', e => {
  for(let i=0;i<10;i++){
    const p=document.createElement('div'); p.className='burst-p';
    const ang=Math.random()*Math.PI*2, dist=30+Math.random()*60;
    p.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;--bx:${Math.cos(ang)*dist}px;--by:${Math.sin(ang)*dist}px;`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }
});

/* ═══════════════════════════════════════
   RAIN CANVAS on hero
═══════════════════════════════════════ */
const rainC=document.getElementById('rainCanvas');
const rainCtx=rainC.getContext('2d');
let rainDrops=[], rainOn=false, rainTimer=null;

function resizeRain(){
  rainC.width=rainC.offsetWidth||window.innerWidth;
  rainC.height=rainC.offsetHeight||window.innerHeight;
}
resizeRain();
window.addEventListener('resize',resizeRain);

function initRain(){
  rainDrops=Array.from({length:140},()=>({
    x:Math.random()*rainC.width,
    y:Math.random()*rainC.height,
    len:10+Math.random()*20,
    speed:4+Math.random()*6,
    opacity:0.1+Math.random()*0.35
  }));
}
initRain();

function drawRain(){
  rainCtx.clearRect(0,0,rainC.width,rainC.height);
  rainDrops.forEach(d=>{
    rainCtx.beginPath();
    rainCtx.moveTo(d.x,d.y);
    rainCtx.lineTo(d.x+d.len*0.2,d.y+d.len);
    rainCtx.strokeStyle=`rgba(180,210,255,${d.opacity})`;
    rainCtx.lineWidth=0.8;
    rainCtx.stroke();
    d.y+=d.speed;
    if(d.y>rainC.height){d.y=-d.len; d.x=Math.random()*rainC.width;}
  });
  if(rainOn) requestAnimationFrame(drawRain);
}

// hook rain into mixer toggle
const origToggleMix = toggleMix;
function toggleMix(t){
  origToggleMix(t);
  if(t==='rain'){
    rainOn=mixState[t]||false;
    rainC.style.opacity=rainOn?'0.55':'0';
    if(rainOn){ drawRain(); }
  }
}

/* ═══════════════════════════════════════
   TYPEWRITER TERMINAL
═══════════════════════════════════════ */
const twResponses = [
  s => s.toLowerCase().includes('hello') ? 'hey. glad you found this corner.' : null,
  s => s.toLowerCase().includes('cat') ? 'the cat acknowledges you. barely.' : null,
  s => s.toLowerCase().includes('chai') ? 'making chai is a form of meditation. you already know.' : null,
  s => s.toLowerCase().includes('night') ? 'the lamp is working overtime. it does not complain.' : null,
  s => s.toLowerCase().includes('music') ? 'beats slow enough to think. that is the only requirement.' : null,
  s => s.toLowerCase().includes('study') || s.toLowerCase().includes('focus') ? 'the desk is ready when you are. it has always been ready.' : null,
  s => s.toLowerCase().includes('help') ? 'try: hello, ask about the cat, chai, music, night, or focus.' : null,
  s => ['who are you','who is anshu'].some(k=>s.toLowerCase().includes(k)) ? 'someone who thinks better with headphones on and a view worth dreaming about.' : null,
];
const twFallback = [
  'noted. the notebook heard that.',
  'the cat opened one eye. then closed it.',
  'added to the stack. might revisit at 2am.',
  'interesting. the lamp flickered.',
  'the plant is processing this information.',
  '...',
  'writing that down on page 34.',
];

let twTyping=false;
function twType(text){
  if(twTyping) return;
  twTyping=true;
  const el=document.getElementById('twLine');
  el.innerHTML='<span class="tw-cursor"></span>';
  let i=0;
  const iv=setInterval(()=>{
    el.innerHTML=text.slice(0,i)+'<span class="tw-cursor"></span>';
    i++;
    if(i>text.length){clearInterval(iv);twTyping=false;}
  },28);
}

function twSend(){
  const inp=document.getElementById('twInput');
  const val=inp.value.trim(); if(!val) return;
  inp.value='';
  let resp=null;
  for(const fn of twResponses){ resp=fn(val); if(resp) break; }
  if(!resp) resp=twFallback[Math.floor(Math.random()*twFallback.length)];
  setTimeout(()=>twType('> '+resp),200);
}
document.getElementById('twInput').addEventListener('keydown',e=>{ if(e.key==='Enter') twSend(); });
// boot message
setTimeout(()=>twType('> session started. headphones on. city below. ready.'),1200);

/* ═══════════════════════════════════════
   NOTEPAD + TODO
═══════════════════════════════════════ */
// restore notepad from sessionStorage
try{
  const saved=sessionStorage.getItem('lofi_note');
  if(saved) document.getElementById('notePad').value=saved;
}catch(e){}

function notepadUpdate(){
  const v=document.getElementById('notePad').value;
  document.getElementById('noteChars').textContent=v.length+' chars';
  document.getElementById('noteWords').textContent=(v.trim()?v.trim().split(/\s+/).length:0)+' words';
  try{sessionStorage.setItem('lofi_note',v);}catch(e){}
}
notepadUpdate();

function addTodo(){
  const inp=document.getElementById('todoInput');
  const val=inp.value.trim(); if(!val) return;
  inp.value='';
  const item=document.createElement('div');
  item.className='todo-item';
  item.onclick=()=>toggleTodo(item);
  item.innerHTML=`<div class="todo-check"></div><span class="todo-label">${val}</span><button class="todo-del" onclick="delTodo(event,this)">x</button>`;
  document.getElementById('todoList').appendChild(item);
  showToast('Task added to the list');
}
document.getElementById('todoInput').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo();});

function toggleTodo(item){
  item.classList.toggle('done');
  const check=item.querySelector('.todo-check');
  check.innerHTML=item.classList.contains('done')?'&#10003;':'';
}
function delTodo(e,btn){ e.stopPropagation(); btn.closest('.todo-item').remove(); }

/* ═══════════════════════════════════════
   NOTEBOOK GUESTBOOK
═══════════════════════════════════════ */
const nbColors=[
  {account:'#c0704a',rotate:'-3deg'},
  {account:'#6b8fa3',rotate:'2.5deg'},
  {account:'#7a9e7e',rotate:'-4.5deg'},
  {account:'#9b6dff',rotate:'1.5deg'},
  {account:'#c0704a',rotate:'-2deg'},
];

function addGuestNote(){
  const handle=document.getElementById('nbHandle').value.trim()||'@anonymous';
  const msg=document.getElementById('nbMessage').value.trim();
  if(!msg){ showToast('Write something first!'); return; }

  const idx=document.getElementById('nbWrapper').children.length%nbColors.length;
  const col=nbColors[idx];
  const now=new Date(); const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr=months[now.getMonth()]+' '+now.getDate()+', '+now.getFullYear();

  const wrapper=document.createElement('div'); wrapper.className='nb-card-wrapper';
  wrapper.innerHTML=`
    <div class="nb-card" style="rotate:${col.rotate}">
      <div class="nb-account" style="color:${col.account}">
        <span class="nb-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span>${handle.startsWith('@')?handle:'@'+handle}</span>
      </div>
      <div class="nb-content">${msg}</div>
      <div class="nb-date">${dateStr}</div>
    </div>`;

  document.getElementById('nbWrapper').appendChild(wrapper);
  document.getElementById('nbHandle').value='';
  document.getElementById('nbMessage').value='';
  showToast('Note pinned to the desk!');
}

/* ═══════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════ */
const revealEls=document.querySelectorAll('.reveal');
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.12});
revealEls.forEach(el=>revObs.observe(el));

/* update nav links */
document.querySelector('.nav-center').innerHTML=`
  <li><a href="#vibes">Vibes</a></li>
  <li><a href="#pomo">Focus</a></li>
  <li><a href="#mixer">Sounds</a></li>
  <li><a href="#playlist">Playlist</a></li>
  <li><a href="#notes">Notes</a></li>
  <li><a href="#guestbook">Guestbook</a></li>
`;


/* ═══════════════════════════════════════
   BOILING DECO — activate on play
═══════════════════════════════════════ */
function updateBoilDeco(){
  const hero = document.querySelector('.hero');
  if(playing) hero.classList.add('hero-active');
  else hero.classList.remove('hero-active');
}

// Patch togglePlay to also update boil deco
const _origTogglePlay = togglePlay;
window.togglePlay = function(){
  _origTogglePlay();
  updateBoilDeco();
};

// Boiling vibe pills — random shimmer
setInterval(()=>{
  const pills = document.querySelectorAll('.mood-pill');
  const pick = pills[Math.floor(Math.random()*pills.length)];
  if(pick){
    pick.style.filter = 'url(#boil-strong)';
    setTimeout(()=>{ pick.style.filter = ''; }, 800);
  }
}, 2200);


/* ═══════════════════════════════════════
   THE ROAD DREAMS — game launcher
═══════════════════════════════════════ */


/* ═══════════════════════════════════════
   HANDWRITTEN RECEIPT — live session data
═══════════════════════════════════════ */
let tracksPlayed = 0;
let soundsActive = 0;

// patch nextTrack to count
const _origNext = nextTrack;
window.nextTrack = function() { _origNext(); tracksPlayed++; updateReceipt(); };
const _origSelect = selectTrack;
window.selectTrack = function(el, idx) { _origSelect(el, idx); tracksPlayed++; updateReceipt(); };

function updateReceipt() {
  const words = (document.getElementById('notePad')?.value?.trim().split(/\s+/).filter(Boolean).length) || 0;
  const todos = document.querySelectorAll('.todo-item.done').length;
  const mins = Math.floor(totalFocusSec / 60);
  soundsActive = Object.values(mixState).filter(Boolean).length;

  document.getElementById('rcptSessions').textContent = sessions;
  document.getElementById('rcptTracks').textContent   = tracksPlayed;
  document.getElementById('rcptWords').textContent    = words;
  document.getElementById('rcptTodos').textContent    = todos;
  document.getElementById('rcptSounds').textContent   = soundsActive;
  document.getElementById('rcptTotal').textContent    = mins < 60 ? mins + 'm' : Math.floor(mins/60) + 'h ' + (mins % 60) + 'm';
}
setInterval(updateReceipt, 3000);
updateReceipt();

/* ═══════════════════════════════════════
   MANIFESTO — stanza-key scroll reveal
═══════════════════════════════════════ */
const mKeys = document.querySelectorAll('.m-stanza-key');
const mObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); mObs.unobserve(e.target); }
  });
}, { threshold: 0.6 });
mKeys.forEach(k => mObs.observe(k));

/* update nav */
document.querySelector('.nav-center').innerHTML = `
  <li><a href="#vibes">Vibes</a></li>
  <li><a href="#pomo">Focus</a></li>
  <li><a href="#mixer">Sounds</a></li>
  <li><a href="#playlist">Playlist</a></li>
  <li><a href="#notes">Notes</a></li>
  <li><a href="#guestbook">Guestbook</a></li>
  <li><a href="#manifesto">Philosophy</a></li>
  <li><a href="#game">Dream</a></li>
`;


/* ═══════════════════════════════════════
   THE ROAD DREAMS — game launcher
═══════════════════════════════════════ */
function launchGame() {
  const cover = document.getElementById('gameCover');
  const frame = document.getElementById('gameFrame');
  cover.classList.add('hidden');
  frame.style.display = 'block';
  frame.src = 'road-dreams.html';
  showToast('The road remembers you — good luck');
}
