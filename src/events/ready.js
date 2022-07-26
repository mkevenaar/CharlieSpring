import { ActivityType } from 'discord.js';

export const name = 'ready';
export const once = false;

export function execute(client) {
  console.log('Logged as:', client.user.tag);
  client.user.setPresence({
    activities: [
      {
        name: 'Why are we like this?',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  });
}
