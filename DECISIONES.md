# Decisiones

Bitácora de decisiones de diseño/arquitectura de este repo: qué se decidió y
por qué, no solo qué cambió (eso ya lo cuenta `git log`). Cada entrada es
corta — una decisión destilada, no un resumen de la conversación completa.

Orden cronológico inverso: la entrada más reciente va arriba.

## 2026-10-14 — `transcripciones.html` pasa al servicio `transcriptor`

**Decisión:** la página de transcripción usa el servicio nuevo (`fmorondo/transcriptor`); la anterior queda como `transcripciones-antiguo.html` dos semanas y se retiran las páginas de prueba.
**Por qué:** `transcripcionesDN` queda obsoleto; ver el `DECISIONES.md` de `transcriptor`.
**Repos afectados:** `transcriptor`, `transcripcionesDN`.

## Criterio de arquitectura de servicios nuevos

**Decisión:** navegador primero (frontend 100 % estático), después Cloud Run sin OpenAI, y solo entonces con OpenAI; no subir de nivel «por si acaso». Detalle en `docs/ARQUITECTURA.md`.
**Por qué:** menos secretos, coste cero y menos dependencias de servicios externos.
