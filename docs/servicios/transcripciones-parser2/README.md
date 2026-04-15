# Transcripciones parser2

## Resumen

- Entrada: `transcripciones2.html`
- Tipo: variante experimental del transcriptor
- Backend base: `https://transcriptor-prompts-811896322472.europe-west1.run.app`
- Funcion: probar otra implementacion de parser SSE y un flag extra de contexto navarro

## Diferencias respecto a Transcripciones

- Usa otro backend base, aparentemente mas cercano a staging o pruebas.
- Anade el checkbox `usar_contexto_navarra=true`.
- Implementa otro parser de bloques SSE con buffer incremental.
- Usa otra estrategia de verificacion del ZIP y otro flujo de descarga automatica.

## Flujo funcional

1. Solicita URL firmada en `/firmar-subida`.
2. Sube el audio por `PUT`.
3. Construye la URL de `/transcribir-stream` con idioma, prompt y, opcionalmente, contexto navarro.
4. Consume el stream, buscando `DOWNLOAD_URL::` o `DOWNLOAD::`.
5. Si llega una URL firmada, intenta descargar de inmediato y muestra un enlace manual.

## Entradas y salidas

- Entrada:
  - audio
  - idioma
  - prompt
  - opcion de contexto navarro
- Salida:
  - ZIP descargable
  - log textual del backend

## Implementacion

- `transcripciones2.html`
- `styles.css`

## Riesgos y limites

- El footer y el titulo no distinguen visualmente que es una variante experimental; el contexto real lo aporta el portal y el nombre del archivo.
- Mezcla texto plano con nodos HTML dentro de un `<pre>` para el fallback de descarga manual.
- Sigue dependiendo de convenciones de texto en el stream para detectar hitos.
