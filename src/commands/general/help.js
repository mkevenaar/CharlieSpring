import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageEmbed, MessageButton } from 'discord.js';

export const data = new SlashCommandBuilder().setName('help').setDescription('Shows help');

export async function execute(interaction, client) {
  //TODO: This needs to be improved, but we need a help command. For now a manual command.
  const help = new MessageEmbed()
    .setColor('#2d4d58')
    .setTitle('Help')
    .setDescription('Available slash commands:\n')
    .addFields(
      { name: 'Admin Commands', value: 'Commands available for admins' },
      {
        name: '/reactions category add',
        value: 'Creates a new category for your roles (admin only)',
        inline: true,
      },
      {
        name: '/reactions category edit',
        value: 'Edits an existing category for your roles (admin only)',
        inline: true,
      },
      {
        name: '/reactions category delete',
        value: 'Deletes a category for your roles (admin only)',
        inline: true,
      },
      {
        name: '/reactions role add',
        value: 'Adds a new role to an existing category (admin only)',
        inline: true,
      },
      {
        name: '/reactions role edit',
        value: 'Edits an existing role in a category (admin only)',
        inline: true,
      },
      {
        name: '/reactions role delete',
        value: 'Deletes a role from your category (admin only)',
        inline: true,
      },
      {
        name: '/reactions configure',
        value: 'Enable reaction roles and set channel (admin only)',
        inline: true,
      },
      {
        name: '/reactions rebuild',
        value: 'Rebuild the reaction roles. !!WARN!! Potential destructive (admin only)',
        inline: true,
      },
      { name: 'General Commands', value: 'Commands available for anyone' },
      {
        name: '/botstats',
        value: 'Information about the current statistics of the bot',
        inline: true,
      },
      {
        name: '/help',
        value: 'Shows this help',
        inline: true,
      },
      {
        name: '/ping',
        value: 'Replies with Pong!',
        inline: true,
      }
    );

  const btnrow = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel('Support')
      .setEmoji('🆘')
      .setURL('https://github.com/mkevenaar/CharlieSpring/issues')
      .setStyle('LINK'),
    new MessageButton()
      .setLabel('Add me to your server!')
      .setEmoji('🔗')
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=412652891206&scope=bot%20applications.commands`
      )
      .setStyle('LINK')
  );
  await interaction.reply({ embeds: [help], components: [btnrow], ephemeral: true });
}
