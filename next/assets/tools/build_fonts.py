import sys, os, re, subprocess, collections
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib import instancer
SRC='/tmp/fdl'; OUT='/home/claude/athar/next/assets/fonts'
os.makedirs(OUT,exist_ok=True)
def chars_of(path):
    s=open(path,encoding='utf8').read()
    return set(s)
valley=chars_of('/home/claude/athar/valley/index.html')
root=chars_of('/home/claude/athar/index.html')
LATIN=set(chr(c) for c in range(0x20,0x7f))|set(' «»·×½–—…‘’“”•←→↑↓')
ARAB=set(chr(c) for c in list(range(0x600,0x700))+[0x750+i for i in range(0x30)]+list(range(0xFE70,0xFEFF))+list(range(0xFB50,0xFBC2))+list(range(0xFDF0,0xFE00)))
ARAB_QURAN=ARAB|set(chr(c) for c in range(0x8A0,0x900))|set(chr(c) for c in range(0xFB50,0xFE00))|{chr(0x200c),chr(0x200d),chr(0x200e),chr(0x200f),chr(0x25cc)}
def run(name, src, text, wght=None, out=None, feats='*'):
    f=TTFont(f'{SRC}/{src}')
    opts=subset.Options()
    opts.layout_features=[feats] if feats=='*' else feats
    opts.flavor='woff2'; opts.notdef_outline=True; opts.name_IDs=[0,1,2,3,4,6,13,14]
    opts.hinting=False; opts.desubroutinize=True; opts.glyph_names=False
    opts.layout_closure=True
    s=subset.Subsetter(opts); s.populate(text=''.join(sorted(text)))
    s.subset(f)
    if wght and 'fvar' in f:
        f=instancer.instantiateVariableFont(f,{'wght':wght})
    f.flavor='woff2'
    p=f'{OUT}/{out}'; f.save(p)
    cm=f.getBestCmap()
    print(out, os.path.getsize(p), 'glyphs', len(f.getGlyphOrder()))
    return p
v=valley|LATIN|ARAB
# Rubik for valley: wght 400-700 variable
run('rubik','Rubik[wght].ttf', {c for c in v if ord(c)<0x2200 or ord(c) in (0x2248,0x2265)}, wght=(400,700), out='rubik-ar-lat-var.woff2')
r=root|LATIN|ARAB
rt={c for c in r if ord(c)<0x2200 or 0xFB50<=ord(c)<=0xFEFF}
run('baloo','BalooBhaijaan2.ttf', rt, wght=(500,800), out='baloo-bhaijaan2-var.woff2')
for w,n in ((400,'Regular'),(500,'Medium'),(700,'Bold'),(800,'ExtraBold')):
    run('taj',f'Tajawal-{n}.ttf', rt, out=f'tajawal-{w}.woff2')
run('aq','AmiriQuran-Regular.ttf', ARAB_QURAN|LATIN, out='amiri-quran.woff2')
# ﷺ fallback
sal={chr(0xFDFA),chr(0xFDFB),chr(0xFDFD),chr(0xFDF2)}|{chr(c) for c in range(0x6D6,0x6EE)}
run('salah-noto','NotoNaskhArabic[wght].ttf', sal, wght=(400,700), out='salawat-noto.woff2')
# missing coverage report
for nm,src,chs in (('Rubik','Rubik[wght].ttf',valley),):
    cm=TTFont(f'{SRC}/{src}').getBestCmap()
    miss=sorted(c for c in chs if ord(c)>0x7f and ord(c) not in cm)
    print(nm,'missing in valley:',' '.join(f'{c}U+{ord(c):04X}' for c in miss))
