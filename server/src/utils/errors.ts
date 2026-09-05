export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: any;

  constructor(code: string, message: string, statusCode = 400, details: any = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const formatErrorResponse = (
  code: string,
  message: string,
  statusCode: number,
  details: any = null,
  requestId?: string
) => {
  return {
    success: false,
    error: message, // Backward-compatible simple string for legacy callers
    errorDetails: {
      code,
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      requestId: requestId || Math.random().toString(36).substring(2, 9)
    }
  };
};
