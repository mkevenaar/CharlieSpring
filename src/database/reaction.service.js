import { ReactionCategoryModel } from './models/reaction.category.js';
import { GuildService } from './guild.service.js';
import { AlreadyExistException, NotFoundException } from '../exceptions/runtime.exceptions.js';
import { GuildModel } from './models/guild.js';

export class ReactionService {
  static async list(guildId) {
    const guildFilter = { guildId: guildId };
    return ReactionCategoryModel.find(guildFilter);
  }

  static async get(guildId, categoryName) {
    const filter = { guildId: guildId, name: categoryName };
    const rolePath = { path: 'roles' };
    const categoryEntry = await ReactionCategoryModel.findOne(filter).populate(rolePath);

    if (!categoryEntry) {
      throw new NotFoundException('Category with that name not found');
    }

    return categoryEntry;
  }

  static async delete(guildId, categoryName) {
    const filter = { guildId: guildId, name: categoryName };
    let categoryEntry = await this.get(guildId, categoryName);

    await GuildService.deleteCategory(guildId, categoryEntry);
    return ReactionCategoryModel.findOneAndDelete(filter);
  }

  static async create(guildId, categoryName, description = '') {
    let existingCategory;

    try {
      existingCategory = await this.get(guildId, categoryName);
    } catch (error) {
      if (!error instanceof NotFoundException) {
        throw error;
      }
    }

    if (existingCategory) {
      throw new AlreadyExistException('Category name already exists');
    }

    let categoryEntry = new ReactionCategoryModel({
      guildId: guildId,
      name: categoryName,
      registeredAt: Date.now(),
    });

    if (!!description?.length) {
      categoryEntry.description = description;
    }

    await categoryEntry.save();
    await GuildService.addCategory(guildId, categoryEntry);
    return categoryEntry;
  }

  static async updateMessageId(guildId, categoryName, messageId) {
    let categoryEntry = await this.get(guildId, categoryName);

    categoryEntry.messageId = messageId;

    await categoryEntry.save();
    return categoryEntry;
  }

  static async updateDescription(guildId, categoryName, description) {
    let categoryEntry = await this.get(guildId, categoryName);
    if (!!description?.length) {
      categoryEntry.description = description;
    }

    await categoryEntry.save();
    return categoryEntry;
  }

  static async updateName(guildId, categoryName, newName) {
    let categoryEntry = await this.get(guildId, categoryName);
    if (!!newName?.length) {
      categoryEntry.name = newName;
    }

    await categoryEntry.save();
    return categoryEntry;
  }

  static async getRole(guildId, messageId, emoji) {
    const filter = { guildId: guildId, messageId: messageId };
    const rolePath = { path: 'roles', match: { emoji: emoji } };
    const categoryEntry = await ReactionCategoryModel.findOne(filter).populate(rolePath);

    if (!categoryEntry) {
      throw new NotFoundException('Message not found in database, unable to fetch role');
    }

    return categoryEntry;
  }

  static async addRole(guildId, categoryName, role) {
    let categoryEntry = await this.get(guildId, categoryName);
    categoryEntry.roles.push(role);
    await categoryEntry.save();
    return categoryEntry;
  }

  static async deleteRole(guildId, categoryName, role) {
    let categoryEntry = await this.get(guildId, categoryName);

    const itemToRemoveIndex = categoryEntry.roles.findIndex(function (item) {
      return item._id.toString() === role._id.toString();
    });

    // proceed to remove an item only if it exists.
    if (itemToRemoveIndex !== -1) {
      categoryEntry.roles.splice(itemToRemoveIndex, 1);
    }

    await categoryEntry.save();
    return categoryEntry;
  }
}
