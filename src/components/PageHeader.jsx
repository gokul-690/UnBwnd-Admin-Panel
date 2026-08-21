import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

/**
 * Reusable page header for all admin pages.
 * Props:
 *   title       – string
 *   subtitle    – string (optional)
 *   icon        – Lucide icon component (optional)
 *   iconColor   – Tailwind color class for the icon (default: text-primary)
 *   badge       – { count: number, label: string } (optional live-count badge)
 *   action      – { label: string, onClick: fn, icon?: component } (optional button)
 *   children    – extra controls to render on the right (optional)
 */
export default function PageHeader({ title, subtitle, icon: Icon, iconColor = 'text-primary', badge, action, children }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && badge.count != null && (
          <span className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {badge.count} {badge.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
        {action && (
          <>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/20 active:scale-[0.98]"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
            <ConfirmModal
              isOpen={isConfirmOpen}
              onClose={() => setIsConfirmOpen(false)}
              onConfirm={action.onClick}
              title="Confirm Action"
              message={`Are you sure you want to proceed with "${action.label}"?`}
            />
          </>
        )}
      </div>
    </div>
  );
}
