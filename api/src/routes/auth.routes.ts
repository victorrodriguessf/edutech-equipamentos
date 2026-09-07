import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service';
import { loginSchema } from '../schemas/auth.schema';
import { autenticar } from '../middlewares/autenticar';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const { email, senha } = loginSchema.parse(request.body);

    const { accessToken, refreshToken, usuario } = await authService.login(app, email, senha);

    reply.setCookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return reply.status(200).send({ accessToken });
  });

  app.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      return reply.status(401).send({ erro: 'Refresh token não fornecido' });
    }

    const { accessToken } = await authService.renovar(app, refreshToken);

    return reply.status(200).send({ accessToken });
  });

  app.get(
    '/auth/me',
    {
      preHandler: [autenticar],
    },
    async (request, reply) => {
      const usuario = await authService.me(request.usuario.id);
      return reply.status(200).send(usuario);
    }
  );
}
