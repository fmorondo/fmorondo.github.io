# Fusionador PDF

## Resumen

- Entrada: `pdf-merger/`
- Tipo: microfrontend React + Vite
- Funcion: cargar varios PDFs, ordenarlos y fusionarlos en un solo archivo
- Procesamiento: 100% cliente

## Flujo funcional

1. El usuario carga varios archivos PDF.
2. `usePdfManager` filtra archivos validos y genera miniaturas del primer folio con `pdfjs-dist`.
3. La lista se muestra en modo rejilla o lista.
4. El usuario puede:
  - eliminar archivos
  - reordenarlos por drag and drop
  - limpiar todo
5. Al fusionar, el frontend pide un nombre y usa `pdf-lib` para componer un nuevo documento descargable.

## Implementacion

- `pdf-merger/App.tsx`
- `pdf-merger/hooks/usePdfManager.ts`
- `pdf-merger/components/*`
- `pdf-merger/types.ts`
- `pdf-merger/vite.config.ts`

## Dependencias

- `react`
- `react-dom`
- `pdf-lib`
- `pdfjs-dist`

## Despliegue y build

- `npm install`
- `npm run dev`
- `npm run build`
- Base Vite: `/pdf-merger/`
- Build target: `es2022`

## Consideraciones tecnicas

- El worker de PDF.js se carga desde `esm.sh`.
- La miniatura usa solo la primera pagina y una escala de `0.3`.
- `mergePdfs()` usa `ignoreEncryption: true` al cargar los PDF de origen.

## Riesgos y limites

- No hay soporte visible para contrasenas ni errores detallados por archivo.
- El identificador de archivo concatena nombre y `Date.now()`, suficiente para UI pero no estable para trazabilidad.
