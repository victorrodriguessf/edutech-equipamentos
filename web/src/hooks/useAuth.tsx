import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch, setAccessToken, setOnUnauthorized } from '../services/api';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUsuario(null);
      setAccessToken(null);
    });

    const restoreSession = async () => {
      try {
        const data = await apiFetch('/auth/refresh', { method: 'POST' });
        setAccessToken(data.accessToken);
        
        const user = await apiFetch('/auth/me');
        setUsuario(user);
      } catch (err) {
        setUsuario(null);
        setAccessToken(null);
      } finally {
        setCarregando(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, senha: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    setAccessToken(data.accessToken);

    const user = await apiFetch('/auth/me');
    setUsuario(user);
  };

  const logout = () => {
    setUsuario(null);
    setAccessToken(null);
    // Ideally we would also clear the refresh token cookie via a backend /auth/logout endpoint
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
