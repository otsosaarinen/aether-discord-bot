import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readdirSync } from "fs";
import dotenv from "dotenv";

// initialize .env variables
dotenv.config();
const DISCORD_TOKEN = process.env.TOKEN;

// extend the client class to add "commands" property
export class ExtendedClient extends Client {
	public commands: Collection<string, any>;

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.MessageContent,
			],
		});
		this.commands = new Collection();
	}
}

// initialize the client
const client = new ExtendedClient();

// get all the commands from the commands folder and execute them
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter((file) =>
		file.endsWith(".ts"),
	);
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(pathToFileURL(filePath).href);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

// get all the events from the events folder and execute them
const eventsPath = path.join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) =>
	file.endsWith(".ts"),
);

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = await import(pathToFileURL(filePath).href);
	const evt = event.default;

	if (!evt || !evt.name || !evt.execute) {
		console.warn(`[WARNING] Skipping invalid event at ${filePath}`);
		continue;
	}

	if (evt.once) {
		client.once(evt.name, (...args) => evt.execute(...args));
	} else {
		client.on(evt.name, (...args) => evt.execute(...args));
	}
}

client.login(DISCORD_TOKEN);
