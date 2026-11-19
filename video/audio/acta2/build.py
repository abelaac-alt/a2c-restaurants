"""Reel «historia real» de Acta: tiempos (desde la narración, cuadrados al pulso), palabras para los subtítulos,
música en dos partes (tensión → drop), efectos y mezcla a -14 LUFS.

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python audio/acta2/build.py ~/lemo-opuscar
Salidas: src/acta2/timing.json, public/acta2/mix.wav
"""
import sys, os, json, re, subprocess
import numpy as np
import soundfile as sf
import soxr

LIB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/lemo-opuscar")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
sys.path.insert(0, os.path.dirname(HERE))
from core.audio import sampler as S  # noqa: E402  (reverb)
from core.audio import sfx  # noqa: E402
import synth as Y  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS, SR, BPM = 30, Y.SR, 120
BEAT = 60 / BPM
BAR = 4 * BEAT

L = json.load(open(f"{HERE}/lines.json", encoding="utf-8"))
lines = {l["id"]: l for l in L}
dur = json.load(open(f"{HERE}/voice/dur.json"))

SCENES = [
    dict(name="hook", ids=["h1", "h2"], lead=0.1, gaps=[0.2], tail=0.25),
    dict(name="deny", ids=["h3"], lead=0.1, gaps=[], tail=0.55),
    dict(name="acta", ids=["h4"], lead=0.15, gaps=[], tail=0.45),
    dict(name="search", ids=["h5", "h6", "h7"], lead=0.2, gaps=[0.3, 0.35], tail=0.5),
    dict(name="win", ids=["h8"], lead=0.2, gaps=[], tail=0.8),
    dict(name="how", ids=["h9"], lead=0.2, gaps=[], tail=0.7),
    dict(name="end", ids=["h10"], lead=0.3, gaps=[], tail=2.4),
]


def word_times(text, d):
    """reparte las palabras de una frase en su duración (por longitud, con pausa tras la puntuación)"""
    words = text.replace("«", "").replace("»", "").split()
    w = [len(x) + 2 + (4 if re.search(r"[.,:;?!]$", x) else 0) for x in words]
    tot = sum(w)
    out, acc = [], 0.0
    for x, wi in zip(words, w):
        out.append({"w": x, "t": acc / tot * d * 0.96})
        acc += wi
    return out


timing = {"fps": FPS, "scenes": []}
t = 0.0
voice_at = []
for sc in SCENES:
    x = sc["lead"]
    cues = []
    for i, lid in enumerate(sc["ids"]):
        if i:
            x += sc["gaps"][i - 1]
        d = dur[lid]
        cues.append({
            "id": lid, "at": round(x * FPS), "dur": round(d * FPS), "text": lines[lid]["text"],
            "agent": lines[lid]["voice"] == "ef_dora",
            "words": [{"w": w["w"], "at": round((x + w["t"]) * FPS)} for w in word_times(lines[lid]["text"], d)],
        })
        voice_at.append((t + x, lid))
        x += d
    x += sc["tail"]
    x = np.ceil(x / BEAT) * BEAT
    timing["scenes"].append({"name": sc["name"], "start": round(t * FPS), "dur": round(x * FPS), "cues": cues})
    t += x
T = t
timing["total"] = round(T * FPS)
st = {s["name"]: s["start"] / FPS for s in timing["scenes"]}
sc_by = {s["name"]: s for s in timing["scenes"]}


def cue_time(scene, idx, frac=0.0):
    s = sc_by[scene]
    c = s["cues"][idx]
    return (s["start"] + c["at"] + c["dur"] * frac) / FPS


# momentos clave para efectos y animación
ev = {
    "bill": cue_time("hook", 1, 0.78),
    "scratch": cue_time("deny", 0, 1.0) + 0.05,
    "drop": st["acta"],
    "agent": cue_time("search", 2, 0.0),
    "agent_end": cue_time("search", 2, 1.0),
    "refund": cue_time("win", 0, 0.75),
    "end_hit": st["end"] + 2 * BAR,
}
timing["events"] = {k: round(v * FPS) for k, v in ev.items()}
os.makedirs(f"{ROOT}/src/acta2", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/acta2/timing.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {T:.1f} s ·", {k: round(v, 2) for k, v in ev.items()})

N = int((T + 1) * SR)
drums, synth, bass, fx = (np.zeros((N, 2)) for _ in range(4))
pump = np.ones(N)

# ---- Parte A: tensión (La menor, oscuro) hasta el scratch ----
DARK = [(45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62]), (40, [52, 56, 59])]  # Am F G E
tb = 0.0
bar = 0
while tb < ev["scratch"]:
    root, ch = DARK[bar % 4]
    Y.put(synth, Y.sub_drone(root - 12 + 12, BAR + 0.1), tb, 0.35)
    for b in range(4):
        tbe = tb + b * BEAT
        if tbe >= ev["scratch"]:
            break
        Y.put(drums, Y.hat(), tbe + BEAT / 2, 0.16, 0.3)
        Y.put(drums, Y.hat(), tbe, 0.08, -0.3)
        if b == 0 or (b == 2 and bar >= 1):
            Y.put(drums, Y.kick(0.6), tbe, 0.75)
        if b in (1, 3):
            stab = sum(Y.pluck(m + 12, 0.4, 0.12, 1800) for m in ch) / 3
            Y.put(synth, stab, tbe + BEAT / 2, 0.22, 0.2 if b == 1 else -0.2)
    tb += BAR
    bar += 1
