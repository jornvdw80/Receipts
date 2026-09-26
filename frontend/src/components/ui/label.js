import React from 'react';

export const Label = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={`text-sm font-medium text-gray-700 leading-none ${className}`}
            {...props}
        >
            {children}
        </label>
    );
});
Label.displayName = "Label";