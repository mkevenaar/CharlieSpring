import { clearDatabase, closeDatabase, connect } from '../db-handler.js';
import { ReactionService } from '../../src/database/reaction.service.js';
import { ReactionRoleService } from '../../src/database/reaction.role.service.js';
import { GuildService } from '../../src/database/guild.service.js';
import { ReactionCategoryModel } from '../../src/database/models/reaction.category.js';
import { WebtoonsModel } from '../../src/database/models/webtoons.js';
import { TapasModel } from '../../src/database/models/tapas.js';
import mongoose from 'mongoose';

let reactionService;
let guildService;

const mockCategory = {
  _id: new mongoose.Types.ObjectId(),
  guildId: '123',
  name: 'My Category',
  registeredAt: Date.now(),
};

beforeAll(async () => {
  await connect();
  reactionService = ReactionService;
  guildService = GuildService;
});
afterEach(async () => {
  await clearDatabase();
});
afterAll(async () => {
  await closeDatabase();
});

describe('GuildService', function () {
  it('Must be able to fetch a guild', async function () {
    const guild = await guildService.get('234');
    expect(guild).toBeTruthy();
  });
  it('Must be able to configure reaction roles', async function () {
    const guild = await guildService.updateReactions('123', true, { id: '1234567890' });
    expect(guild).toBeTruthy();
    expect(guild.addons.reactions.enabled).toBeTruthy();
    expect(guild.addons.reactions.channel).toBe('1234567890');
  });
  it('Must be able to disable reaction roles', async function () {
    const guild = await guildService.updateReactions('123', false, null);
    expect(guild).toBeTruthy();
    expect(guild.addons.reactions.enabled).toBeFalsy();
  });
  it('Must be able to change the channel', async function () {
    const guild = await guildService.updateReactions('123', null, { id: '535378453784' });
    expect(guild).toBeTruthy();
    expect(guild.addons.reactions.channel).toBe('535378453784');
  });
  it('Must be able to add a category', async function () {
    const guild = await guildService.addCategory('123', mockCategory);
    expect(guild).toBeTruthy();
  });
  it('Must be able to delete a category', async function () {
    const guild = await guildService.addCategory('123', mockCategory);
    expect(guild).toBeTruthy();
    const guild2 = await guildService.deleteCategory('123', mockCategory);
    expect(guild2).toBeTruthy();
  });
});