# subida hasta el scratch
rl = min(ev["scratch"] - st["deny"], 2.5)
Y.put(fx, Y.riser(rl), ev["scratch"] - rl, 0.25)
Y.put(fx, Y.scratch(), ev["scratch"] - 0.12, 0.45)

# ---- Parte B: drop brillante (Do mayor) desde «Acta» ----
BRIGHT = [([55, 60, 64], 48), ([55, 59, 62], 43), ([57, 60, 64], 45), ([53, 57, 60], 41)]  # C G Am F
tb = ev["drop"]
k = 0
while tb < ev["end_hit"]:
    notes, root = BRIGHT[k % 4]
    agent = ev["agent"] - 0.2 <= tb < ev["agent_end"]
    pad = Y.lp(sum(Y.supersaw(m, BAR) for m in notes) / 3, 3000)
    Y.put(synth, pad, tb, 0.4, -0.25)
    Y.put(synth, pad, tb + 0.012, 0.4, 0.25)
    for b in range(4):
        tbe = tb + b * BEAT
        Y.put(drums, Y.kick(), tbe, 0.95)
        i = int(tbe * SR)
        n = min(int(0.3 * SR), N - i)
        if n > 0:
            pump[i : i + n] = np.minimum(pump[i : i + n], 0.35 + 0.65 * (np.arange(n) / n) ** 0.6)
        Y.put(drums, Y.hat(True), tbe + BEAT / 2, 0.22, 0.25)
        Y.put(drums, Y.hat(), tbe + BEAT / 4, 0.1, -0.3)
        Y.put(drums, Y.hat(), tbe + 3 * BEAT / 4, 0.1, -0.3)
        if b in (1, 3):
            Y.put(drums, Y.clap(), tbe, 0.55)
        Y.put(bass, Y.bass_note(root, BEAT / 2), tbe + BEAT / 2, 0.6)
        arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12]
        for s in range(4):
            Y.put(synth, Y.pluck(arp[s]), tbe + s * BEAT / 4, 0.15, 0.35 if s % 2 else -0.35)
    tb += BAR
    k += 1
for at in (ev["drop"], ev["end_hit"]):
    Y.put(fx, Y.crash(), at, 0.3, 0.1)
    Y.put(fx, Y.boom(), at, 0.75)
    Y.put(drums, Y.kick(), at, 1.0)
last = sum(Y.supersaw(m, 3.0) for m in BRIGHT[0][0]) / 3
Y.put(synth, Y.lp(last, 2500) * np.exp(-Y.tt(3.0) / 1.2), ev["end_hit"], 0.45)

# ---- efectos ----
Y.put(fx, sfx.ding(1.0), ev["bill"], 0.35)  # llega la factura
Y.put(fx, sfx.thump(1.0, 60), ev["bill"], 0.5)
h5 = cue_time("search", 0, 0.15)
for j in range(8):  # tecleo de «gratis»
    Y.put(fx, Y.tick(), h5 + j * 0.09 + 0.02 * (j % 3), 0.25)
Y.put(fx, Y.chime(), ev["refund"], 0.35)  # cargo anulado
for s in ("search", "win", "how", "end"):
    Y.put(fx, sfx.whoosh(0.4, 1.0), st[s] - 0.2, 0.12)

synth *= pump[:, None]
bass *= pump[:, None]
music = drums + synth + bass
music = S.room(music.astype(np.float32), size=0.35, mix=0.12)
music = music / (np.abs(music).max() + 1e-9)

# ---- voces ----
narr = np.zeros(N)
agent = np.zeros(N)
for at, lid in voice_at:
    v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    v = soxr.resample(v if v.ndim == 1 else v.mean(1), sr, SR)
    i = int(at * SR)
    if lines[lid]["voice"] == "ef_dora":
        v = Y.phone_eq(v)
        agent[i : i + len(v)] += v[: N - i]
    else:
        narr[i : i + len(v)] += v[: N - i]
narr = Y.hp(narr, 90)
narr = narr + 0.35 * Y.bp(narr, 2500, 5000) + 0.15 * Y.hp(narr, 8000)
narr = sfx.compress(narr, thr=0.22, ratio=4)
narr /= np.abs(narr).max() + 1e-9
agent *= 0.8
voice = narr + agent
voice_st = S.room(np.stack([voice, voice], 1).astype(np.float32), size=0.15, mix=0.05)

# ducking (más profundo mientras suena la grabación de la teleoperadora)
win = int(0.04 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same").clip(0, 1)
duck = 1 - 0.6 * speak
a0, a1 = int((ev["agent"] - 0.25) * SR), int((ev["agent_end"] + 0.15) * SR)
duck[a0:a1] = np.minimum(duck[a0:a1], 0.18)
# silencio tras el scratch hasta el drop
s0, s1 = int((ev["scratch"] + 0.2) * SR), int(ev["drop"] * SR)
music[s0:s1] *= 0.0

mix = music * 0.55 * duck[:, None] + fx * duck[:, None] + voice_st * 0.9
fo = int(1.5 * SR)
mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
mix = mix[: int(T * SR)]
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/acta2", exist_ok=True)
wav = f"{ROOT}/public/acta2/mix.wav"
sf.write(wav, mix.astype(np.float32), SR)

probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\}", probe[probe.rfind("Parsed_loudnorm"):], re.S).group(0))
tmp = wav + ".tmp.wav"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af",
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "-c:a", "pcm_f32le", tmp], check=True)
os.replace(tmp, wav)
print(f"mezcla: {m['input_i']} LUFS -> -14 LUFS")
