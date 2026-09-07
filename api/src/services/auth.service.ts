import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { naoAutorizado } from '../lib/erros';

const prisma = new PrismaClient();

export const authService = {
  async login(app: FastifyInstance, email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.ativo) {
      throw naoAutorizado('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw naoAutorizado('Credenciais inválidas');
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
    };

    const accessToken = app.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = app.jwt.refresh.sign({ id: usuario.id }, { expiresIn: '7d' });

    return { accessToken, refreshToken, usuario: payload };
  },

  async renovar(app: FastifyInstance, token: string) {
    try {
      const payload = app.jwt.refresh.verify<{ id: string }>(token);
      
      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.id },
      });

      if (!usuario || !usuario.ativo) {
        throw naoAutorizado('Credenciais inválidas');
      }

      const novoPayload = {
        id: usuario.id,
        nome: usuario.nome,
        papel: usuario.papel,
      };

      const accessToken = app.jwt.sign(novoPayload, { expiresIn: '15m' });
      return { accessToken };
    } catch (err) {
      throw naoAutorizado('Refresh token inválido ou expirado');
    }
  },
};
