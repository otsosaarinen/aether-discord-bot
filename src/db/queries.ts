import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function saveState(state: string, provider: string) {
	const oauth_state = await prisma.oauthState.create({
		data: {
			state: state,
			provider: provider,
		},
	});

	console.log("Saved state to db: ", oauth_state);
}

export async function fetchState(clientState: string) {
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

	console.log("State after using: ", editToUsed);

	return editToUsed;
}

export async function addSheetToDb(sheet_id: string) {
	const deleteExistingSheet = await prisma.sheet.deleteMany({});

	console.log("Deleted sheet: ", deleteExistingSheet);

	const sheet = await prisma.sheet.create({
		data: {
			sheet_id: sheet_id,
		},
	});
	console.log("New sheet added: ", sheet);
}

export async function fetchSheetId(): Promise<string> {
	const sheet_id = await prisma.sheet.findFirst();

	if (!sheet_id) {
		throw new Error("No sheet ID found from the database");
	}

	console.log("Sheet ID found: ", sheet_id?.sheet_id);

	return sheet_id?.sheet_id;
}

export async function createPlayer(
	osu_id: number,
	osu_username: string,
	discord_user_id: number,
	discord_username: string,
	rank: string,
	country: string,
) {
	const user = await prisma.player.create({
		data: {
			osu_id: osu_id,
			osu_username: osu_username,
			discord_user_id: discord_user_id,
			discord_username: discord_username,
			rank: rank,
			country: country,
		},
	});

	console.log(user);
}
