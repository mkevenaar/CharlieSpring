export class AlreadyExistException extends Error {
  constructor(message, path) {
    super(message);
    this.name = AlreadyExistException.name;
    this.path = path;
  }
}

export class CommandNotFoundException extends Error {
  constructor(message, path) {
    super(message);
    this.name = CommandNotFoundException.name;
    this.path = path;
  }
}

export class EmojiDoesNotExistException extends Error {
  constructor(message, path) {
    super(message);
    this.name = EmojiDoesNotExistException.name;
    this.path = path;
  }
}

export class InvalidColorException extends Error {
  constructor(message, path) {
    super(message);
    this.name = InvalidColorException.name;
    this.path = path;
  }
}

export class InvalidPermissionException extends Error {
  constructor(message, path) {
    super(message);
    this.name = InvalidPermissionException.name;
    this.path = path;
  }
}

export class InvalidUrlException extends Error {
  constructor(message, path) {
    super(message);
    this.name = InvalidUrlException.name;
    this.path = path;
  }
}

export class NotFoundException extends Error {
  constructor(message, path) {
    super(message);
    this.name = NotFoundException.name;
    this.path = path;
  }
}

export class RSSParseError extends Error {
  constructor(message, path) {
    super(message);
    this.name = RSSParseError.name;
    this.path = path;
  }
}
