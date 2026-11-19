"""Reel «Catorce llamadas perdidas» (acoso laboral) para Acta.

Tres voces de Microsoft Edge (Ximena = Lucía y narradora, Álvaro = el jefe, Elvira = su hermana) con
interpretación por frase (ritmo, tono y volumen), sonido de teléfono en las llamadas, nota de voz para la hermana,
respiraciones, latido, vibración del móvil, grifo del baño y pitidos de fin de llamada.
Música sobria con piano (Salamander) y cuerdas (VSCO 2 CE): tensión, silencio en la llamada y esperanza al final.

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python audio/acta6/build.py ~/lemo-opuscar
Salidas: src/acta6/timing.json, public/acta6/mix.wav
"""
import sys, os, json, re, subprocess, unicodedata, difflib
import numpy as np
import soundfile as sf

LIB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/lemo-opuscar")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
sys.path.insert(0, os.path.dirname(HERE))
from core.audio import sampler as S  # noqa: E402
from core.audio import sfx  # noqa: E402
import synth as Y  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS, SR = 30, Y.SR
L = {l["id"]: l for l in json.load(open(f"{HERE}/lines.json", encoding="utf-8"))}
dur = json.load(open(f"{HERE}/voice/dur.json"))
edge_words = json.load(open(f"{HERE}/voice/words.json", encoding="utf-8"))
WHO = {"n": "narr", "b": "boss", "l": "lucia", "s": "ana"}

SCENES = [
    dict(name="hook", ids=["n1"], lead=0.5, gaps=[], tail=0.6),
    dict(name="context", ids=["n2"], lead=0.3, gaps=[], tail=0.7),
    dict(name="call", ids=["b1", "l1", "b2", "l2"], lead=1.3, gaps=[0.5, 0.7, 1.6], tail=1.9),
    dict(name="after", ids=["n3"], lead=0.9, gaps=[], tail=1.0),
    dict(name="sister", ids=["s1"], lead=0.5, gaps=[], tail=0.7),
    dict(name="turn", ids=["n4"], lead=0.3, gaps=[], tail=0.4),
    dict(name="search", ids=["n5"], lead=0.25, gaps=[], tail=0.7),
    dict(name="calm", ids=["n6"], lead=0.25, gaps=[], tail=1.0),
    dict(name="help", ids=["n7"], lead=0.3, gaps=[], tail=0.6),
    dict(name="end", ids=["n8"], lead=0.3, gaps=[], tail=3.0),
]

norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode())


def caption_words(lid):
    toks = L[lid]["text"].split()
    ew = edge_words[lid]
    a = [norm(t) for t in toks]
    b = [norm(w["w"]) for w in ew]
    times = [None] * len(toks)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = ew[j1 + k]["t"]
        elif op == "replace":
            n, m = i2 - i1, j2 - j1
            for k in range(n):
                times[i1 + k] = ew[j1 + min(m - 1, int(k * m / n))]["t"]
    last = 0.0
    for i, t in enumerate(times):
        if t is None:
            times[i] = last
        else:
            last = t
    return [{"w": tk, "t": t} for tk, t in zip(toks, times)]


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
        cues.append({"id": lid, "who": WHO[lid[0]], "at": round(x * FPS), "dur": round(d * FPS), "text": L[lid]["text"],
                     "words": [{"w": w["w"], "at": round((x + w["t"]) * FPS)} for w in caption_words(lid)]})
        voice_at.append((t + x, lid, d))
        x += d
    x += sc["tail"]
    timing["scenes"].append({"name": sc["name"], "start": round(t * FPS), "dur": round(x * FPS), "cues": cues})
    t += x
T = t
timing["total"] = round(T * FPS)
st = {s["name"]: s["start"] / FPS for s in timing["scenes"]}
v_at = {lid: a for a, lid, d in voice_at}
v_end = {lid: a + d for a, lid, d in voice_at}


def word_t(lid, prefix):
    for w in edge_words[lid]:
        if norm(w["w"]).startswith(prefix):
            return v_at[lid] + w["t"]
    raise KeyError(prefix)


