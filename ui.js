"use strict";
(() => {
const $=id=>document.getElementById(id);
const L=window.LifeSim,D=window.LifeData;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cap=x=>Math.max(0,Math.min(100,Math.round(x)));
let tab="All",modalAction=null,modalFilter="",historyCount=45;
const categories=["All","Life","Education","Careers","Activities","Assets","Relationships"];
let toastTimer;
function toast(message){
  const element=$("toast");element.textContent=message;element.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove("show"),2800);
}
function result(r){if(r?.message)toast(r.message);if(r?.ok)closeModal();}
function closeModal(){modalAction=null;$("choiceModal").hidden=true;$("modalOptions").innerHTML="";}
function openModal(id){
  const action=L.actions().find(x=>x.id===id);if(!action)return toast("That action is no longer available.");
  modalAction=id;modalFilter="";
  $("choiceModal").hidden=false;$("modalTitle").textContent=action.title;$("modalDescription").textContent=action.description||"Your choices can affect your future.";
  $("modalSearch").value="";
  $("modalSearch").hidden=action.options.length<=9;
  paintModal();
  if(action.options.length>9)$("modalSearch").focus();
  else $("closeModal").focus();
}
function paintModal(){
  if(!modalAction)return;
  const action=L.actions().find(x=>x.id===modalAction);
  if(!action){closeModal();return;}
  const filtered=action.options.map((o,i)=>({...o,index:i})).filter(o=>(o.label+" "+o.description+" "+o.disabled).toLowerCase().includes(modalFilter));
  $("modalOptions").innerHTML=filtered.map(o=>
    '<button type="button" class="modal-option" data-option="'+o.index+'" '+(o.disabled?'disabled title="'+esc(o.disabled)+'"':"")+'>'+
      '<span><strong>'+esc(o.label)+'</strong><small>'+esc(o.disabled||o.description||"Select this option")+'</small></span>'+
      (o.disabled?'<span aria-hidden="true">🔒</span>':'<span class="arrow" aria-hidden="true">→</span>')+
    '</button>').join("")||'<p class="empty-menu">No matching options. Try another search.</p>';
}
function render(){
  const s=L.get();
  $("setup").hidden=!!s;$("gameContent").hidden=!s;
  if(!s)return;
  const c=L.country(s.country),born=L.country(s.birthCountry),tal=L.talent(s.talent);
  $("avatar").textContent=s.royal?"👑":s.age<13?"🧒":s.age<65?"🙂":"👵";
  $("name").textContent=s.name;
  $("identityLine").textContent=s.city+", "+c.name;
  $("age").textContent=s.age;
  $("cash").textContent=L.format(s.cash);
  $("yearTitle").textContent=s.alive?"Age "+s.age+" · "+(s.job?.name||"Your story"):"A life remembered";
  $("status").textContent=s.alive?"● Alive":"● Remembered";
  $("status").style.color=s.alive?"#80dfb0":"#e8a1a1";
  const colors={health:"#54cba1",happiness:"#58b0eb",smarts:"#a896fa",looks:"#eab878",karma:"#e9a1b4",
    study:"#a596f0",technical:"#6ea5ee",music:"#eab874",athletics:"#82d4ab",art:"#ed9db0",business:"#d1b584",social:"#7dd6e8",fitness:"#90dba3",performance:"#f1b2df"};
  function makeBars(obj){return Object.entries(obj).map(([k,v])=>
    '<div class="stat"><div class="stat-title"><span>'+esc(k[0].toUpperCase()+k.slice(1))+'</span><strong>'+cap(v)+'%</strong></div>'+
    '<div class="stat-track"><div class="stat-fill" style="width:'+cap(v)+'%;background:'+colors[k]+'"></div></div></div>').join("");}
  $("stats").innerHTML=makeBars(s.stats);
  $("skills").innerHTML=makeBars(s.skills);
  $("talentInfo").innerHTML=esc(tal.emoji+" "+tal.name)+(s.royal?' <span class="royal">♛ Royal birth</span>':"")+
    '<span>Talent modifies skill development. Practice, equipment and study build lasting experience.</span>';
  const degree=s.education.current?s.education.current.subject+" ("+s.education.current.yearsLeft+" years left)":s.education.completed.length?s.education.completed.map(x=>x.subject+" · "+x.level).join(", "):s.education.highSchool?"Secondary school graduate":"In school / childhood";
  const overview=[
    ["Birthplace",born.name],["Family background",s.background],["Local income group",c.tier],["Natural talent",tal.name],
    ["Current education",degree],["Occupation",s.job?.name||"Not employed"],["Work experience",s.experience+" years"],
    ["Current annual salary",L.format(s.job?.salary||0)],["Last year's income",L.format(s.yearly.income)],
    ["Last year's expenses",L.format(s.yearly.expenses)],["Outstanding debt",L.format(s.debt)],
    ["Net worth",L.format(L.netWorth())],["Fame",cap(s.fame)+"/100"],["Followers",Math.round(s.followers).toLocaleString()],
    ["Relationship",s.relationship.status+(s.relationship.partner?" · "+s.relationship.partner:"")],
    ["Children",s.children],["Family relationship",cap(s.family)+"%"]
  ];
  if(s.military.veteran)overview.push(["Veteran status","Yes · education discount"]);
  if(s.military.active)overview.push(["Military rank",s.military.rank]);
  $("overview").innerHTML=overview.map(([k,v])=>'<div class="overview-row"><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join("");
  const possessions=[];
  s.assets.properties.forEach(p=>possessions.push([p.name,(p.primary?"Primary home · ":"")+(p.rented?"Rental · ":"")+"Value "+L.format(p.value)+" · Mortgage "+L.format(p.mortgage)]));
  s.assets.vehicles.forEach(v=>possessions.push([v.name,"Estimated value "+L.format(v.value)]));
  s.assets.items.forEach(v=>possessions.push([v.name,"Improves "+v.skill+" training"]));
  s.ventures.forEach(v=>possessions.push([v.name,"Business · last profit "+L.format(v.revenue||0)]));
  $("possessions").innerHTML=possessions.length?possessions.map(([name,detail])=>'<div class="possession-item"><strong>'+esc(name)+'</strong><small>'+esc(detail)+'</small></div>').join(""):'<p class="muted small">No property or items yet. Build your wealth through work and investments.</p>';
  $("timeline").innerHTML=s.history.slice(0,historyCount).map(x=>
    '<div class="journal-entry"><span class="journal-age">AGE '+Number(x.age)+'</span><span class="journal-text">'+esc(x.text)+'</span></div>').join("")+
    (s.history.length>historyCount?'<button class="history-more" id="moreHistory">Show older events →</button>':"");
  const e=L.pendingEvent();
  $("event").hidden=!e;
  if(e)$("event").innerHTML='<span class="eyebrow">✦ YOUR DECISION</span><h3>'+esc(e.title)+'</h3><p>'+esc(e.body)+'</p><div class="event-options">'+e.options.map((o,i)=>
    '<button type="button" data-decision="'+i+'">'+esc(o.text)+(o.desc?'<small style="display:block;opacity:.8;font-weight:400">'+esc(o.desc)+'</small>':"")+'</button>').join("")+'</div>';
  const all=L.actions();
  if(!categories.includes(tab))tab="All";
  $("actionTabs").innerHTML=categories.map(cat=>
    '<button type="button" class="tab '+(tab===cat?"active":"")+'" data-tab="'+esc(cat)+'">'+esc(cat)+
    ' <span class="tab-count">'+(cat==="All"?all.length:all.filter(a=>a.category===cat).length)+'</span></button>').join("");
  const visible=tab==="All"?all:all.filter(x=>x.category===tab);
  $("actionButtons").innerHTML=visible.length?visible.map(a=>
    '<button type="button" class="action-choice" data-action="'+esc(a.id)+'" '+(s.used.includes(a.id)?'disabled':'')+'> <strong>'+esc(a.title)+'</strong><small>'+esc(s.used.includes(a.id)?"Done for this year":a.description||a.options.length+" available paths")+'</small></button>').join(""):
    '<p class="muted small">No available actions in this category right now. Age up or try another category.</p>';
  $("actions").hidden=!s.alive;$("ageUp").hidden=!s.alive;$("ageUp").disabled=!!e;
  $("ageUp").innerHTML=e?'Finish the decision first':'＋ Age up <span>1 year →</span>';
  $("legacy").hidden=s.alive;
  if(!s.alive)$("legacy").innerHTML='<span class="eyebrow">YOUR LEGACY</span><h2>'+esc(s.name)+'</h2>'+
    '<p>You lived '+s.age+' years. Born in '+esc(born.name)+', you '+(s.education.completed.length?'studied '+esc(s.education.completed.map(x=>x.subject).join(", ")):'followed your own educational path')+
    ', built '+s.experience+' years of professional experience and finished with a net worth of '+L.format(L.netWorth())+'.</p>'+
    '<p>Career: '+esc(s.job?.name||"Not employed")+' · '+s.children+' children · '+Math.round(s.followers).toLocaleString()+' followers · Fame '+cap(s.fame)+'/100.</p>'+
    '<button class="primary" id="playAgain">Begin another life →</button>';
}
function fillSetup(){
  $("countrySelect").innerHTML='<option value="">Surprise me (random)</option>'+D.countries.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+' · '+esc(c.tier)+'</option>').join("");
  $("talentSelect").innerHTML='<option value="">Surprise me (random)</option>'+D.talents.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.emoji+" "+t.name)+'</option>').join("");
}
function start(){
  const birthplace=$("countrySelect").value,background=$("backgroundSelect").value;
  if(background==="Royal household"&&birthplace&&!L.country(birthplace).royal){toast("Choose a monarchy such as the UK, Canada, Australia, or Japan for a royal start.");return;}
  const res=L.newLife({name:$("customName").value,country:birthplace,talent:$("talentSelect").value,background});toast(res.message);
}
$("start").addEventListener("click",start);
$("customName").addEventListener("keydown",e=>{if(e.key==="Enter")start();});
$("newLife").addEventListener("click",()=>{if(L.get()&&!confirm("Start a fresh life? Your current save will be replaced. Export it first if you'd like to keep it."))return;closeModal();L.reset();$("customName").value="";tab="All";historyCount=45;});
$("ageUp").addEventListener("click",()=>result(L.ageUp()));
$("actionTabs").addEventListener("click",e=>{const t=e.target.closest("[data-tab]");if(t){tab=t.dataset.tab;render();}});
$("actionButtons").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b)openModal(b.dataset.action);});
$("modalOptions").addEventListener("click",e=>{const b=e.target.closest("[data-option]");if(!b||b.disabled)return;result(L.act(modalAction,Number(b.dataset.option)));});
$("modalSearch").addEventListener("input",e=>{modalFilter=e.target.value.trim().toLowerCase();paintModal();});
$("closeModal").addEventListener("click",closeModal);
$("choiceModal").addEventListener("click",e=>{if(e.target===$("choiceModal"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("choiceModal").hidden)closeModal();});
$("event").addEventListener("click",e=>{const b=e.target.closest("[data-decision]");if(b)result(L.decide(Number(b.dataset.decision)));});
$("timeline").addEventListener("click",e=>{if(e.target.closest("#moreHistory")){historyCount+=45;render();}});
$("legacy").addEventListener("click",e=>{if(e.target.closest("#playAgain")){L.reset();tab="All";historyCount=45;}});
$("export").addEventListener("click",()=>{
  const save=L.get();if(!save)return toast("Create a character first.");
  const blob=new Blob([JSON.stringify(save,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="lifesim-"+save.id+".json";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Save downloaded.");
});
$("import").addEventListener("click",()=>$("importFile").click());
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>2000000)throw Error("Save file is too large.");
    const parsed=JSON.parse(await file.text());
    if(!L.validate(parsed))throw Error("Invalid save or unsupported version.");
    if(L.get()&&!confirm("Replace your current life with this backup?"))return;
    result(L.importSave(parsed));
  }catch(ex){toast(ex.message||"Unable to read save.");}
  finally{e.target.value="";}
});
fillSetup();L.onChange(render);L.load();render();
})();