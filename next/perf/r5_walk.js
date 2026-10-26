const {chromium}=require('playwright');
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
(async()=>{const b=await chromium.launch();const R=[],W=[];
for(let i=0;i<5;i++){const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
const p=await c.newPage();const cdp=await c.newCDPSession(p);await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3000);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.waitForTimeout(400);
const r=await p.evaluate(()=>new Promise(res=>{const d=[];let last=0;function f(t){if(last)d.push(t-last);last=t;if(d.length<50&&!(window.__stop))requestAnimationFrame(f);else res(d)}
 requestAnimationFrame(f);document.getElementById('wb-quiz').click();
 // stop sampling just before navigation (door click at ~.95s)
 setTimeout(()=>{window.__stop=1},780)}));
const tot=r.reduce((a,b)=>a+b,0);R.push(r.length/(tot/1000));W.push(Math.max(...r));await c.close()}
console.log('walk window (~0.8s) cpu4 fps',R.map(x=>x.toFixed(1)).join('/'),'median',med(R).toFixed(1),'worst frame ms',Math.max(...W).toFixed(0));await b.close()})();
