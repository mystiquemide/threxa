/*
  Warnings:

  - Added the required column `sourceEntity` to the `ImpactedAsset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImpactedAsset" ADD COLUMN     "sourceEntity" TEXT NOT NULL;
