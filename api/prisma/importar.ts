import { PrismaClient, SituacaoEquipamento, CondicaoEquipamento, TipoMovimentacao } from '@prisma/client';
import * as xlsx from 'xlsx';
import fs from 'fs';

const prisma = new PrismaClient();

function gerarCodigoLocal(local: string, unidade: string) {
  const texto = `${local}-${unidade}`;
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toUpperCase()
    .trim();
}

function inferirCategoria(dispositivo: string): string {
  const lower = dispositivo.toLowerCase();
  if (lower.includes('óculos vr') || lower.includes('oculos vr')) return 'VRS';
  if (lower.includes('notebook')) return 'NTB';
  if (lower.includes('tablet')) return 'TAB';
  if (lower.includes('chromecast') || lower.includes('alexa')) return 'STR';
  if (lower.includes('drone')) return 'DRN';
  if (lower.includes('câmera') || lower.includes('camera') || lower.includes('tripé') || lower.includes('tripe')) return 'CAM';
  if (lower.includes('impressora 3d')) return 'I3D';
  if (lower.includes('impressora')) return 'IMP';
  if (lower.includes('microfone') || lower.includes('leitor')) return 'PER';
  return 'DIV';
}

async function importar() {
  const args = process.argv.slice(2);
  const simular = args.includes('--simular');
  const fileArgs = args.filter((a) => a !== '--simular');

  if (fileArgs.length === 0) {
    console.error('Erro: informe o caminho absoluto do arquivo .xlsx como argumento.');
    process.exit(1);
  }

  const filePath = fileArgs[0];
  if (!fs.existsSync(filePath)) {
    console.error(`Erro: arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  console.log(`Lendo arquivo: ${filePath}`);
  console.log(`Modo Simulação: ${simular ? 'SIM' : 'NÃO'}\n`);

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets['Equipamentos'];
  if (!sheet) {
    console.error('Erro: aba "Equipamentos" não encontrada na planilha.');
    process.exit(1);
  }

  // O cabeçalho está na linha 4 (índice 3)
  const rows = xlsx.utils.sheet_to_json<any>(sheet, { range: 3, defval: '' });

  // Pegar o admin para a movimentação
  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@edutech.senac.br' } });
  if (!admin) {
    console.error('Erro: usuário ADMIN não encontrado no banco de dados. Rode o seed primeiro.');
    process.exit(1);
  }

  // Estatísticas do relatório
  let totalLidas = rows.length;
  let ignoradas = 0;
  let importadas = 0;
  const rejeitadas: { linha: number; motivo: string }[] = [];
  const equipamentosDiv: string[] = [];
  const locaisCriados = new Map<string, { nome: string; unidade: string; codigo: string }>();
  const contagemCategoria: Record<string, number> = {};
  const contagemSituacao: Record<string, number> = {};
  const contagemCondicao: Record<string, number> = {};
  const contagemLocais: Record<string, number> = {};
  const semChapa: string[] = [];

  // Mapear dados para transação
  const dadosEquipamentos: any[] = [];

  // Controle de sequencial para tombos
  const sequencialCategoria: Record<string, number> = {};

  const chapasVistas = new Map<string, number>();

  const locaisValidos: Record<string, string> = {
    'Suporte EDUTECH': 'SUPORTE-EDUTECH',
    'Biblioteca': 'BIBLIOTECA',
    'Diretoria Regional': 'DIRETORIA-REGIONAL',
    'Carreta Móvel TI e GESTÃO': 'CARRETA-TI',
    'Carreta Móvel MODA e BELEZA': 'CARRETA-MODA',
    'Mossoró': 'MOSSORO',
    'Centro': 'CENTRO',
    'Alecrim': 'ALECRIM'
  };

  rows.forEach((row, index) => {
    const linhaReal = index + 5; // offset do cabeçalho (linha 4)
    
    // As chaves do objeto JSON correspondem ao cabeçalho exato
    const dispositivo = String(row['Dispositivo'] || '').trim();
    if (!dispositivo) {
      ignoradas++;
      return;
    }

    const localizacaoAtual = String(row['Localização Atual'] || '').trim();
    
    if (!localizacaoAtual || !locaisValidos[localizacaoAtual]) {
      rejeitadas.push({ linha: linhaReal, motivo: `Dispositivo "${dispositivo}" com Localização Atual não mapeada ou inválida: "${localizacaoAtual}".` });
      return;
    }
    
    const codigoLocal = locaisValidos[localizacaoAtual];
    const unidadeDona = String(row['Unidade de Origem'] || '').trim() || 'Não informada';
    const unidadeDestino = String(row['Unidade Destino'] || '').trim();
    const chapaRaw = row['Chapa'];
    const chapa = chapaRaw !== undefined && chapaRaw !== '' ? String(chapaRaw).trim() : null;
    const enderecoMac = String(row['Endereço MAC'] || '').trim();
    const emailConta = String(row['Usuário ADMIN'] || '').trim();
    let observacao = String(row['Observação'] || '').trim();

    // Regras de negócio
    const categoria = inferirCategoria(dispositivo);
    if (categoria === 'DIV') equipamentosDiv.push(dispositivo);
    
    if (!sequencialCategoria[categoria]) sequencialCategoria[categoria] = 1;
    const sequencial = String(sequencialCategoria[categoria]).padStart(3, '0');
    sequencialCategoria[categoria]++;
    const tombo = `EDT-${categoria}-${sequencial}`;

    let chapaTratada = chapa;
    if (!chapa) semChapa.push(tombo);
    else {
      if (chapasVistas.has(chapa)) {
        const count = chapasVistas.get(chapa)! + 1;
        chapasVistas.set(chapa, count);
        chapaTratada = `${chapa}-${count}`;
      } else {
        chapasVistas.set(chapa, 1);
      }
    }

    if (chapa === '42506') {
      const notaDuplicada = 'Chapa duplicada na planilha de origem, conferir';
      observacao = observacao ? `${observacao} | ${notaDuplicada}` : notaDuplicada;
    }

    let condicao = 'BOM';
    const obsLower = observacao.toLowerCase();
    if (obsLower.includes('manutenção') || obsLower.includes('assistência técnica') || obsLower.includes('assistencia tecnica') || obsLower.includes('defeito')) {
      condicao = 'PRECISA_MANUTENCAO';
    }

    let situacao = 'PARADO';
    if (unidadeDestino && unidadeDestino !== unidadeDona) {
      situacao = 'EM_TRANSITO';
      const destinoStr = `Destino previsto: ${unidadeDestino}`;
      observacao = observacao ? `${observacao} | ${destinoStr}` : destinoStr;
    }

    dadosEquipamentos.push({
      nome: dispositivo,
      tombo_senac: chapaTratada,
      tombo: tombo,
      categoria,
      endereco_mac: enderecoMac || null,
      email_conta: emailConta || null,
      unidade_dona: unidadeDona,
      condicao,
      situacao,
      observacoes: observacao || null,
      codigoLocal, // Para referenciar depois
    });

    importadas++;
    contagemCategoria[categoria] = (contagemCategoria[categoria] || 0) + 1;
    contagemSituacao[situacao] = (contagemSituacao[situacao] || 0) + 1;
    contagemCondicao[condicao] = (contagemCondicao[condicao] || 0) + 1;
    contagemLocais[codigoLocal] = (contagemLocais[codigoLocal] || 0) + 1;
  });



  // Obter categorias, usuários e locais válidos
  const categorias = await prisma.categoria.findMany();
  const catMap = new Map(categorias.map(c => [c.prefixo, c.id]));
  const locais = await prisma.local.findMany();
  const locaisMap = new Map(locais.map(l => [l.codigo, l.id]));

  try {
    await prisma.$transaction(async (tx) => {
      for (const eq of dadosEquipamentos) {
        const localId = locaisMap.get(eq.codigoLocal)!;
        const categoriaId = catMap.get(eq.categoria);
        
        if (!categoriaId) {
          throw new Error(`Categoria ${eq.categoria} não encontrada no banco.`);
        }

        await tx.equipamento.create({
          data: {
            nome: eq.nome,
            tombo: eq.tombo,
            tomboSenac: eq.tombo_senac,
            categoriaId: categoriaId,
            condicao: eq.condicao as CondicaoEquipamento,
            situacao: eq.situacao as SituacaoEquipamento,
            enderecoMac: eq.endereco_mac,
            emailConta: eq.email_conta,
            unidadeDona: eq.unidade_dona,
            observacoes: eq.observacoes,
            localPadraoId: localId,
            localAtualId: localId,
            movimentacoes: {
              create: {
                tipo: 'CADASTRO' as TipoMovimentacao,
                usuarioId: admin.id,
                dataHora: new Date(),
                localOrigemId: localId,
                localDestinoId: localId,
                situacaoApos: eq.situacao as SituacaoEquipamento,
                condicao: eq.condicao as CondicaoEquipamento,
                observacao: 'Importação inicial',
              }
            }
          }
        });
      }

      if (simular) {
        throw new Error('SIMULACAO_MODE');
      }
    }, { timeout: 120000 });
  } catch (error: any) {
    if (error.message !== 'SIMULACAO_MODE') {
      console.error('Erro fatal na transação de banco de dados:', error);
      process.exit(1);
    }
  }

  // Exibir Relatório
  console.log('=== RELATÓRIO DE IMPORTAÇÃO ===\n');
  console.log(`Total de linhas lidas (excluindo cabeçalho): ${totalLidas}`);
  console.log(`Importadas: ${importadas}`);
  console.log(`Ignoradas (sem Dispositivo): ${ignoradas}`);
  if (rejeitadas.length > 0) {
    console.log(`Rejeitadas por erro de preenchimento: ${rejeitadas.length}`);
    rejeitadas.forEach(r => console.log(`  - Linha ${r.linha}: ${r.motivo}`));
  }
  console.log('');

  console.log('--- CONTAGEM POR CATEGORIA ---');
  for (const [cat, count] of Object.entries(contagemCategoria).sort()) {
    console.log(`${cat}: ${count}`);
  }
  if (equipamentosDiv.length > 0) {
    console.log('\nEquipamentos classificados como DIV (Diversos) para revisão manual:');
    equipamentosDiv.forEach(d => console.log(`  - ${d}`));
  }
  console.log('');

  console.log('--- CONTAGEM POR SITUAÇÃO ---');
  for (const [sit, count] of Object.entries(contagemSituacao).sort()) {
    console.log(`${sit}: ${count}`);
  }
  console.log('');

  console.log('--- CONTAGEM POR CONDIÇÃO ---');
  for (const [cond, count] of Object.entries(contagemCondicao).sort()) {
    console.log(`${cond}: ${count}`);
  }
  console.log('');

  console.log('\n--- LOCAIS (E CONTAGEM DE EQUIPAMENTOS) ---');
  for (const [codigo, count] of Object.entries(contagemLocais)) {
    console.log(`[${codigo}]: ${count}`);
  }
  console.log('');

  console.log('--- EQUIPAMENTOS SEM CHAPA (TOMBO SENAC) ---');
  if (semChapa.length > 0) {
    semChapa.forEach(tombo => console.log(`  - ${tombo}`));
  } else {
    console.log('Nenhum.');
  }

  console.log('\n===============================');
  if (simular) {
    console.log('Simulação concluída. Nenhum dado foi salvo no banco.');
  } else {
    console.log('Importação concluída com sucesso!');
  }
}

importar().catch((err) => {
  console.error(err);
  process.exit(1);
});
