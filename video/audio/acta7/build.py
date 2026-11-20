"""Reel «Me dijeron que era gratis» (promesa telefónica + penalización) para Acta.

Voces de Microsoft Edge: Ximena (Marta y narradora), Álvaro (comercial), Elvira (atención al cliente), con ritmo, tono y
volumen por frase, voz de teléfono en las llamadas y el audio rescatado de Acta con otro filtro. Música ligera:
plucks con tensión, jingle de espera, y un beat optimista cuando llega la prueba.

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python -I audio/acta7/build.py ~/lemo-opuscar
Salidas: src/acta7/timing.json, public/acta7/mix.wav
"""
import sys, os, json, re, subprocess, unicodedata, difflib
import numpy as np
import soundfile as sf

LIB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/lemo-opuscar")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
sys.path.insert(0, os.path.dirname(HERE))
from core.audio import sampler as S  # noqa: E402,F401
from core.audio import sfx  # noqa: E402
import synth as Y  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS, SR = 30, Y.SR
L = {l["id"]: l for l in json.load(open(f"{HERE}/lines.json", encoding="utf-8"))}
dur = json.load(open(f"{HERE}/voice/dur.json"))
edge_words = json.load(open(f"{HERE}/voice/words.json", encoding="utf-8"))
WHO = {"n": "narr", "m": "marta", "a": "jorge", "e": "atn"}

