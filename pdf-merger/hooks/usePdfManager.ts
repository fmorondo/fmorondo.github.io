
import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfFile } from '../types';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

export const usePdfManager = () => {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(0);

    const generateThumbnail = useCallback(async (file: File): Promise<string | null> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.3 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return null;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            return canvas.toDataURL();
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
    }, []);

    const addFiles = useCallback(async (newFiles: File[]) => {
        const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length === 0) return;

        setIsProcessing(prev => prev + pdfFiles.length);

        const newPdfFileObjects: PdfFile[] = pdfFiles.map(file => ({
            id: `${file.name}-${Date.now()}`,
            file,
            name: file.name,
            thumbnailUrl: null,
        }));

        setFiles(prev => [...prev, ...newPdfFileObjects]);

        for (const pdfFile of newPdfFileObjects) {
            generateThumbnail(pdfFile.file).then(thumbnailUrl => {
                setFiles(prevFiles =>
                    prevFiles.map(f =>
                        f.id === pdfFile.id ? { ...f, thumbnailUrl } : f
                    )
                );
                setIsProcessing(prev => prev - 1);
            });
        }
    }, [generateThumbnail]);

    const removeFile = useCallback((id: string) => {
        setFiles(prev => prev.filter(file => file.id !== id));
    }, []);

    const reorderFiles = useCallback((startIndex: number, endIndex: number) => {
        setFiles(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);

    const mergePdfs = useCallback(async (fileName: string) => {
        if (files.length < 2) return;
        setIsLoading(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const pdfBytes = await file.file.arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Ocurrió un error al fusionar los PDFs. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, [files]);

    return {
        files,
        isLoading,
        isProcessing,
        addFiles,
        removeFile,
        reorderFiles,
        clearFiles,
        mergePdfs,
    };
};
