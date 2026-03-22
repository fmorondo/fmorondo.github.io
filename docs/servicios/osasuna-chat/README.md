# Osasuna chat

## Resumen

- Entrada: `osasuna.html`
- Tipo: chat RAG en HTML estatico
- Backend: `https://koldogpt-811896322472.europe-west1.run.app/osasuna/query`
- Funcion: responder preguntas sobre Osasuna con tono para aficionados

## Flujo funcional

El patron tecnico es el mismo que en KoldoGPT:

1. Captura de pregunta y acumulacion en `messages`.
2. `POST` al backend con historial completo.
3. Renderizado de respuesta en Markdown o HTML sanitizado.
4. Scroll automatico del chat y gestion de errores de red.

## Entradas y salidas

- Entrada: preguntas libres sobre Osasuna.
- Salida: respuestas apoyadas en documentos de vector store, segun el texto de la UI.
- Persistencia: no existe.

## Implementacion

- `osasuna.html`
- `styles.css`
- CDN:
  - `marked`
  - `DOMPurify`

## Dependencias externas

- Endpoint Cloud Run `/osasuna/query`.
- Corpus remoto de noticias de Osasuna.

## Diferenciador funcional

La UI explicita que el tono debe ser cercano y para aficionados. Esa personalizacion no esta en el frontend: depende del backend y del prompt que haya detras del slug.

## Riesgos y limites

- La fecha de actualizacion del corpus esta hardcodeada en el subtitulo.
- No hay citacion de fuentes ni visibilidad del documento recuperado.
