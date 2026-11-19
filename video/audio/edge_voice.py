"""Voces neuronales de Microsoft Edge (gratis, online) con tiempos por palabra.

Uso: python audio/edge_voice.py lines.json out_dir
lines.json = [{"id", "text", "voice", "rate"?: "+5%", "pitch"?: "-4Hz", "say"?: texto leído si difiere}]
Escribe out_dir/<id>.wav (48 kHz mono, silencios recortados), out_dir/dur.json y out_dir/words.json
(palabra y segundo de inicio relativo al WAV recortado). Usa el proxy de HTTPS_PROXY si existe.
"""
import sys, os, json, asyncio, subprocess, io
import numpy as np
import soundfile as sf

lines, out = json.load(open(sys.argv[1], encoding="utf-8")), sys.argv[2]
os.makedirs(out, exist_ok=True)
SR = 48000


async def synth(L):
    import edge_tts
    c = edge_tts.Communicate(L.get("say", L["text"]), L["voice"], rate=L.get("rate", "+0%"), pitch=L.get("pitch", "+0Hz"), volume=L.get("volume", "+0%"),
                             boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    audio, words = bytearray(), []
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"w": ch["text"], "t": ch["offset"] / 1e7})
    return bytes(audio), words


dur, allwords = {}, {}
for L in lines:
    for attempt in range(4):
        try:
            mp3, words = asyncio.run(synth(L))
            if mp3:
                break
        except Exception as e:
            print("reintento", L["id"], e)
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                         input=mp3, capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, dtype=np.float32).copy()
    thr = 0.01 * np.abs(x).max()
    idx = np.where(np.abs(x) > thr)[0]
    a, b = max(0, idx[0] - int(0.03 * SR)), min(len(x), idx[-1] + int(0.08 * SR))
    x = x[a:b]
    off = a / SR
    sf.write(f"{out}/{L['id']}.wav", x, SR)
    dur[L["id"]] = round(len(x) / SR, 3)
    allwords[L["id"]] = [{"w": w["w"], "t": round(max(0, w["t"] - off), 3)} for w in words]
    print(L["id"], dur[L["id"]], L["text"])
json.dump(dur, open(f"{out}/dur.json", "w"), indent=1)
json.dump(allwords, open(f"{out}/words.json", "w"), ensure_ascii=False, indent=1)
