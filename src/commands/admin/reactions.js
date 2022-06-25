import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord.js';
import { ReactionCommands } from '../../constants.js';
import { CommandNotFoundException } from '../../exceptions/runtime.exceptions.js';
import { botPermissions } from '../../tools/botPermissions.js';

export const permission = new botPermissions()
  .setUserPerms(Permissions.FLAGS.ADMINISTRATOR)
  .setUserMessage("You don't have permission configure the reaction roles!")
  .setBotPerms([Permissions.FLAGS.SEND_MESSAGES])
  .setBotMessage("It seems that I don't have permission to send messages!");

export const data = new SlashCommandBuilder()
  .setName('reactions')
  .setDescription('Configure the reaction roles (admin only)')
  .addSubcommand((configure) => {
    return configure
      .setName(ReactionCommands.configure)
      .setDescription('Enable reaction roles and set channel (admin only)')
      .addChannelOption((channel) => {
        return channel
          .setName('channel')
          .setDescription('Channel you want Charlie to send the reaction role messages in')
          .setRequired(false);
      })
      .addBooleanOption((enable) => {
        return enable
          .setName('enable')
          .setDescription('Enable (true) or disable (false) the reaction roles, default disabled')
          .setRequired(false);
      });
  })
  // Currently disabled, is there any use for this?
  // .addSubcommand((list) => {
  //   return list
  //     .setName(ReactionCommands.list)
  //     .setDescription('List the current configuration (admin only)');
  // })
  .addSubcommand((rebuild) => {
    return rebuild
      .setName(ReactionCommands.rebuild)
      .setDescription('Rebuild the reaction roles. !!WARN!! Potential destructive (admin only)');
  })
  .addSubcommandGroup((category) => {
    return category
      .setName('category')
      .setDescription('Work on categories for your roles (admin only)')
      .addSubcommand((add) => {
        return add
          .setName(ReactionCommands.add)
          .setDescription('Creates a new category for your roles (admin only)')
          .addStringOption((name) => {
            return name
              .setName('name')
              .setDescription('Name of the role category you want to add')
              .setRequired(true);
          })
          .addStringOption((description) => {
            return description
              .setName('description')
              .setDescription('Description of the role category (optional)')
              .setRequired(false);
          })
          .addStringOption((color) => {
            return color
              .setName('color')
              .setDescription('Hexadecimal color of the role category (optional)')
              .setRequired(false);
          });
      })
      .addSubcommand((edit) => {
        return edit
          .setName(ReactionCommands.edit)
          .setDescription('Edits an existing category for your roles (admin only)')
          .addStringOption((name) => {
            return name
              .setName('name')
              .setDescription('Current name of the role category you want to edit')
              .setRequired(true);
          })
          .addStringOption((description) => {
            return description
              .setName('description')
              .setDescription('Description of the role category (optional)')
              .setRequired(false);
          })
          .addStringOption((description) => {
            return description
              .setName('new-name')
              .setDescription('New name of the role category you want to edit (optional)')
              .setRequired(false);
          })
          .addStringOption((color) => {
            return color
              .setName('color')
              .setDescription('Hexadecimal color of the role category (optional)')
              .setRequired(false);
          });
      })
      .addSubcommand((remove) => {
        return remove
          .setName(ReactionCommands.delete)
          .setDescription('Deletes a category for your roles (admin only)')
          .addStringOption((name) => {
            return name
              .setName('name')
              .setDescription('Name of the role category you want to delete')
              .setRequired(true);
          });
      });
  })
  .addSubcommandGroup((roles) => {
    return roles
      .setName('roles')
      .setDescription('Work on roles inside categories (admin only)')
      .addSubcommand((add) => {
        return add
          .setName(ReactionCommands.add)
          .setDescription('Adds a new role to an existing category (admin only)')
          .addRoleOption((role) => {
            return role.setName('role').setDescription('Role you want to add').setRequired(true);
          })
          .addStringOption((emoji) => {
            return emoji
              .setName('emoji')
              .setDescription('Emoji to use for this role')
              .setRequired(true);
          })
          .addStringOption((category) => {
            return category
              .setName('category')
              .setDescription('Existing category name')
              .setRequired(true);
          })
          .addStringOption((description) => {
            return description
              .setName('description')
              .setDescription('Description of the role (optional)')
              .setRequired(false);
          });
      })
      .addSubcommand((edit) => {
        return edit
          .setName(ReactionCommands.edit)
          .setDescription('Edits an existing role in a category (admin only)')
          .addRoleOption((role) => {
            return role.setName('role').setDescription('Role you want to edit').setRequired(true);
          })
          .addStringOption((category) => {
            return category
              .setName('category')
              .setDescription('Existing category name where the role is located in')
              .setRequired(true);
          })
          .addStringOption((emoji) => {
            return emoji
              .setName('emoji')
              .setDescription('Emoji to use for this role (optional)')
              .setRequired(false);
          })
          .addStringOption((description) => {
            return description
              .setName('description')
              .setDescription('Description of the role (optional)')
              .setRequired(false);
          });
      })
      .addSubcommand((remove) => {
        return remove
          .setName(ReactionCommands.delete)
          .setDescription('Deletes a role from your category (admin only)')
          .addRoleOption((role) => {
            return role.setName('role').setDescription('Role you want to delete').setRequired(true);
          })
          .addStringOption((category) => {
            return category
              .setName('category')
              .setDescription('Existing category name where the role is located in')
              .setRequired(true);
          });
      });
  });

