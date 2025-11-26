
import React, { useState, useRef } from 'react';
import { PdfFile, ViewMode } from '../types';
import { FilePreview } from './FilePreview';

interface FileListProps {
    files: PdfFile[];
    viewMode: ViewMode;
    onRemove: (id: string) => void;
    onReorder: (startIndex: number, endIndex: number) => void;
    isProcessing: number;
}

export const FileList: React.FC<FileListProps> = ({ files, viewMode, onRemove, onReorder, isProcessing }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const dropTargetRef = useRef<HTMLDivElement | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        if (dropTargetRef.current) {
            dropTargetRef.current.classList.remove('drag-over-area');
        }
        
        const targetElement = e.currentTarget as HTMLDivElement;
        targetElement.classList.add('drag-over-area');
        dropTargetRef.current = targetElement;
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).classList.remove('drag-over-area');
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null) return;
        if (draggedIndex !== index) {
            onReorder(draggedIndex, index);
        }
        if (dropTargetRef.current) {
            dropTargetRef.current.classList.remove('drag-over-area');
        }
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        if (dropTargetRef.current) {
            dropTargetRef.current.classList.remove('drag-over-area');
        }
        setDraggedIndex(null);
    };

    const containerClasses = viewMode === 'grid'
        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        : 'flex flex-col gap-3';

    return (
        <div className={containerClasses} onDragEnd={handleDragEnd}>
            {files.map((file, index) => (
                <div
                    key={file.id}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(index)}
                    className={`rounded-lg transition-all duration-200 ${draggedIndex === index ? 'drag-ghost' : ''}`}
                >
                    <FilePreview
                        file={file}
                        viewMode={viewMode}
                        onRemove={onRemove}
                        onDragStart={() => handleDragStart(index)}
                    />
                </div>
            ))}
            {files.length > 0 && isProcessing === 0 && (
                 <div className="text-center text-gray-500 col-span-full mt-4">
                    <p>Arrastra los archivos para reordenarlos.</p>
                </div>
            )}
        </div>
    );
};