SCENES = [
    dict(name="hook", ids=["n1"], lead=0.45, gaps=[], tail=0.5),
    dict(name="context", ids=["n2"], lead=0.3, gaps=[], tail=0.6),
    dict(name="promise", ids=["m1", "a1"], lead=1.0, gaps=[0.35], tail=0.9),
    dict(name="bill", ids=["n3"], lead=0.3, gaps=[], tail=1.0),
    dict(name="complaint", ids=["m2", "e1", "m3", "e2"], lead=2.4, gaps=[0.5, 0.6, 0.5], tail=1.8),
    dict(name="after", ids=["n4"], lead=0.4, gaps=[], tail=0.5),
    dict(name="search", ids=["n5"], lead=0.25, gaps=[], tail=0.5),
    dict(name="proof", ids=["a3"], lead=0.6, gaps=[], tail=0.9),
    dict(name="win", ids=["n6"], lead=0.3, gaps=[], tail=0.9),
    dict(name="end", ids=["n7"], lead=0.3, gaps=[], tail=3.6),
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
    "n1": 0.1, "ping1": 0.9, "ping2": 1.7, "ping3": 2.5,
    "call1_start": v_at["m1"] - 0.7, "call1_end": v_end["a1"] + 0.55,
    "call2_start": st["complaint"] + 0.15, "call2_pick": v_at["m2"] - 0.55, "call2_end": v_end["e2"] + 0.5,
    "bill_total": word_t("n3", "312") if False else v_at["n3"] + 2.3,
    "acorde": word_t("n4", "acord"), "busque": word_t("n5", "busque"), "ahi": word_t("n5", "ahi"),
    "devol": word_t("n6", "devolv"), "sigue": word_t("n7", "siguenos"), "comparte": word_t("n7", "comparte"),
}
timing["events"] = {k: round(v * FPS) for k, v in ev.items()}
os.makedirs(f"{ROOT}/src/acta7", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/acta7/timing.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {T:.1f} s ({timing['total']} fotogramas)")

N = int((T + 1) * SR)
fx, sub = np.zeros((N, 2)), np.zeros((N, 2))
# ---------- ambiente y efectos ----------
Y.put(sub, np.stack([Y.room_tone(T, 0.04)] * 2, 1)[:, 0], 0, 1.0)
Y.put(fx, Y.vibrate(3), ev["n1"], 0.5)
for k in ("ping1", "ping2", "ping3"):
    Y.put(fx, Y.ping(84 + 3 * int(k[-1])), ev[k], 0.26)
for lid in ("n1", "n4", "n6"):
    Y.put(fx, Y.breath(0.35), v_at[lid] - 0.38, 0.05)
# llamadas
Y.put(fx, Y.click_soft(), ev["call1_start"] + 0.2, 0.45)
Y.put(fx, Y.busy_beeps(2), ev["call1_end"], 0.16)
Y.put(fx, Y.click_soft(), ev["call2_pick"], 0.45)
Y.put(fx, Y.busy_beeps(3), v_end["e2"] + 0.25, 0.2)
Y.put(fx, Y.sad_trombone(), v_end["e2"] + 1.0, 0.16)
# música de espera (jingle cutre por teléfono) mientras Marta espera a que descuelguen
hold = np.zeros((int(3.0 * SR), 2))
for i, m in enumerate([72, 76, 79, 76, 72, 77, 81, 77, 74, 78, 81, 78]):
    Y.put(hold, Y.rhodes(m, 0.5), i * 0.2, 0.6)
holdm = Y.phone_eq(hold[:, 0]) * 0.55
Y.put(fx, holdm, st["complaint"] + 0.0, 0.5)
Y.put(fx, Y.chime((76, 79)), ev["call2_pick"] - 0.12, 0.18)
# bote del dinero y búsqueda
Y.put(fx, Y.hit(), ev["bill_total"], 0.22)
for j in range(8):
    Y.put(fx, Y.tick(), ev["busque"] + 0.5 + j * 0.09, 0.2)
Y.put(fx, Y.riser(0.9), ev["ahi"] - 0.75, 0.2)
Y.put(fx, Y.chime((79, 83, 86, 91)), ev["ahi"] + 0.05, 0.34)
Y.put(fx, Y.chime((81, 86, 90)), ev["devol"] + 0.35, 0.34)
Y.put(fx, Y.bell(96, 1.2), ev["devol"] + 0.5, 0.2)
Y.put(fx, Y.ping(95), ev["sigue"] + 0.1, 0.24)
Y.put(fx, Y.ping(91), ev["comparte"] + 0.1, 0.24)
for s in ("context", "promise", "bill", "complaint", "after", "search", "proof", "win", "end"):
    Y.put(fx, sfx.whoosh(0.3, 1.0), st[s] - 0.12, 0.06)

# ---------- música ----------
BPM = 98
BEAT = 60 / BPM
BAR = 4 * BEAT
music = np.zeros((N, 2))
# A) hook → bill: plucks en La menor, algo inquietantes
am = [(45, [57, 60, 64, 60]), (41, [53, 57, 60, 57]), (48, [55, 60, 64, 60]), (43, [55, 59, 62, 59])]
tb, k = 0.0, 0
while tb < ev["call2_start"] - 0.1:
    root, arp = am[k % 4]
    Y.put(music, Y.sub_drone(root, BAR * 1.05), tb, 0.35)
    for i in range(8):
        Y.put(music, Y.pluck(arp[i % 4] + (12 if i % 4 == 3 else 0), 0.3, 0.09), tb + i * BEAT / 2, 0.18, 0.2 * (1 if i % 2 else -1))
    tb += BAR
    k += 1
# B) llamada de queja: un drone y casi nada
Y.put(music, Y.sub_drone(33, ev["call2_end"] - ev["call2_pick"] + 1.2), ev["call2_pick"], 0.33)
# C) después: notas sueltas
for i, m in enumerate([69, 64, 60, 57]):
    Y.put(music, Y.rhodes(m, 1.5), st["after"] + 0.3 + i * 0.9, 0.2)
# D) búsqueda: pulso que sube
tb = st["search"]
for i in range(int((ev["ahi"] - st["search"]) / BEAT)):
    Y.put(music, Y.tick(), tb + i * BEAT, 0.14)
# E) a partir de la prueba: beat optimista en Do mayor
drums, bass, chords = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2))
prog = [(48, (60, 64, 67)), (43, (59, 62, 67)), (45, (57, 60, 64)), (41, (60, 65, 69))]
b0 = ev["ahi"] + 0.05
tb, k = b0, 0
while tb < T - 0.5:
    root, notes = prog[k % 4]
    chord = Y.lp(sum(Y.supersaw(m, BAR) + 0.5 * Y.supersaw(m + 12, BAR) for m in notes) / 4, 4200)
    Y.put(chords, chord, tb, 0.28)
    Y.put(bass, Y.bass808(root, BAR * 0.9), tb, 0.55)
    for q in range(4):
        Y.put(drums, Y.kick(), tb + q * BEAT, 0.8 if q % 2 == 0 else 0.5)
        Y.put(drums, Y.hat(q == 3), tb + q * BEAT + BEAT / 2, 0.13, 0.3)
        if q in (1, 3):
            Y.put(drums, Y.clap(), tb + q * BEAT, 0.3)
    for i in range(8):
        Y.put(music, Y.pluck(notes[i % 3] + 12 + (12 if i % 4 == 3 else 0), 0.26, 0.07), tb + i * BEAT / 2, 0.14, -0.3 + 0.6 * (i % 2))
    tb += BAR
    k += 1
