import React from 'react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[160px]">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3.5 h-3.5 bg-primary/80 dark:bg-primary/90 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3.5 h-3.5 bg-primary/80 dark:bg-primary/90 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3.5 h-3.5 bg-primary/80 dark:bg-primary/90 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
