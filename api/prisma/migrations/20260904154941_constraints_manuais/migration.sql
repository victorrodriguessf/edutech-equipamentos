/*
  Constraints manuais adicionadas (Bloco 5):

  1. btree_gist: Extensão necessária para criar constraints de exclusão com intervalos (range).
  2. reserva_sem_sobreposicao: Impede que o mesmo equipamento seja reservado em períodos que se
     sobrepõem, desde que a situação da reserva seja AGENDADA ou EM_ANDAMENTO.
  3. check_datas_validas: Garante que a data de fim previsto da reserva seja sempre maior que o início.
  4. check_formato_tombo: Garante que o tombo interno seja cadastrado estritamente no padrão EDT-XXX-000.
*/

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "reservas" ADD CONSTRAINT "reserva_sem_sobreposicao"
EXCLUDE USING gist (
  "equipamento_id" WITH =,
  tstzrange("inicio", "fim_previsto") WITH &&
) WHERE ("situacao" IN ('AGENDADA', 'EM_ANDAMENTO'));

ALTER TABLE "reservas" ADD CONSTRAINT "check_datas_validas" CHECK ("fim_previsto" > "inicio");

ALTER TABLE "equipamentos" ADD CONSTRAINT "check_formato_tombo" CHECK ("tombo" ~ '^EDT-[A-Z]{3}-[0-9]{3}$');