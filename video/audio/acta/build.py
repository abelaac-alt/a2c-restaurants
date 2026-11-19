"""Reel de marketing de Acta: tiempos de escena (a partir de la narración, cuadrados al pulso de la música),
música electrónica sintetizada a 120 ppm, efectos y mezcla final a -14 LUFS.

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python audio/acta/build.py ~/lemo-opuscar
Entradas: audio/acta/lines.json, audio/acta/voice/<VOZ>_<id>.wav (Kokoro)
Salidas:  src/acta/timing.json, public/acta/mix.wav
"""
import sys, os, json, subprocess, re
import numpy as np
import soundfile as sf
import soxr
from scipy.signal import butter, sosfilt

LIB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/lemo-opuscar")
sys.path.insert(0, LIB)
from core.audio import sampler as S  # noqa: E402  (solo para la reverb)
from core.audio import sfx  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
VOICE = "ef_dora"
FPS = 30
SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(3)

lines = {l["id"]: l["text"] for l in json.load(open(f"{HERE}/lines.json", encoding="utf-8"))}
dur = {k.split("_", 2)[-1]: v for k, v in json.load(open(f"{HERE}/voice/dur.json")).items() if k.startswith(VOICE)}

# escena: frases, silencio antes de la primera, pausa entre frases y cola (segundos)
SCENES = [
    dict(name="hook", ids=["a1"], lead=0.3, gap=0, tail=0.3),
    dict(name="logo", ids=["a2"], lead=0.35, gap=0, tail=0.7),
    dict(name="record", ids=["a3"], lead=0.3, gap=0, tail=0.8),
    dict(name="summary", ids=["a4", "a5"], lead=0.3, gap=0.35, tail=1.2),
    dict(name="search", ids=["a6"], lead=0.3, gap=0, tail=1.2),
    dict(name="context", ids=["a7"], lead=0.3, gap=0, tail=1.0),
    dict(name="privacy", ids=["a8"], lead=0.3, gap=0, tail=0.8),
    dict(name="end", ids=["a9"], lead=0.4, gap=0, tail=2.6),
]

timing = {"fps": FPS, "bpm": BPM, "scenes": []}
t = 0.0
voice_at = []
for sc in SCENES:
    x = sc["lead"]
    cues = []
    for i, lid in enumerate(sc["ids"]):
        if i:
            x += sc["gap"]
        cues.append({"id": lid, "at": round(x * FPS), "dur": round(dur[lid] * FPS), "text": lines[lid]})
        voice_at.append((t + x, lid))
        x += dur[lid]
    x += sc["tail"]
    x = np.ceil(x / BEAT) * BEAT  # cada escena empieza en un pulso
    timing["scenes"].append({"name": sc["name"], "start": round(t * FPS), "dur": round(x * FPS), "cues": cues})
    t += x
T = t
timing["total"] = round(T * FPS)
os.makedirs(f"{ROOT}/src/acta", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/acta/timing.json", "w"), ensure_ascii=False, indent=1)
starts = [s["start"] / FPS for s in timing["scenes"]]
print(f"duración {T:.1f} s · escenas", [round(s, 2) for s in starts])

N = int((T + 1) * SR)


# ---------------- síntesis ----------------
def tt(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def saw(f, d, phase=0.0):
    x = tt(d)
    return 2 * ((x * f + phase) % 1) - 1


def kick():
    x = tt(0.45)
    f = 45 + 110 * np.exp(-x / 0.04)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-x / 0.18)
    click = hp(rng.standard_normal(len(x)), 2000) * np.exp(-x / 0.004) * 0.4
    return np.tanh(1.6 * (body + click))


def clap():
    x = tt(0.35)
    n = rng.standard_normal(len(x))
    env = np.zeros(len(x))
    for o in (0, 0.011, 0.022):
        i = int(o * SR)
        env[i:] += np.exp(-(x[: len(x) - i]) / 0.012)
    env += 0.5 * np.exp(-x / 0.12) * (x > 0.025)
    return bp(n, 900, 2600) * env


def hat(open_=False):
    d = 0.3 if open_ else 0.06
    x = tt(d)
    return hp(rng.standard_normal(len(x)), 7500) * np.exp(-x / (0.09 if open_ else 0.018))


def crash():
    x = tt(2.5)
    return hp(rng.standard_normal(len(x)), 4000) * np.exp(-x / 0.7)


def boom():
    x = tt(1.6)
    f = 32 + 60 * np.exp(-x / 0.15)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.6)


def supersaw(m, d):
    out = np.zeros(int(d * SR))
    for det in (-0.12, -0.06, 0, 0.06, 0.12):
        out += saw(hz(m + det), d, rng.random())
    return out / 5


def bass_note(m, d):
    x = tt(d)
    s = saw(hz(m), d) + 0.5 * np.sin(2 * np.pi * hz(m - 12) * x)
    env = np.minimum(1, x / 0.005) * np.exp(-x / 0.18)
    return lp(s, 700) * env


def pluck(m, d=0.25):
    x = tt(d)
    s = saw(hz(m), d) * 0.6 + np.sign(np.sin(2 * np.pi * hz(m) * x)) * 0.4
    return lp(s, 3500) * np.exp(-x / 0.07)


def put(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i : i + len(x), 0] += x * g * l
    buf[i : i + len(x), 1] += x * g * r


