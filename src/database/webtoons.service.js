import { WebtoonsModel } from './models/webtoons.js';
import { AlreadyExistException, NotFoundException } from '../exceptions/runtime.exceptions.js';
import { GuildService } from './guild.service.js';

export class WebtoonsService {
  static async list(guildId) {
    const webtoonFilter = { guildId: guildId };
    return WebtoonsModel.find(webtoonFilter);
  }

  static async get(guildId, rss) {
    const filter = { guildId: guildId, rss: rss };
    const webtoonEntry = await WebtoonsModel.findOne(filter);

    if (!webtoonEntry) {
      throw new NotFoundException('Cannot find this webtoon');
    }

    return webtoonEntry;
  }

  static async delete(guildId, rss) {
    const filter = { guildId: guildId, rss: rss };
    let webtoonEntry = await this.get(guildId, rss);

    await GuildService.deleteWebtoon(guildId, webtoonEntry);
    return WebtoonsModel.findOneAndDelete(filter);
  }

  static async create(guildId, rss, title, role) {
    let existingWebtoon;

    try {
      existingWebtoon = await this.get(guildId, rss);
    } catch (error) {
      if ((!error) instanceof NotFoundException) {
        throw error;
      }
    }

    if (existingWebtoon) {
      throw new AlreadyExistException('Webtoon already configured');
    }

    let webtoonEntry = new WebtoonsModel({
      guildId: guildId,
      registeredAt: Date.now(),
      rss: rss,
      title: title,
    });

    if (!!role?.id) {
      webtoonEntry.role = role.id;
    }

    await webtoonEntry.save();
    await GuildService.addWebtoon(guildId, webtoonEntry);
    return webtoonEntry;
  }

  static async updateRole(guildId, rss, role) {
    let webtoonEntry = await this.get(guildId, rss);

    if (!!role?.id) {
      webtoonEntry.role = role.id;
    }

    await webtoonEntry.save();
    return webtoonEntry;
  }
}
