"""Pequeña caja de síntesis para las bandas sonoras de los reels (48 kHz, numpy)."""
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(3)


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
    return 2 * ((tt(d) * f + phase) % 1) - 1


def kick(punch=1.0):
    x = tt(0.45)
    f = 45 + 110 * punch * np.exp(-x / 0.04)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.18)
    click = hp(rng.standard_normal(len(x)), 2000) * np.exp(-x / 0.004) * 0.4
    return np.tanh(1.6 * (body + click))


def clap():
    x = tt(0.35)
    env = np.zeros(len(x))
    for o in (0, 0.011, 0.022):
        i = int(o * SR)
        env[i:] += np.exp(-(x[: len(x) - i]) / 0.012)
    env += 0.5 * np.exp(-x / 0.12) * (x > 0.025)
    return bp(rng.standard_normal(len(x)), 900, 2600) * env


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


def bass_note(m, d, cutoff=700):
    x = tt(d)
    s = saw(hz(m), d) + 0.5 * np.sin(2 * np.pi * hz(m - 12) * x)
    return lp(s, cutoff) * np.minimum(1, x / 0.005) * np.exp(-x / 0.18)


def pluck(m, d=0.25, decay=0.07, cutoff=3500):
    x = tt(d)
    s = saw(hz(m), d) * 0.6 + np.sign(np.sin(2 * np.pi * hz(m) * x)) * 0.4
    return lp(s, cutoff) * np.exp(-x / decay)


def sub_drone(m, d):
    x = tt(d)
    s = np.sin(2 * np.pi * hz(m) * x) + 0.3 * lp(saw(hz(m), d), 220)
    return s * np.minimum(1, x / 0.3) * np.minimum(1, (d - x) / 0.3)


def scratch():
    """«scratch» de disco: barrido de ruido y tono que cae"""
    d = 0.42
    x = tt(d)
    f = 1800 * np.exp(-x / 0.12) + 120
    ph = np.cumsum(f) / SR
    tone = np.sign(np.sin(2 * np.pi * ph)) * 0.5
    n = bp(rng.standard_normal(len(x)), 600, 4000)
    return (tone + n * 0.6) * np.exp(-x / 0.18)


def riser(d):
    x = tt(d)
    noise = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    for i in range(0, len(x), 1200):
        f = 400 + 7000 * (i / len(x)) ** 2
        seg = bp(noise[max(0, i - 3000) : i + 1200], f * 0.8, min(f * 1.25, 20000))[-min(1200, len(x) - i) :]
        out[i : i + len(seg)] = seg
    return out * (x / d) ** 2


def tick():
    x = tt(0.03)
    return hp(rng.standard_normal(len(x)), 3000) * np.exp(-x / 0.004)


def chime(notes=(76, 83, 88), gap=0.07):
    out = np.zeros(int((gap * len(notes) + 0.8) * SR))
    for i, m in enumerate(notes):
        x = tt(0.8)
        s = (np.sin(2 * np.pi * hz(m) * x) + 0.3 * np.sin(4 * np.pi * hz(m) * x)) * np.exp(-x / 0.25)
        j = int(i * gap * SR)
        out[j : j + len(s)] += s
    return out


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


def phone_eq(x):
    """voz de teléfono: banda 300-3400 Hz, algo de saturación y ruido de línea"""
    y = bp(x, 320, 3300, o=4)
    y = np.tanh(2.2 * y / (np.abs(y).max() + 1e-9))
    y += 0.012 * hp(rng.standard_normal(len(y)), 2000)
    return y / (np.abs(y).max() + 1e-9)


# ---------- instrumentos extra (trap, lo-fi, future bass) ----------
def bass808(m, d, glide_from=None):
    x = tt(d)
    f0 = hz(m)
    if glide_from is not None:
        f = hz(glide_from) + (f0 - hz(glide_from)) * (1 - np.exp(-x / 0.06))
    else:
        f = np.full(len(x), f0)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(2.2 * s) * 0.8
    env = np.minimum(1, x / 0.004) * np.exp(-x / 0.9) * np.minimum(1, (d - x) / 0.03).clip(0, 1)
    return s * env


