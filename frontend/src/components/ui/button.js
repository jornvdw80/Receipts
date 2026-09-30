////import React from 'react';

////export const Button = React.forwardRef(({ className, children, ...props }, ref) => {
////    return (
////        <button
////            ref={ref}
////            className={`px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 ${className}`}
////            {...props}
////        >
////            {children}
////        </button>
////    );
////});
////Button.displayName = "Button";

import React from 'react';

export const Button = React.forwardRef(({ className, variant, children, ...props }, ref) => {
    // Dynamische styling op basis van varianten
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 inline-flex items-center justify-center";

    const variantStyle = variant === "outline"
        ? "border border-stoneBorder bg-white text-stone-700 hover:bg-stone-50"
        : "bg-stone-900 text-white hover:bg-stone-800 focus:ring-2 focus:ring-emerald-600"; // Standaard knopkleur is nu warm antraciet!

    return (
        <button
            ref={ref}
            className={`${baseStyle} ${variantStyle} ${className || ""}`}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";
