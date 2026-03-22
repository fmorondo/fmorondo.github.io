# Descarga de noticias por Tag ID

## Resumen

- Entrada: `descargatags.html`
- Tipo: frontend HTML estatico
- Funcion: abrir una consulta interna a Xalok por `tagid`
- Procesamiento: el frontend solo construye una URL y abre una pestana nueva

## Flujo funcional

1. El usuario introduce un numero de `Tag ID`.
2. El script construye la URL:
   `https://its.diariodenavarra.es/privado/tag-news/xalok/api_tags.php?tagid=<id>&htmltags=remove`
3. Abre esa direccion en una nueva pestana.

## Implementacion

- `descargatags.html`
- `styles.css`

## Consideraciones funcionales

- La propia pagina documenta varios `Tag ID` conocidos: Caso Koldo, Santos Cerdan, Tunel de Belate y Osasuna.
- No descarga ni parsea nada en cliente; delega todo al endpoint interno.

## Riesgos y limites

- La herramienta depende de una URL interna fuera de este repositorio.
- No hay validaciones adicionales aparte de que el campo no este vacio.
