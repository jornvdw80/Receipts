import React, { useState, createContext, useContext, useEffect } from 'react';

const SheetContext = createContext(null);

// We wijzen de provider toe aan een hoofdletter-variabele om JSX-parsers tevreden te houden
const SheetContextProvider = SheetContext.Provider;

export function Sheet({ children }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <SheetContextProvider value={{ open, setOpen }}>
            {children}
        </SheetContextProvider>
    );
}

export function SheetTrigger({ children, asChild }) {
    const { setOpen } = useContext(SheetContext);

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
}

export function SheetContent({ children, className }) {
    const { open, setOpen } = useContext(SheetContext);

    if (!open) return null;

    return (
        <>
            {/* Achtergrondoverlay */}
            <div
                className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Mobiel filterpaneel */}
            <div className={`fixed inset-y-0 right-0 z-50 h-full w-[85vw] sm:max-w-sm border-l border-stoneBorder bg-paper p-6 shadow-xl flex flex-col ${className || ""}`}>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 text-lg"
                    aria-label="Sluit filters"
                >
                    ✕
                </button>
                <div className="h-full overflow-y-auto mt-6">
                    {children}
                </div>
            </div>
        </>
    );
}

export const SheetHeader = ({ children }) => <div className="flex flex-col space-y-2 mb-4 border-b border-stone-100 pb-3">{children}</div>;
export const SheetTitle = ({ children }) => <h2 className="text-lg font-display font-bold text-stone-900">{children}</h2>;