def snare():
    x = tt(0.3)
    tone = np.sin(2 * np.pi * 190 * x) * np.exp(-x / 0.05)
    n = bp(rng.standard_normal(len(x)), 1200, 9000) * np.exp(-x / 0.09)
    return 0.5 * tone + n


def rhodes(m, d):
    x = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * x + 1.2 * np.exp(-x / 0.4) * np.sin(2 * np.pi * 2 * f * x))
    s *= 1 + 0.15 * np.sin(2 * np.pi * 4.5 * x)
    return s * np.minimum(1, x / 0.01) * np.exp(-x / 1.6)


def bell(m, d=0.9):
    x = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * x + 2.0 * np.exp(-x / 0.25) * np.sin(2 * np.pi * 3.5 * f * x))
    return s * np.exp(-x / 0.35)


def crackle(d):
    n = int(d * SR)
    out = np.zeros(n)
    pops = rng.random(n) > 0.9993
    out[pops] = rng.standard_normal(pops.sum()) * 0.8
    out = hp(out, 1500) + 0.02 * lp(rng.standard_normal(n), 3000)
    return out


def hit():
    """golpe cinematográfico: sub + ruido + acorde grave"""
    x = tt(2.2)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 50 * np.exp(-x / 0.2)) / SR) * np.exp(-x / 0.8)
    n = lp(rng.standard_normal(len(x)), 900) * np.exp(-x / 0.35)
    st = sum(np.sin(2 * np.pi * hz(m) * x) for m in (36, 43, 48)) / 3 * np.exp(-x / 0.9)
    return np.tanh(1.5 * (sub + 0.5 * n + 0.6 * st))


def downlifter(d):
    x = tt(d)
    noise = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    for i in range(0, len(x), 1200):
        f = 6000 * (1 - i / len(x)) ** 2 + 300
        seg = bp(noise[max(0, i - 3000) : i + 1200], f * 0.8, min(f * 1.25, 20000))[-min(1200, len(x) - i) :]
        out[i : i + len(seg)] = seg
    return out * (1 - x / d) ** 1.5


# ---------- efectos de humor ----------
def airhorn(d=0.9):
    """bocina de estadio: acorde de sierras con vibrato y ataque brusco"""
    x = tt(d)
    out = np.zeros(len(x))
    for f0 in (466, 554, 698):
        f = f0 * (1 + 0.012 * np.sin(2 * np.pi * 7 * x))
        ph = np.cumsum(f) / SR
        out += 2 * (ph % 1) - 1
    out = bp(out / 3, 300, 5000)
    env = np.minimum(1, x / 0.01) * np.minimum(1, (d - x) / 0.05).clip(0, 1)
    return np.tanh(2.5 * out) * env


def crickets(d):
    x = tt(d)
    out = np.zeros(len(x))
    for f0, rate, ph in ((4300, 3.1, 0.0), (4700, 2.6, 0.4)):
        chirp = (np.sin(2 * np.pi * 60 * x) > 0.2) * (np.sin(2 * np.pi * rate * x + ph * 6) > 0.55)
        out += np.sin(2 * np.pi * f0 * x) * chirp
    return lp(out, 6000) * 0.5


def sad_trombone():
    """«wa-wa-wa-waaa»: cuatro notas descendentes con wah"""
    notes = [(62, 0.32), (61, 0.32), (60, 0.32), (59, 1.3)]
    out = []
    for m, d in notes:
        x = tt(d)
        f = hz(m - 12) * (1 + (0.015 * np.sin(2 * np.pi * 5.5 * x) if d > 1 else 0))
        ph = np.cumsum(np.broadcast_to(f, x.shape)) / SR
        s = 2 * (ph % 1) - 1
        wah = 600 + 1400 * np.minimum(1, x / 0.12)
        y = np.zeros(len(x))
        blk = 480
        for i in range(0, len(x), blk):
            seg = s[max(0, i - 2000) : i + blk]
            y[i : i + blk] = lp(seg, float(wah[min(i, len(wah) - 1)]))[-len(y[i : i + blk]) :]
        env = np.minimum(1, x / 0.03) * np.minimum(1, (d - x) / 0.05).clip(0, 1)
        out.append(np.tanh(1.8 * y) * env)
    return np.concatenate(out)


