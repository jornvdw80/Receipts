import React from 'react';

export function Badge({ className, children, ...props }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}