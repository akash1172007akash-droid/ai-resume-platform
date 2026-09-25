import React from 'react';

export default function LoadingSpinner({ text = 'Processing data...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-blue-600 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
}
