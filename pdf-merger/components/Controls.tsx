
import React from 'react';
import { ViewMode } from '../types';
import { ListIcon } from './icons/ListIcon';
import { GridIcon } from './icons/GridIcon';

interface ControlsProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    onMerge: () => void;
    onClear: () => void;
    fileCount: number;
}

export const Controls: React.FC<ControlsProps> = ({ viewMode, setViewMode, onMerge, onClear, fileCount }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Modo de Vista</label>
                <div className="flex items-center bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`w-1/2 py-2 px-3 rounded-md flex items-center justify-center gap-2 text-sm font-semibold transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        aria-pressed={viewMode === 'list'}
                    >
                        <ListIcon className="w-5 h-5" />
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`w-1/2 py-2 px-3 rounded-md flex items-center justify-center gap-2 text-sm font-semibold transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        aria-pressed={viewMode === 'grid'}
                    >
                        <GridIcon className="w-5 h-5" />
                        Miniaturas
                    </button>
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-700">
                <button
                    onClick={onMerge}
                    disabled={fileCount < 2}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    Unir {fileCount > 0 ? `(${fileCount})` : ''} PDFs
                </button>
                <button
                    onClick={onClear}
                    disabled={fileCount === 0}
                    className="w-full bg-red-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    Limpiar Todo
                </button>
                {fileCount < 2 && (
                    <p className="text-xs text-gray-500 text-center pt-1">
                        Necesitas al menos 2 archivos para unir.
                    </p>
                )}
            </div>
        </div>
    );
};
