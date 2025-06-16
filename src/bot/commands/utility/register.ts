import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("rekisteröidy")
	.setDescription("Rekisteröidy 5 digit suomi turnaukseen!");

export async function execute(interaction: ChatInputCommandInteraction) {
	const registration_url = "https://5dst.org/";

	await interaction.reply({
		content: `Klikkaa linkkia rekisteröityäksesi: **${registration_url}**`,
		ephemeral: true,
	});
}
