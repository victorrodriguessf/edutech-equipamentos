export function MensagemErro({ erro, id }: { erro?: string; id?: string }) {
  if (!erro) return null;
  return (
    <span id={id} className="block text-[length:var(--text-nota)] text-condicao-avariado mt-1">
      {erro}
    </span>
  );
}
