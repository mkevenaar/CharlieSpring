import { getEnvConfig } from './shared.js';
import { Client, Collection, GatewayIntentBits, Partials, InteractionType } from 'discord.js';
import mongoose from 'mongoose';
import { AutoPoster } from 'topgg-autoposter';
import { resolveChannel, convertTime } from './tools/tools.js';
import { reactionTools } from './tools/reactions.js';
import { tapasTools } from './tools/tapas.js';
import { webtoonTools } from './tools/webtoons.js';
import { Constants } from './constants.js';
import { readdirSync } from 'fs';
import { GuildService } from './database/guild.service.js';
import { ReactionService } from './database/reaction.service.js';
import { ReactionRoleService } from './database/reaction.role.service.js';
import { TapasService } from './database/tapas.service.js';
import { TapasRssService } from './services/tapas.rss.service.js';
import { WebtoonsService } from './database/webtoons.service.js';
import { WebtoonsRssService } from './services/webtoons.rss.service.js';

const sourceFolder = Constants.sourceFolder;
const eventsFolder = Constants.eventsFolder;
const commandsFolder = Constants.commandsFolder;
const selectMenuFolder = Constants.selectMenuFolder;
const jsExt = Constants.jsExt;

/**
 * Creates the discord client with interface hooks
 * @returns {Client<boolean>}
 */
export function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });
  client.commands = new Collection();
  client.selectMenu = new Collection();
  client.database = {
    GuildService: GuildService,
    ReactionService: ReactionService,
    ReactionRoleService: ReactionRoleService,
    TapasService: TapasService,
    WebtoonsService: WebtoonsService,
  };
  client.tools = {
    convertTime,
    resolveChannel,
    reactionTools: reactionTools,
    tapasTools: tapasTools,
    webtoonTools: webtoonTools,
  };

  return client;
}

/**
 * Initiate the bot with hooks configured
 * @returns {Promise<void>}
 */
export async function initBot() {
  const { TOKEN, MONGODB, TOPGG_TOKEN } = getEnvConfig();
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

  // SelectMenu Setup
  const menuFiles = readdirSync(`./${sourceFolder}/${selectMenuFolder}/`).filter((file) =>
    file.endsWith(jsExt)
  );
  for (const menuFile of menuFiles) {
    const menu = await import(`./${selectMenuFolder}/${menuFile}`);
    await client.selectMenu.set(menu.data.name, menu);
  }

  // Executing commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.type == InteractionType.ApplicationCommand) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.permission.checkUserPerms(interaction);
      await command.permission.checkBotPerms(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command! \n ' + error.message,
        ephemeral: true,
      });
      return;
    }

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

  // Executing Select Menus
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.type == InteractionType.selectMenu) return;

    const menu = client.selectMenu.get(interaction.customId);
    if (!menu) return;

    try {
      await menu.execute(interaction, client);
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

  // Initialize objects once client is ready
  client.on('ready', async () => {
    client.TapasRssService = new TapasRssService(client);
    client.WebtoonsRssService = new WebtoonsRssService(client);
  });

  connectWithRetry(MONGODB);

  // Login
  await client.login(TOKEN);

  // Top.gg AutoPoster; only do this when we have a token setup
  if (TOPGG_TOKEN) {
    const poster = AutoPoster(TOPGG_TOKEN, client); // your discord.js or eris client

    // optional
    poster.on('posted', (stats) => {
      // ran when successfully posted
      console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
    });
  }
}

// Connect to the database
async function connectWithRetry(MONGODB) {
  return mongoose
    .connect(MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log('Unable to connect to MongoDB Database.\nError: ' + err);
      setTimeout(connectWithRetry, 5000, MONGODB);
    });
}
