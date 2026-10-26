const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const V={base:'',noArt:'.wb .art{animation:none!important;will-change:auto!important}',noJp:'.wb .sw{animation:wsway 3.6s ease-in-out infinite alternate!important}',noWin:'#wb-hifz .win{animation:none!important}',noDot:'.ath-dot{animation:none!important}',noWillChange:'.wb .art{will-change:auto!important}',noBk:'.wb .bk,.wb .spk{animation-duration:10s!important}'};
for(const k in V){const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(2500);if(V[k])await p.evaluate(t=>{const s=document.createElement('style');s.textContent=t;document.head.appendChild(s)},V[k]);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.waitForTimeout(800);
const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
const a=await m();await p.waitForTimeout(4000);const z=await m();console.log(k.padEnd(14),'task%',((z.TaskDuration-a.TaskDuration)/4*100).toFixed(1),'layout%',((z.LayoutDuration-a.LayoutDuration)/4*100).toFixed(1),'style%',((z.RecalcStyleDuration-a.RecalcStyleDuration)/4*100).toFixed(1));await c.close()}
await b.close()})();
