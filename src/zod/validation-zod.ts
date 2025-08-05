import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

interface ZodValidationPipeOptions {
  transform?: boolean;
}
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema,
    private options: ZodValidationPipeOptions = {}
  ) {}

  transform(value: any) {
    try {
      const result = this.schema.safeParse(value);
      if (!result.success) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: result.error.errors,
        });
      }
      return this.options.transform ? result.data : value;
    } catch (error) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error.message,
      });
    }
  }
}
