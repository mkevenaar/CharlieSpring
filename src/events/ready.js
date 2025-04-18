import { ActivityType } from 'discord.js';

export const name = 'ready';
export const once = false;

/**
 *
 * @param {import('discord.js').Client} client Client
 */
export function execute(client) {
  console.log('Logged as:', client.user.tag);
  client.user.setPresence({
    activities: [
      {
        name: 'Why are we like this?',
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  });
}
