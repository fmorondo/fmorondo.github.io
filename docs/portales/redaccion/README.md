# Portal de redaccion

## Resumen

- Entrada: `redaccion.html`
- Tipo: portal HTML estatico
- Funcion: agrupar accesos por flujo editorial para reducir clics
- Procesamiento: no procesa datos; solo enlaza a servicios internos y externos

## Que ofrece

El portal organiza herramientas en cuatro bloques: transcripcion y audio, edicion y publicacion, imagen y PDF. Es una capa de navegacion pensada para usuarios de redaccion, no un servicio de negocio por si misma.

## Flujo de uso

1. El usuario abre `redaccion.html`.
2. Selecciona un bloque funcional.
3. El portal abre la herramienta elegida en una nueva pestana.

## Servicios enlazados

- Internos del repositorio:
  - `transcripciones.html`
  - `descargar-audio.html`
  - `utm.html`
  - `comillas.html`
  - `teletipoxalok.html`
  - `ajustafotos.html`
  - `portadaweb.html`
  - `ajustevertical.html`
  - `pdf-to-jpg/index.html`
  - `pdf-merger/index.html`
- Externos al repositorio:
  - Tres GPTs de ChatGPT para correccion, edicion y formato
  - `http://monitor.fmorondo.com`

## Archivos implicados

- `redaccion.html`
- `styles.css`

## Dependencias y mantenimiento

- No requiere backend propio.
- Su valor depende de que los enlaces sigan vigentes.
- El portal mezcla servicios versionados aqui con herramientas externas que no se pueden mantener desde este repo.

## Riesgos y limites

- Si cambia una URL de ChatGPT, Cloud Run o subruta Vite, el portal deja de apuntar al destino correcto.
- No existe control de permisos ni feature flags en el frontend.
