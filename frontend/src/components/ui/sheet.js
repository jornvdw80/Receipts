import React from 'react';

export const Sheet = ({ children }) => <div>{children}</div>;
export const SheetTrigger = ({ children, onClick }) => <div onClick={onClick}>{children}</div>;
export const SheetContent = ({ children, className }) => (
    <div className={`fixed inset-y-0 right-0 z-50 h-full w-3/4 border-l bg-white p-6 shadow-lg sm:max-w-sm ${className}`}>
        {children}
    </div>
);
export const SheetHeader = ({ children }) => <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>;
export const SheetTitle = ({ children }) => <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
