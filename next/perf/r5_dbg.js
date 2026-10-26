const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3000);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
async function meas(label){await p.waitForTimeout(500);const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
 const a=await m();await p.waitForTimeout(4000);const z=await m();console.log(label.padEnd(28),'task%',((z.TaskDuration-a.TaskDuration)/4*100).toFixed(1),'layout%',((z.LayoutDuration-a.LayoutDuration)/4*100).toFixed(1),'style%',((z.RecalcStyleDuration-a.RecalcStyleDuration)/4*100).toFixed(1))}
const names=await p.evaluate(()=>{const o={};document.getAnimations().forEach(a=>{const n=a.animationName||a.transitionProperty||'?';o[n]=(o[n]||0)+1});return o});console.log(JSON.stringify(names));
await meas('baseline');
await p.evaluate(()=>{const s=document.createElement('style');s.id='x1';s.textContent='.sk-dots *,.sk-d{animation:none!important}';document.head.appendChild(s)});await meas('no sky dots anim');
await p.evaluate(()=>{const s=document.createElement('style');s.textContent='#wSky *,#wLanterns *{animation:none!important}';document.head.appendChild(s)});await meas('no A2 anims');
await p.evaluate(()=>{const s=document.createElement('style');s.textContent='#homeWorld *{animation:none!important}';document.head.appendChild(s)});await meas('no anims at all');
await p.evaluate(()=>{const s=document.createElement('style');s.textContent='#homeWorld .w-cl{display:none}';document.head.appendChild(s)});await meas('no clouds');
await b.close()})();
