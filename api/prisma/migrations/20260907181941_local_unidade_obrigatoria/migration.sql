/*
  Warnings:

  - Made the column `unidade` on table `locais` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "locais" ALTER COLUMN "unidade" SET NOT NULL;
