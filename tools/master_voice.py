#!/usr/bin/env python3
"""
أثر — صقل التسجيلات البشرية («دافئ»): أحادي، تنقية ضجيج، رفع تلقائي للمستوى،
وضوح، ضغط خفيف، بوابة، صدى ناعم قصير، ثم توحيد الجهارة (-16.5 LUFS).

الاستعمال:
    python3 -I tools/master_voice.py IN.wav OUT.wav        # ملف واحد
    python3 -I tools/master_voice.py --dir IN_DIR OUT_DIR  # مجلد كامل (wav/webm/m4a/mp3)

يتطلب ffmpeg (و numpy/scipy لتوليد استجابة الصدى مرة واحدة).
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile

SR = 48000
TARGET_LUFS = -16.5
TARGET_TP = -1.5
PEAK_TARGET_DB = -6.0   # قبل الضغط: يُرفع ذروة الكلام إلى هذا المستوى

CHAIN_PRE = ("highpass=f=90,afftdn=nr=18:nf=-64:tn=1")
CHAIN_POST = ("equalizer=f=280:t=q:w=1.2:g=-2.5,"
              "equalizer=f=3200:t=q:w=1:g=4.5,"
              "equalizer=f=7000:t=h:w=2000:g=3,"
              "acompressor=threshold=-26dB:ratio=3:attack=8:release=160:makeup=2,"
              "agate=threshold=0.012:ratio=2.5:attack=5:release=250")


def run(args, capture=False):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(" ".join(args) + "\n" + r.stderr[-800:])
    return r.stderr if capture else None


def make_ir(path):
    rng = np.random.default_rng(7)
    n = int(SR * 0.6)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 6.9 / 0.45)
    y = np.zeros(n)
    a = 0.55
    prev = 0.0
    for i in range(n):
        prev = (1 - a) * ir[i] + a * prev
        y[i] = prev
    y = np.concatenate([np.zeros(int(SR * 0.012)), y])
    y /= np.abs(y).max()
    wavfile.write(path, SR, (y * 32767).astype(np.int16))


def peak_db(path):
    out = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "astats=metadata=0", "-f", "null", "-"], True)
    m = re.findall(r"Peak level dB:\s*(-?[0-9.]+|-?inf)", out)
    return float(m[-1]) if m and "inf" not in m[-1] else -90.0


def loudnorm_pass(src, dst, i_target, tp):
    out = run(["ffmpeg", "-hide_banner", "-i", src, "-af",
               f"loudnorm=I={i_target}:TP={tp}:LRA=8:print_format=json", "-f", "null", "-"], True)
    j = json.loads(out[out.rindex("{"):out.rindex("}") + 1])
    af = (f"loudnorm=I={i_target}:TP={tp}:LRA=8:measured_I={j['input_i']}:measured_TP={j['input_tp']}"
          f":measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-af", af, "-ar", str(SR), dst])


def master(src, dst):
    with tempfile.TemporaryDirectory() as td:
        ir = os.path.join(td, "ir.wav"); make_ir(ir)
        mono = os.path.join(td, "mono.wav")
        run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(SR),
             "-af", CHAIN_PRE, mono])
        gain = PEAK_TARGET_DB - peak_db(mono)                       # رفع تلقائي بحسب الذروة
        gain = max(-6.0, min(gain, 40.0))
        pre = os.path.join(td, "pre.wav")
        run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", mono, "-af",
             f"volume={gain:.2f}dB," + CHAIN_POST, pre])
        clean = os.path.join(td, "clean.wav")
        loudnorm_pass(pre, clean, -16.0, TARGET_TP)
        raw = os.path.join(td, "warm_raw.wav")
        run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", clean, "-i", ir, "-filter_complex",
             "[0:a]asplit[d][w];[w][1:a]afir=dry=0:wet=10[r];[r]volume=-9dB,highpass=f=200,lowpass=f=6500[rv];"
             "[d][rv]amix=inputs=2:weights='1 1':normalize=0,alimiter=limit=0.84", raw])
        loudnorm_pass(raw, dst, TARGET_LUFS, TARGET_TP)
    return gain


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 3 and a[0] == "--dir":
        os.makedirs(a[2], exist_ok=True)
        for fn in sorted(os.listdir(a[1])):
            if fn.lower().endswith((".wav", ".webm", ".m4a", ".mp3", ".ogg")):
                out = os.path.join(a[2], os.path.splitext(fn)[0] + ".wav")
                g = master(os.path.join(a[1], fn), out)
                print(f"{fn}: gain {g:+.1f} dB -> {out}")
    elif len(a) == 2:
        print(f"gain {master(a[0], a[1]):+.1f} dB")
    else:
        print(__doc__); sys.exit(1)
