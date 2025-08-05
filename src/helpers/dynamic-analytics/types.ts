export enum AnalyticsType {
  AGGREGATION = 'AGGREGATION',
  LEADERBOARD = 'LEADERBOARD',
  TIME_SERIES = 'TIME_SERIES',
  DISTRIBUTION = 'DISTRIBUTION',
  FORECAST = 'FORECAST',
}

export enum ChartType {
  DISTRIBUTION = 'DISTRIBUTION',
  SINGLE_VALUE = 'SINGLE_VALUE',
  TIME_BASED = 'TIME_BASED',
  PERCENTAGE = 'PERCENTAGE',
  OBJECTIVE = 'OBJECTIVE',
  LEADERBOARD = 'LEADERBOARD',
}

export enum ForecastMethodType {
  MOVING_AVERAGE = 'MOVING_AVERAGE',
  EXPONENTIAL_SMOOTHING = 'EXPONENTIAL_SMOOTHING',
  ARIMA = 'ARIMA',
  LINEAR_REGRESSION = 'LINEAR_REGRESSION',
  LSTM = 'LSTM',
}

export enum MetricType {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MAX = 'max',
  MIN = 'min',
}

export enum CyclesType {
  DAILY = 'daily',
  WEEKLY = 'week',
  MONTHLY = 'month',
  QUARTERLY = 'quearter',
  YEARLY = 'year',
}
