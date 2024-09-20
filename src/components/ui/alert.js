import React from 'react';

export const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-700',
    destructive: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`p-4 rounded-md ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <p className="text-sm">{children}</p>;
};