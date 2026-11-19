# Audio del reel de Acta

- Voz: Kokoro sin conexión (`ef_dora`, velocidad 1.12) con ecualización de locutor y compresión.
- Música: electrónica a 120 ppm sintetizada en `build.py` (bombo, palmas, hi-hats, bajo, acordes con sidechain, arpegio, subida y drop al aparecer el logo).
- Mezcla a -14 LUFS / -1 dBTP.

Regenerar (desde `video/`):

```sh
LIB=~/lemo-opuscar
(cd $LIB && .venv/bin/python core/tts/tts.py $OLDPWD/audio/acta/lines_kokoro.json $OLDPWD/audio/acta/voice)
$LIB/.venv/bin/python audio/acta/build.py $LIB      # src/acta/timing.json + public/acta/mix.wav
npx remotion render ActaReel out/acta-reel.mp4 --browser-executable=/opt/pw-browsers/chromium
```

Para usar otra voz (p. ej. ElevenLabs o una grabación propia), deja un WAV por frase en `audio/acta/voice/`
con el nombre `<VOZ>_<id>.wav`, cambia `VOICE` en `build.py` y vuelve a ejecutarlo: los tiempos se ajustan solos.
