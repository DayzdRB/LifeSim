"use strict";
/* LifeSim v0.2: engine separated from the presentation layer.
 * All amounts are simulated USD-equivalent GAME DOLLARS, not real world wage quotes.
 */
(function () {
const D = window.LifeData;
if (!D) throw new Error("world.js must load before engine.js");
const KEY = "lifesim-v2", OLD = "lifesim-v1";
const rand = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const pick = list => list[rand(0,list.length-1)];
const cap = x => Math.max(0,Math.min(100,Math.round(x)));
const round = x => Math.round(x);
const fmt = n => (n<0?"-":"")+"$"+Math.abs(Math.round(n)).toLocaleString("en-US");
const first = ["Avery","Jordan","Alex","Morgan","Taylor","Cameron","Sam","Riley","Quinn","Jamie","Dakota","Casey","Robin","Noah","Maya","Aria","Leo","Sofia","Eli","Zoe","Emilia","Isabella","Milo","Hana","Lucas","Amara","Sana","Priya"];
const last = ["Morgan","Bennett","Walker","Diaz","Chen","Patel","Reed","Carter","Rivera","Kim","Brooks","Collins","Foster","Nguyen","Okafor","Singh","Garcia","Sato","Ndlovu","Dubois"];
let s=null, listener=()=>{};
function country(id){return D.countries.find(x=>x.id===id)||D.countries[0];}
function talent(id){return D.talents.find(x=>x.id===id)||D.talents[D.talents.length-1];}
function log(text){s.history.unshift({age:s.age,text});s.history=s.history.slice(0,400);}
function change(delta){Object.entries(delta).forEach(([key,value])=>{
  if(key==="cash")s.cash=round(s.cash+value);
  else if(key==="debt")s.debt=Math.max(0,round(s.debt+value));
  else if(key==="family")s.family=cap(s.family+value);
  else if(key==="fame")s.fame=cap(s.fame+value);
  else if(key==="followers")s.followers=Math.max(0,round(s.followers+value));
  else if(key in s.stats)s.stats[key]=cap(s.stats[key]+value);
  else if(key in s.skills)s.skills[key]=cap(s.skills[key]+value);
});}
function addCash(amount){s.cash=round(s.cash+amount);}
function charge(amount){amount=Math.max(0,round(amount));if(s.cash<amount)return false;addCash(-amount);return true;}
function cost(a){return round(a*country(s.country).cost);}
function price(a){return round(a*country(s.country).housing);}
function salary(a){return round(a*country(s.country).salary);}
function netWorth(){return round(s.cash-s.debt+s.assets.properties.reduce((v,p)=>v+p.value-p.mortgage,0)+s.assets.vehicles.reduce((v,p)=>v+p.value,0)+s.assets.items.reduce((v,p)=>v+p.value,0)+s.ventures.reduce((v,p)=>v+p.worth,0));}
function result(ok,message){return {ok,message:message||""};}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){return false;}return true;}
function changed(){persist();listener();}
function credential(level,subject){return s.education.completed.some(c=>c.level===level&&(subject===undefined||c.subject===subject));}
function qualified(job){
  if(s.age<18)return "Must be at least 18";
  if(job.maxAge&&s.age>job.maxAge)return "Above entry age for this career";
  if(job.royalOnly&&!s.royal)return "Royal birth required";
  if(job.followers&&s.followers<job.followers)return "Need "+job.followers.toLocaleString()+" followers";
  if((s.skills[job.skill]||0)<job.min)return "Need "+job.skill+" skill "+job.min;
  if(job.years&&s.experience<job.years)return "Need "+job.years+" years of work experience";
  if(job.level!=="none"){
    const accepted=job.subjects||[];
    const levels=job.level==="trade"?["trade"]:job.level==="associate"?["associate","bachelor","master","doctorate"]:job.level==="bachelor"?["bachelor","master","doctorate"]:job.level==="master"?["master","doctorate"]:["doctorate"];
    if(!s.education.completed.some(c=>levels.includes(c.level)&&accepted.includes(c.subject)))return "Requires "+job.level+" in "+accepted.join(" / ");
  }
  if(s.criminalRecord&&["teacher","detective","nurse"].includes(job.id))return "Criminal record prevents this job";
  return "";
}
function careerPay(job){
  const proficiency=s.skills[job.skill]||0;
  const xp=Math.min(.42,s.experience*.024);
  const celebrity=job.category==="Fame"?1+s.fame*.045:1;
  const earned=job.base*(.72+proficiency*.005+xp)*celebrity;
  return salary(earned);
}
function newLife(opts={}){
  const home=opts.country&&country(opts.country).id===opts.country?country(opts.country):pick(D.countries);
  const special=opts.talent&&D.talents.some(t=>t.id===opts.talent)?opts.talent:pick(D.talents).id;
  const familyBand=Math.random()<.18?"Struggling":Math.random()<.74?"Working / middle class":"Affluent";
  const royal=home.royal&&Math.random()<.012;
  const skills={study:rand(15,35),technical:rand(8,27),music:rand(5,23),athletics:rand(8,28),art:rand(5,25),business:rand(7,25),social:rand(9,35),fitness:rand(8,28),performance:rand(7,29)};
  const t=talent(special);
  if(t.skill)skills[t.skill]=cap(skills[t.skill]+28);
  const scores={health:rand(65,100),happiness:rand(56,91),smarts:rand(34,94),looks:rand(25,95),karma:50};
  if(special==="intellect")scores.smarts=cap(scores.smarts+12);
  if(special==="athletic")scores.health=cap(scores.health+8);
  s={version:2,id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9),
    name:(opts.name||"").trim().slice(0,50)||pick(first)+" "+pick(last),
    birthCountry:home.id,country:home.id,city:pick(home.cities),age:0,alive:true,
    talent:special,royal,background:royal?"Royal household":familyBand,
    stats:scores,skills,family:rand(42,98),cash:royal?round(25000*home.salary):0,debt:0,
    education:{highSchool:false,completed:[],current:null,grades:rand(42,84)},
    job:null,experience:0,military:{active:false,branch:null,years:0,veteran:false,rank:""},
    fame:royal?20:0,followers:0,creativeWorks:0,ventures:[],criminalRecord:false,
    assets:{properties:[],vehicles:[],items:[]},relationship:{status:"Single",partner:""},children:0,
    effects:[],flags:{},yearly:{income:0,expenses:0,net:0},history:[],pending:null,used:[]};
  log("You were born in "+s.city+", "+home.name+". "+(royal?"You belong to a royal household.":"Your family is "+familyBand.toLowerCase()+"."));
  log("Your natural talent: "+t.name+". How you develop it will affect your future.");
  changed();return result(true,"A new life begins!");
}
function migrateOld(old){
  const home=D.countries.find(c=>c.name===old.country)||D.countries[0];
  newLife({name:old.name,country:home.id});
  s.city=old.city||s.city;s.age=old.age;s.alive=old.alive;
  Object.keys(s.stats).forEach(k=>{if(Number.isFinite(old.stats?.[k]))s.stats[k]=cap(old.stats[k]);});
  s.cash=old.cash||0;s.family=cap(old.family||60);
  s.education.highSchool=s.age>=18;s.education.grades=old.schoolPerformance||65;
  if(old.education){s.education.completed.push({level:"bachelor",subject:"Business"});}
  if(old.career){s.job={id:"legacy",name:old.career.name,salary:old.career.salary,years:old.career.years||0};}
  s.relationship.status=old.relationship||"Single";s.relationship.partner=old.partner||"";s.children=old.children||0;
  s.history=old.history?.slice(0,300)||s.history;
  s.pending=null;s.used=[];
  log("Your existing LifeSim v0.1 save was upgraded to v0.2.");
  changed();
}
function validate(x){return !!x&&x.version===2&&typeof x.name==="string"&&x.name.length<=55&&
  Number.isInteger(x.age)&&x.age>=0&&x.age<=110&&typeof x.alive==="boolean"&&
  Number.isFinite(x.cash)&&Number.isFinite(x.debt)&&x.debt>=0&&
  D.countries.some(c=>c.id===x.country)&&D.countries.some(c=>c.id===x.birthCountry)&&
  x.stats&&x.skills&&["health","happiness","smarts","looks","karma"].every(k=>Number.isFinite(x.stats[k]))&&
  ["study","technical","music","athletics","art","business","social","fitness","performance"].every(k=>Number.isFinite(x.skills[k]))&&
  x.education&&Array.isArray(x.education.completed)&&x.assets&&
  ["properties","vehicles","items"].every(k=>Array.isArray(x.assets[k])&&x.assets[k].length<1000)&&
  Array.isArray(x.history)&&x.history.length<=1000&&Array.isArray(x.used)&&
  Array.isArray(x.ventures)&&Array.isArray(x.effects)&&x.effects.length<1000&&
  Number.isFinite(x.fame)&&Number.isFinite(x.followers);}
