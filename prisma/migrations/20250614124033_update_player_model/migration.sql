/*
  Warnings:

  - The primary key for the `Player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[osu_username]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `OauthState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OauthState" ADD COLUMN     "provider" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" DROP CONSTRAINT "Player_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Player_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_id_key" ON "Player"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_osu_username_key" ON "Player"("osu_username");
