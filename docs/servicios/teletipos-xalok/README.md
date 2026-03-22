# Teletipos a Xalok

## Resumen

- Entrada: `teletipoxalok.html`
- Tipo: utilidad HTML estatico 100% cliente
- Funcion: preservar parrafos al pegar teletipos en Xalok
- Procesamiento: completamente local, con uso del portapapeles del navegador

## Flujo funcional

1. El usuario pega un teletipo en el textarea.
2. El frontend normaliza saltos de linea y espacios especiales.
3. Si el portapapeles trae HTML pero el texto plano viene aplanado, reconstruye parrafos desde el HTML.
4. Genera dos salidas:
  - `plain`: texto con doble salto entre parrafos
  - `html`: contenido rico separado con `<br><br>`
5. Intenta copiar al portapapeles con `ClipboardItem`.
6. Si falla, usa un `contenteditable` oculto y `document.execCommand("copy")`.

## Implementacion

- `teletipoxalok.html`
- `styles.css`

## Decisiones de compatibilidad

- No usa etiquetas `<p>` en la copia rica porque la nota del codigo indica que el CMS las estaba escapando como texto.
- Usa `<br><br>` para separar parrafos.
- El boton de reintento solo aparece si falla la copia automatica.

## Riesgos y limites

- El exito depende del soporte de portapapeles del navegador y de permisos del usuario.
- No anade formato editorial extra; solo preserva estructura de parrafos.
