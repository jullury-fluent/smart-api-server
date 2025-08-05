import { MetricType } from '../../helpers/dynamic-analytics/types';
import { buildFilterQuery, getFilterable, validateOptions } from '../../helpers/utils';
import { z } from 'zod';

export function createAggregationSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return z.object({
    metric: z
      .enum(Object.values(MetricType) as [string, ...string[]])
      .default('')
      .optional(),
    metric_field: z.string().optional(),
    filter: z
      .string()
      .optional()
      .transform(v => {
        if (!v) return {};

        const filter = JSON.parse(v);
        const [_, err] = validateOptions(filter, getFilterable(schema));
        if (err) throw new Error(`Invalid filter key: ${err}`);

        const sequelizeFilterQuery = buildFilterQuery(schema, filter);

        return sequelizeFilterQuery;
      }),
    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 10)),
  });
}

export type AggregationAnalyticsDto = z.infer<ReturnType<typeof createAggregationSchema>>;
