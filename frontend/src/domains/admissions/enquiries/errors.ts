// Custom errors for Enquiries domain

export class EnquiryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnquiryError';
  }
}

export class EnquiryNotFoundError extends Error {
  constructor(id?: number) {
    super(id ? `Enquiry with ID ${id} not found` : 'Enquiry not found');
    this.name = 'EnquiryNotFoundError';
  }
}

export class EnquiryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnquiryValidationError';
  }
}

export class EnquiryAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnquiryAssignmentError';
  }
}

export class EnquiryConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnquiryConversionError';
  }
}
