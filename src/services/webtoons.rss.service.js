import { GuildService } from '../database/guild.service.js';
import { WebtoonsService } from '../database/webtoons.service.js';
import { BotColors } from '../constants.js';
import { MessageEmbed } from 'discord.js';
import { NotFoundException } from '../exceptions/runtime.exceptions.js';

import htmlConvert from 'html-to-text';
import Parser from 'rss-parser';

export class WebtoonsRssService {
  constructor(client) {
    this.client = client;

    this.RSSParser = new Parser();

    this.load();
  }

  async load() {
    let guilds = await GuildService.listWebtoons();
    guilds.forEach((guild) => {
      guild.webtoons.forEach((webtoon) => {
        this.fetch(webtoon, guild.addons.webtoons.channel, true);
      });
    });
  }

  async fetch(webtoon, channelId, now = false) {
    setTimeout(
      async () => {
        // break out of the loop if the webtoon gets deleted!
        try {
          webtoon = await WebtoonsService.get(webtoon.guildId, webtoon.rss);
        } catch (error) {
          if (!error instanceof NotFoundException) {
            throw error;
          } else {
            return;
          }
        }

        //Do the RSS magic
        let guild = await this.client.guilds.fetch(webtoon.guildId);
        const channel = await this.client.tools.resolveChannel(channelId, guild);
        let newDate = 0;

        if (!channel) return;

        try {
          const newFeed = await this.RSSParser.parseURL(webtoon.rss);
          let newItems = newFeed.items
            .map((newItem) => {
              if (webtoon.lastItemDate < Date.parse(newItem.pubDate)) {
                newDate =
                  newDate < Date.parse(newItem.pubDate) ? Date.parse(newItem.pubDate) : newDate;
                return newItem;
              }
            })
            .filter((element) => {
              return element !== undefined;
            });

          if (webtoon.lastItemDate === 0) {
            newItems = [newItems[0]];
          }
          // Make Discord embeds for each one
          const embeds = await this.makeEmbeds(newItems, newFeed);
          for (const embed of embeds) {
            // Send to the channel
            let returnData = {};
            if (webtoon.role) {
              returnData.allowedMentions = { roles: [webtoon.role] };
              returnData.content = `<@&${webtoon.role}> a new update to ${webtoon.title} is posted!`;
            }
            returnData.embeds = [embed];
            channel.send(returnData);
          }
        } catch (error) {
          console.error(error);
          // Disabled temporary
          // channel.send(
          //   `There was an error fetching the data:\n${error.message}!\nFeed: ${webtoon.title}: ${webtoon.rss}`
          // );
        }

        if (newDate !== 0) {
          webtoon.lastItemDate = newDate;
          await webtoon.save();
        }

        this.fetch(webtoon, channelId);
      },
      now ? 0 : 60000
    );
  }

  async makeEmbeds(items, feed) {
    const embeds = [];
    for (const item of items) {
      let embed = new MessageEmbed().setColor(BotColors.default);

      if (item.creator) embed.setAuthor({ name: item.creator });
      if (item.category) embed.addField('Category:', item.category);
      if (item.content) embed.setDescription(await this.convertHtml(item.content));
      if (feed.image && feed.image.title) embed.setFooter({ text: feed.image.title });
      if (feed.image && feed.image.url) embed.setImage(feed.image.url);
      if (item.link) {
        if (item.link.match(/(?:http).+(?::\/\/).+\..+/g)) {
          embed.setURL(item.link);
        } else {
          embed.setURL(feed.link);
        }
      }
      if (item.pubDate) {
        embed.setTimestamp(Date.parse(item.pubDate));
      }
      if (item.title) embed.setTitle(item.title.slice(0, 256));

      embeds.push(embed);
    }
    return embeds;
  }

  async convertHtml(text) {
    const { convert } = htmlConvert;
    text = text
      .replace(/\*/gi, '')
      .replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, '**$2**') // Bolded markdown
      .replace(/<(em|i)>(.*?)<(\/(em|i))>/gi, '*$2*') // Italicized markdown
      .replace(/<(u)>(.*?)<(\/(u))>/gi, '__$2__'); // Underlined markdown

    return convert(text, {
      wordwrap: null,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        // { selector: 'img', options: { linkBrackets: [' ', ' '] } },
        { selector: 'img', format: 'skip' },
      ],
    });
  }
}
