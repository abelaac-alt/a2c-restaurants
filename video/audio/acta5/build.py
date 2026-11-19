"""Tutorial de Acta en dos partes con la voz de Álvaro.

Parte 1: instalar y configurar (descarga por Telegram, instalación, permisos, ADB propio, Groq).
Parte 2: por qué es segura y qué dice la ley en España.

Voz: Microsoft Edge (audio/edge_voice.py) con tiempos por palabra.
Música de fondo suave a 104 ppm (piano eléctrico, bajo, caja y bombo suaves) que baja bajo la voz,
campanilla al completar cada paso y «whoosh» en los cambios de escena. Mezcla a -14 LUFS.

Uso (desde video/):  ~/lemo-opuscar/.venv/bin/python audio/acta5/build.py ~/lemo-opuscar
Salidas: src/acta5/timing1.json, timing2.json, public/acta5/mix1.wav, mix2.wav
"""
import sys, os, json, re, subprocess, unicodedata, difflib
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
FPS, SR, BPM = 30, Y.SR, 104
BEAT = 60 / BPM
BAR = 4 * BEAT

L = {l["id"]: l for l in json.load(open(f"{HERE}/lines.json", encoding="utf-8"))}
dur = json.load(open(f"{HERE}/voice/dur.json"))
edge_words = json.load(open(f"{HERE}/voice/words.json", encoding="utf-8"))

PARTS = {
    1: [
        dict(name="intro", ids=["i1"], lead=0.2, gaps=[], tail=0.35),
        dict(name="download", ids=["d1", "d2"], lead=0.15, gaps=[0.15], tail=0.35),
        dict(name="install", ids=["in1", "in2"], lead=0.15, gaps=[0.15], tail=0.9),
        dict(name="perms", ids=["p1", "p2"], lead=0.15, gaps=[0.15], tail=0.5),
        dict(name="adbintro", ids=["a1", "a2"], lead=0.15, gaps=[0.2], tail=0.5),
        dict(name="adbpc", ids=["a3", "a4"], lead=0.15, gaps=[0.2], tail=0.5),
        dict(name="adbconnect", ids=["a5", "a6"], lead=0.15, gaps=[0.2], tail=0.5),
        dict(name="groqweb", ids=["g1"], lead=0.15, gaps=[], tail=0.5),
        dict(name="groqapp", ids=["g2"], lead=0.15, gaps=[], tail=0.5),
        dict(name="end", ids=["ee1"], lead=0.25, gaps=[], tail=2.2),
    ],
    2: [
        dict(name="hook", ids=["h2"], lead=0.1, gaps=[], tail=0.35),
        dict(name="local", ids=["s1"], lead=0.15, gaps=[], tail=0.4),
        dict(name="crypto", ids=["s2"], lead=0.15, gaps=[], tail=0.4),
        dict(name="lock", ids=["s3"], lead=0.15, gaps=[], tail=0.45),
        dict(name="legal1", ids=["l1"], lead=0.15, gaps=[], tail=0.4),
        dict(name="legal2", ids=["l2", "l3"], lead=0.15, gaps=[0.2], tail=0.6),
        dict(name="end", ids=["e1"], lead=0.25, gaps=[], tail=2.4),
    ],
}
# la campanilla suena al terminar la última frase de cada paso
CHIMES = {
    1: ["d2", "in2", "p2", "a2", "a4", "a5", "g1", "g2"],
    2: ["s1", "s2", "s3", "l1"],
}

norm = lambda s: re.sub(r"[^\w]", "", unicodedata.normalize("NFC", s.lower()))


def caption_words(lid):
    """tokens del texto con tiempo (alineados con las palabras que dijo la voz, aunque se lean distinto)"""
    toks = L[lid]["text"].split()
    ew = edge_words[lid]
    a = [norm(t) for t in toks]
    b = [norm(w["w"]) for w in ew]
    times = [None] * len(toks)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
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


