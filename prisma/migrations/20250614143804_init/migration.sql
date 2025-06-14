-- CreateTable
CREATE TABLE "Sheet" (
    "sheet_id" TEXT NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("sheet_id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "osu_id" INTEGER NOT NULL,
    "osu_username" TEXT NOT NULL,
    "discord_id" TEXT,
    "discord_username" TEXT,
    "rank" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OauthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OauthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sheet_sheet_id_key" ON "Sheet"("sheet_id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_id_key" ON "Player"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_osu_id_key" ON "Player"("osu_id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_osu_username_key" ON "Player"("osu_username");

-- CreateIndex
CREATE UNIQUE INDEX "OauthState_state_key" ON "OauthState"("state");
