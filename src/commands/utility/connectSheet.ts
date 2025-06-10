import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("sheet")
	.setDescription("Connect bot to a specific google sheets file")
	.addStringOption((option) =>
		option
			.setName("url")
			.setDescription("URL address of the sheet")
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply(`Connected sheet succesfully`);
}
