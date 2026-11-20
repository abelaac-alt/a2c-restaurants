"""Reel de humor «Mi novio y los platos» para Acta.

Voces: Microsoft Edge (Ximena y Álvaro) con tiempos por palabra.
Música a 140 ppm: pizzicato pícaro sobre trap, bocina al aprobar, grillos en la amnesia,
drop en «Acta», remix «pa-pa-palabra» con la voz de Pedro y trombón triste al final.

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python audio/acta4/build.py ~/lemo-opuscar
Salidas: src/acta4/timing.json, public/acta4/mix.wav
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
PEDRO = {"b1", "b2"}
PHONE = {"b1"}  # b1 es por teléfono; b2 es en persona

SCENES = [
    dict(name="hook", ids=["n1", "n2"], lead=0.05, gaps=[0.15], tail=0.3),
    dict(name="bet", ids=["n3", "b1"], lead=0.15, gaps=[0.25], tail=0.3),
    dict(name="pass", ids=["n4"], lead=0.1, gaps=[], tail=0.95),
    dict(name="amnesia", ids=["n5", "b2"], lead=0.15, gaps=[0.6], tail=0.9),
    dict(name="turn", ids=["n6"], lead=0.1, gaps=[], tail=0.45),
    dict(name="tasks", ids=["n7", "n8"], lead=0.15, gaps=[0.25], tail=0.4),
    dict(name="remix", ids=["n9"], lead=0.15, gaps=[], tail=0.15, extra_bars=2),
    dict(name="montage", ids=["n10"], lead=0.15, gaps=[], tail=0.3),
    dict(name="end", ids=["n12"], lead=0.3, gaps=[], tail=4.2),
]

norm = lambda s: re.sub(r"[^\w]", "", unicodedata.normalize("NFC", s.lower()))
REPL = [(["treinta", "días"], "30 días"), (["día", "doce"], "Día 12")]


def caption_words(lid):
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
        for seq, rep in REPL:
            if [norm(o["w"]) for o in out[i : i + len(seq)]] == seq:
                tail = re.sub(r"[\w]", "", out[i + len(seq) - 1]["w"])
                res.append({"w": rep + tail, "t": out[i]["t"]})
                i += len(seq)
                break
        else:
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
            "id": lid, "at": round(x * FPS), "dur": round(d * FPS), "text": L[lid]["text"], "pedro": lid in PEDRO,
            "words": [{"w": w["w"], "at": round((x + w["t"]) * FPS)} for w in caption_words(lid)],
        })
        voice_at.append((t + x, lid))
        x += d
    x += sc["tail"]
    x = np.ceil(x / BEAT) * BEAT
    extra = sc.get("extra_bars", 0) * BAR
    timing["scenes"].append({"name": sc["name"], "start": round(t * FPS), "dur": round((x + extra) * FPS), "cues": cues,
                             "extra_from": round(x * FPS) if extra else None})
    t += x + extra
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


remix0 = st["remix"] + by["remix"]["extra_from"] / FPS
ev = {
    "b1": v_at["b1"], "b1_end": v_at["b1"] + dur["b1"],
    "palabra": word_t("b1", "palabra"),
    "aprobe": word_t("n4", "aprobé"),
    "amnesia": word_t("n5", "amnesia"),
    "b2": v_at["b2"], "b2_end": v_at["b2"] + dur["b2"],
    "drop": word_t("n6", "acta"),
    "task": word_t("n8", "tarea"),
    "remix": remix0,
    "pedro_end": word_t("n12", "pedro"),
    "trombone": v_at["n12"] + dur["n12"] + 0.15,
}
ev["end_hit"] = ev["trombone"] + 2.4
timing["events"] = {k: round(v * FPS) for k, v in ev.items()}
os.makedirs(f"{ROOT}/src/acta4", exist_ok=True)
json.dump(timing, open(f"{ROOT}/src/acta4/timing.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {T:.1f} s ·", {k: round(float(v), 2) for k, v in ev.items()})

N = int((T + 1) * SR)
drums, mel, bass, fx, vox_fx = (np.zeros((N, 2)) for _ in range(5))
pump = np.ones(N)
mute = np.ones(N)  # silencios cómicos de la música


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


# ---- Parte A (gancho → amnesia): pizzicato pícaro en Re menor sobre trap ----
SNEAK = [[62, 65, 69, 65, 64, 65, 62, 61], [62, 65, 69, 72, 70, 69, 67, 65]]
ROOTS_A = [38, 38, 34, 33]  # D D Bb A
for k, b in enumerate(bars(0, ev["amnesia"])):
    Y.put(drums, Y.kick(), b, 0.85)
    Y.put(drums, Y.kick(), b + 2.5 * BEAT, 0.6)
    Y.put(drums, Y.snare(), b + 2 * BEAT, 0.5)
    Y.put(drums, Y.clap(), b + 2 * BEAT, 0.3)
    for s in range(8):
        Y.put(drums, Y.hat(), b + s * BEAT / 2, 0.13 if s % 2 else 0.18, 0.3)
    Y.put(bass, Y.bass808(ROOTS_A[k % 4], BAR * 0.9), b, 0.65)
    for s, m in enumerate(SNEAK[k % 2]):
        Y.put(mel, Y.pizz(m), b + s * BEAT / 2, 0.32, -0.25 if s % 2 else 0.25)
# «¡Aprobé!»: bocina y golpe de victoria
Y.put(fx, Y.airhorn(0.45), ev["aprobe"] + 0.9, 0.33)
Y.put(fx, Y.airhorn(0.8), ev["aprobe"] + 1.42, 0.33)
Y.put(fx, Y.crash(), ev["aprobe"] + 0.9, 0.25)
# «amnesia»: scratch, silencio y grillos
Y.put(fx, Y.scratch(), ev["amnesia"] + 0.05, 0.45)
m0 = int((ev["amnesia"] + 0.25) * SR)
m1 = int(st["turn"] * SR)
mute[m0:m1] = 0
Y.put(fx, Y.crickets(st["turn"] - ev["amnesia"] - 0.3), ev["amnesia"] + 0.3, 0.16)
Y.put(fx, Y.hit(), ev["b2_end"] + 0.1, 0.6)  # «dun» tras su mentira

# ---- Giro: redoble hasta «Acta» ----
roll = st["turn"]
while roll < ev["drop"] - 0.02:
    p = (roll - st["turn"]) / max(0.1, ev["drop"] - st["turn"])
    Y.put(drums, Y.snare(), roll, 0.18 + 0.35 * p)
    roll += BEAT / 2 if p < 0.4 else BEAT / 4 if p < 0.75 else BEAT / 8
Y.put(fx, Y.riser(ev["drop"] - st["turn"]), st["turn"], 0.35)

# ---- Parte B (drop → final): future bass en Fa mayor ----
FB = [([57, 60, 65], 41), ([55, 60, 64], 36), ([57, 62, 65], 38), ([58, 62, 65], 34)]  # F C Dm Bb
k = 0
for b in bars(ev["drop"], ev["end_hit"]):
    notes, root = FB[k % 4]
    chord = Y.lp(sum(Y.supersaw(m, BAR) + 0.5 * Y.supersaw(m + 12, BAR) for m in notes) / 4, 4800)
    if k % 2 == 1:
        chord *= 0.55 + 0.45 * (np.sin(2 * np.pi * (3 / BEAT) / 2 * Y.tt(BAR)) > 0)
    Y.put(mel, chord, b, 0.4, -0.3)
    Y.put(mel, chord, b + 0.014, 0.4, 0.3)
    Y.put(bass, Y.bass808(root, BAR * 0.95), b, 0.75)
    for kt in (b, b + 2.5 * BEAT):
        Y.put(drums, Y.kick(), kt, 1.0 if kt == b else 0.7)
        duck_kick(kt)
    Y.put(drums, Y.snare(), b + 2 * BEAT, 0.6)
    Y.put(drums, Y.clap(), b + 2 * BEAT, 0.5)
    for s in range(8):
        Y.put(drums, Y.hat(s % 4 == 2), b + s * BEAT / 2, 0.14, 0.25)
    for s in range(8):
        Y.put(mel, Y.pizz(notes[s % 3] + 12), b + s * BEAT / 2, 0.14, 0.4 if s % 2 else -0.4)
    k += 1
for at in (ev["drop"], ev["end_hit"]):
    Y.put(fx, Y.crash(), at, 0.32)
    Y.put(fx, Y.hit(), at, 0.8)
# el remate: la música se para y suena el trombón triste
t0 = int((ev["pedro_end"] + 0.35) * SR)
t1 = int(ev["end_hit"] * SR)
mute[t0:t1] = 0
Y.put(fx, Y.sad_trombone(), ev["trombone"], 0.38)
last = sum(Y.supersaw(m, 3.0) for m in (57, 60, 65)) / 3
Y.put(mel, Y.lp(last, 3000) * np.exp(-Y.tt(3.0) / 1.2), ev["end_hit"], 0.45)

# ---- efectos ----
Y.put(fx, Y.chime(), ev["task"], 0.35)
Y.put(fx, Y.bubbles(2.5), st["montage"] + 0.3, 0.12)
for s in ("bet", "pass", "tasks", "montage", "end"):
    Y.put(fx, sfx.whoosh(0.4, 1.0), st[s] - 0.2, 0.1)

# ---- remix «pa-pa-palabra» con la voz de Pedro (por teléfono) ----
b1, _ = sf.read(f"{HERE}/voice/b1.wav")
pw = edge_words["b1"][-1]["t"]
palabra = Y.phone_eq(b1[int(pw * SR) :])
pa = palabra[: int(0.15 * SR)] * np.minimum(1, np.linspace(8, 0, int(0.15 * SR)))
PATTERN = ["pa", "pa", "PAL", None, "pa", "pa", "pa", "pa", "PAL", None, "pa", "pa", "HI", None, "pa", "PAL"]
for i, p in enumerate(PATTERN):
    at = ev["remix"] + i * BEAT / 2
    if p == "pa":
        Y.put(vox_fx, pa, at, 0.9)
    elif p == "PAL":
        Y.put(vox_fx, palabra, at, 0.9)
    elif p == "HI":
        Y.put(vox_fx, Y.pitch(palabra, 5), at, 0.9)

mel *= pump[:, None]
music = drums + mel + bass * pump[:, None]
music = S.room(music.astype(np.float32), size=0.35, mix=0.12)
music /= np.abs(music).max() + 1e-9
music *= mute[:, None]

# ---- voces ----
narr, ped = np.zeros(N), np.zeros(N)
for at, lid in voice_at:
    v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
    i = int(at * SR)
    if lid in PHONE:
        v = Y.phone_eq(v) * 0.85
        ped[i : i + len(v)] += v[: N - i]
    elif lid in PEDRO:
        v = v / (np.abs(v).max() + 1e-9) * 0.9
        ped[i : i + len(v)] += v[: N - i]
    else:
        narr[i : i + len(v)] += v[: N - i]
narr = Y.hp(narr, 80)
narr = narr + 0.18 * Y.bp(narr, 2500, 5000)
narr = sfx.compress(narr, thr=0.25, ratio=3)
narr /= np.abs(narr).max() + 1e-9
voice = narr + ped
voice_st = S.room(np.stack([voice, voice], 1).astype(np.float32), size=0.12, mix=0.04)

win = int(0.04 * SR)
env = np.sqrt(np.convolve(voice**2, np.ones(win) / win, mode="same"))
speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same").clip(0, 1)
duck = 1 - 0.55 * speak
i0, i1 = int((ev["b1"] - 0.2) * SR), int((ev["b1_end"] + 0.1) * SR)
duck[i0:i1] = np.minimum(duck[i0:i1], 0.35)

mix = music * 0.6 * duck[:, None] + fx * duck[:, None] + vox_fx + voice_st * 0.9
fo = int(1.2 * SR)
mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
mix = mix[: int(T * SR)]
mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
os.makedirs(f"{ROOT}/public/acta4", exist_ok=True)
wav = f"{ROOT}/public/acta4/mix.wav"
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
