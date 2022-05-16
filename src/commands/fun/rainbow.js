import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageAttachment } from 'discord.js';
import { NickBots, NickEmoji } from '../../constants.js';
import canvacord from 'canvacord';

export const data = new SlashCommandBuilder()
  .setName('rainbow')
  .setDescription('Rainbow an users avatar')
  .addUserOption((user) => {
    return user
      .setName('user')
      .setDescription('User you want use avatar of (optional)')
      .setRequired(false);
  });

export async function execute(interaction, client) {
  try {
    await interaction?.deferReply({ ephemeral: false });

    let user = interaction?.options.getUser('user');

    if (!user) user = interaction?.member.user;

    let avatar =
      user.displayAvatarURL({
        dynamic: false,
        format: 'png',
      }) + `?size=1024`;

    let image = await canvacord.Canvas.rainbow(avatar);

    let attachment = new MessageAttachment(image, 'rainbow.png');

    let embed = new MessageEmbed()
      .setColor(user.displayHexColor)
      .setImage('attachment://rainbow.png');
    const reply = await interaction?.editReply({
      embeds: [embed],
      files: [attachment],
      ephemeral: true,
      fetchReply: true,
    });

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
