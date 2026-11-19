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
