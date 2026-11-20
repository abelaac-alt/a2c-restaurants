# «Me dijeron que era gratis» (promesa telefónica + penalización)

Voces de Microsoft Edge: Ximena (Marta y narradora), Álvaro (comercial), Elvira (atención al cliente), con ritmo, tono y
volumen por frase. Voz de teléfono en las llamadas, música de espera, el audio rescatado de Acta con otro filtro.
Música sintética propia (plucks, beat optimista al llegar la prueba); sin créditos obligatorios.

```sh
LIB=~/lemo-opuscar
$LIB/.venv/bin/python -I audio/edge_voice.py audio/acta7/lines.json audio/acta7/voice
$LIB/.venv/bin/python -I audio/acta7/build.py $LIB    # src/acta7/timing.json + public/acta7/mix.wav
npx remotion render ActaGratis out/acta-gratis-reel.mp4 --browser-executable=/opt/pw-browsers/chromium
npx remotion still ActaGratisCover out/acta-gratis-portada.jpg
```
