# PDF a JPG PDF

## Resumen

- Entrada: `pdf-to-jpg/`
- Tipo: microfrontend React + Vite
- Funcion: cargar un PDF, seleccionar paginas visualmente o por rango, y exportarlas como PDF parcial o JPG en ZIP
- Procesamiento: 100% cliente

## Flujo funcional

1. El usuario arrastra o selecciona un PDF.
2. `pdfjs-dist` carga el documento.
3. Si el PDF tiene hasta 100 paginas, genera miniaturas y usa seleccion visual.
4. Si el PDF supera las 100 paginas, activa automaticamente la seleccion por rango para evitar renderizar todas las miniaturas.
5. El usuario selecciona paginas de forma individual, masiva o escribiendo rangos como `1-5, 8, 10-12`.
6. Elige:
  - formato de salida `PDF` o `JPG (ZIP)`
  - calidad `baja` o `alta`
7. El frontend exporta:
  - PDF parcial con `pdf-lib`
  - ZIP de JPGs con `JSZip`, mostrando progreso durante la exportacion

## Implementacion

- `pdf-to-jpg/App.tsx`
- `pdf-to-jpg/components/Icons.tsx`
- `pdf-to-jpg/index.tsx`
- `pdf-to-jpg/index.source.html` (incluye `/auth-check.js` — antes faltaba, a diferencia del resto de servicios del portal)
- `pdf-to-jpg/package.json`
- `pdf-to-jpg/vite.config.ts`

## Dependencias

- `react`
- `react-dom`
- `pdfjs-dist`
- `pdf-lib`
- `jszip`

## Despliegue y build

- `npm install`
- `npm run dev`
- `npm run build`
- La base de Vite esta fijada en `/pdf-to-jpg/`.
- `npm run dev` copia primero `index.source.html` sobre `index.html` para que Vite use la entrada fuente.
- `npm run build` recompila desde `index.source.html` y copia la salida publicada a `pdf-to-jpg/index.html` y `pdf-to-jpg/assets/`.

## Detalles tecnicos

- Worker PDF.js servido como asset local generado por Vite, sin dependencia de CDN externo.
- Umbral de PDF extenso: mas de 100 paginas.
- Sintaxis de rango: paginas sueltas y rangos separados por coma, por ejemplo `1-5, 8, 10-12`.
- Calidad alta JPG: escala `2.0`, calidad `0.92`
- Calidad baja JPG: escala `1.0`, calidad `0.75`
- Exportacion JPG: procesa las paginas seleccionadas de forma secuencial para reducir picos de memoria.
- El footer menciona React, Tailwind CSS y Gemini; es una nota de UI, no una dependencia ejecutada en runtime.

## Riesgos y limites

- En modo visual genera las miniaturas por adelantado; por eso los PDFs de mas de 100 paginas pasan automaticamente al modo por rango.
- La exportacion JPG de muchas paginas sigue siendo costosa porque renderiza las paginas seleccionadas y genera el ZIP en el navegador, aunque ahora evita lanzar todos los renderizados en paralelo.
