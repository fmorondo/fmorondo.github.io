# Descargar audio

## Resumen

- Entrada: `descargar-audio.html`
- Tipo: frontend HTML estatico con backend remoto
- Backend: `https://descarga-audio-811896322472.europe-west1.run.app/download`
- Funcion: extraer audio MP3 de una URL de video y descargarlo

## Flujo funcional

1. El usuario pega una URL de video.
2. El frontend hace `POST` JSON con `{ url }`.
3. Si el backend responde `200`, la respuesta se trata como `blob` MP3.
4. El nombre del archivo se obtiene de `Content-Disposition` si existe.
5. El navegador fuerza la descarga con un enlace temporal.

## Entradas y salidas

- Entrada: URL de YouTube, Instagram, TikTok u otras plataformas compatibles por backend.
- Salida: archivo MP3 descargado localmente.

## Implementacion

- `descargar-audio.html`
- `styles.css`

## Consideraciones operativas

- El progreso visual es ficticio: la barra pasa del 50% al 100%, no representa avance real.
- La UI incluye una nota manual sobre problemas con YouTube en noviembre de 2025.
- El error 504 se interpreta como timeout y se muestra con un mensaje amigable.

## Riesgos y limites

- Todo el trabajo real esta fuera del repo.
- No hay validacion previa de duracion, plataforma o disponibilidad del video.
- El frontend no resuelve restricciones legales o de derechos de uso del contenido.
