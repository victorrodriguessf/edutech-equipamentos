import React from 'react';

interface EstadoVazioProps {
  titulo: string;
  mensagem: string;
  acaoPrimaria?: React.ReactNode;
}

export function EstadoVazio({ titulo, mensagem, acaoPrimaria }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-secao font-semibold text-tinta mb-2">{titulo}</h3>
      <p className="text-corpo text-tinta-fraca max-w-md mb-6">{mensagem}</p>
      {acaoPrimaria && (
        <div>
          {acaoPrimaria}
        </div>
      )}
    </div>
  );
}
