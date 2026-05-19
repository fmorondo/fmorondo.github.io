
import React, { useCallback, useId, useState } from 'react';

interface FileUploadProps {
    onFileChange: (files: FileList | null) => void;
    variant?: 'empty' | 'inline';
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, variant = 'empty' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputId = useId();

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileChange(e.dataTransfer.files);
        }
    }, [onFileChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileChange(e.target.files);
        e.target.value = '';
    };

    const isInline = variant === 'inline';

    return (
        <div
            className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors duration-300 ${
                isInline ? 'min-h-36 p-4' : 'h-full p-8'
            } ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-500'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id={inputId}
                multiple
                accept=".pdf"
                className="hidden"
                onChange={handleChange}
            />
            <label htmlFor={inputId} className="flex flex-col items-center justify-center cursor-pointer text-center">
                <svg className={`${isInline ? 'w-10 h-10 mb-3' : 'w-16 h-16 mb-4'} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293h4.586a4 4 0 014 4v5a4 4 0 01-4 4H7z"></path></svg>
                <p className={`${isInline ? 'text-sm' : 'text-lg'} font-semibold text-gray-300`}>
                    {isInline ? 'Añadir más PDF' : 'Arrastra y suelta tus archivos PDF aquí'}
                </p>
                {!isInline && <p className="text-gray-500 mt-1">o</p>}
                <span className="mt-2 font-semibold text-indigo-400 hover:text-indigo-300">
                    {isInline ? 'Seleccionar o arrastrar aquí' : 'Selecciona los archivos'}
                </span>
                {!isInline && <p className="text-xs text-gray-500 mt-4">Solo se aceptan archivos .pdf</p>}
            </label>
        </div>
    );
};
