import React from 'react';

export const Select = ({ children, onValueChange, value }) => {
    return (
        <div className="relative w-full">
            {React.Children.map(children, child =>
                React.cloneElement(child, { value, onValueChange })
            )}
        </div>
    );
};

export const SelectTrigger = ({ className, children, ...props }) => (
    <div className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`} {...props}>
        {children}
    </div>
);

export const SelectValue = ({ placeholder, value }) => <span>{value || placeholder}</span>;

export const SelectContent = ({ children }) => <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-md">{children}</div>;

export const SelectItem = ({ children, value, onValueChange }) => (
    <div
        onClick={() => onValueChange && onValueChange(value)}
        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm hover:bg-gray-100"
    >
        {children}
    </div>
);
