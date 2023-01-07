import { convert } from 'html-to-text';
import Parser from 'rss-parser';

export class BaseRssService {
  constructor(client) {
    this.client = client;

    this.RSSParser = new Parser();

    this.load();
  }

  async convertHtml(text) {
    text = text
      .replace(/\*/gi, '')
      .replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, '**$2**') // Bolded markdown
      .replace(/<(em|i)>(.*?)<(\/(em|i))>/gi, '*$2*') // Italicized markdown
      .replace(/<(u)>(.*?)<(\/(u))>/gi, '__$2__'); // Underlined markdown

    return convert(text, {
      wordwrap: null,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        // { selector: 'img', options: { linkBrackets: [' ', ' '] } },
        { selector: 'img', format: 'skip' },
      ],
    });
  }
}
