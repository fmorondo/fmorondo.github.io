# Análisis del error "gcs_uri is not defined" en transcripciones.html

## Contexto inicial

Un usuario reportó el siguiente error en la interfaz de subida de transcripciones:

```
🔐 Preparando la subida...
⬆️ Subiendo el archivo...
✅ Subida completada. Procesando...
❌ Error de red durante la subida: ReferenceError: gcs_uri is not defined
```

Fernando había recomendado al usuario recargar con `CTRL+F5` para descartar caché de frontend.

## Investigación

1. **Repos implicados**: el backend vive en `transcripcionesDN` (Flask, `servidor.py`), donde `gcs_uri` se usa correctamente en Python. El frontend real es estático y vive en `fmorondo.github.io`, en tres variantes:
   - `transcripciones.html` — página de **producción**, enlazada desde `redaccion.html` ("Transcripciones entrevistas y ruedas de prensa").
   - `transcripciones2.html` — página de prueba, enlazada desde `herramientaskoldo.html`.
   - `transcripciones-gpt4omini.html` — página de prueba, enlazada desde `index.html`.

2. **Causa raíz**: en `transcripciones.html`, la función `lanzarExperimentoShadow(gs_uri, archivo)` construye un payload usando shorthand de objeto:

   ```js
   function lanzarExperimentoShadow(gs_uri, archivo) {
     ...
     const payload = {
       gcs_uri,   // ❌ busca una variable "gcs_uri" en scope, pero el parámetro se llama "gs_uri"
       experiment_id: crearExperimentId(),
       ...
     };
   ```

   Esto lanza un `ReferenceError` **síncrono** dentro del `try` del listener de subida, antes de que se llegue a `iniciarSSE(gs_uri)` — por lo que la transcripción real nunca se lanza cuando ocurre.

3. **Por qué es intermitente**: la función solo se ejecuta cuando el "experimento shadow" está activo y cae dentro de un muestreo aleatorio:

   ```js
   const SHADOW_EXPERIMENT_RATE = 0.5;
   const SHADOW_EXPERIMENT_START = Date.parse('2026-09-01T00:00:00+02:00');
   const SHADOW_EXPERIMENT_END   = Date.parse('2026-09-16T00:00:00+02:00');
   ```

   Con tasa 0.5, ~la mitad de las subidas disparan el bug. Esto explica por qué el error "desaparece" al reintentar: no es cuestión de caché, es simple azar.

4. **Verificación de que no es algo nuevo**: se revisó el historial de `transcripciones.html`:
   - `a84b3f2` (21 jul 2026, "Activar experimento shadow de transcripcion") — introduce el bug de origen, con una primera ventana activa del 21 al 29 de julio (8 días) a la misma tasa 0.5.
   - `8a23811` (21 ago 2026, "Reprogramar experimento shadow de transcripcion") — solo reprograma fechas (1–16 sept), no toca la lógica del payload; el bug se reactivó intacto.

   Conclusión: el bug lleva latente desde julio, con dos ventanas de exposición real (8 + 1 días hasta el momento del reporte). Que solo haya llegado un reporte es compatible con volumen de uso bajo y reintentos silenciosos que "arreglan" el síntoma por azar — no contradice el diagnóstico.

## Corrección aplicada

```diff
       const payload = {
-        gcs_uri,
+        gcs_uri: gs_uri,
         experiment_id: crearExperimentId(),
```

- Archivo: `fmorondo.github.io/transcripciones.html`
- Commit: `05510ec` — *"Fix ReferenceError en experimento shadow de transcripciones"*
- Pusheado a `origin/main` (GitHub Pages se actualiza en unos minutos).

## Estado final

- `transcripcionesDN`: se dejó en `main` (limpia, sin cambios).
- `fmorondo.github.io`: corrección commiteada y pusheada a `main`.
