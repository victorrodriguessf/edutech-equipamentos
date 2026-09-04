export class ErroApp extends Error {
  public readonly status: number;

  constructor(mensagem: string, status: number = 400) {
    super(mensagem);
    this.status = status;
  }
}

export const naoEncontrado = (mensagem: string = 'Recurso não encontrado') => {
  return new ErroApp(mensagem, 404);
};

export const naoAutorizado = (mensagem: string = 'Não autorizado') => {
  return new ErroApp(mensagem, 401);
};

export const conflito = (mensagem: string = 'Conflito de dados') => {
  return new ErroApp(mensagem, 409);
};

export const dadosInvalidos = (mensagem: string = 'Dados inválidos') => {
  return new ErroApp(mensagem, 400);
};
