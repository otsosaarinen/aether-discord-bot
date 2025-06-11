import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, appendSheet } from "../../google/googleAPI.js";

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

		await appendSheet(auth, data);

		await interaction.reply(
			`Data added succesfully, command was used by ${interaction.user.username}`,
		);
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while updating the sheet");
	}
}
