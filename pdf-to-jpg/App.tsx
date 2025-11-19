
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { UploadIcon, CheckCircleIcon, SpinnerIcon, PdfFileIcon, XMarkIcon } from './components/Icons';

// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs';

type Status = 'idle' | 'loading' | 'processing' | 'downloading' | 'error';
type Quality = 'high' | 'low';

const App: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [quality, setQuality] = useState<Quality>('high');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setPdfFile(null);
        setPdfDoc(null);
        setPreviews([]);
        setSelectedPages(new Set());
        setStatus('idle');
        setError(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    useEffect(() => {
        const loadPdf = async () => {
            if (!pdfFile) return;

            setStatus('loading');
            setError(null);
            setPreviews([]);
            setSelectedPages(new Set());

            try {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument(arrayBuffer);
                const doc = await loadingTask.promise;
                setPdfDoc(doc);
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
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el archivo PDF. Asegúrate de que sea un archivo válido.');
                setStatus('error');
                setPdfFile(null);
            }
        };

        loadPdf();
    }, [pdfFile]);

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
    };

    const handleDeselectAll = () => {
        setSelectedPages(new Set());
    };

    const handleDownload = async () => {
        if (!pdfDoc || selectedPages.size === 0) return;

        setStatus('downloading');
        setError(null);
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
            link.download = `${pdfFile?.name.replace('.pdf', '')}_paginas.zip` || 'paginas.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error(err);
            setError('Ocurrió un error durante la descarga. Por favor, inténtalo de nuevo.');
            setStatus('error');
        } finally {
            if (status !== 'error') {
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

        if (previews.length > 0) {
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
                                <button onClick={handleSelectAll} className="px-3 py-1.5 text-sm bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">Seleccionar todo</button>
                                <button onClick={handleDeselectAll} className="px-3 py-1.5 text-sm bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">Deseleccionar todo</button>
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
                                disabled={selectedPages.size === 0 || status === 'downloading'}
                                className="px-4 py-1.5 text-sm font-semibold bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {status === 'downloading' && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                                {status === 'downloading' ? 'Descargando...' : `Descargar (${selectedPages.size})`}
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
