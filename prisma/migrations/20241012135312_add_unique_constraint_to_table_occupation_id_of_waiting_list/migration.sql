/*
  Warnings:

  - A unique constraint covering the columns `[tableOccupationId]` on the table `WaitingList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WaitingList_tableOccupationId_key" ON "WaitingList"("tableOccupationId");
