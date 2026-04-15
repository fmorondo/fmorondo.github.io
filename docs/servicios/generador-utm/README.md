# Generador UTM

## Resumen

- Entrada: `utm.html`
- Tipo: utilidad HTML estatico con uso de acortadores publicos
- Funcion: generar variantes UTM por canal y permitir su acortado

## Flujo funcional

1. El usuario pega una o varias URLs, una por linea.
2. Introduce una seccion que se reutiliza como `utm_campaign`.
3. El frontend crea cuatro variantes por URL:
  - Story de Instagram
  - Post de Instagram
  - WhatsApp
  - LinkedIn
4. Cada caja permite copiar o acortar de forma individual.
5. El boton global `Acortar todo` procesa todas las cajas secuencialmente.

## Implementacion

- `utm.html`
- `styles.css`

## Integraciones externas

- `https://is.gd/create.php`
- `https://v.gd/create.php`

## Parametros generados

Cada configuracion fija `utm_source`, `utm_medium` y otros campos como `utm_content` o `utm_id`. El frontend usa `URL.searchParams.set`, por lo que sobreescribe parametros UTM ya existentes.

## Riesgos y limites

- Depende de servicios publicos de acortado sin autenticacion ni SLA.
- Si una URL no es valida, `addUtmParams` la devuelve sin cambios.
- El nombre `linkedIn` y `Whatsapp` se mantiene tal cual en el codigo; si hay convenciones analiticas estrictas, habria que revisarlo.
