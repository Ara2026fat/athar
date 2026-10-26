const {chromium}=require('playwright');
const URL=process.argv[2]||'home-next.html?t=day&first=0';
(async()=>{
 const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const p=await c.newPage();await p.goto('http://localhost:8099/'+URL);await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const map={};document.getAnimations().forEach(a=>{const e=a.effect,t=e.target;if(!t)return;const kf=e.getKeyframes();const props=new Set();kf.forEach(k=>Object.keys(k).forEach(x=>{if(!['offset','easing','composite','computedOffset'].includes(x))props.add(x)}));
  const name=a.animationName||a.transitionProperty||'?';const key=name+'|'+[...props].join(',');const sel=(t.id?'#'+t.id:'')+(t.className&&t.className.baseVal!==undefined?'.'+t.className.baseVal.split(' ').join('.'):(t.className?'.'+String(t.className).split(' ').join('.'):''));
  const o=map[key]||(map[key]={name,props:[...props],n:0,state:a.playState,sample:t.tagName+sel,dur:e.getTiming().duration,inSvg:!!t.closest&&!!t.closest('svg')});o.n++});return Object.values(map)});
 r.sort((a,b)=>b.n-a.n);r.forEach(x=>console.log(JSON.stringify(x)));await b.close()})();
