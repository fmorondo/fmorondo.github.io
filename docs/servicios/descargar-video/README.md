# Descarga de vídeo

## Resumen

- Entrada: `descargar-video.html`
- Tipo: frontend HTML estatico con backend remoto
- Backend: `https://descargavideos-811896322472.europe-west1.run.app` (repo `descargavideos`)
- Funcion: descargar el video MP4 de una publicacion de X, Instagram o TikTok

## Flujo funcional

1. El usuario pega la URL de una publicacion individual y pulsa "Descargar MP4".
2. El frontend hace `POST /validate` con `{ url }` para obtener un `validation_token` (el backend lo exige antes de permitir la descarga; no expone un endpoint que descargue directamente por URL).
3. Sin mostrar el resultado de la validacion al usuario, el frontend encadena `POST /download` con `{ validation_token, manual_approved: true }`.
4. Si el backend responde `200`, la respuesta se trata como `blob` MP4 y se fuerza la descarga; el nombre sale de `Content-Disposition` si existe.
5. Al cargar la pagina, tambien se pide `GET /platforms` para listar plataformas soportadas y si requieren cookies.

## Entradas y salidas

- Entrada: URL de una publicacion de X, Instagram o TikTok.
- Salida: archivo MP4 descargado localmente.

## Implementacion

- `descargar-video.html`
- `styles.css`

## Consideraciones operativas

- No hay revision manual visible al usuario: el frontend llama a `/validate` y `/download` en el mismo click, sin mostrar cuenta, confianza ni motivos de la validacion, y siempre envia `manual_approved: true`. El backend (`descargavideos`, ver `app/services/downloader.py`) no verifica que un humano haya revisado nada: `manual_approved` es solo un booleano que el cliente controla, asi que quitar la UI de revision no reduce ninguna garantia real que existiera antes.
- El error 504 en la descarga se interpreta como timeout por video pesado o plataforma sin respuesta.
- La API no confirma derechos de uso ni licencias del contenido descargado.
- El progreso de `/download` es real (lee la respuesta por streaming contra `Content-Length`). El paso interno `/validate` sigue mostrando un valor fijo (20% al iniciar, 45% al obtener el token): es una unica peticion/respuesta JSON sin bytes que trocear, asi que no hay progreso real posible sin instrumentar el backend.

## Riesgos y limites

- Todo el trabajo real (deteccion de plataforma, verificacion de cuenta, descarga) esta fuera del repo, en `descargavideos`.
- No hay control de acceso en el frontend mas alla de `auth-check.js`; no existe verificacion de identidad ni revision humana antes de descargar.
- El frontend no resuelve restricciones legales o de derechos de uso del contenido descargado.
