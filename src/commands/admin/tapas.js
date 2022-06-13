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
  .setName('tapas')
  .setDescription('Configure tapas updates (admin only)')
  .addSubcommand((tapas) => {
    return tapas
      .setName('configure')
      .setDescription('Enable tapas and set channel (admin only)')
      .addChannelOption((channel) => {
        return channel
          .setName('channel')
          .setDescription('Channel you want Charlie to send the tapas update messages in')
          .setRequired(false);
      })
      .addBooleanOption((enable) => {
        return enable
          .setName('enable')
          .setDescription('Enable (true) or disable (false) the tapas, default disabled')
          .setRequired(false);
      });
  })
  .addSubcommand((list) => {
    return list.setName('list').setDescription('List the currently configured Tapas RSS URLs');
  })
  .addSubcommand((add) => {
    return add
      .setName('add')
      .setDescription('Add a tapas comic RSS URL')
      .addStringOption((rssUrl) => {
        return rssUrl
          .setName('tapas_url')
          .setDescription('URL of the tapas comic you want updates from')
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
      .setDescription('Adds the HeartStopper Tapas RSS URL')
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
      .setDescription('Edit a tapas comic role')
      .addStringOption((rssUrl) => {
        return rssUrl
          .setName('tapas_rss')
          .setDescription('RSS URL of the tapas you want to update')
          .setRequired(true);
      })
      .addRoleOption((role) => {
        return role.setName('role').setDescription('Role to ping on updates').setRequired(true);
      });
  })
  .addSubcommand((remove) => {
    return remove
      .setName('remove')
      .setDescription('Remove a tapas comic RSS URL')
      .addStringOption((rssUrl) => {
        return rssUrl
          .setName('tapas_rss')
          .setDescription('RSS URL of the tapas you want to delete')
          .setRequired(true);
      });
  });

export async function execute(interaction, client) {
  const guildService = client.database.GuildService;
  let guildData = await guildService.get(interaction.guild.id);

  // Ensure welcome messages enabled
  const tapasProp = guildData?.addons?.tapas;
  if (
    interaction.options.getSubcommand() !== 'configure' &&
    interaction.options.getSubcommand() !== 'list' &&
    !tapasProp?.enabled
  ) {
    await interaction.reply({ content: 'Tapas not enabled, stopping', ephemeral: true });
    return;
  }

  const tapasTools = client.tools.tapasTools;

  try {
    switch (interaction.options.getSubcommandGroup(false)) {
      case null:
        switch (interaction.options.getSubcommand()) {
          case 'configure':
            await tapasTools.configureTapas(interaction, client);
            break;
          case 'list':
            await tapasTools.displayTapas(interaction, client);
            break;
          case 'add':
            await tapasTools.addTapas(interaction, client);
            break;
          case 'heartstopper':
            await tapasTools.addHeartstopper(interaction, client);
            break;
          case 'edit':
            await tapasTools.editTapas(interaction, client);
            break;
          case 'remove':
            await tapasTools.deleteTapas(interaction, client);
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
