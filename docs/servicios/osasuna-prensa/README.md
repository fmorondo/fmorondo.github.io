# Osasuna prensa

## Resumen

- Entrada: `osasuna-prensa.html`
- Tipo: chat RAG en HTML estatico
- Backend: `https://koldogpt-811896322472.europe-west1.run.app/osasuna-prensa/query`
- Funcion: responder consultas sobre Osasuna con tono periodistico

## Flujo funcional

1. El usuario escribe una consulta.
2. El frontend envia el historial al backend.
3. El backend devuelve `answer_html`, `answer` o `error`.
4. El cliente muestra la respuesta con un alias visual distinto: `Osasuna Prensa`.

## Entradas y salidas

- Entrada: consultas periodisticas.
- Salida: respuestas en tono sobrio y preciso segun la copia de UI.
- Persistencia: solo memoria local de sesion.

## Implementacion

- `osasuna-prensa.html`
- `styles.css`
- `marked` + `DOMPurify` por CDN

## Dependencias externas

- Cloud Run `/osasuna-prensa/query`
- Vector store remota con noticias

## Consideraciones de producto

Este frontend y `osasuna.html` comparten casi toda la implementacion. La diferencia material es el endpoint, el texto de interfaz y la identidad del asistente. A nivel de mantenimiento seria buena candidata a consolidarse en una sola plantilla parametrizable.

## Riesgos y limites

- Misma fragilidad que el resto de chats RAG: sin autenticacion, sin historial persistente, sin instrumentacion visible.
