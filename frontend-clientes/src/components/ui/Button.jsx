// src/components/ui/Button.jsx
import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '',
  ...props 
}) {
  const base = 'py-2 px-4 rounded-md font-medium transition-colors focus:outline-none';
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    cart: 'bg-orange-500 hover:bg-orange-600 text-white flex items-center',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}