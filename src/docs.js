import { findCommandFiles } from './shared.js';
import { Constants } from './constants.js';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';

const OptionNames = {
  1: `Sub Command`,
  2: `Sub Command Group`,
  3: `String (Any text)`,
  4: `Integer (Any integer between -2^53 and 2^53)`,
  5: `Boolean (True / False)`,
  6: `User (Discord user)`,
  7: `Channel (Any guild channel and/or category)`,
  8: `Role (Any guild category)`,
  9: `Mentionable (includes users and roles)`,
  10: `Number (Any double between -2^53 and 2^53)`,
  11: `Attachment (Any attachment object)`,
};

export async function generateDocs() {
  let docs = await findCommandFiles(true);

  docs.forEach(async (command) => {
    let group = command.group;
    let dir = pathJoin(Constants.docsFolder, group);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    let filename = command.name;
    command.options.forEach(async (option) => {
      // 1 = Sub Command = 2= Sub Command Group
      if (option.type === 1) {
        let subCommandFilename = filename + '_' + option.name + '.md';
        // process here!
        await generateFile(option, dir, subCommandFilename);
      } else if (option.type === 2) {
        let subCommandGroupFilename = filename + '_' + option.name;
        option.options.forEach(async (subCommand) => {
          let subCommandFilename = subCommandGroupFilename + '_' + subCommand.name + '.md';
          await generateFile(option, dir, subCommandFilename);
        });
        subCommandGroupFilename += '.md';
        await generateFile(option, dir, subCommandGroupFilename);
      }
    });
    filename += '.md';
    await generateFile(command, dir, filename);
  });
}

export async function generateFile(command, folder, filename) {
  let filePath = pathJoin(folder, filename);
  let data = [];
  data.push('# ' + command.name);
  data.push('');
  data.push(command.description);
  data.push('');
  if (command.options.length) {
    data.push('## Options');
    data.push('');
    data.push('|Parameter|Type|Description|Required|');
    data.push('|-|-|-|-|');
  }
  command.options.forEach((option) => {
    data.push(
      `|/${option.name}|${OptionNames[option.type]}|${option.description}|${option.required}|`
    );
  });
  data.push('');
  console.log(filePath);

  try {
    await writeFile(filePath, data.join('\n'));
  } catch (error) {
    console.error(error);
  }
}
