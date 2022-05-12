import { MessageEmbed, Role } from 'discord.js';

export class reactionTools {
  static async configureReactions(interaction, client) {
    const guildService = client.database.GuildService;

    const channel = interaction.options.getChannel('channel');
    const enable = interaction.options.getBoolean('enable');

    await guildService.updateReactions(interaction.guild.id, enable, channel);
  }

  static async rebuildCategories(interaction, client) {
    const reactionService = client.database.ReactionService;
    let categories = await reactionService.list(interaction.guild.id);

    await categories.forEach(async (category) => {
      await this.updateRoleMessage(client, interaction.guild, category.name);
    });
  }

  static async addCategory(interaction, client) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');

    const reactionService = client.database.ReactionService;

    await reactionService.create(interaction.guild.id, name, description);

    await this.updateRoleMessage(client, interaction.guild, name);
  }

  static async editCategory(interaction, client) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const newName = interaction.options.getString('new-name');

    const reactionService = client.database.ReactionService;

    let updateName = name;

    if (!!description?.length) {
      await reactionService.updateDescription(interaction.guild.id, name, description);
    }

    if (!!newName?.length) {
      await reactionService.updateName(interaction.guild.id, name, newName);
      updateName = newName;
    }

    await this.updateRoleMessage(client, interaction.guild, updateName);
  }

  static async deleteCategory(interaction, client) {
    const name = interaction.options.getString('name');

    const reactionService = client.database.ReactionService;
    let reactionRoleService = client.database.ReactionRoleService;

    let category = await reactionService.get(interaction.guild.id, name);
    category.roles.forEach(async (role) => {
      await reactionRoleService.delete(interaction.guild.id, name, role);
    });

    await this.deleteRoleMessage(client, interaction.guild, name);

    await reactionService.delete(interaction.guild.id, name);
  }

  static async createCategoryRole(interaction, client) {
    const role = interaction.options.getRole('role');
    const emoji = interaction.options.getString('emoji');
    const category = interaction.options.getString('category');
    const description = interaction.options.getString('description');

    let reactionRoleService = client.database.ReactionRoleService;
    let emojiValidation = await this.parseEmoji(emoji, interaction);

    //Validation
    if (!emojiValidation) {
      await interaction.reply({
        content:
          'Emoji verification failed. Make sure you use an guild or unicode emoji. Emoji from other servers will not work.',
        ephemeral: true,
      });
      return;
    }

    await reactionRoleService.create(interaction.guild.id, category, role, description, emoji);

    await this.updateRoleMessage(client, interaction.guild, category);
  }

  static async editCategoryRole(interaction, client) {
    const role = interaction.options.getRole('role');
    const emoji = interaction.options.getString('emoji');
    const category = interaction.options.getString('category');
    const description = interaction.options.getString('description');

    let reactionRoleService = client.database.ReactionRoleService;

    if (!!description?.length) {
      await reactionRoleService.updateDescription(
        interaction.guild.id,
        category,
        role.id,
        description
      );
    }

    if (!!emoji?.length) {
      let emojiValidation = await this.parseEmoji(emoji, interaction);
      if (!emojiValidation) {
        await interaction.reply({
          content:
            'Emoji verification failed. Make sure you use an guild or unicode emoji. Emoji from other servers will not work.',
          ephemeral: true,
        });
        return;
      }
      await reactionRoleService.updateEmoji(interaction.guild.id, category, role.id, emoji);
    }

    await this.updateRoleMessage(client, interaction.guild, category);
  }

  static async deleteCategoryRole(interaction, client) {
    const role = interaction.options.getRole('role');
    const category = interaction.options.getString('category');

    let reactionRoleService = client.database.ReactionRoleService;

    await reactionRoleService.delete(interaction.guild.id, category, role);

    await this.updateRoleMessage(client, interaction.guild, category);
  }

  static async updateRoleMessage(client, guild, categoryName) {
    const guildService = client.database.GuildService;
    const reactionService = client.database.ReactionService;
    let guildData = await guildService.get(guild.id);
    let category = await reactionService.get(guild.id, categoryName);

    const channelId = guildData.addons.reactions.channel;
    let messageId = category.messageId;

    let roleChannel = await client.tools.resolveChannel(channelId, guild);
    if (!roleChannel) return; // Unable to find channel in guild

    let message = new MessageEmbed();
    let body = [];

    message.setTitle(category.name);

    if (category.description) {
      body.push(category.description);
      body.push('');
    }

    category.roles.forEach((role) => {
      let roleText = role.description ? role.description : '<@&' + role.id + '>';
      body.push(role.emoji + ' - ' + roleText);
    });

    message.setDescription(body.join('\n'));
    let roleMessage;
    if (messageId?.trim()?.length) {
      roleMessage = await roleChannel.messages.fetch(messageId);
      await roleMessage.edit({ embeds: [message] });
    } else {
      roleMessage = await roleChannel.send({ embeds: [message] });
      reactionService.updateMessageId(guild.id, categoryName, roleMessage.id);
      messageId = roleMessage.id;
    }

    let reactions = roleMessage.reactions.cache;

    category.roles.forEach((role) => {
      roleMessage.react(role.emoji);
      reactions.forEach((reaction, key) => {
        if (reaction.emoji.toString() === role.emoji) {
          reactions.delete(key);
        }
      });
    });

    reactions.forEach((reaction) => {
      reaction.users.fetch().then(function (userList) {
        userList.forEach((user) => {
          reaction.users.remove(user.id);
        });
      });
    });
  }

  static async deleteRoleMessage(client, guild, categoryName) {
    const guildService = client.database.GuildService;
    const reactionService = client.database.ReactionService;
    let guildData = await guildService.get(guild.id);
    let category = await reactionService.get(guild.id, categoryName);

    const channelId = guildData.addons.reactions.channel;
    const messageId = category.messageId;

    let roleChannel = await client.tools.resolveChannel(channelId, guild);
    if (!roleChannel) return; // Unable to find channel in guild

    if (messageId?.trim()?.length) {
      await roleChannel.messages.delete(messageId);
    }
  }

  //Helper functions
  static async parseEmoji(emoji, interaction) {
    if (emoji.split(':').length == 3) {
      // Get custom emojis
      const lastTerm = emoji.split(':')[2].toString();
      return interaction.guild.emojis.cache.get(lastTerm.substring(0, lastTerm.length - 1));
    } else {
      // Unicode emojis
      const regex = /\p{Extended_Pictographic}/gu;
      return regex.test(emoji);
    }
  }

  static async getRole(client, reaction) {
    const messageId = reaction.message.id;
    const emoji = reaction.emoji.toString();
    const guild = reaction.message.guild;

    const reactionService = client.database.ReactionService;
    const roleData = await reactionService.getRole(guild.id, messageId, emoji);
    if (roleData?.roles?.length) {
      let roleId = roleData.roles[0].id;
      if (roleId && reaction.message.guild) {
        return reaction.message.guild.roles.fetch(roleId);
      }
    }
    return Promise.resolve(null);
  }
}
