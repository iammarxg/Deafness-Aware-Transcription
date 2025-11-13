import React from 'react';

export const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        {children}
    </div>
);

export const PanelHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-50 dark:bg-slate-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">{title}</h2>
        {children && <div className="flex justify-end w-full sm:w-auto">{children}</div>}
    </div>
);

export const PanelContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4">
        {children}
    </div>
);

export const PanelActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-2 bg-gray-50 dark:bg-slate-800">
        {children}
    </div>
);