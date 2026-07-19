# Descarga Parlamento de Navarra

## Resumen

- Entrada: `descarga-parlamento/index.html`
- Tipo: frontend HTML estatico con backend remoto
- Backend: `https://descarga-parlamento-811896322472.europe-west1.run.app` (repo `descarga-parlamento-navarra`)
- Funcion: previsualizar los directos institucionales del Parlamento de Navarra y grabar/descargar video HLS localmente

## Flujo funcional

1. **Directos**: el frontend pide `GET /streams` al backend, muestra una tarjeta por canal con vista previa via `hls.js` y comprueba si esta emitiendo.
2. El usuario puede pulsar "Grabar en mi ordenador": el frontend resuelve el manifest HLS, descarga segmentos directamente desde el navegador y los escribe con la File System Access API (`showSaveFilePicker`), sin pasar por el backend.
3. **Grabaciones recientes**: `GET /recents?limit=20` lista videos ya publicados en la mediateca; cada tarjeta permite descargar el VOD completo o ver las intervenciones marcadas (`GET /resolve?subject_id=...`).
4. **Por URL o identificador**: el usuario puede pegar una URL `watch?id=...`, un UUID o un manifest `.m3u8` directo; el frontend hace `POST /resolve-url` para obtener el `manifest_url` y descarga igual que un VOD.
5. En todos los casos, el backend solo resuelve metadatos y URLs HLS — el video en si se descarga siempre navegador-a-origen, nunca pasa por Cloud Run.

## Entradas y salidas

- Entrada: seleccion de un canal en directo, una grabacion de la lista, o una URL/identificador pegado a mano.
- Salida: archivo `.ts` (Transport Stream) guardado localmente con el selector de archivo del navegador.

## Implementacion

- `descarga-parlamento/index.html` (incluye `/auth-check.js` — antes faltaba, a diferencia del resto de servicios del portal)
- `descarga-parlamento/app.js`
- `styles.css`
- Libreria CDN: `hls.js`

## Dependencias externas

- Backend FastAPI (`descarga-parlamento-navarra/backend`), desplegado en Cloud Run.
- Streams HLS y mediateca publica del Parlamento de Navarra.

## Consideraciones operativas

- Requiere Chrome, Edge u otro navegador basado en Chromium: usa File System Access API, sin la cual la pagina deshabilita la grabacion y muestra un aviso.
- Para grabaciones en directo, pide un Wake Lock de pantalla mientras dura la grabacion.
- El backend no almacena ni redistribuye video; el disclaimer de la UI dice explicitamente que las descargas se guardan en el ordenador del usuario, no en servidores externos.

## Riesgos y limites

- La descarga de segmentos en directo depende de que el navegador permanezca abierto y con la pestana activa durante toda la emision.
- La deteccion de "EN EMISION" es una comprobacion puntual del manifest, no una monitorizacion continua.
- La descarga de segmento individual desde el panel de intervenciones esta pendiente (`downloadMarker` es un TODO sin implementar).
