const {run,SLOW4G}=require('./perf.js');
(async()=>{
 const tag=process.argv[2]||'x';const out={};
 for(const [k,cpu,net] of [['4x_4G',4,SLOW4G],['4x_local',4,null],['1x_local',1,null]]){
  const r=await run('home','home-next.html?t=day&first=0',390,844,cpu,net,{ready:'#wSky'});
  out[k]={cls:r.cls,fcp:r.fcp,lcp:r.lcp,idle:r.idle,fps:r.fps&&r.fps.fps,p95:r.fps&&r.fps.p95ms,errs:r.errs,loadMs:r.loadMs,anim:r.domCount&&r.domCount.anim,raf:r.raf};
  console.log(k,JSON.stringify(out[k]));
 }
 require('fs').writeFileSync('/tmp/next/r5_perf_'+tag+'.json',JSON.stringify(out,null,1));
})();
