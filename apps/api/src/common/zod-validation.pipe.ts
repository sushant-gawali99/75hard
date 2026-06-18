import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { type ZodSchema } from 'zod';

/** Validates a request body against a zod schema; 400s with field errors on failure. */
export class ZodBody<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return result.data;
  }
}