ev = {
    "buzz1": 0.12, "msg1": 0.9, "msg2": 2.0, "msg3": 3.2,
    "call_start": v_at["b1"] - 0.9,
    "call_end": v_end["l2"] + 0.9,
    "paro": word_t("n5", "busque"), "nueve": word_t("n5", "nueve"), "fechas": word_t("n5", "fechas"),
    "silencio": word_t("n6", "silencio"), "abogada": word_t("n6", "abogada"),
}
timing["events"] = {k: round(v * FPS) for k, v in ev.items()}
os.makedirs(f"{ROOT}/src/acta6", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/acta6/timing.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {T:.1f} s ({timing['total']} fotogramas)")

N = int((T + 1) * SR)
fx, sub = np.zeros((N, 2)), np.zeros((N, 2))
# ---------- sonido ambiente y efectos ----------
Y.put(sub, np.stack([Y.room_tone(T, 0.05)] * 2, 1)[:, 0], 0, 1.0)
for k, at in enumerate((ev["buzz1"], 1.4 + 0.3, 2.6 + 0.2)):
    Y.put(fx, Y.vibrate(3 if k == 0 else 2), at, 0.5)
for m in ("msg1", "msg2", "msg3"):
    Y.put(fx, Y.ping(86 + 2 * ("msg2 msg3".split().count(m))), ev[m], 0.28)
# respiraciones antes de los párrafos de la narradora
for lid in ("n1", "n3", "n4", "n6"):
    Y.put(fx, Y.breath(0.4), v_at[lid] - 0.42, 0.07)
# la llamada: se descuelga, latido que se acelera, fin con pitidos
Y.put(fx, Y.click_soft(), ev["call_start"] + 0.3, 0.5)
beat_t = ev["call_start"] + 0.5
bpm = 74
while beat_t < ev["call_end"] - 0.6:
    Y.put(fx, sfx.heartbeat(1.0), beat_t, 0.28 + 0.12 * (beat_t - ev["call_start"]) / (ev["call_end"] - ev["call_start"]))
    beat_t += 60 / bpm
    bpm = min(112, bpm + 1.4)
Y.put(fx, Y.busy_beeps(3), v_end["l2"] + 0.35, 0.22)
# baño: el grifo
Y.put(fx, Y.water_tap(6.0), v_at["n3"] + 2.0, 0.07)
# nota de voz de la hermana
Y.put(fx, Y.ping(90), st["sister"] + 0.1, 0.22)
# búsqueda en Acta
for j in range(5):
    Y.put(fx, Y.tick(), ev["paro"] + 0.9 + j * 0.1, 0.22)
Y.put(fx, Y.chime((79, 83, 86)), ev["nueve"] + 0.3, 0.32)
Y.put(fx, Y.mute_thunk(), ev["silencio"] + 0.35, 0.5)
for s in ("context", "after", "sister", "turn", "calm", "help", "end"):
    Y.put(fx, sfx.whoosh(0.35, 1.0), st[s] - 0.15, 0.07)

# ---------- música: piano y cuerdas ----------
S.seed(11)
ev_m = []


def piano(t0, notes, step, vel=0.3, pan=0.0):
    for i, p in enumerate(notes):
        ev_m.append(dict(t=t0 + i * step, inst="piano", pitch=p, dur=step * 2.2, vel=vel, pan=pan))


tense_end = ev["call_start"]
# 1) gancho y contexto: piano disperso y un grave que no se resuelve
cm = [("A2", ["A3", "C4", "E4", "C4"]), ("F2", ["F3", "A3", "C4", "A3"]), ("C3", ["E3", "G3", "C4", "G3"]), ("G2", ["D3", "G3", "B3", "G3"])]
tb, k = 0.0, 0
while tb < tense_end - 1.0:
    root, arp = cm[k % 4]
    ev_m.append(dict(t=tb, inst="cellos", pitch=root, dur=4.6, vel=0.32, pan=-0.2, attack=0.8))
    piano(tb + 0.3, arp, 1.1, 0.26 + 0.02 * k, 0.15)
    tb += 4.4
    k += 1
# 2) llamada: solo un grave que crece (casi silencio para que mande la voz)
ev_m.append(dict(t=ev["call_start"], inst="contrabass", pitch="A1", dur=ev["call_end"] - ev["call_start"] + 0.5, vel=0.34, pan=0, attack=1.5))
ev_m.append(dict(t=ev["call_start"] + 4, inst="cellos", pitch="A2", dur=ev["call_end"] - ev["call_start"] - 3, vel=0.24, pan=-0.2, attack=2.5))
# 3) después de colgar: una nota cada vez
for i, p in enumerate(["E4", "C4", "A3", "E3", "D4", "A3"]):
    ev_m.append(dict(t=st["after"] + 0.6 + i * 1.5, inst="piano", pitch=p, dur=3.0, vel=0.22, pan=0.1))
ev_m.append(dict(t=st["after"] + 0.4, inst="cellos", pitch="F2", dur=8.0, vel=0.26, pan=-0.2, attack=1.2))
# 4) la hermana: casi nada
ev_m.append(dict(t=st["sister"] + 0.2, inst="piano", pitch="C4", dur=3.0, vel=0.18))
# 5) giro: esperanza (Do mayor)
hp_ = [("C3", ["G3", "C4", "E4", "G4"], "E5"), ("G2", ["G3", "B3", "D4", "G4"], "D5"), ("A2", ["A3", "C4", "E4", "A4"], "C5"), ("F2", ["F3", "A3", "C4", "F4"], "A4")]
tb, k = st["turn"], 0
while tb < st["end"] + 3.0:
    root, arp, top = hp_[k % 4]
    vel = min(0.42, 0.26 + 0.03 * k)
    ev_m.append(dict(t=tb, inst="cellos", pitch=root, dur=4.4, vel=vel, pan=-0.25, attack=0.6))
    ev_m.append(dict(t=tb + 0.1, inst="violins", pitch=top, dur=4.4, vel=vel * 0.8, pan=0.25, attack=1.0))
    piano(tb, arp + arp[::-1][1:3], 0.55, 0.28 + 0.02 * k, 0.1)
    tb += 4.4
    k += 1
ev_m.append(dict(t=st["end"] + 0.5, inst="piano", pitch="C4", dur=6, vel=0.4))
ev_m.append(dict(t=st["end"] + 0.5, inst="piano", pitch="E4", dur=6, vel=0.34, pan=0.1))
ev_m.append(dict(t=st["end"] + 0.5, inst="piano", pitch="G4", dur=6, vel=0.34, pan=0.2))
music = S.render(ev_m, dur=T + 1)
music = S.room(music, size=0.55, mix=0.28)
music = music / (np.abs(music).max() + 1e-9)
# la música desaparece mientras habla el jefe y vuelve con la esperanza
gain = np.ones(N)
c0, c1 = int(ev["call_start"] * SR), int(ev["call_end"] * SR)
gain[c0:c1] = 0.5
music = music[:N] * gain[: len(music), None] if len(music) >= N else np.pad(music, ((0, N - len(music)), (0, 0))) * gain[:, None]

# ---------- voces ----------
narr, bossv, lucv, anav = (np.zeros(N) for _ in range(4))
for at, lid, d in voice_at:
    v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    i = int(at * SR)
    tgt = {"n": narr, "b": bossv, "l": lucv, "s": anav}[lid[0]]
    tgt[i : i + len(v)] += v[: N - i]
# narradora: cercana, íntima
narr = Y.hp(narr, 80)
narr = narr + 0.18 * Y.bp(narr, 140, 320) + 0.12 * Y.bp(narr, 2500, 5000)
narr = sfx.compress(narr, thr=0.2, ratio=3.5)
narr /= np.abs(narr).max() + 1e-9
# llamada: el jefe por el altavoz del móvil y Lucía en voz baja
bossv = Y.phone_eq(bossv) * 0.9 if np.abs(bossv).max() > 0 else bossv
lucv = Y.phone_eq(lucv) * 0.7 if np.abs(lucv).max() > 0 else lucv
line_noise = Y.hp(Y.rng.standard_normal(N), 3500) * 0.004
callmask = np.zeros(N)
callmask[c0:c1] = 1
line_noise *= callmask
# hermana: nota de voz
anav = Y.bp(anav, 160, 7000)
anav = sfx.compress(anav, thr=0.2, ratio=3)
anav = anav / (np.abs(anav).max() + 1e-9) * 0.85
voice = narr * 0.95 + bossv + lucv + anav + line_noise
voice_st = S.room(np.stack([voice, voice], 1).astype(np.float32), size=0.1, mix=0.04)
win = int(0.04 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same").clip(0, 1)
duck = 1 - 0.6 * speak
mix = music * 0.55 * duck[:, None] + (fx + sub) * (1 - 0.25 * speak)[:, None] + voice_st * 0.95
fo = int(1.8 * SR)
mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
mix = mix[: int(T * SR)]
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/acta6", exist_ok=True)
wav = f"{ROOT}/public/acta6/mix.wav"
sf.write(wav, mix.astype(np.float32), SR)
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\}", probe[probe.rfind("Parsed_loudnorm"):], re.S).group(0))
tmp = wav + ".tmp.wav"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af",
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "-c:a", "pcm_f32le", tmp], check=True)
os.replace(tmp, wav)
print(f"mezcla: {m['input_i']} LUFS -> -14 LUFS")
print("créditos:", S.credits(["piano", "cellos", "violins", "contrabass"]))
