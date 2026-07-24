import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';
import { PaginatedResult, type PaginationMeta } from '../dto/paginated';

export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Her başarılı yanıtı tek bir zarfa sarar. Controller'lar düz DTO döner;
 * hiçbir endpoint sözleşmeden sapamaz çünkü sapma noktası yok.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>> {
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'OK';

    return next.handle().pipe(
      map((payload) => {
        if (payload instanceof PaginatedResult) {
          return {
            success: true as const,
            message,
            data: payload.items as T,
            meta: payload.meta,
          };
        }

        return { success: true as const, message, data: payload };
      }),
    );
  }
}
