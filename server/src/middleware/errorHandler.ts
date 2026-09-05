import type { Request, Response, NextFunction } from 'express';
import { AppError, formatErrorResponse } from '../utils/errors.js';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || Math.random().toString(36).substring(2, 9);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatErrorResponse(err.code, err.message, err.statusCode, err.details, requestId)
    );
  }

  // Handle Zod or JSON syntax errors
  if (err?.name === 'ZodError') {
    return res.status(422).json(
      formatErrorResponse('VALIDATION_FAILED', 'Invalid input data format', 422, err.issues, requestId)
    );
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json(
      formatErrorResponse('INVALID_JSON', 'Malformed JSON payload in request body', 400, null, requestId)
    );
  }

  // Fallback 500
  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json(
    formatErrorResponse('INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500, null, requestId)
  );
};
