const {chromium}=require('playwright');const {m}=require('./perf.js');
const FPS=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<5000)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({fps:+(d.length/(d.reduce((a,b)=>a+b,0)/1000)).toFixed(1),p95:+s[Math.floor(d.length*.95)].toFixed(1),over50:d.filter(x=>x>50).length})}}requestAnimationFrame(f)})`;
const V={
 base:()=>{},
 'willchange svg anims':()=>{const s=document.createElement('style');s.textContent='.tuft,.cloud,.vxc,#boyF,#abody,#eyes,.palm,.tree-sway,.vxLan,.star{will-change:transform,opacity}';document.head.appendChild(s)},
 'wc + filter off':()=>{const s=document.createElement('style');s.textContent='.tuft,.cloud,.vxc,#boyF,#abody,#eyes,.palm,.tree-sway,.vxLan,.star{will-change:transform,opacity}#boyImg,#boyImg2{filter:none!important}';document.head.appendChild(s)},
 'stars 45->0':()=>{document.querySelectorAll('.star').forEach(e=>e.style.animation='none')},
 'tufts paused except 4':()=>{document.querySelectorAll('.tuft').forEach((e,i)=>{if(i%4)e.style.animation='none'})},
 'stars+tufts static':()=>{document.querySelectorAll('.star,.tuft').forEach(e=>e.style.animation='none')},
};
(async()=>{
 const b=await chromium.launch();const only=process.argv[2];
 for(const [k,fn] of Object.entries(V)){
  if(only&&!only.split(',').includes(k))continue;
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
  await p.goto('http://localhost:8099/valley/next.html',{waitUntil:'load'});await p.waitForTimeout(2000);await p.click('#enter');await p.waitForTimeout(2500);
  for(let i=0;i<3;i++){await p.click('.ibtn').catch(()=>{});await p.waitForTimeout(1500)}
  await p.waitForTimeout(2500);
  if(k==='base')await p.screenshot({path:'/tmp/next/shots/r4_valley_map.png'});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.evaluate(fn);await p.waitForTimeout(800);
  const m0=await m(cdp);const r=await p.evaluate(FPS);const m1=await m(cdp);
  const m2=await m(cdp);
  console.log(k.padEnd(24),JSON.stringify(r),'task%',((m1.TaskDuration-m0.TaskDuration)/5*100).toFixed(0),'nodes',m2.Nodes,'heap',(m2.JSHeapUsedSize/1048576).toFixed(1));
  await c.close();
 }
 await b.close()})();
