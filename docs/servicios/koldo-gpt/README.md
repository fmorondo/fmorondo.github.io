# KoldoGPT

## Resumen

- Entrada: `koldo.html`
- Tipo: chat RAG en HTML estatico
- Backend: `https://koldogpt-811896322472.europe-west1.run.app/koldo/query`
- Funcion: consultar noticias etiquetadas de Caso Koldo, Santos Cerdan y Tunel de Belate

## Flujo funcional

1. El usuario escribe una pregunta.
2. El frontend anade el mensaje al historial local `messages`.
3. Hace `POST` JSON al backend con todo el historial.
4. El backend responde con `answer_html`, `answer` o `error`.
5. El frontend renderiza Markdown con `marked` y sanitiza con `DOMPurify`.

## Entradas y salidas

- Entrada: texto libre.
- Salida: respuesta conversacional en HTML o Markdown sanitizado.
- Persistencia: ninguna; el historial vive solo en memoria del navegador.

## Implementacion

- `koldo.html`
- `styles.css`
- Librerias CDN:
  - `marked`
  - `DOMPurify`

## Dependencias externas

- Cloud Run con el slug `/koldo/query`.
- Corpus remoto de noticias, no versionado en este repositorio.

## Consideraciones operativas

- La UI muestra una fecha de actualizacion escrita manualmente en el subtitulo.
- El frontend no implementa autenticacion, cuotas ni trazabilidad.
- Si el backend devuelve HTML, el cliente lo acepta tras sanitizarlo.

## Riesgos y limites

- El comportamiento real depende por completo del prompt y corpus del backend.
- No hay almacenamiento de conversaciones ni recuperacion al recargar pagina.
