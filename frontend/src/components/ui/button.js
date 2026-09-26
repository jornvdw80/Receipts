import React from 'react';

export const Button = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = "Button";