Y.put(drums, Y.crash(), b0, 0.3)
Y.put(drums, Y.crash(), st["end"], 0.22)
# duck de los acordes con el bombo
kick_env = np.zeros(N)
tb = b0
while tb < T:
    i = int(tb * SR)
    n = int(0.22 * SR)
    kick_env[i : i + n] = np.maximum(kick_env[i : i + n], np.exp(-np.arange(min(n, N - i)) / (0.07 * SR)))
    tb += BEAT
chords *= (1 - 0.55 * kick_env)[:, None]
music = music + drums + bass + chords
music = music / (np.abs(music).max() + 1e-9)
gain = np.ones(N)
c0, c1 = int(ev["call2_pick"] * SR), int(ev["call2_end"] * SR)
gain[c0:c1] = 0.55
music = music * gain[:, None]

# ---------- voces ----------
buses = {k: np.zeros(N) for k in "nmae"}
for at, lid, d in voice_at:
    v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    i = int(at * SR)
    buses[lid[0]][i : i + len(v)] += v[: N - i]
narr = Y.hp(buses["n"], 80)
narr = narr + 0.15 * Y.bp(narr, 140, 320) + 0.12 * Y.bp(narr, 2500, 5000)
narr = sfx.compress(narr, thr=0.2, ratio=3.5)
narr /= np.abs(narr).max() + 1e-9
mart = buses["m"]
mart = Y.phone_eq(mart) * 0.75 if np.abs(mart).max() > 0 else mart
atn = buses["e"]
atn = Y.phone_eq(atn) * 0.9 if np.abs(atn).max() > 0 else atn
# comercial: llamada (a1) con eq de teléfono; el audio rescatado (a3) con banda más ancha y algo de sala
jor = np.zeros(N)
for at, lid, d in voice_at:
    if lid[0] != "a":
        continue
    v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    v = Y.phone_eq(v) * 0.9 if lid == "a1" else sfx.compress(Y.bp(v, 220, 5200), thr=0.2, ratio=3) * 1.0
    v = v / (np.abs(v).max() + 1e-9) * 0.9
    i = int(at * SR)
    jor[i : i + len(v)] += v[: N - i]
voice = narr * 0.95 + mart + atn + jor
voice_st = S.room(np.stack([voice, voice], 1).astype(np.float32), size=0.1, mix=0.04)
win = int(0.04 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same").clip(0, 1)
duck = 1 - 0.55 * speak
mix = music * 0.5 * duck[:, None] + (fx + sub) * (1 - 0.2 * speak)[:, None] + voice_st * 0.95
fo = int(1.8 * SR)
mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
mix = mix[: int(T * SR)]
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/acta7", exist_ok=True)
wav = f"{ROOT}/public/acta7/mix.wav"
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
