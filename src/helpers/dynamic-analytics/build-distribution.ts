import { Model, FindOptions } from 'sequelize';
import { buildWhereClause } from '../dynamic-qb/build-where';
import { addGroupBy, addLimit, buildAnalyticTypeClause, buildMetricAttribute } from './utils';
import { DistributionAnalyticsDto } from '../../dtos/analytics/distribution.dto';
import { AnalyticsType } from './types';
import { ZodObject } from 'zod';

export async function buildDistribution<T extends Model>(
  serverOptions: FindOptions<T>,
  clientOptions: DistributionAnalyticsDto,
  model: { new (): T } & typeof Model,
  schema: ZodObject<any>
) {
  const groupByFields = addGroupBy(clientOptions.group_by);
  const combinedWhere = buildWhereClause(serverOptions.where, clientOptions.filter, schema);
  const metricAttr = buildMetricAttribute(clientOptions.metric, clientOptions.metric_field);

  const { attributes, order } = buildAnalyticTypeClause(
    model,
    AnalyticsType.DISTRIBUTION,
    metricAttr,
    groupByFields,
    clientOptions,
    serverOptions
  );

  const findOptions: FindOptions<T> = {
    where: combinedWhere,
    include: serverOptions.include,
    limit: addLimit(clientOptions.metric, clientOptions.limit),
    order,
    group: groupByFields,
    attributes,
  };

  return findOptions;
}
