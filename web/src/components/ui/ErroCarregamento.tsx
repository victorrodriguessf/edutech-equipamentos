import React from 'react';

interface ErroCarregamentoProps {
  mensagem: string;
  onRetry: () => void;
}

export function ErroCarregamento({ mensagem, onRetry }: ErroCarregamentoProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-papel border border-linha rounded-painel">
      <h3 className="text-destaque font-semibold text-tinta mb-2">Falha ao carregar</h3>
      <p className="text-corpo text-tinta-fraca max-w-md mb-4">{mensagem}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-superficie border border-linha rounded-controle text-apoio font-medium text-tinta hover:bg-papel transition-colors"
      >
        Tentar de novo
      </button>
    </div>
  );
}
