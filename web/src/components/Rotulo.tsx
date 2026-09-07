import { LabelHTMLAttributes } from 'react';

export function Rotulo({ children, className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={`block text-[length:var(--text-apoio)] font-normal leading-[var(--text-apoio--line-height)] text-tinta-fraca mb-1 ${className}`}
    >
      {children}
    </label>
  );
}
