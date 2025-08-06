# @jullury-fluent/smart-api-server

Server-side library for the Smart API framework. Provides NestJS modules and services for auto-generating API endpoints based on your data models with Sequelize ORM integration.

## Features

- **Smart Endpoints**: Auto-generated API endpoints based on your data models
  - List views with dynamic filtering and nested property support
  - Aggregate views for data summarization
  - Time series analysis for temporal data
  - Distribution analytics for statistical insights
  - Forecasting capabilities

- **Integration with Sequelize**: Seamless integration with Sequelize ORM
  - Automatic model discovery and relationship handling
  - Support for complex nested queries with circular references
  - Transaction support for data integrity
  - Proper handling of various relationship types (1:1, 1:Many, Many:Many)

- **Advanced Query Features**:
  - Nested search functionality across related entities
  - Case-insensitive string filtering with Sequelize operators
  - Selective searchable field detection
  - Safe handling of circular schema references
  - Dot notation for accessing nested properties

- **Zod Schema Integration**:
  - Request validation with Zod schemas
  - Response serialization based on schemas
  - Automatic OpenAPI documentation generation
  - Type-safe API development

## Installation

```bash
npm install @jullury-fluent/smart-api-server
# or
yarn add @jullury-fluent/smart-api-server
# or
pnpm add @jullury-fluent/smart-api-server
```

## Usage

### Using AbstractRepository

The server package provides an `AbstractRepository` class that you can extend to create repositories with built-in support for dynamic queries, analytics, and more:

```typescript
import { AbstractRepository } from '@jullury-fluent/smart-api-server';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { userSchema } from './schemas/user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<UserModel, typeof userSchema> {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel
  ) {
    super(userModel, userSchema);
  }
}
```

### Creating Controllers with Smart API

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@jullury-fluent/smart-api-server';
import { GetUsersQuerySchema } from './schemas/user.schema';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query(new ZodValidationPipe(GetUsersQuerySchema)) query) {
    return this.userService.findAll(query);
  }

  @Get('analytics/time-series')
  async getTimeSeries(@Query(new ZodValidationPipe(TimeSeriesSchema)) query) {
    return this.userService.getTimeSeries(query);
  }

  @Get('analytics/distribution')
  async getDistribution(@Query(new ZodValidationPipe(DistributionSchema)) query) {
    return this.userService.getDistribution(query);
  }

  @Get('analytics/aggregation')
  async getAggregation(@Query(new ZodValidationPipe(AggregationSchema)) query) {
    return this.userService.getAggregation(query);
  }
}
```

### Using Repository Methods

Once you've created your repository, you can use its methods in your services:

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  QueryOptionsDto,
  TimeSeriesAnalyticsDto,
  DistributionAnalyticsDto,
  AggregationAnalyticsDto,
} from '@jullury-fluent/smart-api-common';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(queryOptions: QueryOptionsDto) {
    return this.userRepository.findAllWithQueryBuilder({}, queryOptions);
  }

  async getTimeSeries(options: TimeSeriesAnalyticsDto) {
    return this.userRepository.getTimeSeries({}, options);
  }

  async getDistribution(options: DistributionAnalyticsDto) {
    return this.userRepository.getDistribution({}, options);
  }

  async getAggregation(options: AggregationAnalyticsDto) {
    return this.userRepository.getAggregation({}, options);
  }

  async getForecast(options: ForecastAnalyticsDto) {
    return this.userRepository.getForecast({}, options);
  }
}
```

## Key Components

### AbstractRepository

The core of the Smart API server package is the `AbstractRepository` class, which provides:

- Dynamic query building with Sequelize
- Support for complex filtering and searching
- Analytics capabilities (time series, distribution, aggregation, forecast)
- Transaction support
- Relationship handling

### ZodValidationPipe

A NestJS pipe for validating request data using Zod schemas:

- Type-safe validation
- Automatic error handling
- Integration with NestJS request pipeline

## License

UNLICENSED
