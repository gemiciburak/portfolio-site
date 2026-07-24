import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE = 'responseMessage';

/** Zarftaki `message` alanını belirler. Verilmezse "OK" kullanılır. */
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE, message);
