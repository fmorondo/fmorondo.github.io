# Descarga de vídeo

## Resumen

- Entrada: `descargar-video.html`
- Tipo: frontend HTML estatico con backend remoto
- Backend: `https://descargavideos-811896322472.europe-west1.run.app` (repo `descargavideos`)
- Funcion: validar una publicacion de X, Instagram o TikTok y descargar su video MP4 tras aprobacion manual

## Flujo funcional

1. El usuario pega la URL de una publicacion individual.
2. El frontend hace `POST /validate` con `{ url }`.
3. El backend responde con URL normalizada, post ID, cuenta, titulo, una senal de si parece cuenta institucional y un porcentaje de confianza, junto a un `validation_token`.
4. El usuario revisa los datos y marca la casilla de aprobacion manual.
5. El frontend hace `POST /download` con `{ validation_token, manual_approved: true }`.
6. Si el backend responde `200`, la respuesta se trata como `blob` MP4 y se fuerza la descarga; el nombre sale de `Content-Disposition` si existe.
7. Al cargar la pagina, tambien se pide `GET /platforms` para listar plataformas soportadas y si requieren cookies.

## Entradas y salidas

- Entrada: URL de una publicacion de X, Instagram o TikTok.
- Salida: archivo MP4 descargado localmente.

## Implementacion

- `descargar-video.html`
- `styles.css`

## Consideraciones operativas

- La descarga queda bloqueada hasta que hay `validation_token` **y** la casilla de aprobacion manual esta marcada.
- El error 504 en la descarga se interpreta como timeout por video pesado o plataforma sin respuesta.
- La validacion es orientativa: la UI advierte explicitamente que la API no confirma derechos de uso ni licencias.

## Riesgos y limites

- Todo el trabajo real (deteccion de plataforma, verificacion de cuenta, descarga) esta fuera del repo, en `descargavideos`.
- No hay control de acceso en el frontend; la aprobacion manual es solo una casilla de UI, no una verificacion de identidad.
- El frontend no resuelve restricciones legales o de derechos de uso del contenido descargado.
