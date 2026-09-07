import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Campo } from '../components/Campo';
import { Botao } from '../components/Botao';
import { MensagemErro } from '../components/MensagemErro';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!email || !senha) {
      setErro('Preencha e-mail e senha');
      return;
    }

    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/inicio');
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-papel flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-superficie rounded-[var(--radius-painel)] shadow-[var(--shadow-flutuante)] p-8">
        <h1 className="text-[length:var(--text-secao)] font-[var(--text-secao--font-weight)] leading-[var(--text-secao--line-height)] text-tinta mb-6">
          EduTech
        </h1>
        
        <form onSubmit={handleSubmit} noValidate>
          <Campo
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={carregando}
            autoComplete="email"
          />
          <Campo
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregando}
            autoComplete="current-password"
            className="mb-2"
          />
          
          <div className="mb-4">
            <MensagemErro erro={erro} />
          </div>
          
          <Botao type="submit" carregando={carregando} className="w-full">
            Entrar
          </Botao>
        </form>
      </div>
    </div>
  );
}
