export const AppModes = {
  dev: 'dev',
  purgeCommands: 'purgeCommands',
  purgeGlobalCommands: 'purgeGlobalCommands',
  global: 'global',
  guild: 'guild',
};

export const ReactionCommands = {
  add: 'add',
  configure: 'configure',
  delete: 'delete',
  edit: 'edit',
  list: 'list',
  rebuild: 'rebuild',
};

const defaultDatabase = 'CharlieSpring';

export const Constants = {
  defaultMongoString: `mongodb://localhost:27017/${defaultDatabase}`,
  sourceFolder: 'src',
  commandsFolder: 'commands',
  eventsFolder: 'events',
  jsExt: '.js',
};

export const DefaultRestOptions = { version: '9' };
