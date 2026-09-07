import React from 'react';

type Situacao = 'EM_USO' | 'PARADO' | 'EMPRESTADO' | 'EM_MANUTENCAO' | 'BAIXADO';

interface PilulaProps {
  situacao: Situacao;
}

export function Pilula({ situacao }: PilulaProps) {
  let label = '';
  let colorClasses = '';
  let extraClasses = '';

  switch (situacao) {
    case 'EM_USO':
      label = 'Em uso';
      colorClasses = 'bg-[var(--color-status-em-uso-bg)] text-[var(--color-status-em-uso-text)]';
      break;
    case 'PARADO':
      label = 'Parado';
      colorClasses = 'bg-[var(--color-status-parado-bg)] text-[var(--color-status-parado-text)]';
      break;
    case 'EMPRESTADO':
      label = 'Emprestado';
      colorClasses = 'bg-[var(--color-status-emprestado-bg)] text-[var(--color-status-emprestado-text)]';
      break;
    case 'EM_MANUTENCAO':
      label = 'Em manutenção';
      colorClasses = 'bg-[var(--color-status-manutencao-bg)] text-[var(--color-status-manutencao-text)]';
      break;
    case 'BAIXADO':
      label = 'Baixado';
      colorClasses = 'bg-[var(--color-status-baixado-bg)] text-[var(--color-status-baixado-text)]';
      extraClasses = 'line-through';
      break;
    default:
      label = situacao;
      colorClasses = 'bg-papel text-tinta';
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-nota font-medium ${colorClasses} ${extraClasses}`}
    >
      {label}
    </span>
  );
}
