import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 ${className}`} {...props}>
      <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};