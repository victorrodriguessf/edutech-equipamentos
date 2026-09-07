import { PrismaClient, SituacaoEquipamento, CondicaoEquipamento, PapelUsuario, TipoMovimentacao } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Categorias
  const categorias = [
    { prefixo: 'NTB', nome: 'Notebook', descricao: 'Notebooks' },
    { prefixo: 'DSK', nome: 'Computador', descricao: 'Desktops' },
    { prefixo: 'MON', nome: 'Monitor', descricao: 'Monitores' },
    { prefixo: 'TAB', nome: 'Tablet', descricao: 'Tablets' },
    { prefixo: 'VRS', nome: 'Óculos VR', descricao: 'Óculos de Realidade Virtual' },
    { prefixo: 'PRJ', nome: 'Projetor', descricao: 'Projetores' },
    { prefixo: 'IMP', nome: 'Impressora', descricao: 'Impressoras' },
    { prefixo: 'I3D', nome: 'Impressora 3D', descricao: 'Impressoras 3D' },
    { prefixo: 'CAM', nome: 'Câmera e vídeo', descricao: 'Câmeras, tripés e acessórios' },
    { prefixo: 'DRN', nome: 'Drone', descricao: 'Drones' },
    { prefixo: 'STR', nome: 'Streaming e casa conectada', descricao: 'Chromecast, assistentes de voz' },
    { prefixo: 'PER', nome: 'Periférico', descricao: 'Periféricos diversos' },
    { prefixo: 'RDE', nome: 'Rede e energia', descricao: 'Equipamentos de rede e energia' },
    { prefixo: 'DIV', nome: 'Outros', descricao: 'Diversos' },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { prefixo: cat.prefixo },
      update: {},
      create: cat,
    });
  }

  // 2. Locais
  const locais = [
    { codigo: 'SUPORTE-EDUTECH', nome: 'Suporte EDUTECH', unidade: 'Centro', tipo: 'manutencao' },
    { codigo: 'BIBLIOTECA', nome: 'Biblioteca', unidade: 'Centro', tipo: 'laboratorio' },
    { codigo: 'DIRETORIA-REGIONAL', nome: 'Diretoria Regional', unidade: 'Centro', tipo: 'deposito' },
    { codigo: 'CARRETA-TI', nome: 'Carreta de TI', unidade: 'Itinerante', tipo: 'laboratorio' },
    { codigo: 'CARRETA-MODA', nome: 'Carreta de Moda', unidade: 'Itinerante', tipo: 'laboratorio' },
    { codigo: 'MOSSORO', nome: 'Mossoró', unidade: 'Mossoró', tipo: 'laboratorio' },
    { codigo: 'CENTRO', nome: 'Centro', unidade: 'Centro', tipo: 'laboratorio' },
    { codigo: 'ALECRIM', nome: 'Alecrim', unidade: 'Alecrim', tipo: 'laboratorio' },
  ];

  for (const loc of locais) {
    await prisma.local.upsert({
      where: { codigo: loc.codigo },
      update: {},
      create: loc,
    });
  }

  // 3. Usuários
  const senhaAdmin = process.env.SEED_SENHA_ADMIN;
  const senhaOperador = process.env.SEED_SENHA_OPERADOR;

  if (!senhaAdmin || !senhaOperador) {
    throw new Error('As variáveis de ambiente SEED_SENHA_ADMIN e SEED_SENHA_OPERADOR são obrigatórias.');
  }

  const hashAdmin = await bcrypt.hash(senhaAdmin, 10);
  const hashOperador = await bcrypt.hash(senhaOperador, 10);

  const forcarSenha = process.env.SEED_FORCAR_SENHA === 'true';

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@edutech.senac.br' },
    update: forcarSenha ? { senhaHash: hashAdmin } : {},
    create: {
      nome: 'Administrador',
      email: 'admin@edutech.senac.br',
      senhaHash: hashAdmin,
      papel: PapelUsuario.ADMIN,
    },
  });

  const operador = await prisma.usuario.upsert({
    where: { email: 'operador@edutech.senac.br' },
    update: forcarSenha ? { senhaHash: hashOperador } : {},
    create: {
      nome: 'Operador',
      email: 'operador@edutech.senac.br',
      senhaHash: hashOperador,
      papel: PapelUsuario.OPERADOR,
    },
  });

  // 4. Pessoas
  const pessoas = [
    { nome: 'João Silva', setor: 'TI', email: 'joao@senac.br' },
    { nome: 'Maria Souza', setor: 'Design', email: 'maria@senac.br' },
    { nome: 'Carlos Oliveira', setor: 'Administração', email: 'carlos@senac.br' },
    { nome: 'Ana Costa', setor: 'Coordenação', email: 'ana@senac.br' },
    { nome: 'Pedro Santos', setor: 'Marketing', email: 'pedro@senac.br' },
  ];

  for (const pessoa of pessoas) {
    const existente = await prisma.pessoa.findFirst({ where: { nome: pessoa.nome } });
    if (!existente) {
      await prisma.pessoa.create({ data: pessoa });
    }
  }


  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
