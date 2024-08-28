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
