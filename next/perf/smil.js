const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});const p=await c.newPage();
await p.goto('http://localhost:8099/'+process.argv[2]);await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('animate,animateTransform,animateMotion,set')].map(a=>{const t=a.parentNode;const r=t.getBoundingClientRect();return a.tagName+' '+(a.getAttribute('attributeName')||'')+' dur='+a.getAttribute('dur')+' rep='+a.getAttribute('repeatCount')+' parent='+t.tagName+'.'+(t.getAttribute('class')||'')+' in#'+(t.closest('[id]')||{}).id+' box='+Math.round(r.width)+'x'+Math.round(r.height)})));
await b.close()})();
