import React from 'react';

export const AlertDialog = ({ children }) => <div>{children}</div>;
export const AlertDialogTrigger = ({ children }) => <div>{children}</div>;
//export const AlertDialogContent = ({ children }) => (
//    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//        <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
//            {children}
//        </div>
//    </div>
//);
export const AlertDialogContent = ({ children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* LAAG 1: De donkere overlay die ALLES op de achtergrond blokkeert en verduistert */}
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" />

        {/* LAAG 2: De daadwerkelijke witte popup-box die daarbovenop zweeft */}
        <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white border border-stoneBorder shadow-xl rounded-2xl relative z-[101]">
            {children}
        </div>
    </div>
);
export const AlertDialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
export const AlertDialogTitle = ({ children }) => <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>;
export const AlertDialogDescription = ({ children }) => <p className="text-sm text-gray-500 mt-2">{children}</p>;
export const AlertDialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-4">{children}</div>;
export const AlertDialogAction = ({ children, onClick }) => <button onClick={onClick} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{children}</button>;
export const AlertDialogCancel = ({ children, onClick }) => <button onClick={onClick} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{children}</button>;
