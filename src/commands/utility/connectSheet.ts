import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, connectSheet } from "../../google/googleAPI.js";
import { SHEET_DATA } from "../../memory.js";

export const data = new SlashCommandBuilder()
	.setName("sheet")
	.setDescription("Connect bot to a sheet")
	.addStringOption((option) =>
		option
			.setName("sheet_id")
			.setDescription("ID of the google sheet you want to connect to")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("tab_name")
			.setDescription("Name of the sheet tab you want to connect to")
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const sheet_id = interaction.options.getString("sheet_id", true);
	const tab_name = interaction.options.getString("tab_name", true);

	try {
		const auth = await authorize();

		await connectSheet(auth, sheet_id, tab_name);

		SHEET_DATA["sheet id"] = sheet_id;
		SHEET_DATA["tab_name"] = tab_name;

		await interaction.reply("Succesfully connected!");
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while connecting to a sheet");
	}
}
