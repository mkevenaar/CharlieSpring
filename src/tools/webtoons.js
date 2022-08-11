import { EmbedBuilder } from 'discord.js';
import { InvalidUrlException, RSSParseError } from '../exceptions/runtime.exceptions.js';
import url from 'node:url';

import Parser from 'rss-parser';

export class webtoonTools {
  //Slash command functions
  static async configureWebtoons(interaction, client) {
    const guildService = client.database.GuildService;

    const channel = interaction.options.getChannel('channel');
    const enable = interaction.options.getBoolean('enable');

    await guildService.updateWebtoons(interaction.guild.id, enable, channel);
  }

  static async displayWebtoons(interaction, client) {
    const guildService = client.database.GuildService;
    let guildData = await guildService.get(interaction.guild.id);

    let webtoonsEmbed = new EmbedBuilder()
      .setTitle('Webtoons')
      .setDescription('Currently configured on the server: ')
      .addFields([
        { name: `Enabled`, value: `${guildData.addons.webtoons.enabled}`, inline: true },
        { name: `Channel`, value: `<#${guildData.addons.webtoons.channel}>`, inline: true },
      ]);

    guildData.webtoons.forEach((webtoon) => {
      let role = '';
      if (webtoon.role) {
        role = `\nRole: <@&${webtoon.role}>`;
      }
      webtoonsEmbed.addFields([
        { name: `${webtoon.title}`, value: `RSS: ${webtoon.rss}${role}`, inline: false },
      ]);
    });
    return await interaction.reply({ embeds: [webtoonsEmbed], ephemeral: true });
  }

  static async addWebtoon(interaction, client) {
    const role = interaction.options.getRole('role');
    const webtoon_rss = interaction.options.getString('webtoon_rss');
    return this.createWebtoon(webtoon_rss, role, interaction, client);
  }

  static async addHeartstopper(interaction, client) {
    const role = interaction.options.getRole('role');
    return this.createWebtoon(
      'https://www.webtoons.com/en/challenge/heartstopper/rss?title_no=329660',
      role,
      interaction,
      client
    );
  }

  static async editWebtoon(interaction, client) {
    const role = interaction.options.getRole('role');
    const webtoon_rss = interaction.options.getString('webtoon_rss');
    let webtoonsService = client.database.WebtoonsService;

    await webtoonsService.updateRole(interaction.guild.id, webtoon_rss, role);
    await client.WebtoonsRssService.load();
  }

  static async deleteWebtoon(interaction, client) {
    const webtoon_rss = interaction.options.getString('webtoon_rss');

    let webtoonsService = client.database.WebtoonsService;

    await webtoonsService.delete(interaction.guild.id, webtoon_rss);
    await client.WebtoonsRssService.load();
  }

  //Helper functions
  static async createWebtoon(webtoon_rss, role, interaction, client) {
    let RSSParser = new Parser();
    let feed;

    let webtoonsService = client.database.WebtoonsService;

    await this.validateWebtoonUrl(webtoon_rss);

    try {
      feed = await RSSParser.parseURL(webtoon_rss);
    } catch (error) {
      console.log(error);
      throw new RSSParseError('Failed to parse RSS feed');
    }
    let title = feed.title;
    let webToon = await webtoonsService.create(interaction.guild.id, webtoon_rss, title, role);
    await client.WebtoonsRssService.load();
    return webToon;
  }

  static async validateWebtoonUrl(webtoon_rss) {
    let host = url.parse(webtoon_rss).host;
    let allowedHosts = ['www.webtoons.com', 'webtoons.com'];
    if (!allowedHosts.includes(host)) {
      throw new InvalidUrlException('The provided URL is not a webtoon URL');
    }
  }
}
