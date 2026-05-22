// Custom errors for Enquiries domain

export class EnquiryNotFoundError extends Error {
  constructor(enquiryId: number | string) {
    super(`Enquiry with ID ${enquiryId} not found`);
    this.name = 'EnquiryNotFoundError';
  }
}

export class EnquiryTypeNotFoundError extends Error {
  constructor(typeId: number | string) {
    super(`Enquiry type with ID ${typeId} not found`);
    this.name = 'EnquiryTypeNotFoundError';
  }
}

export class EnquirySourceNotFoundError extends Error {
  constructor(sourceId: number | string) {
    super(`Enquiry source with ID ${sourceId} not found`);
    this.name = 'EnquirySourceNotFoundError';
  }
}

export class InvalidEnquiryStatusError extends Error {
  constructor(status: string) {
    super(`Invalid enquiry status: ${status}`);
    this.name = 'InvalidEnquiryStatusError';
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
