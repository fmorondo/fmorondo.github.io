
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFileChange: (files: FileList | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
    const [isDragging, setIsDragging] = useState(false);

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
    };

    return (
        <div
            className={`w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-500'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer text-center">
                <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293h4.586a4 4 0 014 4v5a4 4 0 01-4 4H7z"></path></svg>
                <p className="text-lg font-semibold text-gray-300">Arrastra y suelta tus archivos PDF aquí</p>
                <p className="text-gray-500 mt-1">o</p>
                <span className="mt-2 font-semibold text-indigo-400 hover:text-indigo-300">
                    Selecciona los archivos
                </span>
                <p className="text-xs text-gray-500 mt-4">Solo se aceptan archivos .pdf</p>
            </label>
        </div>
    );
};
