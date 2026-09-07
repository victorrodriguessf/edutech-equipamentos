import { FastifyRequest, FastifyReply } from 'fastify';
import { naoAutorizado } from '../lib/erros';

declare module 'fastify' {
  export interface FastifyRequest {
    usuario: {
      id: string;
      nome: string;
      papel: 'ADMIN' | 'OPERADOR';
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; nome: string; papel: 'ADMIN' | 'OPERADOR' };
    user: { id: string; nome: string; papel: 'ADMIN' | 'OPERADOR' };
  }
  interface JWT {
    refresh: {
      sign(payload: any, options?: any): string;
      verify<T>(token: string, options?: any): T;
    };
  }
}

export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify();
    request.usuario = payload as any;
  } catch (err) {
    throw naoAutorizado('Não autorizado');
  }
}

export async function exigirAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.usuario?.papel !== 'ADMIN') {
    throw naoAutorizado('Acesso negado');
  }
}
