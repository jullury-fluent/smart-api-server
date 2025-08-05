import { InjectModel } from '@nestjs/sequelize';
import { ModelStatic } from 'sequelize';
import { FindOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { MakeNullishOptional } from 'sequelize/types/utils';

import { ZodObject } from 'zod';
import { PageMetaDto, QueryOptionsDto, ResponseDto } from 'src/list-view';
import {
  buildAggregate,
  buildDistribution,
  buildDynamicQuery,
  buildTimeSeries,
  fillMissingDates,
  ForecastMethodType,
  getForecastData,
  TimeSeriesEntry,
} from 'src/helpers';
import {
  AggregationAnalyticsDto,
  DistributionAnalyticsDto,
  ForecastAnalyticsDto,
  TimeSeriesAnalyticsDto,
} from 'src/dtos';

@Injectable()
export class AbstractRepository<T extends Model, S extends ZodObject<any>> {
  constructor(
    @InjectModel(Model) private readonly model: ModelStatic<T>,
    private readonly schema: S
  ) {}

  async findAllWithQueryBuilder(
    serverOptions: FindOptions<T>,
    clientOptions: QueryOptionsDto
  ): Promise<ResponseDto<T>> {
    const query = buildDynamicQuery<T>(this.schema, serverOptions, clientOptions);

    const result = await this.model.findAndCountAll(query);

    const meta = new PageMetaDto({
      queryOptiosDto: clientOptions,
      itemCount: result.count,
    });

    return {
      result: result,
      meta,
    };
  }

  async getAggregation(
    serverOptions: FindOptions<T>,
    clientOptions: AggregationAnalyticsDto
  ): Promise<T | null> {
    const aggregationOptions = await buildAggregate<T>(
      serverOptions,
      clientOptions,
      this.model,
      this.schema
    );

    const data = await this.model.findOne(aggregationOptions);
    return data;
  }

  async getDistribution(
    serverOptions: FindOptions<T>,
    clientOptions: DistributionAnalyticsDto
  ): Promise<Record<string, number | string>[]> {
    try {
      const distributionOptions = await buildDistribution<T>(
        serverOptions,
        clientOptions,
        this.model,
        this.schema
      );

      const distributionData = await this.model.findAll(distributionOptions);

      const result = distributionData.map(item => {
        const plainEntry = item.get({ plain: true });

        delete plainEntry[`${clientOptions.metric_field}`];

        return {
          ...plainEntry,
          [`${clientOptions.metric}__${clientOptions.metric_field}`]: Number(
            plainEntry[`${clientOptions.metric}__${clientOptions.metric_field}`]
          ),
        };
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get distribution: ${error.message}`);
    }
  }

  async getTimeSeries(
    serverOptions: FindOptions<T>,
    clientOptions: TimeSeriesAnalyticsDto
  ): Promise<TimeSeriesEntry[]> {
    try {
      const timeSeriesOptions = await buildTimeSeries<T>(serverOptions, clientOptions, this.schema);
      const timeSeriesData = await this.model.findAll(timeSeriesOptions);

      console.log('Time Series Data:', timeSeriesData);

      const resultTimeSeries = fillMissingDates(
        timeSeriesData,
        clientOptions.start_date as string,
        clientOptions.end_date as string,
        clientOptions.granularity as 'hour' | 'day' | 'week' | 'month'
      );

      return resultTimeSeries;
    } catch (error) {
      throw new Error(`Failed to get time series: ${error.message}`);
    }
  }

  async getForecast(actualData: TimeSeriesEntry[], options: ForecastAnalyticsDto) {
    const forecastData = getForecastData(
      options.method as ForecastMethodType,
      actualData,
      Number(options.forecast_period),
      options.cycles as string
    );

    return { data: { actual: actualData, forecast: forecastData } };
  }

  async create(data: MakeNullishOptional<Omit<T['_creationAttributes'], 'id'>>): Promise<T> {
    try {
      const createdRecord = await this.model.create(data as any);
      return createdRecord;
    } catch (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }
  }

  async bulkCreate(
    data: MakeNullishOptional<Omit<T['_creationAttributes'], 'id'>>[]
  ): Promise<T[]> {
    try {
      const createdRecords = await this.model.bulkCreate(data as any);
      return createdRecords;
    } catch (error) {
      throw new Error(`Failed to create records: ${error.message}`);
    }
  }
}
