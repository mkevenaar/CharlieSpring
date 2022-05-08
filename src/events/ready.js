export const name = 'ready';
export const once = true;

export function execute(client) {
  console.log('Logged as:', client.user.tag);
  client.user.setPresence({
    activities: [
      {
        name: 'Why are we like this?',
        type: 'WATCHING',
      },
    ],
    status: 'online',
  });
}
