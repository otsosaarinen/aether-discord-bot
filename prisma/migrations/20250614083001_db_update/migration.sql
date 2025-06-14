/*
  Warnings:

  - A unique constraint covering the columns `[osu_id]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "rank" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_osu_id_key" ON "Player"("osu_id");