def bubbles(d, n=14):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        at = int(rng.random() * (len(out) - int(0.08 * SR)))
        x = tt(0.07)
        f = (600 + 900 * rng.random()) * (1 + 3 * x / 0.07)
        b = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.025)
        out[at : at + len(b)] += b
    return out


def pizz(m, d=0.22):
    x = tt(d)
    s = np.sin(2 * np.pi * hz(m) * x) + 0.4 * np.sin(4 * np.pi * hz(m) * x) + 0.15 * np.sin(6 * np.pi * hz(m) * x)
    return s * np.minimum(1, x / 0.003) * np.exp(-x / 0.07)


def pitch(x, semis):
    """cambia el tono (y la duración) remuestreando"""
    import soxr
    r = 2 ** (semis / 12)
    return soxr.resample(x, SR, int(SR / r))


# ---------- sonido realista para historias ----------
def vibrate(n=3):
    """vibración del móvil sobre una mesa: ráfagas de 160 Hz con golpeteo"""
    out = []
    for _ in range(n):
        x = tt(0.28)
        s = np.sin(2 * np.pi * 165 * x) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * x)))
        s += 0.4 * lp(rng.standard_normal(len(x)), 900)
        out.append(np.tanh(1.5 * s) * np.minimum(1, x / 0.01) * np.minimum(1, (0.28 - x) / 0.03).clip(0, 1))
        out.append(np.zeros(int(0.09 * SR)))
    return np.concatenate(out)


def ping(m=88):
    """aviso de mensaje: dos notas rápidas"""
    out = np.zeros(int(0.6 * SR))
    for i, mm in enumerate((m, m + 5)):
        x = tt(0.35)
        s = np.sin(2 * np.pi * hz(mm) * x) * np.exp(-x / 0.09)
        j = int(i * 0.11 * SR)
        out[j : j + len(s)] += s
    return out * 0.7


def breath(d=0.45):
    x = tt(d)
    n = bp(rng.standard_normal(len(x)), 600, 3800)
    env = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2
    return n * env


def room_tone(d, level=1.0):
    """habitación de noche: grave de nevera + aire suave"""
    x = tt(d)
    hum = 0.5 * np.sin(2 * np.pi * 50 * x) + 0.25 * np.sin(2 * np.pi * 100 * x)
    air = lp(rng.standard_normal(len(x)), 500) * 0.6
    return (hum + air) * level


def water_tap(d):
    x = tt(d)
    n = bp(rng.standard_normal(len(x)), 1500, 7000, o=3)
    n *= 0.7 + 0.3 * lp(rng.standard_normal(len(x)), 12)
    return n * np.minimum(1, x / 0.25) * np.minimum(1, (d - x) / 0.35).clip(0, 1)


def busy_beeps(n=3):
    out = []
    for _ in range(n):
        x = tt(0.18)
        out.append(np.sin(2 * np.pi * 425 * x) * np.minimum(1, x / 0.01) * np.minimum(1, (0.18 - x) / 0.01).clip(0, 1))
        out.append(np.zeros(int(0.18 * SR)))
    return np.concatenate(out)


def click_soft():
    x = tt(0.04)
    return hp(rng.standard_normal(len(x)), 1200) * np.exp(-x / 0.008)


def mute_thunk():
    x = tt(0.18)
    return (np.sin(2 * np.pi * 90 * x) * np.exp(-x / 0.05) + 0.3 * hp(rng.standard_normal(len(x)), 2000) * np.exp(-x / 0.01)) * 0.9
