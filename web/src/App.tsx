import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';
import { RotaProtegida } from './components/RotaProtegida';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/inicio" 
            element={
              <RotaProtegida>
                <Inicio />
              </RotaProtegida>
            } 
          />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
