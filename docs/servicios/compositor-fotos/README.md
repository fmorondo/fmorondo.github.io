# Compositor de fotos

## Resumen

- Entrada: `ajustafotos.html`
- Tipo: utilidad HTML + JS dedicado
- Funcion: montar composiciones de 2 a 12 imagenes con fondo de color o imagen
- Procesamiento: 100% cliente

## Flujo funcional

1. El usuario anade imagenes por selector, carpeta o drag and drop.
2. Opcionalmente define fondo por color o por imagen desenfocada.
3. El sistema calcula una reticula segun el numero de fotos:
  - 2 a 5: una fila
  - 6 a 12: dos filas; la inferior recibe mas fotos si el numero es impar
4. Se puede:
  - seleccionar una foto
  - hacer zoom
  - arrastrarla para reencuadrar
  - activar modo reordenar y permutar marcos
5. Exporta un JPG final.

## Implementacion

- `ajustafotos.html`
- `ajustafotos/scriptajusta.js`
- `ajustafotos/estiloajusta.css`

## Entradas y salidas

- Entrada:
  - imagenes `image/*`
  - fondo opcional `image/*`
- Salida:
  - descarga JPG con nombre configurable

## Limites operativos

- Minimo 2 fotos
- Maximo 12 fotos
- Blur de fondo por imagen: `18px`

## Observacion tecnica

La herramienta trabaja y exporta en `1920x1125`. La vista previa CSS se escala de forma proporcional para mantener esa misma relacion de aspecto sin alterar el lienzo real.
