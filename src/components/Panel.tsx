import React from 'react';
import { cn } from '../lib/utils';

export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn(
        "glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col h-full transition-all duration-300",
        className
    )}>
        {children}
    </div>
);

export const PanelHeader: React.FC<{ title: string; children?: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
            {icon && <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>}
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">{title}</h2>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
);

export const PanelContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("p-6 flex-1", className)}>
        {children}
    </div>
);

export const PanelActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
        {children}
    </div>
);
