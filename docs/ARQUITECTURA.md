# Arquitectura de servicios nuevos

Criterio para decidir, al crear un servicio nuevo del portal de redacción,
dónde debe vivir el procesamiento. Se evalúa en este orden y se para en el
primer nivel que resuelva el problema — no saltar a un nivel superior "por si
acaso".

## Nivel 1 — Navegador (por defecto)

¿Se puede resolver con Canvas 2D/DOM, `pdf.js`/`pdf-lib`/`JSZip`, la
Clipboard API, o simplemente construyendo una URL/enlace? Si sí, se queda
aquí: es un frontend 100% estático, sin backend propio, con el skill
`portal-redaccion-design` (ver `../SKILL.md`).

No requiere secretos, no depende de disponibilidad de servicios externos, y
el coste operativo es cero (GitHub Pages).

**Ejemplos reales:** conversor de comillas, ajuste vertical, compositor de
fotos, portada para Twitter/X, generador UTM, descarga por Tag ID,
fusionador PDF, PDF a JPG, teletipos a Xalok.

## Nivel 2 — Cloud Run sin OpenAI

Solo si el Nivel 1 falla por alguna de estas razones concretas:

- Hace falta un secreto o credencial que no puede vivir en el cliente.
- Hace falta una herramienta server-side que no existe en el navegador
  (`yt-dlp`, scraping con cabeceras de navegador, ffmpeg).
- El proceso es largo o pesado en memoria y bloquearía la pestaña.
- Hace falta almacenamiento intermedio (GCS) o llamar a un servicio interno
  que no debe exponerse públicamente.

Antes de desplegar un contenedor nuevo, comprobar si un Cloud Run existente
con un patrón compatible puede extenderse con una ruta nueva en vez de
multiplicar despliegues (ver Nivel 3 — varios asistentes conviven en el
mismo servicio `KoldoGPTnuevo`).

Este nivel es minoritario en la práctica: los tres únicos casos reales son
tareas puramente mecánicas de **extracción/descarga de un binario**, sin
ningún componente de lenguaje. En cuanto la tarea toca texto (corregir,
resumir, responder), termina casi siempre en Nivel 3.

**Ejemplos reales:**

| Frontend | Backend (repo) | Qué hace |
|---|---|---|
| `descargar-audio.html` | `audio-downloader-service` | Extrae audio con `yt-dlp`; también resuelve la mediateca del Parlamento de Navarra vía scraping |
| `descargar-video.html` | `descargavideos` | Descarga vídeo con `yt-dlp` |
| `descarga-parlamento/` | `descarga-parlamento-navarra` | Scraping FastAPI de la web del Parlamento, sin LLM |

## Nivel 3 — Cloud Run llamando a OpenAI

Solo si la tarea requiere capacidad de lenguaje o embeddings genuina: chat
conversacional, RAG, corrección/generación de texto, vector stores. La
llamada a OpenAI vive siempre en el backend — la API key nunca viaja al
cliente. Si el Nivel 2 ya resuelve el problema sin tocar texto (extraer,
convertir, descargar), no añadir OpenAI solo porque esté disponible.

**Ejemplos reales:**

| Frontend | Backend (repo) | Uso de OpenAI |
|---|---|---|
| `koldo.html`, `osasuna.html`, `osasuna-prensa.html`, `subidacsv.html` | `KoldoGPTnuevo` | Cliente OpenAI + `file_search` sobre `vector_store_ids` (varios asistentes conviven en el mismo servicio, un slug de ruta por asistente) |
| `buscadorprotocolo.html` (Asesor de cumplimiento) | `buscador-protocolos-gli` | Mismo patrón: cliente OpenAI + `vector_store_id` |
| `transcripciones.html`, `transcripciones2.html` | `transcripcionesDN` | Whisper para transcribir + ChatGPT para corregir y consolidar |

## Resumen

```
¿Cabe en el navegador?
  sí  → Nivel 1 (frontend estático, portal-redaccion-design)
  no  → ¿la tarea es mecánica (extraer/descargar/convertir), sin texto?
          sí → Nivel 2 (Cloud Run, sin OpenAI)
          no → Nivel 3 (Cloud Run, llama a OpenAI desde el backend)
```
