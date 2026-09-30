import React from 'react';

export const AlertDialog = ({ children }) => <div>{children}</div>;
export const AlertDialogTrigger = ({ children }) => <div>{children}</div>;

export const AlertDialogContent = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* LAAG 1: De donkere overlay die ALLES op de achtergrond blokkeert */}
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />

        {/* LAAG 2: De witte pop-up box */}
        <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle bg-white border border-stoneBorder shadow-xl rounded-2xl relative z-50">
            {children}
        </div>
    </div>
);

export const AlertDialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
export const AlertDialogTitle = ({ children }) => <h3 className="text-lg font-display font-bold text-stone-900">{children}</h3>;
export const AlertDialogDescription = ({ children }) => <p className="text-sm text-stone-600 mt-2">{children}</p>;
export const AlertDialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-4">{children}</div>;
export const AlertDialogAction = ({ children, onClick }) => <button onClick={onClick} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">{children}</button>;
export const AlertDialogCancel = ({ children, onClick }) => <button onClick={onClick} className="px-4 py-2 bg-stone-100 text-stone-800 font-medium rounded-lg hover:bg-stone-200">{children}</button>;
