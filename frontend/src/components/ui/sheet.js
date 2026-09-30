////import React from 'react';

////export const Sheet = ({ children }) => <div>{children}</div>;
////export const SheetTrigger = ({ children, onClick }) => <div onClick={onClick}>{children}</div>;
////export const SheetContent = ({ children, className }) => (
////    <div className={`fixed inset-y-0 right-0 z-50 h-full w-3/4 border-l bg-white p-6 shadow-lg sm:max-w-sm ${className}`}>
////        {children}
////    </div>
////);
////export const SheetHeader = ({ children }) => <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>;
////export const SheetTitle = ({ children }) => <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;

import React, { useState, createContext, useContext, useEffect } from 'react';

// Maak een context aan zodat de trigger en de content met elkaar kunnen communiceren
const SheetContext = createContext(null);

export const Sheet = ({ children }) => {
    const [open, setOpen] = useState(false);

    // Voorkom dat de achtergrond scrollt als het filterpaneel openstaat
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <SheetContext.Provider value={{ open, setOpen }}>
            {children}
        </SelectContext.Provider>
    );
};

export const SheetTrigger = ({ children, asChild }) => {
    const { setOpen } = useContext(SheetContext);

    // Als asChild is meegegeven (zoals in Products.js), klonen we het kind en voegen de klik-actie toe
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: (e) => {
                if (children.props.onClick) children.props.onClick(e);
                setOpen(true);
            }
        });
    }

    return (
        <div onClick={() => setOpen(true)} className="cursor-pointer">
            {children}
        </div>
    );
};

export const SheetContent = ({ children, className }) => {
    const { open, setOpen } = useContext(SheetContext);

    if (!open) return null; // Render het paneel *alleen* als de filterbox open is geklikt

    return (
        <>
            {/* Donkere achtergrondoverlay die sluit bij een klik */}
            <div
                className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={() => setOpen(false)}
            />

            {/* Het daadwerkelijke filterpaneel dat aan de rechterkant verschijnt */}
            <div className={`fixed inset-y-0 right-0 z-50 h-full w-[85vw] sm:max-w-sm border-l border-stoneBorder bg-paper p-6 shadow-xl flex flex-col justify-between animate-slide-in-right ${className || ""}`}>
                {/* Sluitknopje (kruisje) rechtsboven in het mobiele paneel */}
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    aria-label="Sluit filters"
                >
                    ✕
                </button>
                <div className="h-full overflow-y-auto mt-6 pr-1">
                    {children}
                </div>
            </div>
        </>
    );
};

export const SheetHeader = ({ children }) => <div className="flex flex-col space-y-2 mb-4 border-b border-stone-100 pb-3">{children}</div>;
export const SheetTitle = ({ children }) => <h2 className="text-lg font-display font-bold text-stone-900">{children}</h2>;

