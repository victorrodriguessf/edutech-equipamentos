-- CreateEnum
CREATE TYPE "SituacaoEquipamento" AS ENUM ('EM_USO', 'PARADO', 'EMPRESTADO', 'EM_MANUTENCAO', 'BAIXADO');

-- CreateEnum
CREATE TYPE "CondicaoEquipamento" AS ENUM ('NOVO', 'BOM', 'REGULAR', 'PRECISA_MANUTENCAO', 'AVARIADO', 'INSERVIVEL');

-- CreateEnum
CREATE TYPE "SituacaoReserva" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'DEVOLVIDA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('CADASTRO', 'SAIDA', 'DEVOLUCAO', 'TRANSFERENCIA', 'ENVIO_MANUTENCAO', 'RETORNO_MANUTENCAO', 'BAIXA');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoas" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT,
    "setor" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pessoas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "prefixo" CHAR(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locais" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "locais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" UUID NOT NULL,
    "tombo" TEXT NOT NULL,
    "tombo_senac" TEXT,
    "nome" TEXT NOT NULL,
    "categoria_id" UUID NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "numero_serie" TEXT,
    "situacao" "SituacaoEquipamento" NOT NULL,
    "condicao" "CondicaoEquipamento" NOT NULL,
    "local_padrao_id" UUID NOT NULL,
    "local_atual_id" UUID NOT NULL,
    "pessoa_atual_id" UUID,
    "data_aquisicao" DATE,
    "garantia_ate" DATE,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" UUID NOT NULL,
    "equipamento_id" UUID NOT NULL,
    "pessoa_id" UUID NOT NULL,
    "local_destino_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ NOT NULL,
    "fim_previsto" TIMESTAMPTZ NOT NULL,
    "fim_real" TIMESTAMPTZ,
    "finalidade" TEXT NOT NULL,
    "situacao" "SituacaoReserva" NOT NULL,
    "condicao_saida" "CondicaoEquipamento",
    "condicao_retorno" "CondicaoEquipamento",
    "observacoes" TEXT,
    "criado_por" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" UUID NOT NULL,
    "equipamento_id" UUID NOT NULL,
    "reserva_id" UUID,
    "tipo" "TipoMovimentacao" NOT NULL,
    "data_hora" TIMESTAMPTZ NOT NULL,
    "local_origem_id" UUID,
    "local_destino_id" UUID,
    "pessoa_id" UUID,
    "usuario_id" UUID NOT NULL,
    "situacao_apos" "SituacaoEquipamento" NOT NULL,
    "condicao" "CondicaoEquipamento",
    "observacao" TEXT,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_prefixo_key" ON "categorias"("prefixo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "locais_codigo_key" ON "locais"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_tombo_key" ON "equipamentos"("tombo");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_tombo_senac_key" ON "equipamentos"("tombo_senac");

-- CreateIndex
CREATE INDEX "equipamentos_situacao_idx" ON "equipamentos"("situacao");

-- CreateIndex
CREATE INDEX "equipamentos_condicao_idx" ON "equipamentos"("condicao");

-- CreateIndex
CREATE INDEX "equipamentos_categoria_id_idx" ON "equipamentos"("categoria_id");

-- CreateIndex
CREATE INDEX "equipamentos_local_atual_id_idx" ON "equipamentos"("local_atual_id");

-- CreateIndex
CREATE INDEX "reservas_equipamento_id_inicio_fim_previsto_idx" ON "reservas"("equipamento_id", "inicio", "fim_previsto");

-- CreateIndex
CREATE INDEX "movimentacoes_equipamento_id_data_hora_idx" ON "movimentacoes"("equipamento_id", "data_hora");

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_local_padrao_id_fkey" FOREIGN KEY ("local_padrao_id") REFERENCES "locais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_local_atual_id_fkey" FOREIGN KEY ("local_atual_id") REFERENCES "locais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_pessoa_atual_id_fkey" FOREIGN KEY ("pessoa_atual_id") REFERENCES "pessoas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_local_destino_id_fkey" FOREIGN KEY ("local_destino_id") REFERENCES "locais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_local_origem_id_fkey" FOREIGN KEY ("local_origem_id") REFERENCES "locais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_local_destino_id_fkey" FOREIGN KEY ("local_destino_id") REFERENCES "locais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
