# Tokens — Portal de Redacción

Catálogo de referencia de las variables y clases ya definidas en `../styles.css`
(fuente de verdad — este archivo solo las documenta, no las duplica). Sirve
para no reinventar valores sueltos al crear una página nueva.

## Colores (`:root` en `styles.css`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#f6f8fb` | Fondo general de página |
| `--panel` | `#ffffff` | Fondo de tarjetas (extremo superior del degradado) |
| `--panel-2` | `#f2f5fb` | Fondo de tarjetas (extremo inferior del degradado) |
| `--text` | `#0f172a` | Texto principal |
| `--muted` | `#667085` | Texto secundario (subtítulos, hints, footer) |
| `--brand` | `#2563eb` | Azul Diario de Navarra · IA — acento primario, enlaces, foco |
| `--brand-2` | `#1d4ed8` | Azul oscuro — extremo del degradado en botones/progreso |
| `--ok` | `#16a34a` | Éxito |
| `--warn` | `#d97706` | Advertencia |
| `--error` | `#ef4444` | Error |
| `--border` | `#d0d5dd` | Bordes de tarjetas, inputs, separadores |
| `--radius` | `16px` | Radio de tarjetas |
| `--shadow` | `0 8px 24px rgba(0,0,0,.08)` | Sombra de tarjetas/contenedores elevados |

No se ha formalizado modo oscuro para este sistema (a diferencia de
`design-system/`, que sí lo soporta vía tokens).

## Tipografía

- **Inter** vía Google Fonts (`400;500;600;700`), cargada con
  `<link rel="preconnect">` + `<link href="...css2?family=Inter...">` en el
  `<head>` de cada página — copiar ese bloque tal cual en páginas nuevas.
- Monoespaciada para código/resultados: pila del sistema
  (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`), sin
  fuente cargada aparte.
- Tamaños con clases, no ad-hoc: `.title` (28px, 22px en móvil), `.subtitle`
  (color `--muted`), `.footer` (12px, centrado, `--muted`).

## Catálogo de clases (todas en `styles.css`, no inventar nuevas)

| Patrón | Clase(s) |
|---|---|
| Contenedor de página | `<header>` (marca + badge) + `<main>` (grid de tarjetas) |
| Marca de cabecera | `.brand` (icono SVG stroke + texto + `.badge` con el nombre corto de la herramienta) |
| Tarjeta de contenido | `.card` (envuelve cada sección funcional de la página) |
| Agrupación vertical | `.stack` / `.stack-tight` (gap reducido) |
| Agrupación horizontal | `.row` (para grupos de botones o controles en línea) |
| Grid de accesos (portales) | `.tool-list` (2 columnas, 1 en móvil) |
| Botón primario | `button` / `a.button` (degradado azul por defecto) |
| Botón secundario | añadir `.btn-secondary` |
| Inputs | `input[type=text/number/file]`, `select` — estilizados por selector de tipo, no por clase |
| Textarea | hereda el mismo estilo de input (ver `styles.css`, no tiene clase propia) |
| Zona de arrastrar archivo | `.dropzone` (+ `.dragover` en JS al hacer drag) |
| Barra de progreso | `.progress > div` (ancho vía JS) |
| Resultado/log monoespaciado | `.result` |
| Panel informativo secundario | `.panel` / `.info` (dentro de `<details>` o como bloque de ayuda) |
| Chat | `.chat-wrap`, `.chat-container`, `.message`, `.row.user` / `.row.assistant`, `.meta` |
| Ocultar elemento | `.hidden` |

## Qué NO hacer

- No introducir una paleta distinta (verdes, morados, grises puros) — el
  acento es siempre el azul `--brand`/`--brand-2`.
- No cargar otra fuente de cuerpo — Inter es la única.
- No crear un `<style>` inline nuevo por página: si falta un patrón visual,
  añadirlo a `styles.css` como clase reutilizable y documentarlo aquí.
- No confundir este sistema con el de `../design-system/` (Panel de
  Servicios): son deliberadamente distintos — ver `../SKILL.md` para cuándo
  usar cada uno.
