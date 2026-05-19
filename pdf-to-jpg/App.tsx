
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { UploadIcon, CheckCircleIcon, SpinnerIcon, PdfFileIcon, XMarkIcon } from './components/Icons';

// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs';

type Status = 'idle' | 'loading' | 'processing' | 'downloading' | 'error';
type Quality = 'high' | 'low';
type ExportFormat = 'pdf' | 'jpg';
type SelectionMode = 'visual' | 'range';

const LARGE_PDF_PAGE_THRESHOLD = 100;

const parsePageRange = (value: string, totalPages: number): { pages: Set<number>; error: string | null } => {
    const pages = new Set<number>();
    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return { pages, error: 'Introduce un rango de páginas.' };
    }

    const parts = normalizedValue.split(',').map(part => part.trim()).filter(Boolean);

    for (const part of parts) {
        const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);

        if (!match) {
            return { pages, error: `El rango "${part}" no es válido. Usa formatos como 1-5, 8, 10-12.` };
        }

        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : start;

        if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
            return { pages, error: `El rango "${part}" está fuera del PDF, que tiene ${totalPages} páginas.` };
        }

        if (start > end) {
            return { pages, error: `El rango "${part}" debe ir de menor a mayor.` };
        }

        for (let page = start; page <= end; page++) {
            pages.add(page - 1);
        }
    }

    return { pages, error: null };
};

