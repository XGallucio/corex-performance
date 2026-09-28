'use strict';
const assert=require('node:assert/strict');
const {estimateScenario:estimate}=require('./simulator.js');
let count=0;
for(const fps of [15,60,144,360,1000]) for(const low of ['',1,Math.round(fps*.65),fps]) for(const load of [20,74,75,89,90,96,97,100]) for(const ram of ['8','16','32']) for(const system of ['clean','normal','busy']) for(const game of ['competitive','cs2','fortnite','aaa']){
 const input={fps,low,load,ram,system,game},r=estimate(input);
 assert.equal(r.fpsMin,fps);assert(r.fpsMax>=fps);assert(r.fpsMax<=Math.ceil(fps/0.9));assert.equal(r.gainMin,0);assert(Number.isFinite(r.frameMin));assert(r.frameMin<=r.frameMax);
 if(low==='')assert.equal(r.lowMax,null);else{assert(r.lowMax>=low);assert(r.lowMax<=r.fpsMax)}
 assert.deepEqual(r,estimate(input));count++;
}
const base={fps:144,low:92,load:80,ram:'16',system:'normal',game:'cs2'};
assert(estimate({...base,load:99}).fpsMax<=estimate(base).fpsMax);
assert(estimate({...base,system:'clean'}).fpsMax<=estimate({...base,system:'busy'}).fpsMax);
for(const patch of [{fps:0},{fps:Infinity},{fps:1001},{low:145},{low:-2},{load:101},{system:'x'},{game:'x'},{ram:'x'}])assert.throws(()=>estimate({...base,...patch}));
console.log(count+' valid scenarios and 9 invalid-input checks passed.');
