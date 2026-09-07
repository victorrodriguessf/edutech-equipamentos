import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Equipamentos } from './pages/Equipamentos';
import { Pessoas } from './pages/Pessoas';
import { Locais } from './pages/Locais';
import { Categorias } from './pages/Categorias';
import { RotaProtegida } from './components/RotaProtegida';
import { Layout } from './components/Layout';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }
          >
            <Route path="/equipamentos" element={<Equipamentos />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/locais" element={<Locais />} />
            <Route path="/categorias" element={<Categorias />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/equipamentos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

