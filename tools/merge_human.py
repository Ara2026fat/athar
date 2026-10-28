#!/usr/bin/env python3
"""merge_human.py <zip> [--reader human_reader]
يدمج حزمة تسجيل بشري في معاينة الوادي: ينسخ الملفات إلى valley/audio/<reader>/
ويضيف file="@reader/<ملف>" لكل سطر مكتمل موجود في سجل الصوت (valley/next.html)."""
import sys,json,zipfile,os,shutil,re
repo=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
z=zipfile.ZipFile(sys.argv[1]); m=json.loads(z.read('manifest.json'))
reader=m['voice']; dst=os.path.join(repo,'valley/audio',reader); os.makedirs(dst,exist_ok=True)
for u in m['units']:
    open(os.path.join(dst,os.path.basename(u['file'])),'wb').write(z.read(u['file']))
p=os.path.join(repo,'valley/next.html'); s=open(p,encoding='utf-8').read()
key='const ATHAR_DATA = '; i=s.index(key); j=s.index('\n',i)
line=s[i+len(key):j]; semi=line.endswith(';'); d=json.loads(line.rstrip(';'))
a=d['audio']; wired=[];skipped=[]
for k,v in m['entries'].items():
    fs=v['file'] if isinstance(v['file'],list) else [v['file']]
    if k not in a: skipped.append(k); continue
    if len(fs)==1: a[k]['file']='@reader/'+os.path.basename(fs[0]); wired.append(k)
    else: skipped.append(k+' (multi-part)')
s=s[:i+len(key)]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+(';' if semi else '')+s[j:]
open(p,'w',encoding='utf-8').write(s)
print('reader',reader,'files',len(m['units']),'wired',len(wired),'skipped',skipped, 'incomplete',len(m.get('incomplete',[])))
