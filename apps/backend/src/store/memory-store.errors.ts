export class ItemAlreadyExistsError extends Error {
  constructor(public readonly id: number) {
    super(`Item with id ${id} already exists`);

    this.name = 'ItemAlreadyExistsError';
  }
}

export class ItemNotFoundError extends Error {
  constructor(public readonly id: number) {
    super(`Item with id ${id} does not exist`);

    this.name = 'ItemNotFoundError';
  }
}

export class ItemAlreadySelectedError extends Error {
  constructor(public readonly id: number) {
    super(`Item with id ${id} is already selected`);

    this.name = 'ItemAlreadySelectedError';
  }
}

export class ItemNotSelectedError extends Error {
  constructor(public readonly id: number) {
    super(`Item with id ${id} is not selected`);

    this.name = 'ItemNotSelectedError';
  }
}

export class InvalidReorderError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'InvalidReorderError';
  }
}