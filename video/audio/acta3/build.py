"""Reel «el casero y la fianza» de Acta.

Voces: Microsoft Edge (audio/edge_voice.py) con tiempos por palabra.
Música a 140 ppm en cuatro partes: gancho (808 + «dun dun»), recuerdo (lo-fi con vinilo),
conflicto (trap oscuro) y drop de future bass justo en la palabra «Acta».

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python audio/acta3/build.py ~/lemo-opuscar
Salidas: src/acta3/timing.json, public/acta3/mix.wav
"""
import sys, os, json, re, subprocess, unicodedata
import numpy as np
import soundfile as sf

LIB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/lemo-opuscar")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
sys.path.insert(0, os.path.dirname(HERE))
from core.audio import sampler as S  # noqa: E402  (reverb)
from core.audio import sfx  # noqa: E402
import synth as Y  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS, SR, BPM = 30, Y.SR, 140
BEAT = 60 / BPM
BAR = 4 * BEAT

L = {l["id"]: l for l in json.load(open(f"{HERE}/lines.json", encoding="utf-8"))}
dur = json.load(open(f"{HERE}/voice/dur.json"))
edge_words = json.load(open(f"{HERE}/voice/words.json", encoding="utf-8"))
AGENT = {"l1", "l2"}

SCENES = [
    dict(name="hook", ids=["n1", "n2"], lead=0.05, gaps=[0.15], tail=0.45),
    dict(name="flash", ids=["n3", "n4"], lead=0.25, gaps=[0.2], tail=0.35),
    dict(name="conflict", ids=["n5", "l1", "n6"], lead=0.15, gaps=[0.3, 0.35], tail=0.3),
    dict(name="turn", ids=["n7"], lead=0.15, gaps=[], tail=0.55),
    dict(name="search", ids=["n8", "l2"], lead=0.2, gaps=[0.35], tail=0.45),
    dict(name="win", ids=["n9"], lead=0.2, gaps=[], tail=0.7),
    dict(name="how", ids=["n10"], lead=0.2, gaps=[], tail=0.6),
    dict(name="end", ids=["n11"], lead=0.3, gaps=[], tail=2.6),
]

norm = lambda s: re.sub(r"[^\w]", "", unicodedata.normalize("NFC", s.lower()))
REPL = [
    (["mil", "doscientos", "euros"], "1.200 €"),
    (["catorce", "de", "marzo"], "14 de marzo"),
    (["uno", "cuarenta", "y", "dos"], "1:42"),
]


def caption_words(lid):
    """tokens del texto (con puntuación) emparejados con los tiempos de Edge, y números en cifras"""
    toks = L[lid]["text"].split()
    ew = edge_words[lid]
    out, j, last = [], 0, 0.0
    for tk in toks:
        n = norm(tk)
        k = j
        while k < len(ew) and norm(ew[k]["w"]) != n:
            k += 1
        if k < len(ew):
            last, j = ew[k]["t"], k + 1
        out.append({"w": tk, "t": last})
    i, res = 0, []
    while i < len(out):
        done = False
        for seq, rep in REPL:
            ws = [norm(o["w"]) for o in out[i : i + len(seq)]]
            if ws == seq:
                tail = re.sub(r"^[\w€]+", "", out[i + len(seq) - 1]["w"].lstrip("«¿¡"))
                res.append({"w": rep + re.sub(r"[\w]", "", tail), "t": out[i]["t"]})
                i += len(seq)
                done = True
                break
        if not done:
            res.append(out[i])
            i += 1
    return res


timing = {"fps": FPS, "bpm": BPM, "scenes": []}
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
            "id": lid, "at": round(x * FPS), "dur": round(d * FPS), "text": L[lid]["text"], "agent": lid in AGENT,
            "words": [{"w": w["w"], "at": round((x + w["t"]) * FPS)} for w in caption_words(lid)],
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
by = {s["name"]: s for s in timing["scenes"]}
v_at = {lid: a for a, lid in voice_at}


def word_t(lid, prefix):
    for w in edge_words[lid]:
        if norm(w["w"]).startswith(prefix):
            return v_at[lid] + w["t"]
    raise KeyError(prefix)


