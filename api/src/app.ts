import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { ZodError } from 'zod';
import { ErroApp } from './lib/erros';
import { env } from './env';
import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import jwt from '@fastify/jwt';

export const app = fastify();

app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
});

app.register(cookie);

app.register(jwt, {
  secret: env.JWT_SECRET,
});

app.register(jwt, {
  secret: env.JWT_REFRESH_SECRET,
  namespace: 'refresh',
  jwtVerify: 'refreshVerify',
  jwtSign: 'refreshSign',
});

app.register(healthRoutes);
app.register(authRoutes);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      erro: 'Dados inválidos',
      detalhes: error.format(),
    });
  }

  if (error instanceof ErroApp) {
    return reply.status(error.status).send({
      erro: error.message,
    });
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error);
  } else {
    // Observador externo para prod
  }

  return reply.status(500).send({
    erro: 'Erro interno no servidor',
  });
});
