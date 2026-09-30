////import React from 'react';

////export const Select = ({ children, onValueChange, value }) => {
////    return (
////        <div className="relative w-full">
////            {React.Children.map(children, child =>
////                React.cloneElement(child, { value, onValueChange })
////            )}
////        </div>
////    );
////};

////export const SelectTrigger = ({ className, children, ...props }) => (
////    <div className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`} {...props}>
////        {children}
////    </div>
////);

////export const SelectValue = ({ placeholder, value }) => <span>{value || placeholder}</span>;

////export const SelectContent = ({ children }) => <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-md">{children}</div>;

////export const SelectItem = ({ children, value, onValueChange }) => (
////    <div
////        onClick={() => onValueChange && onValueChange(value)}
////        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm hover:bg-gray-100"
////    >
////        {children}
////    </div>
////);

import React, { useState, createContext, useContext, useRef, useEffect } from 'react';

// We maken een context aan zodat kleinkinderen (SelectItems) ook bij de state kunnen
const SelectContext = createContext(null);

export const Select = ({ children, onValueChange, value }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Sluit de dropdown automatisch als je er buiten klikt
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleValueChange = (newValue) => {
        if (onValueChange) onValueChange(newValue);
        setOpen(false); // Sluit na selectie
    };

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            <div ref={containerRef} className="relative w-full">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ className, children, ...props }) => {
    const { open, setOpen } = useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-stoneBorder bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${className}`}
            {...props}
        >
            {children}
            {/* Subtiel pijltje omlaag/omhoog */}
            <span className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>
    );
};

export const SelectValue = ({ placeholder }) => {
    const { value } = useContext(SelectContext);
    // Als de waarde gelijk is aan de "__all__" placeholder, toon dan de placeholder tekst
    return <span>{value && value !== "__all__" ? value : placeholder}</span>;
};

export const SelectContent = ({ children }) => {
    const { open } = useContext(SelectContext);
    if (!open) return null; // Render de lijst *alleen* als de dropdown open is!

    return (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-stoneBorder bg-white shadow-lg animate-fade-in">
            <div className="p-1">{children}</div>
        </div>
    );
};

export const SelectItem = ({ children, value }) => {
    const { value: currentValue, onValueChange } = useContext(SelectContext);
    const isSelected = currentValue === value;

    return (
        <div
            onClick={() => onValueChange && onValueChange(value)}
            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm transition-colors ${isSelected
                    ? "bg-emerald-50 text-emerald-900 font-medium"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
        >
            {children}
        </div>
    );
};

