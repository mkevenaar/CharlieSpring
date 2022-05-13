import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';

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
    let user;
    user = interaction.options.getUser('user');
    if(!user) {
      user = interaction.user;
    }

    let message = new MessageEmbed()
      .setTitle(`Avatar of ${user.username}`)
      .setImage(`${user.displayAvatarURL({ dynamic: true })}?size=1024`);

    await interaction.reply({ embeds: [message] });
  } catch (err) {
    console.log(err);
    await interaction.reply({
      content: `An issue has occurred while running the command. If this error keeps occurring please contact our development team.`,
      ephemeral: true,
    });
  }
}
