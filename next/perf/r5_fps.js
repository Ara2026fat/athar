const {chromium}=require('playwright');
const FPS=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<5000)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({fps:d.length/(d.reduce((a,b)=>a+b,0)/1000),p95:s[Math.floor(d.length*.95)],max:s[s.length-1]})}}requestAnimationFrame(f)})`;
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
(async()=>{const b=await chromium.launch();
for(const sc of ['idle','cloud-drag','walk']){for(const cpu of [4,6]){const R=[],P=[],M=[];
 for(let i=0;i<3;i++){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await p.goto('http://localhost:8099/home-next.html?t=day&first=0');await p.waitForTimeout(3000);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});await p.waitForTimeout(400);
  let pr=p.evaluate(FPS);
  if(sc==='cloud-drag'){const cu=await p.$('.w-cu[data-i="1"]');const bb=await cu.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();for(let k=0;k<40;k++){await p.mouse.move(bb.x+bb.width/2+Math.sin(k/4)*120,bb.y+bb.height/2,{steps:1});await p.waitForTimeout(100)}await p.mouse.up()}
  if(sc==='walk'){for(let k=0;k<4;k++){await p.evaluate(()=>{document.getElementById('wb-'+['quiz','hifz','lib','noor'][Math.floor(Math.random()*4)]).click()});await p.waitForTimeout(1150);await p.evaluate(()=>{const b=document.querySelector('.view.active .back-btn[data-go="home"]');b&&b.click()});await p.waitForTimeout(150)}}
  const x=await pr;R.push(x.fps);P.push(x.p95);M.push(x.max);await c.close();}
 console.log(sc.padEnd(11),'cpu'+cpu,'fps runs',R.map(x=>x.toFixed(1)).join('/'),'median',med(R).toFixed(1),'p95ms',med(P).toFixed(0),'worst',Math.max(...M).toFixed(0));}}
await b.close()})();
