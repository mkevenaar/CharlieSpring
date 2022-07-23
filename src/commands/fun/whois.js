import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { NickBots, NickEmoji } from '../../constants.js';
import { botPermissions } from '../../tools/botPermissions.js';

export const permission = new botPermissions()
  .setBotPerms([PermissionsBitField.Flags.SendMessages])
  .setBotMessage("It seems that I don't have permission to send messages!");

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
    'Administrator',
    'ManageGuild',
    'ManageRoles',
    'ManageChannels',
    'BanMembers',
    'KickMembers',
    'ManageMessages',
    'ManageWebhooks',
    'ManageEmojisAndStickers',
  ];

  const flags = {
    Staff: `\`Discord Employee\``,
    Partner: `\`Partnered Server Owner\``,
    Hypesquad: `\`HypeSquad Events Member\``,
    BugHunterLevel1: `\`Bug Hunter Level 1\``,
    HypeSquadOnlineHouse1: `\`House Bravery Member\``,
    HypeSquadOnlineHouse2: `\`House Brilliance Member\``,
    HypeSquadOnlineHouse3: `\`House Balance Member\``,
    PremiumEarlySupporter: `\`Early Nitro Supporter\``,
    TeamPseudoUser: 'User is a team',
    BugHunterLevel2: `\`Bug Hunter Level 2\``,
    VerifiedBot: `\`Verified Bot\``,
    VerifiedDeveloper: `\`Early Verified Bot Developer\``,
    CertifiedModerator: `\`Discord Certified Moderator\``,
    BotHTTPInteractions: `\`Bot uses only HTTP interactions\``,
  };

  try {
    let userId = interaction.options.getUser('user')?.id || interaction.user.id;

    let member = await interaction.guild.members.fetch(userId);

    // Get a list of roles
    let roleCount = await member.roles.cache
      .filter(function (role) {
        return role.id !== interaction.guild.roles.everyone.id;
      })
      .map((role) => '<@&' + role.id + '>');
    // Get joined date for member
    let joinDate = Math.floor(member.guild.joinedTimestamp / 1000);
    // Get user account create date
    let createDate = Math.floor(member.user.createdAt / 1000);

    // User Flags
    const userFlags = (await member.user.fetchFlags()).toArray();

    // Key Permissions
    const keyPermissions = member.permissions.toArray().filter((p) => elevatedPerms.includes(p));
    if (keyPermissions.includes('Administrator'))
      keyPermissions.splice(
        0,
        0,
        keyPermissions.splice(
          keyPermissions.findIndex((p) => p === 'Administrator'),
          1
        )[0]
      );
    if (keyPermissions.includes('ManageGuild') && keyPermissions.includes('Administrator'))
      keyPermissions.splice(
        1,
        0,
        keyPermissions.splice(
          keyPermissions.findIndex((p) => p === 'ManageGuild'),
          1
        )[0]
      );
    else if (keyPermissions.includes('ManageGuild'))
      keyPermissions.splice(
        0,
        0,
        keyPermissions.splice(
          keyPermissions.findIndex((p) => p === 'ManageGuild'),
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

    let message = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.username}#${member.user.discriminator}`,
        iconURL: member.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .addFields([
        { name: `User`, value: `${member.user}`, inline: false },
        { name: `Joined At`, value: `<t:${joinDate}:F>`, inline: true },
        { name: `Created At`, value: `<t:${createDate}:F>`, inline: true },
        { name: `Bot`, value: `\`${member.user.bot}\``, inline: true },
        { name: `Roles [${roleCount.length}]`, value: roleCount.join(' '), inline: false },
      ])
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setColor(member.displayHexColor);

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
      message.addFields([
        {
          name: 'Key Permissions',
          value: `${
            interaction.guild.ownerId === member.id ? ' **`ServerOwner`**, ' : ''
          } \`${keyPermissions.join('`, `')}\``,
        },
      ]);
    }

    if (userFlags.length > 0) {
      message.addFields([
        { name: `Badges`, value: userFlags.map((flag) => flags[flag]).join('\n'), inline: true },
      ]);
    }

    const reply = await interaction.reply({
      embeds: [message],
      ephemeral: false,
      fetchReply: true,
    });

    if (NickBots.includes(member.user.id)) {
      let emoji = NickEmoji[Math.floor(Math.random() * NickEmoji.length)];
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
