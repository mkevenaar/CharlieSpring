import { TapasModel } from './models/tapas.js';
import { AlreadyExistException, NotFoundException } from '../exceptions/runtime.exceptions.js';
import { GuildService } from './guild.service.js';

export class TapasService {
  static async list(guildId) {
    const tapasFilter = { guildId: guildId };
    return TapasModel.find(tapasFilter);
  }

  static async get(guildId, rss) {
    const filter = { guildId: guildId, rss: rss };
    const tapasEntry = await TapasModel.findOne(filter);

    if (!tapasEntry) {
      throw new NotFoundException('Cannot find this tapas');
    }

    return tapasEntry;
  }

  static async delete(guildId, rss) {
    const filter = { guildId: guildId, rss: rss };
    let tapasEntry = await this.get(guildId, rss);

    await GuildService.deleteTapas(guildId, tapasEntry);
    return TapasModel.findOneAndDelete(filter);
  }

  static async create(guildId, rss, title, role) {
    let existingTapas;

    try {
      existingTapas = await this.get(guildId, rss);
    } catch (error) {
      if (!error instanceof NotFoundException) {
        throw error;
      }
    }

    if (existingTapas) {
      throw new AlreadyExistException('Tapas already configured');
    }

    let tapasEntry = new TapasModel({
      guildId: guildId,
      registeredAt: Date.now(),
      rss: rss,
      title: title,
    });

    if (!!role?.id) {
      tapasEntry.role = role.id;
    }

    await tapasEntry.save();
    await GuildService.addTapas(guildId, tapasEntry);
    return tapasEntry;
  }

  static async updateRole(guildId, rss, role) {
    let tapasEntry = await this.get(guildId, rss);

    if (!!role?.id) {
      tapasEntry.role = role.id;
    }

    await tapasEntry.save();
    return tapasEntry;
  }
}
