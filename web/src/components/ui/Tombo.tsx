import React from 'react';

interface TomboProps {
  codigo: string;
}

export function Tombo({ codigo }: TomboProps) {
  return (
    <span className="text-tombo text-tinta">
      {codigo}
    </span>
  );
}
