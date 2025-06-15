import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, connectSheet } from "../../../google/googleAPI.js";
import { addSheetToDb } from "../../../db/queries.js";

export const data = new SlashCommandBuilder()
	.setName("connect_sheet")
	.setDescription("Connect the bot to a google sheet")
	.addStringOption((option) =>
		option
			.setName("sheet_id")
			.setDescription("ID of the sheet you want to connect to")
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const sheet_id = interaction.options.getString("sheet_id", true);

	interaction.reply("Connecting sheet...");

	try {
		const auth = await authorize();

		await connectSheet(auth, sheet_id);

		await addSheetToDb(sheet_id);

		await interaction.followUp("Succesfully connected!");
	} catch (error) {
		console.log(error);
		await interaction.followUp("Error occured while connecting to a sheet");
	}
}
