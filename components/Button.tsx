
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 space-x-2";

    const variantClasses = {
        primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
        danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
        ghost: "border-transparent text-indigo-600 bg-transparent hover:bg-indigo-50 focus:ring-indigo-500",
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
            {children}
        </button>
    );
};
