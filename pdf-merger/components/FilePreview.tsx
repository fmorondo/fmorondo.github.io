
import React from 'react';
import { PdfFile, ViewMode } from '../types';
import { PdfIcon } from './icons/PdfIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface FilePreviewProps {
    file: PdfFile;
    viewMode: ViewMode;
    onRemove: (id: string) => void;
    onDragStart: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, viewMode, onRemove, onDragStart }) => {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(file.id);
    };

    if (viewMode === 'list') {
        return (
            <div
                draggable
                onDragStart={onDragStart}
                className="flex items-center bg-gray-700 p-3 rounded-lg cursor-grab active:cursor-grabbing"
            >
                <PdfIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
                <p className="ml-3 text-sm text-gray-200 truncate flex-grow" title={file.name}>
                    {file.name}
                </p>
                <button
                    onClick={handleRemove}
                    className="ml-3 p-1 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white transition"
                    aria-label={`Eliminar ${file.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="relative group bg-gray-700 rounded-lg overflow-hidden shadow-lg cursor-grab active:cursor-grabbing flex flex-col"
        >
            <div className="aspect-w-3 aspect-h-4 bg-gray-800 flex items-center justify-center">
                {file.thumbnailUrl ? (
                    <img src={file.thumbnailUrl} alt={`Miniatura de ${file.name}`} className="object-cover w-full h-full" />
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <LoadingSpinner />
                        <span className="text-xs mt-2">Generando...</span>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-700/50">
                <p className="text-xs text-gray-300 truncate" title={file.name}>
                    {file.name}
                </p>
            </div>
            <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-200"
                aria-label={`Eliminar ${file.name}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};
