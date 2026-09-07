import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-papel">
        <span className="text-tinta-fraca text-[length:var(--text-corpo)]">Carregando...</span>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
