import { col, FindOptions, fn, Model, Op } from 'sequelize';
import { Fn } from 'sequelize/types/utils';
import { buildWhereClause } from '../dynamic-qb/build-where';
import { TimeSeriesAnalyticsDto } from '../../dtos/analytics/get-time-series.dto';
import { ZodObject } from 'zod';

function getMetric(metricField?: string): [Fn, string] {
  if (metricField) {
    return [fn('SUM', col(metricField)), 'value'];
  } else {
    return [fn('COUNT', col('*')), 'value'];
  }
}

function buildDateWhereClause(startDate: string, endDate: string, field: string) {
  return {
    [field]: {
      [Op.between]: [startDate, endDate],
    },
  };
}

export async function buildTimeSeries<T extends Model>(
  serverOptions: FindOptions<T>,
  clientOptions: TimeSeriesAnalyticsDto,
  schema: ZodObject<any>
) {
  const granularity = clientOptions.granularity || 'day';
  const dateAggregation = fn('DATE_TRUNC', granularity, col(clientOptions.date_field));
  const metric = getMetric(clientOptions.metric_field);

  const where: FindOptions<T>['where'] = buildWhereClause(
    serverOptions.where,
    clientOptions.filter,
    schema
  );

  const dateWhere = buildDateWhereClause(
    clientOptions.start_date,
    clientOptions.end_date,
    clientOptions.date_field
  );

  const findOptions: FindOptions<T> = {
    attributes: [[dateAggregation, 'date'], ...[metric]],
    where: {
      ...(where || {}),
      ...(dateWhere || {}),
    },
    group: [dateAggregation],
    order: [[dateAggregation, 'ASC']],
  };

  return findOptions;
}
