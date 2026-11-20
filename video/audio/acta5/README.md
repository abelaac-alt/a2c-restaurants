# Tutorial de Acta (2 partes) con la voz de Álvaro

- Voz: Microsoft Edge `es-ES-AlvaroNeural` (`audio/edge_voice.py`, con tiempos por palabra para los subtítulos).
- Parte 1 (≈2:40): descarga por Telegram, instalación, permisos, grabación de las dos voces con el ADB propio, Groq.
- Parte 2 (≈1:05): por qué es segura y qué dice la ley en España.
- Los pasos, textos de pantalla y comandos salen del propio APK (Acta 4.7.1): asistente de configuración, `adb devices`,
  `adb tcpip 5555`, «Permitir siempre», clave de Groq que empieza por `gsk_`, cifrado AES-256-GCM con Android Keystore, etc.

Regenerar (desde `video/`):

```sh
LIB=~/lemo-opuscar
$LIB/.venv/bin/python audio/edge_voice.py audio/acta5/lines.json audio/acta5/voice
$LIB/.venv/bin/python audio/acta5/build.py $LIB      # src/acta5/timing{1,2}.json + public/acta5/mix{1,2}.wav
npx remotion render TutorialActa1 out/acta-tutorial-parte1.mp4 --browser-executable=/opt/pw-browsers/chromium
npx remotion render TutorialActa2 out/acta-tutorial-parte2.mp4 --browser-executable=/opt/pw-browsers/chromium
```

Para cambiar el enlace del canal, edita `d1`, `ee1` y `e1` en `lines.json` (texto y lectura) y `t.me/actaapp` en `Part1.tsx` / `Part2.tsx`.
