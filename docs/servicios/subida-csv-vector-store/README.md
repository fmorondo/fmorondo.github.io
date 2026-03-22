# Subida CSV a vector store

## Resumen

- Entrada: `subidacsv.html`
- Tipo: frontend HTML estatico con backend remoto
- Backend: `https://koldogpt-811896322472.europe-west1.run.app/upload-to-vectorstore`
- Funcion: subir un CSV a una vector store predefinida o manual

## Flujo funcional

1. El usuario elige destino `koldo` u `osasuna`, o pega un `vector_store_id`.
2. Selecciona o arrastra un archivo CSV.
3. El frontend manda `multipart/form-data` con:
  - `file`
  - `vector_store_id`
4. La respuesta del servidor se muestra como JSON formateado en un panel.

## Valores por defecto

- `koldo` -> `vs_6887bf8bb9008191a9a77ea125cc8f67`
- `osasuna` -> `vs_68ac1e0408d88191a6ed948c978b1247`

## Implementacion

- `subidacsv.html`
- `styles.css`

## UX y operativa

- Tiene drag and drop.
- Muestra nombre y tamano del archivo.
- Incluye boton para copiar la respuesta JSON.
- La barra de progreso es aproximada, no esta ligada a bytes reales.

## Riesgos y limites

- No valida el esquema interno del CSV antes de subirlo.
- La seguridad real del acceso a vector stores depende del backend, no del cliente.