export async function execute(interaction, client) {
  const guildService = client.database.GuildService;
  let guildData = await guildService.get(interaction.guild.id);

  // Ensure welcome messages enabled
  const reactionsProp = guildData?.addons?.reactions;

  if (
    interaction.options.getSubcommand() !== ReactionCommands.configure &&
    interaction.options.getSubcommand() !== ReactionCommands.list &&
    (!reactionsProp?.enabled || reactionsProp?.channel === null)
  ) {
    await interaction.reply({
      content:
        'Reactions not enabled, stopping.\nPlease configure reactions using `/reaction configure`. Both `channel` and `enable` have to be set for the bot to function properly',
      ephemeral: true,
    });
    return;
  }

  const reactionTools = client.tools.reactionTools;

  try {
    switch (interaction.options.getSubcommandGroup(false)) {
      case null:
        switch (interaction.options.getSubcommand()) {
          case ReactionCommands.configure:
            await reactionTools.configureReactions(interaction, client);
            break;
          case ReactionCommands.list:
            await reactionTools.displayReactions(interaction, client);
            break;
          case ReactionCommands.rebuild:
            await reactionTools.rebuildCategories(interaction, client);
            break;
          default:
            console.log(interaction.options.getSubcommand());
            throw new CommandNotFoundException(
              'Unknown command: ' + interaction.options.getSubcommand()
            );
        }
        break;
      case 'category':
        switch (interaction.options.getSubcommand()) {
          case ReactionCommands.add:
            await reactionTools.addCategory(interaction, client);
            break;
          case ReactionCommands.edit:
            await reactionTools.editCategory(interaction, client);
            break;
          case ReactionCommands.delete:
            await reactionTools.deleteCategory(interaction, client);
            break;
          default:
            console.log(interaction.options.getSubcommand());
            throw new CommandNotFoundException(
              'Unknown command: ' + interaction.options.getSubcommand()
            );
        }
        break;
      case 'roles':
        switch (interaction.options.getSubcommand()) {
          case ReactionCommands.add:
            await reactionTools.createCategoryRole(interaction, client);
            break;
          case ReactionCommands.edit:
            await reactionTools.editCategoryRole(interaction, client);
            break;
          case ReactionCommands.delete:
            await reactionTools.deleteCategoryRole(interaction, client);
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

  await interaction.reply({ content: 'Settings saved!', ephemeral: true });
}
