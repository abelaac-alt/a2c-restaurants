# «14 llamadas perdidas» (acoso laboral)

Tres voces de Microsoft Edge: Ximena (Lucía y narradora), Álvaro (el jefe) y Elvira (su hermana Ana, como nota de voz),
cada frase con su ritmo, tono y volumen (`lines.json`). Sonido de teléfono en las llamadas, respiraciones, latido que se
acelera, vibración del móvil, grifo y pitidos de fin de llamada. Música con piano y cuerdas reales.

Créditos de la música (obligatorio citar el piano): Piano: "Salamander Grand Piano V3" de Alexander Holm, CC BY 3.0.
Cuerdas: VS Chamber Orchestra Community Edition (Versilian Studios), CC0.

```sh
LIB=~/lemo-opuscar
$LIB/.venv/bin/python audio/edge_voice.py audio/acta6/lines.json audio/acta6/voice
$LIB/.venv/bin/python audio/acta6/build.py $LIB       # src/acta6/timing.json + public/acta6/mix.wav
npx remotion render ActaAcoso out/acta-acoso-reel.mp4 --browser-executable=/opt/pw-browsers/chromium
npx remotion still ActaAcosoCover out/acta-acoso-portada.jpg
```
