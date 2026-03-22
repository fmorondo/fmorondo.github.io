# fmorondo.github.io

Repositorio de frontends estaticos para utilidades internas de Diario de Navarra y proyectos relacionados. La mayor parte del codigo son paginas HTML autocontenidas; los dos servicios de PDF mas recientes estan hechos con React + Vite y se publican en subcarpetas.

## Vision general

- `index.html` es la portada general y agrupa las herramientas por flujo de trabajo.
- `redaccion.html` y `herramientaskoldo.html` actuan como portales de acceso rapido.
- Hay dos familias de servicios:
  - Frontends 100% cliente: procesan texto, imagen o PDF en el navegador y no envian datos a terceros.
  - Frontends con backend: delegan trabajo en servicios Cloud Run para RAG, transcripcion, descarga de audio o carga a vector store.
- Los estilos compartidos viven en `styles.css`.
- `lib/pdf.min.js` y `lib/pdf.worker.min.js` se usan en la herramienta de portada para rasterizar PDF en cliente.

## Mapa documental

### Portales

- [Portal de redaccion](docs/portales/redaccion/README.md)
- [Herramientas Koldo](docs/portales/herramientas-koldo/README.md)

### Asistentes y buscadores

- [KoldoGPT](docs/servicios/koldo-gpt/README.md)
- [Osasuna chat](docs/servicios/osasuna-chat/README.md)
- [Osasuna prensa](docs/servicios/osasuna-prensa/README.md)
- [Asesor de cumplimiento](docs/servicios/asesor-cumplimiento/README.md)

### Transcripcion y audio

- [Transcripciones](docs/servicios/transcripciones/README.md)
- [Transcripciones parser2](docs/servicios/transcripciones-parser2/README.md)
- [Descargar audio](docs/servicios/descargar-audio/README.md)

### Edicion y publicacion

- [Conversor de comillas](docs/servicios/conversor-comillas/README.md)
- [Teletipos a Xalok](docs/servicios/teletipos-xalok/README.md)
- [Teletipos a Xalok nuevo](docs/servicios/teletipos-xalok-nuevo/README.md)
- [Generador UTM](docs/servicios/generador-utm/README.md)
- [Descarga de noticias por Tag ID](docs/servicios/descarga-tags/README.md)
- [Subida CSV a vector store](docs/servicios/subida-csv-vector-store/README.md)

### Imagen y portada

- [Compositor de fotos](docs/servicios/compositor-fotos/README.md)
- [Ajuste vertical](docs/servicios/ajuste-vertical/README.md)
- [Portada para Twitter X](docs/servicios/portada-twitter/README.md)

### PDF

- [PDF a JPG/PDF](docs/servicios/pdf-to-jpg/README.md)
- [Fusionador PDF](docs/servicios/pdf-merger/README.md)

## Arquitectura del repositorio

- HTML estatico en raiz:
  - Cada pagina tiene su propio script inline o un JS dedicado.
  - La publicacion es trivial: copiar archivos a hosting estatico.
- Microfrontends con Vite:
  - `pdf-merger/`
  - `pdf-to-jpg/`
  - Ambos usan `base` configurada para publicarse en subruta.
- Dependencias externas de frontend:
  - Google Fonts en la mayoria de paginas.
  - `marked` + `DOMPurify` en los chats RAG.
  - `pdfjs-dist`, `pdf-lib` y `jszip` en herramientas PDF.

## Convenciones usadas en la documentacion

Cada README de `docs/` responde a estas preguntas:

- Que problema resuelve el frontend.
- Si procesa datos localmente o los envia a backend.
- Cual es el flujo de usuario y la salida esperada.
- Que archivos implementan el servicio.
- Que integraciones, dependencias o limites operativos hay que conocer.

Quedan fuera de esta capa documental los servicios enlazados pero no versionados aqui, como GPTs externos o monitores alojados en otros dominios.

## Observaciones de mantenimiento

- El repositorio mezcla codigo fuente y artefactos compilados, especialmente en `pdf-to-jpg/`.
- Algunas herramientas muestran fechas o mensajes de estado escritos a mano en la UI; conviene revisarlos periodicamente.
- Varias paginas dependen de endpoints de Cloud Run hardcodeados. Si cambian, hay que actualizar el frontend manualmente.
