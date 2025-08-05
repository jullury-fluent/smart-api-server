import { AggregationAnalyticsDto } from '../../dtos/analytics/aggregation.dto';
import { DistributionAnalyticsDto } from '../../dtos/analytics/distribution.dto';
import { col, FindOptions, fn, literal, Model } from 'sequelize';
import { Fn } from 'sequelize/types/utils';
import { AnalyticsType, CyclesType, ForecastMethodType } from './types';

export interface TimeSeriesEntry {
  date: Date | string;
  value: number;
}

export function applyMovingAverage(
  data: { date: Date; value: number }[],
  period: number,
  cycles: string,
  windowSize = 3
) {
  const result = [];
  const values = data.map(d => d.value);

  for (let i = 0; i < period; i++) {
    const startIdx = Math.max(0, values.length - windowSize + i);
    const subset = values.slice(startIdx, values.length);
    const avg = subset.reduce((sum, v) => sum + v, 0) / subset.length;

    const cycleDurations = {
      [CyclesType.YEARLY]: 365 * 24 * 60 * 60 * 1000,
      [CyclesType.MONTHLY]: 30 * 24 * 60 * 60 * 1000,
      [CyclesType.WEEKLY]: 7 * 24 * 60 * 60 * 1000,
      [CyclesType.DAILY]: 24 * 60 * 60 * 1000,
      [CyclesType.QUARTERLY]: 90 * 24 * 60 * 60 * 1000,
    };

    const duration = cycleDurations[cycles] || cycleDurations[CyclesType.YEARLY];

    result.push({
      date: new Date(data[data.length - 1].date.getTime() + (i + 1) * duration),
      value: avg,
    });
  }

  return result;
}

export function applyHoltLinearSmoothing(
  data: { date: Date; value: number }[],
  period: number,
  cycles: string,
  alpha = 0.5,
  beta = 0.5
) {
  if (data.length === 0) return [];

  const cycleDurations = {
    [CyclesType.YEARLY]: 365 * 24 * 60 * 60 * 1000,
    [CyclesType.MONTHLY]: 30 * 24 * 60 * 60 * 1000,
    [CyclesType.WEEKLY]: 7 * 24 * 60 * 60 * 1000,
    [CyclesType.DAILY]: 24 * 60 * 60 * 1000,
    [CyclesType.QUARTERLY]: 90 * 24 * 60 * 60 * 1000,
  };

  const duration = cycleDurations[cycles] || cycleDurations[CyclesType.YEARLY];

  let level = data[0].value;
  let trend = data[1] ? data[1].value - data[0].value : 0;

  for (let i = 1; i < data.length; i++) {
    const value = data[i].value;
    const prevLevel = level;
    level = alpha * value + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const lastDate = new Date(data[data.length - 1].date);
  const result = [];

  for (let i = 1; i <= period; i++) {
    result.push({
      date: new Date(lastDate.getTime() + i * duration),
      value: level + i * trend,
    });
  }

  return result;
}

export function getForecastData(
  method: ForecastMethodType,
  actualData: any[],
  forecastPeriod: number,
  cycles: string
): any[] {
  switch (method) {
    case ForecastMethodType.MOVING_AVERAGE:
      return applyMovingAverage(actualData, forecastPeriod, cycles);

    case ForecastMethodType.EXPONENTIAL_SMOOTHING:
      return applyHoltLinearSmoothing(actualData, forecastPeriod, cycles);

    default:
      throw new Error('Invalid forecasting method');
  }
}

export function isSamePeriod(
  d1: Date,
  d2: Date,
  granularity: 'hour' | 'day' | 'week' | 'month'
): boolean {
  if (granularity === 'hour') {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate() &&
      d1.getHours() === d2.getHours()
    );
  }
  if (granularity === 'day') {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
  if (granularity === 'week') {
    const getWeek = (date: Date) => {
      const tempDate = new Date(date.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        )
      );
    };
    return d1.getFullYear() === d2.getFullYear() && getWeek(d1) === getWeek(d2);
  }
  if (granularity === 'month') {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  }
  return false;
}

export function fillMissingDates(
  rawData: any[],
  startDate?: string,
  endDate?: string,
  granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
): TimeSeriesEntry[] {
  if (!startDate || !endDate) return rawData;

  const data = rawData.map(item => ({
    date: new Date(item.dataValues?.date || item.date),
    value: Number(item.dataValues?.value ?? item.value ?? 0),
  }));

  const filledData: TimeSeriesEntry[] = [];

  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  const timeStep = {
    hour: 3600000,
    day: 86400000,
    week: 604800000,
    month: (date: Date) =>
      new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime() - date.getTime(),
  };

  const getNextDate = (date: Date): Date => {
    const increment =
      typeof timeStep[granularity] === 'function'
        ? timeStep[granularity](date)
        : timeStep[granularity];
    return new Date(date.getTime() + increment);
  };

  let index = 0;
  while (currentDate <= lastDate) {
    const current = new Date(currentDate);
    const dataDate = data[index]?.date;

    if (dataDate && isSamePeriod(dataDate, current, granularity)) {
      filledData.push({
        date: current.toISOString(),
        value: data[index].value,
      });
      index++;
    } else {
      filledData.push({
        date: current.toISOString(),
        value: 0,
      });
    }

    currentDate = getNextDate(currentDate);
  }

  return filledData;
}

export function addGroupBy(groupBy?: string | string[]): string[] {
  if (!groupBy) return [];
  return Array.isArray(groupBy) ? groupBy : [groupBy];
}

export function buildMetricAttribute(metric: string, metricField: string) {
  return [fn(metric.toUpperCase(), col(metricField)), `${metric}__${metricField}`] as const;
}

export function addLimit(metric: string, limit: number) {
  if (metric === 'max' || metric === 'min' || metric === 'avg') {
    return 1;
  } else {
    return limit;
  }
}

export function buildOrderClause<T extends Model>(
  metric: string,
  metricField: string,
  model: { new (): T } & typeof Model,
  serverOrder?: FindOptions<T>['order']
): FindOptions<T>['order'] {
  let clientOrder: FindOptions<T>['order'];

  switch (metric) {
    case 'max':
      clientOrder = [[fn('MAX', col(metricField)), 'DESC']];
      break;
    case 'min':
      clientOrder = [[fn('MIN', col(metricField)), 'ASC']];
      break;
    case 'avg':
      clientOrder = [
        [
          literal(
            `ABS(${metricField} - (SELECT AVG(${metricField}) FROM "${model.getTableName()}"))`
          ),
          'ASC',
        ],
      ];
      break;
    case 'sum':
      clientOrder = [[fn('SUM', col(metricField)), 'DESC']];
      break;
    default:
      clientOrder = [[metricField, 'DESC']];
  }

  return [...(Array.isArray(serverOrder) ? serverOrder : []), ...clientOrder];
}

export function buildAnalyticTypeClause<T extends Model>(
  model: { new (): T } & typeof Model,
  analyticsType: AnalyticsType,
  metricAttribute: readonly [Fn, string],
  groupByFields: string[] = [],
  clientOptions: AggregationAnalyticsDto | DistributionAnalyticsDto,
  serverOptions: FindOptions<T>
) {
  const attributes: FindOptions<T>['attributes'] = [];
  let order: FindOptions<T>['order'] = [];

  if (analyticsType === AnalyticsType.AGGREGATION) {
    attributes.push(metricAttribute);
  } else {
    attributes.push(...groupByFields, metricAttribute);
    order = buildOrderClause(
      clientOptions.metric,
      clientOptions.metric_field,
      model,
      serverOptions.order
    );
  }

  return { attributes, order };
}
