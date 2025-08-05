import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { z, ZodSchema, ZodTypeDef } from 'zod';

class MetadataExtractor {
  public static extractSwaggerSchema(schema: z.ZodObject<any>): Record<string, any> {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(schema.shape)) {
      const propertyMetadata = this.processZodType(value as z.ZodTypeAny);
      if (!(value instanceof z.ZodEffects) && !(value instanceof z.ZodOptional)) {
        required.push(key); // Mark as required if not optional
      }
      properties[key] = propertyMetadata;
    }
    return {
      type: 'object',
      properties,
      required,
    };
  }

  public static processZodType(value: z.ZodTypeAny): Record<string, any> {
    if (value instanceof z.ZodEffects) {
      return this.processZodType(value._def.schema);
    }
    if (value instanceof z.ZodString) {
      return { type: 'string' };
    }
    if (value instanceof z.ZodNumber) {
      return { type: 'number' };
    }
    if (value instanceof z.ZodBoolean) {
      return { type: 'boolean' };
    }
    if (value instanceof z.ZodEnum) {
      return { type: 'string', enum: value._def.values };
    }
    if (value instanceof z.ZodLiteral) {
      return { type: typeof value._def.value, enum: [value._def.value] };
    }
    if (value instanceof z.ZodArray) {
      return { type: 'array', items: this.processZodType(value._def.type) };
    }
    if (value instanceof z.ZodTuple) {
      return {
        type: 'array',
        items: value._def.items?.map(item => this.processZodType(item)),
      };
    }
    if (value instanceof z.ZodObject) {
      return this.extractSwaggerSchema(value);
    }
    if (value instanceof z.ZodUnion) {
      return {
        oneOf: value._def.options?.map(option => this.processZodType(option)),
      };
    }
    if (value instanceof z.ZodIntersection) {
      return {
        allOf: [this.processZodType(value._def.left), this.processZodType(value._def.right)],
      };
    }
    if (value instanceof z.ZodDefault) {
      return {
        ...this.processZodType(value._def.innerType),
        default: value._def.defaultValue(),
      };
    }
    if (value instanceof z.ZodNullable) {
      return {
        ...this.processZodType(value._def.innerType),
        nullable: true,
      };
    }
    if (value instanceof z.ZodOptional) {
      return {
        ...this.processZodType(value._def.innerType),
        nullable: true,
      };
    }
    return { type: 'object' }; // Default case
  }
}

export interface ZodDto<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput> {
  new (): TOutput;
  isZodDto: true;
  schema: ZodSchema<TOutput, TDef, TInput>;
  create(input: unknown): TOutput;
}

export function createZodDto<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput>(
  schema: ZodSchema<TOutput, TDef, TInput>
) {
  class AugmentedZodDto {
    public static isZodDto = true;
    public static schema = schema;

    public static create(input: unknown) {
      return this.schema.parse(input);
    }
  }

  return AugmentedZodDto as unknown as ZodDto<TOutput, TDef, TInput>;
}

export function isZodDto(metatype: any): metatype is ZodDto<unknown> {
  return metatype?.isZodDto;
}

export function ZodSwaggerDto<
  TOutput = any,
  TDef extends ZodTypeDef = ZodTypeDef,
  TInput = TOutput,
>(schema: ZodSchema<TOutput, TDef, TInput>): ZodDto<TOutput, TDef, TInput> {
  const classDto = createZodDto(schema);

  if (schema instanceof z.ZodUnion) {
    ApiBody({
      schema: {
        oneOf: schema._def.options?.map(option => MetadataExtractor.extractSwaggerSchema(option)),
      },
    });
  }

  if (schema instanceof z.ZodObject) {
    const swaggerSchema = MetadataExtractor.extractSwaggerSchema(schema);

    Object.entries(swaggerSchema.properties).forEach(([key, value]: [string, any]) => {
      const prop = swaggerSchema.properties[key];
      const isNullable = prop.nullable;
      const type = prop.type;
      const isRequired = swaggerSchema.required.includes(key);

      if (prop.oneOf) {
        ApiProperty({
          name: key,
          type: 'array',
          oneOf: prop.oneOf,
          required: isRequired,
          nullable: isNullable,
          default: prop.default,
          description: `The ${key} field is ${isRequired ? 'required' : 'optional'} with oneOf types ${prop.oneOf?.map((t: any) => t.type).join(', ')} ${isNullable ? '(nullable)' : ''}`,
        })(classDto.prototype, key);
      } else {
        ApiProperty({
          name: key,
          type: type as any,
          required: isRequired,
          nullable: isNullable,
          default: prop.default,
          enum: prop.enum,
          description: `The ${key} field is ${
            isRequired ? 'required' : 'optional'
          } with type ${type} ${isNullable ? '(nullable)' : ''}`,
        })(classDto.prototype, key);
      }
    });
  }

  return classDto;
}
