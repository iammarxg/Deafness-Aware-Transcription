
import React from 'react';

export const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {children}
    </div>
);

export const PanelHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div>{children}</div>
    </div>
);

export const PanelContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4">
        {children}
    </div>
);

export const PanelActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50">
        {children}
    </div>
);
