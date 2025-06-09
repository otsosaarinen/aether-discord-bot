import { Events, Message } from "discord.js";

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		console.log(message.content);
		if (message.author.bot) {
			return;
		} else {
			await message.reply("test");
			await message.react("😀");
		}
	},
};
