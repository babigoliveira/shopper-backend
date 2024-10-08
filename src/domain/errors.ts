export class MeasureAlreadyValidatedError extends Error {
  constructor() {
    super('Leitura do mês já realizada');
  }
}

export class MeasureNotFoundError extends Error {
  constructor() {
    super('Leitura do mês não encontrada');
  }
}

export class DuplicatedMeasureAttemptError extends Error {
  constructor() {
    super('Leitura do mês já realizada');
  }
}

export class MeasuresNotFoundError extends Error {
  constructor() {
    super('Nenhuma leitura encontrada');
  }
}

export class UnsupportedImageType extends Error {
  constructor(mimeType: string) {
    super(`Unsupported image mime type '${mimeType || 'unknown'}'`);
  }
}
