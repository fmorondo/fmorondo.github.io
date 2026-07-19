# Teletipos a Xalok nuevo

## Resumen

- Entrada: `teletiposxaloknuevo.html`
- Tipo: redirect estático
- Función: mantener viva la URL para quien la tuviera guardada, sin duplicar lógica

## Estado actual

Esta página era, en la práctica, una copia completa de `teletipoxalok.html`
(mismo script, mismo flujo; solo cambiaban el título y el `<h1>`). Además no
estaba enlazada desde ningún portal (`redaccion.html` ni
`herramientaskoldo.html`) — solo era alcanzable pegando la URL directamente.

Se ha sustituido por un redirect (`<meta http-equiv="refresh">` +
`rel="canonical"`) hacia `teletipoxalok.html`, que es ahora la única
implementación real. Ver
[Teletipos a Xalok](../teletipos-xalok/README.md) para el flujo funcional
completo.

## Implementación

- `teletiposxaloknuevo.html` (solo redirect, sin `auth-check.js` ni lógica propia)

## Riesgos y límites

- Si alguna vez se quiere retirar del todo, se puede eliminar el archivo sin
  más pasos: no hay enlaces internos que dependan de él.
