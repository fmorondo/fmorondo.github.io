# Asesor de cumplimiento

## Resumen

- Entrada: `buscadorprotocolo.html`
- Tipo: chat RAG en HTML estatico
- Backend: `https://buscador-protocolos-gli-811896322472.europe-west1.run.app/query`
- Funcion: consultas internas sobre seguridad, cumplimiento, ciberseguridad y prevencion de acoso

## Flujo funcional

1. El usuario plantea un caso o una duda.
2. El frontend serializa el historial en `messages`.
3. Hace `POST` al endpoint `/query`.
4. La respuesta se renderiza como HTML sanitizado o Markdown.

## Entradas y salidas

- Entrada: texto libre.
- Salida: respuesta del asesor basada en documentacion corporativa, segun la UI.
- Persistencia: ninguna.

## Implementacion

- `buscadorprotocolo.html`
- `styles.css`
- `marked` + `DOMPurify`

## Dependencias externas

- Cloud Run dedicado para GLI.
- Vector store o corpus documental externo al repositorio.

## Consideraciones de seguridad

- El frontend no aplica control de acceso.
- El servicio trata informacion potencialmente sensible; la proteccion real debe estar en backend, red o SSO.

## Riesgos y limites

- El usuario no ve citas, fuentes ni version de documentos.
- Si el backend cambia su contrato, el cliente no tiene validaciones mas alla de comprobar `answer_html`, `answer` o `error`.
