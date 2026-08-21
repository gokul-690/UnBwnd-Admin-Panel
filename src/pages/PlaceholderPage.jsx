import React from 'react';

// A generic placeholder component for pages that aren't fully implemented yet
export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mb-6 border border-primary/20 shadow-xl shadow-primary/5">
        {Icon && <Icon className="w-12 h-12 text-primary" />}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
        {description || "This module is currently under construction. Check back soon for updates."}
      </p>
      
      <div className="mt-10 px-6 py-4 bg-gray-50 dark:bg-[#121214] rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Phase development in progress</span>
      </div>
    </div>
  );
}
