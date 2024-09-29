/*
  Warnings:

  - You are about to drop the column `startAt` on the `TableOccupation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TableOccupation" DROP COLUMN "startAt",
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
