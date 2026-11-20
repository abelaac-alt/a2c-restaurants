"""Calcula los tiempos de cada escena a partir de la narración y mezcla voz + música + efectos.

Uso (desde la carpeta video/):
    LIB=~/lemo-opuscar
    $LIB/.venv/bin/python audio/build_audio.py $LIB

Entradas: audio/lines.json, audio/voice/*.wav (Kokoro, voz em_alex).
Salidas:  src/aviones/timing.json (fotogramas de cada frase) y public/aviones/mix.wav (48 kHz estéreo).
"""
import sys, os, json
import numpy as np
import soundfile as sf
import soxr

LIB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/lemo-opuscar")
sys.path.insert(0, LIB)
from core.audio import sampler as S  # noqa: E402
from core.audio import sfx  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FPS = 30
SR = sfx.SR  # 48 kHz

lines = {l["id"]: l["text"] for l in json.load(open(f"{HERE}/lines.json", encoding="utf-8"))}
dur = json.load(open(f"{HERE}/voice/dur.json"))

# Por escena: silencio inicial, pausa antes de cada frase (fotogramas) y cola final.
SCENES = [
    dict(lead=15, ids=["s1_0"], pre=[0], tail=30),
    dict(lead=12, ids=["s2_0", "s2_1", "s2_2"], pre=[0, 8, 8], tail=18),
    dict(lead=12, ids=["s3_0", "s3_1", "s3_2", "s3_3"], pre=[0, 8, 22, 4], tail=22),
    dict(lead=12, ids=["s4_0", "s4_1", "s4_2", "s4_3"], pre=[0, 10, 10, 3], tail=24),
    dict(lead=12, ids=["s5_0", "s5_1", "s5_2"], pre=[0, 10, 10], tail=20),
    dict(lead=12, ids=["s6_0", "s6_1", "s6_2", "s6_3"], pre=[0, 8, 60, 8], tail=20),
    dict(lead=12, ids=["s7_0", "s7_1", "s7_2"], pre=[0, 8, 2], tail=60),
    dict(lead=12, ids=["s8_0", "s8_1", "s8_2"], pre=[0, 10, 14], tail=65),
]

timing = {"fps": FPS, "scenes": []}
t0 = 0
voice_events = []
for sc in SCENES:
    f = sc["lead"]
    cues = []
    for i, (lid, pre) in enumerate(zip(sc["ids"], sc["pre"])):
        f += pre
        d = int(np.ceil(dur[lid] * FPS))
        cues.append({"id": lid, "at": f, "dur": d, "text": lines[lid]})
        voice_events.append(((t0 + f) / FPS, lid))
        f += d
    f += sc["tail"]
    timing["scenes"].append({"start": t0, "dur": f, "cues": cues})
    t0 += f
