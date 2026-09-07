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
    { codigo: 'LAB01', nome: 'Laboratório 01', tipo: 'laboratorio' },
    { codigo: 'LAB02', nome: 'Laboratório 02', tipo: 'laboratorio' },
    { codigo: 'DEPOSITO', nome: 'Depósito', tipo: 'deposito' },
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

  const allCategorias = await prisma.categoria.findMany();
  const allLocais = await prisma.local.findMany();

  const dep = allLocais.find(l => l.codigo === 'DEPOSITO')!;
  const lab1 = allLocais.find(l => l.codigo === 'LAB01')!;

  // 5. Equipamentos (20 itens)
  const eqData = [
    { tombo: 'EDT-NTB-001', nome: 'Notebook Dell Latitude 3420', cat: 'NTB', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.BOM, loc: dep.id },
    { tombo: 'EDT-NTB-002', nome: 'Notebook Lenovo ThinkPad E14', cat: 'NTB', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.NOVO, loc: lab1.id },
    { tombo: 'EDT-DSK-001', nome: 'Desktop HP ProDesk 400', cat: 'DSK', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.REGULAR, loc: lab1.id },
    { tombo: 'EDT-DSK-002', nome: 'Desktop Dell OptiPlex 3080', cat: 'DSK', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.BOM, loc: dep.id },
    { tombo: 'EDT-MON-001', nome: 'Monitor LG 24"', cat: 'MON', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.BOM, loc: lab1.id },
    { tombo: 'EDT-MON-002', nome: 'Monitor Samsung 24"', cat: 'MON', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.PRECISA_MANUTENCAO, loc: dep.id }, // PRECISA_MANUTENCAO
    { tombo: 'EDT-MON-003', nome: 'Monitor Dell 22"', cat: 'MON', sit: SituacaoEquipamento.EM_MANUTENCAO, cond: CondicaoEquipamento.AVARIADO, loc: dep.id }, // EM_MANUTENCAO
    { tombo: 'EDT-TAB-001', nome: 'iPad 9ª Geração', cat: 'TAB', sit: SituacaoEquipamento.EMPRESTADO, cond: CondicaoEquipamento.NOVO, loc: dep.id },
    { tombo: 'EDT-TAB-002', nome: 'Galaxy Tab S6 Lite', cat: 'TAB', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.BOM, loc: dep.id },
    { tombo: 'EDT-VRS-001', nome: 'Meta Quest 2', cat: 'VRS', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.BOM, loc: lab1.id },
    { tombo: 'EDT-VRS-002', nome: 'Meta Quest 3', cat: 'VRS', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.NOVO, loc: dep.id },
    { tombo: 'EDT-PRJ-001', nome: 'Projetor Epson PowerLite', cat: 'PRJ', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.REGULAR, loc: lab1.id },
    { tombo: 'EDT-PRJ-002', nome: 'Projetor BenQ', cat: 'PRJ', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.BOM, loc: dep.id },
    { tombo: 'EDT-IMP-001', nome: 'Impressora HP LaserJet', cat: 'IMP', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.BOM, loc: lab1.id },
    { tombo: 'EDT-IMP-002', nome: 'Impressora Epson EcoTank', cat: 'IMP', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.REGULAR, loc: dep.id },
    { tombo: 'EDT-PER-001', nome: 'Teclado Mecânico Logitech', cat: 'PER', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.NOVO, loc: lab1.id },
    { tombo: 'EDT-PER-002', nome: 'Mouse sem fio Dell', cat: 'PER', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.BOM, loc: dep.id },
    { tombo: 'EDT-RDE-001', nome: 'Switch Cisco 24 portas', cat: 'RDE', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.BOM, loc: lab1.id },
    { tombo: 'EDT-RDE-002', nome: 'Roteador TP-Link AX1500', cat: 'RDE', sit: SituacaoEquipamento.PARADO, cond: CondicaoEquipamento.NOVO, loc: dep.id },
    { tombo: 'EDT-DIV-001', nome: 'Estabilizador SMS', cat: 'DIV', sit: SituacaoEquipamento.EM_USO, cond: CondicaoEquipamento.REGULAR, loc: lab1.id },
  ];

  for (const eq of eqData) {
    const categoria = allCategorias.find(c => c.prefixo === eq.cat)!;
    
    await prisma.equipamento.upsert({
      where: { tombo: eq.tombo },
      update: {},
      create: {
        tombo: eq.tombo,
        nome: eq.nome,
        categoriaId: categoria.id,
        situacao: eq.sit,
        condicao: eq.cond,
        localPadraoId: eq.loc,
        localAtualId: eq.loc,
        movimentacoes: {
          create: {
            tipo: TipoMovimentacao.CADASTRO,
            dataHora: new Date(),
            localDestinoId: eq.loc,
            usuarioId: admin.id,
            situacaoApos: eq.sit,
            condicao: eq.cond,
            observacao: 'Cadastro inicial do seed',
          }
        }
      }
    });
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
