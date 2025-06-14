import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, connectSheet } from "../../google/googleAPI.js";
import { addSheetDb } from "../../db/queries.js";

export const data = new SlashCommandBuilder()
	.setName("connect_sheet")
	.setDescription("Connect the bot to a google sheet")
	.addStringOption((option) =>
		option
			.setName("sheet_id")
			.setDescription("ID of the sheet you want to connect to")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("range")
			.setDescription(
				"Range the bot is going to use e.g. 'Taulukko1:A1:Z'",
			)
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const sheet_id = interaction.options.getString("sheet_id", true);
	const range = interaction.options.getString("range", true);

	try {
		const auth = await authorize();

		await connectSheet(auth, sheet_id, range);

		await addSheetDb(sheet_id);

		await interaction.reply("Succesfully connected!");
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while connecting to a sheet");
	}
}
