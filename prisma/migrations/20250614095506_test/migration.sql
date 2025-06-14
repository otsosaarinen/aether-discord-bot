/*
  Warnings:

  - The primary key for the `Sheet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[sheet_id]` on the table `Sheet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Sheet" DROP CONSTRAINT "Sheet_pkey",
ALTER COLUMN "sheet_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sheet_pkey" PRIMARY KEY ("sheet_id");

-- CreateTable
CREATE TABLE "OauthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OauthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OauthState_state_key" ON "OauthState"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Sheet_sheet_id_key" ON "Sheet"("sheet_id");
