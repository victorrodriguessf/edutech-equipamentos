ALTER TABLE "equipamentos" DROP CONSTRAINT "check_formato_tombo";
ALTER TABLE "equipamentos" ADD CONSTRAINT "check_formato_tombo" CHECK ("tombo" ~ '^EDT-[A-Z0-9]{3}-[0-9]{3}$');
