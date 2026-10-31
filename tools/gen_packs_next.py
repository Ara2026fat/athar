#!/usr/bin/env python3
"""يبني packs-next.json = packs.json + حزمة «أصوات المكتبة والقصص» من story-index.json. شغّله بعد كل دمج أصوات جديدة."""
import json,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p=json.load(open(os.path.join(root,'packs.json'),encoding='utf-8'))
si=json.load(open(os.path.join(root,'story-index.json'),encoding='utf-8'))
core=set(l.strip().strip("',").lstrip('./') for l in open(os.path.join(root,'sw.js'),encoding='utf-8') if l.strip().startswith("'./sp_"))
files=[f for f in si['packs'] if f not in core]
mb=sum(os.path.getsize(os.path.join(root,f)) for f in files)/1048576
p['packs']=[x for x in p['packs'] if x['id']!='voices-lib']
p['packs'].append({"id":"voices-lib","title":"أصوات المكتبة والقصص","desc":"أصوات كتب المكتبة والأسئلة والقصص، لتعمل دون إنترنت","size":"نحو %d ميغا، يُفضَّل واي فاي"%round(mb),"required":False,
 "bases":["https://ara2026fat.github.io/athar/"],"files":files})
json.dump(p,open(os.path.join(root,'packs-next.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(files),round(mb),'MB')
