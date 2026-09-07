import { useAuth } from '../hooks/useAuth';
import { Botao } from '../components/Botao';
import { useNavigate } from 'react-router';

export function Inicio() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleSair = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-papel p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[length:var(--text-titulo)] font-[var(--text-titulo--font-weight)] text-tinta mb-4">
          Olá, {usuario?.nome}
        </h1>
        <Botao variante="secundario" onClick={handleSair}>
          Sair
        </Botao>
      </div>
    </div>
  );
}
