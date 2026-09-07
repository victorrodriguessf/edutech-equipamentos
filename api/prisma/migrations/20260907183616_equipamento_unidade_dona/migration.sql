/*
  Warnings:

  - Added the required column `unidade_dona` to the `equipamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "equipamentos" ADD COLUMN     "unidade_dona" TEXT NOT NULL;
