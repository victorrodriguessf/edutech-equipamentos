import { ButtonHTMLAttributes } from 'react';

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'destrutivo';
  carregando?: boolean;
}

export function Botao({
  children,
  variante = 'primario',
  carregando,
  disabled,
  className = '',
  ...props
}: BotaoProps) {
  let varianteClasses = '';
  
  if (variante === 'primario') {
    varianteClasses = 'bg-azul text-superficie border border-transparent hover:brightness-90';
  } else if (variante === 'secundario') {
    varianteClasses = 'bg-transparent text-tinta border border-linha hover:bg-azul-claro';
  } else if (variante === 'destrutivo') {
    varianteClasses = 'bg-transparent text-condicao-avariado border border-transparent hover:bg-papel';
  }

  return (
    <button
      {...props}
      disabled={disabled || carregando}
      className={`h-[40px] px-4 rounded-[var(--radius-controle)] text-[length:var(--text-corpo)] font-medium flex items-center justify-center transition-colors duration-120 ease-out focus:outline-none focus-visible:ring-3 focus-visible:ring-azul-claro disabled:opacity-50 disabled:cursor-not-allowed ${varianteClasses} ${className}`}
    >
      {carregando ? 'Carregando...' : children}
    </button>
  );
}
