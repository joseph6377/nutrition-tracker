import React, { useState } from 'react';

export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const updatedChildren = React.Children.map(children, (child) => {
    if (child.type === TabsList || child.type === TabsContent) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    return child;
  });

  return <div>{updatedChildren}</div>;
};

export const TabsList = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-2 mb-4">
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md ${
        activeTab === value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  return <div>{children}</div>;
};