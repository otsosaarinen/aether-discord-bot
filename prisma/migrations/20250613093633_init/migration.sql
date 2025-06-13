-- CreateTable
CREATE TABLE "Sheet" (
    "sheet_id" INTEGER NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("sheet_id")
);

-- CreateTable
CREATE TABLE "Player" (
    "osu_id" INTEGER NOT NULL,
    "osu_username" TEXT NOT NULL,
    "discord_user_id" INTEGER NOT NULL,
    "discord_username" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("osu_id")
);
