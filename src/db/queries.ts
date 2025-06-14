import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

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
			createdAt: new Date(),
		},
	});

	console.log(user);
}
