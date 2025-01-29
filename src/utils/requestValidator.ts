import type { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { PublicError } from './error';

export type RequestValidatorOptions<
  TBody extends z.ZodSchema,
  TQuery extends z.ZodSchema,
  TParams extends z.ZodSchema,
> = {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
} & ({ body: TBody } | { query: TQuery } | { params: TParams });

/**
 * A class that validates request objects.
 * It can validate body, query, and path parameters.
 * @class RequestValidator
 * @throws If validation fails on any of the methods, it throws an intance of PublicError.
 *
 * @method validate validate body, query and path parameters at once.
 * @method validateBody validates the request body.
 * @method validatePath validates the path parameters.
 * @method validateQuery validates the query parameters
 */
export class RequestValidator {
  static validate<
    TBody extends z.ZodSchema,
    TQuery extends z.ZodSchema,
    TParams extends z.ZodSchema,
  >(
    request: Request,
    options: RequestValidatorOptions<TBody, TQuery, TParams>
  ): {
    body: z.infer<TBody>;
    query: z.infer<TQuery>;
    params: z.infer<TParams>;
  } {
    const errors: { field: string; error: z.ZodError }[] = [];
    let validatedBody, validatedQuery, validatedParams;

    if (options.body) {
      const parsedBody = options.body.safeParse(request.body);
      if (parsedBody.success) {
        validatedBody = request.body = parsedBody.data;
      } else {
        errors.push({
          field: 'body',
          error: parsedBody.error,
        });
      }
    }

    if (options.query) {
      const parsedQuery = options.query.safeParse(request.query);
      if (parsedQuery.success) {
        validatedQuery = request.query = parsedQuery.data;
      } else {
        errors.push({
          field: 'query',
          error: parsedQuery.error,
        });
      }
    }

    if (options.params) {
      const parsedParams = options.params.safeParse(request.params);
      if (parsedParams.success) {
        validatedParams = request.params = parsedParams.data;
      } else {
        errors.push({
          field: 'params',
          error: parsedParams.error,
        });
      }
    }

    if (errors.length > 0) {
      throw new PublicError(
        StatusCodes.BAD_REQUEST,
        'Request validation failed',
        { errors }
      );
    }

    return {
      body: validatedBody,
      query: validatedQuery,
      params: validatedParams,
    };
  }

  /**
   * Validates a body object against a Zod schema.
   * @param body - The request body object.
   * @param schema - The Zod schema to validate against.
   * @returns The validated and parsed query object.
   * @throws If validation fails, it throws a PublicError.
   */
  static validateBody<T extends z.ZodSchema>(
    body: Request['body'],
    schema: T
  ): z.infer<T> {
    const parsedBody = schema.safeParse(body);

    if (!parsedBody.success) {
      throw new PublicError(StatusCodes.BAD_REQUEST, 'Invalid request body', {
        error: parsedBody.error,
      });
    }

    return parsedBody.data;
  }

  /**
   * Validates a query object against a Zod schema.
   * @param query - The request query object.
   * @param schema - The Zod schema to validate against.
   * @returns The validated and parsed query object.
   * @throws If validation fails, it throws a PublicError.
   */
  static validateQuery<T extends z.ZodSchema>(
    query: Request['query'],
    schema: T
  ): z.infer<T> {
    const parsedQuery = schema.safeParse(query);

    if (!parsedQuery.success) {
      throw new PublicError(StatusCodes.BAD_REQUEST, 'Invalid request query', {
        error: parsedQuery.error,
      });
    }

    return parsedQuery.data;
  }

  /**
   * Validates path parameters against a Zod schema.
   * @param params - The request path parameters object.
   * @param schema - The Zod schema to validate against.
   * @returns The validated and parsed path parameters object.
   * @throws If validation fails, it throws an error.
   */
  static validateParams<T extends z.ZodSchema>(
    params: Request['params'],
    schema: T
  ): z.infer<T> {
    const parsedParams = schema.safeParse(params);

    if (!parsedParams.success) {
      throw new PublicError(
        StatusCodes.BAD_REQUEST,
        'Invalid request path parameters',
        { error: parsedParams.error }
      );
    }

    return parsedParams.data;
  }
}
