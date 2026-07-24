import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

interface ErrorEnvelope {
  success: false;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  errors?: Record<string, string[]>;
}

interface ZodIssueLike {
  path: (string | number)[];
  message: string;
}

/**
 * `getZodError()` `unknown` döner (nestjs-zod v5). Şekli çalışma zamanında
 * daraltılır; beklenmeyen bir yapı gelirse boş alan listesiyle devam edilir.
 */
function toFieldErrors(zodError: unknown): Record<string, string[]> | undefined {
  const issues = (zodError as { issues?: unknown })?.issues;

  if (!Array.isArray(issues)) return undefined;

  const errors: Record<string, string[]> = {};

  for (const issue of issues as ZodIssueLike[]) {
    const key = Array.isArray(issue.path) && issue.path.length ? issue.path.join('.') : '_';
    (errors[key] ??= []).push(issue.message);
  }

  return Object.keys(errors).length ? errors : undefined;
}

/**
 * Başarısız yanıtlar da başarılı olanlarla aynı zarfı kullanır.
 * Beklenmeyen hatalarda istemciye genel mesaj gider — stack trace sızmaz.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, errors } = this.describe(exception);

    // 5xx: bizim hatamız — tam ayrıntısıyla loglanır (istemciye gitmez).
    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorEnvelope = {
      success: false,
      message,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(errors ? { errors } : {}),
    };

    response.status(statusCode).json(body);
  }

  private describe(exception: unknown): {
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
  } {
    if (exception instanceof ZodValidationException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Doğrulama hatası',
        // Alan bazlı hatalar: istemci hangi girdinin neden reddedildiğini görür.
        errors: toFieldErrors(exception.getZodError()),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { statusCode: status, message: payload };
      }

      const record = payload as { message?: string | string[] };
      const message = Array.isArray(record.message)
        ? record.message.join(', ')
        : (record.message ?? exception.message);

      return { statusCode: status, message };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Beklenmeyen bir hata oluştu',
    };
  }
}
