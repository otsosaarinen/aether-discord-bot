import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { authorize, reschedule, connectSheet } from "../../google/googleAPI.js";
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
		if (
			SHEET_DATA["sheet_id"].length < 1 ||
			SHEET_DATA["tab_name"].length < 0
		) {
			interaction.reply(
				"sheet_id or tab_name missing, contact @aetherian",
			);
			return;
		}

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
		let match_id = null;

		for (let i = 1; i < sheetData.data.values.length; i++) {
			for (let j = 0; j < sheetData.data.values[i].length; j++) {
				if (interaction.user.username == sheetData.data.values[i][j]) {
					matchRowIndex = i + 1;
					match_id = sheetData.data.values[i][0];
					break;
				}
			}
			if (matchRowIndex !== -1) {
				break;
			}
		}

		const range = `${String.fromCharCode(97 + date_column)}${matchRowIndex}:${String.fromCharCode(97 + time_column)}${matchRowIndex}`;

		const data = [date, time];

		await reschedule(
			auth,
			SHEET_DATA["sheet_id"],
			SHEET_DATA["tab_name"],
			range,
			data,
		);

		await interaction.reply(
			`Match ID ${match_id} succesfully rescheduled, new time is ${date} ${time}`,
		);
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while rescheduling the match");
	}
}
