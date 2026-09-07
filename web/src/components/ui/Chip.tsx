import React from 'react';

type Condicao = 'NOVO' | 'BOM' | 'REGULAR' | 'PRECISA_MANUTENCAO' | 'AVARIADO' | 'INSERVIVEL';

interface ChipProps {
  condicao: Condicao;
}

export function Chip({ condicao }: ChipProps) {
  let label = '';
  let markerColor = '';

  switch (condicao) {
    case 'NOVO':
      label = 'Novo';
      markerColor = 'var(--color-condicao-novo)';
      break;
    case 'BOM':
      label = 'Bom';
      markerColor = 'var(--color-condicao-bom)';
      break;
    case 'REGULAR':
      label = 'Regular';
      markerColor = 'var(--color-condicao-regular)';
      break;
    case 'PRECISA_MANUTENCAO':
      label = 'Precisa de manutenção';
      markerColor = 'var(--color-condicao-manutencao)';
      break;
    case 'AVARIADO':
      label = 'Avariado';
      markerColor = 'var(--color-condicao-avariado)';
      break;
    case 'INSERVIVEL':
      label = 'Inservível';
      markerColor = 'var(--color-condicao-inservivel)';
      break;
    default:
      label = condicao;
      markerColor = 'transparent';
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-apoio font-medium text-tinta border border-linha bg-transparent">
      <span
        className="w-2 h-2 rounded-full mr-2"
        style={{ backgroundColor: markerColor }}
      />
      {label}
    </span>
  );
}
