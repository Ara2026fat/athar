import re,json
src=open('/home/claude/athar/tools/record.html',encoding='utf-8').read()
m=re.search(r'(<script id="queue" type="application/json">)(.*?)(</script>)',src,re.S)
q=json.loads(m.group(2))
q['units']=[u for u in q['units'] if u['kind']=='B1_dhikr_dua']
T={
'say.ist.1':'دافئة وهادئة، كأنك تصحو في الصباح مبتسمًا. بطيء وواضح.',
'say.ist.2':'خافتة وسريعة قليلًا، بصوت منخفض كأنه سرّ. بلا تفخيم.',
'say.ist.3':'كلمة واحدة بخشوع. نَفَس طويل ثم «غفرانك» هادئة.',
'say.ist.4':'خفيفة ومبتسمة، تُقال قبل الوضوء. لا تُثقِلها.',
'say.sab.2':'ثابتة وواثقة، كأنك تشهد بقلبك. قف قليلًا عند «إلا الله».',
'say.sab.3':'مطمئنة وواثقة، كأنك تخرج من البيت مرتاحًا. غير متعجلة.',
'rev.thw.1':'شكر دافئ، كأنك تحمد الله على نعمة بين يديك. بطيئة.',
'rev.thw.2':'قصيرة وخفيفة وحنونة.',
'rev.thw.3':'دعاء بتضرّع وصوت أخفض. قف عند كل فاصلة، وارفق عند «وأعوذ بك».',
'rev.thw.4':'ودودة، كأنك تهنّئ صديقًا بثوبه الجديد. ابتسامة في الصوت.',
'out.thw.silent':'مثل السابقة تمامًا: ودودة، تهنئة لطيفة.',
'say.bayt.out':'واثقة ومطمئنة، كأنك تفتح الباب وتخرج.',
'say.bayt.in':'هادئة ودافئة، كأنك تدخل بيتك وتشعر بالأمان.',
'say.salam.p1':'سلام مبتسم ومرحِّب، بصوت واضح وليس مرتفعًا.',
'say.salam.p2':'تكملة بنفس الدفء. اجعلها مقطعًا مستقلًا بعد وقفة قصيرة.',
'say.salam.p3':'تمام السلام بدفء أكبر قليلًا. مقطع مستقل.',
'friend.reply':'رد حاني وسعيد، كأنك تردّ على صديق تحبه. واضح وبطيء قليلًا.',
'say.sleep.3':'هادئة جدًا وخافتة، كأنك تهمس قبل النوم. لا تُسرِع.',
'say.suj.1':'خاشعة وخافضة الصوت، بطيئة ومتأنية.',
'say.suj.2':'تكبير ثابت ومتوسط القوة. «الله أكبر» ثم «أرفع رأسي» بنبرة أخف.',
'say.suj.3':'تضرّع هادئ ولطيف بين السجدتين. ارفق عند «واهدني».',
'say.sal.1':'محبة وخفة وهدوء، كأنك تذكر حبيبك ﷺ.',
'say.ruk.2':'شكر مبتهج وهادئ، كأنك فرحان بالركوب.',
'say.ruk.3':'تعظيم وتعجّب هادئ. «سبحان الذي سخّر لنا هذا» بخشوع لا بحماس.',
'say.ghd.1':'حازمة وهادئة جدًا، لا صراخ. كأنك تهدّئ نفسك: بطيء وثابت.',
'say.ark2.2':'تكبير ثابت ووقور، أعلى قليلًا من العادي لكن بلا صراخ.',
'say.tash.1':'تلاوة هادئة منتظمة بخشوع. جملة واحدة بنَفَس واحد.',
'say.tash.2':'بنفس النبرة الهادئة. «أيها النبي» برفق وتوقير.',
'say.tash.3':'بنفس النبرة. «علينا» و«الصالحين» بدفء.',
'say.tash.4':'ثابتة وواثقة. قف قليلًا بعد «إلا الله» ثم أكمل الشهادة الثانية.',
'rev.tash.1':'خفيضة وجادة، بلا تخويف ولا تهويل. هادئة كأنك تستجير بالله.',
}
assert set(T)==set(u['u'] for u in q['units']),set(u['u'] for u in q['units'])^set(T)
s=src[:m.start(2)]+json.dumps(q,ensure_ascii=False,separators=(',',':'))+src[m.end(2):]
def rep(a,b):
    global s
    assert s.count(a)==1,a; s=s.replace(a,b)
rep('<title>تسجيل أثر — القارئ</title>','<title>تسجيل الأذكار والأدعية — أثر</title>')
rep('render(); showHome();','S.kf = "all"; { const V = view(); const i = V.findIndex(u => !S.takes.has(u.u)); if (S.idx >= V.length || (S.idx === 0 && i > 0)) S.idx = i < 0 ? 0 : i; } render();')
rep('<button class="ibtn" id="bHome" aria-label="الأقسام">الأقسام</button>','')
rep('$("bHome").onclick = showHome; ','')
rep('<div class="ctx" id="cbefore" hidden></div>','<div class="tone" id="tone"></div>\n    <div class="ctx" id="cbefore" hidden></div>')
rep('</style>','.tone{background:var(--brand-soft);border-radius:14px;padding:10px 14px;margin:8px 0;font-size:18px;line-height:1.7}.tone b{display:block;font-size:14px;color:var(--mute);margin-bottom:2px}\n</style>')
rep('  const tb = tashBadge(u);','  const tb = tashBadge(u);\n  $("tone").innerHTML = TONE[u.u] ? "<b>🎙️ النبرة المقترحة</b>" + TONE[u.u] : "";')
rep('const CATS = [','const TONE = '+json.dumps(T,ensure_ascii=False)+';\nconst CATS = [')
open('/home/claude/athar/tools/record-adhkar.html','w',encoding='utf-8').write(s)
json.dump(T,open('/tmp/tones.json','w'),ensure_ascii=False)
print(len(q['units']))
