export const AppModes = {
  dev: 'dev',
  generateDocs: 'generateDocs',
  global: 'global',
  guild: 'guild',
  purgeCommands: 'purgeCommands',
  purgeGlobalCommands: 'purgeGlobalCommands',
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
  docsFolder: 'docs',
};

export const DefaultRestOptions = { version: '9' };

export const NickBots = ['970253083718344704', '969889333156937740'];

export const NickEmoji = ['❤️', '💓', '❤️‍🔥', '♥️', '💞', '💕'];

export const DevBots = ['970254018268004403', '970253083718344704'];

export const DevEmoji = '975854179073556500';

export const ProdEmoji = '975854074836701204';
