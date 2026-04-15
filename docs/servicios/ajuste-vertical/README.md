# Ajuste vertical

## Resumen

- Entrada: `ajustevertical.html`
- Tipo: utilidad HTML + JS dedicado
- Funcion: convertir una foto vertical en una composicion horizontal `1920x1125`
- Procesamiento: 100% cliente

## Flujo funcional

1. El usuario carga una imagen.
2. El script genera dos capas sobre canvas:
  - fondo con `blur(12px)` y opacidad `0.15`
  - primer plano nitido ajustado por altura
3. El usuario puede:
  - cambiar escala del primer plano
  - cambiar escala del fondo
  - arrastrar la foto principal para recolocarla
4. Exporta un JPG con nombre derivado del original.

## Implementacion

- `ajustevertical.html`
- `ajustevertical/script.js`
- `styles.css`
- `ajustevertical/README.md` ya existia como documentacion tecnica breve

## Parametros relevantes

- Canvas: `1920x1125`
- Escala primer plano: `0.8` a `1.6`
- Escala fondo: `1.0` a `2.2`
- Calidad JPG: `0.92`

## Dependencias

- Canvas 2D
- `createImageBitmap` con fallback a `Image`
- `canvas.toBlob()`

## Riesgos y limites

- No hay recorte inteligente ni deteccion de sujeto.
- Todo el encuadre depende del ajuste manual del usuario.