# Progresión Am – F – C – G (un acorde por compás)
CH = [([57, 60, 64], 45), ([53, 57, 60], 41), ([55, 60, 64], 48), ([55, 59, 62], 43)]
drop = starts[1]
end_hit = starts[7] + 2 * BAR  # golpe final

drums = np.zeros((N, 2))
synth = np.zeros((N, 2))
bassb = np.zeros((N, 2))
fx = np.zeros((N, 2))
pump = np.ones(N)  # sidechain: se hunde en cada bombo

# intro: acordes filtrados + hi-hats suaves + subida de ruido hasta el drop
b0 = drop - np.ceil(drop / BAR) * BAR
bar_t = b0
while bar_t < T:
    bi = int(round((bar_t - drop) / BAR)) % 4
    notes, root = CH[bi]
    intro = bar_t < drop
    final = bar_t >= end_hit
    if final:
        break
    # colchón de acordes
    pad = sum(supersaw(m, BAR) for m in notes) / 3
    pad = lp(pad, 900 if intro else 3200)
    env = np.minimum(1, tt(BAR) / 0.02)
    put(synth, pad * env, bar_t, 0.32 if intro else 0.42, -0.25)
    put(synth, pad * env, bar_t + 0.012, 0.32 if intro else 0.42, 0.25)
    for b in range(4):
        tb = bar_t + b * BEAT
        if tb < 0:
            continue
        if intro:
            put(drums, hat(), tb + BEAT / 2, 0.25, 0.3)
            continue
        put(drums, kick(), tb, 0.95)
        i = int(tb * SR)
        n = min(int(0.3 * SR), N - i)
        if n > 0:
            pump[i : i + n] = np.minimum(pump[i : i + n], 0.35 + 0.65 * (np.arange(n) / n) ** 0.6)
        put(drums, hat(open_=True), tb + BEAT / 2, 0.22, 0.25)
        put(drums, hat(), tb + BEAT / 4, 0.12, -0.3)
        put(drums, hat(), tb + 3 * BEAT / 4, 0.12, -0.3)
        if b in (1, 3):
            put(drums, clap(), tb, 0.55)
        # bajo a contratiempo
        put(bassb, bass_note(root, BEAT / 2), tb + BEAT / 2, 0.6)
        # arpegio en semicorcheas
        arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12]
        for s in range(4):
            put(synth, pluck(arp[s]), tb + s * BEAT / 4, 0.16, 0.35 if s % 2 else -0.35)
    bar_t += BAR

# subida antes del drop
rl = min(drop, 4 * BEAT * 2)
x = tt(rl)
noise = rng.standard_normal(len(x))
riser = np.zeros(len(x))
for i in range(0, len(x), 1200):
    f = 400 + 7000 * (i / len(x)) ** 2
    seg = bp(noise[max(0, i - 3000) : i + 1200], f * 0.8, min(f * 1.25, 20000))[-min(1200, len(x) - i) :]
    riser[i : i + len(seg)] = seg
riser *= (x / rl) ** 2
put(fx, riser, drop - rl, 0.35)
# impacto en el drop y golpe final
for at in (drop, end_hit):
    put(fx, crash(), at, 0.3, 0.1)
    put(fx, boom(), at, 0.7)
    put(drums, kick(), at, 1.0)
last = sum(supersaw(m, 3.0) for m in CH[0][0]) / 3
put(synth, lp(last, 2500) * np.exp(-tt(3.0) / 1.2), end_hit, 0.45)
# whoosh en cada cambio de escena (menos en el drop)
for s in starts[2:]:
    put(fx, sfx.whoosh(0.4, 1.0), s - 0.2, 0.12)

synth *= pump[:, None]
bassb *= pump[:, None]
music = drums + synth + bassb
music = S.room(music.astype(np.float32), size=0.35, mix=0.12)
music = music / (np.abs(music).max() + 1e-9)

# ---------------- voz ----------------
voice = np.zeros(N)
for at, lid in voice_at:
    v, sr = sf.read(f"{HERE}/voice/{VOICE}_{lid}.wav")
    v = soxr.resample(v if v.ndim == 1 else v.mean(1), sr, SR)
    i = int(at * SR)
    voice[i : i + len(v)] += v[: N - i]
# ecualización de locutor: quita graves sucios, realza presencia y brillo
voice = hp(voice, 90)
voice = voice + 0.35 * bp(voice, 2500, 5000) + 0.15 * hp(voice, 8000)
voice = sfx.compress(voice, thr=0.22, ratio=4)
voice = voice / (np.abs(voice).max() + 1e-9)
voice_rev = S.room(np.stack([voice, voice], 1).astype(np.float32), size=0.15, mix=0.06)

# ducking
win = int(0.04 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same").clip(0, 1)
duck = (1 - 0.6 * speak)[:, None]

mix = music * 0.55 * duck + fx * duck + voice_rev * 0.9
fo = int(1.5 * SR)
mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
mix = mix[: int(T * SR)]
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/acta", exist_ok=True)
wav = f"{ROOT}/public/acta/mix.wav"
sf.write(wav, mix.astype(np.float32), SR)

# -14 LUFS, pico -1 dBTP
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\}", probe[probe.rfind("Parsed_loudnorm"):], re.S).group(0))
tmp = wav + ".tmp.wav"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af",
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "-c:a", "pcm_f32le", tmp], check=True)
os.replace(tmp, wav)
print(f"mezcla: {m['input_i']} LUFS -> -14 LUFS · {wav}")
