import { getEnvConfig } from './shared.js';
import { Client, Collection, Intents } from 'discord.js';
import { resolveChannel, convertTime } from './tools/tools.js';
import { Constants } from './constants.js';
import { readdirSync } from 'fs';

const sourceFolder = Constants.sourceFolder;
const eventsFolder = Constants.eventsFolder;
const commandsFolder = Constants.commandsFolder;
const jsExt = Constants.jsExt;

/**
 * Creates the discord client with interface hooks
 * @returns {Client<boolean>}
 */
function createDiscordClient() {
	const client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_PRESENCES,
			Intents.FLAGS.GUILD_MEMBERS,
		],
	});
	client.commands = new Collection();
	client.tools = {
		convertTime,
		resolveChannel,
	};

	return client;
}

/**
 * Initiate the bot with hooks configured
 * @returns {Promise<void>}
 */
export async function initBot() {
	const { TOKEN, MONGODB } = getEnvConfig();
	const client = createDiscordClient();

	// Commands Setup
	let folders = readdirSync(`./${sourceFolder}/${commandsFolder}/`);
	for (const folder of folders) {
		const commandFiles = readdirSync(`${sourceFolder}/${commandsFolder}/${folder}/`).filter(
			(file) => file.endsWith(jsExt)
		);

		for (const file of commandFiles) {
			const command = await import(`./${commandsFolder}/${folder}/${file}`);
			await client.commands.set(command.data.name, command);
		}
	}

	// Executing commands
	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.execute(interaction, client);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	});

	// Events setup
	const eventFiles = readdirSync(`./${sourceFolder}/${eventsFolder}`).filter((file) =>
		file.endsWith(jsExt)
	);

	for (const file of eventFiles) {
		const event = await import(`./${eventsFolder}/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
	}

	// Login
	await client.login(TOKEN);
}
