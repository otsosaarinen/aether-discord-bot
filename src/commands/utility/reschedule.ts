import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	MessageReaction,
	User,
} from "discord.js";
import { authorize, fetchMatches, reschedule } from "../../google/googleAPI.js";
import { fetchSheetId } from "../../db/queries.js";

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

		const sheet_id = await fetchSheetId();

		const sheetData = await fetchMatches(auth, sheet_id, "Taulukko1!A1:I");

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
		let rescheduling_player = null;
		let accepting_player = null;
		let match_players: string[] | null = null;

		for (let i = 1; i < sheetData.data.values.length; i++) {
			for (let j = 0; j < sheetData.data.values[i].length; j++) {
				if (interaction.user.username == sheetData.data.values[i][j]) {
					matchRowIndex = i + 1;
					match_id = sheetData.data.values[i][0];
					rescheduling_player = sheetData.data.values[i][j];
					match_players = [
						sheetData.data.values[i][4],
						sheetData.data.values[i][7],
					];

					if (match_players[0] == sheetData.data.values[i][j]) {
						accepting_player = match_players[1];
					} else {
						accepting_player = match_players[0];
					}

					break;
				}
			}
			if (matchRowIndex !== -1) {
				break;
			}
		}

		if (match_players) {
			try {
				interaction.reply(
					`@${accepting_player} new suggested time for you by${rescheduling_player} **match ${match_id}** is **${date} ${time}**. React to this message if you accept the reschedule`,
				);

				const message = await interaction.fetchReply(); // fetch the message just sent
				await message.react("✅");
				await message.react("❌");

				const reactionFilter = (
					reaction: MessageReaction,
					user: User,
				) => {
					return (
						["✅", "❌"].includes(reaction.emoji.name ?? "") &&
						match_players.includes(user.username)
					);
				};

				const collector = message.createReactionCollector({
					filter: reactionFilter,
					max: 1,
					time: 86400_000,
				});

				collector.on("collect", async (reaction, user) => {
					if (reaction.emoji.name === "✅") {
						await message.reply(
							`${user.username} approved the reschedule ✅`,
						);

						const range = `${String.fromCharCode(97 + date_column)}${matchRowIndex}:${String.fromCharCode(97 + time_column)}${matchRowIndex}`;

						const data = [date, time];

						await reschedule(auth, sheet_id, range, data);

						await interaction.followUp(
							`Match **ID ${match_id}** succesfully rescheduled, new time is **${date} ${time}**`,
						);
					} else if (reaction.emoji.name === "❌") {
						await message.reply(
							`${user.username} declined the reschedule ❌`,
						);
						return;
					}
				});

				collector.on("end", (collected) => {
					if (collected.size === 0) {
						message.reply("No response received in time ⌛");
					}
				});
			} catch (error) {
				console.log(error);
				await interaction.reply(
					"Error occured while rescheduling the match (reaction logic)",
				);
			}
		} else {
			interaction.reply(
				"Could not find players for this match, contact @aetherian",
			);
			return;
		}
	} catch (error) {
		console.log(error);
		await interaction.reply("Error occured while rescheduling the match");
	}
}
