import { ReactionCategoryModel } from './models/reaction.category.js';
import { ReactionRoleModel } from './models/reaction.role.js';
import { AlreadyExistException, NotFoundException } from '../exceptions/runtime.exceptions.js';
import { ReactionService } from './reaction.service.js';

export class ReactionRoleService {
  static async list(guildId, categoryName) {
    const categoryFilter = { guildId: guildId, name: categoryName };
    const rolePath = { path: 'roles' };
    return ReactionCategoryModel.findOne(categoryFilter).populate(rolePath);
  }

  static async get(guildId, categoryName, roleId) {
    const filter = { id: roleId, guildId: guildId, categoryName: categoryName };
    const roleEntry = await ReactionRoleModel.findOne(filter);

    if (!roleEntry) {
      throw new NotFoundException('Cannot find this role');
    }

    return roleEntry;
  }

  static async delete(guildId, categoryName, role) {
    const filter = { id: role.id, guildId: guildId, categoryName: categoryName };
    let roleEntry = await this.get(guildId, categoryName, role.id);

    await ReactionService.deleteRole(guildId, categoryName, roleEntry);
    return ReactionRoleModel.findOneAndDelete(filter);
  }

  static async create(guildId, categoryName, role, description, emoji) {
    let existingRole;
    let existingCategory = await ReactionService.get(guildId, categoryName);

    try {
      existingRole = await this.get(guildId, categoryName, role.id);
    } catch (error) {
      if ((!error) instanceof NotFoundException) {
        throw error;
      }
    }

    if (existingRole) {
      throw new AlreadyExistException('Role already exists in this category');
    }

    let roleEntry = new ReactionRoleModel({
      id: role.id,
      categoryName: categoryName,
      guildId: guildId,
      emoji: emoji,
      registeredAt: Date.now(),
    });

    if (!!description?.length) {
      roleEntry.description = description;
    }

    await roleEntry.save();
    await ReactionService.addRole(guildId, categoryName, roleEntry);
    return roleEntry;
  }

  static async updateDescription(guildId, categoryName, role, description) {
    let roleEntry = await this.get(guildId, categoryName, role);
    if (!!description?.length) {
      roleEntry.description = description;
    }

    await roleEntry.save();
    return roleEntry;
  }

  static async updateEmoji(guildId, categoryName, role, emoji) {
    let roleEntry = await this.get(guildId, categoryName, role);
    if (!!emoji?.length) {
      roleEntry.emoji = emoji;
    }

    await roleEntry.save();
    return roleEntry;
  }
}
