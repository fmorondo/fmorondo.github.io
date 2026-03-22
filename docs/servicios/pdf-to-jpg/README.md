# PDF a JPG PDF

## Resumen

- Entrada: `pdf-to-jpg/`
- Tipo: microfrontend React + Vite
- Funcion: cargar un PDF, seleccionar paginas y exportarlas como PDF parcial o JPG en ZIP
- Procesamiento: 100% cliente

## Flujo funcional

1. El usuario arrastra o selecciona un PDF.
2. `pdfjs-dist` carga el documento y genera miniaturas de todas las paginas.
3. El usuario selecciona paginas de forma individual o masiva.
4. Elige:
  - formato de salida `PDF` o `JPG (ZIP)`
  - calidad `baja` o `alta`
5. El frontend exporta:
  - PDF parcial con `pdf-lib`
  - ZIP de JPGs con `JSZip`

## Implementacion

- `pdf-to-jpg/App.tsx`
- `pdf-to-jpg/components/Icons.tsx`
- `pdf-to-jpg/index.tsx`
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

## Detalles tecnicos

- Worker PDF.js servido desde CDNJS.
- Calidad alta JPG: escala `2.0`, calidad `0.92`
- Calidad baja JPG: escala `1.0`, calidad `0.75`
- El footer menciona React, Tailwind CSS y Gemini; es una nota de UI, no una dependencia ejecutada en runtime.

## Riesgos y limites

- Genera todas las miniaturas por adelantado; en PDFs grandes el consumo de memoria puede subir rapido.
- El estado mezcla `status` externo con callbacks async; en errores muy concretos el restablecimiento visual puede no ser perfecto.
