-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "discordOauthDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "osuOauthDone" BOOLEAN NOT NULL DEFAULT false;
