# Portada para Twitter X

## Resumen

- Entrada: `portadaweb.html`
- Tipo: utilidad HTML estatico con PDF.js local
- Funcion: generar una imagen `474x250` de la portada del periodico y copiar un texto acompañante
- Procesamiento: 100% cliente

## Flujo funcional

1. El usuario sube un PDF, JPG o PNG.
2. Si es PDF, el frontend rasteriza la primera pagina con `pdf.js`.
3. Genera una composicion en canvas:
  - fondo usando la franja superior con opacidad configurable
  - primer plano con la portada completa ajustada por alto
4. El boton principal:
  - copia un texto con la fecha actual de Madrid y una URL fija
  - descarga un JPG `portada_474x250.jpg`

## Implementacion

- `portadaweb.html`
- `styles.css`
- `lib/pdf.min.js`
- `lib/pdf.worker.min.js`

## Parametros visibles en UI

- alto de franja superior
- opacidad del fondo
- margen
- calidad JPG

## Observaciones tecnicas

- La fecha del texto se construye en cliente con `Intl.DateTimeFormat` y `Europe/Madrid`.
- La URL copiada es fija: `https://www.diariodenavarra.es/pags/portada-dia.html`.
- El deslizador de margen define el area util interior del render: deja un borde blanco y reajusta tanto el fondo como la portada principal.

## Riesgos y limites

- Solo usa la primera pagina del PDF.
- No hay recorte manual ni plantilla multiple para otras redes.
