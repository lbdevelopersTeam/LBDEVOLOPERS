import crypto from 'node:crypto';
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';

export class V3ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
    public readonly retryAfter?: number,
  ) {
    super(message);
  }
}

export const asyncRoute = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => void handler(req, res, next).catch(next);

export const requestContext: RequestHandler = (req, res, next) => {
  const incoming = req.get('x-request-id');
  const requestId = incoming && /^[A-Za-z0-9_.:-]{1,100}$/.test(incoming) ? incoming : crypto.randomUUID();
  const startedAt = performance.now();
  res.locals.requestId = requestId;
  res.set('X-Request-Id', requestId);
  res.on('finish', () => {
    if (process.env.API_ACCESS_LOG !== 'true') return;
    process.stdout.write(`${JSON.stringify({
      level: 'info', event: 'api_v3_request', requestId, method: req.method,
      path: req.originalUrl.split('?')[0], status: res.statusCode,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
    })}\n`);
  });
  next();
};

export function v3ErrorBody(error: V3ApiError, requestId: string) {
  return {
    error: {
      code: error.code,
      message: error.message,
      requestId,
      ...(error.fields ? { fields: error.fields } : {}),
    },
  };
}

export const v3ErrorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const requestId = String(res.locals.requestId || crypto.randomUUID());
  if (error instanceof V3ApiError) {
    if (error.retryAfter) res.set('Retry-After', String(error.retryAfter));
    return res.status(error.status).json(v3ErrorBody(error, requestId));
  }
  if (error instanceof SyntaxError && typeof error === 'object' && error && 'status' in error && error.status === 400) {
    return res.status(400).json(v3ErrorBody(new V3ApiError(400, 'MALFORMED_JSON', 'The JSON request body is malformed.'), requestId));
  }

  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'ER_DUP_ENTRY') return res.status(409).json(v3ErrorBody(new V3ApiError(409, 'CONFLICT', 'A resource with that unique value already exists.'), requestId));
  if (['ER_NO_REFERENCED_ROW', 'ER_NO_REFERENCED_ROW_2', 'ER_ROW_IS_REFERENCED', 'ER_ROW_IS_REFERENCED_2'].includes(code)) {
    return res.status(409).json(v3ErrorBody(new V3ApiError(409, 'RELATION_CONFLICT', 'The requested relationship is invalid or still in use.'), requestId));
  }
  if (['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(code)) {
    return res.status(503).json(v3ErrorBody(new V3ApiError(503, 'DATABASE_BUSY', 'The database is busy. Retry this request safely.', undefined, 1), requestId));
  }

  process.stderr.write(`${JSON.stringify({
    level: 'error', event: 'api_v3_request_failed', requestId,
    message: error instanceof Error ? error.message : String(error),
  })}\n`);
  return res.status(500).json(v3ErrorBody(new V3ApiError(500, 'INTERNAL_ERROR', 'The request could not be completed.'), requestId));
};
