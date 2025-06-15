import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());
export async function saveState(state, provider) {
    const oauth_state = await prisma.oauthState.create({
        data: {
            state: state,
            provider: provider,
        },
    });
    return oauth_state;
}
export async function fetchState(clientState) {
    const stateMatch = await prisma.oauthState.findFirst({
        where: { state: clientState, used: false },
    });
    if (!stateMatch) {
        throw new Error("State not found from db");
    }
    const editToUsed = await prisma.oauthState.update({
        where: {
            state: stateMatch.state,
        },
        data: {
            used: true,
        },
    });
    return editToUsed;
}
export async function addSheetToDb(sheet_id) {
    // Delete existing sheets
    await prisma.sheet.deleteMany({});
    const sheet = await prisma.sheet.create({
        data: {
            sheet_id: sheet_id,
        },
    });
    return sheet;
}
export async function fetchSheetId() {
    const sheet_id = await prisma.sheet.findFirst();
    if (!sheet_id) {
        return "No sheet ID found from the database";
    }
    return sheet_id?.sheet_id;
}
export async function addOsuDataToDb({ osu_id, osu_username, rank, country, }) {
    const osuData = await prisma.player.create({
        data: {
            osu_id: osu_id,
            osu_username: osu_username,
            rank: rank,
            country: country,
        },
    });
    return osuData;
}
export async function addDiscordDataToDb({ osu_id, discord_id, discord_username, }) {
    const discordData = await prisma.player.update({
        where: {
            osu_id: osu_id,
        },
        data: {
            discord_id: discord_id,
            discord_username: discord_username,
        },
    });
    return discordData;
}
export async function fetchOauthStatus(osu_id) {
    const status = await prisma.player.findFirst({
        where: {
            osu_id: osu_id,
        },
    });
    if (!status) {
        return "No oauth status found from the db";
    }
    return status;
}
export async function updateOsuOauthStatus(osu_id, newOauthStatus) {
    const status = await prisma.player.update({
        where: {
            osu_id: osu_id,
        },
        data: {
            osuOauthDone: newOauthStatus,
        },
    });
    return status;
}
export async function updateDiscordOauthStatus(osu_id, newOauthStatus) {
    const status = await prisma.player.update({
        where: {
            osu_id: osu_id,
        },
        data: {
            discordOauthDone: newOauthStatus,
        },
    });
    return status;
}
