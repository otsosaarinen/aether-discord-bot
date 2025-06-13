import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function listAllPlayers() {
    const user = await prisma.player.findMany();
    console.log(user);
}

export async function createPlayer(
    osu_id: number,
    osu_username: string,
    discord_user_id: number,
    discord_username: string
) {
    const user = await prisma.player.create({
        data: {
            osu_id: osu_id,
            osu_username: osu_username,
            discord_user_id: discord_user_id,
            discord_username: discord_username,
            createdAt: new Date(),
        },
    });

    console.log(user);
}
