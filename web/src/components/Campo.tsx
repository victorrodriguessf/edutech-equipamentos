import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Rotulo } from './Rotulo';
import { MensagemErro } from './MensagemErro';

export interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(
  ({ label, erro, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-erro`;

    return (
      <div className={`mb-4 ${className}`}>
        <Rotulo htmlFor={inputId}>{label}</Rotulo>
        <input
          {...props}
          id={inputId}
          ref={ref}
          aria-invalid={!!erro}
          aria-describedby={erro ? errorId : undefined}
          className="w-full h-[40px] px-3 bg-superficie border border-linha rounded-[var(--radius-controle)] text-tinta text-[length:var(--text-corpo)] focus:outline-none focus:border-azul focus:ring-3 focus:ring-azul-claro transition-colors duration-120 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <MensagemErro erro={erro} id={errorId} />
      </div>
    );
  }
);

Campo.displayName = 'Campo';
