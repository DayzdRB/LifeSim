"use strict";
// LifeSim v0.1 — dependency-free, original, offline-first life simulator.
const SAVE_KEY = "lifesim-v1";
const $ = (id) => document.getElementById(id);
const clamp = (x) => Math.max(0, Math.min(100, Math.round(x)));
const money = (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const random = (a,b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (a) => a[random(0,a.length-1)];
const firstNames = ["Avery","Jordan","Alex","Morgan","Taylor","Cameron","Sam","Riley","Quinn","Jamie","Dakota","Casey","Robin","Noah","Maya","Aria","Leo","Sofia","Eli","Zoe"];
const surnames = ["Morgan","Bennett","Walker","Diaz","Chen","Patel","Reed","Carter","Rivera","Kim","Brooks","Collins","Foster","Nguyen"];
const places = [["United States","Chicago"],["United States","Seattle"],["United States","Austin"],["Canada","Toronto"],["Canada","Montreal"],["France","Lyon"],["United Kingdom","Manchester"],["Germany","Hamburg"],["Italy","Turin"],["Australia","Melbourne"]];
const careers = [
  {name:"Retail associate",salary:29000,smart:0,education:0},
  {name:"Warehouse technician",salary:39000,smart:15,education:0},
  {name:"Administrative assistant",salary:41000,smart:30,education:0},
  {name:"Electrician",salary:58000,smart:35,education:0},
  {name:"IT support technician",salary:52000,smart:45,education:0},
  {name:"Software engineer",salary:92000,smart:65,education:1},
  {name:"Teacher",salary:56000,smart:50,education:1},
  {name:"Registered nurse",salary:76000,smart:60,education:1},
  {name:"Lawyer",salary:118000,smart:80,education:1},
  {name:"Research scientist",salary:97000,smart:82,education:1}
];
let state = null;
function change(mod) {
  Object.keys(mod).forEach((k) => {
    if (k === "cash") state.cash = Math.round(state.cash + mod[k]);
    else if (k === "family") state.family = clamp(state.family + mod[k]);
    else if (Object.hasOwn(state.stats,k)) state.stats[k] = clamp(state.stats[k] + mod[k]);
  });
}
function record(message){state.history.unshift({age:state.age,text:message});state.history=state.history.slice(0,250);}
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.remove("show"),2600);}
function fresh(name){
  const location=pick(places);
  state={
    version:1,id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2),
    name:(name||"").trim().slice(0,45)||pick(firstNames)+" "+pick(surnames),
    country:location[0],city:location[1],age:0,alive:true,
    stats:{health:random(60,100),happiness:random(55,95),smarts:random(30,100),looks:random(25,100),karma:50},
    cash:0,annualIncome:0,career:null,education:0,inUniversity:false,schoolPerformance:random(40,80),
    family:random(45,100),relationship:"Single",partner:null,children:0,
    history:[],pending:null,actions:[],lastYearNet:0
  };
  record("You were born in "+state.city+", "+state.country+". Your story begins.");
  save();render();
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){toast("Saving failed. Export a backup.");}}
function load(){
  try {
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return false;
    const parsed=JSON.parse(raw);
    if(!validSave(parsed))return false;
    state=parsed;return true;
  }catch(e){return false;}
}
function validSave(s){
  return !!s && s.version===1 && typeof s.name==="string" && s.name.length<100 &&
    Number.isInteger(s.age) && s.age>=0 && s.age<=120 &&
    typeof s.alive==="boolean" && typeof s.cash==="number" && Number.isFinite(s.cash) &&
    s.stats && ["health","happiness","smarts","looks","karma"].every(k=>typeof s.stats[k]==="number"&&Number.isFinite(s.stats[k])) &&
    Array.isArray(s.history) && Array.isArray(s.actions) && s.history.length<=5000 &&
    typeof s.family==="number" && Number.isFinite(s.family);
}
function availableJobs(){return careers.filter(c=>state.stats.smarts>=c.smart && state.education>=c.education);}
function action(id,label,fn){return {id,label,run:fn};}
function getActions(){
  if(!state.alive || state.pending)return [];
  const a=[];
  if(state.age>=5&&state.age<=22)a.push(action("study","📚 Study harder",()=>{change({smarts:random(1,4),happiness:-2});state.schoolPerformance=clamp(state.schoolPerformance+random(5,12));record("You spent extra time studying.");}));
  if(state.age<18)a.push(action("play","🎮 Have fun",()=>{change({happiness:random(5,12),health:1});record("You made time to enjoy being young.");}));
  if(state.age>=5)a.push(action("exercise","🏃 Exercise",()=>{change({health:random(3,8),happiness:2});record("You exercised and felt healthier.");}));
  a.push(action("family","💬 Spend time with family",()=>{change({family:random(5,12),happiness:random(2,6)});record("You spent a meaningful day with your family.");}));
  if(state.age>=16)a.push(action("friends","🎉 Socialize",()=>{change({happiness:random(5,10),family:-1});record("You went out and had a good time with friends.");}));
  if(state.age>=18){
    a.push(action("doctor","🩺 Visit doctor · $200",()=>{if(state.cash<200){toast("You need $200.");return false;}change({cash:-200,health:random(5,14)});record("You visited a doctor for a checkup.");}));
    if(!state.career)a.push(action("job","💼 Find a job",()=>{const jobs=availableJobs();if(!jobs.length){toast("No roles available yet.");return false;}const chosen=pick(jobs);state.career={name:chosen.name,salary:chosen.salary,years:0};state.annualIncome=chosen.salary;change({happiness:5});record("You were hired as a "+chosen.name+" with a salary of "+money(chosen.salary)+".");}));
    else a.push(action("work","📈 Work harder",()=>{const success=Math.random()<.6; if(success){const rise=random(1000,6000);state.career.salary+=rise;state.annualIncome=state.career.salary;record("Your hard work earned you a raise of "+money(rise)+" per year.");change({happiness:2});}else{record("You put in extra hours, but no raise came this time.");change({happiness:-2});}}));
    if(!state.inUniversity && state.education===0 && state.age>=18 && state.age<=35)a.push(action("college","🎓 Enroll in university",()=>{if(state.cash<1000){toast("Enrollment requires $1,000.");return false;}change({cash:-1000,happiness:3});state.inUniversity=true;state.universityYears=0;record("You enrolled in university. Tuition will be charged each year.");}));
    if(state.relationship==="Single")a.push(action("date","❤️ Go on a date",()=>{const success=Math.random()<.55;if(success){state.relationship="Dating";state.partner=pick(firstNames)+" "+pick(surnames);record("You started dating "+state.partner+".");change({happiness:9});}else{record("Your date was pleasant, but there wasn't a spark.");change({happiness:-2});}}));
    else if(state.relationship==="Dating")a.push(action("marry","💍 Propose marriage",()=>{if(Math.random()<.7){state.relationship="Married";record("You married "+state.partner+"!");change({happiness:15});}else{record(state.partner+" wasn't ready to get married.");change({happiness:-8});}}));
    if(state.relationship==="Married"&&state.age<=49)a.push(action("child","🍼 Try for a child",()=>{if(Math.random()<.65){state.children++;record("Your family welcomed a child!");change({happiness:12,cash:-2000});}else record("You didn't welcome a child this year.");}));
    if(state.career && state.age>=55)a.push(action("retire","🌴 Retire",()=>{record("You retired from your career as a "+state.career.name+".");state.career=null;state.annualIncome=0;change({happiness:8});}));
    if(state.cash>=500)a.push(action("donate","🤲 Donate $500",()=>{change({cash:-500,karma:8,happiness:3});record("You donated $500 to a local charity.");}));
  }
  return a.filter(x=>!state.actions.includes(x.id));
}
const events=[
  {id:"friend",weight:8,min:6,max:75,title:"An unexpected invitation",body:"An old friend invites you to spend the weekend together.",choices:[
    {text:"Go and have fun",effect:{happiness:8,cash:-120},result:"You made some wonderful memories."},
    {text:"Politely decline",effect:{happiness:-2},result:"You stayed home and enjoyed a quiet weekend."}]},
  {id:"found",weight:6,min:7,max:75,title:"A wallet on the sidewalk",body:"You find a wallet containing $150 and an ID card.",choices:[
    {text:"Return the wallet",effect:{karma:10,happiness:5},result:"The owner was grateful for your honesty."},
    {text:"Keep the money",effect:{cash:150,karma:-12},result:"You kept the cash, but felt uneasy afterward."}]},
  {id:"course",weight:7,min:12,max:60,title:"An online course",body:"A free course could help you learn valuable new skills.",choices:[
    {text:"Take the course",effect:{smarts:7,happiness:-2},result:"You finished the course and learned a lot."},
    {text:"Skip it",effect:{happiness:3},result:"You decided to enjoy your free time."}]},
  {id:"sick",weight:6,min:0,max:110,title:"Feeling unwell",body:"You've come down with a nasty illness.",choices:[
    {text:"Rest and recover",effect:{health:3,happiness:-4},result:"Rest helped you recover."},
    {text:"Push through it",effect:{health:-9,happiness:-3},result:"Ignoring your symptoms made things worse."}]},
  {id:"relocation",weight:3,min:18,max:65,title:"A fresh start",body:"A new opportunity gives you the chance to move to a different city.",choices:[
    {text:"Move somewhere new",effect:{cash:-1500,happiness:7},result:"You packed your bags and began a new chapter.",move:true},
    {text:"Stay where you are",effect:{happiness:1},result:"You decided to keep the life you've built."}]},
  {id:"windfall",weight:2,min:18,max:100,title:"Unexpected good fortune",body:"You receive a surprise financial gift from a distant relative.",choices:[
    {text:"Save the money",effect:{cash:random(1500,6500),happiness:4},result:"You put the money into your savings."},
    {text:"Treat yourself",effect:{cash:100,happiness:12},result:"You spent most of the gift on something special."}]},
  {id:"stranger",weight:5,min:15,max:90,title:"Someone needs help",body:"A stranger has dropped their shopping bags and needs a hand.",choices:[
    {text:"Offer to help",effect:{karma:5,happiness:4},result:"The stranger thanked you warmly."},
    {text:"Keep walking",effect:{karma:-3},result:"You continued on with your day."}]},
  {id:"pet",weight:5,min:8,max:80,title:"A furry companion",body:"An animal shelter is looking for someone to adopt a friendly dog.",choices:[
    {text:"Adopt the dog · $250",effect:{cash:-250,happiness:10},result:"You welcomed a new furry friend into your home."},
    {text:"Not right now",effect:{},result:"You decided the timing wasn't right."}]},
  {id:"mentor",weight:4,min:16,max:50,title:"Words of encouragement",body:"A mentor notices your potential and offers to help you achieve your goals.",choices:[
    {text:"Accept guidance",effect:{smarts:5,happiness:5},result:"You learned valuable lessons from your mentor."},
    {text:"Find your own path",effect:{happiness:2},result:"You chose to follow your own instincts."}]},
  {id:"workplace",weight:6,min:18,max:70,requiresJob:true,title:"Workplace dilemma",body:"A coworker takes credit for an idea you developed.",choices:[
    {text:"Speak with your manager",effect:{happiness:3,karma:2},result:"You calmly explained your contribution."},
    {text:"Let it go",effect:{happiness:-5},result:"You stayed quiet to avoid a confrontation."}]},
  {id:"business",weight:3,min:18,max:75,title:"A side hustle",body:"You have an idea for a small weekend business.",choices:[
    {text:"Give it a try · $500",effect:{cash:-500,happiness:5,smarts:3},result:"You started a small side project and learned from it."},
    {text:"Focus on your current life",effect:{happiness:1},result:"You decided not to add more commitments."}]},
  {id:"family",weight:6,min:0,max:100,title:"A family gathering",body:"Your relatives are planning a celebration.",choices:[
    {text:"Make time for family",effect:{family:12,happiness:6},result:"You enjoyed spending time together."},
    {text:"Stay home",effect:{family:-7,happiness:1},result:"You passed on the gathering this time."}]}
];
function pickEvent(){
  const eligible=events.filter(e=>state.age>=e.min&&state.age<=e.max&&(!e.requiresJob||state.career));
  if(!eligible.length)return null;
  const total=eligible.reduce((sum,e)=>sum+e.weight,0);let n=Math.random()*total;
  for(const e of eligible){n-=e.weight;if(n<=0)return e;}
  return eligible[eligible.length-1];
}
function annual(){
  const age=state.age;
  if(age===5)record("You started elementary school.");
  if(age===13)record("You entered your teenage years.");
  if(age===18)record("You became an adult. Careers, university, and new choices are available.");
  if(age===65)record("You reached traditional retirement age.");
  if(age===18 && state.schoolPerformance>=70)change({smarts:4});
  if(age===18)record("You graduated from high school.");
  if(state.inUniversity){
    state.universityYears=(state.universityYears||0)+1;
    state.cash-=6500;
    record("You paid "+money(6500)+" in university tuition.");
    if(state.universityYears>=4){state.inUniversity=false;state.education=1;record("You graduated from university! New careers are available.");change({happiness:12,smarts:6});}
  }
  const salary=state.career?state.career.salary:0;
  if(state.career)state.career.years++;
  const spend=age<18?0:Math.round(14000+Math.min(state.children,5)*3500+(state.relationship==="Married"?3500:0));
  state.cash+=salary-spend;state.lastYearNet=salary-spend;
  if(age>=18)record("Annual finances: "+money(salary)+" earned, "+money(spend)+" living expenses. Net "+money(salary-spend)+".");
  if(age>35)change({health:-random(0,2)});
  if(age>65)change({health:-random(1,6)});
  if(age>85)change({health:-random(2,8)});
  if(age<16)change({smarts:random(0,2)});
  change({happiness:random(-4,4),family:random(-3,2)});
  if(state.career&&Math.random()<.05){state.career=null;state.annualIncome=0;record("Your employer laid you off. You need to find a new job.");change({happiness:-15});}
  if(state.relationship!=="Single"&&Math.random()<.025){record("You and "+state.partner+" separated.");state.relationship="Single";state.partner=null;change({happiness:-15});}
}
function die(reason){
  state.alive=false;state.pending=null;
  record(reason||"Your life came to an end.");
  save();render();
}
function ageUp(){
  if(!state||!state.alive)return;
  if(state.pending){toast("Make your decision before aging up.");return;}
  state.age++;state.actions=[];annual();
  const deathChance=state.age<55?0:Math.pow((state.age-50)/90,3)*0.45 + (100-state.stats.health)*0.0006;
  if(state.stats.health===0 || state.age>=110 || Math.random()<deathChance){
    die("You passed away at age "+state.age+". Your story will be remembered.");return;
  }
  if(Math.random()<.85){
    const event=pickEvent();if(event)state.pending=event.id;
  }
  save();render();
}
function decide(index){
  const event=events.find(e=>e.id===state.pending);
  if(!event||!event.choices[index])return;
  const c=event.choices[index];
  // Do not allow a paid option if funds are insufficient, unless a debt system is explicitly added.
  if(c.text.includes("· $")&&state.cash<Math.abs(c.effect.cash||0)){toast("Not enough money for that choice.");return;}
  change(c.effect);
  if(c.move){const choices=places.filter(p=>p[1]!==state.city);const loc=pick(choices);state.country=loc[0];state.city=loc[1];}
  record(c.result);
  state.pending=null;save();render();
}
function doAction(id){
  const a=getActions().find(x=>x.id===id);if(!a)return;
  if(a.run()===false)return;
  state.actions.push(id);save();render();
}
function esc(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
  $("setup").hidden=!!state;
  $("gameContent").hidden=!state;
  if(!state)return;
  $("avatar").textContent=state.age<13?"🧒":state.age<65?"🙂":"👵";
  $("name").textContent=state.name;
  $("identityLine").textContent=state.city+", "+state.country;
  $("age").textContent=state.age;
  $("cash").textContent=money(state.cash);
  $("yearTitle").textContent=state.alive?"Age "+state.age+" · Your story":"A life remembered";
  $("status").textContent=state.alive?"● Alive":"● Remembered";
  const colors={health:"#55c99a",happiness:"#53afea",smarts:"#b593f5",looks:"#e9ad6c",karma:"#eb8bad"};
  $("stats").innerHTML=Object.keys(state.stats).map(k=>'<div><div class="stat-title"><span>'+esc(k[0].toUpperCase()+k.slice(1))+'</span><strong>'+clamp(state.stats[k])+'%</strong></div><div class="stat-track"><div class="stat-fill" style="width:'+clamp(state.stats[k])+'%;background:'+colors[k]+'"></div></div></div>').join("");
  const stage=state.age<5?"Infant":state.age<13?"Child":state.age<18?"Teenager":state.age<65?"Adult":"Senior";
  const overview=[["Life stage",stage],["Education",state.education?"University graduate":state.inUniversity?"University student":state.age>=18?"High school graduate":state.age>=5?"In school":"Not enrolled"],["Occupation",state.career?state.career.name:"Not employed"],["Annual income",money(state.career?state.career.salary:0)],["Relationship",state.relationship+(state.partner?" · "+state.partner:"")],["Children",state.children],["Family bond",Math.round(state.family)+"%"]];
  $("overview").innerHTML=overview.map(r=>'<div class="overview-row"><span>'+esc(r[0])+'</span><strong>'+esc(r[1])+'</strong></div>').join("");
  $("timeline").innerHTML=state.history.slice(0,36).map(item=>'<div class="journal-entry"><span class="journal-age">AGE '+Number(item.age)+'</span><span class="journal-text">'+esc(item.text)+'</span></div>').join("");
  const event=events.find(e=>e.id===state.pending);
  $("event").hidden=!event;
  if(event)$("event").innerHTML='<span class="eyebrow">✦ LIFE DECISION</span><h3>'+esc(event.title)+'</h3><p>'+esc(event.body)+'</p><div class="event-options">'+event.choices.map((c,i)=>'<button data-choice="'+i+'">'+esc(c.text)+'</button>').join("")+'</div>';
  $("actions").hidden=!state.alive;
  $("actionButtons").innerHTML=getActions().map(a=>'<button class="action-choice" data-action="'+esc(a.id)+'">'+esc(a.label)+'</button>').join("") || '<p class="muted">No more actions available this year.</p>';
  $("ageUp").hidden=!state.alive;
  $("ageUp").disabled=!!state.pending;
  $("legacy").hidden=state.alive;
  if(!state.alive)$("legacy").innerHTML='<span class="eyebrow">YOUR LEGACY</span><h2>'+esc(state.name)+'</h2><p>You lived to age '+state.age+' in '+esc(state.country)+'. You '+(state.education?"earned a university degree":"followed your own path")+', '+(state.career?"worked as a "+esc(state.career.name):"explored different opportunities")+', and finished with '+money(state.cash)+'.</p><p>You leave behind '+state.children+' child(ren) and a lifetime of memories.</p><button class="primary" id="playAgain">Live another life →</button>';
}
$("start").addEventListener("click",()=>fresh($("customName").value));
$("customName").addEventListener("keydown",e=>{if(e.key==="Enter")fresh($("customName").value);});
$("newLife").addEventListener("click",()=>{if(state&&!confirm("Start a new life? Your current save will be replaced. Export it first if you want to keep it."))return;state=null;localStorage.removeItem(SAVE_KEY);render();$("customName").value="";});
$("ageUp").addEventListener("click",ageUp);
$("actionButtons").addEventListener("click",e=>{const button=e.target.closest("[data-action]");if(button)doAction(button.dataset.action);});
$("event").addEventListener("click",e=>{const button=e.target.closest("[data-choice]");if(button)decide(Number(button.dataset.choice));});
$("legacy").addEventListener("click",e=>{if(e.target.closest("#playAgain")){state=null;localStorage.removeItem(SAVE_KEY);render();}});
$("export").addEventListener("click",()=>{if(!state){toast("Start a life first.");return;}const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="lifesim-"+state.id+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Save exported.");});
$("import").addEventListener("click",()=>$("importFile").click());
$("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error("File is too large.");const parsed=JSON.parse(await file.text());if(!validSave(parsed))throw Error("Invalid or unsupported save format.");if(state&&!confirm("Replace your current life with the imported save?"))return;state=parsed;save();render();toast("Save imported.");}catch(err){toast(err.message||"Could not load save.");}finally{e.target.value="";}});
if(!load())render();else render();
