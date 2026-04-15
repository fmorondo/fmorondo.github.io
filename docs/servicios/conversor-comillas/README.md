# Conversor de comillas

## Resumen

- Entrada: `comillas.html`
- Tipo: utilidad HTML estatico 100% cliente
- Funcion: convertir comillas angulares `« »` a comillas altas `“ ”`
- Procesamiento: completamente local

## Flujo funcional

1. El usuario pega texto o carga un `.txt`.
2. El frontend aplica una cadena simple de reemplazos.
3. El resultado se muestra en un segundo textarea.
4. El usuario puede descargar un nuevo `.txt`.

## Entradas y salidas

- Entrada:
  - texto pegado
  - archivo `.txt`
- Salida:
  - texto convertido
  - descarga opcional `texto_corregido.txt`

## Implementacion

- `comillas.html`
- `styles.css`

## Logica exacta

El script hace cuatro reemplazos:

- `«` por `“`
- `»` por `”`
- `““` por `“`
- `””` por `”`

## Riesgos y limites

- No distingue comillas anidadas ni contexto tipografico.
- No corrige apostrofos, comillas rectas ni casos mixtos.
- Es una utilidad deliberadamente simple y deterministicamente local.
