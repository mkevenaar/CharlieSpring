export async function resolveChannel(search, guild) {
  let channel = null;
  if (!search || typeof search !== 'string') return;
  //Try to search using ID
  if (search.match(/^#&!?(\d+)$/)) {
    let id = search.match(/^#&!?(\d+)$/)[1];
    channel = guild.channels.cache.get(id);
    if (channel) return channel;
  }

  if (search.includes('<#')) {
    let firstChannel = search.replace('<#/g', '');
    let channelID = firstChannel.replace('>/g', '');
    let channel = guild.channels.cache.get(channelID);
    if (channel) return channel;
  }

  channel = guild.channels.cache.find((c) => search.toLowerCase() === c.name.toLowerCase());
  if (channel) return channel;

  channel = guild.channels.cache.get(search);
  return channel;
}

export async function convertTime(milliseconds) {
  let roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
  let days = roundTowardsZero(milliseconds / 86400000),
    hours = roundTowardsZero(milliseconds / 3600000) % 24,
    mins = roundTowardsZero(milliseconds / 60000) % 60,
    secs = roundTowardsZero(milliseconds / 1000) % 60;
  if (secs === 0) {
    secs++;
  }
  let laDays = days > 0,
    laHours = hours > 0,
    laMinutes = mins > 0;
  let pattern =
    (!laDays ? '' : laMinutes || laHours ? '{days} days, ' : '{days} days & ') +
    (!laHours ? '' : laMinutes ? '{hours} hours, ' : '{hours} hours & ') +
    (!laMinutes ? '' : '{mins} mins') +
    ' {secs} seconds';
  let sentence = pattern
    .replace('{duration}', pattern)
    .replace('{days}', days)
    .replace('{hours}', hours)
    .replace('{mins}', mins)
    .replace('{secs}', secs);
  return sentence;
}

export function isURL(str) {
  var urlRegex =
    '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
}

export function isHexColor(str) {
  if (str[0] != '#') {
    return false;
  }

  if (!(str.length == 4 || str.length == 7)) {
    return false;
  }

  var colorRegex = '^#([0-9a-f]{3}){1,2}$';
  var color = new RegExp(colorRegex, 'i');
  return color.test(str);
}
