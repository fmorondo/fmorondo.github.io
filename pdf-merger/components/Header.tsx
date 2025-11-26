
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    <span className="text-indigo-400">PDF</span> Fusionador
                </h1>
                <p className="text-gray-400 mt-1">Une y ordena tus PDFs fácilmente.</p>
            </div>
        </header>
    );
};
