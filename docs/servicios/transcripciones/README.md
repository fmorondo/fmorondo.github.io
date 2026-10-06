# Transcripciones

## Resumen

- Entrada: `transcripciones.html`
- Tipo: frontend HTML estatico con backend de procesamiento
- Backend base: `https://transcriptor-servicio-811896322472.europe-west1.run.app`
- Funcion: subir audio, lanzar transcripcion y descargar un ZIP final

## Flujo funcional

1. El usuario selecciona un audio.
2. El frontend solicita una URL firmada en `/firmar-subida`.
3. Sube el binario con `PUT` a la `signed_url`.
4. Lanza el procesamiento con `POST` a `/transcribir-stream` usando `gcs_uri`, idioma y prompt.
5. Lee eventos estilo SSE desde el stream y actualiza el progreso.
6. Cuando recibe `DOWNLOAD_URL::` intenta descarga automatica; si recibe `DOWNLOAD::`, usa `/descargar/<zip>` como fallback.

## Entradas y salidas

- Entrada:
  - archivo `audio/*`
  - idioma original: `es`, `en`, `fr`, `auto`
  - prompt: `entrevista` o `rueda_prensa`
- Salida:
  - ZIP descargable con transcripciones
  - log textual de etapas y mensajes del backend

## Implementacion

- `transcripciones.html`
- `styles.css`

## Integraciones

- `/firmar-subida`
- `/transcribir-stream`
- `/descargar/<zip>`
- Google Cloud Storage via URL firmada

## Detalles relevantes de UX

- Bloquea controles durante el proceso.
- Detecta etapas por heuristica de texto: segmentacion, transcripcion, correccion, consolidacion y empaquetado.
- Durante correccion anade un pulso de progreso cada 30 segundos.
- Ofrece boton manual de descarga y boton de reintento.

## Riesgos y limites

- La interfaz recomienda audios de menos de media hora, pero el limite real esta en backend.
- El parser del stream es artesanal y depende de cadenas con prefijos `DOWNLOAD_URL::` o `DOWNLOAD::`.
- No hay barra de progreso real de subida o procesamiento; solo estados aproximados.

## Experimento shadow de septiembre de 2026 (finalizado)

El commit `25a719c4044a2f6268977f9f7881a9344852f70d`, del 15 de septiembre,
programó una comparación de `whisper-1` con `gpt-transcribe` durante 15 días.
La ventana era `[2026-09-15T00:00:00+02:00, 2026-09-30T00:00:00+02:00)`:
inicio incluido y fin excluido, con horario de Madrid. En UTC equivale a
`[2026-09-14T22:00:00Z, 2026-09-29T22:00:00Z)`.

- Muestreo aleatorio del 50 % de las subidas completadas dentro de esa ventana
  (`Math.random() < 0.5`); no era una cuota exacta ni una asignación por usuario.
- Tras el `PUT` del audio, el frontend enviaba una petición en paralelo,
  sin esperar su resultado, y continuaba con la transcripción de producción.
- Servicio experimental:
  `https://transcriptor-gpt4omini-test-811896322472.europe-west1.run.app`.
  Endpoint: `POST /comparar-shadow` con JSON.
- Campos enviados: `gcs_uri` (URI del mismo audio subido), `experiment_id`
  (UUID aleatorio o identificador basado en fecha y azar), `original_filename`,
  `source_lang` y `prompt_id`.
- Se reutilizó el servicio de test anterior. Según el commit, el modelo se
  actualizó mediante una variable de entorno de `gpt-4o-mini-transcribe` a
  `gpt-transcribe`; el nombre del servicio no identifica el modelo ejecutado.

Desde el 30 de septiembre la condición temporal impedía nuevas peticiones.
La limpieza posterior elimina del frontend las constantes, las funciones de
activación, muestreo y envío, y su llamada tras la subida. El flujo normal
descrito arriba se conserva.

### Contexto para analizar los resultados

Consultar los registros y artefactos conservados por el backend experimental,
filtrando por la ventana anterior y relacionando las muestras mediante
`experiment_id`, `gcs_uri`, nombre de archivo, idioma y prompt. Comprobar en
la configuración o metadatos del backend qué modelo ejecutó cada muestra,
especialmente al reutilizar el servicio de pruebas anterior. Comparar las
transcripciones del mismo audio y, si se registraron, duración de procesamiento,
coste y errores. El 50 % es una probabilidad de selección, no prueba de que
la mitad exacta de los trabajos se completara o guardara correctamente.

Este repositorio no contiene el backend, sus resultados ni la ubicación o el
formato de sus artefactos; esos datos deben verificarse allí. La limpieza no
borra resultados ni modifica servicios Cloud Run. Para el historial de la
incidencia corregida antes de esta ventana, ver el
[análisis del error `gcs_uri`](../../analisis-error-transcripciones-gcs-uri.md).
