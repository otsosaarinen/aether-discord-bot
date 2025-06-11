import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import {
	authorize,
	appendSheet,
	connectSheet,
} from "../../google/googleAPI.js";
import { SHEET_DATA } from "../../memory.js";

export const data = new SlashCommandBuilder()
	.setName("reschedule")
	.setDescription("Reschedule your match")
	.addStringOption((option) =>
		option
			.setName("date")
			.setDescription("New match date")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription("New match time")
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const date = interaction.options.getString("date", true);
	const time = interaction.options.getString("time", true);

	try {
		const auth = await authorize();

		const sheetData = await connectSheet(
			auth,
			SHEET_DATA["sheet_id"],
			SHEET_DATA["tab_name"],
		);

		if (sheetData.data.values.length == 0) {
			await interaction.reply("No data found, contact @aetherian");
		}

		const title_column = sheetData.data.values[0];

		const date_column = title_column.findIndex(
			(row: string) => row == "Date",
		);
		const time_column = title_column.findIndex(
			(row: string) => row == "Time",
		);

		let matchRowIndex = -1;
		let player_index = -1;

		for (let i = 1; i < sheetData.data.values.length; i++) {
			for (let j = 0; j < sheetData.data.values[i].length; j++) {
				if (interaction.user.username == sheetData.data.values[i][j]) {
					matchRowIndex = i;
					player_index = j;
					break;
				}
			}
			if (matchRowIndex !== -1) {
				break;
			}
		}

		// find correct row for the match

		/*await appendSheet(
			auth,
			SHEET_DATA["sheet_id"],
			SHEET_DATA["tab_name"],
			data,
		);*/

		await interaction.reply(
			`Match succesfully rescheduled, command was used by ${interaction.user.username}`,
		);
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while rescheduling the match");
	}
}
