import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-apoio font-medium transition-colors ${
      isActive
        ? 'bg-azul-claro text-azul'
        : 'text-tinta-fraca hover:bg-papel hover:text-tinta'
    }`;

  const navItemMobileClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-corpo font-medium transition-colors ${
      isActive
        ? 'bg-azul-claro text-azul'
        : 'text-tinta-fraca hover:bg-papel hover:text-tinta'
    }`;

  return (
    <div className="min-h-screen bg-papel flex flex-col">
      {/* Topo fixo de 56px */}
      <header className="h-[56px] bg-superficie border-b border-linha sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          
          {/* Esquerda: Logo/Sistema */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-secao text-azul tracking-tight">
              EduTech
            </span>
          </div>

          {/* Centro: Navegação Desktop */}
          <nav className="hidden md:flex space-x-2">
            <NavLink to="/equipamentos" className={navItemClass}>Equipamentos</NavLink>
            <NavLink to="/pessoas" className={navItemClass}>Pessoas</NavLink>
            <NavLink to="/locais" className={navItemClass}>Locais</NavLink>
            <NavLink to="/categorias" className={navItemClass}>Categorias</NavLink>
          </nav>

          {/* Direita: Usuário e Sair (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {usuario && (
              <span className="text-apoio text-tinta-fraca">
                {usuario.nome}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-apoio text-tinta-fraca hover:text-tinta transition-colors"
            >
              Sair
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="text-apoio text-tinta-fraca hover:text-tinta px-2 py-1 border border-linha rounded-controle"
            >
              {menuAberto ? 'Fechar' : 'Menu ▾'}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {menuAberto && (
        <div className="md:hidden bg-superficie border-b border-linha px-4 pt-2 pb-4 space-y-1 shadow-flutuante absolute w-full z-20">
          <NavLink to="/equipamentos" onClick={() => setMenuAberto(false)} className={navItemMobileClass}>Equipamentos</NavLink>
          <NavLink to="/pessoas" onClick={() => setMenuAberto(false)} className={navItemMobileClass}>Pessoas</NavLink>
          <NavLink to="/locais" onClick={() => setMenuAberto(false)} className={navItemMobileClass}>Locais</NavLink>
          <NavLink to="/categorias" onClick={() => setMenuAberto(false)} className={navItemMobileClass}>Categorias</NavLink>
          <div className="border-t border-linha mt-2 pt-2">
            {usuario && (
              <div className="px-3 py-2 text-corpo text-tinta-fraca">
                {usuario.nome}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 text-corpo text-tinta-fraca hover:bg-papel hover:text-tinta rounded-md"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Área Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
