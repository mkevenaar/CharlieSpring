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
  selectMenuFolder: 'selectmenu',
  eventsFolder: 'events',
  jsExt: '.js',
  docsFolder: 'docs',
};

export const DefaultRestOptions = { version: '10' };

export const NickBots = ['970253083718344704', '969889333156937740'];

export const NickEmoji = ['❤️', '💓', '❤️‍🔥', '♥️', '💞', '💕'];

export const DevBots = ['970254018268004403', '970253083718344704'];

export const DevEmoji = '975854179073556500';

export const ProdEmoji = '975854074836701204';

export const BotColors = {
  default: '#2d4d58',
  failed: '#e01e01',
};

export const HelpUrls = {
  supportServer: 'https://nickandcharliebots.net/support/',
  gitHubUrl: 'https://github.com/mkevenaar/CharlieSpring/issues',
  websiteUrl: 'https://nickandcharliebots.net/charlie-spring/',
  inviteUrl: 'https://nickandcharliebots.net/charlie/',
};
