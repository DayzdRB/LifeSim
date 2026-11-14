"use strict";
/**
 * LifeSim world data v0.2.
 * Income groups follow World Bank FY2027 classifications (based on 2025 GNI per capita).
 * The salaryMultiplier, costMultiplier, housingMultiplier and tuition figures below
 * are ORIGINAL GAME BALANCING ESTIMATES in USD-equivalent game dollars, NOT observed
 * wages, poverty odds, real estate prices, tuition prices or forecasts.
 * Sources:
 * https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups
 * https://data.worldbank.org/indicator/NY.GDP.PCAP.CD
 */
window.LifeData = {
  countries: [
    {id:"US",name:"United States",cities:["Chicago","Atlanta","Dallas","Seattle"],tier:"High income",salary:1,cost:1,housing:1,tuition:11000,royal:false,military:true},
    {id:"CA",name:"Canada",cities:["Toronto","Montreal","Vancouver"],tier:"High income",salary:.80,cost:.88,housing:1.12,tuition:6000,royal:true,military:true},
    {id:"GB",name:"United Kingdom",cities:["London","Manchester","Edinburgh"],tier:"High income",salary:.78,cost:.88,housing:1.05,tuition:8500,royal:true,military:true},
    {id:"FR",name:"France",cities:["Paris","Lyon","Toulouse"],tier:"High income",salary:.71,cost:.76,housing:.83,tuition:2400,royal:false,military:true},
    {id:"DE",name:"Germany",cities:["Berlin","Hamburg","Munich"],tier:"High income",salary:.82,cost:.79,housing:.89,tuition:1700,royal:false,military:true},
    {id:"IT",name:"Italy",cities:["Milan","Rome","Turin"],tier:"High income",salary:.64,cost:.70,housing:.70,tuition:3200,royal:false,military:true},
    {id:"AU",name:"Australia",cities:["Melbourne","Sydney","Brisbane"],tier:"High income",salary:.87,cost:.91,housing:1.08,tuition:7500,royal:true,military:true},
    {id:"JP",name:"Japan",cities:["Tokyo","Osaka","Kyoto"],tier:"High income",salary:.72,cost:.78,housing:.87,tuition:7000,royal:true,military:true},
    {id:"BR",name:"Brazil",cities:["São Paulo","Rio de Janeiro","Curitiba"],tier:"Upper middle income",salary:.29,cost:.40,housing:.38,tuition:3000,royal:false,military:true},
    {id:"MX",name:"Mexico",cities:["Mexico City","Guadalajara","Monterrey"],tier:"Upper middle income",salary:.30,cost:.39,housing:.37,tuition:3000,royal:false,military:true},
    {id:"PH",name:"Philippines",cities:["Manila","Cebu","Davao"],tier:"Upper middle income",salary:.20,cost:.30,housing:.27,tuition:2200,royal:false,military:true},
    {id:"ZA",name:"South Africa",cities:["Cape Town","Johannesburg","Durban"],tier:"Upper middle income",salary:.31,cost:.43,housing:.32,tuition:3100,royal:false,military:true},
    {id:"IN",name:"India",cities:["Mumbai","Delhi","Bengaluru"],tier:"Lower middle income",salary:.16,cost:.28,housing:.26,tuition:2000,royal:false,military:true},
    {id:"NG",name:"Nigeria",cities:["Lagos","Abuja","Ibadan"],tier:"Lower middle income",salary:.12,cost:.25,housing:.23,tuition:1700,royal:false,military:true},
    {id:"KE",name:"Kenya",cities:["Nairobi","Mombasa","Kisumu"],tier:"Lower middle income",salary:.12,cost:.25,housing:.24,tuition:1600,royal:false,military:true},
    {id:"ET",name:"Ethiopia",cities:["Addis Ababa","Dire Dawa","Bahir Dar"],tier:"Low income",salary:.08,cost:.20,housing:.20,tuition:1200,royal:false,military:true}
  ],
  talents:[
    {id:"music",name:"Musical prodigy",emoji:"🎵",skill:"music"},
    {id:"athletic",name:"Natural athlete",emoji:"🏅",skill:"athletics"},
    {id:"creative",name:"Creative genius",emoji:"🎨",skill:"art"},
    {id:"business",name:"Business instinct",emoji:"📈",skill:"business"},
    {id:"performer",name:"Born performer",emoji:"🎭",skill:"performance"},
    {id:"intellect",name:"Academic brilliance",emoji:"🧠",skill:"study"},
    {id:"none",name:"Well-rounded",emoji:"⭐",skill:null}
  ],
  degrees:{
    trade:["Electrician","Automotive Technology","Plumbing","Culinary Arts","Audio Engineering"],
    associate:["Information Technology","Business","Healthcare","Digital Media"],
    bachelor:["Computer Science","Engineering","Business","Education","Nursing","Fine Arts","Music","Journalism","Biology","Criminal Justice","Performing Arts"],
    master:["Computer Science","Engineering","Business","Education","Nursing","Fine Arts","Music","Journalism","Biology","Criminal Justice"],
    doctorate:["Computer Science","Engineering","Business","Education","Biology"]
  },
  // base annual USD-equivalent wages at US multiplier, before skills and experience;
  // education: [credential level, accepted subjects], skill gate and additional requirements.
  jobs:[
    {id:"retail",name:"Retail associate",base:29000,level:"none",skill:"social",min:0,category:"Everyday"},
    {id:"cashier",name:"Cashier",base:26500,level:"none",skill:"social",min:0,category:"Everyday"},
    {id:"server",name:"Restaurant server",base:32000,level:"none",skill:"social",min:10,category:"Everyday"},
    {id:"courier",name:"Delivery driver",base:36500,level:"none",skill:"fitness",min:5,category:"Everyday"},
    {id:"warehouse",name:"Warehouse technician",base:39000,level:"none",skill:"technical",min:0,category:"Everyday"},
    {id:"admin",name:"Administrative assistant",base:42000,level:"none",skill:"social",min:15,category:"Everyday"},
    {id:"electrician",name:"Electrician",base:68000,level:"trade",subjects:["Electrician"],skill:"technical",min:25,category:"Trades"},
    {id:"mechanic",name:"Automotive technician",base:57000,level:"trade",subjects:["Automotive Technology"],skill:"technical",min:22,category:"Trades"},
    {id:"plumber",name:"Plumber",base:62500,level:"trade",subjects:["Plumbing"],skill:"technical",min:22,category:"Trades"},
    {id:"chef",name:"Chef",base:57000,level:"trade",subjects:["Culinary Arts"],skill:"art",min:25,category:"Trades"},
    {id:"sound",name:"Audio technician",base:61000,level:"trade",subjects:["Audio Engineering"],skill:"music",min:20,category:"Trades"},
    {id:"helpdesk",name:"IT support specialist",base:55000,level:"associate",subjects:["Information Technology","Computer Science"],skill:"technical",min:25,category:"Professional"},
    {id:"paramedic",name:"Healthcare technician",base:52000,level:"associate",subjects:["Healthcare","Nursing"],skill:"study",min:25,category:"Professional"},
    {id:"office",name:"Office manager",base:57000,level:"associate",subjects:["Business"],skill:"business",min:30,category:"Professional"},
    {id:"designer",name:"Graphic designer",base:61000,level:"associate",subjects:["Digital Media","Fine Arts"],skill:"art",min:35,category:"Creative"},
    {id:"developer",name:"Software developer",base:100000,level:"bachelor",subjects:["Computer Science"],skill:"technical",min:40,category:"Professional"},
    {id:"engineer",name:"Mechanical engineer",base:90000,level:"bachelor",subjects:["Engineering"],skill:"technical",min:40,category:"Professional"},
    {id:"teacher",name:"Teacher",base:57000,level:"bachelor",subjects:["Education"],skill:"study",min:35,category:"Professional"},
    {id:"nurse",name:"Registered nurse",base:80000,level:"bachelor",subjects:["Nursing"],skill:"study",min:40,category:"Professional"},
    {id:"journalist",name:"Journalist",base:62000,level:"bachelor",subjects:["Journalism"],skill:"social",min:35,category:"Creative"},
    {id:"biologist",name:"Biologist",base:72000,level:"bachelor",subjects:["Biology"],skill:"study",min:40,category:"Professional"},
    {id:"accountant",name:"Business analyst",base:74000,level:"bachelor",subjects:["Business"],skill:"business",min:40,category:"Professional"},
    {id:"detective",name:"Criminal investigator",base:78000,level:"bachelor",subjects:["Criminal Justice"],skill:"fitness",min:35,category:"Professional"},
    {id:"professor",name:"University professor",base:105000,level:"doctorate",subjects:["Computer Science","Engineering","Education","Biology"],skill:"study",min:60,category:"Professional"},
    {id:"research",name:"Senior research scientist",base:116000,level:"master",subjects:["Biology","Computer Science","Engineering"],skill:"study",min:58,category:"Professional"},
    {id:"director",name:"Technology director",base:145000,level:"master",subjects:["Business","Computer Science","Engineering"],skill:"business",min:60,category:"Executive"},
    {id:"ceo",name:"Chief executive officer",base:225000,level:"bachelor",subjects:["Business","Computer Science","Engineering"],skill:"business",min:72,years:8,category:"Executive"},
    {id:"actor",name:"Actor",base:35000,level:"none",skill:"performance",min:45,category:"Fame"},
    {id:"dj",name:"DJ",base:30000,level:"none",skill:"music",min:40,category:"Fame"},
    {id:"musician",name:"Musician",base:32000,level:"none",skill:"music",min:45,category:"Fame"},
    {id:"artist",name:"Professional artist",base:28000,level:"none",skill:"art",min:42,category:"Fame"},
    {id:"athlete",name:"Professional athlete",base:55000,level:"none",skill:"athletics",min:75,maxAge:36,category:"Fame"},
    {id:"creator",name:"YouTuber / content creator",base:12000,level:"none",skill:"social",min:40,category:"Fame",followers:5000},
    {id:"underworld",name:"Career criminal",base:44000,level:"none",skill:"social",min:25,category:"Underground"},
    {id:"royal",name:"Royal household representative",base:65000,level:"none",skill:"social",min:20,category:"Special",royalOnly:true}
  ],
  vehicles:[
    {id:"used",name:"Used hatchback",price:8500,upkeep:850,boost:2},
    {id:"sedan",name:"New sedan",price:26000,upkeep:1400,boost:4},
    {id:"luxury",name:"Luxury car",price:88000,upkeep:3900,boost:7},
    {id:"sports",name:"Sports car",price:190000,upkeep:7700,boost:11}
  ],
  properties:[
    {id:"condo",name:"Small condominium",price:145000,upkeep:.013,rent:.065},
    {id:"house",name:"Suburban house",price:290000,upkeep:.017,rent:.075},
    {id:"townhome",name:"Townhouse",price:430000,upkeep:.018,rent:.08},
    {id:"estate",name:"Luxury estate",price:1100000,upkeep:.025,rent:.065}
  ],
  instruments:[
    {id:"guitar",name:"Acoustic guitar",price:260,skill:"music",gain:5},
    {id:"piano",name:"Digital piano",price:950,skill:"music",gain:7},
    {id:"djkit",name:"DJ controller",price:1200,skill:"music",gain:8},
    {id:"studio",name:"Home recording studio",price:7000,skill:"music",gain:12},
    {id:"canvas",name:"Professional art kit",price:300,skill:"art",gain:6},
    {id:"camera",name:"Video production camera",price:1250,skill:"social",gain:7}
  ]
};