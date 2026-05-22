import React from 'react';

export const Card = ({ children, title, action }: { children: React.ReactNode, title?: string, action?: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    {(title || action) && (
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);