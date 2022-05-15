import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { NickBots, NickEmoji } from '../../constants.js';
import moment from 'moment';

export const data = new SlashCommandBuilder()
  .setName('whois')
  .setDescription('Get a users information')
  .addUserOption((user) => {
    return user
      .setName('user')
      .setDescription('User you want the whois of (optional)')
      .setRequired(false);
  });

export async function execute(interaction, client) {
  const elevatedPerms = [
    'ADMINISTRATOR',
    'MANAGE_GUILD',
    'MANAGE_ROLES',
    'MANAGE_CHANNELS',
    'BAN_MEMBERS',
    'KICK_MEMBERS',
    'MANAGE_MESSAGES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS_AND_STICKERS',
  ];

  const flags = {
    DISCORD_EMPLOYEE: `\`Discord Employee\``,
    PARTNERED_SERVER_OWNER: `\`Partnered Server Owner\``,
    BUGHUNTER_LEVEL_1: `\`Bug Hunter (Level 1)\``,
    BUGHUNTER_LEVEL_2: `\`Bug Hunter (Level 2)\``,
    HYPESQUAD_EVENTS: `\`HypeSquad Events\``,
    HOUSE_BRAVERY: `\`House of Bravery\``,
    HOUSE_BRILLIANCE: `\`House of Brilliance\``,
    HOUSE_BALANCE: `\`House of Balance\``,
    EARLY_SUPPORTER: `\`Early Supporter\``,
    TEAM_USER: 'Team User',
    SYSTEM: 'System',
    VERIFIED_BOT: `\`Verified Bot\``,
    EARLY_VERIFIED_BOT_DEVELOPER: `\`Early Verified Bot Developer\``,
  };

  try {
    let user = interaction.options.getUser('user') || (await interaction.user.fetch());

    let member = await interaction.guild.members.fetch(user.id);
    // Get a list of roles
    let roleCount = await member.roles.cache
      .filter(function (role) {
        return role.id !== interaction.guild.roles.everyone.id;
      })
      .map((role) => '<@&' + role.id + '>');
    // Get joined date for member
    let joinDate = moment(member.guild.joinedTimestamp).format('MMMM Do YYYY, HH:mm:ss');
    // Get user account create date
    let createDate = moment(user.createdAt).format('MMMM Do YYYY, HH:mm:ss');

    // User Flags
    const userFlags = (await member.user.fetchFlags()).toArray();

    // Key Permissions
    const keyPermissions = member.permissions.toArray().filter((p) => elevatedPerms.includes(p));
    if (keyPermissions.includes('ADMINISTRATOR'))
      keyPermissions.splice(
        0,
        0,
        keyPermissions.splice(
          keyPermissions.findIndex((p) => p === 'ADMINISTRATOR'),
          1
        )[0]
      );
    if (keyPermissions.includes('MANAGE_GUILD') && keyPermissions.includes('ADMINISTRATOR'))
      keyPermissions.splice(
        1,
        0,
        keyPermissions.splice(
          keyPermissions.findIndex((p) => p === 'MANAGE_GUILD'),
          1
        )[0]
      );
    else if (keyPermissions.includes('MANAGE_GUILD'))
      keyPermissions.splice(
        0,
        0,
        keyPermissions.splice(
          keyPermissions.findIndex((p) => p === 'MANAGE_GUILD'),
          1
        )[0]
      );

    // Activity
    const activities = [];
    let customStatus;
    if (member.presence?.activities) {
      for (const activity of member.presence.activities.values()) {
        switch (activity.type) {
          case 'PLAYING':
            activities.push(`Playing **${activity.name}**`);
            break;
          case 'LISTENING':
            if (member.user.bot) activities.push(`Listening to **${activity.name}**`);
            else activities.push(`Listening to **${activity.details}** by **${activity.state}**`);
            break;
          case 'WATCHING':
            activities.push(`Watching **${activity.name}**`);
            break;
          case 'STREAMING':
            activities.push(`Streaming **${activity.name}**`);
            break;
          case 'CUSTOM_STATUS':
            customStatus = activity.state;
            break;
        }
      }
    }

    let message = new MessageEmbed()
      .setAuthor({
        name: `${user.username}#${user.discriminator}`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addField(`User`, `${user}`, false)
      .addField(`Joined At`, joinDate, true)
      .addField(`Created At`, createDate, true)
      .addField('Bot', `\`${member.user.bot}\``, true)
      .addField(`Roles [${roleCount.length}]`, roleCount.join(' '), false)
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.username}` });

    if (activities.length > 0) {
      message.setDescription(activities.join('\n'));
    }

    if (customStatus) {
      message.spliceFields(0, 0, {
        name: 'Custom Status',
        value: customStatus,
      });
    }

    if (keyPermissions.length > 0) {
      message.addField(
        'Key Permissions',
        `${
          interaction.guild.ownerId === member.id ? ' **`SERVER OWNER`**, ' : ''
        } \`${keyPermissions.join('`, `')}\``
      );
    }

    if (userFlags.length > 0) {
      message.addField('Badges', userFlags.map((flag) => flags[flag]).join('\n'), true);
    }

    const reply = await interaction.reply({ embeds: [message], ephemeral: false, fetchReply: true });

    if (NickBots.includes(user.id)) {
      let emoji = NickEmoji[Math.floor(Math.random()*NickEmoji.length)];
      await reply.react(emoji);
    }
  } catch (err) {
    console.log(err);
    await interaction.reply({
      content: `An issue has occurred while running the command. If this error keeps occurring please contact our development team.`,
      ephemeral: true,
    });
  }
}
