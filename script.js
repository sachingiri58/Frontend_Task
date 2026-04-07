const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const today=new Date();
let cy=today.getFullYear(),cm=today.getMonth();
let rs=null,re=null;
let notes={};
try{notes=JSON.parse(localStorage.getItem('wcal-notes')||'{}')}catch(e){}

function buildRings(){
  const b=document.getElementById('binding');b.innerHTML='';
  for(let i=0;i<14;i++){
    const r=document.createElement('div');
    r.className='ring';
    b.appendChild(r);
  }
}

function key(y,m){return y+'-'+m}

function saveMainNote(){
  notes[key(cy,cm)+'|main']=document.getElementById('main-note').value;
  persist();
}

function saveSideNote(){
  notes[key(cy,cm)+'|side']=document.getElementById('side-note').value;
  persist();
}

function persist(){
  try{localStorage.setItem('wcal-notes',JSON.stringify(notes))}catch(e){}
}

function loadNotes(){
  document.getElementById('main-note').value=notes[key(cy,cm)+'|main']||'';
  document.getElementById('side-note').value=notes[key(cy,cm)+'|side']||'';
}

function changeMonth(d){
  cm+=d;
  if(cm>11){cm=0;cy++}
  if(cm<0){cm=11;cy--}
  rs=null;re=null;
  render();
}

function clearSel(){
  rs=null;re=null;
  render();
}

function fmtDate(o){
  return MONTHS[o.m].slice(0,3)+' '+o.d;
}

function click(y,m,d){
  if(!rs||(rs&&re)){rs={y,m,d};re=null}
  else{
    const a=new Date(rs.y,rs.m,rs.d),b=new Date(y,m,d);
    if(b<a){rs={y,m,d};re=null}else{re={y,m,d}}
  }
  render();
}

function isSt(y,m,d){return rs&&rs.y===y&&rs.m===m&&rs.d===d}
function isEn(y,m,d){return re&&re.y===y&&re.m===m&&re.d===d}

function inRng(y,m,d){
  if(!rs||!re)return false;
  const t=new Date(y,m,d),s=new Date(rs.y,rs.m,rs.d),e=new Date(re.y,re.m,re.d);
  return t>s&&t<e;
}

function render(){
  const mn=MONTHS[cm];
  document.getElementById('hero-mn').textContent=mn.toUpperCase();
  document.getElementById('hero-yr').textContent=cy;
  document.getElementById('nav-h2').textContent=mn+' '+cy;

  const grid=document.getElementById('days');
  grid.innerHTML='';

  const first=new Date(cy,cm,1);
  let dow=first.getDay();
  dow=dow===0?6:dow-1;

  const dim=new Date(cy,cm+1,0).getDate();
  const prev=new Date(cy,cm,0).getDate();

  for(let i=0;i<dow;i++){
    const c=document.createElement('div');
    c.className='dc othermonth';
    c.textContent=prev-dow+1+i;
    grid.appendChild(c);
  }

  for(let d=1;d<=dim;d++){
    const c=document.createElement('div');
    const cls=['dc'];
    const dw=(dow+d-1)%7;

    if(dw===5)cls.push('sat');
    if(dw===6)cls.push('sun');

    if(new Date(cy,cm,d).toDateString()===today.toDateString())cls.push('today');
    if(isSt(cy,cm,d))cls.push('rstart');
    if(isEn(cy,cm,d))cls.push('rend');
    if(inRng(cy,cm,d))cls.push('inrange');

    c.className=cls.join(' ');
    c.textContent=d;
    c.onclick=()=>click(cy,cm,d);

    grid.appendChild(c);
  }

  const tail=(7-(dow+dim)%7)%7;
  for(let i=1;i<=tail;i++){
    const c=document.createElement('div');
    c.className='dc othermonth';
    c.textContent=i;
    grid.appendChild(c);
  }

  const pill=document.getElementById('range-pill');
  const pillTxt=document.getElementById('pill-txt');

  if(rs&&re){
    const days=Math.round((new Date(re.y,re.m,re.d)-new Date(rs.y,rs.m,rs.d))/(864e5));
    pillTxt.textContent=fmtDate(rs)+' → '+fmtDate(re)+' · '+days+' days';
    pill.style.display='flex';
  } else if(rs){
    pillTxt.textContent=fmtDate(rs)+' selected';
    pill.style.display='flex';
  } else {
    pill.style.display='none';
  }

  loadNotes();
}

buildRings();
render();