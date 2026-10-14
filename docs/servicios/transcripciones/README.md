# Transcripciones

## Resumen

- Entrada: `transcripciones.html`
- Tipo: frontend HTML estatico con backend de procesamiento
- Backend base: servicio `transcriptor` de Cloud Run
  (`https://transcriptor-811896322472.europe-west1.run.app`), repositorio
  [fmorondo/transcriptor](https://github.com/fmorondo/transcriptor)
- Funcion: subir audio de hasta dos horas, transcribirlo con `gpt-transcribe`, corregirlo con la
  plantilla elegida y descargar un ZIP con la transcripcion bruta y la corregida
- Estado: en produccion desde 2026-10-14. Sustituye al servicio antiguo (`transcripcionesDN`), que
  se conserva dos semanas como `transcripciones-antiguo.html`; ver
  [Transcripciones (antiguo)](../transcripciones-antiguo/README.md)

## Flujo funcional

1. El usuario selecciona un audio, el idioma y la plantilla.
2. El frontend pide `POST /api/uploads` y recibe una URL de subida y una clave.
3. Sube el audio con `PUT`: directo al bucket si la URL esta firmada, o a la propia API si no.
4. Crea el trabajo con `POST /api/jobs` (clave, plantilla, idioma) y recibe un identificador.
5. Sigue el progreso con `GET /api/jobs/<id>/events`, un flujo SSE de eventos JSON.
6. Al terminar pide `GET /api/jobs/<id>/result?formato=url`, que devuelve la URL firmada del ZIP, y
   lo descarga. Si no hay URL firmada, descarga el ZIP a traves de la API.

## Diferencias con el servicio antiguo

- El trabajo vive en el servidor, no en la peticion: se puede cerrar la pestana y el trabajo sigue.
  Si se corta la conexion, el seguimiento reconecta solo desde el ultimo evento, y el boton
  "Retomar el ultimo trabajo" lo recupera hasta tres horas despues (el identificador se guarda en
  `localStorage`).
- Los eventos son JSON tipados (`segmentacion`, `transcripcion`, `correccion`, `fin`, `error`), no
  cadenas con prefijos. La barra de progreso se calcula con ellos.
- El limite es de dos horas por audio, no "media hora". El navegador avisa antes de subir si el
  audio es mas largo, pero quien lo hace cumplir es el servicio.
- El ZIP se llama `<nombre del audio>_transcripciones.zip` y la pagina muestra el nombre del audio,
  no un identificador. Mientras arranca la ejecucion en el servidor (hasta casi un minuto con Cloud
  Run Jobs) recuerda cada 20 segundos que el trabajo sigue en marcha.
- Sin experimento A/B.

## Seguridad

- `auth-check.js` sigue siendo solo una cortina de navegador.
- `API_TOKEN` en el HTML es un secreto compartido que **cualquiera puede leer** en el codigo de la
  pagina: solo frena trafico casual. La proteccion real son los limites del servicio: duracion
  maxima, trabajos simultaneos, minutos diarios e instancias maximas.
- Para configurarlo: `gcloud secrets versions access latest --secret=API_TOKEN --project <proyecto>`
  y pegar el valor en la constante `API_TOKEN`.

## Implementacion

- `transcripciones.html`
- `styles.css`

## Integraciones

- `/api/uploads`, `/api/jobs`, `/api/jobs/<id>/events`, `/api/jobs/<id>/result`
- Google Cloud Storage por URL firmada
- El servicio debe permitir el origen `https://fmorondo.github.io` (`ALLOWED_ORIGINS`) y el bucket
  debe tener CORS para `PUT` y `GET` desde ese origen

## Riesgos y limites

- Si el servicio no logra firmar URLs, la subida pasa por la API y Cloud Run limita las peticiones
  HTTP/1 a 32 MiB: los audios grandes fallarian.
- Una pagina publica con token visible no sustituye a un cortafuegos; esta previsto restringir el
  servicio por IP a medio plazo.
- Al estar `API_BASE` y `API_TOKEN` escritos en el HTML, un cambio de URL o de token exige editar y
  publicar la pagina.
