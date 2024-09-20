import React from 'react';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      ref={ref}
      {...props}
    />
  );
});