ev = {
    "hit1": word_t("n2", "no"),
    "hit2": word_t("n2", "esperaba"),
    "flash": st["flash"],
    "l1": v_at["l1"],
    "l1_end": v_at["l1"] + dur["l1"],
    "drop": word_t("n7", "acta"),
    "l2": v_at["l2"],
    "l2_end": v_at["l2"] + dur["l2"],
    "refund": word_t("n9", "devuelta"),
    "end_hit": st["end"] + 2 * BAR,
}
timing["events"] = {k: round(v * FPS) for k, v in ev.items()}
os.makedirs(f"{ROOT}/src/acta3", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/acta3/timing.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {T:.1f} s ·", {k: round(v, 2) for k, v in ev.items()})

N = int((T + 1) * SR)
drums, mel, bass, fx = (np.zeros((N, 2)) for _ in range(4))
pump = np.ones(N)


def duck_kick(at):
    i = int(at * SR)
    n = min(int(0.32 * SR), N - i)
    if n > 0:
        pump[i : i + n] = np.minimum(pump[i : i + n], 0.3 + 0.7 * (np.arange(n) / n) ** 0.6)


def bars(t0, t1):
    b = t0
    while b < t1 - 0.05:
        yield b
        b += BAR


# ---- 1. Gancho: 808 + bombo + hi-hats, cuerdas oscuras, «dun dun» ----
for k, b in enumerate(bars(0, ev["hit1"])):
    Y.put(drums, Y.kick(), b, 0.85)
    Y.put(bass, Y.bass808(36, BAR * 0.9), b, 0.75)
    for s in range(8):
        Y.put(drums, Y.hat(), b + s * BEAT / 2, 0.12 if s % 2 else 0.2, 0.3)
    if k % 2 == 1:
        Y.put(drums, Y.snare(), b + 2 * BEAT, 0.45)
    pad = Y.lp(sum(Y.supersaw(m, BAR) for m in (48, 51, 55)) / 3, 1200)
    Y.put(mel, pad, b, 0.3)
Y.put(fx, Y.riser(max(0.5, ev["hit1"] - 0.3)), 0.3, 0.12)
for h in ("hit1", "hit2"):
    Y.put(fx, Y.hit(), ev[h], 0.9)

# ---- 2. Recuerdo: lo-fi con Rhodes y vinilo ----
lofi = np.zeros((N, 2))
LOFI = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
Y.put(fx, Y.downlifter(0.6), ev["flash"] - 0.45, 0.25)
for k, b in enumerate(bars(st["flash"], st["conflict"])):
    ch = LOFI[k % 4]
    for i, m in enumerate(ch):
        Y.put(lofi, Y.rhodes(m, BAR * 1.1), b + i * 0.012, 0.18, -0.2 + 0.13 * i)
    Y.put(lofi, Y.kick(0.5), b, 0.6)
    Y.put(lofi, Y.kick(0.5), b + 1.5 * BEAT, 0.45)
    Y.put(lofi, Y.snare(), b + 2 * BEAT, 0.3)
    for s in range(4):
        Y.put(lofi, Y.hat(), b + s * BEAT + BEAT / 2, 0.08, 0.3)
    Y.put(lofi, Y.bass_note(ch[0] - 12, BAR * 0.8, 400), b, 0.35)
lofi = np.stack([Y.lp(lofi[:, c], 2800) for c in range(2)], 1)
cr = Y.crackle(st["conflict"] - st["flash"])
Y.put(lofi, cr, st["flash"], 0.35)
mel += lofi

# ---- 3. Conflicto: trap oscuro en Do menor ----
TRAP = [(36, [48, 51, 55]), (32, [44, 48, 51]), (29, [41, 44, 48]), (31, [43, 47, 50])]  # Cm Ab Fm G
MOTIF = [72, 75, 79, 77, 75, 72, 70, 72]
for k, b in enumerate(bars(st["conflict"], st["turn"])):
    root, ch = TRAP[k % 4]
    Y.put(drums, Y.kick(), b, 0.9)
    Y.put(drums, Y.kick(), b + 2.5 * BEAT, 0.7)
    Y.put(bass, Y.bass808(root, BAR * 0.95, glide_from=root + 5 if k % 2 else None), b, 0.8)
    Y.put(drums, Y.snare(), b + 2 * BEAT, 0.6)
    Y.put(drums, Y.clap(), b + 2 * BEAT, 0.35)
    for s in range(8):
        Y.put(drums, Y.hat(), b + s * BEAT / 2, 0.16, 0.25)
    if k % 2 == 1:  # redoble de hi-hats al final de cada dos compases
        for r in range(6):
            Y.put(drums, Y.hat(), b + 3 * BEAT + r * BEAT / 6, 0.13, -0.25)
    pad = Y.lp(sum(Y.supersaw(m, BAR) for m in ch) / 3, 1500)
    Y.put(mel, pad, b, 0.22, -0.2)
    for s, m in enumerate(MOTIF):
        if (k * 8 + s) % 3 != 2:
            Y.put(mel, Y.bell(m), b + s * BEAT / 2, 0.12, 0.3)

# ---- 4. Giro: redoble y subida hasta «Acta» ----
roll_t = st["turn"]
while roll_t < ev["drop"] - 0.02:
    prog = (roll_t - st["turn"]) / max(0.1, ev["drop"] - st["turn"])
    step = BEAT / 2 if prog < 0.4 else BEAT / 4 if prog < 0.75 else BEAT / 8
    Y.put(drums, Y.snare(), roll_t, 0.2 + 0.35 * prog)
    roll_t += step
Y.put(fx, Y.riser(ev["drop"] - st["turn"]), st["turn"], 0.35)

# ---- 5. Drop: future bass ----
FB = [([56, 60, 63], 32), ([58, 62, 65], 34), ([55, 60, 63], 36), ([58, 63, 67], 39)]  # Ab Bb Cm Eb
k = 0
for b in bars(ev["drop"], ev["end_hit"]):
    notes, root = FB[k % 4]
    chord = Y.lp(sum(Y.supersaw(m, BAR) + 0.5 * Y.supersaw(m + 12, BAR) for m in notes) / 4, 4500)
    if k % 2 == 1:  # «wobble» en tresillos de corchea
        tw = Y.tt(BAR)
        chord *= 0.55 + 0.45 * (np.sin(2 * np.pi * (3 / BEAT) / 2 * tw) > 0)
    Y.put(mel, chord, b, 0.42, -0.3)
    Y.put(mel, chord, b + 0.014, 0.42, 0.3)
    Y.put(bass, Y.bass808(root, BAR * 0.95), b, 0.75)
    Y.put(drums, Y.kick(), b, 1.0)
    duck_kick(b)
    Y.put(drums, Y.kick(), b + 2.5 * BEAT, 0.7)
    duck_kick(b + 2.5 * BEAT)
    Y.put(drums, Y.snare(), b + 2 * BEAT, 0.6)
    Y.put(drums, Y.clap(), b + 2 * BEAT, 0.5)
    for s in range(8):
        Y.put(drums, Y.hat(s % 4 == 2), b + s * BEAT / 2, 0.14, 0.25)
    for s in range(8):
        Y.put(mel, Y.pluck(notes[s % 3] + 24, 0.2, 0.06), b + s * BEAT / 2, 0.08, 0.4 if s % 2 else -0.4)
    k += 1
for at in (ev["drop"], ev["end_hit"]):
    Y.put(fx, Y.crash(), at, 0.32)
    Y.put(fx, Y.hit(), at, 0.8)
last = sum(Y.supersaw(m, 3.5) for m in (58, 63, 67)) / 3
Y.put(mel, Y.lp(last, 3000) * np.exp(-Y.tt(3.5) / 1.3), ev["end_hit"], 0.5)

# ---- efectos ----
t8 = v_at["n8"] + 0.2
for j in range(6):
    Y.put(fx, Y.tick(), t8 + j * 0.085, 0.25)
Y.put(fx, Y.chime(), ev["refund"], 0.4)
for s in ("conflict", "search", "win", "how", "end"):
    Y.put(fx, sfx.whoosh(0.4, 1.0), st[s] - 0.2, 0.12)

mel *= pump[:, None]
music = drums + mel + bass * pump[:, None]
music = S.room(music.astype(np.float32), size=0.35, mix=0.12)
music /= np.abs(music).max() + 1e-9

# ---- voces ----
narr, agent = np.zeros(N), np.zeros(N)
for at, lid in voice_at:
    v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    i = int(at * SR)
    if lid in AGENT:
        v = Y.phone_eq(v)
        agent[i : i + len(v)] += v[: N - i]
    else:
        narr[i : i + len(v)] += v[: N - i]
narr = Y.hp(narr, 80)
narr = narr + 0.2 * Y.bp(narr, 2500, 5000)
narr = sfx.compress(narr, thr=0.25, ratio=3)
narr /= np.abs(narr).max() + 1e-9
agent *= 0.85
voice = narr + agent
voice_st = S.room(np.stack([voice, voice], 1).astype(np.float32), size=0.12, mix=0.04)

win = int(0.04 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same").clip(0, 1)
duck = 1 - 0.55 * speak
for a, b in (("l1", "l1_end"), ("l2", "l2_end")):
    i0, i1 = int((ev[a] - 0.2) * SR), int((ev[b] + 0.1) * SR)
    duck[i0:i1] = np.minimum(duck[i0:i1], 0.22 if a == "l2" else 0.35)
# silencio dramático tras el «dun dun» hasta el recuerdo
s0, s1 = int((ev["hit2"] + 0.05) * SR), int((ev["flash"] - 0.45) * SR)
if s1 > s0:
    music[s0:s1] *= np.linspace(1, 0, s1 - s0)[:, None] ** 3

mix = music * 0.6 * duck[:, None] + fx * duck[:, None] + voice_st * 0.9
fo = int(1.5 * SR)
mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
mix = mix[: int(T * SR)]
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/acta3", exist_ok=True)
wav = f"{ROOT}/public/acta3/mix.wav"
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