const App: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('visual');
    const [pageRange, setPageRange] = useState('');
    const [rangeError, setRangeError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [quality, setQuality] = useState<Quality>('high');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setPdfFile(null);
        setPdfDoc(null);
        setPreviews([]);
        setSelectedPages(new Set());
        setSelectionMode('visual');
        setPageRange('');
        setRangeError(null);
        setStatus('idle');
        setError(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const generatePreviews = useCallback(async (doc: pdfjsLib.PDFDocumentProxy) => {
        setStatus('processing');
        const previewPromises: Promise<string>[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
            previewPromises.push(
                doc.getPage(i).then(page => {
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    if (context) {
                        return page.render({ canvasContext: context, viewport }).promise.then(() => canvas.toDataURL('image/jpeg'));
                    }
                    return Promise.reject('No se pudo obtener el contexto del canvas');
                })
            );
        }

        const generatedPreviews = await Promise.all(previewPromises);
        setPreviews(generatedPreviews);
        setStatus('idle');
    }, []);

    useEffect(() => {
        const loadPdf = async () => {
            if (!pdfFile) return;

            setStatus('loading');
            setError(null);
            setRangeError(null);
            setPreviews([]);
            setSelectedPages(new Set());

            try {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument(arrayBuffer);
                const doc = await loadingTask.promise;
                setPdfDoc(doc);
                if (doc.numPages > LARGE_PDF_PAGE_THRESHOLD) {
                    setSelectionMode('range');
                    setPageRange('');
                    setRangeError('Introduce un rango de páginas.');
                    setStatus('idle');
                } else {
                    setSelectionMode('visual');
                    await generatePreviews(doc);
                }
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el archivo PDF. Asegúrate de que sea un archivo válido.');
                setStatus('error');
                setPdfFile(null);
            }
        };

        loadPdf();
    }, [generatePreviews, pdfFile]);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0] && files[0].type === 'application/pdf') {
            resetState();
            setPdfFile(files[0]);
        } else {
            setError('Por favor, selecciona un archivo PDF.');
            setStatus('error');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-sky-400', 'bg-slate-700/50');
        handleFileChange(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('border-sky-400', 'bg-slate-700/50');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-sky-400', 'bg-slate-700/50');
    };

    const togglePageSelection = (pageIndex: number) => {
        setSelectedPages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(pageIndex)) {
                newSelection.delete(pageIndex);
            } else {
                newSelection.add(pageIndex);
            }
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (!pdfDoc) return;
        const allPages = new Set(Array.from({ length: pdfDoc.numPages }, (_, i) => i));
        setSelectedPages(allPages);
        if (selectionMode === 'range') {
            setPageRange(`1-${pdfDoc.numPages}`);
            setRangeError(null);
        }
    };

    const handleDeselectAll = () => {
        setSelectedPages(new Set());
        if (selectionMode === 'range') {
            setPageRange('');
            setRangeError(null);
        }
    };

    const handleRangeChange = (value: string) => {
        setPageRange(value);

        if (!pdfDoc) return;

        const result = parsePageRange(value, pdfDoc.numPages);
        setSelectedPages(result.pages);
        setRangeError(result.error);
    };

    const handleModeChange = async (mode: SelectionMode) => {
        if (!pdfDoc || mode === selectionMode) return;

        setSelectionMode(mode);
        setError(null);

        if (mode === 'range') {
            const range = selectedPages.size > 0
                ? Array.from(selectedPages).sort((a, b) => a - b).map(page => String(page + 1)).join(', ')
                : '';
            setPageRange(range);
            setRangeError(range ? null : 'Introduce un rango de páginas.');
            return;
        }

        if (previews.length === 0) {
            try {
                await generatePreviews(pdfDoc);
            } catch (err) {
                console.error(err);
                setError('No se pudieron generar las miniaturas. Usa el modo por rango para exportar páginas.');
                setStatus('error');
            }
        }
    };

    const handleDownloadPDF = async () => {
        if (!pdfDoc || selectedPages.size === 0 || !pdfFile) return;

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const srcPdf = await PDFDocument.load(arrayBuffer);
            const newPdf = await PDFDocument.create();

            const indices = Array.from(selectedPages).sort((a, b) => a - b).map(i => i); // already zero-based
            const copiedPages = await newPdf.copyPages(srcPdf, indices);
            copiedPages.forEach((p) => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const baseName = pdfFile.name.replace(/\.pdf$/i, '');
            link.download = `${baseName}_seleccion.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error durante la exportación. Por favor, inténtalo de nuevo.');
            setStatus('error');
            throw err;
        }
    };

    const handleDownloadJPG = async () => {
        if (!pdfDoc || selectedPages.size === 0 || !pdfFile) return;

        try {
            const zip = new JSZip();
            const scale = quality === 'high' ? 2.0 : 1.0;
            const jpegQuality = quality === 'high' ? 0.92 : 0.75;

            const pagePromises = Array.from(selectedPages).map(pageIndex => {
                return new Promise<void>(async (resolve, reject) => {
                    try {
                        const page = await pdfDoc.getPage(pageIndex + 1);
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        if (!context) return reject(new Error('No se pudo obtener el contexto del canvas'));

                        await page.render({ canvasContext: context, viewport }).promise;
                        canvas.toBlob(blob => {
                            if (blob) {
                                zip.file(`pagina_${pageIndex + 1}.jpg`, blob);
                                resolve();
                            } else {
                                reject(new Error(`No se pudo crear el blob para la página ${pageIndex + 1}`));
                            }
                        }, 'image/jpeg', jpegQuality);
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            await Promise.all(pagePromises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `${pdfFile.name.replace('.pdf', '')}_paginas.zip` || 'paginas.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error durante la descarga. Por favor, inténtalo de nuevo.');
            setStatus('error');
            throw err;
        }
    };

    const handleDownload = async () => {
        if (!pdfDoc || selectedPages.size === 0 || rangeError) return;

        setStatus('downloading');
        setError(null);
        let failed = false;
        try {
            if (exportFormat === 'pdf') {
                await handleDownloadPDF();
            } else {
                await handleDownloadJPG();
            }
        } catch (err) {
            failed = true;
        } finally {
            if (!failed) {
                setStatus('idle');
            }
        }
    };

    const renderContent = () => {
        if (status === 'loading' || (status === 'processing' && previews.length === 0)) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <SpinnerIcon className="w-16 h-16 animate-spin text-sky-400" />
                    <p className="mt-4 text-lg">Cargando PDF...</p>
                </div>
            );
        }

        if (selectionMode === 'range' && pdfDoc) {
            return (
                <div className="flex items-start justify-center h-full p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-800 p-5 sm:p-6 shadow-lg">
                        <label htmlFor="page-range" className="block text-sm font-semibold text-slate-200">
                            Rango de páginas
                        </label>
                        <input
                            id="page-range"
                            type="text"
                            value={pageRange}
                            onChange={(e) => handleRangeChange(e.target.value)}
                            placeholder="1-5, 8, 10-12"
                            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                            <p className={rangeError ? 'text-red-300' : 'text-slate-400'}>
                                {rangeError || `${selectedPages.size} páginas seleccionadas de ${pdfDoc.numPages}.`}
                            </p>
                            <button
                                onClick={handleSelectAll}
                                className="px-3 py-1.5 text-sm bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                            >
                                Usar todo el documento
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectionMode === 'visual' && previews.length > 0) {
            return (
                <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                    {previews.map((src, index) => (
                        <div
                            key={index}
                            onClick={() => togglePageSelection(index)}
                            onKeyPress={(e) => e.key === 'Enter' && togglePageSelection(index)}
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedPages.has(index)}
                            aria-label={`Seleccionar página ${index + 1}`}
                            className={`relative group cursor-pointer rounded-lg overflow-hidden aspect-[210/297] bg-slate-800 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400 ${selectedPages.has(index) ? 'ring-2 ring-sky-400' : 'ring-1 ring-slate-700'}`}
                        >
                            <img src={src} alt={`Página ${index + 1}`} className="w-full h-full object-contain" loading="lazy" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-2 right-2 w-6 h-6 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-500">
                                {selectedPages.has(index) && <CheckCircleIcon className="w-7 h-7 text-sky-400" />}
                            </div>
                            <span className="absolute bottom-1 left-2 text-xs font-bold text-white bg-slate-900/60 px-1.5 py-0.5 rounded">
                                {index + 1}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full p-4">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className="w-full max-w-2xl h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl text-center transition-colors duration-300"
                >
                    <UploadIcon className="w-16 h-16 text-slate-500" />
                    <p className="mt-4 text-xl font-semibold text-slate-300">Arrastra y suelta tu PDF aquí</p>
                    <p className="mt-1 text-slate-400">o</p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
                    >
                        Seleccionar archivo
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files)}
                        accept=".pdf"
                        className="hidden"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <PdfFileIcon className="w-6 h-6 text-red-400" />
                            PDF a JPG
                        </h1>
                        {pdfFile && (
                            <button onClick={resetState} className="text-sm text-slate-400 hover:text-white transition-colors">Cambiar archivo</button>
                        )}
                    </div>
                </div>
            </header>

            {pdfDoc && (
                <div className="sticky top-16 z-10 bg-slate-800 shadow-sm py-3">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-shrink-0">
                            <p className="text-sm text-slate-400">Archivo: <span className="font-medium text-slate-200">{pdfFile?.name}</span></p>
                            <p className="text-sm text-slate-400">Páginas: <span className="font-medium text-slate-200">{pdfDoc.numPages}</span></p>
                        </div>
                        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-end">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-300">Selección:</span>
                                <div role="radiogroup" className="flex items-center rounded-md bg-slate-700 p-0.5">
                                    <button
                                        role="radio"
                                        aria-checked={selectionMode === 'visual'}
                                        onClick={() => handleModeChange('visual')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${selectionMode === 'visual' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                    >
                                        Vista
                                    </button>
                                    <button
                                        role="radio"
                                        aria-checked={selectionMode === 'range'}
                                        onClick={() => handleModeChange('range')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${selectionMode === 'range' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                    >
                                        Rango
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleSelectAll} className="px-3 py-1.5 text-sm bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">Seleccionar todo</button>
                                <button onClick={handleDeselectAll} className="px-3 py-1.5 text-sm bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">Deseleccionar todo</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-300">Formato:</span>
                                <div role="radiogroup" className="flex items-center rounded-md bg-slate-700 p-0.5">
                                    <button
                                        role="radio"
                                        aria-checked={exportFormat === 'pdf'}
                                        onClick={() => setExportFormat('pdf')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${exportFormat === 'pdf' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                    >
                                        PDF
                                    </button>
                                    <button
                                        role="radio"
                                        aria-checked={exportFormat === 'jpg'}
                                        onClick={() => setExportFormat('jpg')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${exportFormat === 'jpg' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                    >
                                        JPG (ZIP)
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-300">Calidad:</span>
                                <div role="radiogroup" className="flex items-center rounded-md bg-slate-700 p-0.5">
                                    <button
                                        role="radio"
                                        aria-checked={quality === 'low'}
                                        onClick={() => setQuality('low')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${quality === 'low' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                    >
                                        Baja
                                    </button>
                                    <button
                                        role="radio"
                                        aria-checked={quality === 'high'}
                                        onClick={() => setQuality('high')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${quality === 'high' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                                    >
                                        Alta
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={selectedPages.size === 0 || !!rangeError || status === 'downloading'}
                                className="px-4 py-1.5 text-sm font-semibold bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {status === 'downloading' && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                                {status === 'downloading' ? 'Exportando...' : `Exportar ${exportFormat.toUpperCase()} (${selectedPages.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-grow">
                {renderContent()}
            </main>

            {error && (
                <div aria-live="polite" className="fixed bottom-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-4">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} aria-label="Cerrar error">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
            )}
            
            <footer className="text-center py-4 text-sm text-slate-500">
                Creado con React, Tailwind CSS y Gemini.
            </footer>
        </div>
    );
};

export default App;
