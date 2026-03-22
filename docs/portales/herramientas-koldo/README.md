# Herramientas Koldo

## Resumen

- Entrada: `herramientaskoldo.html`
- Tipo: portal HTML estatico
- Funcion: acceso rapido a utilidades operativas del ecosistema Koldo
- Procesamiento: no procesa datos; solo enruta a otras paginas

## Que ofrece

Es un lanzador muy ligero con tres accesos:

- Descarga de noticias por Tag ID
- Subida de CSV a vector store
- Variante de pruebas del transcriptor (`transcripciones2.html`)

## Flujo de uso

1. Abrir `herramientaskoldo.html`.
2. Hacer clic en la utilidad deseada.
3. La herramienta se abre en una nueva pestana usando URLs absolutas de `fmorondo.github.io`.

## Archivos implicados

- `herramientaskoldo.html`
- `styles.css`

## Dependencias y mantenimiento

- No tiene logica de negocio.
- Usa enlaces absolutos a produccion, no relativos al repo.
- Esta orientado a operativa interna y asume que el hosting publico sigue siendo `https://fmorondo.github.io/`.

## Riesgos y limites

- Si el dominio, la ruta o el slug de cualquier herramienta cambian, el portal se rompe.
- No detecta caidas de los servicios enlazados.
