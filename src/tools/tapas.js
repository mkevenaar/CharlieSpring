import { MessageEmbed } from 'discord.js';
import { InvalidUrlException, RSSParseError } from '../exceptions/runtime.exceptions.js';
import { isURL } from './tools.js';

import Parser from 'rss-parser';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export class tapasTools {
  //Slash command functions
  static async configureTapas(interaction, client) {
    const guildService = client.database.GuildService;

    const channel = interaction.options.getChannel('channel');
    const enable = interaction.options.getBoolean('enable');

    await guildService.updateTapas(interaction.guild.id, enable, channel);
  }

  static async displayTapas(interaction, client) {
    const guildService = client.database.GuildService;
    let guildData = await guildService.get(interaction.guild.id);

    let tapasEmbed = new MessageEmbed()
      .setTitle('Tapas')
      .setDescription('Currently configured on the server: ')
      .addField(`Enabled`, `${guildData.addons.tapas.enabled}`, true)
      .addField(`Channel`, `<#${guildData.addons.tapas.channel}>`, true);

    guildData.tapas.forEach((tapas) => {
      let role = '';
      if (tapas.role) {
        role = `\nRole: <@&${tapas.role}>`;
      }
      tapasEmbed.addField(`${tapas.title}`, `RSS: ${tapas.rss}${role}`, false);
    });
    return await interaction.reply({ embeds: [tapasEmbed], ephemeral: true });
  }

  static async addTapas(interaction, client) {
    const role = interaction.options.getRole('role');
    const tapas_url = interaction.options.getString('tapas_url');
    return this.createTapas(tapas_url, role, interaction, client);
  }

  static async addHeartstopper(interaction, client) {
    const role = interaction.options.getRole('role');
    return this.createTapas('https://tapas.io/rss/series/35242', role, interaction, client);
  }

  static async editTapas(interaction, client) {
    const role = interaction.options.getRole('role');
    const tapas_rss = interaction.options.getString('tapas_rss');
    let tapasService = client.database.TapasService;

    await tapasService.updateRole(interaction.guild.id, tapas_rss, role);
    await client.TapasRssService.load();
  }

  static async deleteTapas(interaction, client) {
    const tapas_rss = interaction.options.getString('tapas_rss');

    let tapasService = client.database.TapasService;

    await tapasService.delete(interaction.guild.id, tapas_rss);
    await client.TapasRssService.load();
  }

  //Helper functions
  static async createTapas(tapas_url, role, interaction, client) {
    let RSSParser = new Parser();
    let feed;

    let tapasService = client.database.TapasService;

    await this.validateTapasUrl(tapas_url);
    let tapas_rss = tapas_url;

    if (!tapas_url.startsWith('https://tapas.io/rss')) {
      tapas_rss = await this.findRSSfromShow(tapas_url);
    }

    try {
      feed = await RSSParser.parseURL(tapas_rss);
    } catch (error) {
      console.log(error);
      throw new RSSParseError('Failed to parse RSS feed');
    }
    let title = feed.title;
    let webToon = await tapasService.create(interaction.guild.id, tapas_rss, title, role);
    await client.TapasRssService.load();
    return webToon;
  }

  static async validateTapasUrl(tapas_url) {
    if (!isURL(tapas_url)) {
      throw new InvalidUrlException('The provided URL is invalid');
    }

    if (!tapas_url.startsWith('https://tapas.io')) {
      throw new InvalidUrlException('The provided URL is not a tapas URL');
    }
  }

  static async findRSSfromShow(tapas_url) {
    const response = await fetch(tapas_url);
    const body = await response.text();
    const $ = cheerio.load(body);
    const tapastic_regex = new RegExp('tapastic://series/[0-9]+');
    const id_regex = new RegExp('[0-9]+');
    const content = $('meta[property="al:ios:url"]').attr('content');
    if (tapastic_regex.test(content)) {
      let id = id_regex.exec(content)[0];
      return 'https://tapas.io/rss/series/' + id;
    }
    return;
  }
}
