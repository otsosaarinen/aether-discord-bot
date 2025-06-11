import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, appendSheet } from "../../google/googleAPI.js";

export const data = new SlashCommandBuilder()
	.setName("sheet")
	.setDescription("Add data to the google sheet")
	.addStringOption((option) =>
		option
			.setName("data1")
			.setDescription("Data to be added")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("data2")
			.setDescription("Add another value to the sheet"),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const data1 = interaction.options.getString("data1", true);
	const data2 = interaction.options.getString("data2") || "";

	try {
		const auth = await authorize();

		await appendSheet(auth, data1, data2);

		await interaction.reply(
			`Data added succesfully, data added: ${data1} ${data2}, command was used by ${interaction.user.username}`,
		);
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while updating the sheet");
	}
}
