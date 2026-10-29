/* صوت الرئيسية — أصوات طبيعية فقط (بلا موسيقى) + صوت أثر المولَّد. يتعطّل بلطف إن فشل أي ملف. */
(function(){
"use strict";
var W=window,D=document;
var LINES={
hello:"السلام عليكم، أنا أثر! هيا نبدأ رحلتنا اليوم.",
morning:"صباح الخير! يوم جديد وخير جديد.",
evening:"مساء الخير! أحسنتَ اليوم يا بطل.",
night:"ليلة هادئة يا بطل. هيا نختم يومنا بخير.",
noor:"هيا نتعلم الحروف في القاعدة النورانية.",
hifz:"هيا نحفظ من القرآن الكريم.",
valley:"هيا إلى الوادي، حصة اليوم تنتظرك.",
lib:"هيا إلى مكتبتي، فيها كتب جميلة.",
math:"هيا نلعب مع الأرقام.",
adhkar:"هيا نقرأ أذكارنا.",
quiz:"هيا إلى المسابقات، أنا واثق بك.",
can:"أنت تستطيع. خطوة صغيرة كل يوم.",
well:"أحسنتَ! استمر يا بطل.",
repeat:"التكرار يصنع المهارة. أعد مرة أخرى.",
letter:"كل حرف تتعلمه نور جديد.",
mash:"ما شاء الله! تقدمك جميل.",
nobas:"لا بأس. المحاولة بداية النجاح.",
bism:"قل: بسم الله، ثم ابدأ.",
next:"رحلتنا جميلة. هيا إلى الباب التالي.",
bye:"إلى اللقاء، أراك غدًا بإذن الله."
};
var MOTIV=["can","well","repeat","letter","mash","bism"];
function vNorm(t){return String(t).replace(/[ً-ٰٟـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/[!؟?.,،:؛]+/g," ").replace(/\s+/g," ").replace(/^ | $/g,"")}
function vHash(t){var n=vNorm(t),x=5381;for(var i=0;i<n.length;i++)x=(((x<<5)+x)^n.charCodeAt(i))>>>0;return x.toString(16)}
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var base=(function(){var s=D.currentScript;return s&&s.src?s.src.replace(/audio\.js(\?.*)?$/,""):"next/home/"})();
var H={on:ls("athar_home_snd")!=="0",unlocked:false,per:"day",idx:null,bin:null,voice:null,amb:null,ambKey:"",cache:{},lastLine:0};
function mkAudio(src,loop,vol){var a=new Audio(src);a.loop=!!loop;a.volume=vol;a.preload="auto";return a}
function loadVoice(){
 if(H._p)return H._p;
 H._p=fetch(base+"voice/home-index.json").then(function(r){return r.json()}).then(function(j){H.idx=j.e;return fetch(base+"voice/sp_home.bin")}).then(function(r){return r.arrayBuffer()}).then(function(b){H.bin=b}).catch(function(){H._p=null});
 return H._p;
}
function clipUrl(name){
 if(H.cache[name])return H.cache[name];
 if(!H.idx||!H.bin||!LINES[name])return null;
 var e=H.idx[vHash(LINES[name])];if(!e)return null;
 var u=URL.createObjectURL(new Blob([H.bin.slice(e[1],e[1]+e[2])],{type:"audio/mpeg"}));H.cache[name]=u;return u;
}
H.say=function(name,done,low){ /* low = تحية/تشجيع: لا يقطع جملة جارية ولا ينتظرها */
 if(!H.on||!H.unlocked){done&&done();return false}
 if(low&&H.speaking()){done&&done();return false}
 H.stopVoice();
 var tok=H._tk=(H._tk||0)+1;
 if(H.bin&&H.idx){return play(name,done,tok)}
 H._q=tok;                                  /* الحزمة لم تُحمَّل بعد: انتظرها ثم انطق */
 var p=loadVoice();if(!p){H._q=0;done&&done();return false}
 p.then(function(){if(H._q===tok){H._q=0;play(name,done,tok)}else done&&done()});
 return true;
};
function play(name,done,tok){
 if(H._tk!==tok){done&&done();return false}
 var u=clipUrl(name);if(!u){done&&done();return false}
 var a=mkAudio(u,false,1);H.voice=a;var fin=false;function f(){if(fin)return;fin=true;if(H.voice===a)H.voice=null;done&&done()}
 a.onended=f;a.onerror=f;a.play().catch(f);H.duck(true);a.addEventListener("ended",function(){H.duck(false)});a.addEventListener("error",function(){H.duck(false)});
 return true;
}
H.stopVoice=function(){H._q=0;if(H.voice){try{H.voice.pause()}catch(e){}H.voice=null}H.duck(false)};
H.speaking=function(){return !!H._q||(!!H.voice&&!H.voice.ended&&!H.voice.paused)};
H.after=function(cb,max){ /* ينتظر نهاية الجملة (بحدٍّ أقصى) ثم ينفّذ */
 if(!H.speaking()){cb();return}
 var t0=Date.now(),lim=max||7000;
 (function w(){if(!H.speaking()||Date.now()-t0>lim){setTimeout(cb,120);return}setTimeout(w,80)})();
};
H.duck=function(on){if(H.amb)try{H.amb.volume=on?.08:H.ambVol()}catch(e){}};
H.ambVol=function(){return H.per==="night"?.5:.42};
H.period=function(per){
 H.per=per;var k=per==="night"?"night":per==="evening"?"eve":"day";
 if(!H.on||!H.unlocked){H.ambKey=k;return}
 H.startAmb(k);
};
H.startAmb=function(k){
 if(k===H.ambKey&&H.amb&&!H.amb.paused)return;
 var old=H.amb;H.ambKey=k;
 var a=mkAudio(base+"snd/"+k+".mp3",true,0);H.amb=a;
 a.play().then(function(){fade(a,H.ambVol(),1800)}).catch(function(){});
 if(old)fade(old,0,1400,function(){try{old.pause()}catch(e){}});
};
function fade(a,to,ms,end){var from=a.volume,t0=Date.now();(function s(){var f=Math.min(1,(Date.now()-t0)/ms);try{a.volume=Math.max(0,Math.min(1,from+(to-from)*f))}catch(e){}if(f<1)requestAnimationFrame(s);else end&&end()})()}
H.sfx=function(n,vol){if(!H.on||!H.unlocked)return;try{var a=mkAudio(base+"snd/"+n+".mp3",false,vol==null?.55:vol);a.play().catch(function(){});return a}catch(e){}};
H.steps=function(ms){var a=H.sfx("steps",.5);if(a&&ms)setTimeout(function(){fade(a,0,200,function(){try{a.pause()}catch(e){}})},ms)};
H.motivate=function(){var n=MOTIV[Math.floor(Math.random()*MOTIV.length)];if(n===H.lastLine)n=MOTIV[(MOTIV.indexOf(n)+1)%MOTIV.length];H.lastLine=n;return H.say(n,null,true)};
H.greet=function(){var n=H.per==="night"?"night":H.per==="evening"?"evening":H.per==="morning"?"morning":null;
 var d=new Date().toDateString();if(ls("athar_home_greet")===d)return;lset("athar_home_greet",d);
 H.say(n||"hello",null,true)};
H.hold=function(on){if(on){H.stopVoice();if(H.amb)try{H.amb.pause()}catch(e){}}else if(H.on&&H.unlocked){if(H.amb)try{H.amb.play().catch(function(){})}catch(e){}else H.startAmb(H.ambKey||"day")}};
H.back=function(){var L=["well","next","mash","can"];H._b=((H._b||0)+1)%L.length;return H.say(L[H._b],null,true)};
H.set=function(on){H.on=!!on;lset("athar_home_snd",on?"1":"0");if(!on){H.stopVoice();if(H.amb)try{H.amb.pause()}catch(e){}H.amb=null;H.ambKey=""}else{H.period(H.per)}};
H.unlock=function(){
 if(H.unlocked)return;H.unlocked=true;loadVoice();
 if(H.on)H.startAmb(H.ambKey||"day");
 setTimeout(function(){if(H.on)H.greet()},900);
};
["pointerdown","keydown","touchstart"].forEach(function(n){D.addEventListener(n,function f(){H.unlock();D.removeEventListener(n,f,true)},true)});
D.addEventListener("visibilitychange",function(){if(!H.amb)return;if(D.hidden)try{H.amb.pause()}catch(e){}else if(H.on&&H.unlocked)try{H.amb.play().catch(function(){})}catch(e){}});
W.HomeAudio=H;loadVoice();
})();
