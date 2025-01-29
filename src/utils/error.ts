export class PublicError extends Error {
  override message: string;
  statusCode: number;
  data: Record<string, unknown>;

  constructor(
    statusCode: number,
    message: string,
    data: Record<string, unknown> = {}
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'PublicError';
  }
}

export class APIErrors {
  static authenticationError() {
    return new PublicError(401, 'Unauthorized');
  }

  static forbiddenError() {
    return new PublicError(403, 'Forbidden');
  }

  static notFoundError() {
    return new PublicError(404, 'Resource not found');
  }

  static serverError() {
    return new PublicError(500, 'Internal Server Error');
  }
}
