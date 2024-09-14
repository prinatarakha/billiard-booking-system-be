-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "number" SERIAL NOT NULL,
    "brand" TEXT NOT NULL DEFAULT 'mrsung',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableOccupation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tableId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_id_key" ON "Table"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- CreateIndex
CREATE UNIQUE INDEX "TableOccupation_id_key" ON "TableOccupation"("id");

-- AddForeignKey
ALTER TABLE "TableOccupation" ADD CONSTRAINT "TableOccupation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