def build_part(part):
    scenes = PARTS[part]
    timing = {"fps": FPS, "bpm": BPM, "scenes": []}
    t = 0.0
    voice_at = []
    for sc in scenes:
        x = sc["lead"]
        cues = []
        for i, lid in enumerate(sc["ids"]):
            if i:
                x += sc["gaps"][i - 1]
            d = dur[lid]
            cues.append({"id": lid, "at": round(x * FPS), "dur": round(d * FPS), "text": L[lid]["text"],
                         "words": [{"w": w["w"], "at": round((x + w["t"]) * FPS)} for w in caption_words(lid)]})
            voice_at.append((t + x, lid, d))
            x += d
        x += sc["tail"]
        timing["scenes"].append({"name": sc["name"], "start": round(t * FPS), "dur": round(x * FPS), "cues": cues})
        t += x
    T = t
    timing["total"] = round(T * FPS)
    os.makedirs(f"{ROOT}/src/acta5", exist_ok=True)
    json.dump(timing, open(f"{ROOT}/src/acta5/timing{part}.json", "w"), ensure_ascii=False, indent=1)
    print(f"parte {part}: {T:.1f} s ({timing['total']} fotogramas)")

    N = int((T + 1) * SR)
    drums, mel, bass, fx = (np.zeros((N, 2)) for _ in range(4))
    # ---- música de fondo ----
    if part == 1:
        CH = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 67]), (41, [53, 57, 60, 64]), (43, [55, 59, 62, 65])]  # Cmaj7 Am7 Fmaj7 G
    else:
        CH = [(45, [57, 60, 64, 67]), (41, [53, 57, 60, 64]), (48, [60, 64, 67, 71]), (43, [55, 59, 62, 65])]  # Am7 Fmaj7 Cmaj7 G
    end_start = timing["scenes"][-1]["start"] / FPS
    k = 0
    b = 0.0
    while b < end_start + 0.1:
        root, ch = CH[k % 4]
        for i, m in enumerate(ch):
            Y.put(mel, Y.rhodes(m, BAR * 1.15), b + i * 0.015, 0.2, -0.25 + 0.17 * i)
        Y.put(bass, Y.bass_note(root - 12, BAR * 0.85, 420), b, 0.5)
        if k >= 1:
            Y.put(drums, Y.kick(0.5), b, 0.55)
            Y.put(drums, Y.kick(0.5), b + 2.5 * BEAT, 0.4)
            Y.put(drums, Y.snare(), b + 2 * BEAT, 0.3)
            for s in range(8):
                Y.put(drums, Y.hat(), b + s * BEAT / 2, 0.07 if s % 2 else 0.11, 0.3)
            for s in range(8):
                Y.put(mel, Y.pluck(ch[(s * 2) % 4] + 12, 0.25, 0.08, 2600), b + s * BEAT / 2, 0.06, 0.4 if s % 2 else -0.4)
        k += 1
        b += BAR
    # cierre: acorde brillante
    top = sum(Y.supersaw(m, 3.0) for m in (57, 60, 64)) / 3 if part == 2 else sum(Y.supersaw(m, 3.0) for m in (60, 64, 67)) / 3
    Y.put(mel, Y.lp(top, 3000) * np.exp(-Y.tt(3.0) / 1.2), end_start + 0.2, 0.28)
    # ---- efectos ----
    for lid in CHIMES[part]:
        for at, i, d in voice_at:
            if i == lid:
                Y.put(fx, Y.chime(), at + d + 0.12, 0.3)
    for s in timing["scenes"][1:]:
        Y.put(fx, sfx.whoosh(0.35, 1.0), s["start"] / FPS - 0.15, 0.08)
    if part == 1:  # tecleo de comandos en el terminal
        for at, i, d in voice_at:
            if i == "a4":
                for j in range(26):
                    Y.put(fx, Y.tick(), at + 0.3 + j * 0.11 + 0.02 * (j % 3), 0.22)
    music = drums + mel + bass
    music = np.stack([Y.lp(music[:, c], 6000) for c in range(2)], 1)
    music = S.room(music.astype(np.float32), size=0.3, mix=0.12)
    music /= np.abs(music).max() + 1e-9
    # ---- voz de Álvaro ----
    narr = np.zeros(N)
    for at, lid, d in voice_at:
        v, sr = sf.read(f"{HERE}/voice/{lid}.wav")
        i = int(at * SR)
        narr[i : i + len(v)] += v[: N - i]
    narr = Y.hp(narr, 80)
    narr = narr + 0.18 * Y.bp(narr, 2500, 5000)
    narr = sfx.compress(narr, thr=0.25, ratio=3)
    narr /= np.abs(narr).max() + 1e-9
    voice_st = S.room(np.stack([narr, narr], 1).astype(np.float32), size=0.1, mix=0.03)
    win = int(0.04 * SR)
    env = np.sqrt(np.convolve(narr**2, np.ones(win) / win, mode="same"))
    speak = np.convolve((env > 0.03).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same").clip(0, 1)
    duck = 1 - 0.7 * speak
    mix = music * 0.5 * duck[:, None] + fx * (1 - 0.4 * speak)[:, None] + voice_st * 0.95
    fo = int(1.4 * SR)
    mix[int(T * SR) - fo : int(T * SR)] *= np.linspace(1, 0, fo)[:, None]
    mix = mix[: int(T * SR)]
    mix = np.stack([sfx.limit(mix[:, c], ceil=0.95) for c in range(2)], 1)
    os.makedirs(f"{ROOT}/public/acta5", exist_ok=True)
    wav = f"{ROOT}/public/acta5/mix{part}.wav"
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
    print(f"  mezcla: {m['input_i']} LUFS -> -14 LUFS")


for p in (1, 2):
    build_part(p)
