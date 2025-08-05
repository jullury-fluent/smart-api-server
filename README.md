# @smart-api/server

Server-side library for the Smart Endpoint framework. Provides NestJS modules and services for auto-generating API endpoints based on your data models with Sequelize ORM integration.

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

## Installation

```bash
npm install @smart-api/server
# or
yarn add @smart-api/server
# or
pnpm add @smart-api/server
```

## Usage

### Using AbstractRepository

The server package provides an `AbstractRepository` class that you can extend to create repositories with built-in support for dynamic queries, analytics, and more:

```typescript
import { AbstractRepository } from '@smart-api/server';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { userSchema } from './schemas/user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<UserModel, typeof userSchema> {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {
    super(userModel, userSchema);
  }
}
```

### Using Repository Methods

Once you've created your repository, you can use its methods in your services or controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { QueryOptionsDto } from '@smart-api/common';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(queryOptions: QueryOptionsDto) {
    return this.userRepository.findAllWithQueryBuilder({}, queryOptions);
  }
  
  async getAnalytics(options: TimeSeriesAnalyticsDto) {
    return this.userRepository.getTimeSeries({}, options);
  }
  
  async getDistribution(options: DistributionAnalyticsDto) {
    return this.userRepository.getDistribution({}, options);
  }
  
  async getAggregation(options: AggregationAnalyticsDto) {
    return this.userRepository.getAggregation({}, options);
  }
}
```

## Docker Support

The server package includes Docker support for easy development and deployment. See the example applications for Docker configuration details.

## Testing

```bash
pnpm test
```

## License

UNLICENSED
