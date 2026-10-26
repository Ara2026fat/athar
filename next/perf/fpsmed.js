const {chromium}=require('playwright');const fs=require('fs');
const src=fs.readFileSync('fixcmp.js','utf8');const FIX=eval(src.match(/const FIX=(`[\s\S]*?`);/)[1]);
const FPS=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<5000)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({fps:d.length/(d.reduce((a,b)=>a+b,0)/1000),p95:s[Math.floor(d.length*.95)]})}}requestAnimationFrame(f)})`;
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
const SC={
 'home idle (current)':async p=>{await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3500)},
 'home idle (+SMIL/chalk fix)':async p=>{await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3000);await p.evaluate(FIX);await p.waitForTimeout(800)},
 'valley gate':async p=>{await p.goto('http://localhost:8099/valley/next.html');await p.waitForTimeout(3500)},
 'valley map (after intro)':async p=>{await p.goto('http://localhost:8099/valley/next.html');await p.waitForTimeout(2000);await p.click('#enter');await p.waitForTimeout(2000);for(let i=0;i<3;i++){await p.click('.ibtn').catch(()=>{});await p.waitForTimeout(1200)}await p.waitForTimeout(2500)},
};
(async()=>{
 const b=await chromium.launch();const out={};
 for(const [k,fn] of Object.entries(SC))for(const cpu of [1,4,6]){
  const r=[];const pp=[];
  for(let i=0;i<3;i++){
   const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
   const p=await c.newPage();const cdp=await c.newCDPSession(p);
   await fn(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});await p.waitForTimeout(500);
   const x=await p.evaluate(FPS);r.push(x.fps);pp.push(x.p95);await c.close();
  }
  console.log(k.padEnd(30),'cpu'+cpu,'fps runs',r.map(x=>x.toFixed(1)).join('/'),'median',med(r).toFixed(1),'p95ms median',med(pp).toFixed(0));
 }
 await b.close()})();
