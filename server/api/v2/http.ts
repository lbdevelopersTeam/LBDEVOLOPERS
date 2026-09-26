import crypto from 'node:crypto';
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => void handler(req, res, next).catch(next);

export const requestContext: RequestHandler = (req, res, next) => {
  const incoming = req.get('x-request-id');
  const requestId = incoming && /^[a-zA-Z0-9_.:-]{1,100}$/.test(incoming) ? incoming : crypto.randomUUID();
  res.locals.requestId = requestId;
  res.set('X-Request-Id', requestId);
  next();
};

export function errorBody(error: ApiError, requestId: string) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      requestId,
      ...(error.fields ? { fields: error.fields } : {}),
    },
  };
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const requestId = String(res.locals.requestId || crypto.randomUUID());
  if (error instanceof ApiError) return res.status(error.status).json(errorBody(error, requestId));

  const errorCode = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (errorCode === 'LIMIT_FILE_SIZE') return res.status(413).json(errorBody(new ApiError(413, 'UPLOAD_SIZE_INVALID', 'The uploaded file exceeds 10 MB.'), requestId));
  if (errorCode === 'LIMIT_UNEXPECTED_FILE') return res.status(422).json(errorBody(new ApiError(422, 'UPLOAD_FIELD_INVALID', 'Upload the image using the multipart field named "file".'), requestId));
  if (['LIMIT_FILE_COUNT', 'LIMIT_FIELD_COUNT', 'LIMIT_FIELD_KEY', 'LIMIT_FIELD_VALUE', 'LIMIT_PART_COUNT'].includes(errorCode)) return res.status(422).json(errorBody(new ApiError(422, 'UPLOAD_FORM_INVALID', 'The upload form contains too many or invalid fields.'), requestId));
  if (error instanceof SyntaxError && typeof error === 'object' && 'status' in error && error.status === 400) return res.status(400).json(errorBody(new ApiError(400, 'MALFORMED_JSON', 'The JSON request body is malformed.'), requestId));

  const pgCode = errorCode;
  if (pgCode === '23505') return res.status(409).json(errorBody(new ApiError(409, 'CONFLICT', 'A record with that unique value already exists.'), requestId));
  if (pgCode === '23503') return res.status(409).json(errorBody(new ApiError(409, 'RELATION_CONFLICT', 'The record is still referenced by another resource.'), requestId));

  process.stderr.write(`${JSON.stringify({ level: 'error', requestId, event: 'request_failed', message: error instanceof Error ? error.message : String(error) })}\n`);
  return res.status(500).json(errorBody(new ApiError(500, 'INTERNAL_ERROR', 'The request could not be completed.'), requestId));
};

export function parsePagination(req: Request, maximum = 100) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(maximum, Number(req.query.limit || 20)));
  if (!Number.isInteger(page) || !Number.isInteger(limit)) throw new ApiError(400, 'INVALID_PAGINATION', 'Page and limit must be integers.');
  return { page, limit, offset: (page - 1) * limit };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return { items, page, limit, total, pageCount: Math.ceil(total / limit) };
}
