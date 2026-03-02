# Ajuste Vertical · 1920×1125

Herramienta frontend para convertir imágenes verticales en composiciones horizontales de **1920×1125 px** con fondo desenfocado.

## Características

- ✅ Carga de imagen con **drag & drop** o click
- ✅ Preview en tiempo real de 1920×1125 px
- ✅ **Fondo**: imagen con `blur(12px)` a 15% opacidad (escalable)
- ✅ **Primer plano**: imagen centrada (escalable y recolocable)
- ✅ Recoloca el primer plano **arrastrando con el ratón o táctil**
- ✅ Exporta a **JPG** con nombre basado en el original
- ✅ UI integrada con estilos globales

## Uso

1. Abre `ajustevertical.html` en el navegador
2. Carga una imagen vertical (arrastra o haz clic)
3. Ajusta los sliders:
   - **Escala del primer plano** (0.8–1.6): tamaño de la imagen principal
   - **Escala del fondo** (1.0–2.2): zoom del fondo borroso
4. Arrastra sobre la imagen para recolocar el primer plano
5. Haz clic en **Reset posición** para volver al centro
6. Exporta a **JPG** (nombre: `archivo-1920x1125.jpg`)

## Estructura

```
ajustevertical.html      → HTML principal (en raíz)
ajustevertical/script.js  → Lógica (drag, canvas, export)
```

## Requisitos técnicos

- Canvas 2D con soporte para `filter: blur()`
- `createImageBitmap` (con fallback a `Image`)
- `canvas.toBlob()` para exportación
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## Notas

- Resolucion interna fija: **1920×1125**
- Blur fijo: **12px** en fondo
- Opacidad fondo: **15%**
- Calidad JPG: **92%**
- Cursor: `grab` en canvas cuando hay imagen, `grabbing` durante drag
