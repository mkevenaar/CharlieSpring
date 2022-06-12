import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord.js';
import { CommandNotFoundException } from '../../exceptions/runtime.exceptions.js';
import { botPermissions } from '../../tools/botPermissions.js';

export const permission = new botPermissions()
  .setUserPerms(Permissions.FLAGS.ADMINISTRATOR)
  .setUserMessage("You don't have permission configure the reaction roles!")
  .setBotPerms([
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.EMBED_LINKS,
    Permissions.FLAGS.MENTION_EVERYONE,
  ])
  .setBotMessage(
    "It seems that I don't have all the permissions required!\nI need at least: Send messages; Embed links; Mention everyone, here and any role"
  );

export const data = new SlashCommandBuilder()
  .setName('webtoons')
  .setDescription('Configure webtoons updates (admin only)')
  .addSubcommand((webtoons) => {
    return webtoons
      .setName('configure')
      .setDescription('Enable webtoons and set channel (admin only)')
      .addChannelOption((channel) => {
        return channel
          .setName('channel')
          .setDescription('Channel you want Charlie to send the webtoons update messages in')
          .setRequired(false);
      })
      .addBooleanOption((enable) => {
        return enable
          .setName('enable')
          .setDescription('Enable (true) or disable (false) the webtoons, default disabled')
          .setRequired(false);
      });
  })
  .addSubcommand((list) => {
    return list.setName('list').setDescription('List the currently configured Webtoon RSS URLs');
  })
  .addSubcommand((add) => {
    return add
      .setName('add')
      .setDescription('Add a webtoons comic RSS URL')
      .addStringOption((rssUrl) => {
        return rssUrl
          .setName('webtoon_rss')
          .setDescription('RSS URL of the webtoon you want updates from')
          .setRequired(true);
      })
      .addRoleOption((role) => {
        return role
          .setName('role')
          .setDescription('Role to ping on updates (optional)')
          .setRequired(false);
      });
  })
  .addSubcommand((addHS) => {
    return addHS
      .setName('heartstopper')
      .setDescription('Adds the HeartStopper Webtoon RSS URL')
      .addRoleOption((role) => {
        return role
          .setName('role')
          .setDescription('Role to ping on updates (optional)')
          .setRequired(false);
      });
  })
  .addSubcommand((edit) => {
    return edit
      .setName('edit')
      .setDescription('Edit a webtoons comic role')
      .addStringOption((rssUrl) => {
        return rssUrl
          .setName('webtoon_rss')
          .setDescription('RSS URL of the webtoon you want to update')
          .setRequired(true);
      })
      .addRoleOption((role) => {
        return role.setName('role').setDescription('Role to ping on updates').setRequired(true);
      });
  })
  .addSubcommand((remove) => {
    return remove
      .setName('remove')
      .setDescription('Remove a webtoons comic RSS URL')
      .addStringOption((rssUrl) => {
        return rssUrl
          .setName('webtoon_rss')
          .setDescription('RSS URL of the webtoon you want to delete')
          .setRequired(true);
      });
  });

export async function execute(interaction, client) {
  const guildService = client.database.GuildService;
  let guildData = await guildService.get(interaction.guild.id);

  // Ensure welcome messages enabled
  const webtoonsProp = guildData?.addons?.webtoons;
  if (
    interaction.options.getSubcommand() !== 'configure' &&
    interaction.options.getSubcommand() !== 'list' &&
    !webtoonsProp?.enabled
  ) {
    await interaction.reply({ content: 'Webtoons not enabled, stopping', ephemeral: true });
    return;
  }

  const webtoonTools = client.tools.webtoonTools;

  try {
    switch (interaction.options.getSubcommandGroup(false)) {
      case null:
        switch (interaction.options.getSubcommand()) {
          case 'configure':
            await webtoonTools.configureWebtoons(interaction, client);
            break;
          case 'list':
            await webtoonTools.displayWebtoons(interaction, client);
            break;
          case 'add':
            await webtoonTools.addWebtoon(interaction, client);
            break;
          case 'heartstopper':
            await webtoonTools.addHeartstopper(interaction, client);
            break;
          case 'edit':
            await webtoonTools.editWebtoon(interaction, client);
            break;
          case 'remove':
            await webtoonTools.deleteWebtoon(interaction, client);
            break;
          default:
            console.log(interaction.options.getSubcommand());
            throw new CommandNotFoundException(
              'Unknown command: ' + interaction.options.getSubcommand()
            );
        }
        break;
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Failed to save settings! \n ' + error.message,
      ephemeral: true,
    });
    return;
  }

  // Don't send a response during the list command!
  if (interaction.options.getSubcommand() !== 'list') {
    await interaction.reply({ content: 'Settings saved!', ephemeral: true });
  }
}