function load(){
  try{const candidate=JSON.parse(localStorage.getItem(KEY));if(validate(candidate)){s=candidate;listener();return true;}}catch(_){}
  try{const old=JSON.parse(localStorage.getItem(OLD));if(old&&old.version===1&&old.stats&&old.name){migrateOld(old);return true;}}catch(_){}
  return false;
}
function importSave(x){if(!validate(x))return result(false,"Invalid or unsupported save file.");s=x;changed();return result(true,"Save imported.");}
function reset(){s=null;try{localStorage.removeItem(KEY);localStorage.removeItem(OLD);}catch(_){}listener();}
function current(){return s;}
function canAct(){return s&&s.alive&&!s.pending;}
function used(id){return s.used.includes(id);}
function once(id,fn){if(!canAct())return result(false,"Resolve your event first.");if(used(id))return result(false,"Already done this year.");const out=fn();if(out.ok){s.used.push(id);changed();}return out;}
function offer(id,title,category,options,description){
  return {id,title,category,description:description||"",options};
}
function opt(label,description,run,disabled){return {label,description:description||"",run,disabled:disabled||""};}
function actionCatalog(){
  if(!canAct())return [];
  const a=[],c=country(s.country),adult=s.age>=18;
  a.push(offer("family","Spend time with family","Relationships",[
    opt("Spend the day together","Build a relationship that can help you later.",()=>{change({family:rand(5,13),happiness:rand(2,5)});log("You strengthened your family bond.");return result(true,"You enjoyed time with your family.");})
  ]));
  if(s.age>=5)a.push(offer("study","Study and learn","Education",[
    opt("Study hard","Improves study skill, grades and smarts.",()=>{const bonus=s.talent==="intellect"?6:3;change({study:rand(4,7)+bonus,smarts:rand(1,3)});s.education.grades=cap(s.education.grades+rand(4,9));log("You studied hard and improved your academic skills.");return result(true,"Your studies are paying off.");})
  ]));
  if(adult&&!s.education.current){
    const options=[];
    const paths=[["trade","Trade school",2],["associate","Associate degree",2],["bachelor","Bachelor's degree",4],["master","Master's degree",2],["doctorate","Doctorate",4]];
    for(const [level,title,years] of paths){
      if(level==="master"&&!s.education.completed.some(x=>x.level==="bachelor"))continue;
      if(level==="doctorate"&&!s.education.completed.some(x=>x.level==="master"))continue;
      if(level==="bachelor"&&s.education.completed.some(x=>x.level==="bachelor"))continue;
      for(const subject of D.degrees[level]){
        if(credential(level,subject))continue;
        const base=level==="trade"?.48:level==="associate"?.62:level==="bachelor"?1:level==="master"?1.36:1.55;
        const tuition=round(c.tuition*base*(s.military.veteran?.55:1));
        const merit=s.education.grades>=80||s.stats.smarts>=85;
        const discounted=merit?round(tuition*.67):tuition;
        options.push(opt(title+" · "+subject,""+years+" years · "+fmt(discounted)+"/year"+(merit?" · merit scholarship":""),
          ()=>{s.education.current={level,subject,yearsLeft:years,total:years,tuition:discounted};log("You enrolled in "+title+" for "+subject+". Tuition: "+fmt(discounted)+" per year.");change({happiness:4});return result(true,"Enrolled in "+subject+".");}));
      }
    }
    if(options.length)a.push(offer("enroll","Choose education path","Education",options,"Trade school, associate, bachelor's, master's and doctorate paths. Subjects affect career eligibility."));
  }
  if(s.education.current)a.push(offer("student","University / trade school","Education",[
    opt("Focus on your classes","Improve academic skills; you're studying "+s.education.current.subject+".",()=>{change({study:rand(4,7),smarts:2,happiness:-3});s.education.grades=cap(s.education.grades+8);log("You focused on your "+s.education.current.subject+" coursework.");return result(true,"Improved your grades.");}),
    opt("Drop out","Stops tuition payments; credits already earned are kept.",()=>{log("You withdrew from "+s.education.current.subject+" before graduating.");s.education.current=null;change({happiness:-8});return result(true,"You left the program.");})
  ]));
  if(adult){
    const sorted=D.jobs.slice().sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
    a.push(offer("jobs","Browse & apply for jobs","Careers",sorted.map(job=>{
      const reason=qualified(job),pay=careerPay(job);
      return opt(job.name,job.category+" · approx. "+fmt(pay)+"/year · "+(reason||"Qualified"),
        ()=>{if(Math.random()>.94 && s.skills[job.skill]<85){log("You were not selected for the "+job.name+" job.");change({happiness:-3});return result(true,"Application unsuccessful. Try again next year.");}
          s.job={id:job.id,name:job.name,salary:pay,years:0,category:job.category};
          s.military.active=false;
          log("You accepted a position as "+job.name+" for "+fmt(pay)+" a year.");
          return result(true,"Hired: "+job.name+".");},reason);
    }),"Choose a specific job. Locked roles show required degrees, experience and skills."));
    if(s.job)a.push(offer("work","Work harder / get promoted","Careers",[
      opt("Ask for a raise","Uses experience, reputation and skills.",()=>{
        const professional=s.job.id==="military";
        const chance=Math.min(.9,.2+(s.skills.business+s.skills.social)/350+(s.experience/50));
        if(Math.random()<chance){
          const boost=professional?round(s.job.salary*.06):round(s.job.salary*(.04+rand(0,5)/100));
          s.job.salary+=boost;change({happiness:5,business:3});log("Your effort was rewarded with a "+fmt(boost)+" annual raise.");return result(true,"You got a raise!");
        }
        change({happiness:-3,business:1});log("You requested a raise, but your manager declined.");return result(true,"No raise this year.");
      })
    ]));
    if(s.job)a.push(offer("quit","Leave current job","Careers",[
      opt("Resign from "+s.job.name,"Income ends immediately.",()=>{log("You resigned from "+s.job.name+".");s.job=null;s.military.active=false;change({happiness:3});return result(true,"You left your job.");})
    ]));
    if(c.military&&s.age<=36&&!s.military.active&&!s.criminalRecord)
      a.push(offer("enlist","Join the military","Careers",["Army","Navy","Air Force"].map(branch=>opt("Enlist in "+branch,"Full-time pay, progression and future education benefits.",()=>{
        s.job={id:"military",name:branch+" service member",salary:salary(36000),years:0,category:"Military"};
        s.military.active=true;s.military.branch=branch;s.military.years=0;s.military.rank="Junior enlisted";
        log("You enlisted in the "+branch+" in "+c.name+".");change({fitness:7,health:4});return result(true,"You started military service.");
      })), "Service is simplified, voluntary gameplay—not an accurate national recruiting simulator."));
    if(s.military.active)a.push(offer("separate","Leave military service","Careers",[
      opt("Separate from service","Veteran education support becomes available after 4 years.",()=>{
        if(s.military.years>=4)s.military.veteran=true;
        s.military.active=false;s.job=null;log("You separated from military service after "+s.military.years+" years.");return result(true,"You left military service.");
      })
    ]));
    a.push(offer("entrepreneur","Start a company","Careers",[
      opt("Start a small company","Upfront "+fmt(cost(12000))+" · business skill 35 · profit varies annually.",()=>{
        if(s.ventures.length>=3)return result(false,"You already manage 3 businesses.");
        if(s.skills.business<35)return result(false,"You need business skill 35.");
        if(!charge(cost(12000)))return result(false,"You cannot afford the startup costs.");
        const name=pick(["Neighborhood Studio","Digital Services","Local Supply Co.","Creative Agency","Workshop Collective"]);
        s.ventures.push({id:"v"+Date.now()+rand(1,999),name,worth:cost(12000),revenue:0});
        log("You founded "+name+". Its income will depend on your business skill and the economy.");
        change({happiness:6,business:5});return result(true,"Business founded!");
      },s.skills.business<35?"Business skill 35 required":s.ventures.length>=3?"Maximum 3 businesses":"")
    ]));
  }
  a.push(offer("skills","Develop career skills","Activities",[
    opt("Study technology & programming","Improves technical abilities needed for engineering and IT careers.",()=>{const gain=rand(6,10)+(s.talent==="intellect"?4:0);change({technical:gain,smarts:2});log("You studied technology and practiced hands-on technical skills.");return result(true,"Technical skill +"+gain+".");}),
    opt("Learn business & leadership","Build business skill needed for management, entrepreneurship and CEO careers.",()=>{const gain=rand(6,10)+(s.talent==="business"?5:0);change({business:gain,social:2});log("You studied leadership, budgeting and business skills.");return result(true,"Business skill +"+gain+".");}),
    opt("Improve public speaking","Develop social skill for entertainment, networking and business.",()=>{const gain=rand(6,10)+(s.talent==="performer"?4:0);change({social:gain,performance:2});log("You worked on your communication and public speaking abilities.");return result(true,"Social skill +"+gain+".");})
  ]));
  a.push(offer("fitness","Exercise / train","Activities",[
    opt("Exercise","Better health and fitness help you as you age.",()=>{change({health:rand(4,8),fitness:rand(5,9),happiness:2});log("You stayed active and improved your fitness.");return result(true,"Your physical fitness improved.");}),
    opt("Train for competitive sport","Build athleticism toward a professional sports career.",()=>{change({athletics:rand(6,11)+(s.talent==="athletic"?5:0),fitness:5,health:2,happiness:-1});log("You trained seriously for sports.");return result(true,"Athletic ability improved.");})
  ]));
  a.push(offer("music","Practice music / DJ skills","Activities",[
    opt("Practice instruments","Instruments you own add permanent bonuses to practice.",()=>{const equipment=s.assets.items.filter(x=>x.skill==="music").reduce((n,x)=>n+x.gain,0);
      const boost=rand(4,8)+(s.talent==="music"?5:0)+Math.min(12,Math.floor(equipment/2));
      change({music:boost,happiness:3});log("You practiced music and improved your technique.");return result(true,"Music skill +"+boost+".");}),
    opt("Play a gig / DJ set","Requires music skill 35; earned income rises with fame.",()=>{if(s.skills.music<35)return result(false,"Need music skill 35.");
      const income=salary(rand(180,600)+s.skills.music*15+s.fame*120);
      addCash(income);change({fame:s.skills.music>60?rand(2,5):1,followers:rand(15,120)});log("You performed a gig and earned "+fmt(income)+".");return result(true,"Successful live performance.");
    },s.skills.music<35?"Music skill 35 required":"")
  ]));
  a.push(offer("art","Create art / perform","Activities",[
    opt("Practice painting and design","Increases art skill and helps creative careers.",()=>{change({art:rand(5,10)+(s.talent==="creative"?5:0),happiness:4});log("You made new artwork and developed your creative style.");return result(true,"Art skill improved.");}),
    opt("Rehearse acting","Increases performance skill for acting and celebrity careers.",()=>{change({performance:rand(5,9)+(s.talent==="performer"?5:0),social:2,happiness:2});log("You rehearsed and developed your stagecraft.");return result(true,"Performance skill improved.");}),
    opt("Sell or exhibit artwork","Art skill 35 required; high skill and fame improve earnings.",()=>{if(s.skills.art<35)return result(false,"Art skill 35 required.");
      const pay=salary(rand(50,350)+s.skills.art*18+s.fame*95);
      addCash(pay);change({fame:rand(1,3),followers:rand(20,150)});
      log("You sold artwork for "+fmt(pay)+".");return result(true,"An artwork was sold.");},s.skills.art<35?"Art skill 35 required":"")
  ]));
  if(s.age>=12)a.push(offer("content","Create videos / grow channel","Activities",[
    opt("Upload a video","Grow an audience; equipment, creativity, skill and fame affect your reach.",()=>{
      const camera=s.assets.items.some(x=>x.id==="camera")?1.3:1;
      const gain=round((rand(25,120)+s.skills.social*7+s.skills.art*4+s.fame*18)*camera);
      change({followers:gain,skill_unused:0,social:3,fame:gain>500?2:1,happiness:2});
      s.creativeWorks+=1;log("You uploaded a video and gained "+gain.toLocaleString()+" followers.");
      return result(true,"+"+gain.toLocaleString()+" followers.");}),
    opt("Release a single / music track","Music skill 45; unlock streaming royalties and audience growth.",()=>{
      if(s.skills.music<45)return result(false,"Music skill 45 required.");
      const fans=round(rand(75,300)+s.skills.music*12+s.fame*30);
      s.creativeWorks+=2;change({followers:fans,fame:3,music:2});
      log("You released original music and attracted "+fans+" new fans. Streaming royalties can grow over time.");
      return result(true,"Your music is reaching listeners.");},s.skills.music<45?"Music skill 45 required":"")
  ]));
  if(adult){
    a.push(offer("crime","Risky criminal activity","Activities",[
      opt("Attempt a petty theft","Might earn money, but arrest can ruin professional opportunities.",()=>{
        if(Math.random()<.48){const haul=cost(rand(200,1600));addCash(haul);change({karma:-12,happiness:2});log("You committed petty theft and escaped with "+fmt(haul)+".");return result(true,"You got away this time.");}
        const fine=cost(rand(1000,4000));s.debt+=Math.max(0,fine-s.cash);s.cash=Math.max(0,s.cash-fine);s.criminalRecord=true;change({happiness:-22,karma:-12});
        if(s.job&&["teacher","detective","nurse"].includes(s.job.id)){log("Your criminal conviction cost you your job.");s.job=null;}
        log("You were arrested for theft and fined "+fmt(fine)+". Your record now limits some careers.");
        return result(true,"You were arrested.");})
    ],"Fictional risk/reward mechanic; convictions follow you."));
  }
  if(adult){
    const countries=D.countries.filter(x=>x.id!==s.country);
    a.push(offer("emigrate","Move to another country","Life",countries.map(dest=>{
      const moving=cost(3500)+round(3500*dest.cost);
      return opt(dest.name,"Relocation cost "+fmt(moving)+" · wage and living costs change.",()=>{
        if(!charge(moving))return result(false,"Not enough money for relocation.");
        const prev=country(s.country).name;s.country=dest.id;s.city=pick(dest.cities);
        // Cross-border job contracts are not automatically transferred.
        if(s.job){log("Your job ended when you moved overseas.");s.job=null;s.military.active=false;}
        log("You moved from "+prev+" to "+dest.name+". Local wages, costs and tuition are now different.");
        return result(true,"New home: "+s.city+".");
      });
    }),"Simplified free movement for sandbox gameplay; actual visa laws differ."));
    a.push(offer("house","Buy a home or rental property","Assets",D.properties.flatMap(p=>{
      const actual=price(p.price);
      const cashOpt=opt(p.name+" · Buy cash",fmt(actual)+" · "+fmt(round(actual*p.upkeep))+"/year maintenance.",()=>{
        if(!charge(actual))return result(false,"Not enough cash for this property.");
        s.assets.properties.push({id:"p"+Date.now()+rand(0,999),type:p.id,name:p.name,value:actual,mortgage:0,baseRent:p.rent,upkeep:p.upkeep,rented:false,primary:s.assets.properties.length===0});
        log("You purchased a "+p.name.toLowerCase()+" in "+s.city+" for "+fmt(actual)+".");
        return result(true,"Property purchased.");
      });
      const down=round(actual*.2),balance=actual-down;
      const mortgageOpt=opt(p.name+" · Mortgage",fmt(down)+" down · "+fmt(balance)+" mortgage · yearly repayments.",()=>{
        if(!charge(down))return result(false,"You need "+fmt(down)+" for the down payment.");
        s.assets.properties.push({id:"p"+Date.now()+rand(0,999),type:p.id,name:p.name,value:actual,mortgage:balance,baseRent:p.rent,upkeep:p.upkeep,rented:false,primary:s.assets.properties.length===0});
        log("You bought a "+p.name.toLowerCase()+" with a mortgage. Down payment: "+fmt(down)+".");
        return result(true,"You now own property with a mortgage.");
      });
      return [cashOpt,mortgageOpt];
    }),"You can rent out properties, pay mortgages and sell your assets."));
    a.push(offer("vehicles","Buy a vehicle","Assets",D.vehicles.map(v=>{
      const value=round(v.price*country(s.country).cost);
      return opt(v.name,fmt(value)+" · annual upkeep "+fmt(cost(v.upkeep)),()=>{
        if(!charge(value))return result(false,"You cannot afford the "+v.name+".");
        s.assets.vehicles.push({id:"v"+Date.now()+rand(0,999),name:v.name,value,upkeep:cost(v.upkeep)});
        change({happiness:v.boost});log("You purchased a "+v.name+" for "+fmt(value)+".");
        return result(true,v.name+" added to your assets.");
      });
    })));
  }
  if(s.age>=8)a.push(offer("gear","Buy creative equipment","Assets",D.instruments.map(item=>{
    const actual=cost(item.price);
    return opt(item.name,fmt(actual)+" · training bonus to "+item.skill,()=>{
      if(!charge(actual))return result(false,"Not enough cash to buy "+item.name+".");
      s.assets.items.push({id:item.id,name:item.name,value:actual,skill:item.skill,gain:item.gain});
      log("You bought "+item.name+". This improves future training in "+item.skill+".");
      return result(true,item.name+" purchased.");
    });
  })));
  if(adult&&s.assets.properties.length)a.push(offer("propertyManage","Manage properties","Assets",s.assets.properties.flatMap(p=>[
    opt((p.rented?"End tenancy at":"Rent out")+" "+p.name,"Rental property earns income but has costs and vacancy risk.",()=>{
      p.rented=!p.rented;if(p.rented)p.primary=false;
      log((p.rented?"You began renting out ":"You stopped renting out ")+p.name+".");
      return result(true,"Rental status updated.");}),
    opt("Sell "+p.name,"Estimated equity "+fmt(p.value-p.mortgage)+".",()=>{
      const proceeds=round(p.value*.95-p.mortgage);
      addCash(proceeds);s.assets.properties=s.assets.properties.filter(x=>x.id!==p.id);
      log("You sold "+p.name+" and received "+fmt(proceeds)+" after debt and fees.");
      return result(true,"Property sold.");})
  ])));
  if(adult&&(s.assets.vehicles.length||s.assets.items.length)){
    const all=[...s.assets.vehicles.map(x=>({...x,kind:"vehicles"})),...s.assets.items.map(x=>({...x,kind:"items"}))];
    a.push(offer("sell","Sell vehicles & equipment","Assets",all.map((x,i)=>opt("Sell "+x.name,fmt(round(x.value*.75))+" resale value",()=>{
      const proceeds=round(x.value*.75);addCash(proceeds);
      let list=s.assets[x.kind],index=list.findIndex(y=>y===null?false:y.id===x.id&&y.name===x.name);
      if(index<0)return result(false,"Item not found.");
      list.splice(index,1);
      log("You sold "+x.name+" for "+fmt(proceeds)+".");return result(true,"Sold "+x.name+".");
    }))));
  }
  if(adult&&s.debt>0)a.push(offer("debt","Pay down debt","Assets",[
    opt("Pay "+fmt(Math.min(s.debt,Math.max(0,round(s.cash*.2)))),"Put 20% of your cash toward loans.",()=>{
      const pay=Math.min(s.debt,Math.max(0,round(s.cash*.2)));
      if(pay<=0)return result(false,"No cash available to repay debt.");
      charge(pay);s.debt-=pay;log("You paid "+fmt(pay)+" toward your outstanding debt.");return result(true,"Debt reduced.");}),
    opt("Pay all debt",fmt(s.debt)+" outstanding",()=>{
      if(!charge(s.debt))return result(false,"You need "+fmt(s.debt)+" to clear your debt.");
      s.debt=0;log("You paid off all of your outstanding debt.");return result(true,"Debt cleared.");})
  ]));
  if(s.age>=13)a.push(offer("social","Socialize","Relationships",[
    opt("Make connections","Improve charisma and happiness. Useful for networking and fame.",()=>{change({social:rand(4,8),happiness:rand(4,9)});log("You spent time networking and making friends.");return result(true,"Your social skills improved.");})
  ]));
  if(adult&&s.relationship.status==="Single")a.push(offer("date","Start dating","Relationships",[
    opt("Ask someone out","Social skill helps your chances.",()=>{
      const chance=.3+s.skills.social/170;
      if(Math.random()<chance){s.relationship.status="Dating";s.relationship.partner=pick(first)+" "+pick(last);change({happiness:12});log("You started dating "+s.relationship.partner+".");return result(true,"You found a partner.");}
      change({happiness:-4});log("You asked someone out but they declined.");return result(true,"No spark this time.");})
  ]));
  if(adult&&s.relationship.status==="Dating")a.push(offer("marry","Get married","Relationships",[
    opt("Propose marriage","Your relationship may become a marriage.",()=>{
      if(Math.random()<.7){s.relationship.status="Married";change({happiness:16});log("You married "+s.relationship.partner+".");return result(true,"You're married!");}
      change({happiness:-5});log(s.relationship.partner+" said they were not ready for marriage.");return result(true,"Not this time.");})
  ]));
  if(adult&&s.relationship.status==="Married"&&s.age<50)a.push(offer("child","Start a family","Relationships",[
    opt("Try for a child","Children increase happiness, but also annual living costs.",()=>{
      if(Math.random()<.63){s.children++;change({happiness:14});log("Your family welcomed a new child!");return result(true,"Your family grew.");}
      log("You tried to expand your family, but it didn't happen this year.");return result(true,"Maybe another year.");})
  ]));
  if(adult&&s.job&&s.age>=55)a.push(offer("retire","Retire","Careers",[
    opt("Retire from "+s.job.name,"Stop working and enjoy retirement.",()=>{
      log("You retired from your career as "+s.job.name+".");s.job=null;s.military.active=false;
      change({happiness:9});return result(true,"You retired.");})
  ]));
  return a;
}
function act(id,index=0){
  if(!canAct())return result(false,"Resolve your active event first.");
  const action=actionCatalog().find(a=>a.id===id);
  if(!action)return result(false,"Action unavailable.");
  const option=action.options[index];
  if(!option)return result(false,"Select an available option.");
  if(option.disabled)return result(false,option.disabled);
  return once(id,option.run);
}
function yearly(){
  const c=country(s.country),a=s.age;
  if(a===5)log("You started elementary school in "+c.name+".");
  if(a===13)log("You entered your teenage years.");
  if(a===18){
    s.education.highSchool=true;log("You graduated from secondary school. Your grades were "+s.education.grades+"/100.");
    const gift=s.background==="Royal household"?salary(40000):s.background==="Affluent"?salary(16000):s.background==="Working / middle class"?salary(4000):salary(800);
    addCash(gift);log("Your family helped you get started with "+fmt(gift)+".");
  }
  if(a===65)log("You reached traditional retirement age.");
  let inc=0,expense=0;
  if(s.job){
    s.job.years++;s.experience++;
    inc+=s.job.salary;
    if(s.military.active){
      s.military.years++;
      if(s.military.years%3===0){
        s.military.rank=s.military.years>=9?"Senior enlisted":s.military.years>=6?"Noncommissioned officer":"Junior leader";
        s.job.salary=round(s.job.salary*1.14);
        log("You were promoted in the military to "+s.military.rank+".");
      }
      if(s.military.years>=4)s.military.veteran=true;
      change({fitness:2,technical:1});
    }else if(s.job.years>0&&s.job.years%4===0){
      const bonus=round(s.job.salary*(.025+s.skills.business/1100));
      s.job.salary+=bonus;log("Your experience led to a promotion/raise worth "+fmt(bonus)+" a year.");
    }
  }
  if(s.education.current){
    const study=s.education.current;
    expense+=study.tuition;
    study.yearsLeft--;
    change({study:3,smarts:2});
    log("You completed a year of "+study.subject+" studies. Tuition cost "+fmt(study.tuition)+".");
    if(study.yearsLeft<=0){
      s.education.completed.push({level:study.level,subject:study.subject,age:a});
      log("You graduated with a "+study.level+" qualification in "+study.subject+". Your career options have expanded.");
      const subject=study.subject;
      const skillGains={"Computer Science":{technical:27},"Engineering":{technical:25},"Information Technology":{technical:24},"Electrician":{technical:26},"Automotive Technology":{technical:25},"Plumbing":{technical:25},"Digital Media":{art:22,social:8},"Culinary Arts":{art:24},"Audio Engineering":{music:22,technical:10},"Fine Arts":{art:27},"Music":{music:27},"Performing Arts":{performance:27},"Business":{business:27},"Education":{study:23,social:9},"Nursing":{study:22},"Healthcare":{study:20},"Biology":{study:25},"Criminal Justice":{fitness:16,study:16},"Journalism":{social:23}};
      const gains=skillGains[subject]||{study:15};
      const multiplier=study.level==="master"?.75:study.level==="doctorate"?.9:1;
      Object.entries(gains).forEach(([k,v])=>change({[k]:round(v*multiplier)}));
      change({happiness:11,study:8});s.education.current=null;
    }
  }
  if(a>=18){
    let base=cost(15000+s.children*3500+(s.relationship.status==="Married"?2000:0));
    if(s.assets.properties.some(p=>p.primary))base=round(base*.7);
    expense+=base;
    if(s.relationship.status==="Married")inc+=salary(6500);
    if(s.followers>=1000){
      const payout=round(s.followers*.018*(1+s.fame/100)*c.salary);
      inc+=payout;
      if(payout>50)log("Your online audience earned you "+fmt(payout)+" this year.");
    }
    if(s.creativeWorks){
      const royalties=salary(s.creativeWorks*rand(80,150)*(1+s.fame/40));
      inc+=royalties;
    }
  }
  for(const p of s.assets.properties){
    const upkeep=round(p.value*p.upkeep),prior=p.value;
    const growth=(Math.random()-.40)*.085;p.value=Math.max(round(prior*.66),round(prior*(1+growth)));
    expense+=upkeep;
    if(p.mortgage>0){
      const interest=round(p.mortgage*.055),principal=Math.min(p.mortgage,round(prior*.026));
      expense+=interest+principal;p.mortgage=Math.max(0,p.mortgage-principal);
    }
    if(p.rented && Math.random()<.88)inc+=round(p.value*p.baseRent);
  }
  for(const v of s.assets.vehicles){expense+=v.upkeep;v.value=round(v.value*.87);}
  for(const v of s.assets.items){v.value=round(v.value*.93);}
  for(const v of s.ventures){
    const margin=(s.skills.business-28)/150+(Math.random()-.42)*.55;
    const profit=round(v.worth*margin*c.salary);
    inc+=profit;v.revenue=profit;v.worth=Math.max(1500,round(v.worth*(1+(Math.random()-.42)*.12)));
    if(Math.abs(profit)>=500)log(v.name+(profit>=0?" generated ":" lost ")+fmt(Math.abs(profit))+" this year.");
  }
  if(s.debt>0){const interest=round(s.debt*.048);expense+=interest;log("Interest on loans cost "+fmt(interest)+".");}
  // Expenses are paid with cash where possible. The rest become outstanding debt.
  s.cash+=round(inc);const shortfall=Math.max(0,expense-s.cash);
  s.debt+=shortfall;s.cash=Math.max(0,round(s.cash-expense));
  s.yearly={income:round(inc),expenses:round(expense),net:round(inc-expense)};
  if(a>=18)log("Annual cash flow: "+fmt(inc)+" income, "+fmt(expense)+" expenses. "+(shortfall?fmt(shortfall)+" was added to debt.":""));
  if(s.debt>0&&s.cash>2500){
    const pay=Math.min(s.debt,round(s.cash*.12));s.cash-=pay;s.debt-=pay;
  }
  if(a<18)change({study:rand(0,2),smarts:rand(0,2)});
  if(a>45)change({health:-rand(0,2)});
  if(a>70)change({health:-rand(1,6)});
  if(a>88)change({health:-rand(3,8)});
  change({happiness:rand(-5,4),family:rand(-3,2)});
  if(s.job?.id==="underworld"){
    if(Math.random()<.13){
      const fine=cost(rand(3000,14000));s.debt+=fine;s.criminalRecord=true;
      log("Police arrested you during criminal activity. You were fined "+fmt(fine)+" and now have a criminal record.");
      s.job=null;change({happiness:-25,karma:-15});
    } else change({karma:-4});
  }
  if(s.job && !s.military.active&&Math.random()<.035){
    log("You were laid off from your job as "+s.job.name+".");s.job=null;change({happiness:-12});
  }
  if(s.relationship.status!=="Single"&&Math.random()<.016){
    log("Your relationship ended after a difficult year.");s.relationship={status:"Single",partner:""};change({happiness:-14});
  }
  for(const effect of s.effects.filter(e=>e.age===a)){
    if(effect.type==="cash")addCash(effect.amount);
    if(effect.type==="health")change({health:effect.amount});
    if(effect.type==="fame")change({fame:effect.amount});
    log(effect.message);
  }
  s.effects=s.effects.filter(e=>e.age>a);
  if(s.fame>=60&&a%3===0)log("You are now widely recognized. Fame has changed your opportunities.");
}
const events=[
 {id:"scholarship",weight:6,min:16,max:23,when:()=>s.education.grades>=74,title:"An academic opportunity",
  body:"A scholarship committee noticed your grades and offers mentorship.",
  options:[
    {text:"Accept the mentorship",desc:"Improves grades and study skill in future years.",do:()=>{change({study:10,smarts:4});s.education.grades=cap(s.education.grades+10);log("You accepted mentorship and strengthened your scholarship profile.");}},
    {text:"Focus on other priorities",desc:"More happiness now.",do:()=>{change({happiness:5});log("You chose your own direction.");}}
  ]},
 {id:"friendbusiness",weight:5,min:18,max:60,when:()=>s.cash>=1200,title:"A friend's business proposal",
  body:"A friend proposes an investment in a new company. It could pay off several years from now.",
  options:[
    {text:"Invest in the startup",desc:"Costs about 1,000 game dollars, adjusted for your country; payout uncertain.",do:()=>{const amount=cost(1000);if(!charge(amount))return false;const win=Math.random()<.56;const payout=win?round(amount*(1.4+Math.random()*2.1)):0;s.effects.push({age:s.age+3,type:"cash",amount:payout,message:win?"Your earlier startup investment paid out "+fmt(payout)+".":"Your earlier startup investment failed, and you lost your stake."});log("You invested "+fmt(amount)+" in a friend's startup.");}},
    {text:"Keep your savings",desc:"No financial risk.",do:()=>log("You declined the investment and kept your savings.")}
  ]},
 {id:"training",weight:5,min:11,max:30,when:()=>true,title:"A talented mentor",
  body:"An experienced instructor offers to help develop one of your skills.",
  options:[
    {text:"Learn music",desc:"Grow your music skill.",do:()=>{change({music:12});log("A mentor coached your music skills.");}},
    {text:"Learn technology",desc:"Grow technical skills for work.",do:()=>{change({technical:12});log("A mentor coached your technical skills.");}},
    {text:"Learn business",desc:"Prepare for entrepreneurship.",do:()=>{change({business:12});log("A mentor coached your business skills.");}}
  ]},
 {id:"health",weight:6,min:0,max:110,when:()=>true,title:"A health setback",
  body:"You haven't been feeling well lately. How will you respond?",
  options:[
    {text:"Seek treatment",desc:"Costs money but improves your long-term health.",do:()=>{const bill=cost(250);if(s.cash>=bill)charge(bill);else s.debt+=bill;change({health:6,happiness:-2});log("You sought treatment and recovered.");}},
    {text:"Ignore it",desc:"May have a lasting cost.",do:()=>{change({health:-8,happiness:-4});s.effects.push({age:s.age+2,type:"health",amount:-5,message:"Your untreated earlier illness had lasting health effects."});log("You ignored your symptoms.");}}
  ]},
 {id:"competition",weight:4,min:13,max:40,when:()=>s.skills.athletics>=35,title:"Regional sports competition",
  body:"You have an opportunity to compete at a high level.",
  options:[
    {text:"Enter the competition",desc:"Potential fame and athletic development.",do:()=>{const win=Math.random()<(s.skills.athletics/130);change({athletics:5,fame:win?12:2,happiness:win?12:-2});log(win?"You won the sports competition and gained recognition!":"You competed and gained valuable experience.");}},
    {text:"Train instead",desc:"Build your abilities quietly.",do:()=>{change({athletics:7});log("You skipped the competition to focus on training.");}}
  ]},
 {id:"viral",weight:4,min:14,max:85,when:()=>s.followers>=300,title:"Your content goes viral",
  body:"A new post is getting attention beyond your usual audience.",
  options:[
    {text:"Capitalize on the moment",desc:"Gain followers but risk stress.",do:()=>{const gain=rand(800,6000);change({followers:gain,fame:8,happiness:-3});log("Your viral post gained "+gain.toLocaleString()+" followers.");}},
    {text:"Keep a low profile",desc:"Stay happy, grow more slowly.",do:()=>{change({followers:100,happiness:5});log("You chose peace over internet attention.");}}
  ]},
 {id:"accident",weight:3,min:17,max:85,when:()=>s.assets.vehicles.length>0,title:"A road accident",
  body:"A minor car accident leaves you shaken. Your vehicle needs repairs.",
  options:[
    {text:"Repair the damage",desc:"Pay for repairs and protect your vehicle's value.",do:()=>{const bill=cost(900);if(s.cash>=bill)charge(bill);else s.debt+=bill;change({health:-2});log("You repaired the vehicle after an accident.");}},
    {text:"Delay repairs",desc:"Your car loses more value.",do:()=>{s.assets.vehicles[0].value=round(s.assets.vehicles[0].value*.75);change({health:-3});log("You postponed repairs and your vehicle's value fell.");}}
  ]},
 {id:"joboffer",weight:4,min:23,max:65,when:()=>s.job&&!s.military.active,title:"A competing job offer",
  body:"Another employer is interested in hiring you at a higher salary.",
  options:[
    {text:"Negotiate a better salary",desc:"A riskier choice with a possible larger reward.",do:()=>{if(Math.random()<.65){const pay=round(s.job.salary*.15);s.job.salary+=pay;log("You negotiated a "+fmt(pay)+" annual salary increase.");}else{change({happiness:-4});log("Salary negotiations failed.");}}},
    {text:"Stay loyal",desc:"Increase stability and happiness.",do:()=>{change({happiness:5,karma:3});log("You chose stability with your current employer.");}}
  ]},
 {id:"familyhelp",weight:5,min:18,max:75,when:()=>s.family>=65,title:"Help from your family",
  body:"Your family offers to help you with an important decision.",
  options:[
    {text:"Accept their advice",desc:"Develop business and academic skills.",do:()=>{change({business:7,study:3,family:5});log("Family advice helped you grow.");}},
    {text:"Ask for a small loan",desc:"Receive cash now, but owe money later.",do:()=>{const aid=salary(1200);addCash(aid);s.effects.push({age:s.age+2,type:"cash",amount:-aid,message:"You repaid the "+fmt(aid)+" family loan."});change({family:-5});log("Your family lent you "+fmt(aid)+".");}}
  ]},
 {id:"heritage",weight:2,min:18,max:85,when:()=>s.royal,title:"Royal household obligations",
  body:"The royal household requests that you attend an official public event.",
  options:[
    {text:"Attend the engagement",desc:"Gain status and an audience.",do:()=>{change({fame:8,followers:rand(500,2500),social:4});log("You appeared at a royal engagement.");}},
    {text:"Avoid public life",desc:"Lower fame, more personal freedom.",do:()=>{change({fame:-4,happiness:7});log("You stepped away from royal duties.");}}
  ]},
 {id:"street",weight:7,min:6,max:85,when:()=>true,title:"You discover a lost wallet",
  body:"A wallet full of money lies on the sidewalk.",
  options:[
    {text:"Return it to the owner",desc:"Increase karma and family reputation.",do:()=>{change({karma:10,happiness:4});log("You returned the wallet and were thanked.");}},
    {text:"Keep the cash",desc:"Immediate money with moral consequences.",do:()=>{addCash(cost(140));change({karma:-10});log("You kept the cash. The decision weighs on you.");}}
  ]}
];
function eventPick(){
  if(Math.random()>.78)return null;
  const eligible=events.filter(e=>s.age>=e.min&&s.age<=e.max&&e.when());
  if(!eligible.length)return null;
  const sum=eligible.reduce((a,b)=>a+b.weight,0);let x=Math.random()*sum;
  for(const e of eligible){x-=e.weight;if(x<=0)return e;}
  return eligible[0];
}
function ageUp(){
  if(!s||!s.alive)return result(false,"This life has ended.");
  if(s.pending)return result(false,"You need to resolve the current decision.");
  s.age++;s.used=[];yearly();
  const mortality=s.age>=55?Math.pow((s.age-50)/75,3)*.20+(100-s.stats.health)*.00045:0;
  if(s.age>=110||s.stats.health<=0||Math.random()<mortality){
    s.alive=false;log("You passed away at age "+s.age+". Your choices shaped a unique life.");changed();return result(true,"Life completed.");
  }
  const event=eventPick();
  if(event)s.pending=event.id;
  changed();return result(true,event?"An important life decision awaits.":"A year has passed.");
}
function pendingEvent(){return events.find(e=>s?.pending===e.id)||null;}
function decide(index){
  const e=pendingEvent();if(!e||!e.options[index])return result(false,"No such decision.");
  const choice=e.options[index],ok=choice.do();
  if(ok===false)return result(false,"Not enough money for this decision.");
  s.pending=null;changed();return result(true,"Decision recorded.");
}
window.LifeSim={get:current,newLife,load,reset,importSave,validate,act,ageUp,decide,pendingEvent,actions:actionCatalog,onChange(fn){listener=fn;},format:fmt,netWorth,country,talent,careerPay,qualified,save:persist,KEY};
})();
