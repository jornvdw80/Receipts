import React, { createContext, useContext, useState } from 'react';

const AlertDialogContext = createContext(null);

export const AlertDialog = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      <div>{children}</div>
    </AlertDialogContext.Provider>
  );
};

export const AlertDialogTrigger = ({ children, asChild }) => {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogTrigger must be used inside AlertDialog');
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => context.setOpen(true),
    });
  }
  return <div onClick={() => context.setOpen(true)}>{children}</div>;
};

export const AlertDialogContent = ({ children }) => {
  const context = useContext(AlertDialogContext);
  if (!context) return null;
  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => context.setOpen(false)} />
      <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white border border-stoneBorder shadow-xl rounded-2xl relative z-[101]">
        {children}
      </div>
    </div>
  );
};

export const AlertDialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
export const AlertDialogTitle = ({ children }) => <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>;
export const AlertDialogDescription = ({ children }) => <p className="text-sm text-gray-500 mt-2">{children}</p>;
export const AlertDialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-4">{children}</div>;
export const AlertDialogAction = ({ children, onClick, ...props }) => (
  <button 
    onClick={(e) => {
      onClick?.(e);
      const context = useContext(AlertDialogContext);
      context?.setOpen(false);
    }} 
    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    {...props}
  >
    {children}
  </button>
);
export const AlertDialogCancel = ({ children, onClick, ...props }) => {
  const context = useContext(AlertDialogContext);
  return (
    <button 
      onClick={(e) => {
        onClick?.(e);
        context?.setOpen(false);
      }} 
      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
      {...props}
    >
      {children}
    </button>
  );
};
