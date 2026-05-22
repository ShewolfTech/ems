export class DecisionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionsError';
  }
}

export class DecisionRecordError extends DecisionsError {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionRecordError';
  }
}

export class EnrollmentError extends DecisionsError {
  constructor(message: string) {
    super(message);
    this.name = 'EnrollmentError';
  }
}
