import { buildFilterQuery, getFilterable, validateOptions } from '../../helpers/utils';
import { z } from 'zod';

export function createTimeSeriesSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return z.object({
    date_field: z.string(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    metric_field: z.string().optional(),
    granularity: z.enum(['hour', 'day', 'week', 'month']).optional(),
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
  });
}

export type TimeSeriesAnalyticsDto = z.infer<ReturnType<typeof createTimeSeriesSchema>>;
