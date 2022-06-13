import { GuildModel } from './models/guild.js';

export class GuildService {
  static async get(guildId) {
    const filter = { id: guildId };
    const categoryPath = { path: 'categories' };
    const webtoonPath = { path: 'webtoons' };
    const tapasPath = { path: 'tapas' };
    let guildEntry = await GuildModel.findOne(filter)
      .populate(categoryPath)
      .populate(webtoonPath)
      .populate(tapasPath);

    if (!guildEntry) {
      guildEntry = await this.create(guildId);
    }
    return guildEntry;
  }

  static async create(guildId) {
    let guildEntry = new GuildModel({
      id: guildId,
      registeredAt: Date.now(),
    });
    await guildEntry.save();
    return guildEntry;
  }

  // Reaction roles
  static async updateReactions(guildId, enable, channel) {
    let guildEntry = await this.get(guildId);

    if (typeof enable === 'boolean') {
      guildEntry.addons.reactions.enabled = enable;
    }

    if (!!channel?.id) {
      guildEntry.addons.reactions.channel = channel.id;
    }

    guildEntry.markModified('addons.reactions');

    await guildEntry.save();
    return guildEntry;
  }

  static async addCategory(guildId, category) {
    let guildEntry = await this.get(guildId);
    guildEntry.categories.push(category);
    await guildEntry.save();
    return guildEntry;
  }

  static async deleteCategory(guildId, category) {
    let guildEntry = await this.get(guildId);

    const itemToRemoveIndex = guildEntry.categories.findIndex(function (item) {
      return item._id.toString() === category._id.toString();
    });

    // proceed to remove an item only if it exists.
    if (itemToRemoveIndex !== -1) {
      guildEntry.categories.splice(itemToRemoveIndex, 1);
    }

    await guildEntry.save();
    return guildEntry;
  }

  // Tapas
  static async updateTapas(guildId, enable, channel) {
    let guildEntry = await this.get(guildId);

    if (!guildEntry.addons.tapas) {
      guildEntry.addons.tapas = {
        enabled: false,
        channel: '',
      };
    }

    if (typeof enable === 'boolean') {
      guildEntry.addons.tapas.enabled = enable;
    }

    if (!!channel?.id) {
      guildEntry.addons.tapas.channel = channel.id;
    }

    guildEntry.markModified('addons.tapas');

    await guildEntry.save();
    return guildEntry;
  }

  static async addTapas(guildId, tapas) {
    let guildEntry = await this.get(guildId);
    guildEntry.tapas.push(tapas);
    await guildEntry.save();
    return guildEntry;
  }

  static async deleteTapas(guildId, tapas) {
    let guildEntry = await this.get(guildId);

    const itemToRemoveIndex = guildEntry.tapas.findIndex(function (item) {
      return item._id.toString() === tapas._id.toString();
    });

    // proceed to remove an item only if it exists.
    if (itemToRemoveIndex !== -1) {
      guildEntry.tapas.splice(itemToRemoveIndex, 1);
    }

    await guildEntry.save();
    return guildEntry;
  }

  static async listTapas() {
    const tapasFilter = { 'addons.tapas.enabled': true };
    const tapasPath = { path: 'tapas' };
    return GuildModel.find(tapasFilter).populate(tapasPath);
  }

  // Webtoons
  static async updateWebtoons(guildId, enable, channel) {
    let guildEntry = await this.get(guildId);

    if (!guildEntry.addons.webtoons) {
      guildEntry.addons.webtoons = {
        enabled: false,
        channel: '',
      };
    }

    if (typeof enable === 'boolean') {
      guildEntry.addons.webtoons.enabled = enable;
    }

    if (!!channel?.id) {
      guildEntry.addons.webtoons.channel = channel.id;
    }

    guildEntry.markModified('addons.webtoons');

    await guildEntry.save();
    return guildEntry;
  }

  static async addWebtoon(guildId, webtoon) {
    let guildEntry = await this.get(guildId);
    guildEntry.webtoons.push(webtoon);
    await guildEntry.save();
    return guildEntry;
  }

  static async deleteWebtoon(guildId, webtoon) {
    let guildEntry = await this.get(guildId);

    const itemToRemoveIndex = guildEntry.webtoons.findIndex(function (item) {
      return item._id.toString() === webtoon._id.toString();
    });

    // proceed to remove an item only if it exists.
    if (itemToRemoveIndex !== -1) {
      guildEntry.webtoons.splice(itemToRemoveIndex, 1);
    }

    await guildEntry.save();
    return guildEntry;
  }

  static async listWebtoons() {
    const webtoonFilter = { 'addons.webtoons.enabled': true };
    const webtoonPath = { path: 'webtoons' };
    return GuildModel.find(webtoonFilter).populate(webtoonPath);
  }
}
