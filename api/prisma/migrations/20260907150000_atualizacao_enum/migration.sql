-- AlterEnum
ALTER TYPE "SituacaoEquipamento" ADD VALUE 'EM_TRANSITO';

-- AlterEnum
BEGIN;
CREATE TYPE "TipoMovimentacao_new" AS ENUM ('CADASTRO', 'SAIDA', 'DEVOLUCAO', 'TRANSFERENCIA_ENVIO', 'TRANSFERENCIA_RECEBIMENTO', 'ENVIO_MANUTENCAO', 'RETORNO_MANUTENCAO', 'BAIXA');
ALTER TABLE "movimentacoes" ALTER COLUMN "tipo" TYPE "TipoMovimentacao_new" USING ("tipo"::text::"TipoMovimentacao_new");
ALTER TYPE "TipoMovimentacao" RENAME TO "TipoMovimentacao_old";
ALTER TYPE "TipoMovimentacao_new" RENAME TO "TipoMovimentacao";
DROP TYPE "public"."TipoMovimentacao_old";
COMMIT;

