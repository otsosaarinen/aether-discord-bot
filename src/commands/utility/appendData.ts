import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, appendSheet } from "../../google/googleAPI.js";
import { SHEET_DATA } from "../../memory.js";

export const data = new SlashCommandBuilder()
	.setName("add_data")
	.setDescription("Add data to the sheet")
	.addStringOption((option) =>
		option
			.setName("data")
			.setDescription("Data you want to add to the sheet")
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const data = interaction.options.getString("data", true);

	try {
		const auth = await authorize();

		if (
			SHEET_DATA["sheet_id"].length > 0 &&
			SHEET_DATA["tab_name"].length > 0
		) {
			await appendSheet(
				auth,
				SHEET_DATA["sheet_id"],
				SHEET_DATA["tab_name"],
				data,
			);

			await interaction.reply(
				`Data added succesfully, command was used by ${interaction.user.username}`,
			);
		} else {
			await interaction.reply("sheet_id or tab_name is missing");
		}
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while updating the sheet");
	}
}
