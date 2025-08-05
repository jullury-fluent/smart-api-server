import {
  dotToNestedObject,
  getFilterable,
  getSortable,
  Order,
  validateOptions,
} from '@jullury-fluent/smart-api-common';
import { buildSortPath } from 'src/helpers';
import { z } from 'zod';

export function createQueryOptionsSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return z.object({
    page: z
      .string()
      .default('1')
      .transform(v => parseInt(v, 10) || 0),
    limit: z
      .string()
      .default('10')
      .transform(v => parseInt(v, 10) || 10),
    skip: z
      .string()
      .transform(v => parseInt(v, 10) || 0)
      .optional(),
    filter: z
      .string()
      .optional()
      .transform(v => {
        if (!v) return {};

        const filter = JSON.parse(v);
        const [_, err] = validateOptions(filter, getFilterable(schema));
        if (err) throw new Error(`Invalid filter key: ${err}`);
        return filter;
      }),
    order_type: z.enum([Order.ASC, Order.DESC]).optional(),
    order_by: z
      .string()
      .optional()
      .transform(v => {
        if (!v) return undefined;

        const clientSortObj = dotToNestedObject(v, true);
        const [_, err] = validateOptions(clientSortObj, getSortable(schema));

        if (err) throw new Error(`Invalid order_by key: ${v}`);

        const sortPath = buildSortPath(schema, clientSortObj);

        return sortPath;
      }),
    search: z.string().optional(),
  });
}

export type QueryOptionsDto = z.infer<ReturnType<typeof createQueryOptionsSchema>>;
