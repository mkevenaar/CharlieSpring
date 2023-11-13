import { NotFoundException } from '../exceptions/runtime.exceptions.js';

export const name = 'messageReactionRemove';
export const once = false;

export async function execute(reaction, user, client) {
  const reactionTools = client.tools.reactionTools;

  Promise.all([reaction.fetch(), user.fetch()])
    .then(async ([reaction, user]) => {
      /* Early leave if the message is not sent to a guild. */
      if (!reaction.message.guild) {
        return;
      }

      /* Get the member that reacted originally. */
      const member = await reaction.message.guild.members.fetch(user.id);
      if (!member) {
        return;
      }

      /* Try to add the member to the guild. */
      await reactionTools.getRole(client, reaction).then((role) => {
        if (role) {
          return member.roles.remove(role);
        }
      });
    })
    .catch((error) => {
      if ((!error) instanceof NotFoundException) {
        console.error('An error happened inside the addReaction handler of messageReactionAdd');
        console.error(error);
      }
    });
}
