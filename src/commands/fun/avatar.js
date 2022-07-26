import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { NickBots, NickEmoji } from '../../constants.js';
import { botPermissions } from '../../tools/botPermissions.js';

export const permission = new botPermissions()
  .setBotPerms([PermissionsBitField.Flags.SendMessages])
  .setBotMessage("It seems that I don't have permission to send messages!");

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Get a users avatar')
  .addUserOption((user) => {
    return user
      .setName('user')
      .setDescription('User you want the avatar of (optional)')
      .setRequired(false);
  });

export async function execute(interaction) {
  try {
    let userId = interaction.options.getUser('user')?.id || interaction.user.id;

    let user = await interaction.guild.members.fetch(userId);

    let message = new EmbedBuilder()
      .setTitle(`Avatar of ${user.user.username}`)
      .setImage(`${user.displayAvatarURL({ dynamic: true })}?size=1024`)
      .setColor(user.displayHexColor);

    const reply = await interaction.reply({ embeds: [message], fetchReply: true });

    if (NickBots.includes(user.id)) {
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
