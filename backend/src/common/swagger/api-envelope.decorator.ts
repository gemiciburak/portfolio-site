import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger'da yanıtları gerçek zarf yapısıyla gösterir. Dokümantasyon ile
 * çalışma zamanı davranışı ayrışmasın diye interceptor'ın ürettiği şeklin aynısı.
 */
export function ApiEnvelopeResponse<TModel extends Type<unknown>>(
  model: TModel,
  options: { isArray?: boolean; paginated?: boolean; description?: string } = {},
) {
  const { isArray = false, paginated = false, description } = options;

  const dataSchema = isArray
    ? { type: 'array' as const, items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OK' },
          data: dataSchema,
          ...(paginated
            ? {
                meta: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                    totalItems: { type: 'integer', example: 42 },
                    totalPages: { type: 'integer', example: 3 },
                  },
                },
              }
            : {}),
        },
      },
    }),
  );
}
