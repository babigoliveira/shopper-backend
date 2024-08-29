export class MeasureAlreadyValidatedError extends Error {
  constructor(measureUuid: string) {
    super(`Leitura do mês já realizada ${measureUuid}`);
  }
}

export class MeasureNotFoundError extends Error {
  constructor(measureUuid: string) {
    super(`Leitura do mês não encontrada ${measureUuid}`);
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
