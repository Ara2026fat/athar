const {chromium}=require('playwright');
const FPS=`new Promise(res=>{const d=[];let last=0,t0=performance.now();function f(t){if(last)d.push(t-last);last=t;if(performance.now()-t0<5000)requestAnimationFrame(f);else{const s=d.slice().sort((a,b)=>a-b);res({fps:d.length/(d.reduce((a,b)=>a+b,0)/1000),p95:s[Math.floor(d.length*.95)]})}}requestAnimationFrame(f)})`;
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
(async()=>{
 const b=await chromium.launch();
 for(const k of ['stage current','stage placeBg anim off','stage all anims off']){const r=[];let info='';
  for(let i=0;i<3;i++){
   const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
   const p=await c.newPage();const cdp=await c.newCDPSession(p);
   await p.goto('http://localhost:8099/valley/next.html',{waitUntil:'load'});await p.waitForTimeout(2000);await p.click('#enter');await p.waitForTimeout(2000);
   for(let j=0;j<3;j++){await p.click('.ibtn').catch(()=>{});await p.waitForTimeout(1200)}await p.waitForTimeout(1500);
   await p.evaluate(()=>{const e=document.querySelector('.place.ready,.plabel.ready,.place');e&&e.dispatchEvent(new MouseEvent('click',{bubbles:true}))});await p.waitForTimeout(3500);
   info=await p.evaluate(()=>document.getElementById('app').className+' | '+[...document.getAnimations()].map(a=>a.animationName).filter((v,i,x)=>x.indexOf(v)===i).join(','));
   if(i===0)await p.screenshot({path:'/tmp/next/shots/r4_valley_stage.png'});
   if(k.includes('placeBg'))await p.evaluate(()=>{const s=document.createElement('style');s.textContent='#placeBg{animation:none!important}';document.head.appendChild(s)});
   if(k.includes('all anims'))await p.evaluate(()=>document.getAnimations().forEach(a=>a.cancel()));
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.waitForTimeout(500);
   r.push((await p.evaluate(FPS)).fps);await c.close();
  }
  console.log(k.padEnd(26),r.map(x=>x.toFixed(0)).join('/'),'median',med(r).toFixed(0),'|',info);
 }
 await b.close()})();
