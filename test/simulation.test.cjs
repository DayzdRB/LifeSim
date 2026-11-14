"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function makeGame() {
  const files = ["world.js", "engine.js"].map(name =>
    fs.readFileSync(path.join(__dirname, "..", name), "utf8")
  );
  const saves = new Map();
  const math = Object.create(Math);
  math.random = () => 0.42; // Deterministic smoke tests
  const context = {
    window: {},
    localStorage: {
      getItem: key => saves.get(key) ?? null,
      setItem: (key, value) => saves.set(key, value),
      removeItem: key => saves.delete(key)
    },
    Math: math
  };
  vm.runInNewContext(files.join("\n"), context, {filename:"LifeSim"});
  return {game:context.window.LifeSim,saves};
}

function progress(game, targetAge) {
  while (game.get().age < targetAge && game.get().alive) {
    if (game.pendingEvent()) assert.equal(game.decide(0).ok, true);
    assert.equal(game.ageUp().ok, true);
  }
  if(game.pendingEvent()) assert.equal(game.decide(0).ok, true);
}

test("character creation respects birth country, talent and royal family selection", () => {
  const {game} = makeGame();
  game.newLife({country:"GB",talent:"music",background:"Royal household",name:"Test Royal"});
  const s=game.get();
  assert.equal(s.country,"GB");
  assert.equal(s.birthCountry,"GB");
  assert.equal(s.talent,"music");
  assert.equal(s.royal,true);
  assert.equal(s.background,"Royal household");
});

test("a computer science bachelor's degree unlocks software jobs after four years", () => {
  const {game} = makeGame();
  game.newLife({country:"US",talent:"intellect"});
  progress(game,18);
  const education = game.actions().find(x=>x.id==="enroll");
  const choice=education.options.findIndex(x=>x.label.includes("Bachelor's degree · Computer Science"));
  assert.notEqual(choice,-1);
  assert.equal(game.act("enroll",choice).ok,true);
  progress(game,22);
  assert.equal(game.get().education.completed.some(x=>x.subject==="Computer Science"&&x.level==="bachelor"),true);
  const jobs=game.actions().find(x=>x.id==="jobs");
  const developer=jobs.options.find(x=>x.label==="Software developer");
  assert.equal(developer.disabled,"");
});

test("trade school unlocks a corresponding trade occupation", () => {
  const {game}=makeGame();
  game.newLife({country:"BR"});
  progress(game,18);
  const course=game.actions().find(x=>x.id==="enroll");
  assert.equal(game.act("enroll",course.options.findIndex(x=>x.label.includes("Trade school · Electrician"))).ok,true);
  progress(game,20);
  const job=game.actions().find(x=>x.id==="jobs").options.find(x=>x.label==="Electrician");
  assert.equal(job.disabled,"");
});

test("military service develops into veteran education eligibility", () => {
  const {game}=makeGame();
  game.newLife({country:"DE"});
  progress(game,18);
  const joined=game.act("enlist",0);
  assert.equal(joined.ok,true);
  progress(game,22);
  assert.equal(game.get().military.years,4);
  assert.equal(game.get().military.veteran,true);
});

test("housing, cars and equipment are owned assets", () => {
  const {game}=makeGame();
  game.newLife({country:"US"});
  progress(game,18);
  game.get().cash=500000;
  assert.equal(game.act("house",0).ok,true);
  assert.equal(game.act("vehicles",0).ok,true);
  assert.equal(game.act("gear",0).ok,true);
  assert.equal(game.get().assets.properties.length,1);
  assert.equal(game.get().assets.vehicles.length,1);
  assert.equal(game.get().assets.items.length,1);
  assert.ok(game.netWorth()>0);
});

test("country selection changes wage scaling, but does not gate education", () => {
  const {game}=makeGame();
  game.newLife({country:"ET"});
  progress(game,18);
  assert.equal(game.get().birthCountry,"ET");
  assert.equal(game.country("ET").tier,"Low income");
  assert.ok(game.country("ET").salary<game.country("US").salary);
  assert.ok(game.actions().some(x=>x.id==="enroll"));
});

test("saving, restoring, and upgrading legacy saves work", () => {
  const {game,saves}=makeGame();
  game.newLife({name:"Test Save",country:"CA"});
  assert.equal(game.validate(JSON.parse(saves.get("lifesim-v2"))),true);
  const oldState={version:1,name:"Old Save",country:"France",city:"Lyon",age:25,alive:true,cash:4200,
    stats:{health:75,happiness:70,smarts:80,looks:50,karma:60},education:1,
    family:62,children:0,history:[{age:0,text:"Born in Lyon."}]};
  saves.delete("lifesim-v2");
  saves.set("lifesim-v1",JSON.stringify(oldState));
  assert.equal(game.load(),true);
  assert.equal(game.get().version,2);
  assert.equal(game.get().name,"Old Save");
  assert.equal(game.get().cash,4200);
});
