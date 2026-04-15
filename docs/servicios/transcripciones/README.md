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
