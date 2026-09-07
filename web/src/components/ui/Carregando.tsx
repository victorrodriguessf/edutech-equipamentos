import React from 'react';

export function Carregando() {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-10 bg-linha rounded-md w-1/4"></div>
      <div className="space-y-2">
        <div className="h-6 bg-linha rounded-md w-full"></div>
        <div className="h-6 bg-linha rounded-md w-full"></div>
        <div className="h-6 bg-linha rounded-md w-full"></div>
        <div className="h-6 bg-linha rounded-md w-3/4"></div>
      </div>
    </div>
  );
}
