const {chromium}=require('playwright');const {m}=require('./perf.js');
const URL='home-next.html?t=day&first=0';
const V={
 wobbleOnly:null,
 smil:()=>{document.querySelectorAll('.wb .sw').forEach((g,i)=>{g.style.animation='none';const bb=g.getBBox();const cx=bb.x+bb.width/2,cy=bb.y+bb.height;const a=document.createElementNS('http://www.w3.org/2000/svg','animateTransform');a.setAttribute('attributeName','transform');a.setAttribute('type','rotate');a.setAttribute('values','-3 '+cx+' '+cy+';3 '+cx+' '+cy+';-3 '+cx+' '+cy);a.setAttribute('dur',(3+i*.6)+'s');a.setAttribute('repeatCount','indefinite');g.appendChild(a)})},
 only1:()=>{document.querySelectorAll('.wb .sw').forEach((g,i)=>{if(i)g.style.animation='none'})},
 wobble:()=>{const t=[...document.querySelectorAll('.wb .sw')];t.forEach(g=>g.style.animation='none');let i=0;setInterval(()=>{const g=t[i++%t.length];g.style.animation='wsway .6s ease-in-out 2 alternate'},2500)},
 swayOff:()=>{document.querySelectorAll('.wb .sw').forEach(g=>g.style.animation='none')},
};
(async()=>{
 const b=await chromium.launch();
 for(const [k,fn] of Object.entries(V).filter(([k,f])=>f && k==='wobble')){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://localhost:8099/'+URL,{waitUntil:'load'});await p.waitForTimeout(2500);
  await p.evaluate(fn);await p.waitForTimeout(800);
  const m0=await m(cdp);await p.waitForTimeout(5000);const m1=await m(cdp);
  const f=n=>+((m1[n]-m0[n])/5*100).toFixed(1);
  console.log(k.padEnd(10),'task%',f('TaskDuration'),'layout%',f('LayoutDuration'),'style%',f('RecalcStyleDuration'));
  await c.close();
 }
 await b.close();
})();
