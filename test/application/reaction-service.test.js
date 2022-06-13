import { clearDatabase, closeDatabase, connect } from '../db-handler.js';
import { ReactionService } from '../../src/database/reaction.service.js';
import { ReactionRoleService } from '../../src/database/reaction.role.service.js';
import { GuildService } from '../../src/database/guild.service.js';
import { WebtoonsModel } from '../../src/database/models/webtoons.js';
import { TapasModel } from '../../src/database/models/tapas.js';

let reactionService;
let guildService;

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

describe('ReactionService', function () {
  it('Must be able to create a category', async function () {
    const guild = await guildService.get('123');
    expect(guild).toBeTruthy();
    const reaction = await reactionService.create('123', 'Test');
    expect(reaction).toBeTruthy();
    const foundReaction = await reactionService.get('123', 'Test');
    expect(foundReaction.name).toEqual('Test');
  });
});
