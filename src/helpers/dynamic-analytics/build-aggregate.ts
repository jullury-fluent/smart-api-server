import { FindOptions, Model } from 'sequelize';
import { buildWhereClause } from '../dynamic-qb/build-where';
import { buildAnalyticTypeClause, buildMetricAttribute } from './utils';

import { AggregationAnalyticsDto } from '../../dtos/analytics/aggregation.dto';
import { AnalyticsType } from './types';
import { ZodObject } from 'zod';

export async function buildAggregate<T extends Model>(
  serverOptions: FindOptions<T>,
  clientOptions: AggregationAnalyticsDto,
  model: { new (): T } & typeof Model,
  schema: ZodObject<any>
) {
  const combinedWhere = buildWhereClause(serverOptions.where, clientOptions.filter, schema);
  const metricAttr = buildMetricAttribute(clientOptions.metric, clientOptions.metric_field);

  const { attributes, order } = buildAnalyticTypeClause(
    model,
    AnalyticsType.AGGREGATION,
    metricAttr,
    [],
    clientOptions,
    serverOptions
  );

  const findOptions: FindOptions<T> = {
    where: combinedWhere,
    include: serverOptions.include,
    order,
    attributes,
  };

  return findOptions;
}
