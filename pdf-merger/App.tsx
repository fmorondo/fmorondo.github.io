import { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { Controls } from './components/Controls';
import { usePdfManager } from './hooks/usePdfManager';
import { ViewMode } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function App() {
    const {
        files,
        isLoading,
        isProcessing,
        addFiles,
        removeFile,
        reorderFiles,
        clearFiles,
        mergePdfs,
    } = usePdfManager();

    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [finalFileName, setFinalFileName] = useState('');

    const handleMergeClick = () => {
        setFinalFileName('documento-fusionado');
        setIsModalOpen(true);
    };

    const handleConfirmMerge = async () => {
        if (finalFileName.trim()) {
            await mergePdfs(finalFileName.trim());
            setIsModalOpen(false);
            clearFiles();
        }
    };

    const handleFileChange = (newFiles: FileList | null) => {
        if (newFiles) {
            addFiles(Array.from(newFiles));
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
                <div className="flex-grow flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                        <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-4 text-indigo-400">Controles</h2>
                            <Controls
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                onMerge={handleMergeClick}
                                onClear={clearFiles}
                                fileCount={files.length}
                            />
                        </div>
                    </div>
                    <div className="flex-grow bg-gray-800/50 rounded-lg p-2 md:p-6">
                        {files.length === 0 ? (
                            <FileUpload onFileChange={handleFileChange} />
                        ) : (
                            <FileList
                                files={files}
                                viewMode={viewMode}
                                onRemove={removeFile}
                                onReorder={reorderFiles}
                                isProcessing={isProcessing}
                            />
                        )}
                    </div>
                </div>
            </main>

            {(isLoading || isProcessing > 0) && (
                <div className="fixed bottom-6 right-6 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-3">
                    <LoadingSpinner />
                    <span>
                        {isLoading ? 'Fusionando PDFs...' : `Procesando ${isProcessing} archivo(s)...`}
                    </span>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                        <h3 className="text-2xl font-bold mb-4 text-indigo-400">Nombre del Archivo Fusionado</h3>
                        <p className="text-gray-400 mb-4">
                            Introduce un nombre para tu archivo combinado.
                        </p>
                        <div className="mb-6">
                            <label htmlFor="fileName" className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre del archivo (sin .pdf)
                            </label>
                            <input
                                type="text"
                                id="fileName"
                                value={finalFileName}
                                onChange={(e) => setFinalFileName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmMerge}
                                disabled={!finalFileName.trim() || isLoading}
                                className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-md transition font-semibold disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center"
                            >
                                {isLoading ? <LoadingSpinner /> : 'Confirmar y Descargar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
