////import React from 'react';

////export const Switch = React.forwardRef(({ className, checked, onChange, ...props }, ref) => {
////    return (
////        <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
////            <input
////                type="checkbox"
////                checked={checked}
////                onChange={onChange}
////                ref={ref}
////                className="sr-only peer"
////                {...props}
////            />
////            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
////        </label>
////    );
////});
////Switch.displayName = "Switch";

import React from 'react';

export const Switch = React.forwardRef(({ className, checked, onCheckedChange, id, ...props }, ref) => {
    return (
        <label htmlFor={id} className={`relative inline-flex items-center cursor-pointer ${className || ""}`}>
            <input
                type="checkbox"
                id={id}
                checked={checked}
                // Zorg dat we de React state-functie aanroepen die je in Products.js gebruikt
                onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
                ref={ref}
                className="sr-only peer"
                {...props}
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-600 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
    );
});

Switch.displayName = "Switch";
