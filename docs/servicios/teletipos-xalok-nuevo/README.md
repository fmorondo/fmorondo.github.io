# Teletipos a Xalok nuevo

## Resumen

- Entrada: `teletiposxaloknuevo.html`
- Tipo: utilidad HTML estatico 100% cliente
- Funcion: misma conversion a pegado compatible con Xalok que la version clasica
- Procesamiento: local

## Estado actual

El codigo de esta pagina es, en la practica, equivalente al de `teletipoxalok.html`. Cambian el titulo y el nombre comercial mostrado en la UI, pero la implementacion y el flujo son los mismos.

## Flujo funcional

- Normalizacion de texto y HTML pegado
- Reconstruccion de parrafos
- Generacion de `text/plain` y `text/html`
- Copia automatica al portapapeles con fallback

## Implementacion

- `teletiposxaloknuevo.html`
- `styles.css`

## Recomendacion de mantenimiento

Si ambas paginas deben seguir conviviendo, conviene parametrizar una sola implementacion para evitar divergencias invisibles. A dia de hoy mantener dos copias completas del mismo script encarece cualquier cambio.

## Riesgos y limites

- Mismos que la version clasica: dependencia del portapapeles y ausencia de formateo editorial adicional.
