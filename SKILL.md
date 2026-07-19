---
name: portal-redaccion-design
description: Use this skill to style or create any static HTML frontend published in fmorondo.github.io and accessed via the portal de redacción — public-facing utility pages for Diario de Navarra newsroom staff (transcription, PDF/image tools, text conversion, chat assistants). Diario de Navarra blue accent (--brand #2563eb), Inter typeface, card-based single-page layout, emoji used freely in headings/buttons. NOT for internal admin tools without public exposure (Flask/FastAPI + Jinja panels) — those use the separate "panel-de-servicios-design" skill in ../design-system/.
user-invocable: true
---

Read `README.md` (visión general del repo) y `tokens/README.md` (catálogo de
colores, tipografía y clases) antes de tocar nada.

## Cuándo usar este skill (vs. `panel-de-servicios-design`)

Este repo (`fmorondo.github.io`) es el lado **público / redacción**:
frontends 100% estáticos (HTML+CSS+JS, sin backend propio salvo llamadas a
Cloud Run) que un periodista abre desde `redaccion.html` o
`herramientaskoldo.html`. Es un sistema de diseño **distinto y deliberadamente
separado** del de `../design-system/` (Panel de Servicios), que es para
paneles de administración internos (Flask/FastAPI + Jinja) sin exposición
pública. No mezclar paletas, tipografías ni tono entre los dos:

| | `fmorondo.github.io` (este) | `../design-system/` |
|---|---|---|
| Audiencia | Redacción, acceso público vía portal | Administración interna, sin exposición pública |
| Stack | HTML estático (+ opcionalmente Vite/React) | Flask/FastAPI + Jinja |
| Acento | Azul `--brand` `#2563eb` | Terracota "clay" |
| Tipografía | Inter | Manrope + Figtree + IBM Plex Mono |
| Iconos/emoji | Sí, libremente (✍️ 📘 🔄 📥, SVG stroke en cabecera) | No se usan |

Si el servicio nuevo va a vivir en este repo y ser enlazado desde
`redaccion.html`/`herramientaskoldo.html`, usa este skill. Si va a correr
como contenedor Docker en la Raspberry Pi sin URL pública, usa
`panel-de-servicios-design`.

## Cómo crear una página nueva

1. Copia el esqueleto de `comillas.html` (herramienta simple de
   texto/archivo) o `subidacsv.html` / `descarga-parlamento/index.html`
   (si necesita más estado o llamadas a backend) — no partas de cero.
2. `<head>` siempre incluye, en este orden: `auth-check.js`, meta viewport,
   `<title>` con el patrón `Nombre de la herramienta · Diario de Navarra`,
   meta description, los tres `<link>` de Google Fonts (Inter
   400/500/600/700), y `<link rel="stylesheet" href="styles.css">`.
3. Estructura de body: `<header>` con `.brand` (icono SVG stroke +
   "Diario de Navarra · Utilidades" + `.badge` con el nombre corto) →
   `<main>` con una o varias `<section class="card stack">` → `<p
   class="footer">Diario de Navarra · Laboratorio de IA y automatización
   editorial</p>` al final de `<main>`.
4. Usa las clases de `tokens/README.md` (`.stack`, `.row`, `.dropzone`,
   `.result`, `.panel`, `.progress`, `.chat-*`, botones `button`/`a.button`
   + `.btn-secondary`) — no inventes clases nuevas ni colores sueltos. Si
   falta un patrón, añádelo a `styles.css` y documéntalo en
   `tokens/README.md` antes de improvisar inline.
5. Tono de contenido: español, directo, con emoji ligero en títulos y
   botones (✍️ 🔄 📥 📘) — a diferencia del panel interno, aquí sí se usan.
   Incluye siempre un `<details><summary>📘 Instrucciones de uso</summary>`
   con un `.panel` explicando el flujo, si la herramienta no es trivial.
6. Si procesa datos localmente (sin backend), dilo explícitamente en las
   instrucciones ("El proceso se realiza íntegramente en tu navegador").
7. Añade la página nueva a `redaccion.html` (o `herramientaskoldo.html` si
   aplica) y crea su `docs/servicios/<nombre>/README.md` siguiendo las
   convenciones descritas en el `README.md` principal del repo.

## Qué NO hacer

- No usar la paleta o tipografía de `../design-system/` (terracota/Manrope)
  aquí, ni viceversa.
- No quitar `auth-check.js` del `<head>`.
- No crear un sistema de tokens paralelo: todo color/espaciado/radio sale de
  las variables ya definidas en `:root` de `styles.css` (ver
  `tokens/README.md`).