timing["total"] = t0
os.makedirs(f"{ROOT}/src/aviones", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/aviones/timing.json", "w"), ensure_ascii=False, indent=1)
T = t0 / FPS
print(f"duración total {T:.1f} s ({t0} fotogramas)")

# ---------------- Voz ----------------
voice = np.zeros(int(T * SR) + SR)
for t, lid in voice_events:
    x, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    if x.ndim > 1:
        x = x.mean(1)
    x = soxr.resample(x, sr, SR)
    i = int(t * SR)
    voice[i : i + len(x)] += x[: len(voice) - i]
voice = sfx.compress(voice, thr=0.3, ratio=3)
voice = voice / (np.abs(voice).max() + 1e-9) * 0.85

# Envolvente de la voz para atenuar la música mientras se habla (ducking)
win = int(0.05 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speaking = (env > 0.02).astype(float)
k = int(0.35 * SR)
speaking = np.convolve(speaking, np.ones(k) / k, mode="same").clip(0, 1)

# ---------------- Música ----------------
# Re mayor, 96 ppm. Progresión I–V–vi–IV (D–A–Bm–G), un acorde por compás.
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [
    ("D", ["D3", "F#3", "A3"], "D2", ["D4", "A4", "D5", "F#5", "A4", "D5", "F#5", "A5"]),
    ("A", ["C#3", "E3", "A3"], "A1", ["A3", "E4", "A4", "C#5", "E4", "A4", "C#5", "E5"]),
    ("Bm", ["D3", "F#3", "B3"], "B1", ["B3", "F#4", "B4", "D5", "F#4", "B4", "D5", "F#5"]),
    ("G", ["D3", "G3", "B3"], "G1", ["G3", "D4", "G4", "B4", "D4", "G4", "B4", "D5"]),
]
sc_start = [s["start"] / FPS for s in timing["scenes"]]
takeoff_start = sc_start[6]
summary_start = sc_start[7]

S.seed(7)
events = []
nbars = int(np.ceil(T / BAR))
end_bar = int((T - 5) / BAR)  # el último compás resuelve en Re
for b in range(nbars):
    t = b * BAR
    if t > T - 1:
        break
    name, pad, bass, arp = CHORDS[b % 4] if b < end_bar else CHORDS[0]
    intense = takeoff_start - BAR <= t < summary_start
    final = b >= end_bar
    # colchón de cuerdas
    for p in pad:
        events.append(dict(t=t, inst="violas" if p[-1] == "3" else "cellos", pitch=p, dur=BAR + 0.3,
                           vel=0.42 if intense else 0.32, pan=-0.3, attack=0.6))
    if final:
        events.append(dict(t=t, inst="cellos", pitch="D2", dur=5.5, vel=0.4, pan=0, attack=0.5))
        events.append(dict(t=t, inst="violins", pitch="F#4", dur=5.5, vel=0.32, pan=0.3, attack=0.8))
        events.append(dict(t=t, inst="piano", pitch="D4", dur=5, vel=0.4, pan=0))
        events.append(dict(t=t, inst="piano", pitch="A4", dur=5, vel=0.35, pan=0.1))
        events.append(dict(t=t, inst="piano", pitch="F#5", dur=5, vel=0.35, pan=0.2))
        break
    # arpegio de piano en corcheas (desde el segundo compás)
    if b >= 1:
        for i, p in enumerate(arp):
            events.append((t + i * BEAT / 2, "piano", p, BEAT * 0.9, 0.30 + 0.08 * (i % 4 == 0), 0.15))
    # contrabajo en pizzicato a partir de la escena 2
    if t >= sc_start[1]:
        events.append((t, "contrabass_pizz", bass, BEAT, 0.5, 0))
        events.append((t + 2 * BEAT, "contrabass_pizz", bass, BEAT, 0.4, 0))
    # violines en el despegue: notas largas que suben
    if intense:
        top = {"D": "A5", "A": "C#6", "Bm": "D6", "G": "B5"}[name]
        events.append(dict(t=t, inst="violins", pitch=top, dur=BAR + 0.2, vel=0.38, pan=0.35, attack=0.4))
music = S.render(events, dur=T + 1)
music = S.room(music, size=0.5, mix=0.22)
music = music / (np.abs(music).max() + 1e-9)

# fundido inicial y final
fade = np.ones(len(music))
fi = int(0.6 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fo = int(2.5 * SR)
fade[-fo:] = np.linspace(1, 0, fo)
music *= fade[:, None]

duck = 0.30 - 0.17 * speaking[: len(music)]
if len(duck) < len(music):
    duck = np.pad(duck, (0, len(music) - len(duck)), constant_values=0.3)
music *= duck[:, None]

# ---------------- Efectos ----------------
fxbuf = np.zeros((len(music), 2))
for i, s in enumerate(sc_start[1:], 1):
    sfx.add(fxbuf, sfx.whoosh(0.45, 0.5), max(0, s - 0.25), gain=0.22, pan=0.0)
# motores en el despegue: ruido sordo que crece
sc7 = timing["scenes"][6]
lift_f = sc7["cues"][2]["at"] + int(sc7["cues"][2]["dur"] * 0.55)
roar_len = (sc7["dur"] - sc7["cues"][0]["at"]) / FPS
r = sfx.roar(roar_len, 0.8)
r *= np.linspace(0.2, 1, len(r)) ** 1.5
r[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
sfx.add(fxbuf, r, takeoff_start + sc7["cues"][0]["at"] / FPS, gain=0.16, pan=0)
timing["scenes"][6]["liftoff"] = lift_f
json.dump(timing, open(f"{ROOT}/src/aviones/timing.json", "w"), ensure_ascii=False, indent=1)

# ---------------- Mezcla ----------------
n = len(music)
v = np.pad(voice, (0, max(0, n - len(voice))))[:n]
mix = music + fxbuf + np.stack([v, v], 1) * 0.95
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/aviones", exist_ok=True)
sf.write(f"{ROOT}/public/aviones/mix.wav", mix[: int(T * SR)].astype(np.float32), SR)
print("mezcla escrita en public/aviones/mix.wav")
print("créditos:", S.credits(["piano", "violas", "cellos", "violins", "contrabass_pizz"]))

# ---------------- Volumen para redes: -14 LUFS, pico -1 dBTP (dos pasadas de loudnorm de ffmpeg) ----------------
import subprocess, re as _re  # noqa: E402

wav = f"{ROOT}/public/aviones/mix.wav"
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(_re.search(r"\{[^{}]*\}", probe[probe.rfind("Parsed_loudnorm"):], _re.S).group(0))
tmp = wav + ".tmp.wav"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af",
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "-c:a", "pcm_f32le", tmp], check=True)
os.replace(tmp, wav)
print(f"volumen normalizado: {m['input_i']} LUFS -> -14 LUFS")
