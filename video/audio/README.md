# Audio del vídeo «¿Por qué vuelan los aviones?»

Voz: Kokoro (offline, voz `em_alex`, velocidad 1.15), con las herramientas de lemo-opuscar (`~/lemo-opuscar`).
Música: original, compuesta en `build_audio.py` con muestras de Salamander Grand Piano (CC BY 3.0, Alexander Holm)
y VS Chamber Orchestra Community Edition (CC0, Versilian Studios).

Regenerar (desde `video/`):

```sh
LIB=~/lemo-opuscar
sh ../.claude/skills/lemo-opuscar/scripts/setup.sh deps voice      # una vez
(cd $LIB && sh tools/fetch.sh instruments salamander && sh tools/fetch.sh instruments vsco2ce)
(cd $LIB && .venv/bin/python core/tts/tts.py $OLDPWD/audio/lines_kokoro.json $OLDPWD/audio/voice)
$LIB/.venv/bin/python audio/build_audio.py $LIB    # escribe src/aviones/timing.json y public/aviones/mix.wav
npx remotion render PorQueVuelan out/por-que-vuelan-reel.mp4 --browser-executable=/opt/pw-browsers/chromium
```
