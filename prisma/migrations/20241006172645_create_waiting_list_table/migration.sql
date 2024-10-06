-- CreateTable
CREATE TABLE "WaitingList" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tableId" TEXT,
    "tableOccupationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitingList_id_key" ON "WaitingList"("id");

-- AddForeignKey
ALTER TABLE "WaitingList" ADD CONSTRAINT "WaitingList_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingList" ADD CONSTRAINT "WaitingList_tableOccupationId_fkey" FOREIGN KEY ("tableOccupationId") REFERENCES "TableOccupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
